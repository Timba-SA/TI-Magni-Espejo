import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Lock } from "lucide-react";
import type { Producto } from "../types/catalogo.types";

interface ProductDetailModalProps {
  producto: Producto;
  accentColor: string;
  onClose: () => void;
  onConfirm: (excluidosIds: number[]) => void;
}

export function ProductDetailModal({
  producto,
  accentColor,
  onClose,
  onConfirm,
}: ProductDetailModalProps) {
  // Estado para ingredientes excluidos (IDs de ingredientes que el usuario decide remover)
  const [excluidos, setExcluidos] = useState<number[]>([]);

  const handleToggleIngrediente = (ingredienteId: number) => {
    setExcluidos((prev) =>
      prev.includes(ingredienteId)
        ? prev.filter((id) => id !== ingredienteId)
        : [...prev, ingredienteId]
    );
  };

  const handleAgregar = () => {
    onConfirm(excluidos);
  };

  const ingredientesRemovibles = producto.ingredientes?.filter((i) => i.es_removible) || [];
  const ingredientesFijos = producto.ingredientes?.filter((i) => !i.es_removible) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-[#000]/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        className="relative bg-[#121212]/90 border border-[#F8F8F8]/[0.08] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
      >
        {/* Imagen del plato o fallback premium */}
        <div className="relative h-48 md:h-56 w-full bg-gradient-to-br from-[#1c1c1c] to-[#0d0d0d] flex items-center justify-center overflow-hidden border-b border-[#F8F8F8]/[0.06]">
          {producto.imagenes_url && producto.imagenes_url.length > 0 ? (
            <img
              src={producto.imagenes_url[0]}
              alt={producto.nombre}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="text-center p-4">
              <span
                className="text-7xl font-light opacity-10"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {producto.nombre.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-[#F8F8F8]/70 hover:text-white flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            ×
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          <div>
            <h3
              className="text-3xl font-bold text-[#F8F8F8] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {producto.nombre}
            </h3>
            <p className="text-[#F8F8F8]/60 text-sm mt-2 leading-relaxed">
              {producto.descripcion || "Sin descripción."}
            </p>
          </div>

          {/* Sección de ingredientes */}
          {producto.ingredientes && producto.ingredientes.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-[#F8F8F8]/40 border-b border-[#F8F8F8]/[0.06] pb-2">
                Personalizá tu plato
              </h4>

              {/* Ingredientes removibles (los que el cliente puede sacar) */}
              {ingredientesRemovibles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-[#F8F8F8]/50 mb-3">
                    Hacé click para remover ingredientes si lo preferís:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ingredientesRemovibles.map((pi) => {
                      const ingrediente = pi.ingrediente;
                      if (!ingrediente) return null;
                      const estaExcluido = excluidos.includes(ingrediente.id);

                      return (
                        <button
                          key={ingrediente.id}
                          onClick={() => handleToggleIngrediente(ingrediente.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-2 ${
                            estaExcluido
                              ? "border-red-500/30 bg-red-950/20 text-red-400 line-through"
                              : "border-white/10 bg-white/[0.03] text-[#F8F8F8]/80 hover:border-white/30"
                          }`}
                        >
                          <span>{ingrediente.nombre}</span>
                          {estaExcluido ? (
                            <X size={10} />
                          ) : (
                            <Check size={10} className="text-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ingredientes esenciales (los que no se pueden sacar) */}
              {ingredientesFijos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-[#F8F8F8]/30">
                    Ingredientes esenciales (no modificables):
                  </p>
                  <div className="flex flex-wrap gap-2 opacity-50">
                    {ingredientesFijos.map((pi) => {
                      const ingrediente = pi.ingrediente;
                      if (!ingrediente) return null;

                      return (
                        <div
                          key={ingrediente.id}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/5 bg-white/[0.01] text-[#F8F8F8]/40 flex items-center gap-1.5 cursor-not-allowed"
                        >
                          <span>{ingrediente.nombre}</span>
                          <Lock size={9} className="opacity-60" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Cierre de compra */}
        <div className="p-6 bg-[#0B0B0B]/90 border-t border-[#F8F8F8]/[0.06] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono tracking-wider text-[#F8F8F8]/30 uppercase">
              Precio Total
            </p>
            <p className="text-3xl font-bold font-mono" style={{ color: accentColor }}>
              ${Number(producto.precio_base).toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleAgregar}
            className="flex-1 max-w-[200px] h-12 rounded-xl text-black font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-black active:scale-95 flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            Agregar al Pedido
          </button>
        </div>
      </motion.div>
    </div>
  );
}
