import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          MAF Community
        </h1>
        <p className="text-xl text-muted-foreground">
          Plataforma exclusiva para membros MAF com área restrita, feed social e biblioteca de materiais.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Fazer Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </main>
  );
}
