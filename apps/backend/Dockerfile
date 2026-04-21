FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM python:3.12-slim
WORKDIR /app
RUN adduser --disabled-password --gecos "" --uid 1001 appuser
COPY --from=builder /app/.venv /app/.venv
COPY . .
RUN chown -R appuser /app
USER appuser
ENV PATH="/app/.venv/bin:$PATH" PYTHONPATH="/app"
EXPOSE 8080
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"
