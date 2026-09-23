/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";
import { CreacionCroquis } from "./creacion_croquis";

export class PantallaCroquis extends Component {
    static components = { CreacionCroquis };
    static template = "rastreo_paquetes.pantalla_croquis";
    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.dialogService = useService("dialog")
        this.state = useState({
            pedido: null,
            pedidoId: 0,
            nombre: "",
            cargando: false,
            separacion:15,
            rackTipo: "",
            rackTipos: [],

            ubicacion: "",
            pasillosX: 0,          
            pasillosY: 0,          
            anchoPasillo: 2,   // metros
            rackSeleccionadomedidas: [],
            rackSeleccionadoCosto: 0,
            alturaBodega: 1, // entero
            anchoBodega: 0, // metros
            largoBodega: 0, // metros
            comentarios: "",
            racksOcupados: 0,
            costoEstimado: "$0.00",
            almacenajeTonelada: "$0.00",
            anchoRack: 0,     // mm
            largoRack: 0,     // mm
            porAncho: 0,      
            porLargo: 0,    
        });
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                const pedidoId = this.props.action.params.pedido_id || null;
                this.pedido =  await this.cargarPedido(pedidoId);
                this.state.pedidoId = pedidoId
                await this.cargarRacks();
                await this.cargarBodega();
            }
            
        });
        this.searchTimeout = null;
    }

    async cargarRacks(){
        const racks = 
        [
            ["Rack 1220 x 1220 x 1620", [1220 ,1220,1620], 122.65], 
            ["Rack 1524 x 1424 x 1524", [1524 ,1424,1524], 153.60] 
        ];
        this.state.rackTipos = racks
    }
    async cargarBodega(){
        try {
            const resultado = await this.orm.call(
                "rastreo.bodega_cliente",
                "obtener_bodega",
                [this.state.pedidoId]
            );
            if(resultado.success){
                    const bodega = resultado.data.bodegas[0];
                    this.state.ubicacion = resultado.data.ubicacion;
                    this.state.comentarios = bodega.descripcion;
                    this.state.anchoBodega = bodega.ancho;
                    this.state.largoBodega = bodega.largo;
                    this.state.alturaBodega = bodega.niveles;
                    this.state.rackTipo = bodega.rack_id;
                    this.state.rackSeleccionadoCosto = bodega.costoRack;
                    this.calcularRacks();
            }

        } finally {
            this.state.cargando = false;
        }

    }
    async cargarPedido(pedidoId){
        try {
            const resultado = await this.orm.call(
                "rastreo.pedido",
                "obtener_pedido",
                [pedidoId]
            );
            this.state.pedido = resultado.data ?? resultado;

        } finally {
            this.state.cargando = false;
        }
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
    async onClickDescargarPDF() {
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
        const idx = parseInt(this.state.rackTipo, 10);
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
        const anchoRackM = anchoRackmm / 1000;// m
        const largoRackM  = largoRackmm / 1000; // m
        console.log( " ancho " + anchoBodega + " largo " + largoBodega + " anchorack" + anchoRackM + " largo " + largoRackM)
        const porAncho = Math.max(0, Math.floor( ((anchoBodega - (separacionPared*2)) / (anchoRackM + separacionRack))+ separacionRack ));
        const porLargo = Math.max(0, Math.floor( ((largoBodega - (separacionPared*2)) / (largoRackM + separacionRack)) + separacionRack ));
        
        console.log( " ancho " + porAncho + " largo " + porLargo)

        if (porAncho === 0 || porLargo === 0) {
            this.notification.add(
                "Con estas dimensiones y pasillos no cabe ningún rack.",
                { type: "warning" }
            );
            return;
        }

        this.state.racksOcupados  = porAncho * porLargo;
        this.state.costoEstimado  = `$${(costo * this.state.racksOcupados * altoBodega).toFixed(2)}`;

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
        const idx = parseInt(this.state.rackTipo, 10);
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
        const idx = parseInt(this.state.rackTipo, 10);
        const anchoBodega  = Number(this.state.anchoBodega) || 0;
        const largoBodega  = Number(this.state.largoBodega) || 0;
        const altoBodega   = Number(this.state.alturaBodega) || 1;
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
                'rack_id':          this.state.rackTipo,
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
 
}

PantallaCroquis.template = "rastreo_paquetes.pantalla_croquis";
registry.category("actions").add("rastreo_paquetes.pantalla_croquis", PantallaCroquis);