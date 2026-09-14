/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, onWillStart, useState  } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks"; 

export class PantallaPrincipal extends Component { 
    setup() {
        this.notification = useService("notification");
        this.action = useService("action");
        this.orm = useService("orm");
        this.state = useState({
            pedidos: [],
            cargando: false,
            columns: []
        });
        onWillStart(async () => {
            await this.cargarPedidos();
        });
    }
    
    async onClickCrearPedido(ev) {
       const id = await this.crearPedido();
       console.log("creado con id: ", id);
    }
    async onClickCargarPedidos(){
        await this.cargarPedidos();
    }

    async onClickEditarPedido(id) {
        await this.action.doAction({
        type: "ir.actions.act_window",
        res_model: "rastreo.pedido",
        views: [[false, "form"]],
        res_id: id,
        target: "current",
    });

    }

    async crearPedido() {
        const numeroGuia = "GUIA-001" ;
        const ids = await this.orm.create("rastreo.pedido", [{
            numero_guia: numeroGuia,
            estado: "fase_inicial",
        }]);

        return ids[0];
    }
    
    async cargarPedidos(filtroCliente = null) {
        this.state.cargando = true;
        try {
            const pedidos = await this.orm.call(
                "rastreo.pedido",
                "listar_pedidos",
                [filtroCliente]
            );
            this.state.pedidos = pedidos;
            this.asignarColumnas();
        } finally {
            this.state.cargando = false;
        }
    }

    asignarColumnas(){
        const estados = ["fase_inicial", "produccion", "forwarder", "enviado", "entregado"];
        this.state.columns = estados.map(estado => ({
            name: estado,
            packages: this.state.pedidos.filter(p => p.estado === estado),
        }));
    }
}

PantallaPrincipal.template = "rastreo_paquetes.pantalla_principal";
registry.category("actions").add("rastreo_paquetes.pantalla_principal", PantallaPrincipal);