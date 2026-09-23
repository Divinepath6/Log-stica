from odoo import models, fields, api

class rastreo_bodega(models.Model):
    _name = 'rastreo.bodega'
    _description = 'Clase para guardar una bodega de un cliente'
    
    bodega_cliente_id = fields.Many2one(
        'rastreo.bodega_cliente',
        string='Bodega del cliente',
        required=True,
        ondelete='cascade',
    )
    descripcion = fields.Char(
        string = 'Descripción de la bodega'
    )
    numero_bodega = fields.Char(
        string = 'Número de la bodega'
    )
    ancho = fields.Float(
        string='Ancho',
        digits=(10, 2)
    )
    largo = fields.Float(
        string='Largo', 
        digits=(10, 2)
    )
    niveles = fields.Char(
        string='Largo', 
        digits=(10, 2)
    )
    costoRack = fields.Monetary(
        string='Largo',
        currency_field='currency_id'    
    )
    currency_id = fields.Many2one(
        'res.currency', 
        string='Moneda', 
        default=lambda self: self.env.company.currency_id
    )
    
    rack_id = fields.Char(
        string='Largo', 
        digits=(10, 2)
    )