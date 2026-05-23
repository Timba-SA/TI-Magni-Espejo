import { motion } from "motion/react";
import type { Producto } from "../types/catalogo.types";

interface ProductoCardProps {
  producto: Producto;
  accentColor: string;
  onClick: () => void;
}

export function ProductoCard({ producto, accentColor, onClick }: ProductoCardProps) {
  const esAgotado = !producto.disponible || producto.stock_cantidad <= 0;
  
  const catPrincipal = producto.categorias.find((pc) => pc.es_principal)?.categoria?.nombre 
    || producto.categorias[0]?.categoria?.nombre;

  return (
    <motion.div
      className={`border-t border-[#F8F8F8]/[0.06] py-8 group transition-all duration-300 relative ${
        esAgotado ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={esAgotado ? {} : { x: 8 }}
      onClick={() => {
        if (!esAgotado) {
          onClick();
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {catPrincipal && (
            <span className="text-[9px] tracking-[0.25em] text-[#F8F8F8]/35 uppercase font-mono block mb-2">
              {catPrincipal}
            </span>
          )}
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3
              className="text-3xl md:text-4xl font-bold text-[#F8F8F8] transition-colors duration-300"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {producto.nombre}
            </h3>
            
            {esAgotado && (
              <span className="text-[9px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 border border-red-500/40 text-red-500 bg-red-950/20 rounded">
                Agotado
              </span>
            )}

            {!esAgotado && producto.stock_cantidad <= 3 && (
              <span className="text-[9px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 border border-amber-500/40 text-amber-500 bg-amber-950/20 rounded">
                ¡Últimos {producto.stock_cantidad}!
              </span>
            )}
          </div>
          
          <p className="text-[#F8F8F8]/50 leading-relaxed text-sm max-w-xl mt-2 pr-4">
            {producto.descripcion || "Sin descripción disponible."}
          </p>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <span
            className="text-2xl font-bold font-mono whitespace-nowrap"
            style={{ color: accentColor }}
          >
            ${Number(producto.precio_base).toFixed(2)}
          </span>
          
          {!esAgotado && (
            <motion.span
              className="text-[#F8F8F8]/30 text-xl font-mono"
              whileHover={{ rotate: 90, scale: 1.2, color: accentColor }}
              transition={{ duration: 0.2 }}
            >
              +
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
