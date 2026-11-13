import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import AuthPage, { AuthSplash } from "./auth/AuthPage";
import { Icon, type IconName } from "./components/Icon";
import {
  Badge,
  Dropdown,
  Field,
  Modal,
  ModuleShell,
  Panel,
  Toast,
  currentMonthText,
  money,
  todayText,
  type MenuItem,
  type Notify,
  type ToastState,
} from "./components/ui";
import PlansPage from "./features/plans/PlansPage";
import LearningPage from "./features/learning/LearningPage";
import InspirationPage from "./features/inspiration/InspirationPage";
import MoviesPage from "./features/movies/MoviesPage";
import TravelPage from "./features/travel/TravelPage";
import FitnessPage from "./features/fitness/FitnessPage";
import MusicPage from "./features/music/MusicPage";
import AlbumPage from "./features/album/AlbumPage";
import DesignSystemPage from "./features/system/DesignSystemPage";
import { TemplatePreview } from "./features/system/TemplatePreview";
import { templateKeyOf } from "./features/system/templates";
import { AddModuleDialog } from "./features/modules/AddModuleDialog";
import Dashboard from "./features/dashboard/Dashboard";
import {
  addModule as addWorkspaceModule,
  fetchModules,
  hideModule,
  sortModules,
  type WorkspaceModule,
} from "./api/module";
import {
  commitFinanceImport,
  deleteFinanceCategory,
  deleteFinanceTransaction,
  downloadCsv,
  fetchFinanceCategories,
  fetchFinanceExport,
  fetchFinanceOverview,
  fetchFinanceTransactions,
  fetchImportTemplate,
  previewFinanceImport,
  saveFinanceCategory,
  saveFinanceTransaction,
  type FinanceCategory,
  type FinanceCategoryInput,
  type FinanceOverview,
  type FinanceTransactionQuery,
  type FinanceTransactionRow,
  type ImportCommitResult,
  type ImportPreview,
} from "./api/finance";

type Page = string;


const MONTH_LABELS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

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

type FinanceDialog =
  | { kind: "transaction"; row?: FinanceTransactionRow }
  | { kind: "categories" }
  | { kind: "import" }
  | { kind: "confirm"; title: string; message: string; onConfirm: () => Promise<void> }
  | null;

const PRESET_CATEGORIES: Record<number, string[]> = {
  1: ["工资收入", "奖金", "兼职收入", "理财收益", "吃喝玩乐", "其他收入"],
  2: ["吃喝玩乐", "日常饮食", "交通出行", "居住生活", "购物消费", "文化与学习", "医疗健康", "人情往来", "其他"],
};

function TransactionDialog({
  row,
  categories,
  onClose,
  onSaved,
  notify,
}: {
  row: FinanceTransactionRow | null;
  categories: FinanceCategory[];
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [type, setType] = useState(row?.type ?? 2);
  const [amount, setAmount] = useState(row ? (row.amountCents / 100).toFixed(2) : "");
  const [categoryText, setCategoryText] = useState(row?.categoryId ? row.category : "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [date, setDate] = useState(row?.date ?? todayText());
  const [title, setTitle] = useState(row?.title ?? "");
  const [note, setNote] = useState(row?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);

  const existingNames = new Set(categories.filter((item) => item.kind === type).map((item) => item.name));
  const suggestions = Array.from(
    new Set([...PRESET_CATEGORIES[type], ...existingNames]),
  ).filter((name) => !categoryText.trim() || name.includes(categoryText.trim()));
  const newCategoryName = categoryText.trim() && !existingNames.has(categoryText.trim()) ? categoryText.trim() : "";

  useEffect(() => {
    if (!categoryOpen) return;
    const close = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [categoryOpen]);

  const changeType = (next: number) => {
    if (next === type) return;
    setType(next);
    setCategoryText("");
    setCategoryOpen(false);
  };

  const submit = async () => {
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError("请输入大于 0 的金额");
      return;
    }
    if (!title.trim()) {
      setError("请填写交易标题");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("请选择正确日期");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveFinanceTransaction({
        id: row?.id ?? 0,
        type,
        categoryId: 0,
        categoryName: categoryText.trim(),
        amountCents: cents,
        title: title.trim(),
        note: note.trim(),
        date,
      });
      notify(row ? "流水已更新" : "已记下一笔");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={row ? "编辑流水" : "记一笔"}
      eyebrow="TRANSACTION"
      subtitle={row ? "修改后会立即反映到统计与图表。" : "记录一笔收入或支出，金额单位为元。"}
      onClose={onClose}
      footer={
        <>
          <button className="secondary-btn" onClick={onClose}>
            取消
          </button>
          <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
            {busy ? "保存中…" : row ? "保存修改" : "保存"}
          </button>
        </>
      }
    >
      <div className="segmented">
        <button className={type === 2 ? "active" : ""} onClick={() => changeType(2)}>
          支出
        </button>
        <button className={type === 1 ? "active" : ""} onClick={() => changeType(1)}>
          收入
        </button>
      </div>
      <div className="form-grid">
        <Field label="金额（元）">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            autoFocus
          />
        </Field>
        <Field label="日期">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field
          label="分类"
          hint={newCategoryName ? `将自动新建分类「${newCategoryName}」` : "可下拉选择，也可直接输入新分类"}
        >
          <div className="combo" ref={categoryRef}>
            <input
              value={categoryText}
              maxLength={32}
              placeholder="选择或输入，例如：吃喝玩乐"
              onFocus={() => setCategoryOpen(true)}
              onChange={(event) => {
                setCategoryText(event.target.value);
                setCategoryOpen(true);
              }}
            />
            <button className="combo-toggle" type="button" onClick={() => setCategoryOpen((value) => !value)} aria-label="展开分类">
              <Icon name="chevron" size={14} />
            </button>
            {categoryOpen && (
              <div className="combo-menu">
                <div className="combo-menu-head">{newCategoryName ? `新建分类「${newCategoryName}」` : "常用分类"}</div>
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setCategoryText(name);
                      setCategoryOpen(false);
                    }}
                  >
                    <span>{name}</span>
                    <small className={existingNames.has(name) ? "" : "new"}>{existingNames.has(name) ? "已有" : "新建"}</small>
                  </button>
                ))}
                {!suggestions.length && <div className="combo-empty">直接输入名称即可新建分类</div>}
              </div>
            )}
          </div>
        </Field>
        <Field label="标题">
          <input value={title} maxLength={64} onChange={(event) => setTitle(event.target.value)} placeholder="例如：午餐" />
        </Field>
        <Field label="备注" grow>
          <input value={note} maxLength={255} onChange={(event) => setNote(event.target.value)} placeholder="可留空" />
        </Field>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function CategoryDialog({
  categories,
  onClose,
  onChanged,
  notify,
}: {
  categories: FinanceCategory[];
  onClose: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const emptyDraft: FinanceCategoryInput = { name: "", kind: 2, color: "#B89CD5", sortOrder: 0 };
  const [draft, setDraft] = useState<FinanceCategoryInput>(emptyDraft);
  const [editingId, setEditingId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setDraft(emptyDraft);
    setEditingId(0);
    setError("");
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      setError("请填写分类名称");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveFinanceCategory({ ...draft, id: editingId, name: draft.name.trim() });
      notify(editingId ? "分类已更新" : "分类已新增");
      reset();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: FinanceCategory) => {
    if (item.transactionCount > 0) {
      notify(`「${item.name}」下还有 ${item.transactionCount} 笔流水，请先移走`, "err");
      return;
    }
    setBusy(true);
    try {
      await deleteFinanceCategory(item.id);
      notify("分类已删除");
      if (editingId === item.id) reset();
      onChanged();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="分类管理"
      eyebrow="CATEGORIES"
      subtitle="维护收入与支出分类，已有流水的分类需要先移走流水才能删除。"
      onClose={onClose}
      wide
      footer={
        <button className="primary-btn" onClick={onClose}>
          完成
        </button>
      }
    >
      <div className="category-manager">
        <div className="category-list">
          {[{ id: 0, name: "收入分类", kind: 1 }, { id: 0, name: "支出分类", kind: 2 }].map((group) => (
            <div key={group.name} className="category-group">
              <b>{group.name}</b>
              {categories.filter((item) => item.kind === group.kind).map((item) => (
                <div className="category-item" key={item.id}>
                  <i className="swatch" style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <small>{item.transactionCount} 笔</small>
                  <button className="text-btn" onClick={() => { setEditingId(item.id); setDraft({ id: item.id, name: item.name, kind: item.kind, color: item.color, sortOrder: item.sortOrder }); setError(""); }}>
                    <Icon name="edit" size={13} />
                    编辑
                  </button>
                  <button className="text-btn danger-text" disabled={busy || item.transactionCount > 0} onClick={() => void remove(item)}>
                    <Icon name="trash" size={13} />
                    删除
                  </button>
                </div>
              ))}
              {!categories.some((item) => item.kind === group.kind) && <p className="muted-text">暂无分类</p>}
            </div>
          ))}
        </div>
        <div className="category-form">
          <b>{editingId ? "编辑分类" : "新增分类"}</b>
          <Field label="名称">
            <input value={draft.name} maxLength={32} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="例如：交通出行" />
          </Field>
          <Field label="类型">
            <select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: Number(event.target.value) })}>
              <option value={2}>支出</option>
              <option value={1}>收入</option>
            </select>
          </Field>
          <Field label="颜色">
            <div className="color-row">
              <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(draft.color) ? draft.color : "#B89CD5"} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
              <input value={draft.color} maxLength={7} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
            </div>
          </Field>
          <Field label="排序" hint="数字越小越靠前">
            <input type="number" min={0} value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} />
          </Field>
          {error && <div className="form-error">{error}</div>}
          <div className="category-form-actions">
            {editingId > 0 && <button className="text-btn" onClick={reset}>取消编辑</button>}
            <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
              {busy ? "保存中…" : editingId ? "保存修改" : "新增分类"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ImportDialog({
  onClose,
  onImported,
  notify,
}: {
  onClose: () => void;
  onImported: () => void;
  notify: Notify;
}) {
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportCommitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    if (!/\.(csv|txt|tsv)$/i.test(file.name)) {
      setError("请选择 .csv / .txt / .tsv 文件");
      return;
    }
    setContent(await file.text());
    setFilename(file.name);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const downloadTemplate = async () => {
    setBusy(true);
    try {
      const template = await fetchImportTemplate();
      downloadCsv(template.filename, template.content);
      notify("导入模板已下载");
    } catch (err) {
      notify(err instanceof Error ? err.message : "模板下载失败", "err");
    } finally {
      setBusy(false);
    }
  };

  const parse = async () => {
    if (!content.trim()) {
      setError("请先选择文件或粘贴 CSV 内容");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await previewFinanceImport(content);
      setPreview(data);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await commitFinanceImport(content);
      setResult(data);
      notify(`成功导入 ${data.imported} 笔流水`);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    } finally {
      setBusy(false);
    }
  };

  const footer = result ? (
    <button className="primary-btn" onClick={onClose}>
      完成
    </button>
  ) : preview ? (
    <>
      <button className="secondary-btn" onClick={() => setPreview(null)}>
        重新选择
      </button>
      <button className="primary-btn" disabled={busy || preview.validCount === 0} onClick={() => void commit()}>
        {busy ? "导入中…" : `确认导入 ${preview.validCount} 笔`}
      </button>
    </>
  ) : (
    <>
      <button className="secondary-btn" onClick={onClose}>
        取消
      </button>
      <button className="primary-btn" disabled={busy || !content.trim()} onClick={() => void parse()}>
        {busy ? "解析中…" : "解析预览"}
      </button>
    </>
  );

  return (
    <Modal
      title="导入流水"
      eyebrow="IMPORT"
      subtitle="下载模板 → 填写数据 → 上传预览 → 确认导入，重复记录会自动跳过。"
      onClose={onClose}
      wide
      footer={footer}
    >
      <div className="import-template-card">
        <div>
          <b>1 · 下载导入模板</b>
          <p>列顺序：日期,类型,分类,金额,标题,备注。金额单位为元，分类不存在时自动创建。</p>
          <code>2026-11-13,支出,日常饮食,32.50,午餐,公司楼下</code>
        </div>
        <button className="secondary-btn" disabled={busy} onClick={() => void downloadTemplate()}>
          <Icon name="download" size={15} />
          下载模板
        </button>
      </div>

      <div
        className={`import-drop ${dragOver ? "over" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files[0];
          if (file) void readFile(file);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <Icon name="upload" size={22} />
        <b>{filename || "点击选择或拖拽 CSV 文件到这里"}</b>
        <span>支持 .csv / .txt / .tsv，UTF-8 编码，单次最多 5000 行</span>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,.tsv"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readFile(file);
            event.target.value = "";
          }}
        />
      </div>

      <Field label="或直接粘贴 CSV 内容" grow>
        <textarea
          rows={4}
          value={content}
          placeholder={"日期,类型,分类,金额,标题,备注\n2026-11-13,支出,日常饮食,32.50,午餐,"}
          onChange={(event) => {
            setContent(event.target.value);
            setPreview(null);
            setResult(null);
          }}
        />
      </Field>

      {error && <div className="form-error">{error}</div>}

      {preview && (
        <div className="import-preview">
          <div className="import-summary">
            <span>共 <b>{preview.total}</b> 行</span>
            <span className="ok-text">可导入 <b>{preview.validCount}</b></span>
            <span className="dup-text">重复跳过 <b>{preview.duplicateCount}</b></span>
            <span className="err-text">有误 <b>{preview.errorCount}</b></span>
          </div>
          {preview.newCategories.length > 0 && (
            <p className="import-hint">将自动新建分类：{preview.newCategories.join("、")}</p>
          )}
          <div className="import-table-wrap">
            <table className="import-table">
              <thead>
                <tr><th>行</th><th>日期</th><th>类型</th><th>分类</th><th>金额</th><th>标题</th><th>状态</th></tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 60).map((row) => (
                  <tr key={row.line}>
                    <td>{row.line}</td>
                    <td>{row.date || "—"}</td>
                    <td>{row.typeName || "—"}</td>
                    <td>{row.category}</td>
                    <td>{row.amountCents ? `¥${money(row.amountCents, 2)}` : "—"}</td>
                    <td>{row.title}</td>
                    <td className={`status-${row.status}`}>{row.status === "ok" ? "可导入" : row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.rows.length > 60 && <p className="import-hint">仅预览前 60 行，导入时会处理全部 {preview.total} 行。</p>}
          <p className="import-guide">{preview.guide}</p>
        </div>
      )}

      {result && (
        <div className="import-result">
          <b>导入完成</b>
          <p>成功写入 {result.imported} 笔；跳过重复 {result.skipped} 笔；无效行 {result.errorCount} 行。</p>
          {result.newCategories.length > 0 && <p>新建分类：{result.newCategories.join("、")}</p>}
        </div>
      )}
    </Modal>
  );
}

function FinancePage() {
  const [month, setMonth] = useState(currentMonthText);
  const [filters, setFilters] = useState<FinanceTransactionQuery>({ type: 0, categoryId: 0, keyword: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<FinanceOverview | null>(null);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [rows, setRows] = useState<FinanceTransactionRow[]>([]);
  const [listMeta, setListMeta] = useState({ total: 0, incomeCents: 0, expenseCents: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [dialog, setDialog] = useState<FinanceDialog>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const notify: Notify = (text, tone = "ok") => setToast({ text, tone });
  const refresh = () => setReload((value) => value + 1);
  const pageSize = showAll ? 20 : 5;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      fetchFinanceOverview(month),
      fetchFinanceCategories(),
      fetchFinanceTransactions({
        month,
        type: filters.type,
        categoryId: filters.categoryId,
        keyword: filters.keyword,
        page,
        pageSize,
      }),
    ])
      .then(([overview, categoryList, transactionList]) => {
        if (!active) return;
        setData(overview);
        setCategories(categoryList.items);
        setRows(transactionList.items);
        setListMeta({
          total: transactionList.total,
          incomeCents: transactionList.incomeCents,
          expenseCents: transactionList.expenseCents,
        });
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "读取失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [month, filters.type, filters.categoryId, filters.keyword, page, pageSize, reload]);

  const updateFilter = (patch: FinanceTransactionQuery) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };
  const resetFilters = () => {
    setMonth(currentMonthText());
    setFilters({ type: 0, categoryId: 0, keyword: "" });
    setPage(1);
  };
  const activeFilters = (filters.type ? 1 : 0) + (filters.categoryId ? 1 : 0) + (filters.keyword ? 1 : 0);
  const pageCount = Math.max(1, Math.ceil(listMeta.total / pageSize));

  const downloadTemplate = async () => {
    try {
      const template = await fetchImportTemplate();
      downloadCsv(template.filename, template.content);
      notify("导入模板已下载");
    } catch (err) {
      notify(err instanceof Error ? err.message : "模板下载失败", "err");
    }
  };

  const exportRows = async () => {
    try {
      const file = await fetchFinanceExport({
        month,
        type: filters.type,
        categoryId: filters.categoryId,
        keyword: filters.keyword,
      });
      if (!file.total) {
        notify("当前筛选下没有可导出的流水", "err");
        return;
      }
      downloadCsv(file.filename, file.content);
      notify(`已导出 ${file.total} 笔流水`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "导出失败", "err");
    }
  };

  const askDelete = (row: FinanceTransactionRow) => {
    setDialog({
      kind: "confirm",
      title: "删除这笔流水？",
      message: `「${row.title}」¥${money(row.amountCents, 2)} 将移出统计，图表会同步更新。`,
      onConfirm: async () => {
        await deleteFinanceTransaction(row.id);
        notify("流水已删除");
        refresh();
      },
    });
  };

  const runConfirm = async () => {
    if (dialog?.kind !== "confirm") return;
    setConfirmBusy(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (err) {
      notify(err instanceof Error ? err.message : "操作失败", "err");
    } finally {
      setConfirmBusy(false);
    }
  };

  const menuItems: MenuItem[] = [
    { label: "导入流水", icon: "upload", onClick: () => setDialog({ kind: "import" }) },
    { label: "下载导入模板", icon: "download", onClick: () => void downloadTemplate() },
    { label: "导出当前筛选", icon: "download", onClick: () => void exportRows() },
    { label: "分类管理", icon: "layout", onClick: () => setDialog({ kind: "categories" }) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  const trend = data?.trend ?? [];
  const shares = data?.categories ?? [];
  const peak = Math.max(100000, ...trend.flatMap((point) => [point.incomeCents, point.expenseCents]));
  const yMax = Math.ceil(peak / 50000) * 50000;
  const incomePath = linePath(trend.map((point) => point.incomeCents), yMax);
  const expensePath = linePath(trend.map((point) => point.expenseCents), yMax);
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) => `${Math.round((yMax * ratio) / 100000)}k`);
  const donutStops = shares.map((item, index) => {
    const from = shares.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
    return `${item.color} ${from}% ${from + item.percent}%`;
  });
  const monthValue = data?.month ?? month;
  const monthLabel = MONTH_LABELS[Number(monthValue.slice(5, 7)) - 1] || "本月";

  return (
    <div className="page">
      <ModuleShell
        title="记账"
        subtitle="收支趋势、预算与每一笔生活选择。"
        color="#E56F4A"
        status={`${loading ? "同步中" : "已同步"} ${listMeta.total} 笔流水`}
        menu={menuItems}
        actions={
          <>
            <button className={`secondary-btn ${filterOpen || activeFilters ? "filter-active" : ""}`} onClick={() => setFilterOpen((value) => !value)}>
              <Icon name="filter" size={16} />
              筛选{activeFilters > 0 ? ` · ${activeFilters}` : ""}
            </button>
            <button className="primary-btn" onClick={() => setDialog({ kind: "transaction" })}>
              <Icon name="plus" size={16} />
              记一笔
            </button>
          </>
        }
      >
        {error && (
          <div className="finance-error">
            <span>读取失败：{error}</span>
            <button className="text-btn" onClick={refresh}>
              重试
            </button>
          </div>
        )}

        {filterOpen && (
          <div className="filter-bar">
            <Field label="月份">
              <input type="month" value={month} onChange={(event) => { setMonth(event.target.value || currentMonthText()); setPage(1); }} />
            </Field>
            <Field label="收支类型">
              <select value={filters.type ?? 0} onChange={(event) => updateFilter({ type: Number(event.target.value) })}>
                <option value={0}>全部</option>
                <option value={1}>仅收入</option>
                <option value={2}>仅支出</option>
              </select>
            </Field>
            <Field label="分类">
              <select value={filters.categoryId ?? 0} onChange={(event) => updateFilter({ categoryId: Number(event.target.value) })}>
                <option value={0}>全部分类</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </Field>
            <Field label="关键字" grow>
              <input value={filters.keyword ?? ""} placeholder="标题 / 备注 / 分类" onChange={(event) => updateFilter({ keyword: event.target.value })} />
            </Field>
            <button className="text-btn filter-reset" onClick={resetFilters}>重置</button>
            <p className="filter-hint">月份同时影响上方总览与图表，其余条件作用于下方流水列表。</p>
          </div>
        )}

        <div className="stats-row">
          <Stat label={`${monthLabel}收入`} value={data ? `¥ ${money(data.incomeCents)}` : "—"} change={signedPct(data?.incomeChangePct)} />
          <Stat label={`${monthLabel}支出`} value={data ? `¥ ${money(data.expenseCents)}` : "—"} change={signedPct(data?.expenseChangePct)} good={(data?.expenseChangePct ?? 0) <= 0} />
          <Stat label="结余率" value={data ? `${data.balanceRate}%` : "—"} change={signedPct(data?.balanceChangePct)} />
        </div>

        <div className="detail-grid finance-grid">
          <Panel
            title="收支趋势"
            aside={
              <div className="legend">
                <span><i className="income" />收入</span>
                <span><i />支出</span>
              </div>
            }
          >
            <div className="finance-chart">
              <div className="y-labels">
                {yLabels.map((label) => <span key={label}>{label}</span>)}
              </div>
              <svg viewBox="0 0 700 210" preserveAspectRatio="none">
                <path className="gridline" d="M0 20H700M0 65H700M0 110H700M0 155H700M0 200H700" />
                <path className="income-line" d={incomePath} />
                <path className="expense-line" d={expensePath} />
              </svg>
              <div className="x-labels">
                {trend.map((point) => <span key={point.month}>{point.label}</span>)}
              </div>
            </div>
          </Panel>
          <Panel
            title="支出分类"
            aside={<button className="text-btn" onClick={() => setDialog({ kind: "categories" })}>查看全部 <Icon name="arrow" size={13} /></button>}
          >
            <div className="donut-wrap">
              <div
                className="donut"
                style={{ background: shares.length ? `conic-gradient(${donutStops.join(", ")})` : "conic-gradient(#e9e4d8 0% 100%)" }}
              >
                <div>
                  <b>¥{money(data?.expenseCents ?? 0)}</b>
                  <span>总支出</span>
                </div>
              </div>
              <div className="cat-list">
                {shares.map((item) => <Category key={item.name} color={item.color} name={item.name} val={`${item.percent}%`} />)}
                {!shares.length && <Category color="#e9e4d8" name="暂无支出" val="0%" />}
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title={showAll ? "全部流水" : "最近流水"}
          className="transactions-panel"
          aside={<button className="text-btn" onClick={() => { setShowAll((value) => !value); setPage(1); }}>{showAll ? "收起" : "全部流水"} <Icon name="arrow" size={14} /></button>}
        >
          <div className="table-summary">
            <span>共 {listMeta.total} 笔</span>
            <span>收入 ¥{money(listMeta.incomeCents, 2)}</span>
            <span>支出 ¥{money(listMeta.expenseCents, 2)}</span>
            {activeFilters > 0 && <span className="filter-tag">筛选中</span>}
          </div>
          <table>
            <thead>
              <tr><th>日期</th><th>交易</th><th>分类</th><th>金额</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <b>{row.title}</b>
                    {row.note && <small className="row-note">{row.note}</small>}
                  </td>
                  <td><Badge>{row.category}</Badge></td>
                  <td className={row.type === 1 ? "positive" : ""}>{row.type === 1 ? "+" : "−"} ¥{money(row.amountCents, 2)}</td>
                  <td className="row-actions-cell">
                    <Dropdown
                      items={[
                        { label: "编辑", icon: "edit", onClick: () => setDialog({ kind: "transaction", row }) },
                        { label: "删除", icon: "trash", danger: true, onClick: () => askDelete(row) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5} className="empty-cell">还没有符合条件的流水，换个筛选或记一笔吧</td></tr>
              )}
            </tbody>
          </table>
          {showAll && pageCount > 1 && (
            <div className="pagination">
              <button className="secondary-btn" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
              <span>第 {page} / {pageCount} 页</span>
              <button className="secondary-btn" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</button>
            </div>
          )}
        </Panel>
      </ModuleShell>

      {dialog?.kind === "transaction" && (
        <TransactionDialog row={dialog.row ?? null} categories={categories} onClose={() => setDialog(null)} onSaved={refresh} notify={notify} />
      )}
      {dialog?.kind === "categories" && (
        <CategoryDialog categories={categories} onClose={() => setDialog(null)} onChanged={refresh} notify={notify} />
      )}
      {dialog?.kind === "import" && (
        <ImportDialog onClose={() => setDialog(null)} onImported={refresh} notify={notify} />
      )}
      {dialog?.kind === "confirm" && (
        <Modal
          title={dialog.title}
          eyebrow="CONFIRM"
          onClose={() => setDialog(null)}
          footer={
            <>
              <button className="secondary-btn" onClick={() => setDialog(null)}>取消</button>
              <button className="primary-btn danger-solid" disabled={confirmBusy} onClick={() => void runConfirm()}>{confirmBusy ? "处理中…" : "确认删除"}</button>
            </>
          }
        >
          <p className="confirm-text">{dialog.message}</p>
        </Modal>
      )}
      <Toast toast={toast} />
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
          <div className="template-preview generated-preview" style={{ "--pv-accent": color } as CSSProperties}>
            <TemplatePreview template={templateKeyOf(template)} accent={color} />
          </div>
        </div>
      </ModuleShell>
    </div>
  );
}

function Workspace() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [modules, setModules] = useState<WorkspaceModule[]>([]);
  const [moduleBusy, setModuleBusy] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<{ x: number; y: number; key: string; name: string } | null>(null);
  const avatarText = user?.nickname ? user.nickname.slice(0, 1).toUpperCase() : "LM";

  const notify: Notify = (text, tone = "ok") => setToast({ text, tone });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!settingsOpen) return;
    const close = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [settingsOpen]);

  useEffect(() => {
    let active = true;
    fetchModules()
      .then((data) => {
        if (active) setModules(data.items);
      })
      .catch((err: Error) => {
        if (active) notify(err.message || "模块读取失败", "err");
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => modules.filter((item) => !item.hidden), [modules]);
  const filtered = useMemo(
    () => visible.filter((item) => item.name.includes(query) || item.key.includes(query.toLowerCase())),
    [visible, query],
  );

  const runModuleAction = async (action: () => Promise<{ items: WorkspaceModule[] }>) => {
    setModuleBusy(true);
    try {
      const data = await action();
      setModules(data.items);
      return data.items;
    } catch (err) {
      notify(err instanceof Error ? err.message : "模块操作失败", "err");
      return null;
    } finally {
      setModuleBusy(false);
    }
  };

  /** 拖动排序：把可见模块的完整顺序发给后端，避免搜索过滤时下标错位。 */
  const move = (to: number) => {
    if (drag === null || drag === to) return;
    const next = [...filtered];
    const [item] = next.splice(drag, 1);
    next.splice(to, 0, item);
    setDrag(null);
    const moved = new Set(next.map((entry) => entry.key));
    const keys = [...next.map((entry) => entry.key), ...visible.filter((entry) => !moved.has(entry.key)).map((entry) => entry.key)];
    void runModuleAction(() => sortModules(keys));
  };

  const addFromLibrary = async (key: string) => {
    const items = await runModuleAction(() => addWorkspaceModule(key));
    if (!items) return;
    const added = items.find((item) => item.key === key && !item.hidden);
    if (!added) return;
    notify(`已添加「${added.name}」，设置已保存`);
  };

  /** 在「添加模块」弹窗内直接把已添加模块移出侧边栏，弹窗保持在原地。 */
  const removeFromLibrary = async (key: string) => {
    const target = modules.find((item) => item.key === key);
    const items = await runModuleAction(() => hideModule(key));
    if (!items) return;
    if (page === key) setPage("home");
    notify(`「${target?.name ?? "模块"}」已移出侧边栏，可在「待添加」中加回`);
  };

  const removeModule = async (key: string, name: string) => {
    setContext(null);
    const items = await runModuleAction(() => hideModule(key));
    if (!items) return;
    if (page === key) setPage("home");
    notify(`「${name}」已删除，可在「添加模块」中加回`);
  };

  const fixedContent: Record<string, React.ReactNode> = {
    home: <Dashboard open={setPage} />,
    finance: <FinancePage />,
    music: <MusicPage />,
    plans: <PlansPage />,
    learning: <LearningPage />,
    inspiration: <InspirationPage />,
    movies: <MoviesPage />,
    travel: <TravelPage />,
    fitness: <FitnessPage />,
    album: <AlbumPage />,
    system: <DesignSystemPage />,
  };
  const activeModule = visible.find((module) => module.key === page);
  const content =
    fixedContent[page] ??
    (activeModule ? (
      <GeneratedModule name={activeModule.name} color={activeModule.color} template={activeModule.template} />
    ) : (
      fixedContent.home
    ));

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
          <button onClick={() => setModal(true)} title="模块设置">
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
                setContext({ x: e.clientX, y: e.clientY, key: m.key, name: m.name });
              }}
              key={m.key}
              className={`nav-item ${page === m.key ? "active" : ""}`}
              onClick={() => setPage(m.key)}
            >
              <span>
                <i className="nav-icon" style={{ background: m.color + "15", color: m.color }}>
                  <Icon name={m.icon as IconName} size={17} />
                </i>
                {m.name}
              </span>
              <i className="nav-dot" />
            </button>
          ))}
          {!filtered.length && <p className="muted-text">还没有模块，点击下方添加</p>}
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
                : visible.find((m) => m.key === page)?.name}
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
          <div className="top-menu-wrap" ref={settingsRef}>
            <button
              className={`icon-btn ${settingsOpen ? "active" : ""}`}
              aria-expanded={settingsOpen}
              aria-label="账号设置"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <Icon name="settings" />
            </button>
            {settingsOpen && (
              <div className="profile-menu top-menu">
                <div className="profile-menu-head">
                  <b>{user?.nickname || "未命名用户"}</b>
                  <span>{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    void logout();
                  }}
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>{content}</main>
      {context && (
        <div className="context-menu" style={{ left: context.x, top: context.y }}>
          <b>{context.name}</b>
          <button
            onClick={() => {
              setPage(context.key);
              setContext(null);
            }}
          >
            打开模块
          </button>
          <hr />
          <button className="danger" onClick={() => void removeModule(context.key, context.name)}>
            隐藏模块
          </button>
        </div>
      )}
      {modal && (
        <AddModuleDialog
          modules={modules}
          busy={moduleBusy}
          onAdd={(key) => void addFromLibrary(key)}
          onRemove={(key) => void removeFromLibrary(key)}
          onClose={() => setModal(false)}
        />
      )}
      <Toast toast={toast} />
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
