import logging
import time

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Instancia global del rate limiter — se importa en main.py y en los routers
limiter = Limiter(key_func=get_remote_address)

# Logger de la aplicación
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("food_store")


class LoggingTimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware que registra por consola cada petición HTTP con:
    - Método y ruta
    - Código de respuesta
    - Tiempo de procesamiento en ms
    - IP del cliente
    """

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        client_ip = request.client.host if request.client else "unknown"
        logger.info(
            "%s %s → %d | %.1f ms | ip=%s",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
            client_ip,
        )
        # Añade el tiempo de procesamiento como header de respuesta
        response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.1f}"
        return response