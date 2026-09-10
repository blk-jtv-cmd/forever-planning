import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BudgetExpense = {
  id: string;
  concept: string;
  category: string;
  planned: number;
  actual_cost: number;
  paid: number;
};

export type BudgetCategory = { id: string; name: string; sort_order: number };

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Lugar y Catering",
  "Fotografía y vídeo",
  "Música y DJ",
  "Flores",
  "Decoración",
  "Vestido y traje",
  "Belleza",
  "Anillos",
  "Invitaciones y papelería",
  "Transporte",
  "Otros",
];

const inputClass =
  "rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-clay";

function euro(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-3xl font-semibold ${
          tone === "bad" ? "text-destructive" : tone === "good" ? "text-clay" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AmountCell({
  value,
  onSave,
}: {
  value: number;
  onSave: (n: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      value={draft ?? String(value ?? 0)}
      inputMode="decimal"
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={async () => {
        if (draft === null) return;
        const n = Number(draft.replace(",", ".")) || 0;
        setDraft(null);
        if (n !== Number(value)) await onSave(n);
      }}
      className="w-24 rounded-md border border-transparent bg-transparent px-2 py-1 text-right text-sm outline-none hover:border-line focus:border-clay focus:bg-background"
    />
  );
}

export function Presupuesto({
  expenses,
  categories,
  wedding,
  userId,
  reload,
  onBudgetChange,
}: {
  expenses: BudgetExpense[];
  categories: BudgetCategory[];
  wedding: { id: string; total_budget: number };
  userId: string;
  reload: () => Promise<void>;
  onBudgetChange: (n: number) => Promise<void>;
}) {
  const [newCategory, setNewCategory] = useState("");
  const [addingIn, setAddingIn] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [budgetDraft, setBudgetDraft] = useState<string | null>(null);

  const categoryNames = useMemo(() => {
    const names = categories.map((c) => c.name);
    for (const e of expenses) if (!names.includes(e.category)) names.push(e.category);
    return names;
  }, [categories, expenses]);

  const totals = useMemo(() => {
    const planned = expenses.reduce((s, e) => s + Number(e.planned), 0);
    const actual = expenses.reduce((s, e) => s + Number(e.actual_cost), 0);
    const paid = expenses.reduce((s, e) => s + Number(e.paid), 0);
    return { planned, actual, paid, pending: actual - paid };
  }, [expenses]);

  const available = Number(wedding.total_budget) || 0;
  const difference = available - totals.planned;
  const shareBase = totals.actual || totals.planned || 1;

  const byCategory = useMemo(
    () =>
      categoryNames.map((name) => {
        const rows = expenses.filter((e) => e.category === name);
        return {
          name,
          rows,
          planned: rows.reduce((s, e) => s + Number(e.planned), 0),
          actual: rows.reduce((s, e) => s + Number(e.actual_cost), 0),
          paid: rows.reduce((s, e) => s + Number(e.paid), 0),
        };
      }),
    [categoryNames, expenses],
  );

  const chartData = useMemo(
    () =>
      byCategory
        .filter((c) => c.actual > 0 || c.paid > 0)
        .map((c) => ({
          name: c.name,
          Pagado: c.paid,
          Pendiente: Math.max(c.actual - c.paid, 0),
          total: c.actual,
        }))
        .sort((a, b) => b.total - a.total),
    [byCategory],
  );

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    if (categoryNames.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast.error("Esa categoría ya existe");
      return;
    }
    const { error } = await supabase.from("expense_categories").insert({
      wedding_id: wedding.id,
      user_id: userId,
      name,
      sort_order: categories.length + 1,
    });
    if (error) {
      toast.error("No se ha podido crear la categoría");
      return;
    }
    setNewCategory("");
    await reload();
  }

  async function removeCategory(name: string) {
    const cat = categories.find((c) => c.name === name);
    if (!cat) return;
    await supabase.from("expense_categories").delete().eq("id", cat.id);
    await reload();
  }

  async function addRow(category: string, concept: string) {
    if (!concept.trim()) return;
    const { error } = await supabase.from("expenses").insert({
      wedding_id: wedding.id,
      user_id: userId,
      concept: concept.trim(),
      category,
      planned: 0,
      actual_cost: 0,
      paid: 0,
    });
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    await reload();
  }

  async function updateRow(
    id: string,
    patch: { planned?: number; actual_cost?: number; paid?: number; category?: string },
  ) {
    const { error } = await supabase.from("expenses").update(patch).eq("id", id);
    if (error) {
      toast.error("No se ha podido guardar");
      return;
    }
    await reload();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Presupuesto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lo que tenéis, lo que cuesta y lo que queda por pagar.
        </p>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Total disponible
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <input
              value={budgetDraft ?? String(available)}
              inputMode="decimal"
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={async () => {
                if (budgetDraft === null) return;
                const n = Number(budgetDraft.replace(",", ".")) || 0;
                setBudgetDraft(null);
                if (n !== available) await onBudgetChange(n);
              }}
              className="w-40 rounded-md border border-transparent bg-transparent font-display text-3xl font-semibold outline-none hover:border-line focus:border-clay focus:bg-background"
            />
            <span className="font-display text-2xl font-semibold">€</span>
          </div>
        </div>
        <Stat label="Total estimado" value={euro(totals.planned)} />
        <Stat
          label="Diferencia"
          value={euro(difference)}
          tone={difference < 0 ? "bad" : "good"}
        />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Gasto real" value={euro(totals.actual)} />
        <Stat label="Pagado" value={euro(totals.paid)} />
        <Stat label="Pendiente" value={euro(totals.pending)} />
      </div>

      <form onSubmit={addCategory} className="mb-6 flex flex-wrap gap-3">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nueva categoría"
          className={`${inputClass} min-w-[220px]`}
        />
        <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground">
          Añadir categoría
        </button>
      </form>

      <div className="space-y-4">
        {byCategory.map((cat) => {
          const isOpen = !collapsed[cat.name];
          return (
            <section
              key={cat.name}
              className="overflow-hidden rounded-2xl bg-panel ring-1 ring-foreground/5"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [cat.name]: isOpen }))}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`font-mono text-xs text-muted-foreground transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    ▸
                  </span>
                  <span className="font-display text-xl font-semibold">{cat.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {cat.rows.length} {cat.rows.length === 1 ? "partida" : "partidas"}
                  </span>
                </button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Previsto {euro(cat.planned)}</span>
                  <span>Real {euro(cat.actual)}</span>
                  <span>Pagado {euro(cat.paid)}</span>
                  {cat.rows.length === 0 && categories.some((c) => c.name === cat.name) && (
                    <button
                      onClick={() => removeCategory(cat.name)}
                      className="text-xs hover:text-destructive"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </header>

              {isOpen && (
                <div className="overflow-x-auto border-t border-line bg-background">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead className="bg-panel text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Concepto</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Previsto</th>
                        <th className="px-4 py-3 text-right">Gasto real</th>
                        <th className="px-4 py-3 text-right">Pagado</th>
                        <th className="px-4 py-3 text-right">Pendiente</th>
                        <th className="px-4 py-3 text-right">% del total</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {cat.rows.map((x) => {
                        const pending = Number(x.actual_cost) - Number(x.paid);
                        return (
                          <tr key={x.id} className="border-t border-line">
                            <td className="px-4 py-2">{x.concept}</td>
                            <td className="px-4 py-2">
                              <select
                                value={x.category}
                                onChange={(e) => updateRow(x.id, { category: e.target.value })}
                                className="rounded-md border border-transparent bg-transparent py-1 text-sm text-muted-foreground outline-none hover:border-line focus:border-clay"
                              >
                                {categoryNames.map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <AmountCell
                                value={Number(x.planned)}
                                onSave={(n) => updateRow(x.id, { planned: n })}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <AmountCell
                                value={Number(x.actual_cost)}
                                onSave={(n) => updateRow(x.id, { actual_cost: n })}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <AmountCell
                                value={Number(x.paid)}
                                onSave={(n) => updateRow(x.id, { paid: n })}
                              />
                            </td>
                            <td
                              className={`px-4 py-2 text-right ${
                                pending > 0 ? "text-destructive" : "text-muted-foreground"
                              }`}
                            >
                              {euro(pending)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">
                              {Math.round((Number(x.actual_cost) / shareBase) * 100)}%
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={async () => {
                                  await supabase.from("expenses").delete().eq("id", x.id);
                                  await reload();
                                }}
                                className="text-xs text-muted-foreground hover:text-destructive"
                              >
                                Borrar
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {cat.rows.length > 0 && (
                        <tr className="border-t border-line bg-panel font-medium">
                          <td className="px-4 py-2" colSpan={2}>
                            Subtotal
                          </td>
                          <td className="px-4 py-2 text-right">{euro(cat.planned)}</td>
                          <td className="px-4 py-2 text-right">{euro(cat.actual)}</td>
                          <td className="px-4 py-2 text-right">{euro(cat.paid)}</td>
                          <td className="px-4 py-2 text-right">{euro(cat.actual - cat.paid)}</td>
                          <td className="px-4 py-2 text-right font-mono text-xs">
                            {Math.round((cat.actual / shareBase) * 100)}%
                          </td>
                          <td />
                        </tr>
                      )}

                      <tr className="border-t border-line">
                        <td className="px-4 py-2" colSpan={8}>
                          {addingIn === cat.name ? (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const input = (e.currentTarget.elements.namedItem(
                                  "concept",
                                ) as HTMLInputElement);
                                await addRow(cat.name, input.value);
                                input.value = "";
                              }}
                              className="flex flex-wrap gap-3"
                            >
                              <input
                                name="concept"
                                autoFocus
                                placeholder="Concepto"
                                className={`${inputClass} min-w-[220px]`}
                              />
                              <button className="rounded-full bg-clay px-4 py-2 text-xs font-medium text-background hover:bg-foreground">
                                Añadir
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddingIn(null)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Cerrar
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setAddingIn(cat.name)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              + Añadir partida
                            </button>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
          <h2 className="font-display text-xl font-semibold">Pagado vs pendiente</h2>
          <div className="relative mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Pagado", value: totals.paid },
                    { name: "Pendiente", value: Math.max(totals.pending, 0) },
                  ]}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Cell fill="var(--color-clay)" />
                  <Cell fill="var(--color-clay-soft)" />
                </Pie>
                <Tooltip
                  formatter={(v: number) => euro(Number(v))}
                  contentStyle={{
                    background: "var(--color-panel)",
                    border: "1px solid var(--color-line)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Gasto real
              </span>
              <span className="font-display text-2xl font-semibold">{euro(totals.actual)}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-clay" /> Pagado
              </span>
              <span>{euro(totals.paid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-clay-soft ring-1 ring-clay/30" /> Pendiente
              </span>
              <span>{euro(Math.max(totals.pending, 0))}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-panel p-6 ring-1 ring-foreground/5">
          <h2 className="font-display text-xl font-semibold">Por categoría</h2>
          {chartData.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Apuntad gastos reales para ver el desglose.
            </p>
          ) : (
            <div className="mt-4" style={{ height: Math.max(240, chartData.length * 42) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis
                    type="number"
                    tickFormatter={(v) => euro(Number(v))}
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-clay-soft)" }}
                    formatter={(v: number) => euro(Number(v))}
                    contentStyle={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-line)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Pagado" stackId="a" fill="var(--color-clay)" radius={[0, 0, 0, 0]} />
                  <Bar
                    dataKey="Pendiente"
                    stackId="a"
                    fill="var(--color-clay-soft)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
