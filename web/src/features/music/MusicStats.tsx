import { Panel } from "../../components/ui";
import type { MusicOverview } from "../../api/music";

/** 音乐页顶部三块：记录曲目、歌单与平均评分。 */
export function MusicStats({ overview }: { overview: MusicOverview }) {
  return (
    <div className="module-summary">
      <Panel title="记录曲目">
        <div className="stat-block">
          <strong>{overview.total}</strong>
          <span>首</span>
          <small>来自 {overview.artistCount} 位演唱者</small>
        </div>
      </Panel>
      <Panel title="歌单">
        <div className="stat-block">
          <strong>{overview.playlistCount}</strong>
          <span>个</span>
          <small>{overview.playlists.map((item) => item.name).join(" · ") || "还没有分类歌单"}</small>
        </div>
      </Panel>
      <Panel title="平均评分">
        <div className="stat-block">
          <strong>{overview.avgRating > 0 ? overview.avgRating.toFixed(1) : "—"}</strong>
          <span>分</span>
          <small>仅统计已评分的曲目</small>
        </div>
      </Panel>
    </div>
  );
}
