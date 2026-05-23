import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Smartphone, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  AlertCircle, 
  Loader2, 
  Lock 
} from "lucide-react";
import { getMiPerfil, actualizarPerfil, UsuarioPerfil } from "@/features/profile/services/profileService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { toast } from "sonner";

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

export function AdminProfilePage() {
  const [profile, setProfile] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form Fields
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [celular, setCelular] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMiPerfil();
      setProfile(data);
      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setCelular(data.celular || "");
    } catch (err) {
      toast.error("Error al obtener los datos de tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCancel = () => {
    if (profile) {
      setNombre(profile.nombre || "");
      setApellido(profile.apellido || "");
      setCelular(profile.celular || "");
    }
    setEditMode(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.warning("El nombre es un campo obligatorio.");
      return;
    }

    try {
      setSaving(true);
      const updated = await actualizarPerfil({
        nombre: nombre.trim(),
        apellido: apellido.trim() || undefined,
        celular: celular.trim() || undefined,
      });
      setProfile(updated);
      toast.success("¡Perfil administrativo actualizado con éxito!");
      setEditMode(false);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar tu perfil.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (n: string, a?: string) => {
    const first = n?.[0]?.toUpperCase() ?? "";
    const last = a?.[0]?.toUpperCase() ?? "";
    return first + last || "A";
  };

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-4xl mx-auto text-white">
      <BackToDashboard />

      {/* Cabecera */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
          <User size={11} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span className="text-[9px] tracking-[0.45em] uppercase text-neutral-400">
            Ajustes Personales
          </span>
        </div>
        <h2
          className="leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
        >
          Mi <span className="font-semibold text-orange-500">Perfil Admin</span>
        </h2>
        <p className="text-xs text-neutral-400 font-mono tracking-wider">
          Mantené tu información de contacto actualizada para las notificaciones internas.
        </p>
        <div className="mt-5 h-[1px] bg-gradient-to-right from-orange-500/40 via-orange-500/5 to-transparent" />
      </div>

      {loading ? (
        <div className="text-center py-24 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl backdrop-blur-xl">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-xs font-mono tracking-widest text-neutral-500">Cargando credenciales administrativas...</p>
        </div>
      ) : !profile ? (
        <div className="text-center py-16 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl backdrop-blur-xl space-y-3">
          <AlertCircle size={32} className="text-red-500 mx-auto" />
          <p className="text-sm font-bold">Error de perfil</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Tarjeta Visual del Admin (Izquierda) */}
          <div className="md:col-span-5 bg-[#0E0E0E]/60 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute -inset-4 bg-orange-500/5 rounded-[40px] blur-2xl pointer-events-none" />
            
            {/* Avatar Iniciales */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-3xl shadow-xl shadow-orange-500/10 border border-white/10">
              {getInitials(profile.nombre, profile.apellido)}
            </div>

            {/* Datos Resumen */}
            <div className="space-y-2 relative">
              <h3 className="text-lg font-black tracking-tight uppercase leading-none">
                {profile.nombre} {profile.apellido}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">@{profile.username}</p>
              
              {/* Badge del Rol Administrativo */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono">
                <Shield size={12} />
                {profile.roles?.[0] || "ADMIN"}
              </div>
            </div>

            <hr className="w-full border-white/5" />

            {/* Datos Técnicos de Cuenta (Seguridad) */}
            <div className="w-full space-y-3 text-left text-xs font-mono text-neutral-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><Mail size={12} /> Email:</span>
                <span className="text-white text-right break-all">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><Lock size={12} /> Seguridad:</span>
                <span className="text-green-500">Verificado</span>
              </div>
            </div>
          </div>

          {/* Formulario de Configuración (Derecha) */}
          <div className="md:col-span-7 bg-[#0E0E0E]/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative">
            <SectionLabel label="Información de la Cuenta" code="01" />

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500">
                  Nombre <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={!editMode}
                  placeholder="Tu nombre"
                  className="w-full text-xs px-4 py-3 bg-white/[0.02] border border-white/5 focus:border-orange-500/50 rounded-xl outline-none text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Apellido */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500">
                  Apellido
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={!editMode}
                  placeholder="Tu apellido"
                  className="w-full text-xs px-4 py-3 bg-white/[0.02] border border-white/5 focus:border-orange-500/50 rounded-xl outline-none text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Celular */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider uppercase text-neutral-500 flex items-center gap-1">
                  <Smartphone size={10} /> Celular
                </label>
                <input
                  type="text"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  disabled={!editMode}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full text-xs px-4 py-3 bg-white/[0.02] border border-white/5 focus:border-orange-500/50 rounded-xl outline-none text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end pt-2">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-white/5"
                  >
                    <Edit3 size={14} />
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2.5 bg-neutral-900 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white rounded-xl cursor-pointer transition-all"
                    >
                      <X size={14} className="inline mr-1" /> Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-orange-500/10"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Guardar Ajustes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </form>
          </div>

        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-[9px] text-center tracking-[0.4em] uppercase text-neutral-500 font-mono">
          The Food Store · Perfil Admin · 2026
        </p>
      </div>
    </div>
  );
}
