export type TemplateKey = "list" | "chart" | "card" | "timeline" | "calendar";

export interface TemplateSpec {
  key: TemplateKey;
  name: string;
  desc: string;
  meta: string;
}

/** 模块库中可选的五种内容模板，与后端 catalog 的 Template 字段一一对应。 */
export const TEMPLATES: TemplateSpec[] = [
  { key: "list", name: "List", desc: "清晰的信息行与批量操作", meta: "三种密度" },
  { key: "chart", name: "Chart", desc: "趋势、比例与数据洞察", meta: "四种图表" },
  { key: "card", name: "CardFlow", desc: "可拖拽卡片与状态流转", meta: "响应式" },
  { key: "timeline", name: "Timeline", desc: "按时间组织事件与记录", meta: "纵向/横向" },
  { key: "calendar", name: "Calendar", desc: "日期、热力与周期视图", meta: "周/月/年" },
];

const TEMPLATE_ALIASES: Record<string, TemplateKey> = {
  list: "list",
  chart: "chart",
  card: "card",
  cardflow: "card",
  timeline: "timeline",
  calendar: "calendar",
};

/** 把后端模块元数据里的模板名（List / CardFlow …）映射为预览键。 */
export function templateKeyOf(template: string): TemplateKey {
  return TEMPLATE_ALIASES[template.trim().toLowerCase()] ?? "list";
}

/** 语义强调色：点击后立即应用到全站，色值保持低饱和。 */
export const ACCENTS: { name: string; color: string }[] = [
  { name: "Clay", color: "#D2694A" },
  { name: "Moss", color: "#5F8A7D" },
  { name: "Indigo", color: "#5F6E9C" },
  { name: "Iris", color: "#8E7BB0" },
  { name: "Slate", color: "#6389A8" },
];
