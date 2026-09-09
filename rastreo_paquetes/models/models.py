# from odoo import models, fields, api


# class rastreo_paquetes(models.Model):
#     _name = 'rastreo_paquetes.rastreo_paquetes'
#     _description = 'rastreo_paquetes.rastreo_paquetes'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100

