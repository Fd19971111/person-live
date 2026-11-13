import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveStudyGoal } from "../../api/study";
import { hourText } from "./studyFormat";

const PRESETS = [180, 300, 420, 600];

/** 设置每周学习目标（小时）。 */
export function StudyGoalDialog({
  weeklyGoalMinutes,
  onClose,
  onSaved,
  notify,
}: {
  weeklyGoalMinutes: number;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [hours, setHours] = useState(String(Number(hourText(weeklyGoalMinutes)) || 6));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const value = Number(hours);
    if (!Number.isFinite(value) || value <= 0) {
      setError("请填写大于 0 的目标小时数");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveStudyGoal(Math.round(value * 60));
      notify("每周目标已更新");
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
      title="每周目标"
      eyebrow="WEEKLY GOAL"
      subtitle="目标同时决定本月进度环的百分比。"
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
      <Field label="每周学习目标（小时）" hint="本月目标按 4 周折算">
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={hours}
          onChange={(event) => setHours(event.target.value)}
          autoFocus
        />
      </Field>
      <div className="tag-row goal-presets">
        {PRESETS.map((minutes) => {
          const value = Number(hourText(minutes));
          return (
            <button
              type="button"
              key={minutes}
              className={`tag-chip ${Number(hours) === value ? "active" : ""}`}
              onClick={() => setHours(String(value))}
            >
              {value} 小时
            </button>
          );
        })}
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
