/** @odoo-module **/
import { Component, useRef, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useService } from "@web/core/utils/hooks";


export class PdfUploader extends Component {
    static template = "rastreo_paquetes.PdfUploader";
    static props = {...standardFieldProps,};
    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.pdfInput = useRef("selectorPDF");
        this.state = useState({
            archivo: null,
            cargando: true,
        })
        onWillStart( async () =>{
            this.cargarPedido();
        });
    }

    onAbrirSelectorPDF() {
        this.pdfInput.el.click();
    }

    onClickVerPDF() {
        const pedidoId = this.props.record.resId;
        const campo = this.props.name;
        if (!pedidoId) {
            this.notification.add(
                "No se encontró el pedido.",
                { type: "danger" }
            );
            return;
        }
        const url = `/web/content/rastreo.pedido/${pedidoId}/${campo}`;
        window.open(url, "_blank");
    }

    async onPDFSeleccionado(ev) {
        const archivo = ev.target.files[0];
        if (!archivo) {
            return;
        }
        if (
            archivo.type !== "application/pdf" &&
            !archivo.name.toLowerCase().endsWith(".pdf")
        ) {

            this.notification.add(
                "Solo puedes seleccionar archivos PDF.",
                {
                    type: "danger",
                }
            );

            ev.target.value = "";

            return;
        }
        this.state.archivo = archivoBase64
    
    
        const archivoBase64 = await this.convertirPDFBase64(archivo);
        

        ev.target.value = "";
    }
    async guardarPDF(){
        const pedidoId = this.props.record.resId;
        if (!pedidoId) {

            this.notification.add(
                "Primero debes guardar el pedido.",
                {
                    type: "warning",
                }
            );
            return;
        }
        const resultado = await this.orm.call(
            "rastreo.pedido",
            "subir_pdf",
            [
                this.props.name,
                archivoBase64,
                pedidoId
            ]
        );

        if (resultado.success) {
            this.notification.add(
                "PDF agregado correctamente.",
                {type: "success",}
            );
        } else {
            this.notification.add(
                resultado.error || "No se pudo subir el PDF.",
                {type: "danger",}
            );
        }
    }
    convertirPDFBase64(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
             reader.onload = () => {
                const resultado = reader.result;
                const base64 = resultado.split(",")[1];
                resolve(base64);
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsDataURL(archivo);
        });
    }
}

registry.category("fields").add(
    "rastreo_pdf_uploader",
    {
        component: PdfUploader,
    }
);