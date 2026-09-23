from odoo import models, fields

class rastreo_anticipo_detalle(models.Model):
    _name = 'rastreo.anticipo_detalle'
    _description = 'Clase para guardar los anticipos de los clientes'

    pedido_id = fields.Many2one(
        'rastreo.pedido', 
        string='Pedido', 
        ondelete='cascade', 
        required=True
    )
    currency_id = fields.Many2one(
        'res.currency', 
        string='Moneda',
        default=lambda self: self.env.company.currency_id
    )
    fecha_editado = fields.Datetime(
        string='Fecha'
    ) 
    cantidad = fields.Monetary(
        string='Cantidad en '
    )   
    pdf_anticipo_cliente = fields.Binary(
        string='Documento PDF',
        attachment=True
    )
    