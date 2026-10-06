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
            Guia: "",
            clienteId: 0,
            clienteNombre: "",
            estado: "",
            

            // Listas de detalles
            detalleRacks:[],
            detalleCliente: [],
            detalleProveedor: [],

            //bool de PDF
            forwarder: false,
            pdf_BL: false,
            pdf_PL: false,
            pdf_invoice: false,
            pdf_contrato_proveedor:false,
            pdf_factura_proveedor: false,

            // Monedas
            total_proveedor: 0.0,
            total_cliente: 0.0,
            numero_contrato: "",

            
            cargando: false,

        });
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                const pedidoId = this.props.action.params.pedido_id || null;
                await this.state.cargarPedido()
                this.state.pedidoId = pedidoId;
            }
        });
        this.searchTimeout = null;
    }
 
    async cargarPedido(){
        
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

PantallaCroquis.template = "rastreo_paquetes.detalle_pedido";