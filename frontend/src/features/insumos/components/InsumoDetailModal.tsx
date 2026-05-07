import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import type { Insumo } from "../types/insumo.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/dateUtils";

interface InsumoDetailModalProps {
  open: boolean;
  insumo: Insumo | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-[#F8F8F8]/[0.05] last:border-0">
      <span className="text-xs tracking-wider text-[#F8F8F8]/35 uppercase font-mono">
        {label}
      </span>
      <span className="text-sm text-[#F8F8F8] font-medium text-right max-w-[55%]">
        {value}
      </span>
    </div>
  );
}

export function InsumoDetailModal({
  open,
  insumo,
  onClose,
}: InsumoDetailModalProps) {
  if (!insumo) return null;

  const stockBajo = insumo.stockActual <= insumo.stockMinimo;
  const valorStock = insumo.stockActual * insumo.precioUnitario;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-[#111111] border-[#F8F8F8]/10 text-[#F8F8F8] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#F8F8F8] text-lg flex items-center gap-3">
            {insumo.nombre}
            {stockBajo && (
              <span className="flex items-center gap-1 text-xs font-normal text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                <AlertTriangle size={11} />
                Stock bajo
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {/* Descripción */}
          {insumo.descripcion && (
            <p className="text-sm text-[#F8F8F8]/50 mb-5 pb-4 border-b border-[#F8F8F8]/[0.05] leading-relaxed">
              {insumo.descripcion}
            </p>
          )}

          <DetailRow label="Categoría" value={insumo.categoria} />
          <DetailRow label="Unidad de medida" value={insumo.unidadMedida} />
          <DetailRow
            label="Stock actual"
            value={
              <span className={stockBajo ? "text-amber-400 font-bold" : ""}>
                {insumo.stockActual} {insumo.unidadMedida}
              </span>
            }
          />
          <DetailRow
            label="Stock mínimo"
            value={`${insumo.stockMinimo} ${insumo.unidadMedida}`}
          />
          <DetailRow
            label="Precio unitario"
            value={formatCurrency(insumo.precioUnitario)}
          />
          <DetailRow
            label="Valor del stock"
            value={
              <span className="text-[#FF5A00]">{formatCurrency(valorStock)}</span>
            }
          />
          <DetailRow
            label="Estado"
            value={
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  insumo.estado === "Activo"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-[#F8F8F8]/5 text-[#F8F8F8]/30 border border-[#F8F8F8]/10"
                }`}
              >
                {insumo.estado}
              </span>
            }
          />
          <DetailRow label="Fecha de alta" value={formatDate(insumo.fechaAlta)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

