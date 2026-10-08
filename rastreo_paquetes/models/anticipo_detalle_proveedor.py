from odoo import models, fields

class rastreo_anticipo_detalle_proveedor(models.Model):
    _name = 'rastreo.detalle_proveedor'
    _description = 'Clase para guardar los anticipos de los proveedores'
    numero = fields.Integer(
        string='Numero de anticipo'
    )
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
        string='Cantidad en dolares '
    )
    precio_dolar = fields.Monetary(
        string='Precio de los dolares al momento'
    )

    pdf_anticipo_proveedor = fields.Binary(
        string='Documento PDF',
        attachment=True
    )
    