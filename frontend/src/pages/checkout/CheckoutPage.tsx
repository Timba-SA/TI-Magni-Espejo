import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useCart } from "@/features/carrito/hooks/useCart";
import { AddressSelector, type TipoEntrega } from "@/features/checkout/components/AddressSelector";
import { PaymentSelector } from "@/features/checkout/components/PaymentSelector";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { crearPedido, iniciarPago } from "@/features/checkout/services/checkoutService";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrecio, clearCart } = useCart();
  
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("RETIRO");
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [formaPagoCodigo, setFormaPagoCodigo] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  const handlePlaceOrder = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    try {
      if (items.length === 0) {
        toast.error("Tu carrito está vacío, no podés realizar un pedido vacío.");
        return;
      }

      if (tipoEntrega === "ENVIO" && !direccionId) {
        toast.error("Por favor, seleccioná una dirección de entrega.");
        return;
      }

      if (!formaPagoCodigo) {
        toast.error("Por favor, seleccioná un medio de pago.");
        return;
      }

      setIsSubmitting(true);

      // Mapear los ítems del carrito para el backend de forma segura
      const mappedItems = items.map((item) => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        personalizacion: item.personalizacion && item.personalizacion.length > 0 
          ? item.personalizacion 
          : undefined,
      }));

      const pedidoData = {
        items: mappedItems,
        direccion_id: direccionId,
        forma_pago_codigo: formaPagoCodigo,
        notas: notas.trim() || undefined,
      };

      const response = await crearPedido(pedidoData);

      // Vaciar el carrito
      clearCart();

      if (formaPagoCodigo.toUpperCase() === "MERCADOPAGO") {
        try {
          toast.loading("Conectando con Mercado Pago...", { id: "pago-loading" });
          const paymentInit = await iniciarPago(response.id);
          toast.dismiss("pago-loading");
          toast.success("¡Pedido creado! Redirigiendo al pago...");
          // Redirigir directamente al checkout de Mercado Pago
          window.location.href = paymentInit.init_point;
          return;
        } catch (payError: any) {
          console.error("Error al iniciar pago de Mercado Pago:", payError);
          toast.dismiss("pago-loading");
          toast.warning("Pedido registrado, pero no pudimos conectar con Mercado Pago para pagar online. Podés pagar a continuación.");
        }
      } else {
        toast.success("¡Pedido creado con éxito! Disfrutá de la comida.");
      }
      
      // Redirigir a la página de éxito pasando el pedido en el estado de la ruta
      navigate("/checkout/success", { state: { pedido: response }, replace: true });
    } catch (error: any) {
      console.error("Error al crear el pedido:", error);
      const errMsg = error.message || "Error al procesar tu pedido. Por favor, intentá nuevamente.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Línea superior naranja */}
          <div className="w-12 h-px bg-[#FF5A00] mb-10" />

          {/* Etiqueta */}
          <p
            className="text-[9px] tracking-[0.5em] uppercase mb-4"
            style={{ color: "rgba(255,90,0,0.6)", fontFamily: "'Space Mono', monospace" }}
          >
            Checkout · Sin productos
          </p>

          {/* Título editorial */}
          <h1
            className="text-4xl sm:text-5xl font-light leading-none tracking-tight mb-6"
            style={{ letterSpacing: "-0.03em" }}
          >
            Tu selección<br />
            <span style={{ color: "#FF5A00", fontWeight: 600 }}>está vacía.</span>
          </h1>

          <p
            className="text-sm mb-10 max-w-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}
          >
            Todavía no sumaste nada al carrito.
            Explorá la carta y elegí lo que se te antoja.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/menu")}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <div
              className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF5A00]"
              style={{ background: "rgba(255,90,0,0.12)", border: "1px solid rgba(255,90,0,0.3)" }}
            >
              <ArrowLeft size={14} style={{ color: "#FF5A00" }} className="group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </div>
            <span
              className="text-xs uppercase tracking-[0.3em] transition-colors group-hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace" }}
            >
              Ver el menú
            </span>
          </button>

          {/* Línea inferior sutil */}
          <div className="w-full h-px mt-12" style={{ background: "rgba(255,255,255,0.05)" }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Botón de retorno */}
        <button
          onClick={() => navigate("/menu")}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al menú
        </button>

        {/* Cabecera */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Finalizar Compra
          </h2>
          <p className="text-sm text-neutral-400">
            Elegí cómo querés recibir tu pedido y el medio de pago.
          </p>
        </div>

        {/* Contenido principal en grilla responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de datos */}
          <div className="lg:col-span-7 space-y-8 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            
            {/* Selector de Modo de Entrega y Dirección */}
            <AddressSelector
              selectedId={direccionId}
              onSelect={setDireccionId}
              tipoEntrega={tipoEntrega}
              onTipoEntregaChange={setTipoEntrega}
            />

            <hr className="border-white/5" />

            {/* Selector de Método de Pago */}
            <PaymentSelector
              selectedCode={formaPagoCodigo}
              onSelect={setFormaPagoCodigo}
            />

            <hr className="border-white/5" />

            {/* Notas del Pedido */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500" />
                <h4 className="font-bold text-white text-base">Notas para el local</h4>
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Sin aderezos, tocar timbre B, dejar en portería, etc."
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-2xl text-white text-sm outline-none transition-all placeholder:text-neutral-600 resize-none"
              />
            </div>

          </div>

          {/* Columna Derecha: Resumen de compra persistente */}
          <div className="lg:col-span-5 space-y-6">
            <CheckoutSummary tipoEntrega={tipoEntrega} />

            {/* Botón de confirmación */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer text-base uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando Pedido...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Realizar Pedido — {formatCurrency(totalPrecio + (tipoEntrega === "ENVIO" ? 50 : 0))}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
