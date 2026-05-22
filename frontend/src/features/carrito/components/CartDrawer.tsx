import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../hooks/useCart";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Info } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    totalPrecio,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Bloquear el scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay de fondo con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[300] bg-[#000000]/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Panel Lateral Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[300] h-full w-full sm:w-[480px] bg-[#0E0E0E]/95 border-l border-white/5 shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Cabecera */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Tu Pedido</h2>
                  <p className="text-xs text-neutral-400">
                    {items.length} {items.length === 1 ? "producto seleccionado" : "productos seleccionados"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido (Listado) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                /* Empty State Premium */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-4">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
                    <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-full flex items-center justify-center text-neutral-500 relative">
                      <ShoppingBag size={36} className="stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">¿Con hambre, loco?</h3>
                    <p className="text-sm text-neutral-400 max-w-[280px] leading-relaxed">
                      Tu carrito de compras está vacío en este momento. ¡Explorá la carta y agregá tus platos favoritos!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all text-sm cursor-pointer shadow-lg shadow-white/5"
                  >
                    Explorar la Carta
                  </button>
                </div>
              ) : (
                /* Items List */
                <div className="space-y-4">
                  {items.map((item) => {
                    const stockMaximo = item.producto.stock_cantidad ?? 999;
                    
                    // Encontrar ingredientes removidos para mostrarlos como etiquetas "Sin ..."
                    const ingredientesExcluidos = item.personalizacion
                      .map((excluidoId) => {
                        const prodIng = item.producto.ingredientes.find(
                          (pi) => pi.ingrediente_id === excluidoId
                        );
                        return prodIng?.ingrediente?.nombre;
                      })
                      .filter(Boolean);

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-4 items-start relative hover:border-white/10 transition-all"
                      >
                        {/* Imagen de Producto */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-white/5 flex-shrink-0">
                          {item.producto.imagenes_url && item.producto.imagenes_url[0] ? (
                            <img
                              src={item.producto.imagenes_url[0]}
                              alt={item.producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-500/5 text-orange-500 font-bold text-lg">
                              {item.producto.nombre.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-white text-sm sm:text-base leading-tight truncate">
                                {item.producto.nombre}
                              </h4>
                              <span className="font-bold text-sm text-neutral-200">
                                {formatCurrency(item.producto.precio_base * item.cantidad)}
                              </span>
                            </div>

                            {/* Mostrar exclusiones */}
                            {ingredientesExcluidos.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {ingredientesExcluidos.map((ing, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/10 text-[10px] font-medium rounded-md"
                                  >
                                    Sin {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Controles de cantidad y Eliminar */}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.03]">
                            <div className="flex items-center gap-1.5 bg-neutral-950 border border-white/5 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                                disabled={item.cantidad <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold text-white">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                                disabled={item.cantidad >= stockMaximo}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
                              title="Eliminar del pedido"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Advertencia de stock límite */}
                          {item.cantidad >= stockMaximo && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-500/80">
                              <Info size={10} />
                              <span>Máximo disponible en cocina ({stockMaximo} un.)</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie de Pedido (Checkout) */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-white/[0.01] backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-neutral-400 text-sm font-medium">Subtotal</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {formatCurrency(totalPrecio)}
                    </span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">IVA e impuestos incluidos</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <button
                    onClick={clearCart}
                    className="col-span-1 p-3.5 bg-neutral-900 border border-white/5 text-neutral-400 hover:text-red-400 hover:border-red-500/20 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                    title="Vaciar carrito"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/checkout");
                    }}
                    className="col-span-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 tracking-wide cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-orange-500/10"
                  >
                    <span>Iniciar Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
