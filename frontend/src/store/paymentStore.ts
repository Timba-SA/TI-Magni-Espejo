/**
 * paymentStore — estado del flujo de pago MercadoPago.
 *
 * Almacena: preferencia activa, estado del pago y el pedido asociado.
 * No persiste en localStorage (los datos de pago son efímeros por seguridad).
 */

import { create } from "zustand";

export type PaymentStatus =
  | "idle"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "error";

interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  externalReference: string;
  pedidoId: number;
}

interface PaymentState {
  /** Preferencia de pago activa (generada por el backend). */
  preference: PaymentPreference | null;
  /** Estado actual del pago (refleja mp_status). */
  status: PaymentStatus;
  /** Mensaje de error si status === "error". */
  errorMessage: string | null;
  /** ID del pedido cuyo pago se está procesando. */
  activePedidoId: number | null;

  // Acciones
  setPreference: (preference: PaymentPreference) => void;
  setStatus: (status: PaymentStatus, errorMessage?: string) => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  preference: null,
  status: "idle",
  errorMessage: null,
  activePedidoId: null,

  setPreference: (preference) =>
    set({
      preference,
      activePedidoId: preference.pedidoId,
      status: "pending",
      errorMessage: null,
    }),

  setStatus: (status, errorMessage = null) =>
    set({ status, errorMessage }),

  clearPayment: () =>
    set({
      preference: null,
      status: "idle",
      errorMessage: null,
      activePedidoId: null,
    }),
}));
