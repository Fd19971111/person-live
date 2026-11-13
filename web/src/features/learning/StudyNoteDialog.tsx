import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveStudyNote, type StudyNote, type StudyNoteInput } from "../../api/study";

const TAG_OPTIONS = ["设计", "艺术史", "阅读", "技术", "语言", "随手记"];

/** 新建 / 编辑学习笔记。 */
export function StudyNoteDialog({
  note,
  onClose,
  onSaved,
  notify,
}: {
  note: StudyNote | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<StudyNoteInput>({
    id: note?.id ?? 0,
    title: note?.title ?? "",
    tag: note?.tag ?? "",
    content: note?.content ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写笔记标题");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveStudyNote({ ...draft, title: draft.title.trim(), tag: draft.tag.trim(), content: draft.content.trim() });
      notify(note ? "笔记已更新" : "笔记已创建");
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
      title={note ? "编辑笔记" : "新建笔记"}
      eyebrow="NOTE"
      subtitle="读书、课程与思考，都值得留下一条记录。"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="secondary-btn" onClick={onClose}>
            取消
          </button>
          <button className="primary-btn indigo" disabled={busy} onClick={() => void submit()}>
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
            placeholder="例如：设计系统不是组件库"
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
        <Field label="正文" grow>
          <textarea
            rows={6}
            value={draft.content}
            maxLength={2000}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            placeholder="记录这一条的关键内容…"
          />
        </Field>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
