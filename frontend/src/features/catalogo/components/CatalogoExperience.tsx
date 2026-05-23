import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";

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

export function CatalogoExperience() {
  const { addItem } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar las categorías del local al montar el componente
  useEffect(() => {
    getActiveCategorias()
      .then(setCategorias)
      .catch((err) => console.error("Error al obtener categorias:", err));
  }, []);

  // Consultar productos del backend de forma reactiva con TanStack/Server-state reactivo
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const prodsFetched = await getActiveProductos(selectedCategoriaId, searchQuery);
        setProductos(prodsFetched);
      } catch (err: any) {
        console.error(err);
        setError("No se pudo cargar el catálogo de productos. Intentá de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 250); // Debounce de 250ms para evitar spam al escribir

    return () => clearTimeout(timer);
  }, [selectedCategoriaId, searchQuery]);

  const accentColor = ACCENT_COLORS["platos"]; // Naranja magma gourmet
  const bgTint = BG_TINTS["platos"];

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

        {/* Filtros: Categorías y Búsqueda */}
        <div className="mb-12 space-y-6">
          {/* Barra de Búsqueda Premium */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F8F8F8]/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué tenés ganas de comer hoy, loco?..."
              className="w-full pl-12 pr-12 py-4 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/30 rounded-2xl text-white text-sm outline-none transition-all placeholder:text-neutral-600 shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Selector de Categorías (Tabs Horizontales) */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            <button
              onClick={() => setSelectedCategoriaId(undefined)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
              className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoriaId === undefined
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/10"
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoriaId(cat.id)}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
                className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoriaId === cat.id
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/10"
                    : "bg-white/[0.02] hover:bg-white/[0.04] border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Carga e indicadores de error */}
        {isLoading ? (
          <div className="space-y-8">
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
            {/* Listado de Productos */}
            <AnimatePresence mode="wait">
              <motion.div
                key="catalog-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-0 min-h-[300px]"
              >
                {productos.length > 0 ? (
                  productos.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      accentColor={accentColor}
                      onClick={() => setSelectedProducto(producto)}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 border border-white/5 bg-white/[0.01] rounded-3xl">
                    <p className="text-[#F8F8F8]/30 font-mono text-sm">
                      No hay productos que coincidan con la búsqueda o categoría.
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
