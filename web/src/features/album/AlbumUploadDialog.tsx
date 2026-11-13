import { useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal, type Notify } from "../../components/ui";
import { uploadAlbumPhoto } from "../../api/album";
import { MAX_PHOTO_BYTES, fileSizeText } from "./albumFormat";

/** 选择并上传照片，支持一次多张；大文件会先被拦下。 */
export function AlbumUploadDialog({
  categories,
  defaultCategory,
  onClose,
  onUploaded,
  notify,
}: {
  categories: string[];
  defaultCategory: string;
  onClose: () => void;
  onUploaded: () => void;
  notify: Notify;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(defaultCategory);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, size: file.size, url: URL.createObjectURL(file) })),
    [files],
  );

  // 预览图用对象 URL，换一批时主动释放上一批，避免反复选择累积内存。
  const release = () => {
    previews.forEach((item) => URL.revokeObjectURL(item.url));
  };

  const close = () => {
    release();
    onClose();
  };

  const pick = (picked: File[]) => {
    if (!picked.length) return;
    release();
    const allowed = picked.filter((file) => file.size <= MAX_PHOTO_BYTES);
    const tooLarge = picked.find((file) => file.size > MAX_PHOTO_BYTES);
    if (tooLarge) {
      setError(`「${tooLarge.name}」超过 ${fileSizeText(MAX_PHOTO_BYTES)}，已跳过`);
      setFiles(allowed);
      return;
    }
    setError("");
    setFiles(allowed);
  };

  const submit = async () => {
    if (!files.length) {
      setError("请选择要上传的照片");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      for (const file of files) {
        await uploadAlbumPhoto(file, category.trim(), note.trim());
        setProgress((value) => value + 1);
      }
      notify(files.length > 1 ? `已上传 ${files.length} 张照片` : "照片已上传");
      onUploaded();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
      onUploaded();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="上传照片"
      eyebrow="ALBUM"
      subtitle="照片会保存到项目目录下的 storage/album，按用户在库中建立索引。"
      onClose={close}
      wide
      footer={
        <>
          <button className="secondary-btn" onClick={close}>
            取消
          </button>
          <button className="primary-btn" disabled={busy} onClick={() => void submit()}>
            {busy ? `上传中 ${progress}/${files.length}…` : "开始上传"}
          </button>
        </>
      }
    >
      <label className="album-drop">
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={busy}
          onChange={(event) => pick(Array.from(event.target.files ?? []))}
        />
        <Icon name="upload" size={22} />
        <b>点击选择照片</b>
        <span>支持 jpg、png、gif、webp、bmp，单张不超过 {fileSizeText(MAX_PHOTO_BYTES)}</span>
      </label>

      {previews.length > 0 && (
        <div className="album-picks">
          {previews.map((item) => (
            <figure key={item.url}>
              <img src={item.url} alt={item.name} />
              <figcaption title={item.name}>{fileSizeText(item.size)}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="form-grid">
        <Field label="相册" hint="留空表示未分类，输入新名字会自动创建相册">
          <input
            list="album-categories"
            value={category}
            maxLength={32}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="例如：日常、旅行、家人"
          />
          <datalist id="album-categories">
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
            placeholder="这批照片的场合或心情…"
          />
        </Field>
      </div>

      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
