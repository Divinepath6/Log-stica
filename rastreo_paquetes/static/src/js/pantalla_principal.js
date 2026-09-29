/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, onWillStart, useState   } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks"; 
import { componente_creacion_pedido } from "./componente_creacion_pedido";

export class PantallaPrincipal extends Component { 
    
    static components = { componente_creacion_pedido };
    setup() {
        this.notification = useService("notification");
        this.action = useService("action");
        this.orm = useService("orm");
        this.dialogService = useService("dialog");
        this.state = useState({
            pedidos: [],
            cargando: false,
            columns: []
        });
        onWillStart(async () => {
            await this.cargarPedidos();
        });
        this.searchTimeout = null;
    }
    
    async onClickCrearPedido(ev) {
        this.dialogService.add(componente_creacion_pedido,  {
                title: "Confirmación",
                confirm: async (clienteId) => {
                    const resultado = await this.crearPedido(clienteId)
                    if(!resultado){
                    }
                    if(resultado != 0){
                        this.notification.add(
                        `Exitoso `,
                        { type: "success" }
                    );
                    }
                },
                cancel: () => {
                    console.log("Cancelado");
                }
        });
    }
       
    async onClickCargarPedidos(){
        await this.cargarPedidos();
    }

    async onClickEditarPedido(p) {
        if(p.estado === 'fase_inicial'){
            await this.action.doAction({
                type: "ir.actions.client",
                tag: "rastreo_paquetes.pantalla_croquis",
                params: { pedido_id: p.id , cliente_nombre : p.cliente_nombre },  
                target: "current",
            });
        }else{
            await this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "rastreo.pedido",
            views: [[false, "form"]],
            res_id: p.id,
            target: "current",
            });
        }
        
    }
    onBusqueda(ev){
        const valorBuscado = ev.target.value;
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.cargarPedidos(valorBuscado);
        }, 500);
    }


    async crearPedido(id) {
        const resultado = await this.orm.call(
            "rastreo.pedido", 
            "crear_pedido",
            [id]
        );
        await this.cargarPedidos();
        return resultado.id;
    }
    
    async cargarPedidos(filtro = null) {
        this.state.cargando = true;
        try {
            const pedidos = await this.orm.call(
                "rastreo.pedido",
                "listar_pedidos",
                [filtro]
            );
            this.state.pedidos = pedidos;
            this.asignarColumnas();
        } finally {
            this.state.cargando = false;
        }
    }

    asignarColumnas(){
        const estados = 
        [
            ["fase_inicial", "Fase Inicial"], 
            ["produccion", "En Producción"], 
            ["forwarder", "A punto de salir a mar"], 
            ["enviado", "En mar"],
            ["entregado", "Finalizado"]

        ];
        this.state.columns = estados.map(estado => ({
            name: estado[1],
            packages: this.state.pedidos.filter(p => p.estado === estado[0]),
        }));
    }
}

PantallaPrincipal.template = "rastreo_paquetes.pantalla_principal";
registry.category("actions").add("rastreo_paquetes.pantalla_principal", PantallaPrincipal);