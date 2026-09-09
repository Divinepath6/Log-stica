{
    'name': "Logística",

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
    Modulo para el seguimiento de paquetes en el cual el usuario podra editar, visualizar y resibir notificaciones de paquetes
    """,

    'author': "Jesus Cervantes",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Logística',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}

