import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import {
  deleteMovieItem,
  fetchMoviesOverview,
  MOVIE_STATUS,
  setMovieStatus,
  type MovieItem,
  type MoviesOverview,
} from "../../api/movies";
import { MovieStats } from "./MovieStats";
import { MovieGrid } from "./MovieGrid";
import { MovieDialog } from "./MovieDialog";

export default function MoviesPage() {
  const [data, setData] = useState<MoviesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [status, setStatus] = useState(0);
  const [dialog, setDialog] = useState<{ item?: MovieItem } | null>(null);
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
    fetchMoviesOverview()
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

  const items = useMemo(() => {
    const list = data?.items ?? [];
    return status === 0 ? list : list.filter((item) => item.status === status);
  }, [data, status]);

  const advance = async (item: MovieItem) => {
    const next =
      item.status === MOVIE_STATUS.want
        ? MOVIE_STATUS.watching
        : item.status === MOVIE_STATUS.watching
          ? MOVIE_STATUS.watched
          : MOVIE_STATUS.want;
    try {
      await setMovieStatus(item.id, next);
      notify(`「${item.title}」已切换状态`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "操作失败", "err");
    }
  };

  const remove = async (item: MovieItem) => {
    try {
      await deleteMovieItem(item.id);
      notify(`「${item.title}」已移除`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "添加电影", icon: "plus", onClick: () => setDialog({}) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="电影清单"
        subtitle="想看的、在看的与看完的，都在这一张片单里。"
        color="#6389A8"
        status={data ? `共 ${data.total} 部 · 已看完 ${data.watchedCount} 部` : "片单同步中"}
        menu={menuItems}
        actions={
          <button className="primary-btn purple" onClick={() => setDialog({})}>
            <Icon name="plus" size={16} />
            添加电影
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

        {!data && loading && <p className="muted-text">正在读取片单…</p>}

        {data && <MovieStats overview={data} />}

        <div className="section-title">
          <h3>片单</h3>
          <div className="tag-row">
            <button className={`tag-chip ${status === 0 ? "active" : ""}`} onClick={() => setStatus(0)}>
              全部
              <b>{data?.total ?? 0}</b>
            </button>
            {(data?.statuses ?? []).map((entry) => (
              <button
                key={entry.status}
                className={`tag-chip ${status === entry.status ? "active" : ""}`}
                onClick={() => setStatus(entry.status)}
              >
                {entry.name}
                <b>{entry.count}</b>
              </button>
            ))}
          </div>
        </div>

        {data && (
          <MovieGrid
            items={items}
            onEdit={(item) => setDialog({ item })}
            onDelete={(item) => void remove(item)}
            onAdvance={(item) => void advance(item)}
          />
        )}
      </ModuleShell>

      {dialog && (
        <MovieDialog item={dialog.item ?? null} onClose={() => setDialog(null)} onSaved={refresh} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
