import { createFileRoute, Link } from "@tanstack/react-router";
import bridePortrait from "@/assets/bride-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coro — Organiza tu boda completa por 27€" },
      {
        name: "description",
        content:
          "Checklist, presupuesto, invitados, proveedores y cronograma de tu boda en un solo plan. Un pago único de 27€, sin suscripciones.",
      },
      { property: "og:title", content: "Coro — Organiza tu boda completa por 27€" },
      {
        property: "og:description",
        content:
          "Todo lo que los novios deben tener en cuenta, ordenado desde el primer día. Pago único de 27€.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    num: "01",
    tag: "Checklist",
    title: "Checklist vivo",
    text: "Tareas por mes que se reordenan solas según la fecha real.",
  },
  {
    num: "02",
    tag: "Presupuesto",
    title: "Presupuesto claro",
    text: "Gasto real frente a lo previsto, sin sorpresas el último día.",
  },
  {
    num: "03",
    tag: "Invitados",
    title: "Lista de invitados",
    text: "Confirmados, pendientes y mesa asignada de un vistazo.",
  },
  {
    num: "04",
    tag: "Proveedores",
    title: "Proveedores",
    text: "Contactos, presupuestos y estados en una sola ficha.",
  },
  {
    num: "05",
    tag: "Cronograma",
    title: "Cronograma",
    text: "La semana del evento, minuto a minuto, sin pánico.",
  },
  {
    num: "06",
    tag: "Invitaciones",
    title: "Invitaciones",
    text: "Modelos elegantes y respuesta de cada invitado al instante.",
  },
];

const included = [
  "Checklist y presupuesto ilimitados",
  "Lista de invitados con respuesta",
  "Fichas de proveedores",
  "Cronograma del gran día",
  "Plantillas de invitación",
  "Acceso para los dos novios",
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-tight">Coro</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Plan · 27€
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#metodo" className="transition-colors hover:text-foreground">
              Método
            </a>
            <a href="#funciones" className="transition-colors hover:text-foreground">
              Funciones
            </a>
            <a href="#historias" className="transition-colors hover:text-foreground">
              Historias
            </a>
          </nav>
          <Link
            to="/auth"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-clay"
          >
            Empezar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-10 pt-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.28em] text-clay">
              Para los novios · Todo en un solo plan
            </div>
            <h1
              className="text-balance font-display text-6xl leading-[0.95] tracking-tight md:text-7xl"
              style={{ animation: "rise 700ms var(--ease-soft) both" }}
            >
              La boda, <em className="italic text-clay">ordenada</em>
              <br />
              desde el primer día.
            </h1>
            <p
              className="mt-6 max-w-[34ch] text-pretty text-lg text-muted-foreground"
              style={{ animation: "rise 700ms var(--ease-soft) both", animationDelay: "120ms" }}
            >
              Un solo lugar donde los novios tienen la vista completa: checklist, presupuesto,
              invitados y proveedores. Sin fórmulas que pierden.
            </p>
            <div
              className="mt-8 flex flex-wrap items-center gap-4"
              style={{ animation: "rise 700ms var(--ease-soft) both", animationDelay: "220ms" }}
            >
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-medium text-background transition-colors hover:bg-foreground"
              >
                Empezar mi plan · 27€
              </Link>
              <a
                href="#metodo"
                className="text-sm font-medium text-foreground underline decoration-clay/40 underline-offset-4 transition-colors hover:decoration-clay"
              >
                Ver cómo funciona
              </a>
            </div>
            <div
              className="mt-8 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              style={{ animation: "rise 700ms var(--ease-soft) both", animationDelay: "320ms" }}
            >
              <span>Precio único</span>
              <span className="h-px w-6 bg-line" />
              <span>Cancela cuando quieras</span>
            </div>
          </div>

          {/* Product preview */}
          <div
            className="relative"
            style={{ animation: "rise 800ms var(--ease-soft) both", animationDelay: "160ms" }}
          >
            <div className="rounded-2xl bg-panel p-5 ring-1 ring-foreground/5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Panel · Elena &amp; Marcos
                </span>
                <span className="font-mono text-[10px] text-clay">Día −142</span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-clay-soft p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Presupuesto
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold">8.240€</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-clay/15">
                    <div className="h-full w-[68%] rounded-full bg-clay" />
                  </div>
                </div>
                <div className="rounded-xl bg-clay-soft p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Invitados
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold">
                    128 <span className="text-base text-muted-foreground">/160</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-clay/15">
                    <div className="h-full w-[80%] rounded-full bg-clay" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                  <span className="size-4 rounded-full bg-clay/80" />
                  <span className="text-sm">Florista · confirmada</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    Jun 12
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                  <span className="size-4 rounded-full border border-clay/50" />
                  <span className="text-sm">Sala · por confirmar</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    Jun 20
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl bg-foreground px-4 py-3 text-background sm:block">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
                Este mes
              </div>
              <div className="font-display text-xl font-semibold">− 340€ plan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider index */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>(a) El método</span>
          <span>(b) Funciones</span>
          <span>(c) Historias</span>
          <span>(d) Precio</span>
        </div>
      </div>

      {/* Features */}
      <section id="funciones" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div id="metodo" className="mb-12 max-w-xl scroll-mt-24">
          <h2 className="text-balance font-display text-4xl tracking-tight md:text-5xl">
            Todo lo que deben tener en cuenta, en orden.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Cada pestaña del plan, pensada para que nada se escape entre la propuesta y el gran
            día.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-foreground/5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.num} className="bg-panel p-7">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-clay">
                {f.num} — {f.tag}
              </div>
              <h3 className="font-display text-2xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section id="historias" className="scroll-mt-20 border-t border-line bg-clay-soft/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-clay">
            (c) Historias reales
          </div>
          <blockquote className="text-balance font-display text-3xl italic leading-tight md:text-[2.6rem]">
            «Estuvimos tranquilas. El plan lo tenía todo y nosotras solo teníamos que disfrutar —
            ni una sola duda la semana anterior.»
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex items-center gap-3">
              <img
                src={bridePortrait}
                alt="Retrato de una novia sonriendo"
                className="size-11 rounded-full object-cover outline-1 -outline-offset-1 outline-foreground/5"
              />
              <div className="text-left">
                <div className="text-sm font-medium">Lucía &amp; Jorge</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Boda · 2024
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-left">
              <div className="text-sm font-medium">Marta &amp; Adrià</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Rural · 2024
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price */}
      <section id="precio" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="overflow-hidden rounded-3xl bg-foreground text-background">
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            <div className="p-10 lg:p-14">
              <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-background/50">
                (d) El precio
              </div>
              <div className="flex items-end gap-2">
                <span className="font-display text-[6rem] font-semibold leading-none">27</span>
                <span className="mb-3 font-display text-4xl">€</span>
              </div>
              <div className="mt-2 text-sm text-background/70">
                Un solo pago. Sin cuotas, sin letra pequeña.
              </div>
              <Link
                to="/auth"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3.5 font-medium text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Crear mi plan ahora
              </Link>
              <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-background/50">
                Cancela cuando quieras
              </div>
            </div>
            <div className="border-t border-background/15 p-10 lg:border-l lg:border-t-0 lg:p-14">
              <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                Todo lo incluido
              </div>
              <ul className="space-y-3 text-sm">
                {included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-clay">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <span className="font-display text-xl font-semibold tracking-tight">Coro</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Un plan, una boda, 27€
          </span>
          <Link
            to="/auth"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Empezar
          </Link>
        </div>
      </footer>
    </div>
  );
}
