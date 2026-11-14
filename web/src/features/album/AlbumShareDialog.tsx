import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal } from "../../components/ui";
import { createAlbumShare } from "../../api/album";
import { ALBUM_COLOR } from "./albumFormat";

/**
 * 生成只读分享链接。
 * 链接里只有签名令牌，没有账号信息；打开的人看不到该用户的其它相册。
 */
export function AlbumShareDialog({ category, onClose }: { category: string; onClose: () => void }) {
  const [link, setLink] = useState("");
  const [expireAt, setExpireAt] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    createAlbumShare(category)
      .then((result) => {
        if (!active) return;
        setExpireAt(result.expiresAt);
        setLink(`${window.location.origin}${window.location.pathname}#/s?t=${result.token}`);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "生成分享链接失败");
      });
    return () => {
      active = false;
    };
  }, [category]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("浏览器不允许自动复制，请手动选中链接");
    }
  };

  return (
    <Modal
      title={category ? `分享「${category}」` : "分享整个相册"}
      eyebrow="ALBUM · SHARE"
      subtitle="拿到链接的人无需登录即可浏览这组照片，链接到期自动失效。"
      onClose={onClose}
      footer={
        <>
          <button className="secondary-btn" onClick={onClose}>
            关闭
          </button>
          <button
            className="primary-btn"
            style={{ background: ALBUM_COLOR, borderColor: ALBUM_COLOR }}
            disabled={!link}
            onClick={() => void copy()}
          >
            <Icon name="share" size={15} />
            {copied ? "已复制" : "复制链接"}
          </button>
        </>
      }
    >
      {error && <div className="form-error">{error}</div>}

      {!link && !error && <p className="muted-text">正在生成链接…</p>}

      {link && (
        <>
          <div className="form-grid">
            <Field label="分享链接" grow>
              <input readOnly value={link} onFocus={(event) => event.currentTarget.select()} />
            </Field>
          </div>
          <p className="muted-text">
            {category ? `只包含「${category}」里的照片。` : "包含全部相册照片。"}
            有效期至 {expireAt}，过期后重新生成即可。
          </p>
        </>
      )}
    </Modal>
  );
}
