import { ExternalLink, FileText } from "lucide-react";

interface Citation {
  title: string | null;
  url: string | null;
}

export function CitationCard({ citation }: { citation: Citation }) {
  const label = citation.title ?? "Source";

  if (citation.url) {
    return (
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="max-w-[200px] truncate">{label}</span>
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground">
      <FileText className="h-3 w-3 shrink-0" />
      <span className="max-w-[200px] truncate">{label}</span>
    </span>
  );
}
