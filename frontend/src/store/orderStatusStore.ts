/**
 * orderStatusStore — seguimiento en tiempo real del estado de pedidos activos.
 *
 * Sincronizado con el WebSocket de pedidos (/ws/pedidos).
 * Persiste en localStorage para que el cliente recupere su pedido activo
 * al volver a la página.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderEstado =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREP"
  | "ENTREGADO"
  | "CANCELADO";

export interface OrderStatusEntry {
  pedidoId: number;
  estado: OrderEstado;
  updatedAt: string; // ISO string
}

interface OrderStatusState {
  /** Mapa pedidoId → estado actual. Permite rastrear varios pedidos simultáneos. */
  orders: Record<number, OrderStatusEntry>;
  /** ID del pedido que el usuario está viendo actualmente (para la vista de seguimiento). */
  trackedPedidoId: number | null;

  // Acciones
  updateOrderStatus: (pedidoId: number, estado: OrderEstado) => void;
  setTrackedPedido: (pedidoId: number | null) => void;
  removeOrder: (pedidoId: number) => void;
  clearAll: () => void;
}

export const useOrderStatusStore = create<OrderStatusState>()(
  persist(
    (set, get) => ({
      orders: {},
      trackedPedidoId: null,

      updateOrderStatus: (pedidoId, estado) => {
        set((state) => ({
          orders: {
            ...state.orders,
            [pedidoId]: {
              pedidoId,
              estado,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setTrackedPedido: (pedidoId) => set({ trackedPedidoId: pedidoId }),

      removeOrder: (pedidoId) => {
        set((state) => {
          const updated = { ...state.orders };
          delete updated[pedidoId];
          return {
            orders: updated,
            trackedPedidoId:
              state.trackedPedidoId === pedidoId ? null : state.trackedPedidoId,
          };
        });
      },

      clearAll: () => set({ orders: {}, trackedPedidoId: null }),
    }),
    {
      name: "the_food_store_order_status",
      // Solo persiste los pedidos, no el trackedPedidoId (es efímero por sesión)
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
