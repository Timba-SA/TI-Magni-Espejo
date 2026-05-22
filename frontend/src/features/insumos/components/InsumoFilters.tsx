import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IngredienteFiltersState } from "../types/insumo.types";

interface InsumoFiltersProps {
  filters: IngredienteFiltersState;
  onChange: (filters: IngredienteFiltersState) => void;
}

const EMPTY_FILTERS: IngredienteFiltersState = {
  search: "",
  soloAlergenos: false,
  mostrarInactivos: false,
};

export function InsumoFilters({ filters, onChange }: InsumoFiltersProps) {
  const hasActiveFilters = filters.search !== "" || filters.soloAlergenos || filters.mostrarInactivos;

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
          placeholder="Buscar ingrediente..."
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

      {/* Solo alérgenos */}
      <button
        onClick={() => onChange({ ...filters, soloAlergenos: !filters.soloAlergenos })}
        className="h-9 px-4 rounded-md text-sm font-medium border transition-all duration-200"
        style={
          filters.soloAlergenos
            ? { background: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.4)", color: "#FBBF24" }
            : { background: "var(--tfs-input-bg)", borderColor: "var(--tfs-input-border)", color: "var(--tfs-text-muted)" }
        }
      >
        ⚠ Solo alérgenos
      </button>

      {/* Mostrar inactivos */}
      <button
        onClick={() => onChange({ ...filters, mostrarInactivos: !filters.mostrarInactivos })}
        className="h-9 px-4 rounded-md text-sm font-medium border transition-all duration-200"
        style={
          filters.mostrarInactivos
            ? { background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", color: "#EF4444" }
            : { background: "var(--tfs-input-bg)", borderColor: "var(--tfs-input-border)", color: "var(--tfs-text-muted)" }
        }
      >
        👁 Mostrar inactivos
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
