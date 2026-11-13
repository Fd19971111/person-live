import { useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge, Ring } from "../../components/ui";
import type { TemplateKey } from "./templates";

/** 模板实时预览：同一个内容主体，按所选模板切换成不同结构。 */
export function TemplatePreview({ template, accent }: { template: TemplateKey; accent: string }) {
  if (template === "list") return <ListPreview accent={accent} />;
  if (template === "chart") return <ChartPreview accent={accent} />;
  if (template === "card") return <CardFlowPreview accent={accent} />;
  if (template === "timeline") return <TimelinePreview accent={accent} />;
  return <CalendarPreview accent={accent} />;
}

const LIST_ROWS = [
  { id: "r1", title: "设计系统不是组件库", meta: "设计 · 昨天更新", value: "42%" },
  { id: "r2", title: "本周读书笔记", meta: "阅读 · 3 天前", value: "68%" },
  { id: "r3", title: "旅行清单整理", meta: "生活 · 上周", value: "100%" },
  { id: "r4", title: "整理灵感收藏", meta: "灵感 · 待开始", value: "0%" },
];

function ListPreview({ accent }: { accent: string }) {
  const [picked, setPicked] = useState<string[]>(["r1"]);
  const toggle = (id: string) =>
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return (
    <div className="pv-list">
      <div className="pv-list-head">
        <span>内容</span>
        <span>进度</span>
        <span>操作</span>
      </div>
      {LIST_ROWS.map((row) => (
        <div className={`pv-list-row ${picked.includes(row.id) ? "picked" : ""}`} key={row.id}>
          <label>
            <input type="checkbox" checked={picked.includes(row.id)} onChange={() => toggle(row.id)} />
            <i className="pv-dot" style={{ background: accent }} />
            <span>
              <b>{row.title}</b>
              <small>{row.meta}</small>
            </span>
          </label>
          <span className="pv-list-progress">
            <i>
              <em style={{ width: row.value, background: accent }} />
            </i>
            {row.value}
          </span>
          <button className="text-btn" onClick={() => toggle(row.id)}>
            {picked.includes(row.id) ? "取消选择" : "选择"}
          </button>
        </div>
      ))}
      <div className="pv-list-foot">
        <span className="muted">已选 {picked.length} 项</span>
        <div>
          <button className="text-btn" onClick={() => setPicked([])}>
            清空选择
          </button>
          <button className="text-btn" onClick={() => setPicked(LIST_ROWS.map((row) => row.id))}>
            <Icon name="check" size={13} />
            全选
          </button>
        </div>
      </div>
    </div>
  );
}

const CHART_VALUES = [22, 34, 28, 46, 38, 58, 50];

function ChartPreview({ accent }: { accent: string }) {
  const points = useMemo(() => {
    const max = Math.max(...CHART_VALUES);
    return CHART_VALUES.map((value, index) => {
      const x = (index * 100) / (CHART_VALUES.length - 1);
      const y = 56 - (value / max) * 46;
      return [x, y] as const;
    });
  }, []);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <div className="pv-charts">
      <section className="pv-chart pv-chart-wide">
        <header>
          <b>近 7 天记录</b>
          <span className="muted">趋势</span>
        </header>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none">
          {[10, 25, 40, 55].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} className="pv-chart-grid" />
          ))}
          <path d={`${line} L100 60 L0 60 Z`} className="pv-chart-area" style={{ fill: accent }} />
          <path d={line} className="pv-chart-line" style={{ stroke: accent }} />
          {points.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" style={{ fill: accent }} />
          ))}
        </svg>
      </section>

      <section className="pv-chart">
        <header>
          <b>分类对比</b>
          <span className="muted">柱状</span>
        </header>
        <div className="pv-bars">
          {CHART_VALUES.map((value, index) => (
            <i key={index} style={{ height: `${value}%`, background: accent, opacity: 0.35 + index * 0.09 }} />
          ))}
        </div>
      </section>

      <section className="pv-chart pv-chart-ring">
        <Ring value={68} color={accent} size={88} />
        <div>
          <b>目标完成度</b>
          <p>本周已推进 68%，还剩 2 天。</p>
        </div>
      </section>

      <section className="pv-chart pv-chart-stats">
        {[
          ["今日", "42 min"],
          ["本周", "5.2 h"],
          ["连续", "12 天"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
    </div>
  );
}

type ColumnKey = "todo" | "doing" | "done";

interface FlowCard {
  id: string;
  title: string;
  tag: string;
}

const BOARD: Record<ColumnKey, FlowCard[]> = {
  todo: [
    { id: "c1", title: "整理 Q4 灵感", tag: "灵感" },
    { id: "c2", title: "读完《设计系统实践》", tag: "阅读" },
  ],
  doing: [{ id: "c3", title: "月度预算复盘", tag: "财务" }],
  done: [{ id: "c4", title: "京都行程归档", tag: "旅行" }],
};

const COLUMN_LABEL: Record<ColumnKey, string> = {
  todo: "待处理",
  doing: "进行中",
  done: "已完成",
};

function CardFlowPreview({ accent }: { accent: string }) {
  const [board, setBoard] = useState<Record<ColumnKey, FlowCard[]>>(BOARD);
  const [dragging, setDragging] = useState<{ id: string; from: ColumnKey } | null>(null);

  const moveTo = (to: ColumnKey) => {
    if (!dragging) return;
    const { id, from } = dragging;
    setDragging(null);
    if (from === to) return;
    const card = board[from].find((item) => item.id === id);
    if (!card) return;
    setBoard((current) => ({
      ...current,
      [from]: current[from].filter((item) => item.id !== id),
      [to]: [...current[to], card],
    }));
  };

  const reset = () => setBoard(BOARD);

  return (
    <div className="pv-flow">
      {(Object.keys(COLUMN_LABEL) as ColumnKey[]).map((column) => (
        <section
          className={`pv-flow-column c-${column}`}
          key={column}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => moveTo(column)}
        >
          <header>
            <b>{COLUMN_LABEL[column]}</b>
            <span>{board[column].length}</span>
          </header>
          {board[column].map((card) => (
            <article
              className="pv-flow-card"
              key={card.id}
              draggable
              onDragStart={() => setDragging({ id: card.id, from: column })}
              onDragEnd={() => setDragging(null)}
            >
              <span className="pv-flow-tag" style={{ color: accent }}>
                {card.tag}
              </span>
              <b>{card.title}</b>
              <small>拖拽到其他列可流转状态</small>
            </article>
          ))}
          {!board[column].length && <p className="muted">拖到这里</p>}
        </section>
      ))}
      <div className="pv-flow-foot">
        <span className="muted">拖动卡片试试，状态会实时更新</span>
        <button className="text-btn" onClick={reset}>
          <Icon name="refresh" size={13} />
          重置示例
        </button>
      </div>
    </div>
  );
}

const TIMELINE_ROWS = [
  { date: "11.13", title: "完成学习模块拆分", meta: "代码 · features/learning", tag: "开发" },
  { date: "11.10", title: "记录了 5 条灵感", meta: "灵感 · 设计与阅读", tag: "灵感" },
  { date: "11.06", title: "看完《海上钢琴师》", meta: "电影 · 评分 9.3", tag: "电影" },
  { date: "11.02", title: "跑步 6.2 公里", meta: "运动 · 45 分钟", tag: "运动" },
];

function TimelinePreview({ accent }: { accent: string }) {
  return (
    <div className="pv-timeline">
      {TIMELINE_ROWS.map((row) => (
        <div className="pv-timeline-item" key={row.date}>
          <span className="pv-timeline-date">{row.date}</span>
          <i style={{ background: accent }} />
          <div className="pv-timeline-body">
            <b>{row.title}</b>
            <p>{row.meta}</p>
          </div>
          <Badge>{row.tag}</Badge>
        </div>
      ))}
    </div>
  );
}

function CalendarPreview({ accent }: { accent: string }) {
  const [active, setActive] = useState(13);
  const cells = useMemo(() => {
    const offset = 6; // 11 月 1 日为周日，前面留空
    return Array.from({ length: 35 }, (_, index) => {
      const day = index - offset + 1;
      if (day < 1 || day > 30) return null;
      return { day, level: (day * 7) % 5 };
    });
  }, []);

  return (
    <div className="pv-calendar">
      <header>
        <b>2026 年 11 月</b>
        <span className="muted">已选 {active} 日 · 3 条记录</span>
      </header>
      <div className="pv-calendar-grid">
        {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
          <span className="pv-calendar-week" key={label}>
            {label}
          </span>
        ))}
        {cells.map((cell, index) =>
          cell ? (
            <button
              key={cell.day}
              className={`pv-calendar-day ${active === cell.day ? "active" : ""}`}
              style={{
                background: cell.level ? `${accent}${cell.level === 4 ? "42" : cell.level === 3 ? "30" : "1c"}` : undefined,
                borderColor: active === cell.day ? accent : undefined,
              }}
              onClick={() => setActive(cell.day)}
            >
              {cell.day}
            </button>
          ) : (
            <span className="pv-calendar-empty" key={`empty-${index}`} />
          ),
        )}
      </div>
      <footer>
        <span className="muted">颜色越深，当天记录越多</span>
        <div className="pv-calendar-detail">
          <i style={{ background: accent }} />
          <b>11 月 {active} 日</b>
          <span>学习 45 分钟 · 灵感 1 条</span>
        </div>
      </footer>
    </div>
  );
}
