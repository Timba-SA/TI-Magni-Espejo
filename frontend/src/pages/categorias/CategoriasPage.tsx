import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, AlertTriangle, Download, Play, Pause } from "lucide-react";
import type { Categoria, CategoriaFormData } from "@/features/categorias/types/categoria.types";
import { getCategorias, createCategoria, deleteCategoria, exportarCategorias, toggleActiveCategoria } from "@/features/categorias/services/categoriasService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { getCurrentUser } from "@/features/auth/services/authService";

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--tfs-divider)" }} />
    </div>
  );
}

// Estilos reutilizables para inputs de la página
const inputBaseStyle = {
  background: "var(--tfs-input-bg)",
  border: "1px solid var(--tfs-input-border)",
  color: "var(--tfs-text-heading)",
};

// ─── Página principal ─────────────────────────────────────────────────────────
export function CategoriasPage() {
  const user = getCurrentUser();
  const isAdmin = user?.rol === "ADMIN";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias(skip, limit);
      setCategorias(data.items);
      setTotal(data.total);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, [skip, limit]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setFormError("El nombre es obligatorio."); return; }
    setSaving(true);
    setFormError(null);
    try {
      const data: CategoriaFormData = { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined };
      await createCategoria(data);
      setNombre("");
      setDescripcion("");
      if (skip === 0) {
        await fetchCategorias();
      } else {
        setSkip(0); // This will trigger the useEffect
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al crear la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategoria(id);
      setConfirmDelete(null);
      await fetchCategorias();
    } catch {
      setError("No se pudo eliminar la categoría.");
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActiveCategoria(id);
      await fetchCategorias();
    } catch {
      setError("No se pudo cambiar el estado de la categoría.");
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportarCategorias();
    } catch (err) {
      setError("Error al exportar categorías a Excel.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-4xl mx-auto">
      <BackToDashboard />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
          <Tag size={10} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "var(--tfs-text-subtle)" }}>
            Panel de gestión
          </span>
        </div>
        <h2
          className="leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, letterSpacing: "-0.02em", color: "var(--tfs-text-heading)" }}
        >
          Gestión de <span style={{ color: "#FF5A00", fontWeight: 600 }}>Categorías</span>
        </h2>
        <p className="text-xs" style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}>
          Las categorías que crees acá estarán disponibles al cargar insumos.
        </p>
        <div className="mt-5" style={{ height: 1, background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)" }} />
      </div>

      {/* ── Formulario ─────────────────────────────────────────────── */}
      {isAdmin && (
        <div>
          <SectionLabel label="Nueva categoría" code="01" />
          <form
            onSubmit={handleCreate}
            style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)", padding: "1.5rem" }}
            className="space-y-4"
          >
            <div style={{ height: 1, background: "rgba(255,90,0,0.25)", marginBottom: "0.5rem" }} />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                  Nombre <span style={{ color: "#FF5A00" }}>*</span>
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carnes, Lácteos..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tfs-input-border)"; }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                  Descripción
                </label>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tfs-input-border)"; }}
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "#C1121F" }}>
                <AlertTriangle size={12} /> {formError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ background: "#FF5A00", color: "#fff" }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#e04e00"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FF5A00"; }}
              >
                <Plus size={14} />
                {saving ? "Guardando..." : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Listado ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <SectionLabel label={`Categorías registradas`} code="02" />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all duration-200 border"
            style={{ 
              background: "var(--tfs-card-bg)", 
              color: "var(--tfs-text-heading)", 
              borderColor: "var(--tfs-border-subtle)" 
            }}
            onMouseEnter={(e) => { if(!exporting) e.currentTarget.style.borderColor = "#FF5A00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--tfs-border-subtle)"; }}
          >
            <Download size={14} />
            {exporting ? "Exportando..." : "Exportar a Excel"}
          </button>
        </div>

        {error && (
          <p className="text-xs mb-4 flex items-center gap-2" style={{ color: "#C1121F" }}>
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        {loading ? (
          <p className="text-xs font-mono tracking-widest" style={{ color: "var(--tfs-text-muted)" }}>
            Cargando...
          </p>
        ) : categorias.length === 0 ? (
          <div
            style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)", padding: "2rem" }}
            className="text-center"
          >
            <p className="text-xs font-mono tracking-widest" style={{ color: "var(--tfs-text-subtle)" }}>
              No hay categorías registradas aún.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-4 py-3 transition-all duration-150"
                style={{
                  background: "var(--tfs-card-bg)",
                  border: "1px solid var(--tfs-border-subtle)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,90,0,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--tfs-border-subtle)"; }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[8px] font-mono tracking-widest"
                    style={{ color: "var(--tfs-text-subtle)" }}
                  >
                    #{String(cat.id).padStart(3, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium flex items-center" style={{ color: "var(--tfs-text-heading)" }}>
                      {cat.nombre}
                      {!cat.is_active && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Inactivo
                        </span>
                      )}
                    </p>
                    {cat.descripcion && (
                      <p className="text-xs" style={{ color: "var(--tfs-text-muted)" }}>{cat.descripcion}</p>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  confirmDelete === cat.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--tfs-text-muted)" }}>¿Eliminar?</span>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-xs px-3 py-1 rounded transition-all"
                        style={{ background: "rgba(193,18,31,0.15)", color: "#C1121F", border: "1px solid rgba(193,18,31,0.25)" }}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-3 py-1 rounded transition-all"
                        style={{ background: "var(--tfs-input-bg)", color: "var(--tfs-text-muted)", border: "1px solid var(--tfs-border-subtle)" }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(cat.id)}
                        className="p-2 rounded transition-all duration-150"
                        style={{ color: "var(--tfs-text-subtle)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#FFC107"; e.currentTarget.style.background = "rgba(255,193,7,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--tfs-text-subtle)"; e.currentTarget.style.background = "transparent"; }}
                        title={cat.is_active ? "Inhabilitar" : "Habilitar"}
                      >
                        {cat.is_active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cat.id)}
                        className="p-2 rounded transition-all duration-150"
                        style={{ color: "var(--tfs-text-subtle)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#C1121F"; e.currentTarget.style.background = "rgba(193,18,31,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--tfs-text-subtle)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
            
            <div className="pt-4 pb-2">
              <DataTablePagination
                total={total}
                skip={skip}
                limit={limit}
                onPageChange={(newSkip) => setSkip(newSkip)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setSkip(0);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: "1px solid var(--tfs-divider)" }}>
        <p className="text-[9px] text-center tracking-[0.4em] uppercase" style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}>
          The Food Store · Sistema de gestión interna · 2026
        </p>
      </div>
    </div>
  );
}
