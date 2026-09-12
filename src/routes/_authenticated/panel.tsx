import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Presupuesto,
  DEFAULT_EXPENSE_CATEGORIES,
  type BudgetCategory,
} from "@/components/panel/presupuesto";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Vuestro panel de boda — Coro" },
      {
        name: "description",
        content:
          "Gestiona checklist, presupuesto, invitados, proveedores y cronograma de tu boda desde un único panel.",
      },
      { property: "og:title", content: "Vuestro panel de boda — Coro" },
      {
        property: "og:description",
        content: "Todo lo que hay que tener en cuenta para la boda, en un solo sitio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelPage,
});

type Wedding = {
  id: string;
  partner_one: string;
  partner_two: string;
  wedding_date: string | null;
  venue: string | null;
  guest_target: number;
  total_budget: number;
  plan_active: boolean;
};

type Task = {
  id: string;
  title: string;
  category: string;
  due_date: string | null;
  done: boolean;
};
type Expense = {
  id: string;
  concept: string;
  category: string;
  planned: number;
  actual_cost: number;
  paid: number;
};
type Guest = {
  id: string;
  name: string;
  guest_group: string;
  rsvp: string;
  table_number: string | null;
  companions: number;
};
type Vendor = {
  id: string;
  name: string;
  service: string;
  contact: string | null;
  price: number;
  status: string;
};
type TimelineItem = { id: string; time_label: string; title: string; owner: string | null };

const DEFAULT_TASKS: { title: string; category: string }[] = [
  { title: "Fijar la fecha y el presupuesto total", category: "12 meses antes" },
  { title: "Elegir y reservar el lugar de la ceremonia", category: "12 meses antes" },
  { title: "Reservar el espacio del banquete", category: "12 meses antes" },
  { title: "Cerrar la lista inicial de invitados", category: "10 meses antes" },
  { title: "Contratar fotógrafo y vídeo", category: "9 meses antes" },
  { title: "Elegir los trajes y vestidos", category: "8 meses antes" },
  { title: "Reservar catering y menú de prueba", category: "6 meses antes" },
  { title: "Enviar las invitaciones", category: "4 meses antes" },
  { title: "Contratar música y flores", category: "4 meses antes" },
  { title: "Cerrar el número final de invitados", category: "1 mes antes" },
  { title: "Repartir el cronograma del día", category: "1 semana antes" },
];

const TABS = [
  ["resumen", "Resumen"],
  ["checklist", "Checklist"],
  ["presupuesto", "Presupuesto"],
  ["invitados", "Invitados"],
  ["proveedores", "Proveedores"],
  ["cronograma", "Cronograma"],
  ["ajustes", "Ajustes"],
] as const;

type TabKey = (typeof TABS)[number][0];

const inputClass =
  "rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-clay";

function euro(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function weddingDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function daysUntilWedding(date: string | null) {
  if (!date) return null;
  const wedding = weddingDay(date);
  if (!wedding) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  wedding.setHours(0, 0, 0, 0);
  return Math.round((wedding.getTime() - today.getTime()) / 86400000);
}

function weddingDateLabel(date: string | null) {
  if (!date) return null;
  const wedding = weddingDay(date);
  if (!wedding) return null;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(wedding);
}

function PanelPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [tab, setTab] = useState<TabKey>("resumen");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async (weddingId: string) => {
    const [t, e, g, v, tl, c] = await Promise.all([
      supabase.from("tasks").select("id,title,category,due_date,done").eq("wedding_id", weddingId).order("created_at"),
      supabase.from("expenses").select("id,concept,category,planned,actual_cost,paid").eq("wedding_id", weddingId).order("created_at"),
      supabase.from("guests").select("id,name,guest_group,rsvp,table_number,companions").eq("wedding_id", weddingId).order("created_at"),
      supabase.from("vendors").select("id,name,service,contact,price,status").eq("wedding_id", weddingId).order("created_at"),
      supabase.from("timeline_items").select("id,time_label,title,owner").eq("wedding_id", weddingId).order("time_label"),
      supabase.from("expense_categories").select("id,name,sort_order").eq("wedding_id", weddingId).order("sort_order"),
    ]);
    setTasks((t.data as Task[]) ?? []);
    setExpenses((e.data as Expense[]) ?? []);
    setGuests((g.data as Guest[]) ?? []);
    setVendors((v.data as Vendor[]) ?? []);
    setTimeline((tl.data as TimelineItem[]) ?? []);
    setCategories((c.data as BudgetCategory[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      setUserId(uid);

      const { data: existing } = await supabase
        .from("weddings")
        .select("id,partner_one,partner_two,wedding_date,venue,guest_target,total_budget,plan_active")
        .eq("user_id", uid)
        .maybeSingle();

      let current = existing as Wedding | null;
      if (!current) {
        const { data: created, error } = await supabase
          .from("weddings")
          .insert({ user_id: uid, partner_one: "", partner_two: "" })
          .select("id,partner_one,partner_two,wedding_date,venue,guest_target,total_budget,plan_active")
          .single();
        if (error) {
          toast.error("No hemos podido crear vuestro plan");
          setLoading(false);
          return;
        }
        current = created as Wedding;
        await supabase.from("tasks").insert(
          DEFAULT_TASKS.map((task) => ({ ...task, wedding_id: current!.id, user_id: uid })),
        );
      }
      setWedding(current);

      const { count } = await supabase
        .from("expense_categories")
        .select("id", { count: "exact", head: true })
        .eq("wedding_id", current.id);
      if (!count) {
        await supabase.from("expense_categories").insert(
          DEFAULT_EXPENSE_CATEGORIES.map((name, i) => ({
            wedding_id: current!.id,
            user_id: uid,
            name,
            sort_order: i,
          })),
        );
      }

      await loadAll(current.id);
      setLoading(false);
    })();
  }, [loadAll]);

  const budget = useMemo(() => {
    const planned = expenses.reduce((s, e) => s + Number(e.planned), 0);
    const actual = expenses.reduce((s, e) => s + Number(e.actual_cost), 0);
    const paid = expenses.reduce((s, e) => s + Number(e.paid), 0);
    return { planned, actual, paid };
  }, [expenses]);

  const confirmed = useMemo(
    () => guests.filter((g) => g.rsvp === "confirmado").reduce((s, g) => s + 1 + g.companions, 0),
    [guests],
  );

  const daysLeft = useMemo(() => {
    return daysUntilWedding(wedding?.wedding_date ?? null);
  }, [wedding?.wedding_date]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading || !wedding || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Preparando vuestro plan…
      </div>
    );
  }

  const ctx = { wedding, userId, reload: () => loadAll(wedding.id) };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Coro
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              {wedding.partner_one || "Novia"} &amp; {wedding.partner_two || "Novio"}
              {daysLeft !== null && ` · Día ${daysLeft >= 0 ? `−${daysLeft}` : `+${Math.abs(daysLeft)}`}`}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6 pb-3 text-sm">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap border-b-2 pb-1 transition-colors ${
                tab === key
                  ? "border-clay text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!wedding.plan_active && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-clay-soft px-6 py-5">
            <div>
              <div className="font-display text-lg font-semibold">Plan de prueba</div>
              <p className="text-sm text-muted-foreground">
                Estáis usando el plan completo en modo prueba. El pago único de 27€ se activará en cuanto conectemos el cobro.
              </p>
            </div>
            <span className="font-display text-3xl font-semibold">27€</span>
          </div>
        )}

        {tab === "resumen" && (
          <Resumen
            wedding={wedding}
            tasks={tasks}
            setTasks={setTasks}
            budget={budget}
            confirmed={confirmed}
            guests={guests.length}
            vendors={vendors.length}
          />
        )}
        {tab === "checklist" && <Checklist tasks={tasks} setTasks={setTasks} {...ctx} />}
        {tab === "presupuesto" && (
          <Presupuesto
            expenses={expenses}
            categories={categories}
            wedding={wedding}
            userId={userId}
            reload={ctx.reload}
            onBudgetChange={async (n) => {
              const { error } = await supabase
                .from("weddings")
                .update({ total_budget: n })
                .eq("id", wedding.id);
              if (error) {
                toast.error("No se ha podido guardar");
                return;
              }
              setWedding({ ...wedding, total_budget: n });
            }}
          />
        )}
        {tab === "invitados" && <Invitados guests={guests} {...ctx} />}
        {tab === "proveedores" && <Proveedores vendors={vendors} {...ctx} />}
        {tab === "cronograma" && <Cronograma items={timeline} {...ctx} />}
        {tab === "ajustes" && <Ajustes wedding={wedding} setWedding={setWedding} />}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Resumen({
  wedding,
  tasks,
  setTasks,
  budget,
  confirmed,
  guests,
  vendors,
}: {
  wedding: Wedding;
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  budget: { planned: number; actual: number; paid: number };
  confirmed: number;
  guests: number;
  vendors: number;
}) {
  const doneCount = tasks.filter((t) => t.done).length;
  const pending = tasks.filter((t) => !t.done).slice(0, 5);

  async function completar(task: Task) {
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: true } : t)));
    const { error } = await supabase.from("tasks").update({ done: true }).eq("id", task.id);
    if (error) {
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: false } : t)));
      toast.error("No se ha podido guardar");
      return;
    }
    toast.success("Tarea completada");
  }
  const firstName = wedding.partner_one.trim() || "Novia";
  const secondName = wedding.partner_two.trim() || "Novio";
  const daysLeft = daysUntilWedding(wedding.wedding_date);
  const dateLabel = weddingDateLabel(wedding.wedding_date);

  let countdownLabel = "Indicad la fecha en Ajustes";
  let countdownDetail = "Y aquí comenzará vuestra cuenta atrás";
  if (daysLeft === 0) {
    countdownLabel = "¡Hoy es vuestro gran día!";
    countdownDetail = dateLabel ?? "Disfrutad cada momento";
  } else if (daysLeft === 1) {
    countdownLabel = "Falta 1 día";
    countdownDetail = dateLabel ?? "Ya casi está aquí";
  } else if (daysLeft !== null && daysLeft > 1) {
    countdownLabel = `Faltan ${daysLeft} días`;
    countdownDetail = dateLabel ?? "Vuestra cuenta atrás";
  } else if (daysLeft === -1) {
    countdownLabel = "Hace 1 día de vuestra boda";
    countdownDetail = dateLabel ?? "Un recuerdo para siempre";
  } else if (daysLeft !== null && daysLeft < -1) {
    countdownLabel = `Hace ${Math.abs(daysLeft)} días de vuestra boda`;
    countdownDetail = dateLabel ?? "Un recuerdo para siempre";
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 border-y border-line py-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:py-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-clay">Vuestro espacio</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-none sm:text-5xl">
            Bienvenidos, {firstName} y {secondName}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Todo lo importante de vuestra boda, reunido para que disfrutéis también del camino.
          </p>
        </div>
        <div className="border-l-2 border-clay pl-5 sm:min-w-64">
          <p className="font-display text-3xl font-semibold leading-tight">{countdownLabel}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {countdownDetail}
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Tareas hechas"
          value={`${doneCount}/${tasks.length}`}
          hint={tasks.length ? `${Math.round((doneCount / tasks.length) * 100)}% completado` : undefined}
        />
        <Stat
          label="Presupuesto"
          value={euro(Number(wedding.total_budget) - budget.planned)}
          hint={`Disponible ${euro(Number(wedding.total_budget))} · Estimado ${euro(budget.planned)}`}
        />
        <Stat label="Invitados confirmados" value={`${confirmed}`} hint={`${guests} en la lista`} />
        <Stat label="Proveedores" value={`${vendors}`} hint="Fichas guardadas" />
      </div>

      <section className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
        <h2 className="font-display text-2xl font-semibold">Lo siguiente</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Todo hecho. Disfrutad.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {pending.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5 text-sm">
                <span className="size-3 rounded-full border border-clay/60" />
                {t.title}
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {t.category}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Checklist({
  tasks,
  setTasks,
  wedding,
  userId,
  reload,
}: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  wedding: Wedding;
  userId: string;
  reload: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");

  async function toggle(task: Task) {
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase
      .from("tasks")
      .insert({ title, category, wedding_id: wedding.id, user_id: userId });
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    setTitle("");
    await reload();
  }

  async function remove(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    await reload();
  }

  const groups = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <SectionHeader title="Checklist" subtitle="Todo lo que hay que hacer, mes a mes." />
      <form onSubmit={add} className="mb-8 flex flex-wrap gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea"
          className={`${inputClass} flex-1 min-w-[220px]`}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Momento (ej. 6 meses antes)"
          className={inputClass}
        />
        <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background hover:bg-foreground">
          Añadir
        </button>
      </form>

      <div className="space-y-8">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-clay">{group}</div>
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggle(t)}
                    className="size-4 accent-clay"
                  />
                  <span className={t.done ? "text-muted-foreground line-through" : ""}>{t.title}</span>
                  <button
                    onClick={() => remove(t.id)}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const RSVP = ["pendiente", "confirmado", "rechazado"];

function Invitados({
  guests,
  wedding,
  userId,
  reload,
}: {
  guests: Guest[];
  wedding: Wedding;
  userId: string;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", guest_group: "Familia", companions: "0" });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const { error } = await supabase.from("guests").insert({
      name: form.name,
      guest_group: form.guest_group,
      companions: Number(form.companions) || 0,
      wedding_id: wedding.id,
      user_id: userId,
    });
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    setForm({ name: "", guest_group: "Familia", companions: "0" });
    await reload();
  }

  return (
    <div>
      <SectionHeader
        title="Invitados"
        subtitle={`${guests.length} en la lista · objetivo ${wedding.guest_target}`}
      />
      <form onSubmit={add} className="mb-8 flex flex-wrap gap-3">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          className={`${inputClass} flex-1 min-w-[180px]`}
        />
        <input
          value={form.guest_group}
          onChange={(e) => setForm({ ...form, guest_group: e.target.value })}
          placeholder="Grupo"
          className={inputClass}
        />
        <input
          value={form.companions}
          onChange={(e) => setForm({ ...form, companions: e.target.value })}
          placeholder="Acompañantes"
          inputMode="numeric"
          className={`${inputClass} w-36`}
        />
        <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background hover:bg-foreground">
          Añadir
        </button>
      </form>

      <ul className="space-y-2">
        {guests.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-panel px-4 py-3 text-sm">
            <span className="font-medium">{g.name}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {g.guest_group}
              {g.companions > 0 && ` · +${g.companions}`}
            </span>
            <select
              value={g.rsvp}
              onChange={async (e) => {
                await supabase.from("guests").update({ rsvp: e.target.value }).eq("id", g.id);
                await reload();
              }}
              className="ml-auto rounded-lg border border-line bg-background px-2 py-1 text-xs"
            >
              {RSVP.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                await supabase.from("guests").delete().eq("id", g.id);
                await reload();
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Borrar
            </button>
          </li>
        ))}
        {guests.length === 0 && (
          <li className="rounded-lg bg-panel px-4 py-8 text-center text-sm text-muted-foreground">
            Empezad añadiendo a la familia más cercana.
          </li>
        )}
      </ul>
    </div>
  );
}

const VENDOR_STATUS = ["contactado", "presupuesto", "reservado", "pagado"];

function Proveedores({
  vendors,
  wedding,
  userId,
  reload,
}: {
  vendors: Vendor[];
  wedding: Wedding;
  userId: string;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", service: "Catering", contact: "", price: "" });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const { error } = await supabase.from("vendors").insert({
      name: form.name,
      service: form.service,
      contact: form.contact,
      price: Number(form.price) || 0,
      wedding_id: wedding.id,
      user_id: userId,
    });
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    setForm({ name: "", service: "Catering", contact: "", price: "" });
    await reload();
  }

  return (
    <div>
      <SectionHeader title="Proveedores" subtitle="Contactos, precios y en qué punto está cada uno." />
      <form onSubmit={add} className="mb-8 flex flex-wrap gap-3">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          className={`${inputClass} flex-1 min-w-[180px]`}
        />
        <input
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          placeholder="Servicio"
          className={inputClass}
        />
        <input
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          placeholder="Teléfono o email"
          className={inputClass}
        />
        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Precio €"
          inputMode="decimal"
          className={`${inputClass} w-32`}
        />
        <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background hover:bg-foreground">
          Añadir
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {vendors.map((v) => (
          <div key={v.id} className="rounded-2xl bg-panel p-5 ring-1 ring-foreground/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-xl font-semibold">{v.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-clay">{v.service}</div>
              </div>
              <div className="font-display text-lg">{euro(Number(v.price))}</div>
            </div>
            {v.contact && <div className="mt-3 text-sm text-muted-foreground">{v.contact}</div>}
            <div className="mt-4 flex items-center gap-3">
              <select
                value={v.status}
                onChange={async (e) => {
                  await supabase.from("vendors").update({ status: e.target.value }).eq("id", v.id);
                  await reload();
                }}
                className="rounded-lg border border-line bg-background px-2 py-1 text-xs"
              >
                {VENDOR_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  await supabase.from("vendors").delete().eq("id", v.id);
                  await reload();
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no hay proveedores guardados.</p>
        )}
      </div>
    </div>
  );
}

function Cronograma({
  items,
  wedding,
  userId,
  reload,
}: {
  items: TimelineItem[];
  wedding: Wedding;
  userId: string;
  reload: () => Promise<void>;
}) {
  const [form, setForm] = useState({ time_label: "12:00", title: "", owner: "" });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const { error } = await supabase.from("timeline_items").insert({
      time_label: form.time_label,
      title: form.title,
      owner: form.owner,
      wedding_id: wedding.id,
      user_id: userId,
    });
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    setForm({ time_label: "12:00", title: "", owner: "" });
    await reload();
  }

  return (
    <div>
      <SectionHeader title="Cronograma" subtitle="El gran día, hora por hora." />
      <form onSubmit={add} className="mb-8 flex flex-wrap gap-3">
        <input
          value={form.time_label}
          onChange={(e) => setForm({ ...form, time_label: e.target.value })}
          placeholder="Hora"
          className={`${inputClass} w-28`}
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Qué pasa"
          className={`${inputClass} flex-1 min-w-[200px]`}
        />
        <input
          value={form.owner}
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
          placeholder="Quién se encarga"
          className={inputClass}
        />
        <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background hover:bg-foreground">
          Añadir
        </button>
      </form>

      <ol className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 rounded-lg bg-panel px-4 py-3 text-sm">
            <span className="font-mono text-xs text-clay">{i.time_label}</span>
            <span>{i.title}</span>
            {i.owner && <span className="text-muted-foreground">· {i.owner}</span>}
            <button
              onClick={async () => {
                await supabase.from("timeline_items").delete().eq("id", i.id);
                await reload();
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Borrar
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-lg bg-panel px-4 py-8 text-center text-sm text-muted-foreground">
            Añadid el primer momento del día.
          </li>
        )}
      </ol>
    </div>
  );
}

function Ajustes({
  wedding,
  setWedding,
}: {
  wedding: Wedding;
  setWedding: (w: Wedding) => void;
}) {
  const [form, setForm] = useState({
    partner_one: wedding.partner_one,
    partner_two: wedding.partner_two,
    wedding_date: wedding.wedding_date ?? "",
    venue: wedding.venue ?? "",
    guest_target: String(wedding.guest_target),
    total_budget: String(wedding.total_budget),
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      partner_one: form.partner_one,
      partner_two: form.partner_two,
      wedding_date: form.wedding_date || null,
      venue: form.venue,
      guest_target: Number(form.guest_target) || 0,
      total_budget: Number(form.total_budget) || 0,
    };
    const { error } = await supabase.from("weddings").update(payload).eq("id", wedding.id);
    setSaving(false);
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    setWedding({ ...wedding, ...payload });
    toast.success("Guardado");
  }

  return (
    <div className="max-w-xl">
      <SectionHeader title="Ajustes" subtitle="Los datos básicos de vuestra boda." />
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={form.partner_one}
            onChange={(e) => setForm({ ...form, partner_one: e.target.value })}
            placeholder="Nombre 1"
            className={inputClass}
          />
          <input
            value={form.partner_two}
            onChange={(e) => setForm({ ...form, partner_two: e.target.value })}
            placeholder="Nombre 2"
            className={inputClass}
          />
        </div>
        <input
          type="date"
          value={form.wedding_date}
          onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
          className={`${inputClass} w-full`}
        />
        <input
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
          placeholder="Lugar"
          className={`${inputClass} w-full`}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={form.guest_target}
            onChange={(e) => setForm({ ...form, guest_target: e.target.value })}
            placeholder="Invitados previstos"
            inputMode="numeric"
            className={inputClass}
          />
          <input
            value={form.total_budget}
            onChange={(e) => setForm({ ...form, total_budget: e.target.value })}
            placeholder="Presupuesto total €"
            inputMode="decimal"
            className={inputClass}
          />
        </div>
        <button
          disabled={saving}
          className="rounded-full bg-clay px-6 py-3 font-medium text-background hover:bg-foreground disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
