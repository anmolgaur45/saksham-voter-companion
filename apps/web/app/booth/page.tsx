import BoothClient from "./booth-client";

export const metadata = { title: "Polling Booth Finder · Saksham" };

export default async function BoothPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <BoothClient initialQuery={q} />;
}
