import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { getActiveCategorias, getActiveProductos } from "../services/catalogoService";
import type { Categoria, Producto } from "../types/catalogo.types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ProductoCard } from "./ProductoCard";
import { ProductDetailModal } from "./ProductDetailModal";
import { useCart } from "@/features/carrito/hooks/useCart";

// Colores de acento y degradados basados en la heurística de categoría
const ACCENT_COLORS = {
  platos: "#FF5A00", // Naranja magma
  bebidas: "#C1121F", // Rojo borgoña
  postres: "#D4A574", // Dorado arena
};

const BG_TINTS = {
  platos: "rgba(255,90,0,0.03)",
  bebidas: "rgba(193,18,31,0.03)",
  postres: "rgba(212,165,116,0.03)",
};

function getCategoryTheme(nombre: string): "platos" | "bebidas" | "postres" {
  const norm = nombre.toLowerCase();
  if (norm.includes("bebida") || norm.includes("trago") || norm.includes("cafe") || norm.includes("café")) {
    return "bebidas";
  }
  if (norm.includes("postre") || norm.includes("dulce") || norm.includes("helado") || norm.includes("tarta")) {
    return "postres";
  }
  return "platos"; // Especiales y Platos principales por defecto
}

export function CatalogoExperience() {
  const { addItem } = useCart();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [catsFetched, prodsFetched] = await Promise.all([
          getActiveCategorias(),
          getActiveProductos(),
        ]);

        setCategorias(catsFetched);
        setProductos(prodsFetched);

        // Seleccionar la primera categoría por defecto si existen
        if (catsFetched.length > 0) {
          setActiveCatId(catsFetched[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError("No se pudo cargar el catálogo de productos. Intentá de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const activeCategory = categorias.find((c) => c.id === activeCatId);
  const theme = activeCategory ? getCategoryTheme(activeCategory.nombre) : "platos";
  const accentColor = ACCENT_COLORS[theme];
  const bgTint = BG_TINTS[theme];

  // Filtramos productos que pertenecen a la categoría activa
  const productosFiltrados = productos.filter((prod) =>
    prod.categorias.some((pc) => pc.categoria_id === activeCatId)
  );

  const handleConfirmAddToPedido = (excluidosIds: number[]) => {
    if (!selectedProducto) return;

    addItem(selectedProducto, 1, excluidosIds);
    setSelectedProducto(null);
  };

  return (
    <div
      className="relative min-h-screen py-24 transition-colors duration-700 select-none"
      style={{
        backgroundColor: "#0B0B0B",
        background: `linear-gradient(180deg, #0B0B0B 0%, ${bgTint} 100%)`,
      }}
    >
      {/* Grain visual filter */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-4xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="mb-16 relative pl-6">
          <motion.div
            className="absolute left-0 top-0 w-[3px] h-full"
            style={{ background: accentColor, transformOrigin: "top" }}
            animate={{ scaleY: [0, 1] }}
            key={activeCatId}
            transition={{ duration: 0.6 }}
          />
          <p className="text-xs tracking-[0.4em] text-[#F8F8F8]/30 uppercase font-mono mb-5">
            — La Carta Premium
          </p>
          <h2
            className="text-[4rem] md:text-[6rem] leading-[0.88] font-bold text-[#F8F8F8] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nuestra
            <br />
            <span className="italic font-light text-[#F8F8F8]/40">propuesta.</span>
          </h2>
        </div>

        {/* Carga e indicadores de error */}
        {isLoading ? (
          <div className="space-y-8">
            {/* Category Skeleton */}
            <div className="flex gap-8 mb-16 border-b border-[#F8F8F8]/[0.06] pb-1 animate-pulse">
              <div className="h-6 w-24 bg-[#F8F8F8]/[0.08] rounded" />
              <div className="h-6 w-24 bg-[#F8F8F8]/[0.08] rounded" />
              <div className="h-6 w-24 bg-[#F8F8F8]/[0.08] rounded" />
            </div>
            <LoadingSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/[0.01]">
            <p className="text-[#F8F8F8]/60 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-white/20 text-[#F8F8F8]/80 hover:bg-white/10 text-xs font-mono tracking-widest uppercase transition-all duration-300 rounded"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Pestañas de Categorías */}
            {categorias.length > 0 ? (
              <div className="relative flex gap-8 mb-16 border-b border-[#F8F8F8]/[0.06] pb-1 overflow-x-auto scrollbar-none">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCatId(cat.id)}
                    className="relative pb-3 text-sm font-mono tracking-[0.2em] uppercase transition-colors duration-300 whitespace-nowrap cursor-pointer"
                    style={{
                      color: activeCatId === cat.id ? accentColor : "rgba(248,248,248,0.3)",
                    }}
                  >
                    {cat.nombre}
                    {activeCatId === cat.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: accentColor }}
                        layoutId="tab-underline"
                        transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#F8F8F8]/30 font-mono text-sm">No hay categorías activas.</p>
              </div>
            )}

            {/* Listado de Productos */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCatId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-0 min-h-[300px]"
              >
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      accentColor={accentColor}
                      onClick={() => setSelectedProducto(producto)}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 border-t border-[#F8F8F8]/[0.06]">
                    <p className="text-[#F8F8F8]/30 font-mono text-sm">
                      No hay productos disponibles en esta categoría.
                    </p>
                  </div>
                )}
                <div className="border-t border-[#F8F8F8]/[0.06]" />
              </motion.div>
            </AnimatePresence>

            {/* Nota informativa al pie */}
            <motion.p
              className="mt-16 text-[10px] tracking-[0.35em] text-[#F8F8F8]/20 uppercase font-mono text-center leading-loose"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Precios en dólares · Alérgenos disponibles a pedido · Menú sujeto a disponibilidad
            </motion.p>
          </>
        )}
      </div>

      {/* Modal de Detalle Interactiva */}
      <AnimatePresence>
        {selectedProducto && (
          <ProductDetailModal
            producto={selectedProducto}
            accentColor={accentColor}
            onClose={() => setSelectedProducto(null)}
            onConfirm={handleConfirmAddToPedido}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
