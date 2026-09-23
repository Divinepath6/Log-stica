from odoo import models, fields, api
class rastreo_paquetes(models.Model):
    _name = 'rastreo.cliente'
    _description = 'Solo usado para listar los clientes de odoo -no llenar-'

    @api.model
    def listar_clientes(self, termino_busqueda=None):
        domain = []
        if termino_busqueda:
            domain = [
                ('name', 'ilike', termino_busqueda)
            ]
        return self.env['res.partner'].search_read(
        domain=domain,
        fields=['id', 'name', 'active', 'city'],
        limit=30
    )