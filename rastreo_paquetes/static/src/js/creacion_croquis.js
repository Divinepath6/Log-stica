/** @odoo-module **/
import { Component } from "@odoo/owl";
//import { calcularLayoutCroquis } from "./funcion_calcular_layout";

export class CreacionCroquis extends Component {
    static components = { CreacionCroquis };
     setup() {
    }

    get layout() {
        return this.calcularLayout();
    }

    calcularLayout() {
        const anchoBodega  = Number(this.props.anchoBodega) || 0;
        const largoBodega  = Number(this.props.largoBodega) || 0;
        const anchoRack    = Number(this.props.anchoRack)   || 0;
        const largoRack    = Number(this.props.largoRack)   || 0;
        const porAncho     = Number(this.props.porAncho)    || 0;
        const porLargo     = Number(this.props.porLargo)    || 0;
        const pasillosX    = parseInt(this.props.pasillosX) || 0;
        const pasillosY    = parseInt(this.props.pasillosY) || 0;
        const anchoPasillo = Number(this.props.anchoPasillo) || 0;
        
        if (!anchoBodega || !largoBodega || !porAncho || !porLargo) {
            return { valido: false, ancho: 0, largo: 0, racks: [], pasillos: [] };
        }
        const SEP_PARED = 0.30;   
        const SEP_RACK  = 0.15;   

        const anchoSVG = 800;
        const altoSVG  = 500;
        const padding  = 40;

        const bloquesX = pasillosX + 1;
        const bloquesY = pasillosY + 1;

        const racksPorBloqueX = Math.max(1, Math.floor(porAncho / bloquesX));
        const racksPorBloqueY = Math.max(1, Math.floor(porLargo / bloquesY));

        const anchoBloqueReal = racksPorBloqueX * anchoRack + (racksPorBloqueX - 1) * SEP_RACK;
        const largoBloqueReal = racksPorBloqueY * largoRack + (racksPorBloqueY - 1) * SEP_RACK;
        const totalUsadoX = bloquesX * anchoBloqueReal + pasillosX * anchoPasillo;
        const sepParedX = Math.max(SEP_PARED, (anchoBodega - totalUsadoX) / 2);

        const totalUsadoYSinPasillo = bloquesY * largoBloqueReal;
        const espacioDisponibleY = largoBodega - 2 * SEP_PARED;
        const espacioPasilloY = Math.max(0, espacioDisponibleY - totalUsadoYSinPasillo);
        const sepParedY = SEP_PARED;

        const areaW = anchoSVG - 2 * padding;
        const areaH = altoSVG  - 2 * padding;
        const escalaX = areaW / anchoBodega;
        const escalaY = areaH / largoBodega;
        const escala  = Math.min(escalaX, escalaY);

        const anchoDibujo = anchoBodega * escala;
        const largoDibujo = largoBodega * escala;
        const offsetX = padding + (areaW - anchoDibujo) / 2;
        const offsetY = padding + (areaH - largoDibujo) / 2;

        const racks = [];
        let cursorX = sepParedX;
        for (let bx = 0; bx < bloquesX; bx++) {
            let cursorY = sepParedY;
            for (let by = 0; by < bloquesY; by++) {
                for (let i = 0; i < racksPorBloqueX; i++) {
                    for (let j = 0; j < racksPorBloqueY; j++) {
                        const xm = cursorX + i * (anchoRack + SEP_RACK);
                        const ym = cursorY + j * (largoRack + SEP_RACK);
                        racks.push({
                            id: `r-${bx}-${by}-${i}-${j}`,
                            x: offsetX + xm * escala,
                            y: offsetY + ym * escala,
                            w: anchoRack * escala,
                            h: largoRack  * escala,
                        });
                    }
                }
                cursorY += largoBloqueReal;
                if (by < bloquesY - 1) {
                    cursorY += (pasillosY > 0)
                        ? anchoPasillo
                        : espacioPasilloY;
                }
            }
            cursorX += anchoBloqueReal;
            if (bx < bloquesX - 1) cursorX += anchoPasillo;
        }

        const pasillos = [];

        let px = sepParedX;
        for (let bx = 0; bx < bloquesX; bx++) {
            px += anchoBloqueReal;
            if (bx < bloquesX - 1) {
                pasillos.push({
                    id: `px-${bx}`,
                    x: offsetX + px * escala,
                    y: offsetY + sepParedY * escala,
                    w: anchoPasillo * escala,
                    h: (largoBodega - 2 * sepParedY) * escala,
                    orientacion: "vertical",
                });
                px += anchoPasillo;
            }
        }

        let py = sepParedY;
        for (let by = 0; by < bloquesY; by++) {
            py += largoBloqueReal;
            if (by < bloquesY - 1) {
                const altoPasilloY = (pasillosY > 0)
                    ? anchoPasillo
                    : espacioPasilloY;

                pasillos.push({
                    id: `py-${by}`,
                    x: offsetX + sepParedX * escala,
                    y: offsetY + py * escala,
                    w: (anchoBodega - 2 * sepParedX) * escala,
                    h: altoPasilloY * escala,
                    orientacion: "horizontal",
                });
                py += altoPasilloY;
            }
        }

        return {
            valido: true,
            ancho: anchoDibujo,
            largo: largoDibujo,
            offsetX,
            offsetY,
            racks,
            pasillos,
        };
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