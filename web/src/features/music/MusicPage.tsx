import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import {
  deleteMusicTrack,
  fetchMusicOverview,
  type MusicOverview,
  type MusicTrack,
} from "../../api/music";
import { MusicStats } from "./MusicStats";
import { MusicList } from "./MusicList";
import { MusicDialog } from "./MusicDialog";

export default function MusicPage() {
  const [data, setData] = useState<MusicOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [playlist, setPlaylist] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dialog, setDialog] = useState<{ track?: MusicTrack } | null>(null);
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
    fetchMusicOverview()
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

  const tracks = useMemo(() => {
    const list = data?.items ?? [];
    const key = keyword.trim().toLowerCase();
    return list.filter((track) => {
      if (playlist && track.playlist !== playlist) return false;
      if (!key) return true;
      return (
        track.title.toLowerCase().includes(key) ||
        track.artist.toLowerCase().includes(key) ||
        track.album.toLowerCase().includes(key) ||
        track.note.toLowerCase().includes(key)
      );
    });
  }, [data, keyword, playlist]);

  const remove = async (track: MusicTrack) => {
    try {
      await deleteMusicTrack(track.id);
      notify(`「${track.title}」记录已删除`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "记录一首歌", icon: "plus", onClick: () => setDialog({}) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="音乐记录"
        subtitle="记下喜欢的歌与听它时的场景，不收集音频、也不提供播放。"
        color="#9B72D2"
        status={data ? `已记录 ${data.total} 首 · ${data.playlistCount} 个歌单` : "音乐记录同步中"}
        menu={menuItems}
        actions={
          <button className="primary-btn purple" onClick={() => setDialog({})}>
            <Icon name="plus" size={16} />
            记录一首歌
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

        {!data && loading && <p className="muted-text">正在读取音乐记录…</p>}

        {data && <MusicStats overview={data} />}

        <div className="section-title">
          <h3>曲目记录</h3>
          <div className="inspiration-toolbar">
            {(playlist || keyword) && (
              <button
                className="text-btn"
                onClick={() => {
                  setPlaylist("");
                  setKeyword("");
                }}
              >
                <Icon name="close" size={13} />
                清除筛选
              </button>
            )}
            <label className="inspiration-search">
              <Icon name="search" size={15} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索歌曲、演唱者或备注"
              />
            </label>
          </div>
        </div>

        <div className="tag-row music-filter">
          <button className={`tag-chip ${playlist === "" ? "active" : ""}`} onClick={() => setPlaylist("")}>
            全部
            <b>{data?.total ?? 0}</b>
          </button>
          {(data?.playlists ?? []).map((entry) => (
            <button
              key={entry.name}
              className={`tag-chip ${playlist === entry.name ? "active" : ""}`}
              onClick={() => setPlaylist(entry.name)}
            >
              {entry.name}
              <b>{entry.count}</b>
            </button>
          ))}
        </div>

        {data && (
          <MusicList
            tracks={tracks}
            onEdit={(track) => setDialog({ track })}
            onDelete={(track) => void remove(track)}
          />
        )}
      </ModuleShell>

      {dialog && (
        <MusicDialog
          track={dialog.track ?? null}
          playlists={(data?.playlists ?? []).map((entry) => entry.name)}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          notify={notify}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
