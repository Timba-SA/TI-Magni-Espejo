import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductoFilters } from "@/features/productos/components/ProductoFilters";
import { ProductosTable } from "@/features/productos/components/ProductosTable";
import { ProductoForm } from "@/features/productos/components/ProductoForm";
import { ProductoDetailModal } from "@/features/productos/components/ProductoDetailModal";
import {
  useProductosQuery,
  useProductoCreateMutation,
  useProductoUpdateMutation,
  useProductoDeleteMutation,
  useProductoReactivateMutation,
  useProductoToggleAvailabilityMutation,
} from "@/features/productos/hooks/useProductosQuery";
import { getCategorias } from "@/features/categorias/services/categoriasService";
import { getInsumos, getUnidadesMedida } from "@/features/insumos/services/insumosService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { getCurrentUser } from "@/features/auth/services/authService";
import type {
  Producto,
  ProductoFormData,
  ProductoFiltersState,
} from "@/features/productos/types/producto.types";
import type { Categoria } from "@/features/categorias/types/categoria.types";
import type { Ingrediente, UnidadMedida } from "@/features/insumos/types/insumo.types";

const EMPTY_FILTERS: ProductoFiltersState = {
  search: "",
  categoriaId: "",
  mostrarArchivados: false,
};

// ─── Modal de confirmación de archivado ───────────────────────────────────────
function ConfirmArchiveModal({
  producto,
  onConfirm,
  onCancel,
}: {
  producto: Producto;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div
        className="max-w-sm w-full p-8 shadow-2xl"
        style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-mid)" }}
      >
        <div style={{ height: 2, background: "#C1121F", opacity: 0.7, marginBottom: "1.5rem" }} />
        <p className="text-[9px] tracking-[0.45em] uppercase mb-3" style={{ color: "rgba(193,18,31,0.6)", fontFamily: "'Space Mono', monospace" }}>
          Archivar producto
        </p>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--tfs-text-heading)", letterSpacing: "-0.01em" }}>
          ¿Archivar este producto?
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--tfs-text-muted)" }}>
          Se dará de baja lógicamente{" "}
          <span className="font-semibold" style={{ color: "var(--tfs-text-heading)" }}>{producto.nombre}</span>.
          Dejará de estar disponible en el catálogo público de manera inmediata.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" style={{ color: "var(--tfs-text-muted)" }} onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="flex-1 border-0 text-white" style={{ background: "#C1121F" }} onClick={onConfirm}>
            Archivar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal de Productos ───────────────────────────────────────────
export function ProductosPage() {
  const user = getCurrentUser();
  const isAdmin = user?.roles?.includes("ADMIN") ?? user?.rol === "ADMIN";

  // Form lookup data (loaded once — not reactive, only needed for dropdowns)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [insumos, setInsumos] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(true);

  const [filters, setFilters] = useState<ProductoFiltersState>(EMPTY_FILTERS);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productoToArchive, setProductoToArchive] = useState<Producto | null>(null);

  // Pagination
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);

  // Reactive product list via TanStack Query
  const { data: productos = [], isLoading: productosLoading } = useProductosQuery();

  // Mutations
  const createMutation = useProductoCreateMutation();
  const updateMutation = useProductoUpdateMutation();
  const deleteMutation = useProductoDeleteMutation();
  const reactivateMutation = useProductoReactivateMutation();
  const toggleAvailabilityMutation = useProductoToggleAvailabilityMutation();

  // Load form lookup data once on mount
  useEffect(() => {
    async function loadFormData() {
      setFormDataLoading(true);
      try {
        const [catsResult, insResult, unisResult] = await Promise.allSettled([
          getCategorias(0, 100),
          getInsumos(0, 100, "", false, false),
          getUnidadesMedida(),
        ]);

        if (catsResult.status === "fulfilled") setCategorias(catsResult.value.items);
        else console.error("Error cargando categorías:", catsResult.reason);

        if (insResult.status === "fulfilled") setInsumos(insResult.value.items);
        else console.error("Error cargando insumos:", insResult.reason);

        if (unisResult.status === "fulfilled") setUnidades(unisResult.value);
        else console.error("Error cargando unidades:", unisResult.reason);
      } finally {
        setFormDataLoading(false);
      }
    }
    loadFormData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setSkip(0);
  }, [filters.search, filters.categoriaId, filters.mostrarArchivados]);

  const filteredProductos = useMemo(() => {
    return productos.filter((prod) => {
      const esArchivado = prod.deleted_at !== null;
      if (!filters.mostrarArchivados && esArchivado) return false;

      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesNombre = prod.nombre.toLowerCase().includes(query);
        const matchesDesc = prod.descripcion?.toLowerCase().includes(query) ?? false;
        const matchesId = prod.id.toString() === query;
        if (!matchesNombre && !matchesDesc && !matchesId) return false;
      }

      if (filters.categoriaId) {
        const catId = Number(filters.categoriaId);
        if (!prod.categorias.some((c) => c.categoria_id === catId)) return false;
      }

      return true;
    });
  }, [productos, filters]);

  const paginatedProductos = useMemo(
    () => filteredProductos.slice(skip, skip + limit),
    [filteredProductos, skip, limit]
  );

  const loading = productosLoading || formDataLoading;

  // Handlers
  const handleCreate = () => { setSaveError(null); setSelectedProducto(null); setFormOpen(true); };
  const handleEdit = (prod: Producto) => { setSaveError(null); setSelectedProducto(prod); setFormOpen(true); };
  const handleView = (prod: Producto) => { setSelectedProducto(prod); setDetailOpen(true); };
  const handleArchiveRequest = (prod: Producto) => { setProductoToArchive(prod); setArchiveOpen(true); };

  const handleConfirmArchive = async () => {
    if (productoToArchive) {
      try {
        await deleteMutation.mutateAsync(productoToArchive.id);
      } catch (err) {
        console.error("Error archivando producto:", err);
      }
      setProductoToArchive(null);
      setArchiveOpen(false);
    }
  };

  const handleReactivate = async (prod: Producto) => {
    try {
      await reactivateMutation.mutateAsync(prod.id);
    } catch (err) {
      console.error("Error reactivando producto:", err);
    }
  };

  const handleToggleAvailability = async (prod: Producto) => {
    try {
      await toggleAvailabilityMutation.mutateAsync({ id: prod.id, disponible: !prod.disponible });
    } catch (err) {
      console.error("Error toggling disponibilidad:", err);
    }
  };

  const handleSave = async (formData: ProductoFormData) => {
    setSaveError(null);
    try {
      if (selectedProducto) {
        const updated = await updateMutation.mutateAsync({ id: selectedProducto.id, data: formData });
        if (!updated) throw new Error("No se pudo actualizar el producto");
      } else {
        await createMutation.mutateAsync(formData);
      }
      setFormOpen(false);
      setSelectedProducto(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar el producto";
      setSaveError(msg);
      console.error("Error al guardar producto:", err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <BackToDashboard />

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[9px] tracking-[0.45em] uppercase mb-1"
            style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace" }}
          >
            Panel de administración
          </p>
          <h2
            className="leading-none"
            style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "var(--tfs-text-heading)",
            }}
          >
            Productos & Recetas
          </h2>
        </div>

        {isAdmin && (
          <Button
            onClick={handleCreate}
            className="gap-2 text-sm h-9 border-0 text-white flex-shrink-0"
            style={{ background: "#FF5A00" }}
          >
            <Plus size={15} />
            Nuevo
          </Button>
        )}
      </div>

      {/* Filters */}
      <div
        className="p-4"
        style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}
      >
        <ProductoFilters filters={filters} onChange={setFilters} categorias={categorias} />
      </div>

      {/* Table Container */}
      <div style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}>
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--tfs-divider)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] tracking-[0.45em] uppercase"
              style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace" }}
            >
              Resultados
            </span>
            <span
              className="text-[9px] font-mono px-2 py-0.5"
              style={{
                background: "rgba(255,90,0,0.1)",
                color: "rgba(255,90,0,0.7)",
                border: "1px solid rgba(255,90,0,0.2)",
              }}
            >
              {filteredProductos.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-white/50 font-mono text-xs">
            Cargando productos...
          </div>
        ) : (
          <>
            <ProductosTable
              productos={paginatedProductos}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleArchiveRequest}
              onReactivate={handleReactivate}
              onToggleAvailability={handleToggleAvailability}
              isAdmin={isAdmin}
            />

            <div className="p-4" style={{ borderTop: "1px solid var(--tfs-divider)" }}>
              <DataTablePagination
                skip={skip}
                limit={limit}
                total={filteredProductos.length}
                onPageChange={setSkip}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setSkip(0);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <ProductoForm
        open={formOpen}
        producto={selectedProducto}
        categorias={categorias}
        insumos={insumos}
        unidades={unidades}
        onClose={() => { setFormOpen(false); setSelectedProducto(null); setSaveError(null); }}
        onSave={handleSave}
        serverError={saveError}
      />

      <ProductoDetailModal
        open={detailOpen}
        producto={selectedProducto}
        onClose={() => { setDetailOpen(false); setSelectedProducto(null); }}
      />

      {archiveOpen && productoToArchive && (
        <ConfirmArchiveModal
          producto={productoToArchive}
          onConfirm={handleConfirmArchive}
          onCancel={() => { setArchiveOpen(false); setProductoToArchive(null); }}
        />
      )}
    </div>
  );
}
