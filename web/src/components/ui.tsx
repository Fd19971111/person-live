import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

export function Badge({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Ring({
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

export type MenuItem = {
  label: string;
  icon?: IconName;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

export function Dropdown({
  items,
  align = "right",
  label,
}: {
  items: MenuItem[];
  align?: "left" | "right";
  label?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="dropdown-wrap" ref={ref} onClick={(event) => event.stopPropagation()}>
      <button
        className={label ? "text-btn dropdown-trigger" : "icon-btn dropdown-trigger"}
        onClick={() => setOpen((value) => !value)}
        aria-label={label ? undefined : "更多操作"}
        aria-expanded={open}
      >
        {label ?? <Icon name="more" />}
      </button>
      {open && (
        <div className={`dropdown-menu ${align}`}>
          {items.map((item) => (
            <button
              key={item.label}
              className={item.danger ? "danger" : ""}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <Icon name={item.icon} size={14} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModuleShell({
  title,
  subtitle,
  color,
  actions,
  children,
  status,
  menu,
}: {
  title: string;
  subtitle: string;
  color: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  status?: string;
  menu?: MenuItem[];
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
          {menu ? (
            <Dropdown items={menu} />
          ) : (
            <button className="icon-btn">
              <Icon name="more" />
            </button>
          )}
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

export function Modal({
  title,
  eyebrow,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  eyebrow: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal finance-modal ${wide ? "wide" : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  grow = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <div className={`field ${grow ? "grow" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

export type ToastState = { text: string; tone: "ok" | "err" } | null;
export type Notify = (text: string, tone?: "ok" | "err") => void;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return <div className={`toast ${toast.tone}`}>{toast.text}</div>;
}

export function Panel({
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

export function money(cents: number, decimals = 0) {
  return (cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function todayText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function currentMonthText() {
  return todayText().slice(0, 7);
}
