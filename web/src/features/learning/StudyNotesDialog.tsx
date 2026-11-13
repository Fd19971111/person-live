import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Modal, type Notify } from "../../components/ui";
import { deleteStudyNote, fetchStudyNotes, type StudyNote } from "../../api/study";

/** 笔记管理：列出全部笔记，支持编辑与删除。 */
export function StudyNotesDialog({
  onClose,
  onEdit,
  onCreate,
  onChanged,
  notify,
}: {
  onClose: () => void;
  onEdit: (note: StudyNote) => void;
  onCreate: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const [items, setItems] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStudyNotes()
      .then((data) => {
        if (active) setItems(data.items);
      })
      .catch((err: Error) => notify(err.message || "读取失败", "err"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = async (note: StudyNote) => {
    try {
      await deleteStudyNote(note.id);
      setItems((current) => current.filter((item) => item.id !== note.id));
      notify("笔记已删除");
      onChanged();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  return (
    <Modal
      title="笔记管理"
      eyebrow="NOTES"
      subtitle="全部学习笔记，删除只做隐藏。"
      onClose={onClose}
      wide
      footer={
        <button className="primary-btn" onClick={onClose}>
          完成
        </button>
      }
    >
      <div className="study-note-list">
        {items.map((note) => (
          <div className="category-item" key={note.id}>
            <span className="note-tag">{note.tag || "随手记"}</span>
            <span>{note.title}</span>
            <small>{note.date}</small>
            <button className="text-btn" onClick={() => onEdit(note)}>
              <Icon name="edit" size={13} />
              编辑
            </button>
            <button className="text-btn danger-text" onClick={() => void remove(note)}>
              <Icon name="trash" size={13} />
              删除
            </button>
          </div>
        ))}
        {!items.length && <p className="muted-text">{loading ? "读取中…" : "还没有笔记"}</p>}
      </div>
      <button className="secondary-btn study-add-btn" onClick={onCreate}>
        <Icon name="plus" size={15} />
        新建笔记
      </button>
    </Modal>
  );
}
