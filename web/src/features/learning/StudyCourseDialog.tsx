import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveStudyCourse, type StudyCourse, type StudyCourseInput } from "../../api/study";

const UNIT_OPTIONS = ["章", "节", "课", "讲", "页"];

/** 新建 / 编辑课程与进度。 */
export function StudyCourseDialog({
  course,
  onClose,
  onSaved,
  notify,
}: {
  course: StudyCourse | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<StudyCourseInput>({
    id: course?.id ?? 0,
    title: course?.title ?? "",
    unitLabel: course?.unitLabel ?? "章",
    totalUnits: course?.totalUnits ?? 10,
    doneUnits: course?.doneUnits ?? 0,
    color: course?.color ?? "#5F6E9C",
    sortOrder: course?.sortOrder ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const progress = draft.totalUnits > 0 ? Math.min(100, Math.round((draft.doneUnits / draft.totalUnits) * 100)) : 0;

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写课程名称");
      return;
    }
    if (draft.doneUnits > draft.totalUnits) {
      setError("已完成数量不能超过总进度");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveStudyCourse({ ...draft, title: draft.title.trim() });
      notify(course ? "课程已更新" : "课程已创建");
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
      title={course ? "编辑课程" : "新建课程"}
      eyebrow="COURSE"
      subtitle={`保存后进度为 ${progress}%，会同步到「正在学习」列表。`}
      onClose={onClose}
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
        <Field label="课程名称" grow>
          <input
            value={draft.title}
            maxLength={64}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例如：界面设计系统"
            autoFocus
          />
        </Field>
        <Field label="进度单位">
          <select value={draft.unitLabel} onChange={(event) => setDraft({ ...draft, unitLabel: event.target.value })}>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
        <Field label="总进度">
          <input
            type="number"
            min={0}
            max={1000}
            value={draft.totalUnits}
            onChange={(event) => setDraft({ ...draft, totalUnits: Number(event.target.value) })}
          />
        </Field>
        <Field label="已完成" hint={`当前完成度 ${progress}%`}>
          <input
            type="number"
            min={0}
            max={draft.totalUnits}
            value={draft.doneUnits}
            onChange={(event) => setDraft({ ...draft, doneUnits: Number(event.target.value) })}
          />
        </Field>
        <Field label="颜色">
          <div className="color-row">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(draft.color) ? draft.color : "#5F6E9C"}
              onChange={(event) => setDraft({ ...draft, color: event.target.value })}
            />
            <input value={draft.color} maxLength={7} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
          </div>
        </Field>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
