from odoo import models, fields, api
from odoo.exceptions import UserError
import base64

class rastreo_paquetes(models.Model):
    _name = 'rastreo.pedido'
    _description = 'Clase principal del modulo'
    #_inherit = ['mail.thread', 'mail.activity.mixin']
    numero_guia = fields.Char(string='Número de guía o cotización')

    estado = fields.Selection([
        ('fase_inicial', 'Fase inicial'),
        ('produccion', 'En Producción'),
        ('puerto_origen', 'En el puerto de origen'),
        ('Embarcado', 'Embarcado'),
        ('Descargado', 'Descargado'),
        ('Aduana', 'En Aduana'),
        ('sin_pendiente', 'Sin Pendientes'),
    ], string = 'Estado', default='fase_inicial')

    # FORWARDER ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡
    forwarder = fields.Boolean(
        string="Forwarder conseguido", 
        default=False
    )
    pdf_BL = fields.Binary(
            string='Documento BL',
            attachment=True
        )
    pdf_PL = fields.Binary(
            string='Documento PL',
            attachment=True
        )
    pdf_invoice = fields.Binary(
            string='Documento invoice',
            attachment=True
        )

  
    currency_id = fields.Many2one(
        'res.currency', 
        string='Moneda', 
        default=lambda self: self.env.company.currency_id
    )

    ## Proveedor ----------------------------------------------------------------------------
    pdf_contrato_proveedor = fields.Binary(
        string='Contrato con el proveedor',
        attachment=True
    )
    numero_contrato = fields.Char(
        string='Número de Guia'
    )
    pdf_factura_proveedor = fields.Binary(
        string='Factura del proveedor',
        attachment=True
    )
    total_proveedor = fields.Monetary(
        string= 'Total acordado con el proveedor',
        currency_field='currency_id' 
    )

    ## Cliente ///////////////////////////////////////////////////////////////////////////////
    total_cliente = fields.Monetary(
        string= 'Total acordado con el cliente',
        currency_field='currency_id' 
    )
    racks_acordados = fields.Integer(
        string = 'Total de rack acordados con el cliente'
    )
    anticipo_ids = fields.One2many(
        'rastreo.anticipo_detalle', 
        'pedido_id', 
        string='Anticipos Recibidos'
    )


    ##LLave foranea para lo de clientes %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    cliente_id = fields.Many2one(
        'res.partner',  
        string='Cliente',  
        required=True,  
    )


    ##LLave foraneassssss **************************************************
    actualizacion_ids = fields.One2many(
        'rastreo.pedido_actualizacion', 
        'pedido_id',                    
        string='Actualizaciones',
    )
    bodegas_ids = fields.One2many(
        'rastreo.bodega_cliente', 
        'pedido_id',                    
        string='Id de la bodega',
    )
    detalle_cliente_ids = fields.One2many(
        'rastreo.detalle_proveedor', 
        'pedido_id',                    
        string='Detalles de los anticipos recibidos del cliente',
    )
    detalle_proveedor_ids = fields.One2many(
        'rastreo.detalle_cliente', 
        'pedido_id',                    
        string='Detalles de los anticipos dados al proveedor',
    )


    # =============================================================================================================
    # MÉTODOS CRUD
    # =============================================================================================================
    @api.model
    def crear_pedido(self, cliente_id):#cliente_id
        if not cliente_id:
            raise UserError("El cliente es obligatorio")
        cliente = self.env['res.partner'].browse(cliente_id)
        if not cliente.exists():
            raise UserError("El cliente indicado no existe")
        
        pedido = self.create({
            'cliente_id': cliente_id,
            'estado': 'fase_inicial',
        })

        self.env['rastreo.pedido_actualizacion'].create({
            'pedido_id': pedido.id,
            'numero_actualizacion': 1,
            'fecha_actualizacion': fields.Datetime.now(),
            'actualizacion_texto': 'Fase inicial comenzada',
        })
        
        return {'id': pedido.id}

    

    @api.model
    def cambiar_estado(self, pedido_id, estado=None):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        siguiente_estado = estado
            ### rellenaaaaaaaaaaaaaaaaaaaaaaaaaaaar cuando v
        match pedido.estado:
            case "fase_inicial":
                siguiente_estado = 'produccion'
                
            case "produccion":
                if not pedido.pdf_contrato_proveedor:
                    return {'success': False, 'error': 'Falta el contrato del proveedor para continuar'}
                siguiente_estado = 'puerto_origen'
            case _:
                if not siguiente_estado:
                    return {'success': False, 'error': 'Estado no especificado'}

        pedido.write({'estado': siguiente_estado})
        return {
            'success': True, 
            'id': pedido.id, 
            'nuevo_estado': siguiente_estado
        }

    ## PDFSSSS //////////////////////////////////////////////////
    @api.model
    def subir_pdf(self, nombre, archivo, pedido_id):

        campos_permitidos = [
            'pdf_contrato_proveedor',
            'pdf_factura_proveedor',
            'pdf_anticipo_cliente',
            'pdf_BL',
            'pdf_PL',
            'pdf_invoice'
        ]

        if nombre not in campos_permitidos:
            return {
                'success': False,
                'error': 'Campo de PDF no permitido'
            }

        pedido = self.browse(pedido_id)

        if not pedido.exists():
            return {
                'success': False,
                'error': 'Pedido no encontrado'
            }

        pedido.write({
            nombre: archivo
        })

        field_obj = self._fields.get(nombre)
        nombre_amigable = field_obj.string if field_obj else nombre
        cantidad = self.env['rastreo.pedido_actualizacion'].search_count([
            ('pedido_id', '=', pedido_id)
        ])
        numero = cantidad + 1
        self.env['rastreo.pedido_actualizacion'].create({
                'pedido_id': pedido.id,
                'numero_actualizacion': numero,
                'fecha_actualizacion': fields.Datetime.now(),
                'actualizacion_texto': f'Archivo subido: {nombre_amigable} - {self.env.user.name}'
            })
        return {
            'success': True
        }




    @api.model
    def actualizar_pedido(self, pedido_id, nuevos_valores):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        pedido.write(nuevos_valores)
        return {'success': True, 'id': pedido.id}

    @api.model
    def eliminar_pedido(self, pedido_id):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        pedido.unlink()
        return {'success': True}


    @api.model
    def obtener_pedido(self, pedido_id):
        pedido = self.browse(pedido_id)

        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}

        actualizaciones = self.env['rastreo.pedido_actualizacion'].search(
            [('pedido_id', '=', pedido_id)],
            order='fecha_actualizacion desc',
        )
        lista_actualizaciones = []

        for actualizacion in actualizaciones:
            lista_actualizaciones.append({
                'id': actualizacion.id,
                'numero_actualizacion': actualizacion.numero_actualizacion,
                'fecha': actualizacion.fecha_actualizacion,
                'texto': actualizacion.actualizacion_texto or '',
            })

        return {
            'success': True,
            'data': {
                'id': pedido.id,
                'numero_guia': pedido.numero_guia or '',
                'cliente_id': pedido.cliente_id.id if pedido.cliente_id else None,
                'cliente_nombre': pedido.cliente_id.name if pedido.cliente_id else '',
                'total_cliente': pedido.total_cliente or 0,
                'total_proveedor': pedido.total_proveedor or 0,
                'numero_contrato': pedido.numero_contrato or 0,
                'forwarder': pedido.forwarder,
                # booleanos
                'bool_contrato_proveedor': bool(pedido.pdf_contrato_proveedor),
                'bool_factura_proveedor': bool(pedido.pdf_factura_proveedor),
                
                'numero_contrato': pedido.numero_contrato or '',
                'actualizaciones': lista_actualizaciones,
            }
        }

    @api.model
    def listar_pedidos(self, termino_busqueda=None):
        domain = []
        if termino_busqueda:
            domain = [
                '|',
                ('numero_guia', 'ilike', termino_busqueda),
                ('cliente_id.name', 'ilike', termino_busqueda),
            ]

        pedidos = self.search(domain, limit=50)

        pedido_ids = pedidos.ids
        ultimas_por_pedido = {}
        if pedido_ids:
            actualizaciones = self.env['rastreo.pedido_actualizacion'].search_read(
                [('pedido_id', 'in', pedido_ids)],
                ['pedido_id', 'fecha_actualizacion', 'actualizacion_texto'],
                order='fecha_actualizacion desc',
            )
            for a in actualizaciones:
                pid = a['pedido_id'][0]
                if pid not in ultimas_por_pedido:
                    ultimas_por_pedido[pid] = a

        lista = []
        for p in pedidos:
            ultima = ultimas_por_pedido.get(p.id)
            lista.append({
                'id': p.id,
                'cliente_nombre': p.cliente_id.name if p.cliente_id else '',
                'estado': p.estado,
                'numero_guia': p.numero_guia or '',
                'bool_contrato_proveedor': bool(p.pdf_contrato_proveedor),
                'ultima_actualizacion': {
                    'fecha': ultima['fecha_actualizacion'] if ultima else '',
                    'texto': ultima['actualizacion_texto'] if ultima else '',
                },
            })
        return lista    


# =============================================================================================================
# MÉTODOS CRUD detalles
# =============================================================================================================
    @api.model
    def guardar_detalle_cliente(self, pedido_id,numero,datos):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        return {'success': True, 'id': pedido.id}

    @api.model
    def eliminar_detalle_cliente(self, pedido_id):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        pedido.unlink()
        return {'success': True}
    
    @api.model
    def guardar_detalle_proveedor(self, pedido_id,numero,datos):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        return {'success': True, 'id': pedido.id}

    @api.model
    def eliminar_detalle_proveedor(self, pedido_id):
        pedido = self.browse(pedido_id)
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        
        pedido.unlink()
        return {'success': True}    