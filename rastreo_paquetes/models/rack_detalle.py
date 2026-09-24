from odoo import models, fields, api

class rastreo_rack_detalle(models.Model):
    _name = 'rastreo.rack'
    _description = 'Clase para guardar los detalles de cada rack'
    
    
    clave = fields.char(
        string = 'Clave del rack' 
    )
    descripcion = fields.char(
        string = 'Descripcion del rack' 
    )
    precio_unitario = fields.Monetary(
        string = 'Precio Unitario' 
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