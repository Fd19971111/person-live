import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import {
  deleteInspirationItem,
  fetchInspirationOverview,
  pinInspirationItem,
  type InspirationItem,
  type InspirationOverview,
} from "../../api/inspiration";
import { InspirationStats } from "./InspirationStats";
import { InspirationGrid } from "./InspirationGrid";
import { InspirationItemDialog } from "./InspirationItemDialog";

export default function InspirationPage() {
  const [data, setData] = useState<InspirationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [tag, setTag] = useState("");
  const [keyword, setKeyword] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [dialog, setDialog] = useState<{ item?: InspirationItem } | null>(null);
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
    fetchInspirationOverview()
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
    const key = keyword.trim().toLowerCase();
    return list.filter((item) => {
      if (pinnedOnly && !item.pinned) return false;
      if (tag && item.tag !== tag) return false;
      if (!key) return true;
      return (
        item.title.toLowerCase().includes(key) ||
        item.content.toLowerCase().includes(key) ||
        item.tag.toLowerCase().includes(key)
      );
    });
  }, [data, keyword, pinnedOnly, tag]);

  const togglePin = async (item: InspirationItem) => {
    try {
      await pinInspirationItem(item.id, !item.pinned);
      notify(item.pinned ? "已取消置顶" : "已置顶");
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "操作失败", "err");
    }
  };

  const remove = async (item: InspirationItem) => {
    try {
      await deleteInspirationItem(item.id);
      notify(`「${item.title}」已移除`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "记一条灵感", icon: "plus", onClick: () => setDialog({}) },
    { label: pinnedOnly ? "显示全部灵感" : "只看置顶", icon: "pin", onClick: () => setPinnedOnly((value) => !value) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="灵感收藏"
        subtitle="把闪念收进口袋，等它慢慢长大。"
        color="#9B72D2"
        status={data ? `共 ${data.total} 条 · ${data.tagTotal} 个标签` : "灵感数据同步中"}
        menu={menuItems}
        actions={
          <>
            <button className="secondary-btn" onClick={() => setPinnedOnly((value) => !value)}>
              <Icon name="pin" size={16} />
              {pinnedOnly ? "显示全部" : "只看置顶"}
            </button>
            <button className="primary-btn purple" onClick={() => setDialog({})}>
              <Icon name="plus" size={16} />
              记一条灵感
            </button>
          </>
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

        {!data && loading && <p className="muted-text">正在读取灵感…</p>}

        {data && <InspirationStats overview={data} activeTag={tag} onTag={setTag} />}

        <div className="section-title">
          <h3>灵感墙</h3>
          <div className="inspiration-toolbar">
            {(tag || keyword || pinnedOnly) && (
              <button
                className="text-btn"
                onClick={() => {
                  setTag("");
                  setKeyword("");
                  setPinnedOnly(false);
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
                placeholder="搜索标题、正文或标签"
              />
            </label>
          </div>
        </div>

        {data && (
          <InspirationGrid
            items={items}
            onEdit={(item) => setDialog({ item })}
            onPin={(item) => void togglePin(item)}
            onDelete={(item) => void remove(item)}
          />
        )}
      </ModuleShell>

      {dialog && (
        <InspirationItemDialog item={dialog.item ?? null} onClose={() => setDialog(null)} onSaved={refresh} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
