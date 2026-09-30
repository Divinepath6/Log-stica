from odoo import models, fields

class rastreo_cotizacion_detalle(models.Model):
    _name = 'rastreo.cotizacion_detalle'
    _description = 'Clase para guardar el detalle de cada pedido'

    costo_rack = fields.Monetary(
        string='costo individual del rack',
        currency_field='currency_id'    
    )
    costo_rack = fields.Char(
        string='Nombre del rack', 
    )
    currency_id = fields.Many2one(
        'res.currency', 
        string='Moneda', 
        default=lambda self: self.env.company.currency_id
    )
    cantidad_racks = fields.Integer(
        string='Cantidad de racks acordados', 
    )
        