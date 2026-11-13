import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal, type Notify } from "../../components/ui";
import { PLAN_STATUS, savePlanTask, type PlanCategory, type PlanTask } from "../../api/plan";
import { todayDate } from "./planDate";

/** 新建 / 编辑计划任务，字段与交互对齐「记账」的记一笔弹窗。 */
export function PlanTaskDialog({
  task,
  defaultStatus,
  defaultDueDate,
  categories,
  onClose,
  onSaved,
  onManageCategories,
  notify,
}: {
  task: PlanTask | null;
  defaultStatus: number;
  defaultDueDate?: string;
  categories: PlanCategory[];
  onClose: () => void;
  onSaved: () => void;
  onManageCategories: () => void;
  notify: Notify;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [note, setNote] = useState(task?.note ?? "");
  const [status, setStatus] = useState(task?.status ?? defaultStatus);
  const [dueDate, setDueDate] = useState(task?.dueDate || defaultDueDate || todayDate());
  const [categoryText, setCategoryText] = useState(task?.categoryId ? task.category : "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);

  const existingNames = new Set(categories.map((item) => item.name));
  const suggestions = Array.from(existingNames).filter(
    (name) => !categoryText.trim() || name.includes(categoryText.trim()),
  );
  const newCategoryName = categoryText.trim() && !existingNames.has(categoryText.trim()) ? categoryText.trim() : "";

  useEffect(() => {
    if (!categoryOpen) return;
    const close = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [categoryOpen]);

  const changeStatus = (next: number) => {
    if (next === status) return;
    setStatus(next);
  };

  const submit = async () => {
    if (!title.trim()) {
      setError("请填写任务标题");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await savePlanTask({
        id: task?.id ?? 0,
        title: title.trim(),
        note: note.trim(),
        status,
        dueDate,
        categoryId: 0,
        categoryName: categoryText.trim(),
      });
      notify(task ? "任务已更新" : "已创建新计划");
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
      title={task ? "编辑计划" : "新计划"}
      eyebrow="PLAN"
      subtitle="把想做的事放进看得见的时间里。"
      onClose={onClose}
      footer={
        <>
          <button className="secondary-btn" onClick={onClose}>
            取消
          </button>
          <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
            {busy ? "保存中…" : task ? "保存修改" : "保存"}
          </button>
        </>
      }
    >
      <div className="segmented">
        {PLAN_STATUS.map((item) => (
          <button key={item.value} className={status === item.value ? "active" : ""} onClick={() => changeStatus(item.value)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="form-grid">
        <Field label="任务标题" grow>
          <input
            value={title}
            maxLength={128}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：整理年度照片"
            autoFocus
          />
        </Field>
        <Field
          label="分类"
          hint={newCategoryName ? `将自动新建分类「${newCategoryName}」` : "可下拉选择，也可直接输入新分类；留空为未分类"}
        >
          <div className="combo" ref={categoryRef}>
            <input
              value={categoryText}
              maxLength={32}
              placeholder="选择或输入，例如：生活"
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
                <div className="combo-menu-head">{newCategoryName ? `新建分类「${newCategoryName}」` : "计划分类"}</div>
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
                    <small>已有</small>
                  </button>
                ))}
                {!suggestions.length && <div className="combo-empty">直接输入名称即可新建分类</div>}
                <button
                  className="combo-menu-foot"
                  type="button"
                  onClick={() => {
                    setCategoryOpen(false);
                    onManageCategories();
                  }}
                >
                  <Icon name="layout" size={13} />
                  分类管理
                </button>
              </div>
            )}
          </div>
        </Field>
        <Field label="截止日期" hint="可留空表示无期限">
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          {dueDate && (
            <button className="text-btn field-link" type="button" onClick={() => setDueDate("")}>
              清除日期
            </button>
          )}
        </Field>
        <Field label="备注" grow>
          <input value={note} maxLength={512} onChange={(event) => setNote(event.target.value)} placeholder="可留空" />
        </Field>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
