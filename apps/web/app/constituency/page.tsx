import { ConstituencyClient } from "./constituency-client";

export default async function ConstituencyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <ConstituencyClient initialQuery={q} />;
}
