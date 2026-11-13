import type { PlanBoardSummary, PlanWeek } from "../../api/plan";

/** 本周进度条与周切换。 */
export function PlanProgress({
  week,
  summary,
  onPrev,
  onNext,
}: {
  week: PlanWeek;
  summary: PlanBoardSummary;
  onPrev: () => void;
  onNext: () => void;
}) {
  const percent = summary.total > 0 ? Math.min(100, Math.round((summary.done / summary.total) * 100)) : 0;
  return (
    <div className="plan-summary">
      <div>
        <span>本周进度</span>
        <b>
          {summary.done} / {summary.total}
        </b>
      </div>
      <div className="summary-track">
        <i style={{ width: `${percent}%` }} />
      </div>
      <div className="avatars">
        <i>LM</i>
        <span>只属于你的空间</span>
      </div>
      <div className="week-nav">
        <button onClick={onPrev} aria-label="上一周">
          ‹
        </button>
        <b>{week.label}</b>
        <button onClick={onNext} aria-label="下一周">
          ›
        </button>
      </div>
    </div>
  );
}
