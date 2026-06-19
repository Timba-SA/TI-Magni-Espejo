/**
 * useAdminOrdersFeed — WebSocket hook para el panel de administración.
 *
 * Diferencias respecto a useOrderStatusWS (hook del cliente):
 *  - Se conecta a /ws/pedidos SIN pedido_id (recibe eventos de TODOS los pedidos).
 *  - Requiere rol ADMIN (el backend valida el token).
 *  - No activa fallback de polling: el admin panel puede tolerar la desconexión
 *    y reintentar en silencio con backoff exponencial.
 *  - Expone un array de eventos recientes para que el panel los muestre en tiempo real.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useWSStore } from "@/store/wsStore";
import { useAuthStore } from "@/store/authStore";

export interface AdminOrderEvent {
  event: string;           // ej: "ESTADO_ACTUALIZADO", "NUEVO_PEDIDO"
  pedido_id?: number;
  estado?: string;
  timestamp: string;       // ISO string generado en el cliente al recibir
  raw: unknown;            // payload completo del servidor
}

interface UseAdminOrdersFeedOptions {
  /** Callback opcional invocado en cada evento. */
  onEvent?: (event: AdminOrderEvent) => void;
  /** Cuántos eventos recientes mantener en memoria (default: 50). */
  maxEvents?: number;
}

export function useAdminOrdersFeed({
  onEvent,
  maxEvents = 50,
}: UseAdminOrdersFeedOptions = {}) {
  const setStatus = useWSStore((state) => state.setStatus);
  const wsStatus = useWSStore((state) => state.status);
  const accessToken = useAuthStore((state) => state.accessToken);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  const maxEventsRef = useRef(maxEvents);

  // Mantener referencias actualizadas sin re-crear el socket
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { maxEventsRef.current = maxEvents; }, [maxEvents]);

  const [events, setEvents] = useState<AdminOrderEvent[]>([]);

  const pushEvent = useCallback((raw: unknown) => {
    const payload = raw as Record<string, unknown>;
    const entry: AdminOrderEvent = {
      event: (payload?.event as string) ?? "UNKNOWN",
      pedido_id: payload?.pedido_id as number | undefined,
      estado: payload?.estado as string | undefined,
      timestamp: new Date().toISOString(),
      raw,
    };

    setEvents((prev) => [entry, ...prev].slice(0, maxEventsRef.current));
    onEventRef.current?.(entry);
  }, []);

  const connect = useCallback(() => {
    if (!accessToken) {
      setStatus("DISCONNECTED");
      return;
    }

    // Cerrar conexión previa si existe
    if (socketRef.current) {
      socketRef.current.close();
    }

    setStatus("CONNECTING");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // Sin pedido_id → el backend envía eventos de TODOS los pedidos
    const url = `${protocol}//${host}:8000/ws/pedidos?token=${accessToken}`;

    console.log("[AdminWS] Conectando a", url);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[AdminWS] Conectado.");
      setStatus("CONNECTED");
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        pushEvent(data);
      } catch (err) {
        console.error("[AdminWS] Error parseando mensaje:", err);
      }
    };

    ws.onclose = (e) => {
      console.log(`[AdminWS] Cerrado — código ${e.code}`);
      setStatus("DISCONNECTED");
      socketRef.current = null;

      // Código 4001 = token expirado o inválido — no tiene sentido reconectar
      if (e.code === 4001) {
        console.warn("[AdminWS] Token inválido o expirado. Se cancela la reconexión automática.");
        return;
      }

      // Backoff exponencial: 1s, 2s, 4s, … hasta 30s
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(30_000, 1_000 * Math.pow(2, attempt));
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [accessToken, pushEvent, setStatus]);

  useEffect(() => {
    connect();

    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return {
    /** Estado de la conexión WS (CONNECTED / CONNECTING / DISCONNECTED). */
    status: wsStatus,
    /** Eventos recientes en orden cronológico inverso (más nuevo primero). */
    events,
    /** Limpia el buffer de eventos en memoria. */
    clearEvents,
  };
}
