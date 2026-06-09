import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import type { Ingrediente } from "../types/insumo.types";

interface InsumoDetailModalProps {
  open: boolean;
  insumo: Ingrediente | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between items-start py-3 last:border-0"
      style={{ borderBottom: "1px solid var(--tfs-border-subtle)" }}
    >
      <span
        className="text-xs tracking-wider uppercase font-mono"
        style={{ color: "var(--tfs-text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium text-right max-w-[60%]"
        style={{ color: "var(--tfs-text-heading)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function InsumoDetailModal({ open, insumo, onClose }: InsumoDetailModalProps) {
  if (!insumo) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "var(--tfs-card-bg)",
          border: "1px solid var(--tfs-border-mid)",
          color: "var(--tfs-text-heading)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg flex items-center gap-3"
            style={{ color: "var(--tfs-text-heading)" }}
          >
            {insumo.nombre}
            {insumo.es_alergeno && (
              <span className="flex items-center gap-1 text-xs font-normal text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                <AlertTriangle size={11} />
                Alérgeno
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {insumo.descripcion && (
            <p
              className="text-sm mb-5 pb-4 leading-relaxed"
              style={{
                color: "var(--tfs-text-muted)",
                borderBottom: "1px solid var(--tfs-border-subtle)",
              }}
            >
              {insumo.descripcion}
            </p>
          )}

          <DetailRow label="ID" value={`#${insumo.id}`} />
          <DetailRow
            label="Stock Actual"
            value={
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono font-bold">
                  {Number(insumo.stock_actual)} {insumo.unidad_medida?.simbolo ?? "u"}
                </span>
                {Number(insumo.stock_actual) <= Number(insumo.stock_minimo) && Number(insumo.stock_minimo) > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                    <AlertTriangle size={8} />
                    Stock Crítico
                  </span>
                )}
              </div>
            }
          />
          <DetailRow
            label="Stock Mínimo Alerta"
            value={
              <span className="font-mono">
                {Number(insumo.stock_minimo)} {insumo.unidad_medida?.simbolo ?? "u"}
              </span>
            }
          />
          <DetailRow
            label="Costo Unitario"
            value={
              <span className="font-mono">
                $ {Number(insumo.costo_unitario).toFixed(2)} / {insumo.unidad_medida?.simbolo ?? "u"}
              </span>
            }
          />
          <DetailRow
            label="Alérgeno"
            value={
              insumo.es_alergeno ? (
                <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                  <AlertTriangle size={11} /> Sí, es alérgeno
                </span>
              ) : (
                <span style={{ color: "var(--tfs-text-muted)" }}>No</span>
              )
            }
          />
          {!insumo.is_active && (
            <>
              <DetailRow
                label="Estado"
                value={
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Inactivo
                  </span>
                }
              />
              {insumo.deleted_at && (
                <DetailRow
                  label="Fecha de Desactivación"
                  value={new Date(insumo.deleted_at).toLocaleString("es-AR")}
                />
              )}
            </>
          )}
          <DetailRow
            label="Creado"
            value={new Date(insumo.created_at).toLocaleString("es-AR")}
          />
          <DetailRow
            label="Actualizado"
            value={new Date(insumo.updated_at).toLocaleString("es-AR")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
