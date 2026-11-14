import { useState, type CSSProperties } from "react";
import { Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { ACCENTS, TEMPLATES, type TemplateKey } from "./templates";
import { TemplatePreview } from "./TemplatePreview";
import {
  BACKGROUNDS,
  CONTROLS,
  DENSITIES,
  FONTS,
  GLASS_LEVELS,
  MOTIONS,
  PRESETS,
  RADII,
  SHELLS,
  THEMES,
  useAppearance,
} from "../../theme";

export default function DesignSystemPage() {
  const [template, setTemplate] = useState<TemplateKey>("list");
  const current = TEMPLATES.find((item) => item.key === template) ?? TEMPLATES[0];
  const {
    appearance,
    setTheme,
    setBackground,
    setFont,
    setGlass,
    setAccent,
    setDensity,
    setRadius,
    setMotion,
    setShell,
    setControl,
    applyPreset,
    reset,
  } = useAppearance();
  const themeAccent = THEMES.find((item) => item.id === appearance.theme)?.swatches[2] ?? "#d2694a";
  const accent = appearance.accent || themeAccent;
  const themeName = THEMES.find((item) => item.id === appearance.theme)?.name ?? "晨雾";
  const backgroundName = BACKGROUNDS.find((item) => item.id === appearance.bg)?.name ?? "柔光";
  const fontName = FONTS.find((item) => item.id === appearance.font)?.name ?? "宋体标题";
  const glassName = GLASS_LEVELS.find((item) => item.id === appearance.glass)?.name ?? "标准";

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
        <div className="version">Foundations · v1.6.0</div>
      </div>

      <section className="system-section">
        <header>
          <span>00</span>
          <div>
            <h2>界面主题</h2>
            <p>配色、背景、字体与玻璃质感可以任意组合，选择会立即生效并保存在当前浏览器。</p>
          </div>
        </header>

        <div className="theme-presets">
          {PRESETS.map((preset) => {
            const presetTheme = THEMES.find((item) => item.id === preset.theme) ?? THEMES[0];
            const active =
              appearance.theme === preset.theme &&
              appearance.bg === preset.bg &&
              appearance.font === preset.font &&
              appearance.glass === preset.glass;
            return (
              <button
                key={preset.id}
                type="button"
                className={`theme-card ${active ? "active" : ""}`}
                onClick={() => applyPreset(preset)}
              >
                <span className="theme-card-preview" style={{ background: presetTheme.swatches[0] }}>
                  {presetTheme.swatches.map((color, index) => (
                    <i key={index} style={{ background: color }} />
                  ))}
                </span>
                <span className="theme-card-body">
                  <b>{preset.name}</b>
                  <small>{preset.desc}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="theme-controls">
          <div className="theme-control-row">
            <span>配色</span>
            <div className="theme-options">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.theme === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setTheme(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-control-row">
            <span>背景</span>
            <div className="theme-options">
              {BACKGROUNDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.bg === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setBackground(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-control-row">
            <span>字体</span>
            <div className="theme-options">
              {FONTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.font === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setFont(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-control-row">
            <span>玻璃</span>
            <div className="theme-options">
              {GLASS_LEVELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.glass === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setGlass(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="theme-note">
          当前：<b>{themeName} · {backgroundName} · {fontName} · {glassName}</b>
          <button className="text-btn theme-reset" onClick={reset}>
            恢复默认
          </button>
        </p>
      </section>

      <section className="system-section">
        <header>
          <span>01</span>
          <div>
            <h2>色彩与排版</h2>
            <p>低饱和自然色构成模块语义，以朱砂橙作为全局强调。点击色板可切换下方预览的强调色。</p>
          </div>
        </header>
        <div className="system-grid">
          <div className="color-spec">
            <h3>Semantic colors</h3>
            <p className="spec-hint">点击色块会立即切换全站强调色；「跟随主题」恢复当前主题的默认色。</p>
            <div className="swatches">
              <button
                type="button"
                className={`swatch ${!appearance.accent ? "active" : ""}`}
                onClick={() => setAccent("")}
              >
                <i style={{ background: themeAccent }} />
                <b>主题</b>
                <span>跟随</span>
              </button>
              {ACCENTS.map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  className={`swatch ${appearance.accent === entry.color ? "active" : ""}`}
                  onClick={() => setAccent(entry.color)}
                >
                  <i style={{ background: entry.color }} />
                  <b>{entry.name}</b>
                  <span>{entry.color}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="type-spec">
            <h3>Type scale</h3>
            <div className="theme-options spec-options">
              {FONTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.font === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setFont(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
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
            <p>外壳样式会同步到所有模块页头，下面就是实时效果。</p>
          </div>
        </header>
        <div className="theme-control-row spec-control">
          <span>外壳</span>
          <div className="theme-options">
            {SHELLS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`theme-option ${appearance.shell === item.id ? "active" : ""}`}
                title={item.desc}
                onClick={() => setShell(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="shell-demo shell-demo-live">
          <div className="module-header">
            <div className="module-title">
              <span className="title-mark" style={{ background: accent }} />
              <div>
                <div className="eyebrow">MODULE / PREVIEW</div>
                <h1>示例模块</h1>
                <p>页头样式会同步到所有模块页面</p>
              </div>
            </div>
            <div className="module-actions">
              <button className="secondary-btn">操作</button>
              <button className="primary-btn">新建</button>
            </div>
          </div>
          <div className="demo-content">
            <Icon name="layout" size={32} />
            <b>Content Template</b>
            <span>List · Chart · CardFlow · Timeline · Calendar</span>
          </div>
          <div className="module-status">
            <span>
              <i className="status-dot" /> STATUS / 配置实时生效
            </span>
            <span>MODULE SHELL</span>
          </div>
        </div>
      </section>

      <section className="system-section">
        <header>
          <span>03</span>
          <div>
            <h2>模板预览</h2>
            <p>用于检查配置：字体、强调色、控件与密度都会同步反映在预览里。</p>
          </div>
        </header>
        <div className="template-grid">
          {TEMPLATES.map((item, index) => (
            <button
              type="button"
              key={item.key}
              className={`template-card ${template === item.key ? "active" : ""}`}
              onClick={() => setTemplate(item.key)}
            >
              <div className={`template-visual t${index}`}>
                {index === 0 && [1, 2, 3].map((x) => <i key={x} />)}
                {index === 1 && (
                  <svg viewBox="0 0 100 60">
                    <path d="M0 50 25 38 45 44 68 17 100 28" />
                  </svg>
                )}
                {index === 2 && (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
                {index === 3 && [1, 2, 3].map((x) => <i key={x} />)}
                {index === 4 && Array.from({ length: 21 }, (_, x) => <i key={x} />)}
              </div>
              <div className="template-card-body">
                <span>0{index + 1}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <Badge>{item.meta}</Badge>
              </div>
            </button>
          ))}
        </div>

        <div className="template-preview" style={{ "--pv-accent": accent } as CSSProperties}>
          <header className="template-preview-head">
            <div>
              <span className="eyebrow">LIVE PREVIEW</span>
              <h3>
                {current.name} · {current.desc}
              </h3>
            </div>
            <div className="template-preview-meta">
              <i style={{ background: accent }} />
              <span>{accent}</span>
              <button className="text-btn" onClick={() => setAccent("")}>
                <Icon name="refresh" size={13} />
                恢复默认
              </button>
            </div>
          </header>
          <div className="template-preview-body">
            <TemplatePreview template={template} accent={accent} />
          </div>
        </div>
      </section>

      <section className="system-section">
        <header>
          <span>04</span>
          <div>
            <h2>交互与间距</h2>
            <p>密度、圆角与动效会应用到全站，下面的示例会同步变化。</p>
          </div>
        </header>
        <div className="theme-controls spec-controls">
          <div className="theme-control-row">
            <span>密度</span>
            <div className="theme-options">
              {DENSITIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.density === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setDensity(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-control-row">
            <span>圆角</span>
            <div className="theme-options">
              {RADII.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.radius === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setRadius(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="theme-control-row">
            <span>动效</span>
            <div className="theme-options">
              {MOTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-option ${appearance.motion === item.id ? "active" : ""}`}
                  title={item.desc}
                  onClick={() => setMotion(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
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

      <section className="system-section">
        <header>
          <span>05</span>
          <div>
            <h2>组件清单</h2>
            <p>控件风格会作用到全站按钮、输入与标签，下面的示例会同步变化。</p>
          </div>
        </header>
        <div className="theme-control-row spec-control">
          <span>控件</span>
          <div className="theme-options">
            {CONTROLS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`theme-option ${appearance.control === item.id ? "active" : ""}`}
                title={item.desc}
                onClick={() => setControl(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="component-grid">
          <div className="component-card">
            <span>Buttons</span>
            <div className="component-row">
              <button className="primary-btn">主按钮</button>
              <button className="secondary-btn">次按钮</button>
              <button className="text-btn">
                <Icon name="arrow" size={13} />
                文字按钮
              </button>
            </div>
          </div>
          <div className="component-card">
            <span>Inputs</span>
            <div className="component-col">
              <input placeholder="单行输入" />
              <select defaultValue="list">
                {TEMPLATES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name} 模板
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="component-card">
            <span>Tags &amp; Badge</span>
            <div className="component-row">
              <span className="tag-chip active">进行中</span>
              <span className="tag-chip">待处理</span>
              <Badge>已完成</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
