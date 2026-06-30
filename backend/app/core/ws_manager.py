import asyncio
from typing import Dict, Set
from fastapi import WebSocket

class WSManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WSManager, cls).__new__(cls)
            cls._instance.active_connections = {}
            cls._instance.loop = None
        return cls._instance

    def connect(self, room: str, websocket: WebSocket):
        # Si no hay loop o el loop está cerrado (común entre tests unitarios), obtener el loop actual
        if not self.loop or self.loop.is_closed():
            try:
                self.loop = asyncio.get_running_loop()
            except RuntimeError:
                pass
        if room not in self.active_connections:
            self.active_connections[room] = set()
        self.active_connections[room].add(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        if room in self.active_connections:
            self.active_connections[room].discard(websocket)
            if not self.active_connections[room]:
                del self.active_connections[room]

    async def broadcast(self, room: str, message: dict):
        if room in self.active_connections:
            for connection in list(self.active_connections[room]):
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(room, connection)

    def broadcast_sync(self, room: str, message: dict):
        """
        Envía un mensaje a una sala desde un contexto sincrónico (thread pool de FastAPI).

        loop.create_task() NO es thread-safe: si el endpoint es `def` (no `async def`),
        FastAPI lo ejecuta en un thread pool separado del event loop, por lo que
        create_task() puede fallar silenciosamente.

        run_coroutine_threadsafe() ES thread-safe y funciona correctamente tanto desde
        threads externos como desde el propio thread del event loop.
        """
        loop = self.loop
        if not loop or loop.is_closed():
            try:
                loop = asyncio.get_running_loop()
                self.loop = loop
            except RuntimeError:
                return  # Sin event loop disponible, no hay nada que hacer

        try:
            asyncio.run_coroutine_threadsafe(self.broadcast(room, message), loop)
        except Exception:
            pass

ws_manager = WSManager()
