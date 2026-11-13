import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveMovieItem, type MovieItem, type MovieItemInput } from "../../api/movies";

const STATUS_OPTIONS = [
  { value: 1, label: "想看" },
  { value: 2, label: "在看" },
  { value: 3, label: "已看完" },
];

const COLORS = ["#6389A8", "#B87758", "#9B72D2", "#4C8D78", "#D4A63D", "#E56F4A"];

/** 新建 / 编辑电影。 */
export function MovieDialog({
  item,
  onClose,
  onSaved,
  notify,
}: {
  item: MovieItem | null;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<MovieItemInput>({
    id: item?.id ?? 0,
    title: item?.title ?? "",
    year: item?.year ?? 0,
    genre: item?.genre ?? "",
    director: item?.director ?? "",
    rating: item?.rating ?? 0,
    status: item?.status ?? 1,
    note: item?.note ?? "",
    color: item?.color ?? "#6389A8",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写电影名称");
      return;
    }
    if (draft.rating < 0 || draft.rating > 10) {
      setError("评分需在 0-10 之间");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveMovieItem({
        ...draft,
        title: draft.title.trim(),
        genre: draft.genre.trim(),
        director: draft.director.trim(),
        note: draft.note.trim(),
      });
      notify(item ? "电影已更新" : "电影已加入片单");
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
      title={item ? "编辑电影" : "添加电影"}
      eyebrow="MOVIE"
      subtitle="把想看的、在看的与看完的收在一处，评分留给自己。"
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
        <Field label="片名" grow>
          <input
            value={draft.title}
            maxLength={128}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例如：海上钢琴师"
            autoFocus
          />
        </Field>
        <Field label="上映年份">
          <input
            type="number"
            min={0}
            max={2100}
            value={draft.year}
            onChange={(event) => setDraft({ ...draft, year: Number(event.target.value) })}
          />
        </Field>
        <Field label="类型">
          <input
            value={draft.genre}
            maxLength={32}
            onChange={(event) => setDraft({ ...draft, genre: event.target.value })}
            placeholder="例如：剧情 / 音乐"
          />
        </Field>
        <Field label="导演">
          <input
            value={draft.director}
            maxLength={64}
            onChange={(event) => setDraft({ ...draft, director: event.target.value })}
            placeholder="例如：朱塞佩·托纳多雷"
          />
        </Field>
        <Field label="评分" hint="0-10 分，0 表示未评分">
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={draft.rating}
            onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}
          />
        </Field>
        <Field label="观看状态">
          <select
            value={draft.status}
            onChange={(event) => setDraft({ ...draft, status: Number(event.target.value) })}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            placeholder="记一句观后感或观影场景…"
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
