import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Check, X } from "lucide-react";
import type { Producto } from "../types/producto.types";

interface ProductoDetailModalProps {
  open: boolean;
  producto: Producto | null;
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

export function ProductoDetailModal({ open, producto, onClose }: ProductoDetailModalProps) {
  if (!producto) return null;

  const esArchivado = producto.deleted_at !== null;
  const catPrincipal = producto.categorias.find((c) => c.es_principal)?.categoria?.nombre;
  const otrasCats = producto.categorias
    .filter((c) => !c.es_principal)
    .map((c) => c.categoria?.nombre)
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
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
            {producto.nombre}
            {esArchivado && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                Archivado
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {/* Imagen si existe */}
          {producto.imagenes_url && producto.imagenes_url.length > 0 && (
            <div className="w-full h-40 rounded-lg overflow-hidden border border-zinc-700 mb-4 bg-zinc-800">
              <img
                src={producto.imagenes_url[0]}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {producto.descripcion && (
            <p
              className="text-sm mb-5 pb-4 leading-relaxed"
              style={{
                color: "var(--tfs-text-muted)",
                borderBottom: "1px solid var(--tfs-border-subtle)",
              }}
            >
              {producto.descripcion}
            </p>
          )}

          <DetailRow label="ID" value={`#${producto.id}`} />
          
          <DetailRow
            label="Categoría Principal"
            value={catPrincipal ?? <span className="italic text-[var(--tfs-text-subtle)]">Sin asignar</span>}
          />
          
          {otrasCats && (
            <DetailRow
              label="Otras Categorías"
              value={otrasCats}
            />
          )}

          <DetailRow
            label="Precio Base"
            value={
              <span className="font-mono font-bold text-base text-[var(--tfs-text-heading)]">
                $ {Number(producto.precio_base).toFixed(2)}
              </span>
            }
          />

          <DetailRow
            label="Stock"
            value={
              <span className="font-mono font-semibold">
                {producto.stock_cantidad} unidades
              </span>
            }
          />

          <DetailRow
            label="Disponibilidad"
            value={
              producto.disponible && !esArchivado ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Disponible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  No disponible
                </span>
              )
            }
          />

          {/* Ingredientes / Receta */}
          <div className="mt-4">
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-2 font-mono"
              style={{ color: "var(--tfs-text-muted)" }}
            >
              Receta / Ingredientes
            </h4>
            {producto.ingredientes.length > 0 ? (
              <div
                className="rounded-lg border divide-y overflow-hidden"
                style={{
                  borderColor: "var(--tfs-border-subtle)",
                  backgroundColor: "rgba(255, 255, 255, 0.01)"
                }}
              >
                {producto.ingredientes.map((prodIng) => (
                  <div
                    key={prodIng.ingrediente_id}
                    className="flex justify-between items-center p-3"
                    style={{ borderColor: "var(--tfs-border-subtle)" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--tfs-text-heading)" }}>
                        {prodIng.ingrediente?.nombre ?? `Insumo #${prodIng.ingrediente_id}`}
                      </p>
                      <p className="text-xs" style={{ color: "var(--tfs-text-muted)" }}>
                        Cantidad: <span className="font-mono">{Number(prodIng.cantidad)}</span>{" "}
                        {prodIng.unidad_medida?.simbolo ?? "u"}
                      </p>
                    </div>
                    <div>
                      {prodIng.es_removible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                          <Check size={8} /> Removible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <X size={8} /> Fijo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: "var(--tfs-text-subtle)" }}>
                Este producto no posee ingredientes/receta asociados en el sistema.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--tfs-border-subtle)" }}>
            <DetailRow
              label="Creado"
              value={new Date(producto.created_at).toLocaleString("es-AR")}
            />
            {producto.updated_at && (
              <DetailRow
                label="Última modificación"
                value={new Date(producto.updated_at).toLocaleString("es-AR")}
              />
            )}
            {producto.deleted_at && (
              <DetailRow
                label="Archivado el"
                value={new Date(producto.deleted_at).toLocaleString("es-AR")}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
