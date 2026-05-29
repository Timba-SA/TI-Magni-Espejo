import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, AlertTriangle, Download, Play, Pause, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";
import type { Categoria, CategoriaFormData } from "@/features/categorias/types/categoria.types";
import { getCategorias, createCategoria, deleteCategoria, exportarCategorias, toggleActiveCategoria, updateCategoria } from "@/features/categorias/services/categoriasService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
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

interface CategoriaTreeNode extends Categoria {
  children: CategoriaTreeNode[];
}

// ─── Sub-componente Nodo de Árbol Recursivo ────────────────────────────────────
function CategoryNode({
  node,
  level = 0,
  isAdmin,
  onEdit,
  onToggleActive,
  onDelete,
  confirmDelete,
  setConfirmDelete,
}: {
  node: CategoriaTreeNode;
  level: number;
  isAdmin: boolean;
  onEdit: (cat: Categoria) => void;
  onToggleActive: (id: number) => void;
  onDelete: (id: number) => void;
  confirmDelete: number | null;
  setConfirmDelete: (id: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between px-4 py-3.5 transition-all duration-150 relative rounded-xl"
        style={{
          background: "var(--tfs-card-bg)",
          border: "1px solid var(--tfs-border-subtle)",
          marginLeft: `${level * 20}px`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,90,0,0.25)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--tfs-border-subtle)"; }}
      >
        {/* Línea conectora visual para niveles anidados */}
        {level > 0 && (
          <div
            className="absolute top-0 bottom-0 border-l border-dashed"
            style={{
              left: "-11px",
              borderColor: "rgba(255,90,0,0.2)",
              width: "1px",
            }}
          />
        )}

        <div className="flex items-center gap-2.5">
          {/* Botón de expandir/colapsar si tiene hijos */}
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-[22px]" /> // Espacio de relleno si no hay hijos
          )}

          <span className="text-[8px] font-mono tracking-widest text-zinc-500">
            #{String(node.id).padStart(3, "0")}
          </span>
          <div>
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--tfs-text-heading)" }}>
              {node.nombre}
              {!node.is_active && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-zinc-800 text-zinc-500 border border-zinc-700">
                  Inactivo
                </span>
              )}
            </p>
            {node.descripcion && (
              <p className="text-xs mt-0.5" style={{ color: "var(--tfs-text-muted)" }}>
                {node.descripcion}
              </p>
            )}
          </div>
        </div>

        {isAdmin && (
          confirmDelete === node.id ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">¿Borrar?</span>
              <button
                onClick={() => onDelete(node.id)}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: "rgba(193,18,31,0.15)", color: "#C1121F", border: "1px solid rgba(193,18,31,0.25)" }}
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: "var(--tfs-input-bg)", color: "var(--tfs-text-muted)", border: "1px solid var(--tfs-border-subtle)" }}
              >
                No
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(node)}
                className="p-2 rounded-lg transition-all duration-150 text-zinc-400 hover:text-[#FF5A00] hover:bg-zinc-800/40"
                title="Editar"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onToggleActive(node.id)}
                className="p-2 rounded-lg transition-all duration-150 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/40"
                title={node.is_active ? "Inhabilitar" : "Habilitar"}
              >
                {node.is_active ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={() => setConfirmDelete(node.id)}
                className="p-2 rounded-lg transition-all duration-150 text-zinc-400 hover:text-[#C1121F] hover:bg-zinc-800/40"
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        )}
      </div>

      {/* Renderizado de hijos recursivos */}
      {hasChildren && expanded && (
        <div className="relative mt-1.5 mb-1.5">
          {/* Guía lateral de anidamiento larga */}
          <div
            className="absolute top-0 bottom-0 border-l border-dashed"
            style={{
              left: `${level * 20 + 10}px`,
              borderColor: "rgba(255,90,0,0.1)",
              width: "1px",
            }}
          />
          <div className="space-y-1.5">
            {node.children.map((child) => (
              <CategoryNode
                key={child.id}
                node={child}
                level={level + 1}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export function CategoriasPage() {
  const user = getCurrentUser();
  const isAdmin = user?.rol === "ADMIN";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [parentId, setParentId] = useState<number | string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      // Solicitamos el límite máximo permitido por el backend (100) para traer todo el conjunto y armar el árbol completo localmente
      const data = await getCategorias(0, 100);
      setCategorias(data.items);
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Construcción de la jerarquía de árbol en memoria
  const buildTree = (list: Categoria[]): CategoriaTreeNode[] => {
    const map: { [key: number]: CategoriaTreeNode } = {};
    const roots: CategoriaTreeNode[] = [];

    // Inicializar mapa de nodos
    list.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    // Enlazar hijos con padres
    list.forEach((item) => {
      const node = map[item.id];
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Función recursiva para detectar todos los IDs descendientes (prevención de bucles)
  const getDescendantIds = (list: Categoria[], parentId: number): Set<number> => {
    const descendants = new Set<number>();
    const queue = [parentId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = list.filter((c) => c.parent_id === current);
      children.forEach((c) => {
        if (!descendants.has(c.id)) {
          descendants.add(c.id);
          queue.push(c.id);
        }
      });
    }
    return descendants;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const data: CategoriaFormData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        parent_id: parentId ? Number(parentId) : undefined,
      };

      if (editingId) {
        await updateCategoria(editingId, data);
        setEditingId(null);
      } else {
        await createCategoria(data);
      }

      setNombre("");
      setDescripcion("");
      setParentId("");
      await fetchCategorias();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al procesar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || "");
    setParentId(cat.parent_id || "");
    setFormError(null);
    // Scroll suave hasta el formulario de arriba
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre("");
    setDescripcion("");
    setParentId("");
    setFormError(null);
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
    } catch {
      setError("Error al exportar categorías a Excel.");
    } finally {
      setExporting(false);
    }
  };

  // Filtrado de padres disponibles para evitar auto-referencias y ciclos recursivos infinitos
  const excludedIds = editingId ? getDescendantIds(categorias, editingId) : new Set<number>();
  if (editingId) {
    excludedIds.add(editingId);
  }
  const padresDisponibles = categorias.filter((c) => !excludedIds.has(c.id));

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
          Las categorías que crees acá estarán disponibles al cargar insumos y configurar productos.
        </p>
        <div className="mt-5" style={{ height: 1, background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)" }} />
      </div>

      {/* ── Formulario ─────────────────────────────────────────────── */}
      {isAdmin && (
        <div>
          <SectionLabel
            label={editingId ? `Editando categoría #${String(editingId).padStart(3, "0")}` : "Nueva categoría"}
            code="01"
          />
          <form
            onSubmit={handleCreate}
            style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)", padding: "1.5rem" }}
            className="space-y-4 rounded-2xl relative overflow-hidden"
          >
            <div style={{ height: 1, background: "rgba(255,90,0,0.25)", marginBottom: "0.5rem" }} />

            <div className="grid md:grid-cols-3 gap-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                  Nombre <span style={{ color: "#FF5A00" }}>*</span>
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carnes, Vinos..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tfs-input-border)"; }}
                />
              </div>

              {/* Descripción */}
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

              {/* Categoría Padre */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--tfs-text-muted)" }}>
                  Categoría Padre
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all duration-200 cursor-pointer appearance-none"
                  style={{
                    ...inputBaseStyle,
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.25rem",
                    backgroundRepeat: "no-repeat",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,90,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--tfs-input-border)"; }}
                >
                  <option value="" style={{ background: "var(--tfs-card-bg)" }}>
                    Ninguna (Categoría Raíz)
                  </option>
                  {padresDisponibles.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      style={{ background: "var(--tfs-card-bg)", color: "var(--tfs-text-heading)" }}
                    >
                      {cat.nombre} {cat.parent_id ? `(Subcategoría)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "#C1121F" }}>
                <AlertTriangle size={12} /> {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-xl transition-all duration-200 border"
                  style={{
                    background: "transparent",
                    color: "var(--tfs-text-muted)",
                    borderColor: "var(--tfs-border-subtle)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,90,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--tfs-border-subtle)"; }}
                >
                  <X size={13} />
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                style={{ background: "#FF5A00", color: "#fff" }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#e04e00"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FF5A00"; }}
              >
                <Plus size={14} />
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Listado en Árbol ─────────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <SectionLabel label="Árbol de categorías" code="02" />
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
          <p className="text-xs font-mono tracking-widest text-zinc-500 animate-pulse">
            Cargando jerarquías...
          </p>
        ) : categorias.length === 0 ? (
          <div
            style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)", padding: "2rem" }}
            className="text-center rounded-2xl"
          >
            <p className="text-xs font-mono tracking-widest" style={{ color: "var(--tfs-text-subtle)" }}>
              No hay categorías registradas aún.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {buildTree(categorias).map((rootNode) => (
              <CategoryNode
                key={rootNode.id}
                node={rootNode}
                level={0}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
              />
            ))}
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
