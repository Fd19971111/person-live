import { Icon } from "../../components/Icon";
import type { MusicTrack } from "../../api/music";

/** 歌曲记录列表：只展示记录信息，不提供播放。 */
export function MusicList({
  tracks,
  onEdit,
  onDelete,
}: {
  tracks: MusicTrack[];
  onEdit: (track: MusicTrack) => void;
  onDelete: (track: MusicTrack) => void;
}) {
  if (!tracks.length) {
    return <p className="muted-text">没有符合条件的歌曲，换个歌单或关键词试试。</p>;
  }
  return (
    <div className="track-list">
      <div className="track-head">
        <span>序号</span>
        <span>歌曲</span>
        <span>歌单</span>
        <span>评分</span>
        <span>记录于</span>
        <span />
      </div>
      {tracks.map((track, index) => (
        <div className="track-row" key={track.id} onClick={() => onEdit(track)}>
          <span className="track-index">
            <i className="track-dot" style={{ background: track.color }} />
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="track-main">
            <b>{track.title}</b>
            <small>
              {[track.artist, track.album].filter(Boolean).join(" · ") || "未填写演唱者"}
              {track.note ? ` — ${track.note}` : ""}
            </small>
          </div>
          <span className="track-playlist">{track.playlist || "未分类"}</span>
          <span className="track-stars" title={track.rating ? `${track.rating} 星` : "未评分"}>
            {track.rating > 0 ? "★".repeat(track.rating) + "☆".repeat(5 - track.rating) : "—"}
          </span>
          <span className="track-date">{track.date}</span>
          <button
            className="pin-btn"
            title="删除"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(track);
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
