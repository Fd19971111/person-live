import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { saveMusicTrack, type MusicTrack, type MusicTrackInput } from "../../api/music";

const PLAYLISTS = ["深夜散步", "通勤路上", "周末厨房", "专注工作", "运动"];
const COLORS = ["#9B72D2", "#6389A8", "#D4A63D", "#4C8D78", "#B87758", "#E56F4A"];

/** 新建 / 编辑一条音乐记录，只记录信息，不涉及音频。 */
export function MusicDialog({
  track,
  playlists,
  onClose,
  onSaved,
  notify,
}: {
  track: MusicTrack | null;
  playlists: string[];
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<MusicTrackInput>({
    id: track?.id ?? 0,
    title: track?.title ?? "",
    artist: track?.artist ?? "",
    album: track?.album ?? "",
    playlist: track?.playlist ?? "",
    rating: track?.rating ?? 0,
    note: track?.note ?? "",
    color: track?.color ?? "#9B72D2",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const options = Array.from(new Set([...PLAYLISTS, ...playlists]));

  const submit = async () => {
    if (!draft.title.trim()) {
      setError("请填写歌曲名");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveMusicTrack({
        ...draft,
        title: draft.title.trim(),
        artist: draft.artist.trim(),
        album: draft.album.trim(),
        playlist: draft.playlist.trim(),
        note: draft.note.trim(),
      });
      notify(track ? "记录已更新" : "已记录这首歌");
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
      title={track ? "编辑记录" : "记录一首歌"}
      eyebrow="MUSIC"
      subtitle="只记录歌曲信息与当时的心情，不存储音频、不提供播放。"
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
        <Field label="歌曲名" grow>
          <input
            value={draft.title}
            maxLength={128}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例如：Garden Song"
            autoFocus
          />
        </Field>
        <Field label="演唱者">
          <input
            value={draft.artist}
            maxLength={64}
            onChange={(event) => setDraft({ ...draft, artist: event.target.value })}
            placeholder="例如：Phoebe Bridgers"
          />
        </Field>
        <Field label="专辑 / 来源">
          <input
            value={draft.album}
            maxLength={128}
            onChange={(event) => setDraft({ ...draft, album: event.target.value })}
            placeholder="例如：Punisher"
          />
        </Field>
        <Field label="歌单" hint="可直接输入新歌单">
          <input
            list="music-playlists"
            value={draft.playlist}
            maxLength={32}
            onChange={(event) => setDraft({ ...draft, playlist: event.target.value })}
            placeholder="例如：深夜散步"
          />
          <datalist id="music-playlists">
            {options.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
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
            rows={3}
            value={draft.note}
            maxLength={500}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="记一句听这首歌时的场景或心情…"
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
