import { useEffect, useRef } from "react";
import { useWSStore } from "@/store/wsStore";
import { useAuthStore } from "@/store/authStore";

interface UseOrderStatusWSOptions {
  pedidoId?: number;
  onEvent?: (event: any) => void;
}

export function useOrderStatusWS({ pedidoId, onEvent }: UseOrderStatusWSOptions = {}) {
  const setStatus = useWSStore((state) => state.setStatus);
  const status = useWSStore((state) => state.status);
  const accessToken = useAuthStore((state) => state.accessToken);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Usar una referencia para evitar cierres obsoletos (stale closures) y reconexiones innecesarias
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = () => {
    if (!accessToken) {
      setStatus("DISCONNECTED");
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setStatus("CONNECTING");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // Backend corre en el puerto 8000
    const url = `${protocol}//${host}:8000/ws/pedidos?token=${accessToken}${
      pedidoId ? `&pedido_id=${pedidoId}` : ""
    }`;

    console.log(`[WS] Conectando a ${url}...`);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Conectado exitosamente.");
      setStatus("CONNECTED");
      reconnectAttemptRef.current = 0;
      
      // Limpiar polling de fallback si estaba activo
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] Mensaje recibido:", data);
        if (onEventRef.current) {
          onEventRef.current(data);
        }
      } catch (err) {
        console.error("[WS] Error parseando mensaje del socket:", err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WS] Conexión cerrada. Código: ${event.code}, Razón: ${event.reason}`);
      setStatus("DISCONNECTED");
      socketRef.current = null;

      // Re-intentar con backoff exponencial
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
      console.log(`[WS] Intentando reconectar en ${delay}ms... (Intento ${attempt + 1})`);
      
      reconnectAttemptRef.current += 1;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      // Activar polling de fallback
      startFallbackPolling();
    };

    ws.onerror = (error) => {
      console.error("[WS] Error detectado en la conexión WebSocket:", error);
      ws.close();
    };
  };

  const startFallbackPolling = () => {
    if (pollingIntervalRef.current) return;

    console.log("[WS] Activando fallback de polling REST cada 10 segundos...");
    pollingIntervalRef.current = setInterval(() => {
      console.log("[WS] Polling de respaldo ejecutado.");
      if (onEventRef.current) {
        onEventRef.current({ event: "POLLING_FALLBACK", pedidoId });
      }
    }, 10000);
  };

  useEffect(() => {
    connect();

    return () => {
      // Limpieza completa al desmontar o cambiar dependencias
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [accessToken, pedidoId]);

  return { status };
}
