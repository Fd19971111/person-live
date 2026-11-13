import { useState } from "react";
import { Field, Modal, todayText, type Notify } from "../../components/ui";
import { saveTravelTrip, type TravelTrip, type TravelTripInput } from "../../api/travel";

const COLORS = ["#B87758", "#4C8D78", "#6389A8", "#9B72D2", "#D4A63D", "#E56F4A"];

/** 新建 / 编辑旅行足迹。 */
export function TravelDialog({
  trip,
  onClose,
  onSaved,
  notify,
}: {
  trip: TravelTrip | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<TravelTripInput>({
    id: trip?.id ?? 0,
    title: trip?.title ?? "",
    region: trip?.region ?? "",
    visitedOn: trip?.visitedOn ?? todayText(),
    days: trip?.days ?? 1,
    rating: trip?.rating ?? 0,
    note: trip?.note ?? "",
    color: trip?.color ?? "#B87758",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写目的地");
      return;
    }
    if (draft.days < 1) {
      setError("行程天数至少 1 天");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveTravelTrip({
        ...draft,
        title: draft.title.trim(),
        region: draft.region.trim(),
        note: draft.note.trim(),
      });
      notify(trip ? "足迹已更新" : "已记录这次旅行");
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
      title={trip ? "编辑足迹" : "记录一次旅行"}
      eyebrow="TRAVEL"
      subtitle="地点、天数与一句话记忆，时间会自己排成一条线。"
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
        <Field label="目的地" grow>
          <input
            value={draft.title}
            maxLength={128}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例如：京都"
            autoFocus
          />
        </Field>
        <Field label="省份 / 国家">
          <input
            value={draft.region}
            maxLength={64}
            onChange={(event) => setDraft({ ...draft, region: event.target.value })}
            placeholder="例如：日本"
          />
        </Field>
        <Field label="出发日期">
          <input
            type="date"
            value={draft.visitedOn}
            onChange={(event) => setDraft({ ...draft, visitedOn: event.target.value })}
          />
        </Field>
        <Field label="行程天数">
          <input
            type="number"
            min={1}
            max={365}
            value={draft.days}
            onChange={(event) => setDraft({ ...draft, days: Number(event.target.value) })}
          />
        </Field>
        <Field label="评分" hint="0 表示未评分">
          <select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}>
            <option value={0}>未评分</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {"★".repeat(value)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="备注" grow>
          <textarea
            rows={4}
            value={draft.note}
            maxLength={500}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="记下天气、路线或一句心情…"
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
