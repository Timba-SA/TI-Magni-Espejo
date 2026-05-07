import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InsumoFiltersState } from "../types/insumo.types";
import { CATEGORIAS_INSUMO } from "../types/insumo.types";

interface InsumoFiltersProps {
  filters: InsumoFiltersState;
  onChange: (filters: InsumoFiltersState) => void;
}

const EMPTY_FILTERS: InsumoFiltersState = {
  search: "",
  categoria: "",
  estado: "",
  soloStockBajo: false,
};

export function InsumoFilters({ filters, onChange }: InsumoFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.categoria !== "" ||
    filters.estado !== "" ||
    filters.soloStockBajo;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8F8F8]/30"
        />
        <Input
          placeholder="Buscar insumo..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 bg-[#111111] border-[#F8F8F8]/10 text-[#F8F8F8] placeholder:text-[#F8F8F8]/25 focus-visible:ring-[#FF5A00]/50 h-9 text-sm"
        />
      </div>

      {/* Categoría */}
      <Select
        value={filters.categoria || "all"}
        onValueChange={(v) =>
          onChange({ ...filters, categoria: v === "all" ? "" : v })
        }
      >
        <SelectTrigger className="w-[170px] bg-[#111111] border-[#F8F8F8]/10 text-sm text-[#F8F8F8] h-9 focus:ring-[#FF5A00]/50">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent className="bg-[#111111] border-[#F8F8F8]/10">
          <SelectItem value="all" className="text-[#F8F8F8]/60 text-sm">
            Todas las categorías
          </SelectItem>
          {CATEGORIAS_INSUMO.map((cat) => (
            <SelectItem
              key={cat}
              value={cat}
              className="text-[#F8F8F8] text-sm"
            >
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Estado */}
      <Select
        value={filters.estado || "all"}
        onValueChange={(v) =>
          onChange({ ...filters, estado: v === "all" ? "" : v })
        }
      >
        <SelectTrigger className="w-[130px] bg-[#111111] border-[#F8F8F8]/10 text-sm text-[#F8F8F8] h-9 focus:ring-[#FF5A00]/50">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="bg-[#111111] border-[#F8F8F8]/10">
          <SelectItem value="all" className="text-[#F8F8F8]/60 text-sm">
            Todos
          </SelectItem>
          <SelectItem value="Activo" className="text-[#F8F8F8] text-sm">
            Activo
          </SelectItem>
          <SelectItem value="Inactivo" className="text-[#F8F8F8] text-sm">
            Inactivo
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Stock bajo toggle */}
      <button
        onClick={() =>
          onChange({ ...filters, soloStockBajo: !filters.soloStockBajo })
        }
        className={`h-9 px-4 rounded-md text-sm font-medium border transition-all duration-200 ${
          filters.soloStockBajo
            ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
            : "bg-[#111111] border-[#F8F8F8]/10 text-[#F8F8F8]/50 hover:text-[#F8F8F8]/80"
        }`}
      >
        ⚠ Stock bajo
      </button>

      {/* Limpiar */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="h-9 text-[#F8F8F8]/40 hover:text-[#F8F8F8] gap-1"
        >
          <X size={14} />
          Limpiar
        </Button>
      )}
    </div>
  );
}

