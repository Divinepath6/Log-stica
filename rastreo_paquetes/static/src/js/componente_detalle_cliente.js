/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks"; 


export class componente_detalle_racks extends Component{
    static template = "rastreo_paquetes.componente_detalle_racks_embed";
    setup(){
        this.state = useState({
            fechaEdicion: "",
            fechaAnticipo: "",
            cantidadAnticipo: 0.0,
            precioDolar: 0.0,
            numeroAnticipo: 0,
            PDFAnticipo: null,
        })
    }
    async cargarAnticipo(){
        
    }
    async onGuardar(){

    }
    async onCancelarEdicion(){

    }
}
