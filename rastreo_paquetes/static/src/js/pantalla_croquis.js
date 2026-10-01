/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";
import { CreacionCroquis } from "./creacion_croquis";
import { calcularLayoutCroquis } from "./funcion_calcular_layout";

export class PantallaCroquis extends Component {
    static components = { CreacionCroquis };
    static template = "rastreo_paquetes.pantalla_croquis";
    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.dialogService = useService("dialog")
        this.state = useState({
            // Valores "Generales"
            pedido: null,
            pedidoId: 0,
            nombre: "",
            cargando: false,
            separacion:15,
            rackTipos: [],
            bodegaIndex: 0,
            bodegas: [],
            clienteNombre: "",
            ubicacion: "",
            // Valores "de la bodega"
                  
               // metros
            rackSeleccionadomedidas: [],
            rackSeleccionadoIndex: 0,
            rackSeleccionadoCosto: 0,
            alturaBodega: 1, // entero
            anchoBodega: 0, // metros
            largoBodega: 0, // metros
            comentarios: "",
            racksOcupados: 0,

            // Valores "calculables"
            anchoPasilloX: 0,
            pasillosX: 0, 
            anchoPasilloY: 0,         
            pasillosY: 0,  

            anchoRack: 0,     // mm
            largoRack: 0,  // mm
            costoEstimado: "$0.00",
            almacenajeTonelada: "$0.00",
            porAncho: 0,      
            porLargo: 0, 
            
            costoEstimadoTotal: "$0.00",

            espacioSobranteVer: 0,
            espacioSobranteHor: 0, 
        });
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                const pedidoId = this.props.action.params.pedido_id || null;
                const clienteNombre = this.props.action.params.cliente_nombre || null;
                this.state.pedidoId = pedidoId;
                this.state.clienteNombre = clienteNombre;
                await this.cargarRacks();
                await this.cargarBodegaDB();
            }
        });
        this.searchTimeout = null;
    }
    //hechos para cargar y guardar en la lista de bodegas[] hechos para cargar y guardar en la lista de bodegas[]
    cargarBodega(index){
        const bodega = this.state.bodegas[index];
        if (!bodega) return; 
        this.state.bodegaIndex = index;    
        this.state.rackSeleccionadoIndex = bodega.rackSeleccionadoIndex;
        this.state.rackSeleccionadoCosto = bodega.rackSeleccionadoCosto;
        this.state.alturaBodega = bodega.alturaBodega;
        this.state.anchoBodega = bodega.anchoBodega;
        this.state.largoBodega = bodega.largoBodega;
        this.state.comentarios = bodega.comentarios
        this.calcularRacks();
    }
    crearBodegaLista(){
        this.guardarBodegaActual();
        this.state.bodegas.push({
            rackSeleccionadoIndex: 0,
            rackSeleccionadoCosto: 0,
            alturaBodega: 1, 
            anchoBodega:0 ,
            largoBodega: 0, 
            comentarios: ""
        });
        this.state.bodegaIndex = this.state.bodegas.length- 1; 
    }


    //hechos para cargar y guardar en la lista de bodegas[] hechos para cargar y guardar en la lista de bodegas[]
    guardarBodegaActual(){
        const bodega ={ 
            rackSeleccionadoIndex: this.state.rackSeleccionadoIndex,
            rackSeleccionadoCosto: this.state.rackSeleccionadoCosto,
            alturaBodega: this.state.alturaBodega, 
            anchoBodega: this.state.anchoBodega, 
            largoBodega: this.state.largoBodega, 
            comentarios: this.state.comentarios,
        }
        this.state.bodegas[this.state.bodegaIndex] = bodega;
    }
  

     async cargarBodegaDB(){
        try {
            const resultado = await this.orm.call(
                "rastreo.bodega_cliente",
                "obtener_bodega",
                [this.state.pedidoId]
            );
            if(resultado.success){
                this.state.ubicacion = resultado.data.ubicacion;
                const bodegas = resultado.data.bodegas
                this.state.bodegas = bodegas.map( b => {
                    return {
                        rackSeleccionadoIndex: b.rack_id,
                        rackSeleccionadoCosto:b.costoRack,
                        alturaBodega:b.niveles,
                        anchoBodega:b.ancho,
                        largoBodega: b.largo,
                        comentarios: b.descripcion
                    }
                });
                if (this.state.bodegas.length === 0) {
                        this.state.bodegas.push({
                            rackSeleccionadoIndex: 0,
                            rackSeleccionadoCosto: 0,
                            alturaBodega: 1, 
                            anchoBodega:0 ,
                            largoBodega: 0, 
                            comentarios: ""
                        });
                        this.state.bodegaIndex = 0; 
                    }
                    this.cargarBodega(0);
            }else{
                if (this.state.bodegas.length === 0) {
                        this.state.bodegas.push({
                            rackSeleccionadoIndex: 0,
                            rackSeleccionadoCosto: 0,
                            alturaBodega: 1, 
                            anchoBodega:0 ,
                            largoBodega: 0, 
                            comentarios: ""
                        });
                        this.state.bodegaIndex = 0; 
                    }
                    this.cargarBodega(0);
            }
        } finally {
            this.state.cargando = false;
        }
    }

    eliminarBodega(index, ev) {
        if (ev) ev.stopPropagation(); 

        if (this.state.bodegas.length <= 1) {
            this.notification.add("Debe haber al menos una bodega", { type: "warning" });
            return;
        } 
        this.state.bodegas.splice(index, 1);

        if (this.state.bodegaIndex >= this.state.bodegas.length) {
            this.state.bodegaIndex = this.state.bodegas.length - 1;
        }
        this.cargarBodega(this.state.bodegaIndex);
    }

   async cargarRacks(){
         try {
            const resultado = await this.orm.call(
                "rastreo.rack_detalle",
                "listar_racks",
            );
            if(resultado.success){
                this.state.rackTipos = resultado.data.map((r,i) =>{
                    return [r.nombre, r.medidas, r.precio_unitario]
                })
            }else{
               this.state.rackTipos = []
            }
        } finally {
            this.state.cargando = false;
        }
    }

    async onClickCambiarEstado(){
        this.dialogService.add(ConfirmationDialog, {
            title: _t("¿Estás seguro?"),
            body: _t("El cliente acepto la propuesta? ¿Desea continuar?"),
            confirm: async () => {
                this.guardarBodegaActual();
                await this.onClickGuardar()
                await this.cambiarEstado();
                await this.action.doAction("rastreo_paquetes.action_pantalla_principal");
            },
            cancel: () => {
                return;
            },
        });
       
    }
    async onClickRegresar() {
        this.guardarBodegaActual();
        this.onClickGuardar();
        await this.action.doAction("rastreo_paquetes.action_pantalla_principal");
    }
    async cambiarEstado(){
        const pedidoId = this.state.pedido.id
        try {
            const resultado = await this.orm.call(
                "rastreo.pedido",
                "cambiar_estado",
                [pedidoId]
            );
            this.state.pedido = resultado.data ?? resultado;

        } finally {
            this.state.cargando = false;
        }
    }

    onCalcular(){
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.calcularRacks();
        }, 500);
    }

    calcularRacks() {
        const idx = parseInt(this.state.rackSeleccionadoIndex, 10);
        if (isNaN(idx)) {
            this.notification.add("Primero selecciona un rack", { type: "warning" });
            return;
        }

        // Calculos en Milimetros ---- Milimetros ---- Milimetros
        const separacionPared = .30;  
        const separacionRack  = .15;  
        const anchoBodega  = Number(this.state.anchoBodega) || 0;
        const largoBodega  = Number(this.state.largoBodega) || 0;
        const altoBodega   = Number(this.state.alturaBodega) || 1;
        const costo        = Number(this.state.rackSeleccionadoCosto) || 0;
        const [, medidas]  = this.state.rackTipos[idx];
        const [anchoRackmm, largoRackmm] = medidas;

        if (!anchoBodega || !largoBodega) {
            this.notification.add("Ingresa ancho y largo de la bodega", { type: "warning" });
            return;
        }
        if (!costo) {
            this.notification.add("Ingresa un costo", { type: "warning" });
            return;
        }
        // convercion de mm a m  convercion de mm a m
        const anchoRackM = anchoRackmm / 1000; 
        const largoRackM  = largoRackmm / 1000; 

        const racksMathHor = ((anchoBodega - (separacionPared*2)) / (anchoRackM + separacionRack))+ .16 ;
        const racksMathVer = ((largoBodega - (separacionPared*2)) / (largoRackM + separacionRack)) + .16  ;
        const porAncho = Math.max(0, Math.floor( racksMathHor ));
        const porLargo = Math.max(0, Math.floor( racksMathVer ));
        
      
        if (porAncho === 0 || porLargo === 0) {
            this.notification.add(
                "Con estas dimensiones y pasillos no cabe ningún rack.",
                { type: "warning" }
            );
            return;
        }


        let espacioSobranteHor = (anchoBodega - (separacionPared*2) - ((anchoRackM + separacionRack) * porAncho)) + separacionRack ;
        if(espacioSobranteHor < 0){ espacioSobranteHor = 0.00}
        this.state.anchoPasilloY = espacioSobranteHor;
        this.state.espacioSobranteHor = (espacioSobranteHor + .60).toFixed(2);


        let espacioSobranteVer = (largoBodega - (separacionPared*2) - ((largoRackM  + separacionRack) * porLargo)) + separacionRack ;
        if(espacioSobranteVer < 0){ espacioSobranteVer = 0.00}
        this.state.anchoPasilloX = espacioSobranteVer;
        this.state.espacioSobranteVer = (espacioSobranteVer + .60).toFixed(2);


        this.state.racksOcupados  = porAncho * porLargo * altoBodega;
        this.state.costoEstimado  = `$${(costo * this.state.racksOcupados).toFixed(2)}`;
        this.state.anchoRack      = anchoRackM;   // m
        this.state.largoRack      = largoRackM;   // m
        this.state.porAncho       = porAncho;
        this.state.porLargo       = porLargo;
        this.notification.add(
            `Cálculo actualizado: ${this.state.costoEstimado} (${this.state.racksOcupados} racks)`,
            { type: "success" }
        );
    }

    onRackChange() {
        const idx = parseInt(this.state.rackSeleccionadoIndex, 10);
        if (isNaN(idx)) {
            this.state.racksOcupados = 0;
            this.state.costoEstimado = "$0.00";
            return;
        }
        
        const [, , costo] = this.state.rackTipos[idx];
        this.state.rackSeleccionadoCosto = costo;
        this.calcularRacks();
    }
    async autoGuardado(){
        await onClickGuardar;
    }

    async onClickGuardar() {
        const idx = parseInt(this.state.rackSeleccionadoIndex, 10);
        const anchoBodega  = Number(this.state.anchoBodega) || 0;
        const largoBodega  = Number(this.state.largoBodega) || 0;
        let altoBodega   = Number(this.state.alturaBodega) || 1;
        const costo        = Number(this.state.rackSeleccionadoCosto) || 0;
        if (isNaN(idx)) {
            this.notification.add("Selecciona un rack", { type: "warning" });
            return;
        }
        if (!anchoBodega || !largoBodega) {
            this.notification.add("Ingresa ancho y largo de la bodega", { type: "warning" });
            return;
        }
        if (!costo) {
            this.notification.add("Ingresa un costo", { type: "warning" });
            return;
        }
        if(altoBodega < 1){
            altoBodega = 1;
        }
        
        const bodegas = this.state.bodegas.map((b, i) => ({
            descripcion:  b.comentarios,
            numero_bodega: i + 1,
            ancho:        Number(b.anchoBodega) || 0,
            largo:        Number(b.largoBodega) || 0,
            niveles:      Math.max(1, Math.round(Number(b.alturaBodega) || 1)),
            rack_id:      b.rackSeleccionadoIndex,
            costoRack:    Number(b.rackSeleccionadoCosto) || 0,
        })); 

        const id = await this.orm.call(
            "rastreo.bodega_cliente", 
            "guardar_bodega",
            [
                this.state.pedidoId, 
                this.state.ubicacion, 
                bodegas
            ]
        );
        if(id != 0){
            this.notification.add( `Guardado exitoso `, { type: "success" });
        }
    }

    

    // Descargar PDF ¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿
    async onClickDescargarPDF() {
        for (let i = 0; i < this.state.bodegas.length; i++) {
            const b = this.state.bodegas[i];
            if (!Number(b.anchoBodega) || !Number(b.largoBodega)) {
                this.notification.add(`Bodega ${i + 1}: faltan datos`, { type: "warning" });
                return;
            }
        }

        this.guardarBodegaActual();
        await this.onClickGuardar();
     
        const { bodegas, costoEstimadoTotal } = this.convertirBodegasLista();
    

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedToday = `${dd}/${mm}/${yyyy}`;

        const datos = {
            bodegas: bodegas,                    
            costoEstimadoTotal: costoEstimadoTotal,
            ubicacion: this.state.ubicacion,
            clienteNombre: this.state.clienteNombre || '',
            fecha: formattedToday,
        };
        this.notification.add("Generando PDF, por favor espere...", { type: "info" });

        const result = await this.orm.call(
            "rastreo.bodega_cliente",
            "generar_pdf_croquis",
            [datos]
        );

        if (result?.file_content) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${result.file_content}`;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            this.notification.add("Error: no se logró generar el PDF", { type: "warning" });
        }
    }
    convertirBodegasLista() {
        let costoEstimadoTotal = 0;
        const bodegas = this.state.bodegas.map((b, i) => {
            const idx = parseInt(b.rackSeleccionadoIndex, 10);
            if (isNaN(idx) || !this.state.rackTipos[idx]) {
                return null; 
            }

            const separacionPared = 0.30;
            const separacionRack  = 0.15;
            const anchoBodega     = Number(b.anchoBodega) || 0;
            const largoBodega     = Number(b.largoBodega) || 0;
            const altoBodega      = Number(b.alturaBodega) || 1;

            const [nombreRack, medidas] = this.state.rackTipos[idx];
            const [anchoRackmm, largoRackmm, altoRackmm] = medidas;

            const anchoRackM = anchoRackmm / 1000;
            const largoRackM = largoRackmm / 1000;

            const racksMathHor = ((anchoBodega - separacionPared * 2) / (anchoRackM + separacionRack)) + 0.16;
            const racksMathVer = ((largoBodega - separacionPared * 2) / (largoRackM + separacionRack)) + 0.16;

            
            const porAncho       = Math.max(0, Math.floor(racksMathHor));
            const porLargo       = Math.max(0, Math.floor(racksMathVer));
            const racksOcupados  = porAncho * porLargo * altoBodega;

            const costoRack   = Number(b.rackSeleccionadoCosto) || 0;
            const costoBodega = costoRack * racksOcupados;
            costoEstimadoTotal += costoBodega;

            let espacioSobranteHor = (anchoBodega - (separacionPared*2) - ((anchoRackM + separacionRack) * porAncho)) + separacionRack ;
            if(espacioSobranteHor < 0){ espacioSobranteHor = 0.00}
            const sobranteH = (espacioSobranteHor + .60).toFixed(2);

            let espacioSobranteVer = (largoBodega - (separacionPared*2) - ((largoRackM  + separacionRack) * porLargo)) + separacionRack ;
            if(espacioSobranteVer < 0){ espacioSobranteVer = 0.00}
            const sobranteV = (espacioSobranteVer + .60).toFixed(2);

            const layout = calcularLayoutCroquis({
                anchoBodega:  anchoBodega,
                largoBodega:  largoBodega,
                anchoRack:    anchoRackM,
                largoRack:    largoRackM,
                porAncho:     porAncho,
                porLargo:     porLargo,
                pasillosX:    1,
                pasillosY:    1,
                anchoPasilloX: this.state.anchoPasilloX,
                anchoPasilloY: this.state.anchoPasilloY
            });

            return {
                anchoBodega:   anchoBodega,
                largoBodega:   largoBodega,
                alturaBodega:  altoBodega,
                anchoRack:     anchoRackmm,
                largoRack:     largoRackmm,
                altoRack:      altoRackmm,

                sobranteH: sobranteH || 0,
                sobranteV: sobranteV || 0,
                porAncho:      porAncho,
                porLargo:      porLargo,
                racksOcupados: racksOcupados,

                costoRack:     costoRack,
                costoEstimado: costoBodega.toFixed(2),

                rackNombre:    nombreRack,
                descripcion:   b.comentarios || "",
                numero_bodega: i + 1,

                layout:        layout,
            };
        }).filter(Boolean);  

        return {
            bodegas: bodegas,
            costoEstimadoTotal: costoEstimadoTotal.toFixed(2),
        };
    }
    calcularLayoutParaPDF() {
        return calcularLayoutCroquis({
            anchoBodega:  this.state.anchoBodega,
            largoBodega:  this.state.largoBodega,
            anchoRack:    this.state.anchoRack,
            largoRack:    this.state.largoRack,
            porAncho:     this.state.porAncho,
            porLargo:     this.state.porLargo,
            pasillosX:    this.state.pasillosX,
            pasillosY:    this.state.pasillosY,
            anchoPasilloX: this.state.anchoPasilloX,
            anchoPasilloY: this.state.anchoPasilloY
        });
    }

      onClickCrearBodega(){
        this.guardarBodegaActual();
        this.crearBodegaLista();
    }
    onclickCambiarBodega(bodegaIndex){
        this.guardarBodegaActual();
        this.cargarBodega(bodegaIndex)
    } 
}

PantallaCroquis.template = "rastreo_paquetes.pantalla_croquis";
registry.category("actions").add("rastreo_paquetes.pantalla_croquis", PantallaCroquis);