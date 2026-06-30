/**
 * useCatalogoWS — WebSocket hook para sincronización en tiempo real del catálogo.
 *
 * Se conecta a /ws/catalogo y escucha eventos PRODUCTO_ACTUALIZADO.
 * Al recibir uno, invalida la caché de React Query para que la tabla de
 * productos se actualice sin necesidad de recargar la página.
 *
 * Uso: montar este hook en cualquier página que muestre precios de productos.
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";

const RECONNECT_MAX_DELAY_MS = 30_000;

export function useCatalogoWS() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Flag para evitar reconexión cuando el componente se desmonta intencionalmente
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current || !accessToken) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    // El backend corre en HTTP puro (sin TLS), por eso usamos ws:// siempre.
    // Chrome permite ws://localhost desde páginas https://localhost (excepción de mixed-content).
    const host = window.location.hostname;
    const url = `ws://${host}:8000/ws/catalogo?token=${accessToken}`;

    console.log("[CatalogoWS] Conectando a", url);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[CatalogoWS] Conectado.");
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as { event: string; producto_id?: number };
        if (data.event === "PRODUCTO_ACTUALIZADO") {
          console.log("[CatalogoWS] Producto actualizado:", data.producto_id, "— invalidando caché.");
          queryClient.invalidateQueries({ queryKey: ["productos"] });
        }
      } catch (err) {
        console.error("[CatalogoWS] Error parseando mensaje:", err);
      }
    };

    ws.onclose = (e) => {
      console.log(`[CatalogoWS] Cerrado — código ${e.code}`);
      socketRef.current = null;

      // Token inválido → no reconectar
      if (e.code === 4001) {
        console.warn("[CatalogoWS] Token inválido. Se cancela la reconexión.");
        return;
      }

      if (unmountedRef.current) return;

      // Backoff exponencial: 1s, 2s, 4s, … hasta 30s
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(RECONNECT_MAX_DELAY_MS, 1_000 * Math.pow(2, attempt));
      reconnectAttemptRef.current += 1;
      console.log(`[CatalogoWS] Reconectando en ${delay}ms… (intento ${attempt + 1})`);
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [accessToken, queryClient]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
