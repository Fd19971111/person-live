import { Panel } from "../../components/ui";
import type { InspirationOverview } from "../../api/inspiration";

/** 灵感页顶部三块：总数、置顶与标签分布。 */
export function InspirationStats({
  overview,
  activeTag,
  onTag,
}: {
  overview: InspirationOverview;
  activeTag: string;
  onTag: (tag: string) => void;
}) {
  return (
    <div className="inspiration-summary">
      <Panel title="灵感总数">
        <div className="inspiration-stat">
          <strong>{overview.total}</strong>
          <span>条</span>
          <small>本月新增 {overview.monthAdded} 条</small>
        </div>
      </Panel>
      <Panel title="置顶">
        <div className="inspiration-stat">
          <strong>{overview.pinnedCount}</strong>
          <span>条</span>
          <small>{overview.pinnedCount ? "置顶内容排在最前" : "还没有置顶的灵感"}</small>
        </div>
      </Panel>
      <Panel title="标签" aside={<span className="muted">{overview.tagTotal} 个</span>}>
        <div className="tag-row">
          {overview.tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              className={`tag-chip ${activeTag === tag.name ? "active" : ""}`}
              onClick={() => onTag(activeTag === tag.name ? "" : tag.name)}
            >
              {tag.name}
              <b>{tag.count}</b>
            </button>
          ))}
          {!overview.tags.length && <p className="muted-text">写下标签后，这里会自动汇总。</p>}
        </div>
      </Panel>
    </div>
  );
}
