import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, AlertTriangle, Play, Pause } from "lucide-react";
import type { Ingrediente } from "../types/insumo.types";

interface InsumosTableProps {
  insumos: Ingrediente[];
  onView: (insumo: Ingrediente) => void;
  onEdit: (insumo: Ingrediente) => void;
  onDelete: (insumo: Ingrediente) => void;
  onToggleActive: (insumo: Ingrediente) => void;
  isAdmin?: boolean;
}

export function InsumosTable({ insumos, onView, onEdit, onDelete, onToggleActive, isAdmin = true }: InsumosTableProps) {
  if (insumos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm" style={{ color: "var(--tfs-text-muted)" }}>
          No se encontraron ingredientes con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow
            className="hover:bg-transparent"
            style={{ borderColor: "var(--tfs-border-subtle)" }}
          >
            {["Nombre", "Descripción", "Stock Actual", "Costo Unitario", "Alérgeno", "Acciones"].map((h) => (
              <TableHead
                key={h}
                className={`text-xs tracking-wider font-mono uppercase${h === "Alérgeno" ? " text-center" : ""}${h === "Acciones" ? " text-right" : ""}`}
                style={{ color: "var(--tfs-text-muted)" }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumos.map((insumo) => {
            const esCritico = Number(insumo.stock_actual) <= Number(insumo.stock_minimo) && Number(insumo.stock_minimo) > 0;
            const simboloMedida = insumo.unidad_medida?.simbolo ?? "u";

            return (
              <TableRow
                key={insumo.id}
                className={`transition-colors duration-150 ${esCritico ? "bg-amber-500/[0.02] hover:bg-amber-500/[0.04]" : ""} ${!insumo.is_active ? "opacity-60" : ""}`}
                style={{ borderColor: "var(--tfs-divider)" }}
              >
                {/* Nombre */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: "var(--tfs-text-heading)" }}>
                      {insumo.nombre}
                    </p>
                    {!insumo.is_active && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                    #{insumo.id}
                  </p>
                </TableCell>

                {/* Descripción */}
                <TableCell>
                  <span className="text-sm line-clamp-1 max-w-[200px]" style={{ color: "var(--tfs-text-muted)" }} title={insumo.descripcion ?? ""}>
                    {insumo.descripcion ?? (
                      <span className="italic" style={{ color: "var(--tfs-text-subtle)" }}>
                        Sin descripción
                      </span>
                    )}
                  </span>
                </TableCell>

                {/* Stock Actual con Alerta */}
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-bold ${esCritico ? "text-amber-500" : "text-[var(--tfs-text-primary)]"}`}>
                        {Number(insumo.stock_actual)}
                      </span>
                      <span className="text-xs font-medium" style={{ color: "var(--tfs-text-muted)" }}>
                        {simboloMedida}
                      </span>
                    </div>

                    {esCritico && (
                      <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-lg text-[9px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        <AlertTriangle size={8} />
                        Stock Crítico
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Costo Unitario */}
                <TableCell>
                  <span className="text-sm font-mono font-medium" style={{ color: "var(--tfs-text-primary)" }}>
                    $ {Number(insumo.costo_unitario).toFixed(2)}
                    <span className="text-xs ml-1" style={{ color: "var(--tfs-text-muted)" }}>
                      / {simboloMedida}
                    </span>
                  </span>
                </TableCell>

                {/* Alérgeno */}
                <TableCell className="text-center">
                  {insumo.es_alergeno ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      <AlertTriangle size={10} />
                      Sí
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--tfs-text-subtle)" }}>
                      —
                    </span>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-[#F8F8F8] hover:bg-[#F8F8F8]/[0.08]"
                      style={{ color: "var(--tfs-text-muted)" }}
                      onClick={() => onView(insumo)}
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-[#FF5A00] hover:bg-[#FF5A00]/10"
                          style={{ color: "var(--tfs-text-muted)" }}
                          onClick={() => onEdit(insumo)}
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-[#FFC107] hover:bg-[#FFC107]/10"
                          style={{ color: "var(--tfs-text-muted)" }}
                          onClick={() => onToggleActive(insumo)}
                          title={insumo.is_active ? "Inhabilitar" : "Habilitar"}
                        >
                          {insumo.is_active ? <Pause size={15} /> : <Play size={15} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-[#C1121F] hover:bg-[#C1121F]/10"
                          style={{ color: "var(--tfs-text-muted)" }}
                          onClick={() => onDelete(insumo)}
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
