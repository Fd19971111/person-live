import { useState } from "react";
import { Field, Modal, type Notify } from "../../components/ui";
import { deleteAlbumPhoto, saveAlbumPhoto, type AlbumPhoto } from "../../api/album";

/** 单张照片的大图预览，可改相册与备注，也可直接删除。 */
export function AlbumPhotoDialog({
  photo,
  categories,
  onClose,
  onChanged,
  notify,
}: {
  photo: AlbumPhoto;
  categories: string[];
  onClose: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const [category, setCategory] = useState(photo.category);
  const [note, setNote] = useState(photo.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await saveAlbumPhoto({ id: photo.id, category: category.trim(), note: note.trim() });
      notify("照片信息已更新");
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteAlbumPhoto(photo.id);
      notify("照片已删除");
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
      setBusy(false);
    }
  };

  return (
    <Modal
      title={photo.name || "照片"}
      eyebrow="ALBUM"
      subtitle={`${photo.date} · ${photo.sizeText}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="text-btn danger" disabled={busy} onClick={() => (confirming ? void remove() : setConfirming(true))}>
            {confirming ? "确认删除" : "删除照片"}
          </button>
          <span style={{ flex: 1 }} />
          <button className="secondary-btn" onClick={onClose}>
            取消
          </button>
          <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
            {busy ? "保存中…" : "保存"}
          </button>
        </>
      }
    >
      <div className="album-viewer">
        <img src={photo.url} alt={photo.name || "照片"} />
        {photo.note && <p>{photo.note}</p>}
      </div>

      <div className="form-grid">
        <Field label="相册" hint="留空表示未分类">
          <input
            list="album-photo-categories"
            value={category}
            maxLength={32}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="例如：日常、旅行"
          />
          <datalist id="album-photo-categories">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>
        <Field label="备注" grow>
          <input
            value={note}
            maxLength={255}
            onChange={(event) => setNote(event.target.value)}
            placeholder="给这张照片写一句话…"
          />
        </Field>
      </div>

      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
