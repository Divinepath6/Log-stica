/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks"; 


export class componente_detalle_racks extends Component{
    static template = "rastreo_paquetes.componente_detalle_racks_embed";
    setup(){
        this.state = useState({
            rackClave: "",
            rackNombre: "",
            precioUnitario: 0.0,
            cantidadRacks: 0,
            costoTotal: 0.0,
        })
    }
    async cargarRack(){
        
    }
    async onGuardar(){

    }
    async onCancelarEdicion(){

    }
}
