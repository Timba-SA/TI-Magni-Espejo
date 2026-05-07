import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Insumo, InsumoFormData } from "../types/insumo.types";
import { UNIDADES_MEDIDA } from "../types/insumo.types";
import { getCategorias } from "@/features/categorias/services/categoriasService";
import type { Categoria } from "@/features/categorias/types/categoria.types";

interface InsumoFormProps {
  open: boolean;
  insumo?: Insumo | null;
  onClose: () => void;
  onSave: (data: InsumoFormData) => void;
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] tracking-[0.15em] text-white/35 uppercase font-mono flex items-center gap-1">
      {children}
      {required && (
        <span className="text-[#FF5A00] text-[10px] leading-none">*</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-400/80 mt-1 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400/80" />
      {message}
    </p>
  );
}

const inputClass =
  "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-[#FF5A00]/40 focus:ring-2 focus:ring-[#FF5A00]/10 focus:bg-white/[0.05] transition-all duration-200 h-10 hover:border-white/15 hover:bg-white/[0.04]";

const selectTriggerClass =
  "bg-white/[0.03] border border-white/[0.08] text-white/90 h-10 text-sm rounded-xl hover:border-white/15 hover:bg-white/[0.04] focus:ring-2 focus:ring-[#FF5A00]/10 focus:border-[#FF5A00]/40 transition-all duration-200 data-[state=open]:border-[#FF5A00]/40 data-[state=open]:bg-white/[0.05]";

const selectContentClass =
  "bg-[#0e0e0e]/95 backdrop-blur-xl border-white/[0.08] text-white shadow-2xl rounded-xl";

export function InsumoForm({ open, insumo, onClose, onSave }: InsumoFormProps) {
  const isEditing = !!insumo;
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsumoFormData>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoria: "",
      unidadMedida: "",
      stockActual: 0,
      stockMinimo: 0,
      precioUnitario: 0,
      estado: "Activo",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        insumo
          ? {
              nombre: insumo.nombre,
              descripcion: insumo.descripcion,
              categoria: insumo.categoria,
              unidadMedida: insumo.unidadMedida,
              stockActual: insumo.stockActual,
              stockMinimo: insumo.stockMinimo,
              precioUnitario: insumo.precioUnitario,
              estado: insumo.estado,
            }
          : {
              nombre: "",
              descripcion: "",
              categoria: "",
              unidadMedida: "",
              stockActual: 0,
              stockMinimo: 0,
              precioUnitario: 0,
              estado: "Activo",
            }
      );
    }
  }, [open, insumo, reset]);

  const onSubmit = (data: InsumoFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.07] text-white max-w-lg max-h-[92vh] overflow-y-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-2xl p-0">
        {/* Header con gradiente premium */}
        <div className="relative px-7 pt-7 pb-5 border-b border-white/[0.06]">
          {/* Glow accent top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#FF5A00]/60 to-transparent" />

          <DialogHeader>
            <div className="flex items-center gap-3">
              {/* Ícono decorativo */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A00]/20 to-[#FF5A00]/5 border border-[#FF5A00]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF5A00"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isEditing ? (
                    <>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </>
                  ) : (
                    <>
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="8" x2="12" y2="13" />
                      <line x1="9.5" y1="10.5" x2="14.5" y2="10.5" />
                    </>
                  )}
                </svg>
              </div>

              <div>
                <DialogTitle className="text-white/95 text-base font-semibold tracking-tight">
                  {isEditing ? "Editar insumo" : "Nuevo insumo"}
                </DialogTitle>
                <p className="text-white/30 text-xs mt-0.5 font-mono tracking-wider">
                  {isEditing ? `ID #${insumo?.id}` : "Completá los datos del producto"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body del formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-5 space-y-5">

          {/* Nombre */}
          <div className="space-y-2">
            <FieldLabel required>Nombre</FieldLabel>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: "El nombre es obligatorio" }}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Ej: Harina 000"
                  className={inputClass}
                />
              )}
            />
            <FieldError message={errors.nombre?.message} />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <FieldLabel>Descripción</FieldLabel>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Descripción breve del insumo"
                  className={inputClass}
                />
              )}
            />
          </div>

          {/* Separador sutil */}
          <div className="h-px bg-white/[0.05]" />

          {/* Categoría + Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel required>Categoría</FieldLabel>
              <Controller
                name="categoria"
                control={control}
                rules={{ required: "La categoría es obligatoria" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {categorias.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-white/30 font-mono">Sin categorías creadas</div>
                      ) : (
                        categorias.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.nombre}
                            className="text-sm text-white/70 focus:text-white focus:bg-white/[0.06] rounded-lg"
                          >
                            {cat.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.categoria?.message} />
            </div>

            <div className="space-y-2">
              <FieldLabel required>Unidad de medida</FieldLabel>
              <Controller
                name="unidadMedida"
                control={control}
                rules={{ required: "La unidad es obligatoria" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {UNIDADES_MEDIDA.map((u) => (
                        <SelectItem
                          key={u}
                          value={u}
                          className="text-sm text-white/70 focus:text-white focus:bg-white/[0.06] rounded-lg"
                        >
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.unidadMedida?.message} />
            </div>
          </div>

          {/* Stock + Precio — con fondo de sección */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 space-y-1">
            <p className="text-[10px] font-mono tracking-[0.15em] text-white/25 uppercase mb-3">
              Inventario & precio
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <FieldLabel required>Stock actual</FieldLabel>
                <Controller
                  name="stockActual"
                  control={control}
                  rules={{ min: { value: 0, message: "No puede ser negativo" } }}
                  render={({ field }) => (
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={inputClass}
                    />
                  )}
                />
                <FieldError message={errors.stockActual?.message} />
              </div>

              <div className="space-y-2">
                <FieldLabel required>Stock mínimo</FieldLabel>
                <Controller
                  name="stockMinimo"
                  control={control}
                  rules={{ min: { value: 0, message: "No puede ser negativo" } }}
                  render={({ field }) => (
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={inputClass}
                    />
                  )}
                />
                <FieldError message={errors.stockMinimo?.message} />
              </div>

              <div className="space-y-2">
                <FieldLabel required>Precio unit.</FieldLabel>
                <Controller
                  name="precioUnitario"
                  control={control}
                  rules={{ min: { value: 0, message: "Debe ser ≥ 0" } }}
                  render={({ field }) => (
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={inputClass}
                    />
                  )}
                />
                <FieldError message={errors.precioUnitario?.message} />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <FieldLabel>Estado</FieldLabel>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`${selectTriggerClass} w-44`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    <SelectItem value="Activo" className="text-sm text-white/70 focus:text-white focus:bg-white/[0.06] rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Activo
                      </span>
                    </SelectItem>
                    <SelectItem value="Inactivo" className="text-sm text-white/70 focus:text-white focus:bg-white/[0.06] rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block" />
                        Inactivo
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] pt-5 -mx-7 px-7 -mb-5 pb-7">
            <DialogFooter className="gap-2 flex-row justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all rounded-xl h-10 px-4 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="relative overflow-hidden bg-gradient-to-r from-[#FF5A00] to-[#e04e00] hover:from-[#ff6a1a] hover:to-[#FF5A00] text-white border-0 rounded-xl h-10 px-6 text-sm font-medium shadow-lg shadow-[#FF5A00]/20 hover:shadow-[#FF5A00]/30 transition-all duration-200"
              >
                {isEditing ? "Guardar cambios" : "Crear insumo"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
