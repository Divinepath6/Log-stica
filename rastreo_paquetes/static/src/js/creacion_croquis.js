/** @odoo-module **/
import { Component } from "@odoo/owl";
import { calcularLayoutCroquis } from "./funcion_calcular_layout";

export class CreacionCroquis extends Component {
    static components = { CreacionCroquis , calcularLayoutCroquis };
     setup() {
    }

    get layout() {
        return this.calcularLayout();
    }

    calcularLayout() {
        return calcularLayoutCroquis(this.props)
    }
}

CreacionCroquis.template = "rastreo_paquetes.creacion_croquis_embed";
CreacionCroquis.props = {
    pedidoId:     { type: [Number, Boolean], optional: true },
    anchoBodega:  { type: [Number, String], optional: true },
    largoBodega:  { type: [Number, String], optional: true },
    alturaBodega: { type: [Number, String], optional: true },
    separacion:   { type: [Number, String], optional: true },
    anchoRack:    { type: [Number, String], optional: true },
    largoRack:    { type: [Number, String], optional: true },
    porAncho:     { type: [Number, String], optional: true },
    porLargo:     { type: [Number, String], optional: true },
    totalRacks:   { type: [Number, String], optional: true },
    pasillosX:    { type: [Number, String], optional: true },
    pasillosY:    { type: [Number, String], optional: true },
    anchoPasillo: { type: [Number, String], optional: true },
};