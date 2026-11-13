import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { ModuleShell, Toast, type MenuItem, type ToastState } from "../../components/ui";
import { fetchStudyOverview, type StudyCourse, type StudyNote, type StudyOverview } from "../../api/study";
import { StudySummary } from "./StudySummary";
import { StudyHeatmap } from "./StudyHeatmap";
import { StudyCourses } from "./StudyCourses";
import { StudyNotes } from "./StudyNotes";
import { StudySessionsDialog } from "./StudySessionsDialog";
import { StudyCourseListDialog } from "./StudyCourseListDialog";
import { StudyCourseDialog } from "./StudyCourseDialog";
import { StudyNotesDialog } from "./StudyNotesDialog";
import { StudyNoteDialog } from "./StudyNoteDialog";
import { StudyGoalDialog } from "./StudyGoalDialog";

type StudyDialog =
  | { kind: "sessions" }
  | { kind: "courses" }
  | { kind: "course"; course?: StudyCourse }
  | { kind: "notes" }
  | { kind: "note"; note?: StudyNote }
  | { kind: "goal" }
  | null;

export default function LearningPage() {
  const [data, setData] = useState<StudyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [dialog, setDialog] = useState<StudyDialog>(null);
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
    fetchStudyOverview()
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

  const todayMinutes = data?.heatmap.length ? data.heatmap[data.heatmap.length - 1].minutes : 0;

  const menuItems: MenuItem[] = [
    { label: "学习记录", icon: "clock", onClick: () => setDialog({ kind: "sessions" }) },
    { label: "课程管理", icon: "book", onClick: () => setDialog({ kind: "courses" }) },
    { label: "笔记管理", icon: "layout", onClick: () => setDialog({ kind: "notes" }) },
    { label: "周目标", icon: "trend", onClick: () => setDialog({ kind: "goal" }) },
    { label: "刷新数据", icon: "refresh", onClick: refresh },
  ];

  return (
    <div className="page">
      <ModuleShell
        title="学习"
        subtitle="让每一点投入，都留下清晰的成长轨迹。"
        color="#5F6E9C"
        status={data ? `今日已学习 ${todayMinutes} 分钟 · 连续 ${data.streakDays} 天` : "学习数据同步中"}
        menu={menuItems}
        actions={
          <>
            <button className="secondary-btn" onClick={() => setDialog({ kind: "sessions" })}>
              <Icon name="calendar" size={16} />
              学习记录
            </button>
            <button className="primary-btn indigo" onClick={() => setDialog({ kind: "note" })}>
              <Icon name="plus" size={16} />
              新建笔记
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

        {!data && loading && <p className="muted-text">正在读取学习数据…</p>}

        {data && <StudySummary overview={data} onEditGoal={() => setDialog({ kind: "goal" })} />}

        <div className="detail-grid learn-grid">
          {data && <StudyHeatmap heatmap={data.heatmap} />}
          {data && (
            <StudyCourses
              courses={data.courses}
              onManage={() => setDialog({ kind: "courses" })}
              onCreate={() => setDialog({ kind: "course" })}
              onEdit={(course) => setDialog({ kind: "course", course })}
            />
          )}
        </div>

        <div className="section-title">
          <h3>最近笔记</h3>
          <button className="text-btn" onClick={() => setDialog({ kind: "notes" })}>
            查看全部 <Icon name="arrow" size={14} />
          </button>
        </div>
        {data && <StudyNotes notes={data.notes} onOpen={(note) => setDialog({ kind: "note", note })} />}
      </ModuleShell>

      {dialog?.kind === "sessions" && (
        <StudySessionsDialog
          courses={data?.courses ?? []}
          onClose={() => setDialog(null)}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "courses" && (
        <StudyCourseListDialog
          courses={data?.courses ?? []}
          onClose={() => setDialog(null)}
          onCreate={() => setDialog({ kind: "course" })}
          onEdit={(course) => setDialog({ kind: "course", course })}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "course" && (
        <StudyCourseDialog
          course={dialog.course ?? null}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "notes" && (
        <StudyNotesDialog
          onClose={() => setDialog(null)}
          onEdit={(note) => setDialog({ kind: "note", note })}
          onCreate={() => setDialog({ kind: "note" })}
          onChanged={refresh}
          notify={notify}
        />
      )}

      {dialog?.kind === "note" && (
        <StudyNoteDialog note={dialog.note ?? null} onClose={() => setDialog(null)} onSaved={refresh} notify={notify} />
      )}

      {dialog?.kind === "goal" && data && (
        <StudyGoalDialog
          weeklyGoalMinutes={data.weekGoalMinutes}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          notify={notify}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
