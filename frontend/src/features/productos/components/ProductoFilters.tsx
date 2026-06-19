import { Search, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductoFiltersState } from "../types/producto.types";
import type { Categoria } from "@/features/categorias/types/categoria.types";

interface ProductoFiltersProps {
  filters: ProductoFiltersState;
  onChange: (filters: ProductoFiltersState) => void;
  categorias: Categoria[];
}

const EMPTY_FILTERS: ProductoFiltersState = {
  search: "",
  categoriaId: "",
  mostrarArchivados: false,
};

export function ProductoFilters({ filters, onChange, categorias }: ProductoFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" || filters.categoriaId !== "" || filters.mostrarArchivados;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--tfs-text-muted)" }}
        />
        <Input
          placeholder="Buscar producto..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 focus-visible:ring-[#FF5A00]/50 h-9 text-sm"
          style={{
            background: "var(--tfs-input-bg)",
            border: "1px solid var(--tfs-input-border)",
            color: "var(--tfs-text-primary)",
          }}
        />
      </div>

      {/* Categoria Filter */}
      <div className="relative min-w-[160px]">
        <select
          value={filters.categoriaId}
          onChange={(e) => onChange({ ...filters, categoriaId: e.target.value })}
          className="h-9 w-full px-3 rounded-md text-sm font-medium border bg-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A00]/50"
          style={{
            background: "var(--tfs-input-bg)",
            borderColor: "var(--tfs-input-border)",
            color: filters.categoriaId ? "var(--tfs-text-primary)" : "var(--tfs-text-muted)",
          }}
        >
          <option value="" style={{ background: "var(--tfs-card-bg)", color: "var(--tfs-text-muted)" }}>
            Todas las categorías
          </option>
          {categorias.map((cat) => (
            <option
              key={cat.id}
              value={cat.id.toString()}
              style={{ background: "var(--tfs-card-bg)", color: "var(--tfs-text-primary)" }}
            >
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar Archivados */}
      <button
        onClick={() => onChange({ ...filters, mostrarArchivados: !filters.mostrarArchivados })}
        className="h-9 px-4 rounded-md text-sm font-medium border transition-all duration-200"
        style={
          filters.mostrarArchivados
            ? { background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", color: "#EF4444" }
            : { background: "var(--tfs-input-bg)", borderColor: "var(--tfs-input-border)", color: "var(--tfs-text-muted)" }
        }
      >
        <Eye size={14} className="inline-block mr-1" />Mostrar archivados
      </button>

      {/* Limpiar */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="h-9 gap-1"
          style={{ color: "var(--tfs-text-muted)" }}
        >
          <X size={14} />
          Limpiar
        </Button>
      )}
    </div>
  );
}
