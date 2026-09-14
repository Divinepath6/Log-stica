from odoo import models, fields, api

class rastreo_paquetes(models.Model):
    _name = 'rastreo.pedido_actualizacion'
    _description = 'Clase para guardar las actualizaciones de los pedidos'
    numero_actualizacion = fields.Char(
        string='Número de la actualizacion'
    )
    fecha_actualizacion = fields.Datetime(
        string='Fecha'
    )    
    actualizacion_texto = fields.Char(
        string='Texto de que se actualizo'
    )
    
    # Llave foránea al modelo pedido
    pedido_id = fields.Many2one(
        'rastreo.pedido',
        string='Pedido',
        required=True,   
        ondelete='cascade',  
    )
    @api.model
    def crear_rastreo(self, id):

        return