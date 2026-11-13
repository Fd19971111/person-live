import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import {
  deleteTravelTrip,
  fetchTravelOverview,
  type TravelOverview,
  type TravelTrip,
} from "../../api/travel";
import { TravelStats } from "./TravelStats";
import { TravelTimeline } from "./TravelTimeline";
import { TravelDialog } from "./TravelDialog";

export default function TravelPage() {
  const [data, setData] = useState<TravelOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [dialog, setDialog] = useState<{ trip?: TravelTrip } | null>(null);
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
    fetchTravelOverview()
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

  const remove = async (trip: TravelTrip) => {
    try {
      await deleteTravelTrip(trip.id);
      notify(`「${trip.title}」已移除`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "记录一次旅行", icon: "plus", onClick: () => setDialog({}) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="旅行足迹"
        subtitle="去过的地方，会慢慢连成自己的地图。"
        color="#B87758"
        status={data ? `去过 ${data.placeCount} 个地方 · 累计 ${data.totalDays} 天` : "足迹同步中"}
        menu={menuItems}
        actions={
          <button className="primary-btn purple" onClick={() => setDialog({})}>
            <Icon name="plus" size={16} />
            记录一次旅行
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

        {!data && loading && <p className="muted-text">正在读取足迹…</p>}

        {data && <TravelStats overview={data} />}

        <div className="section-title">
          <h3>时间线</h3>
          {data && <span className="muted">按出发日期倒序</span>}
        </div>

        {data && (
          <TravelTimeline
            trips={data.items}
            onEdit={(trip) => setDialog({ trip })}
            onDelete={(trip) => void remove(trip)}
          />
        )}
      </ModuleShell>

      {dialog && (
        <TravelDialog trip={dialog.trip ?? null} onClose={() => setDialog(null)} onSaved={refresh} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
