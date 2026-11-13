import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal, type Notify } from "../../components/ui";
import {
  deleteAlbumCategory,
  saveAlbumCategory,
  type AlbumCategory,
} from "../../api/album";
import { ALBUM_COLOR } from "./albumFormat";

const COLORS = ["#5F8C93", "#6389A8", "#5F6E9C", "#4C8D78", "#B87758", "#E56F4A"];

/** 管理相册分类：新建、改名改色、删除（照片回到未分类）。 */
export function AlbumCategoryDialog({
  categories,
  onClose,
  onChanged,
  notify,
}: {
  categories: AlbumCategory[];
  onClose: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(ALBUM_COLOR);
  const [editing, setEditing] = useState<{ id: number; name: string; color: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!name.trim()) {
      setError("请填写相册名");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveAlbumCategory({ name: name.trim(), color });
      notify(`已新建相册「${name.trim()}」`);
      setName("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "新建失败");
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      setError("请填写相册名");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveAlbumCategory({ id: editing.id, name: editing.name.trim(), color: editing.color });
      notify("相册已更新，照片会一起换到新名字下");
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: AlbumCategory) => {
    setBusy(true);
    setError("");
    try {
      await deleteAlbumCategory(item.id);
      notify(`相册「${item.name}」已删除，里面的照片回到未分类`);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="相册分类"
      eyebrow="ALBUM"
      subtitle="分类只是给照片分组，删除分类不会删除照片。"
      onClose={onClose}
      wide
      footer={
        <button className="secondary-btn" onClick={onClose}>
          关闭
        </button>
      }
    >
      <div className="form-grid">
        <Field label="新建相册" grow>
          <input
            value={name}
            maxLength={32}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：2026 春天"
          />
        </Field>
        <Field label="颜色">
          <div className="tag-row">
            {COLORS.map((item) => (
              <button
                type="button"
                key={item}
                className={`color-chip ${color.toLowerCase() === item.toLowerCase() ? "active" : ""}`}
                style={{ background: item }}
                title={item}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </Field>
      </div>
      <div className="tag-row album-cat-actions">
        <button className="secondary-btn" disabled={busy} onClick={() => void create()}>
          <Icon name="plus" size={14} />
          新建相册
        </button>
      </div>

      <div className="album-cat-list">
        {categories.map((item) => (
          <div className="album-cat-row" key={item.id}>
            {editing?.id === item.id ? (
              <>
                <input
                  value={editing.name}
                  maxLength={32}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                />
                <div className="tag-row">
                  {COLORS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`color-chip ${editing.color.toLowerCase() === option.toLowerCase() ? "active" : ""}`}
                      style={{ background: option }}
                      onClick={() => setEditing({ ...editing, color: option })}
                    />
                  ))}
                </div>
                <button className="text-btn" disabled={busy} onClick={() => void rename()}>
                  保存
                </button>
                <button className="text-btn" onClick={() => setEditing(null)}>
                  取消
                </button>
              </>
            ) : (
              <>
                <i className="album-dot" style={{ background: item.color }} />
                <b>{item.name}</b>
                <span>{item.count} 张</span>
                <button
                  className="text-btn"
                  onClick={() => setEditing({ id: item.id, name: item.name, color: item.color })}
                >
                  <Icon name="edit" size={13} />
                  编辑
                </button>
                <button className="text-btn danger" disabled={busy} onClick={() => void remove(item)}>
                  <Icon name="trash" size={13} />
                  删除
                </button>
              </>
            )}
          </div>
        ))}
        {!categories.length && <p className="muted-text">还没有相册，先新建一个。</p>}
      </div>

      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
