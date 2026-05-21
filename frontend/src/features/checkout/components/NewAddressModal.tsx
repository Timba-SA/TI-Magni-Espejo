import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { crearDireccion } from "../services/checkoutService";
import type { Direccion } from "../types/checkout.types";

interface NewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAddress: Direccion) => void;
}

export const NewAddressModal: React.FC<NewAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [alias, setAlias] = useState("");
  const [linea1, setLinea1] = useState("");
  const [linea2, setLinea2] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("Buenos Aires");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linea1.trim() || !ciudad.trim()) {
      toast.error("Por favor completa los campos obligatorios (Calle y Altura, Ciudad)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await crearDireccion({
        alias: alias.trim() || undefined,
        linea1: linea1.trim(),
        linea2: linea2.trim() || undefined,
        ciudad: ciudad.trim(),
        provincia: provincia.trim() || undefined,
        codigo_postal: codigoPostal.trim() || undefined,
      });

      toast.success("¡Dirección registrada con éxito, loco!");
      onSuccess(result);
      onClose();
      // Reset form
      setAlias("");
      setLinea1("");
      setLinea2("");
      setCiudad("");
      setProvincia("Buenos Aires");
      setCodigoPostal("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al registrar la dirección");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-[#0E0E0E]/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Nueva Dirección</h3>
                    <p className="text-xs text-neutral-400">Registrá dónde querés recibir tu pedido</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Alias (ej: Casa, Oficina) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Nombre o Alias (Opcional)
                  </label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej: Casa, Trabajo, Novia"
                    className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Calle y Altura */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Calle y Altura <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={linea1}
                    onChange={(e) => setLinea1(e.target.value)}
                    placeholder="Ej: Av. Corrientes 1234"
                    required
                    className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Piso / Dpto (Opcional) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Piso / Departamento (Opcional)
                  </label>
                  <input
                    type="text"
                    value={linea2}
                    onChange={(e) => setLinea2(e.target.value)}
                    placeholder="Ej: Piso 3, Dpto B"
                    className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Ciudad y CP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder="Ej: CABA"
                      required
                      className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      placeholder="Ej: C1043"
                      className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    placeholder="Ej: Buenos Aires"
                    className="w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/50 rounded-xl text-white text-sm outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                {/* Button Container */}
                <div className="flex gap-3 border-t border-white/5 pt-4 mt-6 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white font-semibold text-sm transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-white/5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Dirección"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
