from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler para HTTPException de FastAPI — devuelve siempre el mismo formato JSON."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler para errores de validación de Pydantic (422) — simplifica el mensaje."""
    errors = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field or "body",
            "message": error["msg"],
        })
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Error de validación en los datos enviados.",
            "status_code": 422,
            "errors": errors,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler catch-all para errores inesperados — evita exponer stack traces al cliente."""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor. Por favor, intentá de nuevo más tarde.",
            "status_code": 500,
        },
    )


def register_exception_handlers(app) -> None:
    """Registra todos los exception handlers en la instancia de FastAPI."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)