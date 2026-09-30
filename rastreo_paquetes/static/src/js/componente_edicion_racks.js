/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks"; 

export class componente_edicion_racks extends Component{
    static template = "rastreo_paquetes.componente_edicion_racks_embed";
    static components = { Dialog };
    static props = {
        close: Function,
        title: { type: String, optional: true },
        confirm: { type: Function, optional: true },
        cancel: { type: Function, optional: true },
    };
    static components = { Dialog };
    
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            //state para el rack seleccionado:
            rackSeleccionadoId: 0,
            clave: "",
            nombre: "",
            precioUnitario: 0.0,
            altura: 0,
            ancho: 0,
            largo: 0,

            //lista
            racks: [],
            cargando: false,
        })
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                await this.listarRacks();
            }
            
        });
    }

    async guadarRack() {
        const datos = {
            clave: this.state.clave,
            nombre: this.state.nombre,
            precio_unitario: (this.state.precioUnitario).ToFixed(2),
            altura: this.state.altura,
            ancho: this.state.ancho,
            largo: this.state.largo,
        };
        const resultado = await this.orm.call(
            "rastreo.rack_detalle", 
            "crear_rack",
            [datos]
        );
        if(resultado.success){
            this.notification.add( `Guardado exitoso `, { type: "success" });

            this.state.clave = "";
            this.state.nombre = "";
            this.state.precioUnitario = 0;
            this.state.altura = 0;
            this.state.ancho = 0;
            this.state.largo = 0;
        }else{
            this.notification.add(
                "Hubo un error, intentelo mas tarde",
                { type: "warning" }
            );
        }
    }
    async cargarRack() {
        const resultado = await this.orm.call(
            "rastreo.rack_detalle", 
            "obtener_rack",
            [rackSeleccionadoId]
        );
        if(resultado.success){
            const r = resultado.data;

            this.state.clave = r.clave;
            this.state.nombre = r.nombre;
            this.state.precioUnitario = r.precio_unitario.ToFixed(2);
            this.state.altura = r.altura;
            this.state.ancho = r.ancho;
            this.state.largo = r.largo;
            
        }else{
            this.notification.add(
                "Hubo un error, intentelo mas tarde",
                { type: "warning" }
            );
        }
    }
    async listarRacks() {
        this.state.cargando = true;
        try{
            const resultado = await this.orm.call(
                "rastreo.rack_detalle", 
                "listar_racks",
            );
            if(resultado.success){
                this.state.racks = resultado.lista
            }else{
                this.notification.add(
                    "Hubo un error",
                    { type: "warning" }
                );
                this.props.close();
            }
        }finally{
            this.state.cargando = false;
        }
        
    }
    async onSeleccionarRack(){
        await cargarRack();
    }
    async onBuscar(){
        await this.listarRacks()
    }
    async onGuardar(){
        await this.guadarRack()
    }
    _onConfirm() {
        this.props.close();
    }


}