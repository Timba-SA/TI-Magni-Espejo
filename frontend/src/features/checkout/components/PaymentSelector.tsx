import React, { useEffect, useState } from "react";
import { CreditCard, Wallet, Banknote, Loader2, Info } from "lucide-react";
import { listarFormasPago } from "../services/checkoutService";
import type { FormaPago } from "../types/checkout.types";

interface PaymentSelectorProps {
  selectedCode: string | null;
  onSelect: (codigo: string) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selectedCode,
  onSelect,
}) => {
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const data = await listarFormasPago();
        const habilitadas = data.filter((fp) => fp.habilitado);
        setFormasPago(habilitadas);
        
        // Seleccionar la primera por defecto
        if (habilitadas.length > 0 && selectedCode === null) {
          onSelect(habilitadas[0].codigo);
        }
      } catch (error) {
        console.error("Error al cargar formas de pago:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getPaymentIcon = (codigo: string) => {
    const code = codigo.toUpperCase();
    if (code === "MERCADOPAGO") return <Wallet size={18} />;
    if (code === "EFECTIVO") return <Banknote size={18} />;
    return <CreditCard size={18} />;
  };

  const getPaymentDescription = (codigo: string) => {
    const code = codigo.toUpperCase();
    if (code === "MERCADOPAGO") return "Aboná online de forma segura a través de MercadoPago";
    if (code === "EFECTIVO") return "Pagá en efectivo en la entrega de tu pedido";
    return "Pagá con tarjeta al momento de la entrega o retiro";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard size={18} className="text-orange-500" />
        <h4 className="font-bold text-white text-base">Medio de Pago</h4>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 bg-white/[0.01] border border-white/5 rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
          <span className="ml-2.5 text-sm text-neutral-400 font-medium">Buscando medios de pago...</span>
        </div>
      ) : formasPago.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
          <Info size={18} className="text-red-400" />
          <p className="text-xs text-red-400">
            No hay medios de pago disponibles temporalmente. Por favor, comunícate con el local.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {formasPago.map((fp) => {
            const isSelected = selectedCode === fp.codigo;
            return (
              <div
                key={fp.codigo}
                onClick={() => onSelect(fp.codigo)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? "bg-orange-500/5 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    : "bg-white/[0.01] hover:bg-white/[0.02] border-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`p-2.5 rounded-xl border mt-0.5 ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                        : "bg-white/5 border-white/5 text-neutral-400"
                    }`}
                  >
                    {getPaymentIcon(fp.codigo)}
                  </span>
                  <div>
                    <h5 className="font-bold text-sm text-white">
                      {fp.descripcion}
                    </h5>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                      {getPaymentDescription(fp.codigo)}
                    </p>
                  </div>
                </div>

                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? "border-orange-500" : "border-neutral-700"
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
