import { useState } from "react";
import { X, UserPlus, Eye, EyeOff, Shield } from "lucide-react";
import type { UsuarioCreateRequest } from "@/features/users/types/user.types";

interface UsuarioCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: UsuarioCreateRequest) => Promise<void>;
}

export function UsuarioCreateModal({ isOpen, onClose, onSuccess }: UsuarioCreateModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["CLIENT"]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleToggle = (rol: string) => {
    if (roles.includes(rol)) {
      if (roles.length > 1) {
        setRoles(roles.filter((r) => r !== rol));
      }
    } else {
      setRoles([...roles, rol]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim()) {
      setError("Todos los campos obligatorios deben completarse.");
      return;
    }

    if (roles.length === 0) {
      setError("Debe asignar al menos un rol al usuario.");
      return;
    }

    try {
      setLoading(true);
      await onSuccess({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        celular: celular.trim() || null,
        password: password,
        roles: roles,
      });
      // Limpiar formulario y cerrar
      setNombre("");
      setApellido("");
      setEmail("");
      setCelular("");
      setPassword("");
      setRoles(["CLIENT"]);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al crear el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card con Glassmorphism */}
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-xl border p-6 shadow-2xl transition-all duration-300"
        style={{
          background: "rgba(23, 23, 23, 0.85)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255, 90, 0, 0.15)",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 50px -10px rgba(255, 90, 0, 0.1)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b pb-4" style={{ borderColor: "rgba(255, 90, 0, 0.1)" }}>
          <div className="flex items-center gap-2.5">
            <UserPlus size={18} style={{ color: "#FF5A00" }} />
            <h2 className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Alta de Usuario
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div 
            className="mb-4 rounded border px-3 py-2 text-xs text-red-400"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full rounded border px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                style={{
                  background: "rgba(30, 30, 30, 0.6)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Apellido *</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="w-full rounded border px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
                style={{
                  background: "rgba(30, 30, 30, 0.6)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all font-mono"
              style={{
                background: "rgba(30, 30, 30, 0.6)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              placeholder="juan.perez@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Celular (Opcional)</label>
            <input
              type="text"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="w-full rounded border px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all font-mono"
              style={{
                background: "rgba(30, 30, 30, 0.6)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              placeholder="+5491122334455"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border pl-3 pr-10 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all font-mono"
                style={{
                  background: "rgba(30, 30, 30, 0.6)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t pt-3" style={{ borderColor: "rgba(255, 90, 0, 0.1)" }}>
            <div className="flex items-center gap-1.5">
              <Shield size={12} style={{ color: "#FF5A00" }} />
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Asignar Roles *</label>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {([
                { code: "ADMIN",     label: "Administrador" },
                { code: "ENCARGADO", label: "Encargado" },
                { code: "CAJERO",    label: "Cajero" },
                { code: "COCINERO",  label: "Cocinero" },
                { code: "STOCK",     label: "Gest. Stock" },
                { code: "PEDIDOS",   label: "Gest. Pedidos" },
                { code: "CLIENT",    label: "Cliente" },
              ]).map(({ code, label }) => {
                const active = roles.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleRoleToggle(code)}
                    className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded transition-all duration-200 border"
                    style={{
                      backgroundColor: active ? "rgba(255, 90, 0, 0.1)" : "transparent",
                      borderColor: active ? "rgba(255, 90, 0, 0.4)" : "rgba(255, 255, 255, 0.08)",
                      color: active ? "#FF5A00" : "var(--tfs-text-muted)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 border-t pt-4 mt-6" style={{ borderColor: "rgba(255, 90, 0, 0.1)" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded text-xs uppercase tracking-widest transition-colors duration-150 font-medium border"
              style={{
                borderColor: "rgba(255, 255, 255, 0.08)",
                background: "transparent",
                color: "var(--tfs-text-muted)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded text-xs uppercase tracking-widest transition-all duration-200 font-medium border"
              style={{
                backgroundColor: "rgba(255, 90, 0, 0.15)",
                borderColor: "rgba(255, 90, 0, 0.4)",
                color: "#FF5A00"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 90, 0, 0.25)";
                e.currentTarget.style.borderColor = "#FF5A00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 90, 0, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 90, 0, 0.4)";
              }}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
