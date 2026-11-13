import { useState } from "react";
import { Field, Modal, todayText, type Notify } from "../../components/ui";
import { saveFitnessRecord, type FitnessRecord, type FitnessRecordInput } from "../../api/fitness";

const ACTIVITIES = ["跑步", "骑行", "力量训练", "游泳", "瑜伽", "徒步", "球类"];
const COLORS = ["#5C927A", "#6389A8", "#D4A63D", "#9B72D2", "#4C8D78", "#E56F4A"];

/** 新建 / 编辑一条运动记录。 */
export function FitnessDialog({
  record,
  onClose,
  onSaved,
  notify,
}: {
  record: FitnessRecord | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<FitnessRecordInput>({
    id: record?.id ?? 0,
    activity: record?.activity ?? "跑步",
    minutes: record?.minutes ?? 30,
    distanceKm: record?.distanceKm ?? 0,
    calories: record?.calories ?? 0,
    performedOn: record?.performedOn ?? todayText(),
    note: record?.note ?? "",
    color: record?.color ?? "#5C927A",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!draft.activity.trim()) {
      setError("请填写运动类型");
      return;
    }
    if (draft.minutes < 1) {
      setError("运动时长至少 1 分钟");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveFitnessRecord({ ...draft, activity: draft.activity.trim(), note: draft.note.trim() });
      notify(record ? "记录已更新" : "已记录这次运动");
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
      title={record ? "编辑运动记录" : "记录运动"}
      eyebrow="FITNESS"
      subtitle="时长、距离和消耗都记下来，热力图会替你累积。"
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
        <Field label="运动类型" grow hint="可直接输入新类型">
          <input
            list="fitness-activities"
            value={draft.activity}
            maxLength={32}
            onChange={(event) => setDraft({ ...draft, activity: event.target.value })}
            placeholder="例如：跑步"
            autoFocus
          />
          <datalist id="fitness-activities">
            {ACTIVITIES.map((activity) => (
              <option key={activity} value={activity} />
            ))}
          </datalist>
        </Field>
        <Field label="日期">
          <input
            type="date"
            value={draft.performedOn}
            onChange={(event) => setDraft({ ...draft, performedOn: event.target.value })}
          />
        </Field>
        <Field label="时长（分钟）">
          <input
            type="number"
            min={1}
            max={1440}
            value={draft.minutes}
            onChange={(event) => setDraft({ ...draft, minutes: Number(event.target.value) })}
          />
        </Field>
        <Field label="距离（公里）" hint="不适用时填 0">
          <input
            type="number"
            min={0}
            step={0.1}
            value={draft.distanceKm}
            onChange={(event) => setDraft({ ...draft, distanceKm: Number(event.target.value) })}
          />
        </Field>
        <Field label="消耗（千卡）" hint="不确定时填 0">
          <input
            type="number"
            min={0}
            step={10}
            value={draft.calories}
            onChange={(event) => setDraft({ ...draft, calories: Number(event.target.value) })}
          />
        </Field>
        <Field label="备注" grow>
          <textarea
            rows={3}
            value={draft.note}
            maxLength={255}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="例如：沿河慢跑，配速 7′15″。"
          />
        </Field>
        <Field label="颜色">
          <div className="tag-row">
            {COLORS.map((color) => (
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
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
