import { Panel } from "../../components/ui";
import type { FitnessDayStat } from "../../api/fitness";

/** 过去 16 周的运动热力图。 */
export function FitnessHeatmap({ heatmap }: { heatmap: FitnessDayStat[] }) {
  return (
    <Panel title="运动热力图" aside={<span className="muted">过去 16 周</span>}>
      <div className="heatmap-label">
        <span>一</span>
        <span>三</span>
        <span>五</span>
      </div>
      <div className="heatmap large">
        {heatmap.map((day) => (
          <i key={day.date} className={`l${day.level}`} title={`${day.date} · ${day.minutes} 分钟`} />
        ))}
      </div>
      <div className="heat-legend">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i className={`l${level}`} key={level} />
        ))}
        <span>多</span>
      </div>
    </Panel>
  );
}
