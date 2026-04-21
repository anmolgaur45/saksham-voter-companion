import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = structlog.get_logger()


def add_exception_handler(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def global_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled exception", path=str(request.url), error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"error": "internal server error"},
        )
