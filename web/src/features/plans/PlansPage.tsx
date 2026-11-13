import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Modal, ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import { deletePlanTask, fetchPlanBoard, movePlanTask } from "../../api/plan";
import type { PlanBoard as PlanBoardData, PlanTask } from "../../api/plan";
import { PlanProgress } from "./PlanProgress";
import { PlanBoard } from "./PlanBoard";
import { PlanTimeline } from "./PlanTimeline";
import { PlanTaskDialog } from "./PlanTaskDialog";
import { PlanCategoryDialog } from "./PlanCategoryDialog";
import { addDays, todayDate } from "./planDate";

type PlanDialog =
  | { kind: "task"; task?: PlanTask; status?: number; dueDate?: string }
  | { kind: "categories" }
  | { kind: "confirm"; title: string; message: string; onConfirm: () => Promise<void> }
  | null;

export default function PlansPage() {
  const [view, setView] = useState<"kanban" | "timeline">("kanban");
  const [week, setWeek] = useState("");
  const [board, setBoard] = useState<PlanBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [dialog, setDialog] = useState<PlanDialog>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

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
    fetchPlanBoard(week)
      .then((data) => {
        if (active) setBoard(data);
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
  }, [week, reload]);

  const shiftWeek = (days: number) => {
    setWeek(board ? addDays(board.week.start, days) : addDays(todayDate(), days));
  };

  const move = async (task: PlanTask, status: number) => {
    if (task.status === status) return;
    try {
      await movePlanTask(task.id, status);
      refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : "移动失败", "err");
    }
  };

  const askDelete = (task: PlanTask) => {
    setDialog({
      kind: "confirm",
      title: "删除这个计划？",
      message: `「${task.title}」会被隐藏，不再出现在看板与时间轴中。`,
      onConfirm: async () => {
        await deletePlanTask(task.id);
        notify("计划已删除");
        refresh();
      },
    });
  };

  const runConfirm = async () => {
    if (dialog?.kind !== "confirm") return;
    setConfirmBusy(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (err) {
      notify(err instanceof Error ? err.message : "操作失败", "err");
    } finally {
      setConfirmBusy(false);
    }
  };

  const menuItems: MenuItem[] = [
    { label: "分类管理", icon: "layout", onClick: () => setDialog({ kind: "categories" }) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  const rate = board ? board.summary.rate : 0;

  return (
    <div className="page">
      <ModuleShell
        title="计划"
        subtitle="把想做的事，放进看得见的时间里。"
        color="#4C8D78"
        status={`本周完成率 ${rate}%`}
        menu={menuItems}
        actions={
          <>
            <div className="segmented">
              <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>
                看板
              </button>
              <button className={view === "timeline" ? "active" : ""} onClick={() => setView("timeline")}>
                时间轴
              </button>
            </div>
            <button className="primary-btn green" onClick={() => setDialog({ kind: "task", status: 1 })}>
              <Icon name="plus" size={16} />
              新计划
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

        {board && <PlanProgress week={board.week} summary={board.summary} onPrev={() => shiftWeek(-7)} onNext={() => shiftWeek(7)} />}

        {!board && loading && <p className="plan-empty">正在读取计划…</p>}

        {board && view === "kanban" && (
          <PlanBoard
            columns={board.columns}
            onMove={(task, status) => void move(task, status)}
            onEdit={(task) => setDialog({ kind: "task", task })}
            onDelete={askDelete}
            onCreate={(status) => setDialog({ kind: "task", status })}
          />
        )}

        {board && view === "timeline" && (
          <PlanTimeline
            days={board.timeline}
            onEdit={(task) => setDialog({ kind: "task", task })}
            onCreate={(dueDate) => setDialog({ kind: "task", status: 1, dueDate })}
          />
        )}
      </ModuleShell>

      {dialog?.kind === "task" && (
        <PlanTaskDialog
          task={dialog.task ?? null}
          defaultStatus={dialog.status ?? 1}
          defaultDueDate={dialog.dueDate}
          categories={board?.categories ?? []}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          onManageCategories={() => setDialog({ kind: "categories" })}
          notify={notify}
        />
      )}

      {dialog?.kind === "categories" && (
        <PlanCategoryDialog
          categories={board?.categories ?? []}
          onClose={() => setDialog(null)}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "confirm" && (
        <Modal
          title={dialog.title}
          eyebrow="CONFIRM"
          onClose={() => setDialog(null)}
          footer={
            <>
              <button className="secondary-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button className="primary-btn danger-solid" disabled={confirmBusy} onClick={() => void runConfirm()}>
                {confirmBusy ? "处理中…" : "确认删除"}
              </button>
            </>
          }
        >
          <p className="confirm-text">{dialog.message}</p>
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}
