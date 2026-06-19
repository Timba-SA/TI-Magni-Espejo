import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, Image, AlertTriangle, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Producto, ProductoFormData } from "../types/producto.types";
import type { Categoria } from "@/features/categorias/types/categoria.types";
import type { Ingrediente, UnidadMedida } from "@/features/insumos/types/insumo.types";
import { uploadProductoImagen } from "../services/productosService";

interface ProductoFormProps {
  open: boolean;
  producto?: Producto | null;
  categorias: Categoria[];
  insumos: Ingrediente[];
  unidades: UnidadMedida[];
  onClose: () => void;
  onSave: (data: ProductoFormData) => void;
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

function IngredientCombobox({
  value,
  onChange,
  insumos,
}: {
  value: number;
  onChange: (id: number) => void;
  insumos: Ingrediente[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIngrediente = insumos.find((i) => i.id === value);

  // Filtrar insumos por nombre
  const filteredInsumos = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar ingrediente..."
        value={isOpen ? search : (selectedIngrediente?.nombre ?? "")}
        onChange={(e) => {
          if (!isOpen) setIsOpen(true);
          setSearch(e.target.value);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSearch("");
        }}
        onBlur={() => {
          // Un pequeño delay para permitir que el click en la lista se registre antes de cerrar
          setTimeout(() => setIsOpen(false), 200);
        }}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 h-9 py-1 px-3"
        style={{
          background: "var(--tfs-input-bg)",
          border: "1px solid var(--tfs-input-border)",
          color: "var(--tfs-text-primary)",
        }}
      />
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl shadow-xl border p-1"
          style={{
            background: "var(--tfs-card-bg, #18181b)",
            borderColor: "var(--tfs-input-border, #27272a)",
          }}
        >
          {filteredInsumos.length === 0 ? (
            <p className="text-xs p-2 text-center text-zinc-500">No se encontraron resultados</p>
          ) : (
            filteredInsumos.map((i) => (
              <div
                key={i.id}
                onMouseDown={() => {
                  onChange(i.id);
                  setSearch(i.nombre);
                  setIsOpen(false);
                }}
                className="text-xs px-3 py-2 rounded-lg hover:bg-[#FF5A00]/10 hover:text-[#FF5A00] cursor-pointer transition-all flex flex-col items-start gap-0.5"
                style={{ color: "var(--tfs-text-primary)" }}
              >
                <div className="flex justify-between w-full font-medium">
                  <span>{i.nombre}</span>
                  <span className="text-[10px] font-mono text-zinc-500 font-normal">
                    ({i.unidad_medida?.simbolo ?? "u"})
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Stock: {Number(i.stock_actual)} {i.unidad_medida?.simbolo ?? "u"} | Costo: ${Number(i.costo_unitario).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ProductoForm({
  open,
  producto,
  categorias,
  insumos,
  unidades: _unidades,
  onClose,
  onSave,
  serverError,
}: ProductoFormProps) {
  const isEditing = !!producto;
  const [saving, setSaving] = useState(false);

  // Estados locales para manejar la selección de categorías de forma robusta
  const [selectedCategorias, setSelectedCategorias] = useState<{ [key: number]: boolean }>({});
  const [categoriaPrincipalId, setCategoriaPrincipalId] = useState<number | null>(null);
  
  // Para manejar múltiples URLs de imagenes, usaremos un input de texto simple
  const [imagenUrlInput, setImagenUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen supera el tamaño máximo permitido de 5MB.");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const res = await uploadProductoImagen(file);
      setImagenUrlInput(res.url);
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio_base: 0,
      imagenes_url: [],
      stock_cantidad: 0,
      disponible: true,
      unidad_venta_id: null,
      categorias: [],
      ingredientes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredientes",
  });

  // 1. Observar ingredientes de la receta en tiempo real
  const watchedIngredientes = watch("ingredientes") || [];

  // 2. Calcular precio base en tiempo real
  const computedPrecioBase = (watchedIngredientes as any[]).reduce((sum: number, item: any) => {
    const ingrediente = insumos.find((i) => i.id === Number(item.ingrediente_id));
    if (!ingrediente) return sum;
    return sum + (Number(ingrediente.costo_unitario) * (Number(item.cantidad) || 0));
  }, 0);

  // 3. Calcular stock dinámico en tiempo real
  const computedStockCantidad = watchedIngredientes.length === 0 ? 0 : Math.floor(
    Math.min(
      ...(watchedIngredientes as any[]).map((item: any) => {
        const ingrediente = insumos.find((i) => i.id === Number(item.ingrediente_id));
        if (!ingrediente || !item.cantidad) return 0;
        return Number(ingrediente.stock_actual) / Number(item.cantidad);
      })
    )
  );

  // Sincronizar precio y stock calculados con el formulario
  useEffect(() => {
    setValue("precio_base", computedPrecioBase);
    setValue("stock_cantidad", computedStockCantidad);
  }, [computedPrecioBase, computedStockCantidad, setValue]);

  // Resetear formulario al abrir / cambiar producto
  useEffect(() => {
    if (open) {
      if (producto) {
        reset({
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          precio_base: producto.precio_base,
          imagenes_url: producto.imagenes_url ?? [],
          stock_cantidad: producto.stock_cantidad,
          disponible: producto.disponible,
          unidad_venta_id: producto.unidad_venta_id ?? null,
          categorias: producto.categorias.map((c) => ({
            categoria_id: c.categoria_id,
            es_principal: c.es_principal,
          })),
          ingredientes: producto.ingredientes.map((i) => ({
            ingrediente_id: i.ingrediente_id,
            cantidad: Number(i.cantidad),
            unidad_medida_id: i.unidad_medida_id ?? null,
            es_removible: i.es_removible,
          })),
        });

        // Setear estados de categorías
        const catsMap: { [key: number]: boolean } = {};
        let principalId: number | null = null;
        producto.categorias.forEach((c) => {
          catsMap[c.categoria_id] = true;
          if (c.es_principal) {
            principalId = c.categoria_id;
          }
        });
        setSelectedCategorias(catsMap);
        setCategoriaPrincipalId(principalId);

        // Setear input de imagen
        setImagenUrlInput(producto.imagenes_url?.[0] ?? "");
      } else {
        reset({
          nombre: "",
          descripcion: "",
          precio_base: 0,
          imagenes_url: [],
          stock_cantidad: 0,
          disponible: true,
          unidad_venta_id: null,
          categorias: [],
          ingredientes: [],
        });
        setSelectedCategorias({});
        setCategoriaPrincipalId(null);
        setImagenUrlInput("");
      }
    }
  }, [open, producto, reset]);

  // Manejar el cambio de checkboxes de categoría
  const handleCategoriaCheckboxChange = (catId: number, isChecked: boolean) => {
    const updated = { ...selectedCategorias, [catId]: isChecked };
    setSelectedCategorias(updated);

    // Si se desmarca la principal, resetear principal
    if (!isChecked && categoriaPrincipalId === catId) {
      setCategoriaPrincipalId(null);
    }
    // Si se marca la primera y no hay principal, hacerla principal
    if (isChecked && categoriaPrincipalId === null) {
      setCategoriaPrincipalId(catId);
    }
  };

  const onSubmit = async (data: ProductoFormData) => {
    setSaving(true);
    try {
      // 1. Mapear categorías seleccionadas
      const finalCategorias = Object.keys(selectedCategorias)
        .map(Number)
        .filter((id) => selectedCategorias[id])
        .map((id) => ({
          categoria_id: id,
          es_principal: id === categoriaPrincipalId,
        }));

      if (finalCategorias.length === 0) {
        alert("Debe seleccionar al menos una categoría.");
        setSaving(false);
        return;
      }

      if (finalCategorias.length > 0 && !finalCategorias.some((c) => c.es_principal)) {
        finalCategorias[0].es_principal = true;
      }

      // 2. Mapear imágenes_url a partir del input
      const finalImagenes = imagenUrlInput.trim() ? [imagenUrlInput.trim()] : [];

      // 3. Mapear ingredientes (unidad_medida_id se fuerza a null, el backend la asignará)
      const finalIngredientes = data.ingredientes.map((ing) => ({
        ingrediente_id: Number(ing.ingrediente_id),
        cantidad: Number(ing.cantidad) || 1,
        unidad_medida_id: null,
        es_removible: !!ing.es_removible,
      }));

      const mappedData: ProductoFormData = {
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        precio_base: computedPrecioBase,
        imagenes_url: finalImagenes,
        stock_cantidad: computedStockCantidad,
        disponible: !!data.disponible,
        unidad_venta_id: null, // Sin unidad de venta
        categorias: finalCategorias,
        ingredientes: finalIngredientes,
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
                  {isEditing ? "Editar producto" : "Nuevo producto"}
                </DialogTitle>
                <p className="text-xs mt-0.5 font-mono tracking-wider" style={{ color: "var(--tfs-text-muted)" }}>
                  {isEditing ? `ID #${producto?.id}` : "Completá los datos y la receta del plato"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-5 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Detalles del Producto */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "var(--tfs-border-subtle)" }}>
                <span className="text-xs font-mono font-bold text-[#FF5A00]">01.</span>
                <span className="text-xs font-bold uppercase tracking-wider">Información del Producto</span>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <FieldLabel required>Nombre del Producto</FieldLabel>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ required: "El nombre es obligatorio" }}
                  render={({ field }: any) => (
                    <input {...field} placeholder="Ej: Pizza Napolitana Especial" className={inputClass} style={inputStyle} />
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
                  render={({ field }: any) => (
                    <textarea
                      {...field}
                      placeholder="Ej: Pizza clásica con salsa de tomate, muzzarella, rodajas de tomate y albahaca."
                      rows={3}
                      className={`${inputClass} h-auto resize-none`}
                      style={inputStyle}
                    />
                  )}
                />
              </div>

              {/* Grid: Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                {/* Precio Base */}
                <div className="space-y-2">
                  <FieldLabel>Precio Base (Calculado)</FieldLabel>
                  <div
                    className={`${inputClass} select-none flex items-center font-mono font-bold h-10`}
                    style={{
                      ...inputStyle,
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "var(--tfs-border-subtle)",
                      opacity: 0.8,
                    }}
                  >
                    $ {computedPrecioBase.toFixed(2)}
                  </div>
                  <p className="text-[9px]" style={{ color: "var(--tfs-text-muted)" }}>
                    Suma del costo de la receta
                  </p>
                </div>

                {/* Stock Cantidad */}
                <div className="space-y-2">
                  <FieldLabel>Stock Disponible (Calculado)</FieldLabel>
                  <div
                    className={`${inputClass} select-none flex items-center font-mono font-bold h-10`}
                    style={{
                      ...inputStyle,
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "var(--tfs-border-subtle)",
                      opacity: 0.8,
                    }}
                  >
                    {computedStockCantidad} unidades
                  </div>
                  <p className="text-[9px]" style={{ color: "var(--tfs-text-muted)" }}>
                    Mínimo stock de insumos receta
                  </p>
                </div>
              </div>

              {/* Imagen (URL y Subida) */}
              <div className="space-y-3">
                <FieldLabel>Imagen del Producto</FieldLabel>
                
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-4 items-center">
                  {/* Vista Previa de la Imagen */}
                  <div
                    className="w-[110px] h-[110px] rounded-xl flex items-center justify-center overflow-hidden border relative group bg-[var(--tfs-input-bg)]"
                    style={{ borderColor: "var(--tfs-input-border)" }}
                  >
                    {imagenUrlInput ? (
                      <>
                        <img
                          src={imagenUrlInput}
                          alt="Previsualización"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImagenUrlInput("")}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-mono"
                        >
                          Quitar
                        </button>
                      </>
                    ) : (
                      <Image size={24} className="text-zinc-500" />
                    )}
                  </div>

                  {/* Campo de carga / URL */}
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imagenUrlInput}
                        onChange={(e) => setImagenUrlInput(e.target.value)}
                        placeholder="Ingresa la URL o subí un archivo..."
                        className={`${inputClass} flex-1`}
                        style={inputStyle}
                        disabled={uploadingImage}
                      />
                      
                      <label
                        htmlFor={uploadingImage ? undefined : "product-image-upload"}
                        className={`flex-shrink-0 cursor-pointer h-[42px] px-4 rounded-xl flex items-center justify-center text-xs font-semibold text-white transition-all bg-[#FF5A00] hover:bg-[#e04e00] select-none ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploadingImage ? "Subiendo..." : "Subir archivo"}
                      </label>
                      <input
                        type="file"
                        id="product-image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                      />
                    </div>
                    
                    <p className="text-[10px]" style={{ color: "var(--tfs-text-muted)" }}>
                      Formatos recomendados: WEBP, PNG, JPG (máx. 5MB).
                    </p>

                    {uploadError && (
                      <p className="text-[11px] text-red-400 mt-1">
                        {uploadError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid: Disponible */}
              <div className="pt-2">
                {/* Disponible Checkbox */}
                <div
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all hover:bg-[var(--tfs-input-bg)]/80"
                  style={{ background: "var(--tfs-input-bg)", border: "1px solid var(--tfs-input-border)" }}
                >
                  <Controller
                    name="disponible"
                    control={control}
                    render={({ field }: any) => (
                      <input
                        type="checkbox"
                        id="disponible"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                      />
                    )}
                  />
                  <label htmlFor="disponible" className="text-sm cursor-pointer select-none font-medium" style={{ color: "var(--tfs-text-primary)" }}>
                    Disponible para venta
                    <span className="block text-xs font-mono tracking-wider mt-0.5" style={{ color: "var(--tfs-text-muted)" }}>
                      Habilita o deshabilita la compra del producto en la carta.
                    </span>
                  </label>
                </div>
              </div>

              {/* Sección Categorías */}
              <div className="space-y-3 pt-2">
                <FieldLabel required>Categorías asociadas</FieldLabel>
                <div
                  className="rounded-xl p-4 space-y-2 border max-h-[160px] overflow-y-auto"
                  style={{ borderColor: "var(--tfs-input-border)", background: "var(--tfs-input-bg)" }}
                >
                  {categorias.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "var(--tfs-text-subtle)" }}>
                      Cargando categorías...
                    </p>
                  ) : (
                    categorias.map((cat) => {
                      const isChecked = !!selectedCategorias[cat.id];
                      const isPrincipal = categoriaPrincipalId === cat.id;

                      return (
                        <div key={cat.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`cat-${cat.id}`}
                              checked={isChecked}
                              onChange={(e) => handleCategoriaCheckboxChange(cat.id, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                            />
                            <label htmlFor={`cat-${cat.id}`} className="cursor-pointer select-none" style={{ color: "var(--tfs-text-primary)" }}>
                              {cat.nombre}
                            </label>
                          </div>
                          {isChecked && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                id={`cat-principal-${cat.id}`}
                                name="categoriaPrincipal"
                                checked={isPrincipal}
                                onChange={() => setCategoriaPrincipalId(cat.id)}
                                className="w-3.5 h-3.5 border-gray-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                              />
                              <label htmlFor={`cat-principal-${cat.id}`} className="text-xs cursor-pointer select-none" style={{ color: "var(--tfs-text-muted)" }}>
                                Principal
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Receta / Ingredientes */}
            <div className="space-y-5 flex flex-col">
              <div className="flex items-center justify-between border-b pb-2 mb-3" style={{ borderColor: "var(--tfs-border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#FF5A00]">02.</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Receta (Insumos/Ingredientes)</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ingrediente_id: insumos[0]?.id ?? 0, cantidad: 1, unidad_medida_id: null, es_removible: false })}
                  disabled={insumos.length === 0}
                  className="h-7 gap-1 border-[#FF5A00]/30 hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 text-xs text-[#FF5A00] px-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                  Agregar
                </Button>
              </div>

              {/* Lista de ingredientes dinámicos */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1">
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl" style={{ borderColor: "var(--tfs-input-border)" }}>
                    <div className="mb-1.5">{insumos.length === 0 ? <AlertTriangle size={24} className="text-amber-500 mx-auto" /> : <Package size={24} className="text-zinc-500 mx-auto" />}</div>
                    {insumos.length === 0 ? (
                      <>
                        <p className="text-xs font-semibold" style={{ color: "var(--tfs-text-primary)" }}>
                          No hay insumos cargados en el sistema.
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: "var(--tfs-text-muted)" }}>
                          Creá insumos desde el módulo de Inventario antes de componer la receta.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs" style={{ color: "var(--tfs-text-subtle)" }}>
                          Este plato no tiene ingredientes asignados aún.
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: "var(--tfs-text-muted)" }}>
                          Haz clic en "Agregar" para componer su receta.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  fields.map((field: any, index: number) => {
                    const ingId = watchedIngredientes[index]?.ingrediente_id;
                    const ingredienteSeleccionado = insumos.find((i) => i.id === Number(ingId));
                    const simboloMedida = ingredienteSeleccionado?.unidad_medida?.simbolo ?? "";

                    return (
                      <div
                        key={field.id}
                        className="p-3.5 rounded-xl border space-y-3 relative group animate-fade-in"
                        style={{
                          background: "var(--tfs-input-bg)",
                          borderColor: "var(--tfs-input-border)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800/40 transition-colors"
                          title="Eliminar ingrediente"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="grid grid-cols-1 gap-2.5">
                          {/* Selector de Insumo */}
                          <div className="space-y-1">
                            <FieldLabel required>Insumo / Ingrediente</FieldLabel>
                            <Controller
                              name={`ingredientes.${index}.ingrediente_id`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field: selectField }: any) => (
                                <IngredientCombobox
                                  value={selectField.value}
                                  onChange={selectField.onChange}
                                  insumos={insumos}
                                />
                              )}
                            />
                          </div>

                          {/* Detalles del Insumo Seleccionado */}
                          {ingredienteSeleccionado && (
                            <div className="text-[11px] font-mono flex items-center justify-between px-3 py-1.5 rounded-lg border" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", borderColor: "var(--tfs-border-subtle)", color: "var(--tfs-text-muted)" }}>
                              <span>Disponibilidad: <strong style={{ color: Number(ingredienteSeleccionado.stock_actual) <= Number(ingredienteSeleccionado.stock_minimo) && Number(ingredienteSeleccionado.stock_minimo) > 0 ? "#FF5A00" : "var(--tfs-text-primary)" }}>{Number(ingredienteSeleccionado.stock_actual)} {simboloMedida}</strong></span>
                              <span>Costo: <strong style={{ color: "var(--tfs-text-primary)" }}>${Number(ingredienteSeleccionado.costo_unitario).toFixed(2)}</strong></span>
                            </div>
                          )}

                          {/* Grid interno: Cantidad y Unidad */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <FieldLabel required>Cantidad</FieldLabel>
                              <Controller
                                name={`ingredientes.${index}.cantidad`}
                                control={control}
                                rules={{
                                  required: true,
                                  min: { value: 0.001, message: "Debe ser > 0" },
                                }}
                                render={({ field: qtyField }: any) => (
                                  <input
                                    type="number"
                                    step="0.001"
                                    {...qtyField}
                                    onChange={(e) => qtyField.onChange(parseFloat(e.target.value) || 0)}
                                    placeholder="1.000"
                                    className={`${inputClass} h-9 py-1`}
                                    style={inputStyle}
                                  />
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              <FieldLabel>Unidad Medida</FieldLabel>
                              <div
                                className={`${inputClass} h-9 flex items-center text-xs select-none`}
                                style={{
                                  ...inputStyle,
                                  background: "rgba(255,255,255,0.01)",
                                  borderColor: "var(--tfs-border-subtle)",
                                  opacity: 0.7,
                                }}
                              >
                                {simboloMedida || "—"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Removible Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                          <Controller
                            name={`ingredientes.${index}.es_removible`}
                            control={control}
                            render={({ field: chkField }: any) => (
                              <input
                                type="checkbox"
                                id={`ing-removible-${index}`}
                                checked={chkField.value}
                                onChange={chkField.onChange}
                                className="w-4 h-4 rounded border-gray-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                              />
                            )}
                          />
                          <label
                            htmlFor={`ing-removible-${index}`}
                            className="text-xs cursor-pointer select-none flex items-center gap-1 text-[var(--tfs-text-muted)]"
                          >
                            El cliente puede quitar este ingrediente del plato
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="px-4 py-3 rounded-xl text-xs font-mono mt-5" style={{ background: "rgba(193,18,31,0.1)", border: "1px solid rgba(193,18,31,0.25)", color: "#e85d74" }}>
              {serverError}
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
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
