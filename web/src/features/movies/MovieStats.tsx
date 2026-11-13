import { Panel } from "../../components/ui";
import type { MoviesOverview } from "../../api/movies";

/** 电影页顶部三块：片单总数、已看完与平均评分。 */
export function MovieStats({ overview }: { overview: MoviesOverview }) {
  const watchedRate = overview.total > 0 ? Math.round((overview.watchedCount / overview.total) * 100) : 0;
  return (
    <div className="module-summary">
      <Panel title="片单总数">
        <div className="stat-block">
          <strong>{overview.total}</strong>
          <span>部</span>
          <small>
            想看 {overview.wantCount} · 在看 {overview.watchingCount}
          </small>
        </div>
      </Panel>
      <Panel title="已看完">
        <div className="stat-block">
          <strong>{overview.watchedCount}</strong>
          <span>部</span>
          <small>{watchedRate}% 的片单已看完</small>
        </div>
      </Panel>
      <Panel title="平均评分">
        <div className="stat-block">
          <strong>{overview.avgRating > 0 ? overview.avgRating.toFixed(1) : "—"}</strong>
          <span>分</span>
          <small>仅统计已评分的电影</small>
        </div>
      </Panel>
    </div>
  );
}
