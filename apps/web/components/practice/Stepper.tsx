"use client";

export function Stepper({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-center mb-10"
      role="list"
      aria-label="Voting steps"
    >
      {Array.from({ length: 6 }, (_, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center" role="listitem">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: done
                  ? "var(--success-bg)"
                  : active
                  ? "var(--accent-primary)"
                  : "var(--bg-surface-2)",
                color: done
                  ? "var(--success)"
                  : active
                  ? "var(--bg-canvas)"
                  : "var(--text-muted)",
                border: `1px solid ${
                  done
                    ? "var(--success)"
                    : active
                    ? "var(--accent-primary)"
                    : "var(--border-default)"
                }`,
              }}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < 5 && (
              <div
                className="w-6 sm:w-10 h-px flex-shrink-0"
                style={{
                  backgroundColor: done ? "var(--success)" : "var(--border-default)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
