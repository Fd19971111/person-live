import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import { fetchAlbumOverview, type AlbumOverview, type AlbumPhoto } from "../../api/album";
import { AlbumUploadDialog } from "./AlbumUploadDialog";
import { AlbumPhotoDialog } from "./AlbumPhotoDialog";
import { AlbumCategoryDialog } from "./AlbumCategoryDialog";
import { AlbumShareDialog } from "./AlbumShareDialog";
import { ALBUM_COLOR } from "./albumFormat";

type AlbumDialog =
  | { kind: "upload" }
  | { kind: "photo"; photo: AlbumPhoto }
  | { kind: "categories" }
  | { kind: "share" }
  | null;

/** filter 为 null 表示全部，空字符串表示未分类。 */
type CategoryFilter = string | null;

export default function AlbumPage() {
  const [data, setData] = useState<AlbumOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState<CategoryFilter>(null);
  const [dialog, setDialog] = useState<AlbumDialog>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const notify = (text: string, tone: "ok" | "err" = "ok") => setToast({ text, tone });
  const refresh = () => setReload((value) => value + 1);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchAlbumOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "读取失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const photos = useMemo(() => {
    const list = data?.photos ?? [];
    if (filter === null) return list;
    return list.filter((photo) => photo.category === filter);
  }, [data, filter]);

  const uncategorized = useMemo(() => (data?.photos ?? []).filter((photo) => !photo.category).length, [data]);

  const menuItems: MenuItem[] = [
    { label: "上传照片", icon: "upload", onClick: () => setDialog({ kind: "upload" }) },
    {
      label: filter ? `分享「${filter}」` : "分享整个相册",
      icon: "share",
      onClick: () => setDialog({ kind: "share" }),
    },
    { label: "相册分类", icon: "layout", onClick: () => setDialog({ kind: "categories" }) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="相册"
        subtitle="把喜欢的照片放进自己的相册，按时间与场景归类，文件保存在本地目录。"
        color={ALBUM_COLOR}
        status={data ? `${data.total} 张照片 · 占用 ${data.sizeText}` : "相册数据同步中"}
        menu={menuItems}
        actions={
          <button className="primary-btn" style={{ background: ALBUM_COLOR, borderColor: ALBUM_COLOR }} onClick={() => setDialog({ kind: "upload" })}>
            <Icon name="upload" size={16} />
            上传照片
          </button>
        }
      >
        {error && (
          <div className="finance-error">
            <span>读取失败：{error}</span>
            <button className="text-btn" onClick={refresh}>
              重试
            </button>
          </div>
        )}

        {!data && loading && <p className="muted-text">正在读取相册…</p>}

        {data && (
          <>
            <div className="album-summary">
              <div>
                <span>照片总数</span>
                <strong>{data.total}</strong>
              </div>
              <div>
                <span>相册分类</span>
                <strong>{data.categories.length}</strong>
              </div>
              <div>
                <span>占用空间</span>
                <strong>{data.sizeText}</strong>
              </div>
            </div>

            <div className="tag-row album-filter">
              <button className={`tag-chip ${filter === null ? "active" : ""}`} onClick={() => setFilter(null)}>
                全部
                <b>{data.total}</b>
              </button>
              {data.categories.map((item) => (
                <button
                  key={item.name}
                  className={`tag-chip ${filter === item.name ? "active" : ""}`}
                  onClick={() => setFilter(item.name)}
                >
                  <i className="album-dot" style={{ background: item.color }} />
                  {item.name}
                  <b>{item.count}</b>
                </button>
              ))}
              {uncategorized > 0 && (
                <button className={`tag-chip ${filter === "" ? "active" : ""}`} onClick={() => setFilter("")}>
                  未分类
                  <b>{uncategorized}</b>
                </button>
              )}
            </div>

            {!photos.length ? (
              <div className="album-empty">
                <Icon name="image" size={26} />
                <p>{filter === null ? "还没有照片，先上传一张吧。" : "这个相册里还没有照片。"}</p>
                <button className="text-btn" onClick={() => setDialog({ kind: "upload" })}>
                  上传照片
                </button>
              </div>
            ) : (
              <div className="photo-grid">
                {photos.map((photo) => (
                  <button className="photo-card" key={photo.id} onClick={() => setDialog({ kind: "photo", photo })}>
                    <img src={photo.url} alt={photo.name || "照片"} loading="lazy" />
                    {photo.category && <span className="album-tag">{photo.category}</span>}
                    <div className="album-meta">
                      <b>{photo.name || "未命名照片"}</b>
                      <small>
                        {photo.date} · {photo.sizeText}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </ModuleShell>

      {dialog?.kind === "upload" && (
        <AlbumUploadDialog
          categories={(data?.categories ?? []).map((item) => item.name)}
          defaultCategory={filter ?? ""}
          onClose={() => setDialog(null)}
          onUploaded={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "photo" && (
        <AlbumPhotoDialog
          photo={dialog.photo}
          categories={(data?.categories ?? []).map((item) => item.name)}
          onClose={() => setDialog(null)}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "categories" && (
        <AlbumCategoryDialog
          categories={data?.categories ?? []}
          onClose={() => setDialog(null)}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "share" && (
        <AlbumShareDialog category={filter ?? ""} onClose={() => setDialog(null)} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
