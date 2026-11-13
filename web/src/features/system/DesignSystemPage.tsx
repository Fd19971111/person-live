import { useState, type CSSProperties } from "react";
import { Badge } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { ACCENTS, TEMPLATES, type TemplateKey } from "./templates";
import { TemplatePreview } from "./TemplatePreview";

export default function DesignSystemPage() {
  const [template, setTemplate] = useState<TemplateKey>("list");
  const [accent, setAccent] = useState("#E56F4A");
  const current = TEMPLATES.find((item) => item.key === template) ?? TEMPLATES[0];

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
        <div className="version">Foundations · v1.5.0</div>
      </div>

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
            <div className="swatches">
              {ACCENTS.map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  className={`swatch ${accent === entry.color ? "active" : ""}`}
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
            <h2>模板预览</h2>
            <p>选择任一模板，下方的内容主体会立刻切换成对应的真实结构。</p>
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
              <button className="text-btn" onClick={() => setAccent("#E56F4A")}>
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

      <section className="system-section">
        <header>
          <span>05</span>
          <div>
            <h2>组件清单</h2>
            <p>按钮、输入与标签统一使用同一套圆角、字阶与密度。</p>
          </div>
        </header>
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
