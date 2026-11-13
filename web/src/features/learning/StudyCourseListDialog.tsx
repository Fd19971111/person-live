import { Icon } from "../../components/Icon";
import { Modal, type Notify } from "../../components/ui";
import { deleteStudyCourse, type StudyCourse } from "../../api/study";

/** 课程管理：列出全部课程，支持编辑与删除。 */
export function StudyCourseListDialog({
  courses,
  onClose,
  onCreate,
  onEdit,
  onChanged,
  notify,
}: {
  courses: StudyCourse[];
  onClose: () => void;
  onCreate: () => void;
  onEdit: (course: StudyCourse) => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const remove = async (course: StudyCourse) => {
    try {
      await deleteStudyCourse(course.id);
      notify(`课程「${course.title}」已删除，历史记录保留`);
      onChanged();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    }
  };

  return (
    <Modal
      title="课程管理"
      eyebrow="COURSES"
      subtitle="维护正在学习的课程与进度，删除只做隐藏。"
      onClose={onClose}
      wide
      footer={
        <button className="primary-btn" onClick={onClose}>
          完成
        </button>
      }
    >
      <div className="study-course-manager">
        {courses.map((course) => (
          <div className="category-item" key={course.id}>
            <i className="swatch" style={{ background: course.color }} />
            <span>{course.title}</span>
            <small>
              {course.doneUnits} / {course.totalUnits} {course.unitLabel} · {course.progress}%
            </small>
            <button className="text-btn" onClick={() => onEdit(course)}>
              <Icon name="edit" size={13} />
              编辑
            </button>
            <button className="text-btn danger-text" onClick={() => void remove(course)}>
              <Icon name="trash" size={13} />
              删除
            </button>
          </div>
        ))}
        {!courses.length && <p className="muted-text">还没有课程</p>}
      </div>
      <button className="secondary-btn study-add-btn" onClick={onCreate}>
        <Icon name="plus" size={15} />
        新建课程
      </button>
    </Modal>
  );
}
