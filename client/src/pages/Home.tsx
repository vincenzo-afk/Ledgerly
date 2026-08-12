// Paper & Signal direction: use asymmetry, tactile linen surfaces, ledger rules, and Signal Coral for moments that matter.
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileJson,
  FileText,
  Filter,
  LayoutDashboard,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
};

const CATEGORIES = [
  { name: "Food", color: "#E35D45", tint: "#FBE5DF", icon: "🍽" },
  { name: "Transport", color: "#3D7770", tint: "#E2F0ED", icon: "↗" },
  { name: "Shopping", color: "#C3954B", tint: "#F5ECD8", icon: "□" },
  { name: "Bills", color: "#536B82", tint: "#E7EDF2", icon: "⌁" },
  { name: "Entertainment", color: "#98706A", tint: "#F1E6E4", icon: "✦" },
  { name: "Health", color: "#6B8C63", tint: "#E8F0E5", icon: "+" },
  { name: "Education", color: "#7A6C86", tint: "#ECE8F0", icon: "▤" },
  { name: "Other", color: "#8E8B80", tint: "#EFEEE8", icon: "•••" },
];

const STORAGE_KEY = "paper-signal-expenses";
const BUDGET_KEY = "paper-signal-budget";

const SEEDED_IDS = new Set(["starter-1", "starter-2", "starter-3", "starter-4", "starter-5", "starter-6", "starter-7", "starter-8"]);

const readStoredExpenses = (): Expense[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Expense[];
    return Array.isArray(parsed) ? parsed.filter((expense) => expense && !SEEDED_IDS.has(expense.id)) : [];
  } catch {
    return [];
  }
};

const readStoredBudget = () => {
  const saved = localStorage.getItem(BUDGET_KEY);
  return saved && saved !== "30000" ? Number(saved) || 0 : 0;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);

function getCategory(name: string) {
  return CATEGORIES.find((category) => category.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

function MetricCard({ label, value, trend, accent, detail }: { label: string; value: string; trend?: string; accent: string; detail: string }) {
  return (
    <article className="metric-card">
      <div className="metric-card__topline">
        <span className="eyebrow">{label}</span>
        <span className="metric-card__accent" style={{ backgroundColor: accent }} />
      </div>
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__footer">
        {trend ? <span className="trend-chip"><ArrowUpRight size={14} /> {trend}</span> : <span className="trend-chip trend-chip--neutral"><Target size={13} /> tracking</span>}
        <span className="metric-card__detail">{detail}</span>
      </div>
    </article>
  );
}

function CategoryPill({ category }: { category: string }) {
  const meta = getCategory(category);
  return (
    <span className="category-pill" style={{ backgroundColor: meta.tint, color: meta.color }}>
      <span className="category-pill__icon">{meta.icon}</span>
      {category}
    </span>
  );
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(readStoredExpenses);
  const [budget, setBudget] = useState(readStoredBudget);
  const [period, setPeriod] = useState("this-month");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: "", category: "Food", date: new Date().toISOString().slice(0, 10), note: "" });
  const today = new Date();
  const currentDateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(today);
  const currentMonthStamp = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(today).toUpperCase();
  const currentDayStamp = new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(today);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, String(budget));
  }, [budget]);

  const visibleExpenses = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(`${expense.date}T00:00:00`);
        if (period === "this-month" && (expenseDate.getMonth() !== currentMonth || expenseDate.getFullYear() !== currentYear)) return false;
        if (period === "last-month") {
          const last = new Date(currentYear, currentMonth - 1, 1);
          if (expenseDate.getMonth() !== last.getMonth() || expenseDate.getFullYear() !== last.getFullYear()) return false;
        }
        if (categoryFilter !== "All categories" && expense.category !== categoryFilter) return false;
        if (search && !`${expense.note} ${expense.category}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, period, categoryFilter, search]);

  const stats = useMemo(() => {
    const total = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const highest = visibleExpenses.reduce((max, expense) => Math.max(max, expense.amount), 0);
    const dates = new Set(visibleExpenses.map((expense) => expense.date));
    return { total, highest, count: visibleExpenses.length, average: dates.size ? total / dates.size : 0, days: dates.size };
  }, [visibleExpenses]);

  const categoryData = useMemo(() => {
    const totals = visibleExpenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: getCategory(name).color }));
  }, [visibleExpenses]);

  const timelineData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const amount = visibleExpenses.filter((expense) => expense.date === key).reduce((sum, expense) => sum + expense.amount, 0);
      return { date: key, label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date), amount };
    });
    return days;
  }, [visibleExpenses]);

  const quietestDay = useMemo(() => {
    if (!visibleExpenses.length) return null;
    return timelineData.reduce((quietest, item) => item.amount < quietest.amount ? item : quietest, timelineData[0]);
  }, [timelineData, visibleExpenses.length]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const amount = expenses.filter((expense) => {
        const expenseDate = new Date(`${expense.date}T00:00:00`);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      }).reduce((sum, expense) => sum + expense.amount, 0);
      return { label: monthLabel(date), amount };
    });
  }, [expenses]);

  const budgetProgress = budget > 0 ? Math.min((stats.total / budget) * 100, 100) : 0;

  const resetForm = () => {
    setEditingId(null);
    setForm({ amount: "", category: "Food", date: new Date().toISOString().slice(0, 10), note: "" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0 || !form.date) {
      toast.error("Add a positive amount and a date before saving.");
      return;
    }
    if (editingId) {
      setExpenses((current) => current.map((expense) => expense.id === editingId ? { ...expense, amount, category: form.category, date: form.date, note: form.note.trim() || "Unlabelled expense" } : expense));
      toast.success("Expense updated in your ledger.");
    } else {
      setExpenses((current) => [{ id: createId(), amount, category: form.category, date: form.date, note: form.note.trim() || "Unlabelled expense" }, ...current]);
      toast.success("Expense added to your ledger.");
    }
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({ amount: String(expense.amount), category: expense.category, date: expense.date, note: expense.note });
    document.getElementById("record-expense")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDelete = (id: string) => {
    const expense = expenses.find((item) => item.id === id);
    if (!expense || !window.confirm(`Remove ${formatCurrency(expense.amount)} from your ledger?`)) return;
    setExpenses((current) => current.filter((item) => item.id !== id));
    toast.success("Expense removed.");
  };

  const exportFile = (format: "json" | "csv") => {
    const content = format === "json"
      ? JSON.stringify(expenses, null, 2)
      : ["Date,Category,Amount,Note", ...expenses.map((expense) => `${expense.date},${expense.category},${expense.amount},"${expense.note.replaceAll('"', '""')}"`)].join("\n");
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paper-signal-expenses.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${format.toUpperCase()} export ready.`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /><i /></div>
          <div>
            <p className="brand-name">Ledgerly</p>
            <p className="brand-caption">Personal finance, read clearly.</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <a className="nav-item nav-item--active" href="#overview"><LayoutDashboard size={17} /> Overview <span className="nav-item__dot" /></a>
          <a className="nav-item" href="#transactions"><ListFilter size={17} /> Transactions</a>
          <a className="nav-item" href="#insights"><BarChart3 size={17} /> Insights</a>
        </nav>

        <div className="sidebar-rule" />
        <div className="budget-module">
          <div className="budget-module__heading"><span className="nav-label">Monthly budget</span><Target size={16} /></div>
          <div className="budget-input-wrap"><span>₹</span><input aria-label="Monthly budget" type="number" min="0" placeholder="Set amount" value={budget || ""} onChange={(event) => setBudget(Number(event.target.value) || 0)} /></div>
          <div className="budget-progress"><span style={{ width: `${budgetProgress}%` }} /></div>
          <div className="budget-module__meta"><span>{formatCurrency(stats.total)} used</span><span>{budget > 0 ? (Math.max(0, budget - stats.total) > 0 ? `${formatCurrency(budget - stats.total)} left` : "Budget reached") : "No limit set"}</span></div>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-card"><div className="profile-avatar">⌁</div><div><strong>Local ledger</strong><span>Stored in this browser</span></div><MoreHorizontal size={17} /></div>
          <button className="settings-link" type="button" onClick={() => toast.info("Your ledger is stored locally in this browser.")}><Settings2 size={16} /> Preferences</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><span className="sync-note"><span className="sync-dot" /> Saved locally</span><button className="icon-button" type="button" onClick={() => exportFile("json")} aria-label="Export JSON"><Download size={17} /></button><button className="avatar-button" type="button" aria-label="Local account">⌁</button></div>
        </header>

        <section className="intro-section" id="overview">
          <div>
            <p className="section-kicker"><span className="coral-line" /> {currentDateLabel}</p>
            <h1>Give every rupee<br /><em>a place in the story.</em></h1>
            <p className="intro-copy">A calmer view of your everyday spending. Read the rhythm, notice the patterns, and keep moving with intention.</p>
          </div>
          <div className="intro-art" aria-hidden="true"><span className="art-line art-line--one" /><span className="art-line art-line--two" /><span className="art-dot art-dot--one" /><span className="art-dot art-dot--two" /><div className="art-note">{currentMonthStamp}<br /><strong>{currentDayStamp}</strong></div></div>
        </section>

        <section className="metric-grid" aria-label="Expense summary">
          <MetricCard label="Total spent" value={formatCurrency(stats.total)} accent="#E35D45" detail="current view" />
          <MetricCard label="Transactions" value={String(stats.count).padStart(2, "0")} accent="#3D7770" detail="current view" />
          <MetricCard label="Largest expense" value={formatCurrency(stats.highest)} accent="#C3954B" detail="single transaction" />
          <MetricCard label="Daily average" value={formatCurrency(stats.average)} accent="#536B82" detail={`${stats.days || 0} recorded days`} />
        </section>

        <div className="workspace-grid">
          <div className="analysis-column">
            <section className="panel panel--chart" id="insights">
              <div className="panel-heading"><div><p className="eyebrow"><span className="section-index">01</span> Spending rhythm</p><h2>Where your money moves</h2></div><div className="chart-legend"><span><i className="legend-swatch legend-swatch--coral" /> Daily spend</span></div></div>
              <div className="chart-wrap chart-wrap--area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                    <defs><linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E35D45" stopOpacity={0.24} /><stop offset="100%" stopColor="#E35D45" stopOpacity={0.02} /></linearGradient></defs>
                    <CartesianGrid vertical={false} stroke="#E2DED4" strokeDasharray="2 5" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#8D8D84", fontSize: 11 }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#A2A097", fontSize: 10 }} tickFormatter={(value) => value === 0 ? "0" : `₹${value / 1000}k`} width={35} />
                    <Tooltip cursor={{ stroke: "#D9D4C8", strokeWidth: 1 }} contentStyle={{ border: "1px solid #DCD7CB", borderRadius: 10, background: "#FFFEFA", fontFamily: "DM Sans", fontSize: 12 }} formatter={(value) => [formatCurrency(Number(value)), "Spent"]} />
                    <Area type="monotone" dataKey="amount" stroke="#E35D45" strokeWidth={2.5} fill="url(#signalFill)" dot={{ r: 3.5, fill: "#FFFEFA", stroke: "#E35D45", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#E35D45", stroke: "#FFFEFA", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-footnote"><span><TrendingUp size={14} /> {quietestDay ? `Lowest recorded day: ${quietestDay.label}.` : "Add entries to reveal your daily rhythm."}</span><button className="text-button" type="button" onClick={() => toast.info("Daily rhythm is based on the visible expenses in the last seven days.")}>How this is calculated <ArrowUpRight size={14} /></button></div>
            </section>

            <div className="split-panels">
              <section className="panel panel--donut">
                <div className="panel-heading panel-heading--compact"><div><p className="eyebrow"><span className="section-index">02</span> By category</p><h2>Spend composition</h2></div><button className="kebab-button" type="button" aria-label="Chart options" onClick={() => toast.info("Category chart reflects your current filters.")}><MoreHorizontal size={17} /></button></div>
                <div className="donut-layout"><div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData.length ? categoryData : [{ name: "No data", value: 1, color: "#E4E0D7" }]} innerRadius={54} outerRadius={76} paddingAngle={3} dataKey="value" stroke="none">{(categoryData.length ? categoryData : [{ name: "No data", value: 1, color: "#E4E0D7" }]).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ border: "1px solid #DCD7CB", borderRadius: 10, background: "#FFFEFA", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatCurrency(stats.total)}</strong><span>total</span></div></div><div className="category-legend">{(categoryData.length ? categoryData.slice(0, 4) : [{ name: "No data", value: 0, color: "#E4E0D7" }]).map((item) => <div className="category-legend__row" key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{stats.total ? Math.round((item.value / stats.total) * 100) : 0}%</strong></div>)}</div></div>
              </section>

              <section className="panel panel--bars">
                <div className="panel-heading panel-heading--compact"><div><p className="eyebrow"><span className="section-index">03</span> Six month view</p><h2>Monthly pulse</h2></div><span className="mini-stamp">₹</span></div>
                <div className="chart-wrap chart-wrap--bars"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -28, bottom: 0 }}><CartesianGrid vertical={false} stroke="#E7E2D8" strokeDasharray="2 5" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#8D8D84", fontSize: 10 }} dy={8} /><YAxis hide /><Tooltip cursor={{ fill: "#F5F0E7" }} contentStyle={{ border: "1px solid #DCD7CB", borderRadius: 10, background: "#FFFEFA", fontSize: 12 }} formatter={(value) => [formatCurrency(Number(value)), "Spent"]} /><Bar dataKey="amount" radius={[4, 4, 1, 1]} fill="#3D7770" /></BarChart></ResponsiveContainer></div>
              </section>
            </div>
          </div>

          <aside className="record-column">
            <section className={`panel record-panel ${editingId ? "record-panel--editing" : ""}`} id="record-expense">
              <div className="record-panel__top"><div className="record-icon"><Plus size={19} /></div><div><p className="eyebrow">{editingId ? "Edit entry" : "New entry"}</p><h2>{editingId ? "Refine the record" : "Record an expense"}</h2></div>{editingId && <button className="close-edit" type="button" onClick={resetForm} aria-label="Cancel editing"><X size={17} /></button>}</div>
              <p className="record-copy">Keep the little things visible. They add up to a picture.</p>
              <form onSubmit={handleSubmit} className="expense-form">
                <label className="field field--amount"><span>Amount</span><div className="amount-input"><b>₹</b><input required inputMode="decimal" type="number" min="1" step="1" placeholder="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div></label>
                <div className="form-row"><label className="field"><span>Category</span><div className="select-wrap"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{CATEGORIES.map((category) => <option key={category.name}>{category.name}</option>)}</select><ChevronDown size={15} /></div></label><label className="field"><span>Date</span><div className="date-input"><input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /><CalendarDays size={15} /></div></label></div>
                <label className="field"><span>Note <em>optional</em></span><input type="text" maxLength={48} placeholder="What was it for?" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
                <button className="primary-button" type="submit">{editingId ? <><Check size={17} /> Save changes</> : <><Plus size={17} /> Add to ledger</>}<ArrowUpRight size={16} /></button>
                {editingId && <button className="cancel-button" type="button" onClick={resetForm}>Cancel edit</button>}
              </form>
            </section>

            <section className="insight-note"><div className="insight-note__icon"><Sparkles size={16} /></div><div><p className="eyebrow">A small observation</p><p>{categoryData.length ? <>{categoryData[0].name} is leading the month at <strong>{formatCurrency(categoryData[0].value)}</strong>. A little awareness is already a useful change.</> : <>Your ledger is waiting for its first line. Add an expense to see your story take shape.</>}</p></div></section>
          </aside>
        </div>

        <section className="panel transactions-panel" id="transactions">
          <div className="transactions-header"><div><p className="eyebrow"><span className="section-index">04</span> Your ledger</p><h2>Recent transactions</h2></div><div className="transaction-actions"><button className="secondary-button" type="button" onClick={() => exportFile("csv")}><FileText size={15} /> Export CSV</button><button className="secondary-button secondary-button--icon" type="button" onClick={() => exportFile("json")} aria-label="Export JSON"><FileJson size={16} /></button></div></div>
          <div className="filter-bar"><div className="search-box"><Search size={16} /><input type="search" placeholder="Search your ledger" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-control"><Filter size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="this-month">This month</option><option value="last-month">Last month</option><option value="all">All time</option></select><ChevronDown size={14} /></div><div className="filter-control"><ListFilter size={15} /><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{CATEGORIES.map((category) => <option key={category.name}>{category.name}</option>)}</select><ChevronDown size={14} /></div><span className="filter-count">{visibleExpenses.length} entries</span></div>
          <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th className="amount-column">Amount</th><th aria-label="Actions" /></tr></thead><tbody>{visibleExpenses.length ? visibleExpenses.map((expense) => <tr key={expense.id}><td><div className="transaction-name"><span className="transaction-mark" style={{ backgroundColor: getCategory(expense.category).color }} /> <span><strong>{expense.note}</strong><small>Local record</small></span></div></td><td><CategoryPill category={expense.category} /></td><td className="date-cell">{formatDate(expense.date)}</td><td className="amount-cell">{formatCurrency(expense.amount)}</td><td><div className="row-actions"><button type="button" onClick={() => handleEdit(expense)} aria-label={`Edit ${expense.note}`}><Pencil size={15} /></button><button type="button" onClick={() => handleDelete(expense.id)} aria-label={`Delete ${expense.note}`}><Trash2 size={15} /></button></div></td></tr>) : <tr><td colSpan={5}><div className="empty-state"><div className="empty-state__mark"><Search size={18} /></div><strong>No entries in this view</strong><span>Try another filter or record a new expense.</span></div></td></tr>}</tbody></table></div>
        </section>

        <footer className="app-footer"><span>Ledgerly / Paper & Signal</span><span><span className="footer-dot" /> All records stay in this browser</span></footer>
      </main>
    </div>
  );
}
