import { Panel } from "../../components/ui";
import type { TravelOverview } from "../../api/travel";

/** 旅行页顶部三块：目的地、本年出行与累计天数。 */
export function TravelStats({ overview }: { overview: TravelOverview }) {
  const avgDays = overview.total > 0 ? (overview.totalDays / overview.total).toFixed(1) : "0";
  return (
    <div className="module-summary">
      <Panel title="目的地">
        <div className="stat-block">
          <strong>{overview.placeCount}</strong>
          <span>个</span>
          <small>共记录 {overview.total} 次出行</small>
        </div>
      </Panel>
      <Panel title={`${overview.year} 年`}>
        <div className="stat-block">
          <strong>{overview.yearCount}</strong>
          <span>次</span>
          <small>{overview.yearCount ? "今年已经出发过" : "今年还没有出行记录"}</small>
        </div>
      </Panel>
      <Panel title="累计天数">
        <div className="stat-block">
          <strong>{overview.totalDays}</strong>
          <span>天</span>
          <small>平均每次 {avgDays} 天</small>
        </div>
      </Panel>
    </div>
  );
}
