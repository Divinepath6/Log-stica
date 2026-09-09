# from odoo import http


# class RastreoPaquetes(http.Controller):
#     @http.route('/rastreo_paquetes/rastreo_paquetes', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/rastreo_paquetes/rastreo_paquetes/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('rastreo_paquetes.listing', {
#             'root': '/rastreo_paquetes/rastreo_paquetes',
#             'objects': http.request.env['rastreo_paquetes.rastreo_paquetes'].search([]),
#         })

#     @http.route('/rastreo_paquetes/rastreo_paquetes/objects/<model("rastreo_paquetes.rastreo_paquetes"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('rastreo_paquetes.object', {
#             'object': obj
#         })

