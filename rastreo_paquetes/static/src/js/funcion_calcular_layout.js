/** @odoo-module **/

export function calcularLayoutCroquis(props) {
    const anchoBodega  = Number(props.anchoBodega) || 0;
    const largoBodega  = Number(props.largoBodega) || 0;
    const anchoRack    = Number(props.anchoRack)   || 0;
    const largoRack    = Number(props.largoRack)   || 0;
    const porAncho     = Number(props.porAncho)    || 0;
    const porLargo     = Number(props.porLargo)    || 0;

    if (!anchoBodega || !largoBodega || !porAncho || !porLargo) {
        return { valido: false, ancho: 0, largo: 0, racks: [], pasillos: [] };
    }

    const SEP_PARED = 0.30;
    const SEP_RACK  = 0.15;

    const espacioOcupadoRacksX = (porAncho * anchoRack) + ((porAncho - 1) * SEP_RACK);
    const espacioOcupadoRacksY = (porLargo * largoRack) + ((porLargo - 1) * SEP_RACK);
 
    let anchoPasilloX = 0;
    let anchoPasilloY = 0;
    
    if (porAncho > 1) {
        anchoPasilloX = (anchoBodega - (2 * SEP_PARED)) - (espacioOcupadoRacksX - SEP_RACK);
        if (anchoPasilloX < 0) anchoPasilloX = SEP_RACK; 
    }

    if (porLargo > 1) {
        anchoPasilloY = (largoBodega - (2 * SEP_PARED)) - (espacioOcupadoRacksY - SEP_RACK);
        if (anchoPasilloY < 0) anchoPasilloY = SEP_RACK; 
    }

    const racksIzq = Math.ceil(porAncho / 2);
    const racksArr = Math.ceil(porLargo / 2);

    const anchoSVG = 800;
    const altoSVG  = 500;
    const padding  = 40;

    const areaW  = anchoSVG - (2 * padding);
    const areaH  = altoSVG  - (2 * padding);
    const escalaX = areaW / anchoBodega;
    const escalaY = areaH / largoBodega;
    const escala  = Math.min(escalaX, escalaY);

    const anchoDibujo = anchoBodega * escala;
    const largoDibujo = largoBodega * escala;
    const offsetX = padding + (areaW - anchoDibujo) / 2;
    const offsetY = padding + (areaH - largoDibujo) / 2;

    const racks = [];
    
    for (let i = 0; i < porAncho; i++) {
        for (let j = 0; j < porLargo; j++) {
            let sumPasilloX = (i >= racksIzq && porAncho > 1) ? (anchoPasilloX - SEP_RACK) : 0;
            let sumPasilloY = (j >= racksArr && porLargo > 1) ? (anchoPasilloY - SEP_RACK) : 0;

            const xm = SEP_PARED + (i * (anchoRack + SEP_RACK)) + sumPasilloX;
            const ym = SEP_PARED + (j * (largoRack + SEP_RACK)) + sumPasilloY;

            racks.push({
                id: `r-${i}-${j}`,
                x: offsetX + xm * escala,
                y: offsetY + ym * escala,
                w: anchoRack * escala,
                h: largoRack * escala,
            });
        }
    }

    const pasillos = [];
    
    if (porAncho > 1) {
        const px = SEP_PARED + (racksIzq * anchoRack) + ((racksIzq - 1) * SEP_RACK);
        pasillos.push({
            id: `px-central`,
            x: offsetX + px * escala,
            y: offsetY + SEP_PARED * escala,
            w: anchoPasilloX * escala,
            h: (largoBodega - (2 * SEP_PARED)) * escala,
            orientacion: "vertical",
        });
    }

    if (porLargo > 1) {
        const py = SEP_PARED + (racksArr * largoRack) + ((racksArr - 1) * SEP_RACK);
        pasillos.push({
            id: `py-central`,
            x: offsetX + SEP_PARED * escala,
            y: offsetY + py * escala,
            w: (anchoBodega - (2 * SEP_PARED)) * escala,
            h: anchoPasilloY * escala,
            orientacion: "horizontal",
        });
    }

    return {
        valido: true,
        ancho: anchoDibujo,
        largo: largoDibujo,
        offsetX,
        offsetY,
        racks,
        pasillos,
        anchoSVG,
        altoSVG,
        escala,
    };
}