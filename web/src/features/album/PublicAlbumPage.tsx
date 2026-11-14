import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { fetchSharedAlbum, type AlbumPhoto, type SharedAlbum } from "../../api/album";

/**
 * 免登录的只读相册页。
 * 只凭 URL 里的签名令牌取数，不加载账号态，因此不会触发登录跳转。
 */
export default function PublicAlbumPage({ token }: { token: string }) {
  const [data, setData] = useState<SharedAlbum | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<AlbumPhoto | null>(null);

  // 分享页不受工作台的固定最小宽度约束，手机上才能自然铺满。
  useEffect(() => {
    document.documentElement.classList.add("public-share-open");
    return () => document.documentElement.classList.remove("public-share-open");
  }, []);

  useEffect(() => {
    let active = true;
    fetchSharedAlbum(token)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "这个分享链接已经失效了");
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  return (
    <div className="public-share">
      <header className="public-share-head">
        <div className="eyebrow">SHARED ALBUM · 只读分享</div>
        <h1>{data?.category || `${data?.owner || "朋友"}的相册`}</h1>
        {data && (
          <p>
            {data.total} 张照片 · {data.sizeText} · 链接有效期至 {data.expireAt}
          </p>
        )}
      </header>

      {error && (
        <div className="public-share-empty">
          <Icon name="image" size={26} />
          <p>{error}</p>
        </div>
      )}

      {!error && !data && <p className="muted-text">正在读取相册…</p>}

      {data && !data.photos.length && (
        <div className="public-share-empty">
          <Icon name="image" size={26} />
          <p>这个相册里还没有照片。</p>
        </div>
      )}

      {data && !!data.photos.length && (
        <div className="photo-grid">
          {data.photos.map((photo) => (
            <button className="photo-card" key={photo.id} onClick={() => setPreview(photo)}>
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

      <footer className="public-share-foot">由「生活集」分享</footer>

      {preview && (
        <div className="public-share-viewer" onClick={() => setPreview(null)}>
          <img src={preview.url} alt={preview.name || "照片"} />
          <div className="public-share-viewer-meta">
            <b>{preview.name || "未命名照片"}</b>
            {preview.note && <span>{preview.note}</span>}
          </div>
          <button className="icon-btn" aria-label="关闭" onClick={() => setPreview(null)}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
