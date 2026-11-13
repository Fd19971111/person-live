import { Icon } from "../../components/Icon";
import type { InspirationItem } from "../../api/inspiration";

/** 灵感墙：点击卡片编辑，右上角可置顶或删除。 */
export function InspirationGrid({
  items,
  onEdit,
  onPin,
  onDelete,
}: {
  items: InspirationItem[];
  onEdit: (item: InspirationItem) => void;
  onPin: (item: InspirationItem) => void;
  onDelete: (item: InspirationItem) => void;
}) {
  if (!items.length) {
    return <p className="muted-text">没有符合条件的灵感，换个标签或关键词试试。</p>;
  }
  return (
    <div className="inspiration-grid">
      {items.map((item) => (
        <article
          key={item.id}
          className={`inspiration-card ${item.pinned ? "pinned" : ""}`}
          style={{ borderTopColor: item.color }}
          onClick={() => onEdit(item)}
        >
          <div className="inspiration-card-head">
            <span className="note-tag" style={{ color: item.color }}>
              {item.tag || "灵感"}
            </span>
            <div className="inspiration-card-ops">
              <button
                className={`pin-btn ${item.pinned ? "on" : ""}`}
                title={item.pinned ? "取消置顶" : "置顶"}
                onClick={(event) => {
                  event.stopPropagation();
                  onPin(item);
                }}
              >
                <Icon name="pin" size={14} />
              </button>
              <button
                className="pin-btn"
                title="删除"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item);
                }}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
          <h3>{item.title}</h3>
          <p>{item.content || "还没有正文，点击补充。"}</p>
          <footer>
            <span>{item.date}</span>
            {item.source &&
              (/^https?:\/\//i.test(item.source) ? (
                <a
                  className="inspiration-source"
                  href={item.source}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  {item.source}
                </a>
              ) : (
                <span className="inspiration-source">{item.source}</span>
              ))}
          </footer>
        </article>
      ))}
    </div>
  );
}
