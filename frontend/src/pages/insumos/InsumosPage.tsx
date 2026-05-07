import { useState, useMemo, useEffect } from "react";
import { Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsumoStats } from "@/features/insumos/components/InsumoStats";
import { InsumoFilters } from "@/features/insumos/components/InsumoFilters";
import { InsumosTable } from "@/features/insumos/components/InsumosTable";
import { InsumoForm } from "@/features/insumos/components/InsumoForm";
import { InsumoDetailModal } from "@/features/insumos/components/InsumoDetailModal";
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  bajaLogicaInsumo,
  reactivarInsumo,
} from "@/features/insumos/services/insumosService";
import { usePagination } from "@/hooks/usePagination";
import { exportInsumosToExcel } from "@/utils/exportExcel";
import type {
  Insumo,
  InsumoFiltersState,
  InsumoFormData,
} from "@/features/insumos/types/insumo.types";

const EMPTY_FILTERS: InsumoFiltersState = {
  search: "",
  categoria: "",
  estado: "",
  soloStockBajo: false,
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Componente de controles de paginación ────────────────────────────────────
interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (p: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onGoTo,
  onPageSizeChange,
}: PaginationControlsProps) {
  // Genera los números de página a mostrar (max 5 botones)
  const pages = useMemo(() => {
    const arr: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
      if (page < totalPages - 2) arr.push("...");
      arr.push(totalPages);
    }
    return arr;
  }, [page, totalPages]);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
      style={{ borderTop: "1px solid rgba(248,248,248,0.05)" }}
    >
      {/* Rows per page + total */}
      <div className="flex items-center gap-3">
        <span
          className="text-[9px] tracking-[0.35em] uppercase"
          style={{ color: "rgba(248,248,248,0.25)", fontFamily: "'Space Mono', monospace" }}
        >
          Filas
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs rounded px-2 py-1 outline-none"
          style={{
            background: "#111111",
            border: "1px solid rgba(248,248,248,0.1)",
            color: "rgba(248,248,248,0.6)",
          }}
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span
          className="text-[9px] tracking-wider"
          style={{ color: "rgba(248,248,248,0.2)", fontFamily: "'Space Mono', monospace" }}
        >
          {totalItems} registros
        </span>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors disabled:opacity-25"
          style={{ color: "rgba(248,248,248,0.5)" }}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-7 h-7 flex items-center justify-center text-xs"
              style={{ color: "rgba(248,248,248,0.2)" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onGoTo(p as number)}
              className="w-7 h-7 flex items-center justify-center text-xs rounded transition-all"
              style={{
                background: p === page ? "rgba(255,90,0,0.15)" : "transparent",
                color: p === page ? "#FF5A00" : "rgba(248,248,248,0.4)",
                border: p === page ? "1px solid rgba(255,90,0,0.3)" : "1px solid transparent",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors disabled:opacity-25"
          style={{ color: "rgba(248,248,248,0.5)" }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Modal de confirmación de baja lógica ─────────────────────────────────────
interface ConfirmBajaModalProps {
  insumo: Insumo;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmBajaModal({ insumo, onConfirm, onCancel }: ConfirmBajaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div
        className="max-w-sm w-full p-8 shadow-2xl"
        style={{
          background: "#111111",
          border: "1px solid rgba(248,248,248,0.08)",
        }}
      >
        {/* Top accent */}
        <div style={{ height: 2, background: "#C1121F", opacity: 0.7, marginBottom: "1.5rem" }} />

        <p
          className="text-[9px] tracking-[0.45em] uppercase mb-3"
          style={{ color: "rgba(193,18,31,0.6)", fontFamily: "'Space Mono', monospace" }}
        >
          Baja lógica
        </p>

        <h3 className="text-lg font-semibold mb-2" style={{ color: "#E8E8E8", letterSpacing: "-0.01em" }}>
          ¿Dar de baja este insumo?
        </h3>

        <p className="text-sm mb-1" style={{ color: "rgba(248,248,248,0.45)" }}>
          El insumo{" "}
          <span className="font-semibold" style={{ color: "#E8E8E8" }}>
            {insumo.nombre}
          </span>{" "}
          pasará a estado{" "}
          <span className="font-semibold" style={{ color: "#FBBF24" }}>
            Inactivo
          </span>.
        </p>
        <p className="text-xs mb-6" style={{ color: "rgba(248,248,248,0.3)" }}>
          El registro se conserva y puede reactivarse desde la tabla.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            style={{ color: "rgba(248,248,248,0.45)" }}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 border-0 text-white"
            style={{ background: "#C1121F" }}
            onClick={onConfirm}
          >
            Dar de baja
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InsumoFiltersState>(EMPTY_FILTERS);

  useEffect(() => {
    refresh();
  }, []);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bajaOpen, setBajaOpen] = useState(false);

  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [insumoToBaja, setInsumoToBaja] = useState<Insumo | null>(null);

  // ─── Filtrado ──────────────────────────────────────────────────────────────
  const filteredInsumos = useMemo(() => {
    return insumos.filter((insumo) => {
      const matchSearch =
        filters.search === "" ||
        insumo.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        insumo.descripcion.toLowerCase().includes(filters.search.toLowerCase());

      const matchCategoria =
        filters.categoria === "" || insumo.categoria === filters.categoria;

      const matchEstado =
        filters.estado === "" || insumo.estado === filters.estado;

      const matchStockBajo =
        !filters.soloStockBajo || insumo.stockActual <= insumo.stockMinimo;

      return matchSearch && matchCategoria && matchEstado && matchStockBajo;
    });
  }, [insumos, filters]);

  // ─── Paginación ────────────────────────────────────────────────────────────
  const pagination = usePagination(filteredInsumos, 10);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getInsumos();
      setInsumos(data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInsumo(null);
    setFormOpen(true);
  };

  const handleEdit = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setFormOpen(true);
  };

  const handleView = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setDetailOpen(true);
  };

  const handleBajaRequest = (insumo: Insumo) => {
    setInsumoToBaja(insumo);
    setBajaOpen(true);
  };

  const handleConfirmBaja = async () => {
    if (insumoToBaja) {
      await bajaLogicaInsumo(insumoToBaja.id);
      await refresh();
      setInsumoToBaja(null);
      setBajaOpen(false);
    }
  };

  const handleReactivar = async (insumo: Insumo) => {
    await reactivarInsumo(insumo.id);
    await refresh();
  };

  const handleSave = async (data: InsumoFormData) => {
    if (selectedInsumo) {
      await updateInsumo(selectedInsumo.id, data);
    } else {
      await createInsumo(data);
    }
    await refresh();
    setFormOpen(false);
    setSelectedInsumo(null);
  };

  const handleExport = () => {
    exportInsumosToExcel(filteredInsumos);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-[9px] tracking-[0.45em] uppercase mb-1"
            style={{ color: "rgba(248,248,248,0.25)", fontFamily: "'Space Mono', monospace" }}
          >
            Gestión de inventario
          </p>
          <h2
            className="leading-none"
            style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "#E8E8E8",
            }}
          >
            Insumos
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Exportar Excel */}
          <Button
            variant="ghost"
            onClick={handleExport}
            className="gap-2 text-xs h-9"
            style={{ color: "rgba(248,248,248,0.45)", border: "1px solid rgba(248,248,248,0.1)" }}
            title={`Exportar ${filteredInsumos.length} registros a Excel`}
          >
            <Download size={14} />
            <span className="hidden sm:inline">Excel</span>
          </Button>

          {/* Nuevo insumo */}
          <Button
            onClick={handleCreate}
            className="gap-2 text-sm h-9 border-0 text-white"
            style={{ background: "#FF5A00" }}
          >
            <Plus size={15} />
            Nuevo
          </Button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <InsumoStats insumos={insumos} />

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div
        className="p-4"
        style={{
          background: "#0F0F0F",
          border: "1px solid rgba(248,248,248,0.05)",
        }}
      >
        <InsumoFilters filters={filters} onChange={setFilters} />
      </div>

      {/* ── Table container ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#0F0F0F",
          border: "1px solid rgba(248,248,248,0.05)",
        }}
      >
        {/* Table header bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(248,248,248,0.04)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[9px] tracking-[0.45em] uppercase"
              style={{ color: "rgba(248,248,248,0.25)", fontFamily: "'Space Mono', monospace" }}
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
              {filteredInsumos.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Info de paginación */}
            <span
              className="text-[9px] tracking-wider"
              style={{ color: "rgba(248,248,248,0.2)", fontFamily: "'Space Mono', monospace" }}
            >
              Pág. {pagination.page} / {pagination.totalPages}
            </span>
          </div>
        </div>

        {/* Table */}
        <InsumosTable
          insumos={pagination.items}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleBajaRequest}
          onReactivar={handleReactivar}
        />

        {/* Pagination controls */}
        {loading ? (
          <div className="p-8 text-center text-white/50 font-mono text-xs">Cargando datos del servidor...</div>
        ) : pagination.totalPages > 1 || filteredInsumos.length > 5 ? (
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={filteredInsumos.length}
            pageSize={pagination.pageSize}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={pagination.prev}
            onNext={pagination.next}
            onGoTo={pagination.goTo}
            onPageSizeChange={pagination.setPageSize}
          />
        ) : null}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <InsumoForm
        open={formOpen}
        insumo={selectedInsumo}
        onClose={() => { setFormOpen(false); setSelectedInsumo(null); }}
        onSave={handleSave}
      />

      <InsumoDetailModal
        open={detailOpen}
        insumo={selectedInsumo}
        onClose={() => { setDetailOpen(false); setSelectedInsumo(null); }}
      />

      {bajaOpen && insumoToBaja && (
        <ConfirmBajaModal
          insumo={insumoToBaja}
          onConfirm={handleConfirmBaja}
          onCancel={() => { setBajaOpen(false); setInsumoToBaja(null); }}
        />
      )}
    </div>
  );
}

