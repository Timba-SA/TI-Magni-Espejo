import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useCart } from "@/features/carrito/hooks/useCart";
import { AddressSelector } from "@/features/checkout/components/AddressSelector";
import { PaymentSelector } from "@/features/checkout/components/PaymentSelector";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { crearPedido } from "@/features/checkout/services/checkoutService";
import { ShoppingBag, ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrecio, clearCart } = useCart();
  
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

      if (!direccionId) {
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

      toast.success("¡Pedido creado con éxito! Disfrutá de la comida.");
      
      // Vaciar el carrito
      clearCart();
      
      // Redirigir a la página de éxito pasando el pedido en el estado de la ruta
      navigate("/checkout/success", { state: { pedido: response }, replace: true });
    } catch (error: any) {
      console.error("Error al crear el pedido:", error);
      const errMsg = error.response?.data?.detail || error.message || "Error al procesar tu pedido. Por favor, intentá nuevamente.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-[#080808] text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md w-full p-8 bg-[#0E0E0E]/80 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="absolute -inset-4 bg-orange-500/5 rounded-[40px] blur-2xl animate-pulse pointer-events-none" />
          <div className="relative flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center text-neutral-400">
              <ShoppingBag size={28} className="stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-wide">¿Carrito vacío, loco?</h2>
              <p className="text-sm text-neutral-400 max-w-xs leading-relaxed mx-auto">
                No tenés productos cargados para proceder al checkout. ¡Pasate por nuestra carta para ver qué se te antoja hoy!
              </p>
            </div>
            <button
              onClick={() => navigate("/menu")}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all text-sm cursor-pointer shadow-lg shadow-white/5"
            >
              Explorar el Menú
            </button>
          </div>
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
            Completá los datos de entrega y el medio de pago para disfrutar de tu pedido.
          </p>
        </div>

        {/* Contenido principal en grilla responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de datos */}
          <div className="lg:col-span-7 space-y-8 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            
            {/* Selector de Dirección */}
            <AddressSelector
              selectedId={direccionId}
              onSelect={setDireccionId}
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
            <CheckoutSummary />

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
                  Realizar Pedido — {formatCurrency(totalPrecio + 350)}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
