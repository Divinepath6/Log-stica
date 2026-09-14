from odoo import models, fields, api
from odoo.exceptions import UserError
class rastreo_paquetes(models.Model):
    _name = 'rastreo.pedido'
    _description = 'Clase principal del modulo'
    #_inherit = ['mail.thread', 'mail.activity.mixin']
    numero_guia = fields.Char(string='Número de guía')

    estado = fields.Selection([
        ('fase_inicial', 'Fase inicial'),
        ('produccion', 'En Producción'),
        ('forwarder', 'Sin forwarder'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('sin_pendiente', 'Sin Pendientes'),
    ], string = 'Estado', default='fase_inicial')
    pdf_BL = fields.Binary(
            string='Documento PDF',
            attachment=True
        )
    pdf_PL = fields.Binary(
            string='Documento PDF',
            attachment=True
        )
    pdf_invoice = fields.Binary(
            string='Documento PDF',
            attachment=True
        )

    origen = fields.Char(
        string='Origen'
    )
    destino = fields.Char(
        string='Destino'
    )
    anticipo_dado = fields.Float(
        string='Anticipo dado a proveedor'
    )
    anticipo_recibido = fields.Float(
        string='Anticipo recibido de cliente'
    )

         
    ## Proveedor ----------------------------------------------------------------------------
    pdf_contrato_proveedor = fields.Binary(
        string='Documento PDF',
        attachment=True
    )
    numero_contrato = fields.Char(
        string='Número de Guia'
    )
    pdf_factura_proveedor = fields.Binary(
        string='Documento PDF',
        attachment=True
    )
    
    

    ## Cliente ///////////////////////////////////////////////////////////////////////////////
    total_cliente = fields.Char(
        string= 'Total acordado con el cliente'
    )
    pdf_anticipo_cliente = fields.Binary(
        string='Documento PDF',
        attachment=True
    )


    ##LLave foranea para lo de clientes %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    ##cliente_id = fields.Many2one(
    ##    'CRM.cliente'
    ##    'rastreo.cliente',
    ##    string='Cliente'
    ##)



    ##LLave foranea para lo de las actualizaciones **************************************************
    actualizacion_ids = fields.One2many(
        'rastreo.pedido_actualizacion', 
        'pedido_id',                    
        string='Actualizaciones',
    )

    # =============================================================================================================
    # MÉTODOS CRUD
    # =============================================================================================================
    @api.model
    def crear_pedido(self, numero_guia):#cliente_id
        if not numero_guia:
            raise UserError("El número de guía es obligatorio")
        pedido = self.create({
            'numero_guia': numero_guia,
            'estado': 'fase_inicial',
        })
        
        return {'id': pedido.id, 'numero_guia': pedido.numero_guia}

    

    @api.model
    def cambiar_estado(self, pedido_id, estado):
        pedido = self.browse(pedido_id)

        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        pedido.write({'estado': estado})       
        return {'success': True, 'id': pedido.id}
 
    
    @api.model
    def subir_pdf(self,  nombre, archivo, pedido_id):
        pedido = self.browse(pedido_id)
    
        if not pedido.exists():
            return {'success': False, 'error': 'Pedido no encontrado'}
        pedido.write({nombre: archivo})       
        return {'success': True}
    
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
        
        return {
            'success': True,
            'data': {
                'id': pedido.id,
                'numero_guia': pedido.numero_guia or '',
                'origen': pedido.origen or '',
                'destino': pedido.destino or '',
                'cliente_id': pedido.cliente_id.id if pedido.cliente_id else None,
                'cliente_nombre': pedido.cliente_id.nombre if pedido.cliente_id else '',
                
                # booleanos
                'bool_contrato_proveedor': bool(pedido.pdf_contrato_proveedor),
                'bool_factura_proveedor': bool(pedido.pdf_factura_proveedor),
                
                'numero_contrato': pedido.numero_contrato or '',
            }
        }

    @api.model
    def listar_pedidos(self, filtro_cliente=None):
        domain = [('cliente_id', '=', filtro_cliente)] if filtro_cliente else []
        pedidos = self.search(domain, limit=50)
        lista = []
        for p in pedidos:
            lista.append({
                'id': p.id,
                'estado': p.estado,
                'numero_guia': p.numero_guia or '',
                'bool_contrato_proveedor': bool(p.pdf_contrato_proveedor),
            })
        return lista
