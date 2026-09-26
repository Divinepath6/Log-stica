from odoo import models, fields, api
from odoo.exceptions import UserError
import base64
import json
class rastreo_bodega_cliente(models.Model):
    _name = 'rastreo.bodega_cliente'
    _description = 'Clase para guardar la relacion entre bodegas'
    
    pedido_id = fields.Many2one(
        'rastreo.pedido',
        string='Pedido',
        required=True,   
        ondelete='cascade',  
    )

    bodegas_ids = fields.One2many(
        'rastreo.bodega',
        'bodega_cliente_id',   
        string='Bodegas',
    )
    ubicacion = fields.Char(  
        string='Ubicación de la bodega',
    )

    @api.model
    def guardar_bodega(self, pedido_id, ubicacion, bodegas):
        if not pedido_id:
            raise UserError("Bodega: Debes indicar un pedido")

        if not bodegas:
            raise UserError("Bodega: Debes enviar al menos una bodega")

        pedido = self.env['rastreo.pedido'].browse(pedido_id)
        if not pedido.exists():
            raise UserError("El pedido indicado no existe.")
        bodega_cliente = self.search([('pedido_id', '=', pedido_id)], limit=1)

        with self.env.cr.savepoint():
            if bodega_cliente:
                bodega_cliente.write({
                    'ubicacion': ubicacion or ''
                })
                bodega_cliente.bodegas_ids.unlink()
            else:
                bodega_cliente = self.create({
                    'ubicacion': ubicacion or '',
                    'pedido_id': pedido.id,
                })

            Bodega = self.env['rastreo.bodega']
            for b in bodegas:
                Bodega.create({
                    'bodega_cliente_id': bodega_cliente.id,
                    'descripcion': b.get('descripcion') or '',
                    'numero_bodega': b.get('numero_bodega') or '',
                    'ancho': float(b.get('ancho') or 0.0),
                    'largo': float(b.get('largo') or 0.0),
                    'niveles': int(b.get('niveles') or 0),
                    'costoRack': float(b.get('costoRack') or 0.0),
                    'rack_id': int(b.get('rack_id') or 0),
                })

        return {
            'id':                pedido.id,
            'numero_guia':       pedido.numero_guia,
            'bodega_cliente_id': bodega_cliente.id,
        }



    @api.model
    def obtener_bodega(self, pedido_id):
        if not pedido_id:
            raise UserError("Bodega: Debes indicar un pedido")
        pedido = self.env['rastreo.pedido'].browse(pedido_id)
        if not pedido.exists():
            raise UserError("Bodega: El pedido indicado no existe.")
            
        bodega = self.search([('pedido_id', '=', pedido_id)], limit=1)

        if not bodega.exists():
            return{
                'success':False
            }                    
        bodegas = self.env['rastreo.bodega'].search(
            [('bodega_cliente_id', '=', bodega.id)],
            order='numero_bodega',
        )
        bodegas_lista = []
        for b in bodegas:
            bodegas_lista.append({
                'bodega_cliente_id': bodega.id,
                'descripcion': b.descripcion or '',
                'numero_bodega': b.numero_bodega or '',
                'ancho': float(b.ancho or 0.0),
                'largo': float(b.largo or 0.0),
                'niveles': int(b.niveles or 0),
                'costoRack': float(b.costoRack or 0.0),
                'rack_id': b.rack_id.id if hasattr(b.rack_id, 'id') else int(b.rack_id or 0),
            })
        return {
                'success': True,
                'data': {
                    'id': bodega.id,
                    'ubicacion': bodega.ubicacion or '',
                    'bodegas': bodegas_lista
                }
        }
    
  
    @api.model
    def generar_pdf_croquis(self, datos):
     
        company = self.env.company
        if company.logo:
            logo_b64 = company.logo.decode('utf-8') if isinstance(company.logo, bytes) else company.logo
        else:
            logo_b64 = ''
        datos['logo_b64'] = logo_b64
        datos['base_url'] = self.env['ir.config_parameter'].sudo().get_param('web.base.url') or 'http://localhost:8069'

        pdf_content, _ = self.env['ir.actions.report']._render_qweb_pdf(
            'rastreo_paquetes.report_croquis_bodega_doc',
            res_ids=[],
            data={'datos': datos},
        )
        return {
            'filename': 'croquis_bodega_%s.pdf' % (datos.get('clienteNombre') or 'cliente'),
            'file_content': base64.b64encode(pdf_content).decode('utf-8'),
            'mimetype': 'application/pdf',
        }