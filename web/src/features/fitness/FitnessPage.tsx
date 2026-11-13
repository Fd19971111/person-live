import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import {
  deleteFitnessRecord,
  fetchFitnessOverview,
  type FitnessOverview,
  type FitnessRecord,
} from "../../api/fitness";
import { FitnessStats } from "./FitnessStats";
import { FitnessHeatmap } from "./FitnessHeatmap";
import { FitnessList } from "./FitnessList";
import { FitnessDialog } from "./FitnessDialog";

export default function FitnessPage() {
  const [data, setData] = useState<FitnessOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [dialog, setDialog] = useState<{ record?: FitnessRecord } | null>(null);
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
    fetchFitnessOverview()
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

  const remove = async (record: FitnessRecord) => {
    try {
      await deleteFitnessRecord(record.id);
      notify(`「${record.activity}」记录已删除`);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  const menuItems: MenuItem[] = [
    { label: "记录运动", icon: "plus", onClick: () => setDialog({}) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="运动记录"
        subtitle="每一次出汗都算数，数据会替你记住。"
        color="#5C927A"
        status={data ? `本周 ${data.weekMinutes} 分钟 · 连续 ${data.streakDays} 天` : "运动数据同步中"}
        menu={menuItems}
        actions={
          <button className="primary-btn purple" onClick={() => setDialog({})}>
            <Icon name="plus" size={16} />
            记录运动
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

        {!data && loading && <p className="muted-text">正在读取运动数据…</p>}

        {data && <FitnessStats overview={data} />}

        {data && (
          <div className="fitness-block">
            <FitnessHeatmap heatmap={data.heatmap} />
          </div>
        )}

        <div className="section-title">
          <h3>最近记录</h3>
          {data && <span className="muted">共 {data.total} 条</span>}
        </div>

        {data && (
          <FitnessList
            records={data.items}
            onEdit={(record) => setDialog({ record })}
            onDelete={(record) => void remove(record)}
          />
        )}
      </ModuleShell>

      {dialog && (
        <FitnessDialog
          record={dialog.record ?? null}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          notify={notify}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
