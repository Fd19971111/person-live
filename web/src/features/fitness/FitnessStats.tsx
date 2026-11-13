import { Panel } from "../../components/ui";
import type { FitnessOverview } from "../../api/fitness";

/** 把分钟数写成 1h 20m / 45m。 */
function durationText(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** 运动页顶部三块：本周、本月与连续天数。 */
export function FitnessStats({ overview }: { overview: FitnessOverview }) {
  return (
    <div className="module-summary">
      <Panel title="本周运动">
        <div className="stat-block">
          <strong>{durationText(overview.weekMinutes)}</strong>
          <span>时长</span>
          <small>共 {overview.total} 条运动记录</small>
        </div>
      </Panel>
      <Panel title="本月运动">
        <div className="stat-block">
          <strong>{durationText(overview.monthMinutes)}</strong>
          <span>时长</span>
          <small>累计 {durationText(overview.totalMinutes)}</small>
        </div>
      </Panel>
      <Panel title="连续运动">
        <div className="stat-block">
          <strong>{overview.streakDays}</strong>
          <span>天</span>
          <small>{overview.streakDays ? "保持住这个节奏" : "今天动一动，重新开始"}</small>
        </div>
      </Panel>
    </div>
  );
}
