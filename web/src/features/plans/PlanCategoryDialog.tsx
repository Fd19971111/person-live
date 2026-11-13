import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal, type Notify } from "../../components/ui";
import { deletePlanCategory, savePlanCategory, type PlanCategory, type PlanCategoryInput } from "../../api/plan";

/** 计划分类管理：新增、编辑与删除（删除后分类下的任务显示为未分类）。 */
export function PlanCategoryDialog({
  categories,
  onClose,
  onChanged,
  notify,
}: {
  categories: PlanCategory[];
  onClose: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const emptyDraft: PlanCategoryInput = { name: "", color: "#6C9E8D", sortOrder: categories.length };
  const [draft, setDraft] = useState<PlanCategoryInput>(emptyDraft);
  const [editingId, setEditingId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setDraft({ ...emptyDraft, sortOrder: categories.length });
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
      await savePlanCategory({ ...draft, id: editingId, name: draft.name.trim() });
      notify(editingId ? "分类已更新" : "分类已新增");
      reset();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: PlanCategory) => {
    setBusy(true);
    try {
      await deletePlanCategory(item.id);
      notify(item.taskCount > 0 ? `分类已隐藏，${item.taskCount} 个任务转为未分类` : "分类已删除");
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
      subtitle="计划分类可随时删除，删除只是隐藏，已归属的任务会转为未分类。"
      onClose={onClose}
      wide
      footer={
        <button className="primary-btn" onClick={onClose}>
          完成
        </button>
      }
    >
      <div className="category-manager">
        <div>
          <div className="category-group">
            <b>全部分类</b>
            {categories.map((item) => (
              <div className="category-item" key={item.id}>
                <i className="swatch" style={{ background: item.color }} />
                <span>{item.name}</span>
                <small>{item.taskCount} 个任务</small>
                <button
                  className="text-btn"
                  onClick={() => {
                    setEditingId(item.id);
                    setDraft({ id: item.id, name: item.name, color: item.color, sortOrder: item.sortOrder });
                    setError("");
                  }}
                >
                  <Icon name="edit" size={13} />
                  编辑
                </button>
                <button className="text-btn danger-text" disabled={busy} onClick={() => void remove(item)}>
                  <Icon name="trash" size={13} />
                  删除
                </button>
              </div>
            ))}
            {!categories.length && <p className="muted-text">暂无分类</p>}
          </div>
        </div>
        <div className="category-form">
          <b>{editingId ? "编辑分类" : "新增分类"}</b>
          <Field label="名称">
            <input
              value={draft.name}
              maxLength={32}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="例如：生活"
            />
          </Field>
          <Field label="颜色">
            <div className="color-row">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(draft.color) ? draft.color : "#6C9E8D"}
                onChange={(event) => setDraft({ ...draft, color: event.target.value })}
              />
              <input value={draft.color} maxLength={7} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
            </div>
          </Field>
          <Field label="排序" hint="数字越小越靠前">
            <input
              type="number"
              min={0}
              value={draft.sortOrder}
              onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })}
            />
          </Field>
          {error && <div className="form-error">{error}</div>}
          <div className="category-form-actions">
            {editingId > 0 && (
              <button className="text-btn" onClick={reset}>
                取消编辑
              </button>
            )}
            <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
              {busy ? "保存中…" : editingId ? "保存修改" : "新增分类"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
