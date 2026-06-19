import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { Producto } from "../types/producto.types";

interface ProductosTableProps {
  productos: Producto[];
  onView: (producto: Producto) => void;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
  onReactivate: (producto: Producto) => void;
  onToggleAvailability: (producto: Producto) => void;
  isAdmin?: boolean;
}

export function ProductosTable({
  productos,
  onView,
  onEdit,
  onDelete,
  onReactivate,
  onToggleAvailability,
  isAdmin = true,
}: ProductosTableProps) {
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--tfs-text-muted)" }}>
          No se encontraron productos con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent" style={{ borderColor: "var(--tfs-border-subtle)" }}>
            {["Producto", "Categorías", "Precio", "Stock", "Ingredientes", "Disponibilidad", "Acciones"].map((h) => (
              <TableHead
                key={h}
                className={`text-xs tracking-wider font-mono uppercase ${
                  h === "Disponibilidad" ? "text-center" : ""
                } ${h === "Acciones" ? "text-right" : ""}`}
                style={{ color: "var(--tfs-text-muted)" }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto) => {
            const esArchivado = producto.deleted_at !== null;
            const tieneIngredientes = producto.ingredientes.length > 0;
            const catPrincipal = producto.categorias.find((c) => c.es_principal)?.categoria?.nombre;
            const otrasCats = producto.categorias
              .filter((c) => !c.es_principal)
              .map((c) => c.categoria?.nombre)
              .filter(Boolean)
              .join(", ");

            return (
              <TableRow
                key={producto.id}
                className={`transition-colors duration-150 ${esArchivado ? "opacity-50 hover:bg-zinc-800/10" : "hover:bg-zinc-800/20"}`}
                style={{ borderColor: "var(--tfs-divider)" }}
              >
                {/* Producto Info */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0"
                    >
                      {producto.imagenes_url && producto.imagenes_url.length > 0 ? (
                        <img
                          src={producto.imagenes_url[0]}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                            (e.target as HTMLImageElement).className = "hidden";
                          }}
                        />
                      ) : (
                        <span className="text-xl text-zinc-600">—</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--tfs-text-heading)" }}>
                          {producto.nombre}
                        </p>
                        {esArchivado && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            Archivado
                          </span>
                        )}
                        {!producto.disponible && !esArchivado && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Pausado
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                        #{producto.id}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Categorías */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {catPrincipal && (
                      <span className="text-sm font-medium" style={{ color: "var(--tfs-text-primary)" }}>
                        {catPrincipal} (Principal)
                      </span>
                    )}
                    {otrasCats && (
                      <span className="text-xs" style={{ color: "var(--tfs-text-muted)" }}>
                        {otrasCats}
                      </span>
                    )}
                    {!catPrincipal && !otrasCats && (
                      <span className="text-xs italic" style={{ color: "var(--tfs-text-subtle)" }}>
                        Sin categoría
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Precio */}
                <TableCell>
                  <span className="text-sm font-mono font-medium" style={{ color: "var(--tfs-text-primary)" }}>
                    $ {Number(producto.precio_base).toFixed(2)}
                  </span>
                </TableCell>

                {/* Stock */}
                <TableCell>
                  <span className="text-sm font-mono" style={{ color: "var(--tfs-text-primary)" }}>
                    {producto.stock_cantidad}
                  </span>
                </TableCell>

                {/* Ingredientes count/details */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {tieneIngredientes ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/20"
                        title={producto.ingredientes.map((i) => i.ingrediente?.nombre).join(", ")}
                      >
                        {producto.ingredientes.length} insumos
                      </span>
                    ) : (
                      <span className="text-xs italic" style={{ color: "var(--tfs-text-subtle)" }}>
                        Sin receta
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Disponibilidad Toggle */}
                <TableCell className="text-center">
                  {!esArchivado ? (
                    isAdmin ? (
                      <button
                        onClick={() => onToggleAvailability(producto)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer`}
                        style={
                          producto.disponible
                            ? { background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }
                            : { background: "rgba(113,113,122,0.1)", borderColor: "rgba(113,113,122,0.3)", color: "#71717A" }
                        }
                      >
                        {producto.disponible ? "Disponible" : "No disponible"}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border`}
                        style={
                          producto.disponible
                            ? { background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }
                            : { background: "rgba(113,113,122,0.1)", borderColor: "rgba(113,113,122,0.3)", color: "#71717A" }
                        }
                      >
                        {producto.disponible ? "Disponible" : "No disponible"}
                      </span>
                    )
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: "var(--tfs-text-subtle)" }}>
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
                      onClick={() => onView(producto)}
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </Button>
                    
                    {isAdmin && !esArchivado && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-[#FF5A00] hover:bg-[#FF5A00]/10"
                          style={{ color: "var(--tfs-text-muted)" }}
                          onClick={() => onEdit(producto)}
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-[#C1121F] hover:bg-[#C1121F]/10"
                          style={{ color: "var(--tfs-text-muted)" }}
                          onClick={() => onDelete(producto)}
                          title="Archivar"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </>
                    )}

                    {isAdmin && esArchivado && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-[#10B981] hover:bg-[#10B981]/10"
                        style={{ color: "var(--tfs-text-muted)" }}
                        onClick={() => onReactivate(producto)}
                        title="Reactivar"
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
