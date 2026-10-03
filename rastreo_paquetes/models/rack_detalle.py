from odoo import models, fields, api
from odoo.exceptions import UserError

class rastreo_rack_detalle(models.Model):
    _name = 'rastreo.rack_detalle'
    _description = 'Clase para guardar los detalles de cada rack'
    
    
    clave = fields.Char(
        string = 'Clave del rack' 
    )
    nombre = fields.Char(
        string = 'Nombre del rack' 
    )
    precio_unitario = fields.Monetary(
        string = 'Precio Unitario', 
        currency_field='currency_id'    
    )
    currency_id = fields.Many2one(
        'res.currency', 
        string='Moneda', 
        default=lambda self: self.env.company.currency_id
    )
    altura = fields.Integer(
        string = 'Altura del rack en milimetros'
    )
    ancho = fields.Integer(
        string = 'Ancho del rack en milimetros'
    )
    largo = fields.Integer(
        string = 'Largo del rack en milimetros'
    )






    @api.model
    def guardar_rack(self, datos):
        if not datos or not isinstance(datos, dict):
            raise UserError("No se recibieron datos válidos")
        usd_currency = self.env['res.currency'].search([('name', '=', 'USD')], limit=1)
        currency_id = usd_currency.id if usd_currency else False
        vals = {
            'clave': datos.get('clave', ''),
            'nombre': datos.get('nombre', ''),
            'precio_unitario': float(datos.get('precio_unitario', 0.0)),
            'currency_id': currency_id,
            'altura': float(datos.get('altura', 0)),
            'ancho': float(datos.get('ancho', 0)),
            'largo': float(datos.get('largo', 0)),
        }
        rack_id = datos.get('id')
        if rack_id:
            rack = self.browse(rack_id)
            if rack.exists():
                rack.write(vals)
            else:
                raise UserError("El rack a editar no existe.")
        else:
            rack = self.create(vals)
        return {
            'success': True, 
            'id': rack.id
        }

    
    @api.model
    def obtener_rack(self, rack_id):
        rack = self.browse(rack_id)
        if not rack.exists():
            return {'success': False, 'error': 'Rack no encontrado'}

        return{
            'success': True, 
            'data':{
                'clave':            rack.clave,
                'nombre':           rack.nombre,
                'precio_unitario':  rack.precio_unitario,
                'altura':           rack.altura,
                'ancho':            rack.ancho,
                'largo':            rack.largo,
            }
        }
    
    @api.model
    def listar_racks(self):
        domain = []
        racks = self.search(domain, limit=100)
        lista = []
        for r in racks:
            lista.append({
                'id':               r.id,
                'clave':            r.clave,
                'nombre':           r.nombre,
                'precio_unitario':  r.precio_unitario,
                'medidas': [r.ancho, r.largo, r.altura]
                })
        return {'data': lista , 'success': True,}   
    
    @api.model
    def listar_productos(self, termino_busqueda):
        if not termino_busqueda:
            return {'success': False, 'error': 'Sin termino de busqueda'}
        domain = [          
                    ('product.name', 'ilike', termino_busqueda),
                ]
        racks = self.env['stock.product'](domain, limit=100)

        lista = []
        for r in racks:
            lista.append({
                'id':               r.id,
                'nombre':            r.name
                })
        return {'data': lista , 'success': True,}      
             