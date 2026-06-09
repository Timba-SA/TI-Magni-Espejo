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
        # Si no hay loop o el loop está cerrado, intentar obtener el loop de la ejecución actual
        if not self.loop or self.loop.is_closed():
            try:
                self.loop = asyncio.get_running_loop()
            except RuntimeError:
                return

        # Intentar programar la tarea en el loop
        try:
            self.loop.create_task(self.broadcast(room, message))
        except RuntimeError:
            try:
                asyncio.run_coroutine_threadsafe(self.broadcast(room, message), self.loop)
            except Exception:
                pass

ws_manager = WSManager()
