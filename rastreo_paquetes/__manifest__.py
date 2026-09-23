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
    'depends': ['base', 'web', 'crm'],
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/pantalla_pedido.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'rastreo_paquetes/static/src/css/pantalla_principal.css',
            'rastreo_paquetes/static/src/xml/pantalla_principal.xml',
            'rastreo_paquetes/static/src/js/pantalla_principal.js',


            'rastreo_paquetes/static/src/js/pantalla_pedido.js',
            'rastreo_paquetes/static/src/xml/pantalla_pedido.xml',
            'rastreo_paquetes/static/src/css/pantalla_pedido.css',


            'rastreo_paquetes/static/src/xml/pantalla_croquis.xml',
            'rastreo_paquetes/static/src/js/pantalla_croquis.js',
            'rastreo_paquetes/static/src/css/pantalla_croquis.css',

            'rastreo_paquetes/static/src/css/creacion_croquis.css',
            'rastreo_paquetes/static/src/js/creacion_croquis.js',
            'rastreo_paquetes/static/src/xml/creacion_croquis.xml',

            'rastreo_paquetes/static/src/js/componente_creacion_pedido.js',
            'rastreo_paquetes/static/src/css/componente_creacion_pedido.css',
            'rastreo_paquetes/static/src/xml/componente_creacion_pedido.xml',
        ],
    },
    'installable': True,
    'application': True,
}