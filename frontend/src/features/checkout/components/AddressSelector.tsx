import React, { useEffect, useState } from "react";
import { MapPin, Plus, Loader2, Home, Briefcase, Info, Store, Truck } from "lucide-react";
import { listarDirecciones } from "../services/checkoutService";
import { NewAddressModal } from "./NewAddressModal";
import type { Direccion } from "../types/checkout.types";

export type TipoEntrega = "RETIRO" | "ENVIO";

interface AddressSelectorProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  tipoEntrega: TipoEntrega;
  onTipoEntregaChange: (tipo: TipoEntrega) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedId,
  onSelect,
  tipoEntrega,
  onTipoEntregaChange,
}) => {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await listarDirecciones();
      setDirecciones(data);

      // Pre-seleccionar la principal o la primera disponible solo si es envío
      if (data.length > 0 && selectedId === null && tipoEntrega === "ENVIO") {
        const principal = data.find((d) => d.es_principal);
        onSelect(principal ? principal.id : data[0].id);
      }
    } catch (error) {
      console.error("Error al cargar direcciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleTipoChange = (tipo: TipoEntrega) => {
    onTipoEntregaChange(tipo);
    if (tipo === "RETIRO") {
      onSelect(null);
    } else if (tipo === "ENVIO" && selectedId === null && direcciones.length > 0) {
      const principal = direcciones.find((d) => d.es_principal);
      onSelect(principal ? principal.id : direcciones[0].id);
    }
  };

  const handleNewAddressSuccess = (newAddress: Direccion) => {
    setDirecciones((prev) => [...prev, newAddress]);
    onSelect(newAddress.id);
  };

  const getAliasIcon = (alias?: string) => {
    const term = alias?.toLowerCase() || "";
    if (term.includes("casa") || term.includes("hogar")) return <Home size={16} />;
    if (term.includes("trabajo") || term.includes("oficina") || term.includes("laburo")) return <Briefcase size={16} />;
    return <MapPin size={16} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-orange-500" />
        <h4 className="font-bold text-white text-base">Modo de Entrega</h4>
      </div>

      {/* Toggle Retiro / Envío */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleTipoChange("RETIRO")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
            tipoEntrega === "RETIRO"
              ? "bg-orange-500/5 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
              : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5"
          }`}
        >
          <span
            className={`p-2 rounded-xl border ${
              tipoEntrega === "RETIRO"
                ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                : "bg-white/5 border-white/5 text-neutral-400"
            }`}
          >
            <Store size={18} />
          </span>
          <div className="text-center">
            <p className={`text-sm font-bold ${tipoEntrega === "RETIRO" ? "text-white" : "text-neutral-300"}`}>
              Retiro en el local
            </p>
            <p className="text-xs text-green-400 font-semibold mt-0.5">Gratis</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTipoChange("ENVIO")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer ${
            tipoEntrega === "ENVIO"
              ? "bg-orange-500/5 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
              : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5"
          }`}
        >
          <span
            className={`p-2 rounded-xl border ${
              tipoEntrega === "ENVIO"
                ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                : "bg-white/5 border-white/5 text-neutral-400"
            }`}
          >
            <Truck size={18} />
          </span>
          <div className="text-center">
            <p className={`text-sm font-bold ${tipoEntrega === "ENVIO" ? "text-white" : "text-neutral-300"}`}>
              Envío a domicilio
            </p>
            <p className="text-xs text-neutral-400 font-semibold mt-0.5">+ $50,00</p>
          </div>
        </button>
      </div>

      {/* Retiro en local: info del local */}
      {tipoEntrega === "RETIRO" && (
        <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <Store size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-white">Pasá a buscar tu pedido al local</p>
            <p className="text-neutral-400">Te avisamos cuando esté listo para que pases a retirarlo.</p>
          </div>
        </div>
      )}

      {/* Envío a domicilio: lista de direcciones */}
      {tipoEntrega === "ENVIO" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">Seleccioná una dirección de entrega</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-orange-500 font-bold transition-all cursor-pointer"
            >
              <Plus size={14} />
              Nueva Dirección
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8 bg-white/[0.01] border border-white/5 rounded-2xl">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              <span className="ml-2.5 text-sm text-neutral-400 font-medium">Buscando tus direcciones...</span>
            </div>
          ) : direcciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white/[0.01] border border-white/5 rounded-2xl text-center space-y-3">
              <Info size={28} className="text-neutral-500" />
              <div>
                <h5 className="font-bold text-white text-sm">No tenés direcciones cargadas</h5>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Registrá una dirección para poder enviarte tu comida calentita.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
              >
                Agregar Dirección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {direcciones.map((d) => {
                const isSelected = selectedId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => onSelect(d.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-orange-500/5 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                        : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg border ${
                            isSelected
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                              : "bg-white/5 border-white/5 text-neutral-400"
                          }`}
                        >
                          {getAliasIcon(d.alias)}
                        </span>
                        <span className="font-bold text-sm text-white truncate max-w-[120px]">
                          {d.alias || "Dirección"}
                        </span>
                      </div>
                      {d.es_principal && (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-md border border-orange-500/10 font-bold uppercase tracking-wider">
                          Principal
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-neutral-200 leading-tight">{d.linea1}</p>
                      {d.linea2 && <p className="text-neutral-400">{d.linea2}</p>}
                      <p className="text-neutral-400 font-medium">
                        {d.ciudad}
                        {d.codigo_postal ? `, CP ${d.codigo_postal}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <NewAddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleNewAddressSuccess}
      />
    </div>
  );
};
