import { Icon } from "../../components/Icon";
import type { StudyNote } from "../../api/study";

/** 最近笔记卡片，点击可编辑。 */
export function StudyNotes({
  notes,
  onOpen,
}: {
  notes: StudyNote[];
  onOpen: (note: StudyNote) => void;
}) {
  if (!notes.length) {
    return <p className="muted-text">还没有笔记，点右上角「新建笔记」记录第一条。</p>;
  }
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <article className="note-card" key={note.id} onClick={() => onOpen(note)}>
          <div className="note-tag">{note.tag || "随手记"}</div>
          <h3>{note.title}</h3>
          <p>{note.content || "没有正文，点击补充内容。"}</p>
          <footer>
            <span>{note.date}</span>
            <Icon name="arrow" size={15} />
          </footer>
        </article>
      ))}
    </div>
  );
}
