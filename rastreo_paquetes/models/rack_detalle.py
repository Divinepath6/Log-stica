from odoo import models, fields, api
from odoo.exceptions import UserError

class rastreo_rack_detalle(models.Model):
    _name = 'rastreo.rack'
    _description = 'Clase para guardar los detalles de cada rack'
    
    
    clave = fields.char(
        string = 'Clave del rack' 
    )
    nombre = fields.char(
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
    def crear_rack(self, datos):
        if not datos:
            raise UserError("No existe los datos")
        rack = self.create({
            'clave':            datos.clave,
            'nombre':           datos.nombre,
            'precio_unitario':  datos.precio_unitario,
            'altura':           datos.altura,
            'ancho':            datos.ancho,
            'largo':            datos.largo,
        })

     
        return {'id': rack.id}

    
    @api.model
    def listar_racks(self):
        racks = self.search(limit=100)
        lista = []
        for r in racks:
            lista.append({
                'clave':            r.clave,
                'nombre':           r.nombre,
                'precio_unitario':  r.precio_unitario,
                })
        return {'data': lista , 'success': True,}
    
    @api.model
    def obtener_rack(self, rack_id):
        rack = self.browse(rack_id)
        if not pedido.exists():
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