import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, Clock, ShoppingBag, CreditCard, Calendar, Truck, ArrowRight } from "lucide-react";
import type { PedidoResponse } from "@/features/checkout/types/checkout.types";
import { obtenerPedido, iniciarPago } from "@/features/checkout/services/checkoutService";
import { toast } from "sonner";

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const statePedido = location.state?.pedido as PedidoResponse;
    
    // Parsear parámetros de Mercado Pago de la URL
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const externalReference = params.get("external_reference");

    if (status) {
      setPaymentStatus(status);
    }

    if (statePedido) {
      setPedido(statePedido);
    } else if (externalReference && externalReference.startsWith("pedido_")) {
      const pedidoId = parseInt(externalReference.replace("pedido_", ""), 10);
      if (!isNaN(pedidoId)) {
        setIsLoadingOrder(true);
        obtenerPedido(pedidoId)
          .then((data) => {
            setPedido(data);
          })
          .catch((err) => {
            console.error("Error al cargar el pedido desde referencia externa:", err);
            toast.error("No pudimos cargar el detalle de tu pedido.");
            navigate("/menu", { replace: true });
          })
          .finally(() => {
            setIsLoadingOrder(false);
          });
      }
    } else {
      // Si no hay datos del pedido ni referencia en la URL, redirige al menú tras un instante
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

  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!pedido) return;
    setIsPaying(true);
    try {
      toast.loading("Iniciando pago con Mercado Pago...", { id: "pago-success-loading" });
      const paymentInit = await iniciarPago(pedido.id);
      toast.dismiss("pago-success-loading");
      toast.success("Redirigiendo a Mercado Pago...");
      window.location.href = paymentInit.init_point;
    } catch (err: any) {
      console.error("Error al iniciar pago desde success:", err);
      toast.dismiss("pago-success-loading");
      toast.error("No se pudo conectar con Mercado Pago. Por favor, intentá de nuevo.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoadingOrder || !pedido) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold">
            {isLoadingOrder ? "Buscando detalles del pedido..." : "Cargando confirmación..."}
          </h3>
          <p className="text-sm text-neutral-400">
            {isLoadingOrder ? "Esperá un segundo por favor." : "Si no se carga, te redirigimos al menú."}
          </p>
        </div>
      </div>
    );
  }

  const isMercadoPago = pedido.forma_pago_codigo.toUpperCase() === "MERCADOPAGO";

  // Determinar los detalles visuales de la página según el estado de pago
  let statusIcon = <CheckCircle2 size={44} className="stroke-[1.5]" />;
  let statusColorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
  let statusTitle = "¡Pedido Confirmado!";
  let statusMessage = "¡Buenísimo, loco! Tu pedido ha sido ingresado al sistema. En breve nos ponemos a cocinar tu comida favorita.";
  let showPaymentButton = isMercadoPago && pedido.estado_codigo === "PENDIENTE";

  if (isMercadoPago) {
    if (paymentStatus === "approved" || pedido.estado_codigo !== "PENDIENTE") {
      statusIcon = <CheckCircle2 size={44} className="stroke-[1.5]" />;
      statusColorClass = "text-green-500 bg-green-500/10 border-green-500/20";
      statusTitle = "¡Pago Aprobado!";
      statusMessage = "¡Buenísimo, loco! Tu pago fue aprobado de manera segura por Mercado Pago. Tu pedido ya está en camino a la cocina.";
      showPaymentButton = false;
    } else if (paymentStatus === "pending") {
      statusIcon = <Clock size={44} className="stroke-[1.5]" />;
      statusColorClass = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      statusTitle = "Pago Pendiente";
      statusMessage = "El pago está en proceso de acreditación por Mercado Pago. Apenas se confirme, comenzaremos a cocinar tu pedido.";
      showPaymentButton = true;
    } else if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
      statusIcon = <AlertCircle size={44} className="stroke-[1.5]" />;
      statusColorClass = "text-red-500 bg-red-500/10 border-red-500/20";
      statusTitle = "Pago Rechazado";
      statusMessage = "No pudimos procesar tu pago. Podés volver a intentar pagar a continuación con otra tarjeta o medio de pago.";
      showPaymentButton = true;
    } else {
      statusIcon = <CreditCard size={44} className="stroke-[1.5]" />;
      statusColorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      statusTitle = "Pedido Registrado";
      statusMessage = "¡Buenísimo, loco! Tu pedido fue registrado. Para confirmarlo de inmediato, completá el pago online con Mercado Pago a continuación.";
      showPaymentButton = true;
    }
  }

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
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border ${statusColorClass}`}
          >
            {statusIcon}
          </motion.div>

          {/* Textos principales */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {statusTitle}
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {statusMessage}
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
            {showPaymentButton && (
              <button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer text-sm uppercase tracking-wider animate-bounce"
              >
                {isPaying ? "Conectando..." : "Pagar con MercadoPago"}
                <ArrowRight size={15} />
              </button>
            )}

            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 cursor-pointer text-sm uppercase tracking-wider"
            >
              Volver a la Página Principal
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
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
