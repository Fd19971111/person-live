import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveInspirationItem, type InspirationItem, type InspirationItemInput } from "../../api/inspiration";

const TAG_OPTIONS = ["设计", "艺术史", "阅读", "生活", "工作", "随想"];
const COLOR_OPTIONS = ["#9B72D2", "#D4A63D", "#4C8D78", "#E56F4A", "#6389A8", "#B87758"];

/** 新建 / 编辑一条灵感。 */
export function InspirationItemDialog({
  item,
  onClose,
  onSaved,
  notify,
}: {
  item: InspirationItem | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<InspirationItemInput>({
    id: item?.id ?? 0,
    title: item?.title ?? "",
    content: item?.content ?? "",
    tag: item?.tag ?? "",
    source: item?.source ?? "",
    color: item?.color ?? "#9B72D2",
    pinned: item?.pinned ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写灵感标题");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveInspirationItem({
        ...draft,
        title: draft.title.trim(),
        content: draft.content.trim(),
        tag: draft.tag.trim(),
        source: draft.source.trim(),
      });
      notify(item ? "灵感已更新" : "灵感已收藏");
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
      title={item ? "编辑灵感" : "记一条灵感"}
      eyebrow="INSPIRATION"
      subtitle="一句话、一段摘录或一个链接，先收进来，之后再慢慢长成作品。"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="secondary-btn" onClick={onClose}>
            取消
          </button>
          <button className="primary-btn purple" disabled={busy} onClick={() => void submit()}>
            {busy ? "保存中…" : "保存"}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="标题" grow>
          <input
            value={draft.title}
            maxLength={128}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例如：一致性不是让一切看起来相同"
            autoFocus
          />
        </Field>
        <Field label="标签" hint="可直接输入，也可选常用标签">
          <input
            value={draft.tag}
            maxLength={32}
            onChange={(event) => setDraft({ ...draft, tag: event.target.value })}
            placeholder="例如：设计"
          />
        </Field>
        <Field label="快速选择">
          <div className="tag-row">
            {TAG_OPTIONS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`tag-chip ${draft.tag === tag ? "active" : ""}`}
                onClick={() => setDraft({ ...draft, tag })}
              >
                {tag}
              </button>
            ))}
          </div>
        </Field>
        <Field label="来源" hint="链接、书名或对话都可以">
          <input
            value={draft.source}
            maxLength={255}
            onChange={(event) => setDraft({ ...draft, source: event.target.value })}
            placeholder="例如：https://example.com 或《设计系统实践》"
          />
        </Field>
        <Field label="正文" grow>
          <textarea
            rows={6}
            value={draft.content}
            maxLength={2000}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            placeholder="把闪念写下来…"
          />
        </Field>
        <Field label="颜色">
          <div className="tag-row">
            {COLOR_OPTIONS.map((color) => (
              <button
                type="button"
                key={color}
                className={`color-chip ${draft.color.toLowerCase() === color.toLowerCase() ? "active" : ""}`}
                style={{ background: color }}
                title={color}
                onClick={() => setDraft({ ...draft, color })}
              />
            ))}
          </div>
        </Field>
        <Field label="展示">
          <div className="tag-row">
            <button
              type="button"
              className={`tag-chip ${draft.pinned ? "active" : ""}`}
              onClick={() => setDraft({ ...draft, pinned: !draft.pinned })}
            >
              {draft.pinned ? "已置顶" : "置顶这条灵感"}
            </button>
          </div>
        </Field>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
