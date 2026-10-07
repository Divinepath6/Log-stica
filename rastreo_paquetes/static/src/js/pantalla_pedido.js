/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";

export class PantallaPedido extends Component {
    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.dialogService = useService("dialog")
        this.state = useState({
            // Valores "Generales"
            pedidoId: 0,
            nombre: "",
            guia: "",
            clienteId: 0,
            clienteNombre: "",
            estado: "",
            

            // Listas de detalles
            detalleRacks:[],
            detalleCliente: [],
            detalleProveedor: [],
            actualizaciones: [],

            //bool de PDF
            forwarder: false,
            pdf_BL: false,
            pdf_PL: false,
            pdf_invoice: false,
            pdfContratoProveedor:false,
            pdfFacturaProveedor: false,

            // Monedas
            totalProveedor: 0.0,
            totalCliente: 0.0,
            numeroContrato: "",

            
            cargando: false,

        });
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                const pedidoId = this.props.action.params.pedido_id || null;
                this.state.pedidoId = pedidoId;
                await this.state.cargarPedido()
            }
        });
        this.searchTimeout = null;
    }
 
    async cargarPedido(){
        const pedidoId = this.state.pedidoId
        try {
            const resultado = await this.orm.call(
                "rastreo.pedido",
                "cargar_pedido",
                [pedidoId]
            );
            if(resultado.success){
                const p = resultado.data;
                this.state.guia = p.numero_guia;
                this.state.clienteId = p.cliente_id;
                this.state.clienteNombre = p.cliente_nombre;
                this.state.totalCliente = p.total_cliente;
                this.state.totalProveedor = p.total_proveedor;
                this.state.numeroContrato = p.numero_contrato;
                this.state.forwarder = p.forwarder;
                this.state.pdfContratoProveedor = p.bool_contrato_proveedor;
                this.state.pdfFacturaProveedor = p.bool_factura_proveedor;
                this.state.numeroContrato = p.numero_contrato;
                
                this.state.actualizaciones = actualizaciones;
            }
        } finally {
            this.state.cargando = false;
        }
    }

    async onClickCambiarEstado(){
        this.dialogService.add(ConfirmationDialog, {
            title: _t("¿Estás seguro?"),
            body: _t(),
            confirm: async () => {
                //await this.cambiarEstado();
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

  


  
    async autoGuardado(){
        await onClickGuardar;
    }

    async onClickGuardar() {
        
    }

    

    // Descargar PDF ¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿
    async onClickDescargarPDF() {
        
    }


  
}

PantallaPedido.template = "rastreo_paquetes.detalle_pedido";