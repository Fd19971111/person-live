import { useCallback, useEffect, useState } from "react";

export type ThemeId = "lumen" | "porcelain" | "graphite" | "sand" | "violet";
export type BackgroundId = "aurora" | "grid" | "mesh" | "plain";
export type FontId = "serif" | "sans" | "mono" | "system";
export type GlassId = "clear" | "balanced" | "frosted";
export type DensityId = "compact" | "cozy" | "roomy";
export type RadiusId = "sharp" | "soft" | "round";
export type MotionId = "on" | "off";
export type ShellId = "standard" | "minimal" | "accent";
export type ControlId = "soft" | "line" | "pill";

export interface AppearanceOption<T extends string> {
  id: T;
  name: string;
  desc: string;
}

export interface Appearance {
  theme: ThemeId;
  bg: BackgroundId;
  font: FontId;
  glass: GlassId;
  /** 自定义强调色；空字符串表示跟随当前主题。 */
  accent: string;
  density: DensityId;
  radius: RadiusId;
  motion: MotionId;
  shell: ShellId;
  control: ControlId;
}

export const THEMES: (AppearanceOption<ThemeId> & { swatches: string[] })[] = [
  {
    id: "lumen",
    name: "晨雾",
    desc: "冷白柔光，朱砂橙强调",
    swatches: ["#eef2f7", "#ffffff", "#d2694a", "#1a232e"],
  },
  {
    id: "porcelain",
    name: "青瓷",
    desc: "青白底，青瓷绿强调",
    swatches: ["#eef4f2", "#f7fcfb", "#4f7d74", "#182824"],
  },
  {
    id: "graphite",
    name: "砚灰",
    desc: "冷灰钢蓝，界面更锐利",
    swatches: ["#eceff3", "#f6f8fb", "#4c6584", "#171f2a"],
  },
  {
    id: "sand",
    name: "暖砂",
    desc: "米暖底，棕橙强调",
    swatches: ["#f4efe6", "#fbf7f0", "#a9714f", "#2a2119"],
  },
  {
    id: "violet",
    name: "雾紫",
    desc: "淡紫雾面，紫调强调",
    swatches: ["#f1eef7", "#f9f6fc", "#7a6ba8", "#211c2c"],
  },
];

export const BACKGROUNDS: AppearanceOption<BackgroundId>[] = [
  { id: "aurora", name: "柔光", desc: "多色光晕 + 极细网格，通透有层次" },
  { id: "grid", name: "网格", desc: "冷调技术网格，科技感最强" },
  { id: "mesh", name: "极光", desc: "斜向光带，适合展示型页面" },
  { id: "plain", name: "纯色", desc: "近乎纯色底，文字最实最清晰" },
];

export const FONTS: AppearanceOption<FontId>[] = [
  { id: "serif", name: "宋体标题", desc: "标题宋体 + 正文黑体，温润有质感" },
  { id: "sans", name: "无衬线", desc: "全站黑体，信息密度更高更锐利" },
  { id: "mono", name: "等宽科技", desc: "数字与标题等宽，仪表盘气质" },
  { id: "system", name: "系统字体", desc: "跟随系统字体，渲染最稳定" },
];

export const GLASS_LEVELS: AppearanceOption<GlassId>[] = [
  { id: "clear", name: "通透", desc: "更透的玻璃，背景色充分透出" },
  { id: "balanced", name: "标准", desc: "通透与清晰兼顾，日常推荐" },
  { id: "frosted", name: "磨砂", desc: "更实的磨砂，长文阅读更清楚" },
];

export const DENSITIES: AppearanceOption<DensityId>[] = [
  { id: "compact", name: "紧凑", desc: "压缩留白，一屏看到更多信息" },
  { id: "cozy", name: "标准", desc: "默认留白与阅读节奏" },
  { id: "roomy", name: "舒展", desc: "更大的区块间距，更从容" },
];

export const RADII: AppearanceOption<RadiusId>[] = [
  { id: "sharp", name: "小圆角", desc: "更硬朗，偏工具感" },
  { id: "soft", name: "标准", desc: "默认的柔和圆角" },
  { id: "round", name: "大圆角", desc: "更圆润，偏展示感" },
];

export const MOTIONS: AppearanceOption<MotionId>[] = [
  { id: "on", name: "流畅", desc: "保留过渡与悬停动效" },
  { id: "off", name: "关闭", desc: "关闭过渡，操作即时响应" },
];

export const SHELLS: AppearanceOption<ShellId>[] = [
  { id: "standard", name: "标准", desc: "色条 + 眉标 + 副标题" },
  { id: "minimal", name: "极简", desc: "隐藏装饰，只留标题与操作" },
  { id: "accent", name: "强调", desc: "页头包成玻璃卡片，强调色更醒目" },
];

export const CONTROLS: AppearanceOption<ControlId>[] = [
  { id: "soft", name: "柔和", desc: "浅玻璃底 + 白色高光边" },
  { id: "line", name: "硬朗", desc: "细描边、无阴影，更锐利" },
  { id: "pill", name: "胶囊", desc: "按钮、输入与标签全圆角" },
];

export interface Preset {
  id: string;
  name: string;
  desc: string;
  theme: ThemeId;
  bg: BackgroundId;
  font: FontId;
  glass: GlassId;
}

export const PRESETS: Preset[] = [
  {
    id: "morning-glass",
    name: "晨雾玻璃",
    desc: "冷白柔光 + 宋体标题，日常最耐看",
    theme: "lumen",
    bg: "aurora",
    font: "serif",
    glass: "balanced",
  },
  {
    id: "tech-grid",
    name: "科技网格",
    desc: "冷灰网格 + 无衬线，界面更锐利",
    theme: "graphite",
    bg: "grid",
    font: "sans",
    glass: "clear",
  },
  {
    id: "celadon",
    name: "青瓷",
    desc: "青白磨砂 + 青瓷绿，安静温润",
    theme: "porcelain",
    bg: "aurora",
    font: "serif",
    glass: "frosted",
  },
  {
    id: "quiet-paper",
    name: "极简纸感",
    desc: "近纯色底 + 强磨砂，文字最清楚",
    theme: "sand",
    bg: "plain",
    font: "serif",
    glass: "frosted",
  },
  {
    id: "violet-aurora",
    name: "雾紫极光",
    desc: "雾紫光带 + 宋体，层次丰富",
    theme: "violet",
    bg: "mesh",
    font: "serif",
    glass: "balanced",
  },
  {
    id: "mono-lab",
    name: "等宽实验室",
    desc: "等宽数字与标题，强科技感",
    theme: "graphite",
    bg: "grid",
    font: "mono",
    glass: "clear",
  },
];

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "lumen",
  bg: "aurora",
  font: "serif",
  glass: "balanced",
  accent: "",
  density: "cozy",
  radius: "soft",
  motion: "on",
  shell: "standard",
  control: "soft",
};

const STORAGE_KEY = "lifeos.appearance";

function pick<T extends string>(value: unknown, options: AppearanceOption<T>[], fallback: T): T {
  return options.some((item) => item.id === value) ? (value as T) : fallback;
}

export function readAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<Appearance>;
    return {
      theme: pick(parsed.theme, THEMES, DEFAULT_APPEARANCE.theme),
      bg: pick(parsed.bg, BACKGROUNDS, DEFAULT_APPEARANCE.bg),
      font: pick(parsed.font, FONTS, DEFAULT_APPEARANCE.font),
      glass: pick(parsed.glass, GLASS_LEVELS, DEFAULT_APPEARANCE.glass),
      accent: typeof parsed.accent === "string" ? parsed.accent : "",
      density: pick(parsed.density, DENSITIES, DEFAULT_APPEARANCE.density),
      radius: pick(parsed.radius, RADII, DEFAULT_APPEARANCE.radius),
      motion: pick(parsed.motion, MOTIONS, DEFAULT_APPEARANCE.motion),
      shell: pick(parsed.shell, SHELLS, DEFAULT_APPEARANCE.shell),
      control: pick(parsed.control, CONTROLS, DEFAULT_APPEARANCE.control),
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function applyAppearance(appearance: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = appearance.theme;
  root.dataset.bg = appearance.bg;
  root.dataset.font = appearance.font;
  root.dataset.glass = appearance.glass;
  root.dataset.density = appearance.density;
  root.dataset.radius = appearance.radius;
  root.dataset.motion = appearance.motion;
  root.dataset.shell = appearance.shell;
  root.dataset.control = appearance.control;
  if (appearance.accent) {
    root.style.setProperty("--accent", appearance.accent);
  } else {
    root.style.removeProperty("--accent");
  }
}

export function saveAppearance(appearance: Appearance) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    /* 隐私模式下忽略持久化失败 */
  }
}

/** 在 React 挂载前调用，避免刷新时主题闪一下。 */
export function initAppearance() {
  const appearance = readAppearance();
  applyAppearance(appearance);
  return appearance;
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(() => readAppearance());

  useEffect(() => {
    applyAppearance(appearance);
    saveAppearance(appearance);
  }, [appearance]);

  const update = useCallback((patch: Partial<Appearance>) => {
    setAppearance((current) => ({ ...current, ...patch }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setAppearance((current) => ({
      ...current,
      theme: preset.theme,
      bg: preset.bg,
      font: preset.font,
      glass: preset.glass,
    }));
  }, []);

  const reset = useCallback(() => setAppearance(DEFAULT_APPEARANCE), []);

  return {
    appearance,
    setTheme: (theme: ThemeId) => update({ theme }),
    setBackground: (bg: BackgroundId) => update({ bg }),
    setFont: (font: FontId) => update({ font }),
    setGlass: (glass: GlassId) => update({ glass }),
    setAccent: (accent: string) => update({ accent }),
    setDensity: (density: DensityId) => update({ density }),
    setRadius: (radius: RadiusId) => update({ radius }),
    setMotion: (motion: MotionId) => update({ motion }),
    setShell: (shell: ShellId) => update({ shell }),
    setControl: (control: ControlId) => update({ control }),
    applyPreset,
    reset,
  };
}
