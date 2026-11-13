import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import AuthPage, { AuthSplash } from "./auth/AuthPage";
import { fetchFinanceOverview, type FinanceOverview } from "./api/finance";

type Page =
  | "home"
  | "finance"
  | "music"
  | "plans"
  | "learning"
  | "system"
  | "movies"
  | "travel"
  | "fitness"
  | "inspiration";
type IconName =
  | "grid"
  | "wallet"
  | "music"
  | "check"
  | "book"
  | "plus"
  | "search"
  | "command"
  | "settings"
  | "bell"
  | "more"
  | "arrow"
  | "trend"
  | "play"
  | "pause"
  | "clock"
  | "calendar"
  | "filter"
  | "layout"
  | "chevron";

const paths: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5V6a2 2 0 0 1 2-2h12v3.5" />
      <rect x="3" y="7.5" width="18" height="12.5" rx="3" />
      <path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>
  ),
  check: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12a9 9 0 1 1-5.3-8.2" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  command: (
    <>
      <path d="M18 9a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  trend: (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7Z" />,
  pause: (
    <>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  filter: <path d="M4 5h16l-6 7v5l-4 2v-7Z" />,
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const initialModules: Array<{
  id: Page;
  name: string;
  icon: IconName;
  color: string;
  note: string;
}> = [
  {
    id: "finance" as Page,
    name: "记账",
    icon: "wallet" as IconName,
    color: "#E56F4A",
    note: "本月结余 ¥7,640",
  },
  {
    id: "music" as Page,
    name: "音乐",
    icon: "music" as IconName,
    color: "#9B72D2",
    note: "正在播放 1 首",
  },
  {
    id: "plans" as Page,
    name: "计划",
    icon: "check" as IconName,
    color: "#4C8D78",
    note: "3 项待完成",
  },
  {
    id: "learning" as Page,
    name: "学习",
    icon: "book" as IconName,
    color: "#D4A63D",
    note: "连续 12 天",
  },
];

const week = ["一", "二", "三", "四", "五", "六", "日"];

function Badge({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Ring({
  value,
  color = "#E56F4A",
  size = 92,
  children,
}: {
  value: number;
  color?: string;
  size?: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="ring"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${value * 3.6}deg, #edece7 0)`,
      }}
    >
      <div className="ring-inner">
        {children ?? (
          <>
            <b>{value}%</b>
            <small>完成</small>
          </>
        )}
      </div>
    </div>
  );
}

function ModuleShell({
  title,
  subtitle,
  color,
  actions,
  children,
  status,
}: {
  title: string;
  subtitle: string;
  color: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  status?: string;
}) {
  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="module-title">
          <span className="title-mark" style={{ background: color }} />
          <div>
            <div className="eyebrow">MODULE / PERSONAL</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="module-actions">
          {actions}
          <button className="icon-btn">
            <Icon name="more" />
          </button>
        </div>
      </header>
      <div className="module-content">{children}</div>
      <footer className="module-status">
        <span>
          <i className="status-dot" />
          {status || "数据已同步"}
        </span>
        <span>上次更新 · 刚刚</span>
      </footer>
    </section>
  );
}

function Dashboard({ open }: { open: (p: Page) => void }) {
  const { user } = useAuth();
  const [sizes, setSizes] = useState<Record<string, boolean>>({});
  const flip = (id: string) => setSizes((s) => ({ ...s, [id]: !s[id] }));
  const [finance, setFinance] = useState<FinanceOverview | null>(null);

  useEffect(() => {
    let active = true;
    fetchFinanceOverview()
      .then((result) => {
        if (active) setFinance(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const monthLabel = finance ? MONTH_LABELS[Number(finance.month.slice(5, 7)) - 1] : "本月";
  const [balanceInt, balanceDec] = money(finance?.balanceCents ?? 0, 2).split(".");
  return (
    <div className="page dashboard">
      <div className="page-intro">
        <div>
          <div className="eyebrow">THURSDAY · 24 OCTOBER</div>
          <h1>晚上好，{user?.nickname || "朋友"}</h1>
          <p>你今天的节奏不错。这里是生活里正在发生的事。</p>
        </div>
        <div className="today">
          <span>今日专注</span>
          <strong>2h 40m</strong>
          <div className="mini-bars">
            {[30, 55, 35, 78, 64, 90, 48].map((h, i) => (
              <i key={i} style={{ height: h + "%" }} />
            ))}
          </div>
        </div>
      </div>
      <div className="bento">
        <article
          className={`bento-card balance ${sizes.finance ? "wide" : ""}`}
          onContextMenu={(e) => {
            e.preventDefault();
            flip("finance");
          }}
        >
          <CardTop
            icon="wallet"
            color="#E56F4A"
            label={`记账 · ${monthLabel}`}
            onOpen={() => open("finance")}
            onResize={() => flip("finance")}
          />
          <div className="balance-main">
            <span>本月结余</span>
            <strong>
              ¥ {balanceInt}
              <small>.{balanceDec}</small>
            </strong>
            <Badge tone={(finance?.balanceChangePct ?? 0) >= 0 ? "up" : "neutral"}>
              {signedPct(finance?.balanceChangePct)}
            </Badge>
          </div>
          <div className="money-row">
            <div>
              <span>收入</span>
              <b>¥ {money(finance?.incomeCents ?? 0)}</b>
            </div>
            <div>
              <span>支出</span>
              <b>¥ {money(finance?.expenseCents ?? 0)}</b>
            </div>
          </div>
          <div className="line-chart">
            <svg viewBox="0 0 500 90" preserveAspectRatio="none">
              <path
                className="area"
                d="M0 72 C50 69 72 25 120 42 S190 66 230 34 300 60 338 28 420 50 500 10 L500 90H0Z"
              />
              <path d="M0 72 C50 69 72 25 120 42 S190 66 230 34 300 60 338 28 420 50 500 10" />
            </svg>
          </div>
        </article>
        <article className="bento-card now-playing">
          <CardTop icon="music" color="#9B72D2" label="此刻播放" onOpen={() => open("music")} />
          <div className="album-art album-1">
            <span>
              STILL
              <br />
              LIFE
            </span>
          </div>
          <div className="track-info">
            <div>
              <b>Garden Song</b>
              <span>Phoebe Bridgers · Punisher</span>
            </div>
            <button className="play-btn">
              <Icon name="pause" size={16} />
            </button>
          </div>
          <div className="progress">
            <i style={{ width: "38%" }} />
            <b style={{ left: "38%" }} />
          </div>
          <div className="time">
            <span>1:42</span>
            <span>4:05</span>
          </div>
        </article>
        <article className="bento-card plans-card">
          <CardTop icon="check" color="#4C8D78" label="今日计划" onOpen={() => open("plans")} />
          <div className="plan-count">
            <strong>3</strong>
            <span>
              of 5<br />
              已完成
            </span>
            <Ring value={60} color="#4C8D78" size={64} />
          </div>
          <Todo text="整理书房和资料" done />
          <Todo text="完成阅读笔记" done />
          <Todo text="更新十月预算" />
        </article>
        <article className="bento-card learning-card">
          <CardTop icon="book" color="#D4A63D" label="学习轨迹" onOpen={() => open("learning")} />
          <div className="learning-head">
            <div>
              <strong>12</strong>
              <span>天连续学习</span>
            </div>
            <Badge>本周 4.5h</Badge>
          </div>
          <div className="heatmap compact">
            {Array.from({ length: 35 }, (_, i) => (
              <i key={i} className={`l${(i * 7 + (i % 3)) % 5}`} />
            ))}
          </div>
          <div className="course-mini">
            <div className="course-icon">UI</div>
            <div>
              <b>界面设计系统</b>
              <span>第 8 / 12 章</span>
            </div>
            <span>67%</span>
          </div>
        </article>
        <article className="bento-card note-card">
          <div className="eyebrow">QUICK NOTE · 21:46</div>
          <blockquote>
            “保持好奇，也保持
            <br />
            自己的节奏。”
          </blockquote>
          <div className="note-foot">
            <span>随手记</span>
            <button className="round-arrow">
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </article>
      </div>
      <p className="interaction-tip">提示：右键点击卡片可快速调整尺寸 · 拖拽左侧模块可排序</p>
    </div>
  );
}

function CardTop({
  icon,
  color,
  label,
  onOpen,
  onResize,
}: {
  icon: IconName;
  color: string;
  label: string;
  onOpen: () => void;
  onResize?: () => void;
}) {
  return (
    <div className="card-top">
      <div>
        <span className="module-icon" style={{ color, background: color + "15" }}>
          <Icon name={icon} size={16} />
        </span>
        <b>{label}</b>
      </div>
      <div>
        {onResize && (
          <button className="ghost-action" onClick={onResize}>
            <Icon name="layout" size={15} />
          </button>
        )}
        <button className="ghost-action" onClick={onOpen}>
          <Icon name="arrow" size={15} />
        </button>
      </div>
    </div>
  );
}

function Todo({ text, done = false }: { text: string; done?: boolean }) {
  const [checked, setChecked] = useState(done);
  return (
    <button className={`todo ${checked ? "done" : ""}`} onClick={() => setChecked(!checked)}>
      <i>{checked && <Icon name="check" size={12} />}</i>
      <span>{text}</span>
      <Icon name="more" size={15} />
    </button>
  );
}

const MONTH_LABELS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

function money(cents: number, decimals = 0) {
  return (cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function signedPct(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/** 把一串数值映射到 700x210 的折线路径。 */
function linePath(values: number[], max: number) {
  if (values.length < 2) return "";
  const step = 700 / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * step;
    const y = 200 - (max > 0 ? (value / max) * 180 : 0);
    return [x, y] as const;
  });
  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point[0]} ${point[1]}`;
    const prev = points[index - 1];
    const cx = (prev[0] + point[0]) / 2;
    return `${path} C${cx} ${prev[1]} ${cx} ${point[1]} ${point[0]} ${point[1]}`;
  }, "");
}

function FinancePage() {
  const [data, setData] = useState<FinanceOverview | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    fetchFinanceOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "读取失败");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const trend = data?.trend ?? [];
  const categories = data?.categories ?? [];
  const peak = Math.max(100000, ...trend.flatMap((point) => [point.incomeCents, point.expenseCents]));
  const yMax = Math.ceil(peak / 50000) * 50000;
  const incomePath = linePath(trend.map((point) => point.incomeCents), yMax);
  const expensePath = linePath(trend.map((point) => point.expenseCents), yMax);
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) => `${Math.round((yMax * ratio) / 100000)}k`);
  const donutStops = categories.map((item, index) => {
    const from = categories.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
    return `${item.color} ${from}% ${from + item.percent}%`;
  });
  const monthLabel = data ? MONTH_LABELS[Number(data.month.slice(5, 7)) - 1] : "";

  return (
    <div className="page">
      <ModuleShell
        title="记账"
        subtitle="收支趋势、预算与每一笔生活选择。"
        color="#E56F4A"
        status={data ? `已同步 ${data.totalCount} 笔流水` : "正在同步…"}
        actions={
          <>
            <button className="secondary-btn">
              <Icon name="filter" size={16} />
              筛选
            </button>
            <button className="primary-btn">
              <Icon name="plus" size={16} />
              记一笔
            </button>
          </>
        }
      >
        {error && (
          <div className="finance-error">
            <span>读取失败：{error}</span>
            <button className="text-btn" onClick={() => setAttempt((value) => value + 1)}>
              重试
            </button>
          </div>
        )}
        <div className="stats-row">
          <Stat
            label={`${monthLabel || "本月"}收入`}
            value={data ? `¥ ${money(data.incomeCents)}` : "—"}
            change={signedPct(data?.incomeChangePct)}
          />
          <Stat
            label={`${monthLabel || "本月"}支出`}
            value={data ? `¥ ${money(data.expenseCents)}` : "—"}
            change={signedPct(data?.expenseChangePct)}
            good={(data?.expenseChangePct ?? 0) <= 0}
          />
          <Stat
            label="结余率"
            value={data ? `${data.balanceRate}%` : "—"}
            change={signedPct(data?.balanceChangePct)}
          />
        </div>
        <div className="detail-grid finance-grid">
          <Panel
            title="收支趋势"
            aside={
              <div className="legend">
                <span>
                  <i className="income" />
                  收入
                </span>
                <span>
                  <i />
                  支出
                </span>
              </div>
            }
          >
            <div className="finance-chart">
              <div className="y-labels">
                {yLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <svg viewBox="0 0 700 210" preserveAspectRatio="none">
                <path className="gridline" d="M0 20H700M0 65H700M0 110H700M0 155H700M0 200H700" />
                <path className="income-line" d={incomePath} />
                <path className="expense-line" d={expensePath} />
              </svg>
              <div className="x-labels">
                {trend.map((point) => (
                  <span key={point.month}>{point.label}</span>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="支出分类" aside={<button className="text-btn">查看全部</button>}>
            <div className="donut-wrap">
              <div
                className="donut"
                style={{
                  background: categories.length
                    ? `conic-gradient(${donutStops.join(", ")})`
                    : "conic-gradient(#e9e4d8 0% 100%)",
                }}
              >
                <div>
                  <b>¥{money(data?.expenseCents ?? 0)}</b>
                  <span>总支出</span>
                </div>
              </div>
              <div className="cat-list">
                {categories.map((item) => (
                  <Category
                    key={item.name}
                    color={item.color}
                    name={item.name}
                    val={`${item.percent}%`}
                  />
                ))}
                {!categories.length && <Category color="#e9e4d8" name="暂无支出" val="0%" />}
              </div>
            </div>
          </Panel>
        </div>
        <Panel
          title="最近流水"
          aside={
            <button className="text-btn">
              全部流水 <Icon name="arrow" size={14} />
            </button>
          }
        >
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>交易</th>
                <th>分类</th>
                <th>金额</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <b>{row.title}</b>
                  </td>
                  <td>
                    <Badge>{row.category}</Badge>
                  </td>
                  <td className={row.type === 1 ? "positive" : ""}>
                    {row.type === 1 ? "+" : "−"} ¥{money(row.amountCents, 2)}
                  </td>
                  <td>
                    <Icon name="more" size={15} />
                  </td>
                </tr>
              ))}
              {!data?.recent.length && (
                <tr>
                  <td colSpan={5}>还没有流水记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </ModuleShell>
    </div>
  );
}

function Stat({
  label,
  value,
  change,
  good,
}: {
  label: string;
  value: string;
  change: string;
  good?: boolean;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <Badge tone={good ? "up" : "neutral"}>{change}</Badge>
    </div>
  );
}
function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <header>
        <h3>{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  );
}
function Category({ color, name, val }: { color: string; name: string; val: string }) {
  return (
    <div>
      <span>
        <i style={{ background: color }} />
        {name}
      </span>
      <b>{val}</b>
    </div>
  );
}

function MusicPage() {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="page music-page">
      <ModuleShell
        title="音乐"
        subtitle="收藏声音，也收藏它们发生时的心情。"
        color="#9B72D2"
        status="音乐资料库 · 2,184 首"
        actions={
          <>
            <button className="secondary-btn">
              <Icon name="filter" size={16} />
              筛选
            </button>
            <button className="primary-btn purple">
              <Icon name="plus" size={16} />
              新建歌单
            </button>
          </>
        }
      >
        <div className="music-layout">
          <aside className="playlist-side">
            <div className="side-label">你的资料库</div>
            {["最近播放", "特别喜欢", "2024 年度歌单", "深夜散步", "周日的厨房"].map((x, i) => (
              <button key={x} className={i === 0 ? "active" : ""}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {x}
                <small>{[32, 86, 24, 41, 18][i]}</small>
              </button>
            ))}
          </aside>
          <div className="music-main">
            <div className="music-hero">
              <div>
                <div className="eyebrow">MADE FOR LIM</div>
                <h2>晚风与未读完的书</h2>
                <p>安静、松弛，适合留给自己的夜晚。</p>
                <button className="primary-btn purple" onClick={() => setPlaying(!playing)}>
                  <Icon name={playing ? "pause" : "play"} size={15} />
                  {playing ? "暂停播放" : "开始播放"}
                </button>
              </div>
              <div className="hero-disc">
                <div className="album-art album-2">
                  <span>
                    SUNDAY
                    <br />
                    LIGHT
                  </span>
                </div>
                <i />
              </div>
            </div>
            <div className="section-title">
              <h3>最近播放</h3>
              <button className="text-btn">
                查看全部 <Icon name="arrow" size={14} />
              </button>
            </div>
            <div className="album-grid">
              {[
                ["album-1", "Punisher", "Phoebe Bridgers"],
                ["album-3", "Charm", "Clairo"],
                ["album-4", "Blonde", "Frank Ocean"],
                ["album-5", "The Land Is...", "Sufjan Stevens"],
              ].map((a, i) => (
                <div className="album-card" key={a[1]}>
                  <div className={`album-art ${a[0]}`}>
                    <span>
                      {i === 1 ? "CHARM" : i === 2 ? "BLONDE" : i === 3 ? "LAND" : "STILL LIFE"}
                    </span>
                    <button>
                      <Icon name="play" size={16} />
                    </button>
                  </div>
                  <b>{a[1]}</b>
                  <span>{a[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="player">
          <div className="tiny-cover album-1" />
          <div className="now-title">
            <b>Garden Song</b>
            <span>Phoebe Bridgers</span>
          </div>
          <div className="controls">
            <button>
              <Icon name="chevron" size={17} />
            </button>
            <button className="control-main" onClick={() => setPlaying(!playing)}>
              <Icon name={playing ? "pause" : "play"} size={17} />
            </button>
            <button>
              <Icon name="chevron" size={17} />
            </button>
          </div>
          <span className="player-time">1:42</span>
          <div className="player-progress">
            <i />
          </div>
          <span className="player-time">4:05</span>
        </div>
      </ModuleShell>
    </div>
  );
}

function PlansPage() {
  const [view, setView] = useState<"kanban" | "timeline">("kanban");
  const columns = [
    {
      name: "待处理",
      count: 3,
      cards: [
        ["整理年度照片", "生活", "10月26日"],
        ["梳理十一月预算", "个人", "10月28日"],
        ["读完《观看之道》", "阅读", "本周"],
      ],
    },
    {
      name: "进行中",
      count: 2,
      cards: [
        ["个人网站迭代", "创作", "今天"],
        ["整理设计素材库", "工作", "明天"],
      ],
    },
    {
      name: "已完成",
      count: 3,
      cards: [
        ["完成十月复盘", "个人", "已完成"],
        ["预约牙科检查", "生活", "已完成"],
        ["更新阅读书单", "阅读", "已完成"],
      ],
    },
  ];
  return (
    <div className="page">
      <ModuleShell
        title="计划"
        subtitle="把想做的事，放进看得见的时间里。"
        color="#4C8D78"
        status="本周完成率 68%"
        actions={
          <>
            <div className="segmented">
              <button
                className={view === "kanban" ? "active" : ""}
                onClick={() => setView("kanban")}
              >
                看板
              </button>
              <button
                className={view === "timeline" ? "active" : ""}
                onClick={() => setView("timeline")}
              >
                时间轴
              </button>
            </div>
            <button className="primary-btn green">
              <Icon name="plus" size={16} />
              新计划
            </button>
          </>
        }
      >
        <div className="plan-summary">
          <div>
            <span>本周进度</span>
            <b>17 / 25</b>
          </div>
          <div className="summary-track">
            <i />
          </div>
          <div className="avatars">
            <i>LM</i>
            <span>只属于你的空间</span>
          </div>
          <div className="week-nav">
            <button>‹</button>
            <b>10月 21 — 27日</b>
            <button>›</button>
          </div>
        </div>
        {view === "kanban" ? (
          <div className="kanban">
            {columns.map((col, ci) => (
              <div className="kanban-col" key={col.name}>
                <header>
                  <div>
                    <i className={`col-dot c${ci}`} />
                    <b>{col.name}</b>
                    <span>{col.count}</span>
                  </div>
                  <button>
                    <Icon name="plus" size={16} />
                  </button>
                </header>
                {col.cards.map((c, i) => (
                  <article className={ci === 2 ? "completed" : ""} key={c[0]} draggable>
                    <div className="drag-handle">⠿</div>
                    <Badge>{c[1]}</Badge>
                    <h4>{c[0]}</h4>
                    <footer>
                      <span>
                        <Icon name={ci === 2 ? "check" : "calendar"} size={14} />
                        {c[2]}
                      </span>
                      <button>
                        <Icon name="more" size={15} />
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="timeline-view">
            {week.map((d, i) => (
              <div className={i === 3 ? "active" : ""} key={d}>
                <span>{d}</span>
                <b>{21 + i}</b>
                {i === 0 && (
                  <article style={{ height: 82 }}>
                    晨间阅读<small>08:00</small>
                  </article>
                )}
                {i === 2 && (
                  <article className="gold" style={{ height: 120 }}>
                    素材库整理<small>14:30</small>
                  </article>
                )}
                {i === 3 && (
                  <article className="green" style={{ height: 98 }}>
                    网站迭代<small>19:00</small>
                  </article>
                )}
              </div>
            ))}
          </div>
        )}
      </ModuleShell>
    </div>
  );
}

function LearningPage() {
  return (
    <div className="page">
      <ModuleShell
        title="学习"
        subtitle="让每一点投入，都留下清晰的成长轨迹。"
        color="#D4A63D"
        status="今日已学习 42 分钟"
        actions={
          <>
            <button className="secondary-btn">
              <Icon name="calendar" size={16} />
              学习记录
            </button>
            <button className="primary-btn gold">
              <Icon name="plus" size={16} />
              新建笔记
            </button>
          </>
        }
      >
        <div className="learning-summary">
          <Panel title="本月学习">
            <div className="learning-ring">
              <Ring value={72} color="#D4A63D" size={126} />
              <div>
                <span>本月累计</span>
                <strong>18h 40m</strong>
                <small>比上月多 3h 20m</small>
              </div>
            </div>
          </Panel>
          <Panel title="连续学习">
            <div className="streak">
              <strong>12</strong>
              <span>天</span>
              <div>
                {week.map((x, i) => (
                  <i className={i < 6 ? "on" : ""} key={x}>
                    {x}
                  </i>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="本周目标">
            <div className="goal">
              <strong>
                4.5 <small>/ 6 小时</small>
              </strong>
              <div>
                <i />
              </div>
              <span>还差 1.5 小时</span>
            </div>
          </Panel>
        </div>
        <div className="detail-grid learn-grid">
          <Panel title="学习热力图" aside={<span className="muted">过去 16 周</span>}>
            <div className="heatmap-label">
              <span>一</span>
              <span>三</span>
              <span>五</span>
            </div>
            <div className="heatmap large">
              {Array.from({ length: 112 }, (_, i) => (
                <i key={i} className={`l${(i * 13 + (i % 5)) % 5}`} />
              ))}
            </div>
            <div className="heat-legend">
              <span>少</span>
              {[0, 1, 2, 3, 4].map((x) => (
                <i className={`l${x}`} key={x} />
              ))}
              <span>多</span>
            </div>
          </Panel>
          <Panel title="正在学习" aside={<button className="text-btn">全部课程</button>}>
            <div className="course-list">
              <Course title="界面设计系统" meta="8 / 12 章" progress={67} color="#D4A63D" />
              <Course title="日语 · N3 语法" meta="21 / 40 节" progress={52} color="#9B72D2" />
              <Course title="现代艺术史" meta="5 / 16 章" progress={31} color="#4C8D78" />
            </div>
          </Panel>
        </div>
        <div className="section-title">
          <h3>最近笔记</h3>
          <button className="text-btn">
            查看全部 <Icon name="arrow" size={14} />
          </button>
        </div>
        <div className="notes-grid">
          {["设计系统不是组件库", "包豪斯：形式追随功能", "今日阅读摘录"].map((n, i) => (
            <article key={n}>
              <div className="note-tag">{["设计", "艺术史", "阅读"][i]}</div>
              <h3>{n}</h3>
              <p>
                {
                  [
                    "一致性不是让一切看起来相同，而是让不同事物拥有清晰的关系。",
                    "真正的现代主义不是一种风格，而是一种持续追问的方式。",
                    "我们以为自己在读一本书，其实是在重新认识经验。",
                  ][i]
                }
              </p>
              <footer>
                <span>10月 {22 - i * 2}日</span>
                <Icon name="arrow" size={15} />
              </footer>
            </article>
          ))}
        </div>
      </ModuleShell>
    </div>
  );
}
function Course({
  title,
  meta,
  progress,
  color,
}: {
  title: string;
  meta: string;
  progress: number;
  color: string;
}) {
  return (
    <div className="course">
      <span className="course-icon" style={{ background: color + "18", color }}>
        {title.slice(0, 1)}
      </span>
      <div>
        <b>{title}</b>
        <span>{meta}</span>
        <div>
          <i style={{ width: progress + "%", background: color }} />
        </div>
      </div>
      <strong>{progress}%</strong>
    </div>
  );
}

function DesignSystem() {
  const templates = [
    ["List", "清晰的信息行与批量操作", "三种密度"],
    ["Chart", "趋势、比例与数据洞察", "四种图表"],
    ["CardFlow", "可拖拽卡片与状态流转", "响应式"],
    ["Timeline", "按时间组织事件与记录", "纵向/横向"],
    ["Calendar", "日期、热力与周期视图", "周/月/年"],
  ];
  return (
    <div className="page system-page">
      <div className="system-hero">
        <div className="eyebrow">LIFE OS / DESIGN SYSTEM 01</div>
        <h1>
          安静的秩序，
          <br />
          装下鲜活的日常。
        </h1>
        <p>一套为个人数据设计的模块化语言。克制、清晰，也保留温度。</p>
        <div className="version">Foundations · v1.4.0</div>
      </div>
      <section className="system-section">
        <header>
          <span>01</span>
          <div>
            <h2>色彩与排版</h2>
            <p>低饱和自然色构成模块语义，以朱砂橙作为全局强调。</p>
          </div>
        </header>
        <div className="system-grid">
          <div className="color-spec">
            <h3>Semantic colors</h3>
            <div className="swatches">
              {[
                ["Ink", "#252521"],
                ["Paper", "#F6F5F0"],
                ["Accent", "#E56F4A"],
                ["Moss", "#4C8D78"],
                ["Iris", "#9B72D2"],
                ["Ochre", "#D4A63D"],
              ].map((c) => (
                <div key={c[0]}>
                  <i style={{ background: c[1] }} />
                  <b>{c[0]}</b>
                  <span>{c[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="type-spec">
            <h3>Type scale</h3>
            <div className="display-type">
              Aa <span>Display / 48</span>
            </div>
            <div className="heading-type">
              个人兴趣聚合系统 <span>Heading / 24</span>
            </div>
            <p>
              清晰的层级帮助信息自然浮现。<span>Body / 14</span>
            </p>
          </div>
        </div>
      </section>
      <section className="system-section">
        <header>
          <span>02</span>
          <div>
            <h2>ModuleShell 外壳</h2>
            <p>每个模块共享标题、操作、内容与状态四个稳定区域。</p>
          </div>
        </header>
        <div className="shell-demo">
          <div className="demo-top">
            <div>
              <i />
              <span />
              <span />
            </div>
            <b>Header / Actions</b>
          </div>
          <div className="demo-content">
            <Icon name="layout" size={32} />
            <b>Content Template</b>
            <span>List · Chart · CardFlow · Timeline · Calendar</span>
          </div>
          <div className="demo-status">
            <i /> Status / Metadata
          </div>
        </div>
      </section>
      <section className="system-section">
        <header>
          <span>03</span>
          <div>
            <h2>五种内容模板</h2>
            <p>由模块元数据选择，新增模块无需重新设计页面结构。</p>
          </div>
        </header>
        <div className="template-grid">
          {templates.map((t, i) => (
            <article key={t[0]}>
              <div className={`template-visual t${i}`}>
                {i === 0 && [1, 2, 3].map((x) => <i key={x} />)}
                {i === 1 && (
                  <svg viewBox="0 0 100 60">
                    <path d="M0 50 25 38 45 44 68 17 100 28" />
                  </svg>
                )}
                {i === 2 && (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
                {i === 3 && [1, 2, 3].map((x) => <i key={x} />)}
                {i === 4 && Array.from({ length: 21 }, (_, x) => <i key={x} />)}
              </div>
              <div>
                <span>0{i + 1}</span>
                <h3>{t[0]}</h3>
                <p>{t[1]}</p>
                <Badge>{t[2]}</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="system-section">
        <header>
          <span>04</span>
          <div>
            <h2>交互与间距</h2>
            <p>8pt 网格、克制动效与清晰的桌面操作反馈。</p>
          </div>
        </header>
        <div className="interaction-grid">
          <div>
            <span>Spacing scale</span>
            <div className="spacing-bars">
              {[8, 16, 24, 32, 48].map((x) => (
                <i style={{ width: x * 2 }} key={x}>
                  {x}
                </i>
              ))}
            </div>
          </div>
          <div>
            <span>Radius system</span>
            <div className="radii">
              <i>8</i>
              <i>12</i>
              <i>18</i>
              <i>24</i>
            </div>
          </div>
          <div>
            <span>Interaction</span>
            <div className="interaction-samples">
              <button className="primary-btn">Default</button>
              <button className="secondary-btn">Hover</button>
              <kbd>⌘ K</kbd>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GeneratedModule({
  name,
  color,
  template,
}: {
  name: string;
  color: string;
  template: string;
}) {
  return (
    <div className="page">
      <ModuleShell
        title={name}
        subtitle="这是一个由模块元数据自动生成的个人空间。"
        color={color}
        status={`已启用 ${template} 内容模板`}
        actions={
          <button className="primary-btn" style={{ background: color, borderColor: color }}>
            <Icon name="plus" size={16} />
            新建内容
          </button>
        }
      >
        <div className="generated-module">
          <div className="generated-intro">
            <span className="module-icon" style={{ background: color + "18", color }}>
              <Icon name="layout" />
            </span>
            <div>
              <div className="eyebrow">METADATA GENERATED</div>
              <h2>{template} 模板已就绪</h2>
              <p>导航入口、模块外壳、操作区和状态区均已根据配置自动创建。</p>
            </div>
          </div>
          <div className="generated-grid">
            {[1, 2, 3].map((item) => (
              <article key={item}>
                <i style={{ background: color + (item === 1 ? "30" : "14") }} />
                <span>COLLECTION 0{item}</span>
                <h3>{["最近添加", "收藏内容", "待整理"][item - 1]}</h3>
                <p>从这里开始建立属于你的内容结构。</p>
              </article>
            ))}
          </div>
        </div>
      </ModuleShell>
    </div>
  );
}

function Workspace() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [modules, setModules] = useState(initialModules);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [context, setContext] = useState<{ x: number; y: number; name: string } | null>(null);
  const avatarText = user?.nickname ? user.nickname.slice(0, 1).toUpperCase() : "LM";
  const filtered = useMemo(
    () =>
      modules.filter(
        (m) => m.name.includes(query) || m.note.toLowerCase().includes(query.toLowerCase()),
      ),
    [modules, query],
  );
  const move = (to: number) => {
    if (drag === null || drag === to) return;
    const next = [...modules];
    const [item] = next.splice(drag, 1);
    next.splice(to, 0, item);
    setModules(next);
    setDrag(null);
  };
  const fixedContent: Partial<Record<Page, React.ReactNode>> = {
    home: <Dashboard open={setPage} />,
    finance: <FinancePage />,
    music: <MusicPage />,
    plans: <PlansPage />,
    learning: <LearningPage />,
    system: <DesignSystem />,
  };
  const activeModule = modules.find((module) => module.id === page);
  const content =
    fixedContent[page] ??
    (activeModule ? (
      <GeneratedModule
        name={activeModule.name}
        color={activeModule.color}
        template={activeModule.note.replace(" 模板", "")}
      />
    ) : (
      fixedContent.home
    ));
  const moduleCatalog = [
    ["movies", "电影清单", "CardFlow", "#6389A8"],
    ["travel", "旅行足迹", "Timeline", "#B87758"],
    ["fitness", "运动记录", "Chart", "#5C927A"],
    ["inspiration", "灵感收藏", "List", "#9B72D2"],
  ] as const;
  const addModule = (item: (typeof moduleCatalog)[number]) => {
    const [id, name, template, color] = item;
    if (!modules.some((module) => module.id === id)) {
      setModules((current) => [
        ...current,
        { id, name, icon: "layout", color, note: `${template} 模板` },
      ]);
    }
    setPage(id);
    setModal(false);
  };
  return (
    <div className="app" onClick={() => context && setContext(null)}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage("home")}>
          <span>{avatarText}</span>
          <div>
            <b>生活集</b>
            <small>PERSONAL SPACE</small>
          </div>
        </button>
        <div className="nav-label">概览</div>
        <button
          className={`nav-item ${page === "home" ? "active" : ""}`}
          onClick={() => setPage("home")}
        >
          <span>
            <Icon name="grid" />
            仪表盘
          </span>
          <kbd>⌘1</kbd>
        </button>
        <div className="nav-label">
          我的模块{" "}
          <button>
            <Icon name="more" size={15} />
          </button>
        </div>
        <nav>
          {filtered.map((m, i) => (
            <button
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => move(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContext({ x: e.clientX, y: e.clientY, name: m.name });
              }}
              key={m.id}
              className={`nav-item ${page === m.id ? "active" : ""}`}
              onClick={() => setPage(m.id)}
            >
              <span>
                <i className="nav-icon" style={{ background: m.color + "15", color: m.color }}>
                  <Icon name={m.icon} size={17} />
                </i>
                {m.name}
              </span>
              <i className="nav-dot" />
            </button>
          ))}
        </nav>
        <button className="add-module" onClick={() => setModal(true)}>
          <Icon name="plus" size={17} />
          添加模块
        </button>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === "system" ? "active" : ""}`}
            onClick={() => setPage("system")}
          >
            <span>
              <Icon name="layout" />
              设计系统
            </span>
          </button>
          <div className="profile-wrap">
            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-head">
                  <b>{user?.nickname || "未命名用户"}</b>
                  <span>{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                >
                  退出登录
                </button>
              </div>
            )}
            <div className="profile">
              <div className="avatar">{avatarText}</div>
              <div>
                <b>{user?.nickname || "朋友"}</b>
                <span>{user?.emailVerified ? "邮箱已验证" : "个人空间"}</span>
              </div>
              <button onClick={() => setProfileOpen((open) => !open)}>
                <Icon name="more" size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      <header className="topbar">
        <div className="breadcrumbs">
          <span>生活集</span>
          <Icon name="chevron" size={13} />
          <b>
            {page === "home"
              ? "仪表盘"
              : page === "system"
                ? "设计系统"
                : modules.find((m) => m.id === page)?.name}
          </b>
        </div>
        <div className="top-actions">
          <label className="search">
            <Icon name="search" size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索一切…"
            />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-btn">
            <Icon name="command" />
            <span className="notify-dot" />
          </button>
          <button className="icon-btn">
            <Icon name="bell" />
          </button>
          <span className="divider" />
          <button className="icon-btn">
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <main>{content}</main>
      {context && (
        <div className="context-menu" style={{ left: context.x, top: context.y }}>
          <b>{context.name}</b>
          <button>固定到顶部</button>
          <button>编辑模块配置</button>
          <button>调整卡片尺寸</button>
          <hr />
          <button className="danger">隐藏模块</button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">MODULE LIBRARY</div>
                <h2>添加新模块</h2>
                <p>选择模板后即可创建，前端将自动生成入口与仪表盘卡片。</p>
              </div>
              <button className="icon-btn" onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <div className="module-options">
              {moduleCatalog.map((x) => (
                <button key={x[0]} onClick={() => addModule(x)}>
                  <i style={{ background: x[3] }} />
                  <div>
                    <b>{x[1]}</b>
                    <span>{x[2]} 模板</span>
                  </div>
                  <Icon name="plus" size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <AuthSplash />;
  if (!user) return <AuthPage />;
  return <Workspace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
