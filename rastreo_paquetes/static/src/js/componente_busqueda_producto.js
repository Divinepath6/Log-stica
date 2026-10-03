/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks"; 

export class componente_busqueda_producto extends Component {
    static template = "rastreo_paquetes.componente_busqueda_producto_embed";
    static components = { Dialog };
    static props = {
        close: Function,
        title: { type: String, optional: true },
        confirm: { type: Function, optional: true },
        cancel: { type: Function, optional: true },
    };
    static components = { Dialog };
    
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            productoSeleccionadoId: 0,
            termino_busqueda: "",
            productoSeleccionadoNombre: "",
            productos: [],
            cargando: false,
        })
        onWillStart(async () => {
            if (this.props.action && this.props.action.params) {
                this.listarProductos();
            }
            
        });
    }
    
     async listarProductos() {
        try {
            this.state.cargando = true;
            const resultado = await this.orm.call(
                "rastreo.rack_detalle",
                "listar_productos",
                [this.state.termino_busqueda]
            );
            this.state.productos = resultado
        } catch (e) {
            console.error("Error al listar productos:", e);
            this.state.productos = [];
        } finally {
            this.state.cargando = false;
        }
    }

    onBuscarInput(ev) {
        this.state.termino_busqueda = ev.target.value;
    }

    async onBuscar(ev) {
        ev.preventDefault();
        await this.listarProductos();
    }
    
    onKeyDown(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            this.onBuscar(ev);
        }
    }

    onSeleccionarProducto(p) {
        this.state.productoSeleccionadoId = p.id;
        this.state.productoSeleccionadoNombre = p.name;
    }

    _onConfirm() {
        if (this.state.productoSeleccionadoId === 0) {
            return;
        }
        if (this.props.confirm) {
            this.props.confirm(this.state.productoSeleccionadoId);
        }
        this.props.close();
    }

    _onCancel() {
        if (this.props.cancel) {
            this.props.cancel();
        }
        this.props.close();
    }
}

