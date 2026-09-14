{
    'name': "Logística",
    'summary': "Modulo para el seguimiento de paquetes",
    'description': """
    Modulo para el seguimiento de paquetes en el cual el usuario podra editar,
    visualizar y recibir notificaciones de paquetes
    """,
    'author': "Jesus Cervantes",
    'website': "https://www.yourcompany.com",
    'license': 'LGPL-3',
    'category': 'Logística',
    'version': '0.1',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'static/src/xml/rastreo_pedido_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'rastreo_paquetes/static/src/css/pantalla_principal.css',
            'rastreo_paquetes/static/src/xml/pantalla_principal.xml',
            'rastreo_paquetes/static/src/js/pantalla_principal.js',
        ],
    },
    'installable': True,
    'application': True,
}