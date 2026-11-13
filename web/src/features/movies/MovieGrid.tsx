import { Icon } from "../../components/Icon";
import { MOVIE_STATUS, type MovieItem } from "../../api/movies";

const nextLabel = (status: number) => {
  if (status === MOVIE_STATUS.want) return "标记在看";
  if (status === MOVIE_STATUS.watching) return "标记看完";
  return "重新想看";
};

/** 片单卡片墙：点击编辑，右下角可快捷切换状态。 */
export function MovieGrid({
  items,
  onEdit,
  onDelete,
  onAdvance,
}: {
  items: MovieItem[];
  onEdit: (item: MovieItem) => void;
  onDelete: (item: MovieItem) => void;
  onAdvance: (item: MovieItem) => void;
}) {
  if (!items.length) {
    return <p className="muted-text">这个状态下还没有电影，点右上角「添加电影」开始整理片单。</p>;
  }
  return (
    <div className="movie-grid">
      {items.map((item) => (
        <article
          key={item.id}
          className={`movie-card ${item.status === MOVIE_STATUS.watched ? "watched" : ""}`}
          style={{ borderLeftColor: item.color }}
          onClick={() => onEdit(item)}
        >
          <div className="movie-card-head">
            <span className={`movie-badge s${item.status}`}>{item.statusName}</span>
            <div className="inspiration-card-ops">
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
          <h3>
            {item.title}
            {item.year > 0 && <small>{item.year}</small>}
          </h3>
          <p className="movie-meta">
            {[item.genre, item.director].filter(Boolean).join(" · ") || "未填写类型与导演"}
          </p>
          <p className="movie-note">{item.note || "还没有备注。"}</p>
          <footer>
            <span className="movie-rating">{item.rating > 0 ? `★ ${item.rating.toFixed(1)}` : "未评分"}</span>
            <button
              className="text-btn"
              onClick={(event) => {
                event.stopPropagation();
                onAdvance(item);
              }}
            >
              {nextLabel(item.status)}
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
}
