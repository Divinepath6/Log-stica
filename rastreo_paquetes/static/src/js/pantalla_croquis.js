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
                  
            anchoPasillo: 2,   // metros
            rackSeleccionadomedidas: [],
            rackSeleccionadoIndex: 0,
            rackSeleccionadoCosto: 0,
            alturaBodega: 1, // entero
            anchoBodega: 0, // metros
            largoBodega: 0, // metros
            comentarios: "",
            racksOcupados: 0,

            // Valores "calculables"
            pasillosX: 0,          
            pasillosY: 0,    
            anchoRack: 0,     // mm
            largoRack: 0,  // mm
            costoEstimado: "$0.00",
            almacenajeTonelada: "$0.00",
            porAncho: 0,      
            porLargo: 0, 

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
        this.state.rackSeleccionadoIndex = bodega.rackSeleccionadoIndex;
        this.state.rackSeleccionadoCosto = bodega.rackSeleccionadoCosto;
        this.state.alturaBodega = bodega.alturaBodega;
        this.state.anchoBodega = bodega.anchoBodega;
        this.state.largoBodega = bodega.largoBodega;
        this.state.comentarios = bodega.comentarios
        
    }
    crearBodegaLista(){
        const bodega = {
            rackSeleccionadoIndex: 0,
            rackSeleccionadoCosto: 0,
            alturaBodega: 1, 
            anchoBodega:0 ,
            largoBodega: 0, 
            comentarios: ""
        };
        this.state.bodegas.push(bodega);
        this.state.bodegaIndex = this.state.bodegas.length; 
    }
    guardarBodega(){
        const bodega ={
            rackSeleccionadoIndex: this.state.rackSeleccionadoIndex,
            rackSeleccionadoCosto: this.state.rackSeleccionadoCosto,
            alturaBodega: this.state.alturaBodega, 
            anchoBodega: this.state.anchoBodega, 
            largoBodega: this.state.largoBodega, 
            comentarios: this.state.comentarios
        }
        this.state.bodegas[this.state.bodegaIndex] = bodega;
    }
    onClickCrearBodega(){
        this.guardarBodega(true)
    }
    onclickCambiarBodega(){
        this.cargarBodega(0)
    }
     //hechos para cargar y guardar en la lista de bodegas[] hechos para cargar y guardar en la lista de bodegas[]
    
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
                this.state.rackSeleccionadoIndex = 0;
                this.cargarBodega(0);
                this.calcularRacks();
            }
        } finally {
            this.state.cargando = false;
        }
    }
    
   async cargarRacks(){
        const racks = 
        [
            ["Rack 1220 x 1220 x 1620", [1220 ,1220,1620], 122.65], 
            ["Rack 1524 x 1424 x 1524", [1524 ,1424,1524], 153.60] 
        ];
        this.state.rackTipos = racks
    }

    async onClickCambiarEstado(){
        this.dialogService.add(ConfirmationDialog, {
            title: _t("¿Estás seguro?"),
            body: _t("El cliente acepto la propuesta? ¿Desea continuar?"),
            confirm: async () => {
                await this.cambiarEstado();
                await this.action.doAction("rastreo_paquetes.action_pantalla_principal");
            },
            cancel: () => {
                return;
            },
        });
       
    }
    async onClickRegresar() {
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

        const anchoRackM = anchoRackmm / 1000; // convercion de mm a m
        const largoRackM  = largoRackmm / 1000; // convercion de mm a m

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
        this.state.espacioSobranteHor = ((anchoBodega - (separacionPared*2) - ((anchoRackM + separacionRack) * porAncho)) + separacionRack ).toFixed(2);
        if(this.state.espacioSobranteHor < 0){ this.state.espacioSobranteHor = 0.00}
        this.state.espacioSobranteVer = ((largoBodega - (separacionPared*2) - ((largoRackM  + separacionRack) * porLargo)) + separacionRack ).toFixed(2);
        if(this.state.espacioSobranteVer < 0){ this.state.espacioSobranteVer = 0.00}
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
        this.state.costoEstimado = `$${costo.toFixed(2)}`;
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
        const bodegas =[
            {                
                'descripcion':      this.state.comentarios,
                'numero_bodega':    1,
                'ancho':            anchoBodega,
                'largo':            largoBodega,
                'niveles':          Math.round(altoBodega),
                'rack_id':          this.state.rackSeleccionadoIndex,
                'costoRack':        costo,
            }
        ]
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
        const layout = this.calcularLayoutParaPDF();
        if (!layout.valido) {
            this.notification.add("Genera primero el croquis", { type: "warning" });
            return;
        }
        await this.onClickGuardar();
        const datos = {
            anchoBodega:  this.state.anchoBodega,
            largoBodega:  this.state.largoBodega,
            alturaBodega: this.state.alturaBodega,
            anchoRack:    this.state.anchoRack,
            largoRack:    this.state.largoRack,
            porAncho:     this.state.porAncho,
            porLargo:     this.state.porLargo,
            racksOcupados: this.state.racksOcupados,
            costoEstimado: this.state.costoEstimado,
            ubicacion:    this.state.ubicacion,
            comentarios:  this.state.comentarios,
            rackNombre:   this.state.rackTipos[this.state.rackSeleccionadoIndex]?.[0] || '',
            clienteNombre: this.state.clienteNombre || '',
            layout,
        };
        this.notification.add("Generando PDF por favor espere ", { type: "success" });
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
        }else{
            this.notification.add("Error no se logro generar el PDF ", { type: "warning" });
        }
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
            anchoPasillo: this.state.anchoPasillo,
        });
    }
    
}

PantallaCroquis.template = "rastreo_paquetes.pantalla_croquis";
registry.category("actions").add("rastreo_paquetes.pantalla_croquis", PantallaCroquis);