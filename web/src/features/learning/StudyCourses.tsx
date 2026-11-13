import { Icon } from "../../components/Icon";
import { Panel } from "../../components/ui";
import type { StudyCourse } from "../../api/study";

/** 正在学习的课程列表，点击课程可编辑进度。 */
export function StudyCourses({
  courses,
  onManage,
  onCreate,
  onEdit,
}: {
  courses: StudyCourse[];
  onManage: () => void;
  onCreate: () => void;
  onEdit: (course: StudyCourse) => void;
}) {
  return (
    <Panel
      title="正在学习"
      aside={
        <button className="text-btn" onClick={onManage}>
          管理课程 <Icon name="arrow" size={13} />
        </button>
      }
    >
      <div className="course-list">
        {courses.map((course) => (
          <button className="course course-row" key={course.id} onClick={() => onEdit(course)}>
            <span className="course-icon" style={{ background: course.color + "18", color: course.color }}>
              {course.title.slice(0, 1)}
            </span>
            <div>
              <b>{course.title}</b>
              <span>
                {course.doneUnits} / {course.totalUnits} {course.unitLabel}
              </span>
              <div>
                <i style={{ width: course.progress + "%", background: course.color }} />
              </div>
            </div>
            <strong>{course.progress}%</strong>
          </button>
        ))}
        {!courses.length && <p className="muted-text">还没有课程，先添加一门吧</p>}
      </div>
      <button className="text-btn course-add" onClick={onCreate}>
        <Icon name="plus" size={13} />
        添加课程
      </button>
    </Panel>
  );
}
