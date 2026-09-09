
from odoo import models, fields, api


class rastreo_paquetes(models.Model):
    _name = 'rastreo.paquete'
    _description = 'Clase principal del modulo'

    numero_guia = fields.Char(string='Número de guía')

    estado = fields.Selection([
        ('fase_inicial', 'Fase inicial'),
        ('produccion', 'En Producción'),
        ('forwarder', 'Sin forwarder'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('sin_pendiente', 'Sin Pendientes'),
    ], string='Estado')

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


    
    fecha_creacion = fields.Datetime(
        string='Fecha de envío',
        default = fields.Datetime.now
    )     
    ##Guardar la ultima actualizacion hecha
    fecha_actualizacion = fields.Datetime(
        string='Fecha de envío'
    )     
    fecha_llegada = fields.Datetime(
        string='Fecha de envío'
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
    pdf_anticipo_cliente = fields.Binary(
        string='Documento PDF',
        attachment=True
    )


    ##LLave foranea para lo de clientes %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    cliente_id = fields.Many2one(
        'rastreo.cliente',
        string='Cliente'
    )


"""
PEDIDO:
contrato_proveedor
numero_contrato
pdf


anticipo_proveedor
numero_id
total


factura_proveedor
numero_id
pdf_factura


anticipo_cliente
numero
id_usuario
total


forwarder 

BL – Bill of Lading
PL – Packing List 
nvoice

"""