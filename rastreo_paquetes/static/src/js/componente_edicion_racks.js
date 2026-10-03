/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks"; 
import {componente_busqueda_producto} from "./componente_busqueda_producto"
export class componente_edicion_racks extends Component{
    static template = "rastreo_paquetes.componente_edicion_racks_embed";
    static components = { componente_busqueda_producto };
    static components = { Dialog };
    static props = {
        close: Function,
        title: { type: String, optional: true },
        confirm: { type: Function, optional: true },
        cancel: { type: Function, optional: true },
    }; 
    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");

        this.state = useState({
            //state para el rack seleccionado:
            rackSeleccionadoId: 0,
            clave: "",
            nombre: "",
            precioUnitario: 0.0,
            altura: 0,
            ancho: 0,
            largo: 0,

            //Estados
            editando: false,
            cargando: false,

            //lista
            racks: [],
            productos:[],
            terminoBusqueda: "",
            
        })
        onWillStart(async () => {
            await this.listarRacks();
        });
    }

    async onClickBuscarProducto(ev) {
        this.dialogService.add(componente_busqueda_producto,  {
                title: "Confirmación",
                confirm: async () => {
                    
                },
                cancel: () => {
                console.log("Cancelado");
            }
        });
    }
   


    async guadarRack() {
        const datos = {
            clave: this.state.clave,
            nombre: this.state.nombre,
            precio_unitario: Number(this.state.precioUnitario).toFixed(2),
            altura: this.state.altura,
            ancho: this.state.ancho,
            largo: this.state.largo,
        };
        const resultado = await this.orm.call(
            "rastreo.rack_detalle", 
            "guardar_rack",
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

    
    async cargarRack(id) {
        const resultado = await this.orm.call(
            "rastreo.rack_detalle", 
            "obtener_rack",
            [id]
        );
        if(resultado.success){
            const r = resultado.data;
            this.state.rackSeleccionadoId = id
            this.state.clave = r.clave;
            this.state.nombre = r.nombre;
            this.state.precioUnitario = r.precio_unitario.toFixed(2);
            this.state.altura = r.altura;
            this.state.ancho = r.ancho;
            this.state.largo = r.largo;
            this.state.editando = true;
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
                this.state.racks = resultado.data
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
    
    limpiarFormulario() {
        this.state.rackSeleccionadoId = 0;
        this.state.clave = "";
        this.state.nombre = "";
        this.state.precioUnitario = 0.0;
        this.state.altura = 0;
        this.state.ancho = 0;
        this.state.largo = 0;
    }

    onCrearNuevo() {
        this.limpiarFormulario();
        this.state.editando = true;
    }

    onCancelarEdicion() {
        this.limpiarFormulario();
        this.terminarEdicion();
    }

    async onSeleccionarRack(rack){
        console.log(rack)
        await this.cargarRack(rack.id);
    }
    async onBuscar(){
        await this.listarRacks()
    }
    async terminarEdicion(){
        this.state.editando = false;
        await this.listarRacks();
    }
    async onGuardar(){
        if (!this.state.ancho || !this.state.largo || !this.state.altura ) {
            this.notification.add("Hacen falta Datos", { type: "warning" });
            return;
        }
        if (!this.state.nombre) {
            this.notification.add("Hacen falta un nombre", { type: "warning" });
            return;
        }
        if (!this.state.precioUnitario) {
            this.notification.add("Hacen falta un Precio", { type: "warning" });
            return;
        }
        await this.guadarRack()
        this.terminarEdicion();
    }
    _onConfirm() {
        this.props.close();
    }


}