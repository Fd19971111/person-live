import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge, Dropdown, type MenuItem } from "../../components/ui";
import type { PlanColumn, PlanTask } from "../../api/plan";
import { dueLabel } from "./planDate";

/** 看板：三列任务，支持拖拽换列、快速编辑与删除。 */
export function PlanBoard({
  columns,
  onMove,
  onEdit,
  onDelete,
  onCreate,
}: {
  columns: PlanColumn[];
  onMove: (task: PlanTask, status: number) => void;
  onEdit: (task: PlanTask) => void;
  onDelete: (task: PlanTask) => void;
  onCreate: (status: number) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropStatus, setDropStatus] = useState(0);

  const findTask = (id: number) => {
    for (const column of columns) {
      const task = column.items.find((item) => item.id === id);
      if (task) return task;
    }
    return null;
  };

  const menuItems = (task: PlanTask): MenuItem[] => {
    const items: MenuItem[] = [{ label: "编辑任务", icon: "edit", onClick: () => onEdit(task) }];
    if (task.status !== 2) {
      items.push({ label: "开始进行", icon: "arrow", onClick: () => onMove(task, 2) });
    }
    if (task.status !== 3) {
      items.push({ label: "标记完成", icon: "check", onClick: () => onMove(task, 3) });
    }
    if (task.status === 3) {
      items.push({ label: "退回待处理", icon: "refresh", onClick: () => onMove(task, 1) });
    }
    items.push({ label: "删除任务", icon: "trash", danger: true, onClick: () => onDelete(task) });
    return items;
  };

  return (
    <div className="kanban">
      {columns.map((column, index) => (
        <div
          className={`kanban-col ${dropStatus === column.status ? "drop-target" : ""}`}
          key={column.status}
          onDragOver={(event) => {
            event.preventDefault();
            setDropStatus(column.status);
          }}
          onDragLeave={() => setDropStatus((current) => (current === column.status ? 0 : current))}
          onDrop={(event) => {
            event.preventDefault();
            setDropStatus(0);
            const task = dragging === null ? null : findTask(dragging);
            setDragging(null);
            if (task && task.status !== column.status) onMove(task, column.status);
          }}
        >
          <header>
            <div>
              <i className={`col-dot c${index}`} />
              <b>{column.name}</b>
              <span>{column.count}</span>
            </div>
            <button onClick={() => onCreate(column.status)} aria-label={`在${column.name}新建任务`}>
              <Icon name="plus" size={16} />
            </button>
          </header>
          {column.items.map((task) => (
            <article
              className={column.status === 3 ? "completed" : ""}
              key={task.id}
              draggable
              onDragStart={() => setDragging(task.id)}
              onDragEnd={() => {
                setDragging(null);
                setDropStatus(0);
              }}
              onDoubleClick={() => onEdit(task)}
            >
              <div className="drag-handle">⠿</div>
              <Badge>{task.category}</Badge>
              <h4>{task.title}</h4>
              <footer>
                <span>
                  <Icon name={column.status === 3 ? "check" : "calendar"} size={14} />
                  {column.status === 3 ? "已完成" : dueLabel(task.dueDate)}
                </span>
                <Dropdown items={menuItems(task)} />
              </footer>
            </article>
          ))}
          {!column.items.length && <p className="plan-empty">还没有任务，点击右上角 + 添加</p>}
        </div>
      ))}
    </div>
  );
}
