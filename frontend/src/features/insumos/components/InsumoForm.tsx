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
import type { Ingrediente, IngredienteFormData, UnidadMedida } from "../types/insumo.types";
import { getUnidadesMedida } from "../services/insumosService";

interface InsumoFormProps {
  open: boolean;
  insumo?: Ingrediente | null;
  onClose: () => void;
  onSave: (data: IngredienteFormData) => void;
  serverError?: string | null;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-[10px] tracking-[0.15em] uppercase font-mono flex items-center gap-1" style={{ color: "var(--tfs-text-muted)" }}>
      {children}
      {required && <span className="text-[#FF5A00] text-[10px] leading-none">*</span>}
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
  "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200";

const inputStyle = {
  background: "var(--tfs-input-bg)",
  border: "1px solid var(--tfs-input-border)",
  color: "var(--tfs-text-primary)",
};

export function InsumoForm({ open, insumo, onClose, onSave, serverError }: InsumoFormProps) {
  const isEditing = !!insumo;
  const [saving, setSaving] = useState(false);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IngredienteFormData>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      es_alergeno: false,
      unidad_medida_id: null,
      stock_actual: 0,
      stock_minimo: 0,
      costo_unitario: 0,
    },
  });

  const selectedUnidadId = watch("unidad_medida_id");
  const selectedUnidad = unidades.find((u) => u.id === Number(selectedUnidadId));
  const simboloSeleccionado = selectedUnidad?.simbolo ?? "u";

  // Cargar unidades de medida físicas reales al abrir
  useEffect(() => {
    if (open) {
      getUnidadesMedida().then((res) => {
        // Ordenar alfabéticamente para mayor prolijidad
        setUnidades(res.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      reset(
        insumo
          ? {
              nombre: insumo.nombre,
              descripcion: insumo.descripcion ?? "",
              es_alergeno: insumo.es_alergeno,
              unidad_medida_id: insumo.unidad_medida_id,
              stock_actual: insumo.stock_actual,
              stock_minimo: insumo.stock_minimo,
              costo_unitario: insumo.costo_unitario,
            }
          : {
              nombre: "",
              descripcion: "",
              es_alergeno: false,
              unidad_medida_id: null,
              stock_actual: 0,
              stock_minimo: 0,
              costo_unitario: 0,
            }
      );
    }
  }, [open, insumo, reset]);

  const onSubmit = async (data: IngredienteFormData) => {
    setSaving(true);
    try {
      // Mapear unidad_medida_id a number o null, y forzar peso a null
      const mappedData: IngredienteFormData = {
        ...data,
        unidad_medida_id: data.unidad_medida_id ? Number(data.unidad_medida_id) : null,
        stock_actual: Number(data.stock_actual) || 0,
        stock_minimo: Number(data.stock_minimo) || 0,
        costo_unitario: Number(data.costo_unitario) || 0,
        peso: null,
      };
      await onSave(mappedData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="sm:max-w-7xl w-[95vw] shadow-2xl rounded-2xl p-0 overflow-hidden"
        style={{
          background: "var(--tfs-card-bg)",
          border: "1px solid var(--tfs-border-mid)",
          color: "var(--tfs-text-heading)",
        }}
      >
        {/* Header */}
        <div
          className="relative px-7 pt-7 pb-5"
          style={{ borderBottom: "1px solid var(--tfs-border-subtle)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#FF5A00]/60 to-transparent" />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A00]/20 to-[#FF5A00]/5 border border-[#FF5A00]/20 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {isEditing ? (
                    <>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </>
                  ) : (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </>
                  )}
                </svg>
              </div>
              <div>
                <DialogTitle className="text-base font-semibold tracking-tight" style={{ color: "var(--tfs-text-heading)" }}>
                  {isEditing ? "Editar ingrediente" : "Nuevo ingrediente"}
                </DialogTitle>
                <p className="text-xs mt-0.5 font-mono tracking-wider" style={{ color: "var(--tfs-text-muted)" }}>
                  {isEditing ? `ID #${insumo?.id}` : "Completá los datos físicos y de control de stock"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Información General */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "var(--tfs-border-subtle)" }}>
                <span className="text-xs font-mono font-bold text-[#FF5A00]">01.</span>
                <span className="text-xs font-bold uppercase tracking-wider">Detalles Generales</span>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <FieldLabel required>Nombre del Ingrediente</FieldLabel>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: "El nombre es obligatorio" }}
                  render={({ field }) => (
                    <input {...field} placeholder="Ej: Muzzarella Barra" className={inputClass} style={inputStyle} />
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
                    <textarea
                      {...field}
                      placeholder="Ej: Queso muzzarella de primera calidad para pizzas."
                      rows={4}
                      className={`${inputClass} h-auto resize-none`}
                      style={inputStyle}
                    />
                  )}
                />
              </div>

              {/* Es alérgeno */}
              <div
                className="flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all hover:bg-[var(--tfs-input-bg)]/80"
                style={{ background: "var(--tfs-input-bg)", border: "1px solid var(--tfs-input-border)" }}
              >
                <Controller
                  name="es_alergeno"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="es_alergeno"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                    />
                  )}
                />
                <label htmlFor="es_alergeno" className="text-sm cursor-pointer select-none" style={{ color: "var(--tfs-text-primary)" }}>
                  Es alérgeno
                  <span className="block text-xs font-mono tracking-wider mt-0.5" style={{ color: "var(--tfs-text-muted)" }}>
                    Contiene gluten, lácteos, huevo u otros alérgenos.
                  </span>
                </label>
              </div>
            </div>

            {/* Columna Derecha: Control de Stock e Inventario */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "var(--tfs-border-subtle)" }}>
                <span className="text-xs font-mono font-bold text-[#FF5A00]">02.</span>
                <span className="text-xs font-bold uppercase tracking-wider">Inventario & Costos</span>
              </div>

              {/* Unidad de Medida */}
              <div className="space-y-2">
                <FieldLabel required>Unidad de Medida</FieldLabel>
                <Controller
                  name="unidad_medida_id"
                  control={control}
                  rules={{ required: "La unidad de medida es obligatoria" }}
                  render={({ field }) => (
                    <select
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      className={`${inputClass} cursor-pointer`}
                      style={{
                        ...inputStyle,
                        color: field.value ? "var(--tfs-text-primary)" : "var(--tfs-text-muted)",
                      }}
                    >
                      <option value="" disabled style={{ background: "var(--tfs-card-bg, #18181b)", color: "var(--tfs-text-muted, #a1a1aa)" }}>
                        Seleccioná una unidad
                      </option>
                      {unidades.map((u) => (
                        <option
                          key={u.id}
                          value={u.id}
                          style={{
                            background: "var(--tfs-card-bg, #18181b)",
                            color: "var(--tfs-text-primary, #f4f4f5)",
                          }}
                        >
                          {u.nombre} ({u.simbolo}) — {u.tipo}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <FieldError message={errors.unidad_medida_id?.message} />
              </div>

              {/* Costo Unitario */}
              <div className="space-y-2">
                <FieldLabel required>Costo Unitario ($ / {simboloSeleccionado})</FieldLabel>
                <Controller
                  name="costo_unitario"
                  control={control}
                  rules={{
                    required: "El costo es obligatorio",
                    min: { value: 0, message: "El costo no puede ser negativo" },
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={inputClass}
                      style={inputStyle}
                    />
                  )}
                />
                <FieldError message={errors.costo_unitario?.message} />
              </div>

              {/* Grid interno de Stocks */}
              <div className="grid grid-cols-2 gap-4">
                {/* Stock Actual */}
                <div className="space-y-2">
                  <FieldLabel required>
                    {selectedUnidad ? (selectedUnidad.tipo === "masa" ? "Peso" : "Stock") : "Peso o Stock"} ({simboloSeleccionado})
                  </FieldLabel>
                  <Controller
                    name="stock_actual"
                    control={control}
                    rules={{
                      required: "El stock es obligatorio",
                      min: { value: 0, message: "No puede ser negativo" },
                    }}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.000"
                        className={inputClass}
                        style={inputStyle}
                      />
                    )}
                  />
                  <FieldError message={errors.stock_actual?.message} />
                </div>

                {/* Stock Mínimo */}
                <div className="space-y-2">
                  <FieldLabel required>
                    {selectedUnidad ? (selectedUnidad.tipo === "masa" ? "Peso Mínimo" : "Stock Mínimo") : "Peso o Stock Mínimo"} ({simboloSeleccionado})
                  </FieldLabel>
                  <Controller
                    name="stock_minimo"
                    control={control}
                    rules={{
                      required: "El stock mínimo es obligatorio",
                      min: { value: 0, message: "No puede ser negativo" },
                    }}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.000"
                        className={inputClass}
                        style={inputStyle}
                      />
                    )}
                  />
                  <FieldError message={errors.stock_minimo?.message} />
                </div>
              </div>
            </div>
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="px-4 py-3 rounded-xl text-xs font-mono mt-5" style={{ background: "rgba(193,18,31,0.1)", border: "1px solid rgba(193,18,31,0.25)", color: "#e85d74" }}>
              ⚠️ {serverError}
            </div>
          )}

          {/* Footer */}
          <div className="pt-5 -mx-7 px-7 -mb-5 pb-7 mt-6" style={{ borderTop: "1px solid var(--tfs-border-subtle)" }}>
            <DialogFooter className="gap-2 flex-row justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saving}
                className="hover:bg-[#F8F8F8]/[0.04] transition-all rounded-xl h-10 px-4 text-sm"
                style={{ color: "var(--tfs-text-muted)" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="relative overflow-hidden bg-gradient-to-r from-[#FF5A00] to-[#e04e00] hover:from-[#ff6a1a] hover:to-[#FF5A00] text-white border-0 rounded-xl h-10 px-6 text-sm font-medium shadow-lg shadow-[#FF5A00]/20 hover:shadow-[#FF5A00]/30 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear ingrediente"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
