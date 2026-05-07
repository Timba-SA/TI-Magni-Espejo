import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, AlertTriangle, RotateCcw } from "lucide-react";
import type { Insumo } from "../types/insumo.types";
import { formatCurrency } from "@/utils/formatCurrency";

interface InsumosTableProps {
  insumos: Insumo[];
  onView: (insumo: Insumo) => void;
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
  onReactivar?: (insumo: Insumo) => void;
}

function EstadoBadge({ estado }: { estado: Insumo["estado"] }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
        estado === "Activo"
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-[#F8F8F8]/5 text-[#F8F8F8]/30 border border-[#F8F8F8]/10"
      }`}
    >
      {estado}
    </span>
  );
}

export function InsumosTable({
  insumos,
  onView,
  onEdit,
  onDelete,
  onReactivar,
}: InsumosTableProps) {
  if (insumos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-[#F8F8F8]/50 text-sm">
          No se encontraron insumos con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[#F8F8F8]/[0.06] hover:bg-transparent">
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase">
              Nombre
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase">
              Categoría
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase text-right">
              Stock
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase text-right">
              Mínimo
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase text-right">
              Precio unit.
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase">
              Estado
            </TableHead>
            <TableHead className="text-[#F8F8F8]/40 text-xs tracking-wider font-mono uppercase text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumos.map((insumo) => {
            const stockBajo = insumo.stockActual <= insumo.stockMinimo;
            return (
              <TableRow
                key={insumo.id}
                className="border-[#F8F8F8]/[0.04] hover:bg-[#F8F8F8]/[0.02] transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {stockBajo && (
                      <span title="Stock bajo" className="flex items-center">
                        <AlertTriangle
                          size={13}
                          className="text-amber-400 flex-shrink-0"
                        />
                      </span>
                    )}
                    <div>
                      <p className="text-[#F8F8F8] text-sm font-medium">
                        {insumo.nombre}
                      </p>
                      <p className="text-[#F8F8F8]/30 text-xs">
                        {insumo.unidadMedida}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[#F8F8F8]/60 text-sm">
                    {insumo.categoria}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`text-sm font-mono font-semibold ${
                      stockBajo ? "text-amber-400" : "text-[#F8F8F8]"
                    }`}
                  >
                    {insumo.stockActual}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono text-[#F8F8F8]/40">
                    {insumo.stockMinimo}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono text-[#F8F8F8]/70">
                    {formatCurrency(insumo.precioUnitario)}
                  </span>
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={insumo.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#F8F8F8]/40 hover:text-[#F8F8F8] hover:bg-[#F8F8F8]/[0.08]"
                      onClick={() => onView(insumo)}
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#F8F8F8]/40 hover:text-[#FF5A00] hover:bg-[#FF5A00]/10"
                      onClick={() => onEdit(insumo)}
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </Button>
                    {insumo.estado === "Activo" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#F8F8F8]/40 hover:text-[#C1121F] hover:bg-[#C1121F]/10"
                        onClick={() => onDelete(insumo)}
                        title="Dar de baja"
                      >
                        <Trash2 size={15} />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#F8F8F8]/40 hover:text-emerald-400 hover:bg-emerald-400/10"
                        onClick={() => onReactivar?.(insumo)}
                        title="Reactivar insumo"
                      >
                        <RotateCcw size={15} />
                      </Button>
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

