import React from "react";
import { useCart } from "@/features/carrito/hooks/useCart";
import { ShoppingBag } from "lucide-react";
import type { TipoEntrega } from "./AddressSelector";

interface CheckoutSummaryProps {
  tipoEntrega: TipoEntrega;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ tipoEntrega }) => {
  const { items, totalPrecio } = useCart();
  const costoEnvio = tipoEntrega === "ENVIO" ? 50 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  // El costo de envío real lo calcula el backend al crear el pedido
  // ($50 con dirección, $0 retiro en local). Acá se muestra como estimado.

  return (
    <div className="bg-[#0E0E0E]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
          <ShoppingBag size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Resumen del Pedido</h3>
          <p className="text-xs text-neutral-400">
            {items.length} {items.length === 1 ? "producto" : "productos"} listo{items.length === 1 ? "" : "s"} para marchar
          </p>
        </div>
      </div>

      {/* Listado de Productos */}
      <div className="max-h-[280px] overflow-y-auto pr-1 space-y-4 scrollbar-thin">
        {items.map((item) => {
          const ingredientesExcluidos = item.personalizacion
            .map((excluidoId) => {
              const prodIng = item.producto.ingredientes?.find(
                (pi) => pi.ingrediente_id === excluidoId
              );
              return prodIng?.ingrediente?.nombre;
            })
            .filter(Boolean);

          return (
            <div
              key={item.id}
              className="flex items-start gap-4 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl transition-all"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-950 border border-white/5 flex-shrink-0">
                {item.producto.imagenes_url && item.producto.imagenes_url[0] ? (
                  <img
                    src={item.producto.imagenes_url[0]}
                    alt={item.producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500/5 text-orange-500 font-bold text-sm">
                    {item.producto.nombre.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">
                  {item.producto.nombre}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Cantidad: {item.cantidad}
                </p>
                {ingredientesExcluidos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ingredientesExcluidos.map((nombre, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/10 rounded-md font-medium"
                      >
                        Sin {nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="font-bold text-sm text-neutral-200">
                  {formatCurrency(Number(item.producto.precio_base) * item.cantidad)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desglose de Precios */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-400">Subtotal</span>
          <span className="font-semibold text-white">{formatCurrency(totalPrecio)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-400">Costo de envío</span>
          {tipoEntrega === "RETIRO" ? (
            <span className="font-semibold text-green-400 text-xs">Gratis</span>
          ) : (
            <span className="font-semibold text-white">{formatCurrency(costoEnvio)}</span>
          )}
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-400">Descuento</span>
          <span className="font-semibold text-green-500">-$ 0,00</span>
        </div>
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <span className="text-base font-bold text-white">Total estimado</span>
          <span className="text-lg font-black text-orange-500">
            {formatCurrency(totalPrecio + costoEnvio)}
          </span>
        </div>
      </div>
    </div>
  );
};
