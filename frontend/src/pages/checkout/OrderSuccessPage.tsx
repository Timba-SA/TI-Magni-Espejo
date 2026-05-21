import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, ShoppingBag, CreditCard, Calendar, Truck, ArrowRight } from "lucide-react";
import type { PedidoResponse } from "@/features/checkout/types/checkout.types";
import { toast } from "sonner";

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoResponse | null>(null);

  useEffect(() => {
    // Recuperar el pedido desde el estado de navegación
    const statePedido = location.state?.pedido as PedidoResponse;
    if (statePedido) {
      setPedido(statePedido);
    } else {
      // Si no hay datos del pedido, redirige al menú tras un instante
      const timer = setTimeout(() => {
        navigate("/menu", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  const getFormaPagoString = (codigo: string) => {
    const code = codigo.toUpperCase();
    if (code === "MERCADOPAGO") return "MercadoPago (Online)";
    if (code === "EFECTIVO") return "Efectivo contra entrega";
    return codigo;
  };

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold">Cargando confirmación...</h3>
          <p className="text-sm text-neutral-400">Si no se carga, te redirigimos al menú.</p>
        </div>
      </div>
    );
  }

  const isMercadoPago = pedido.forma_pago_codigo.toUpperCase() === "MERCADOPAGO";

  return (
    <div className="min-h-screen bg-[#080808] text-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative bg-[#0E0E0E]/80 border border-white/5 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8 overflow-hidden text-center"
        >
          {/* Acento de fondo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icono de éxito animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
            className="w-20 h-20 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={44} className="stroke-[1.5]" />
          </motion.div>

          {/* Textos principales */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              ¡Pedido Confirmado!
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              ¡Buenísimo, loco! Tu pedido ha sido ingresado al sistema. En breve nos ponemos a cocinar tu comida favorita.
            </p>
          </div>

          {/* Detalles del Pedido */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 text-left space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Número de Pedido</span>
              <span className="text-sm font-bold text-white">#{pedido.id}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <Calendar size={15} />
                <span>Fecha</span>
              </div>
              <span className="font-semibold text-white">
                {new Date(pedido.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <CreditCard size={15} />
                <span>Forma de Pago</span>
              </div>
              <span className="font-semibold text-neutral-200">
                {getFormaPagoString(pedido.forma_pago_codigo)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <Truck size={15} />
                <span>Envío estimado</span>
              </div>
              <span className="font-semibold text-orange-400">30 - 45 min</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-base font-bold text-white">Importe Total</span>
              <span className="text-lg font-black text-orange-500">
                {formatCurrency(pedido.total)}
              </span>
            </div>

          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            {isMercadoPago && (
              <button
                onClick={() => {
                  toast.info("Redirigiendo a la pasarela de pagos simulada...");
                  // Aquí se puede redirigir al link de mercadopago real si el backend lo devuelve,
                  // o bien simular el flujo exitoso.
                }}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer text-sm uppercase tracking-wider"
              >
                Pagar con MercadoPago
                <ArrowRight size={15} />
              </button>
            )}

            <button
              onClick={() => navigate("/menu")}
              className={`w-full py-3.5 ${
                isMercadoPago
                  ? "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                  : "bg-white hover:bg-neutral-200 text-black shadow-lg"
              } font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider`}
            >
              <ShoppingBag size={15} />
              Seguir Comprando
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
