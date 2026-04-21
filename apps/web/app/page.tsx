import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-3">Saksham</h1>
        <p className="text-lg text-muted-foreground">
          Your multilingual election education assistant, grounded in Election
          Commission of India sources.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/chat">
          <Button size="lg">Ask a question</Button>
        </Link>
        <Link href="/booth">
          <Button size="lg" variant="outline">
            Find my polling booth
          </Button>
        </Link>
        <Link href="/verify">
          <Button size="lg" variant="outline">
            Verify a claim
          </Button>
        </Link>
      </div>
    </main>
  );
}
