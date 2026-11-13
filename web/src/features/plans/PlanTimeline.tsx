import { Icon } from "../../components/Icon";
import type { PlanDay, PlanTask } from "../../api/plan";
import { dueLabel, todayDate } from "./planDate";

/** 时间轴：按本周每一天展示当天到期或创建的任务。 */
export function PlanTimeline({
  days,
  onEdit,
  onCreate,
}: {
  days: PlanDay[];
  onEdit: (task: PlanTask) => void;
  onCreate: (dueDate: string) => void;
}) {
  const today = todayDate();
  return (
    <div className="timeline-view">
      {days.map((day) => (
        <div className={day.date === today ? "active" : ""} key={day.date}>
          <span>{day.weekday}</span>
          <b>{day.day}</b>
          {day.items.map((task, index) => (
            <article
              key={task.id}
              className={task.status === 3 ? "done" : ""}
              style={{
                marginTop: index === 0 ? 28 : 8,
                borderLeftColor: task.color,
                background: `${task.color}1f`,
              }}
              onClick={() => onEdit(task)}
            >
              {task.title}
              <small>{task.status === 3 ? "已完成" : dueLabel(task.dueDate)}</small>
            </article>
          ))}
          <button className="timeline-add" onClick={() => onCreate(day.date)} aria-label={`在 ${day.date} 新建任务`}>
            <Icon name="plus" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
