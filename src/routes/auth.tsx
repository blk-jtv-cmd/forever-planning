import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar o crear cuenta — Coro" },
      {
        name: "description",
        content:
          "Accede a tu plan de boda de Coro: checklist, presupuesto, invitados, proveedores y cronograma en un solo panel.",
      },
      { property: "og:title", content: "Entrar o crear cuenta — Coro" },
      {
        property: "og:description",
        content: "Crea tu cuenta y empieza a organizar tu boda con Coro por 27€.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [names, setNames] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/panel`,
            data: { display_name: names || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya podéis empezar.");
        navigate({ to: "/panel" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/panel" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo no ha salido bien";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("No hemos podido entrar con Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/panel" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Coro
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Plan · 27€
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-balance font-display text-4xl tracking-tight">
          {mode === "signup" ? "Crea vuestro plan" : "Volved a vuestro plan"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Una cuenta para los dos novios, con todo guardado."
            : "Entrad y seguid donde lo dejasteis."}
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-8 w-full rounded-full border border-line bg-panel px-5 py-3 text-sm font-medium transition-colors hover:bg-clay-soft"
        >
          Continuar con Google
        </button>

        <div className="my-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Vuestros nombres"
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-clay"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-clay"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-clay"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-clay px-5 py-3 font-medium text-background transition-colors hover:bg-foreground disabled:opacity-60"
          >
            {loading ? "Un momento…" : mode === "signup" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-6 text-sm text-muted-foreground underline decoration-clay/40 underline-offset-4 hover:text-foreground"
        >
          {mode === "signup" ? "Ya tenemos cuenta" : "Aún no tenemos cuenta"}
        </button>
      </main>
    </div>
  );
}
