import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, AlertTriangle } from "lucide-react";
import type { Categoria, CategoriaFormData } from "@/features/categorias/types/categoria.types";
import { getCategorias, createCategoria, deleteCategoria } from "@/features/categorias/services/categoriasService";

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
      <div style={{ flex: 1, height: 1, background: "rgba(248,248,248,0.04)" }} />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
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
      const data = await getCategorias();
      setCategorias(data);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

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
      await fetchCategorias();
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

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-4xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
          <Tag size={10} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "rgba(248,248,248,0.2)" }}>
            Panel de gestión
          </span>
        </div>
        <h2
          className="leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8E8E8" }}
        >
          Gestión de <span style={{ color: "#FF5A00", fontWeight: 600 }}>Categorías</span>
        </h2>
        <p className="text-xs" style={{ color: "rgba(248,248,248,0.28)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}>
          Las categorías que crees acá estarán disponibles al cargar insumos.
        </p>
        <div className="mt-5" style={{ height: 1, background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)" }} />
      </div>

      {/* ── Formulario ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Nueva categoría" code="01" />
        <form
          onSubmit={handleCreate}
          style={{ background: "#0F0F0F", border: "1px solid rgba(248,248,248,0.06)", padding: "1.5rem" }}
          className="space-y-4"
        >
          <div style={{ height: 1, background: "rgba(255,90,0,0.25)", marginBottom: "0.5rem" }} />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "rgba(248,248,248,0.35)" }}>
                Nombre <span style={{ color: "#FF5A00" }}>*</span>
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carnes, Lácteos..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8E8E8",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "rgba(248,248,248,0.35)" }}>
                Descripción
              </label>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#E8E8E8",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
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

      {/* ── Listado ─────────────────────────────────────────────────── */}
      <div>
        <SectionLabel label={`Categorías registradas (${categorias.length})`} code="02" />

        {error && (
          <p className="text-xs mb-4 flex items-center gap-2" style={{ color: "#C1121F" }}>
            <AlertTriangle size={13} /> {error}
          </p>
        )}

        {loading ? (
          <p className="text-xs font-mono tracking-widest" style={{ color: "rgba(248,248,248,0.3)" }}>
            Cargando...
          </p>
        ) : categorias.length === 0 ? (
          <div
            style={{ background: "#0F0F0F", border: "1px solid rgba(248,248,248,0.05)", padding: "2rem" }}
            className="text-center"
          >
            <p className="text-xs font-mono tracking-widest" style={{ color: "rgba(248,248,248,0.2)" }}>
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
                  background: "#0F0F0F",
                  border: "1px solid rgba(248,248,248,0.05)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,90,0,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(248,248,248,0.05)"; }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[8px] font-mono tracking-widest"
                    style={{ color: "rgba(248,248,248,0.2)" }}
                  >
                    #{String(cat.id).padStart(3, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#E8E8E8" }}>{cat.nombre}</p>
                    {cat.descripcion && (
                      <p className="text-xs" style={{ color: "rgba(248,248,248,0.3)" }}>{cat.descripcion}</p>
                    )}
                  </div>
                </div>

                {confirmDelete === cat.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "rgba(248,248,248,0.4)" }}>¿Eliminar?</span>
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
                      style={{ background: "rgba(248,248,248,0.05)", color: "rgba(248,248,248,0.5)" }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(cat.id)}
                    className="p-2 rounded transition-all duration-150"
                    style={{ color: "rgba(248,248,248,0.2)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#C1121F"; e.currentTarget.style.background = "rgba(193,18,31,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(248,248,248,0.2)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(248,248,248,0.03)" }}>
        <p className="text-[9px] text-center tracking-[0.4em] uppercase" style={{ color: "rgba(248,248,248,0.1)", fontFamily: "'Space Mono', monospace" }}>
          The Food Store · Sistema de gestión interna · 2026
        </p>
      </div>
    </div>
  );
}
