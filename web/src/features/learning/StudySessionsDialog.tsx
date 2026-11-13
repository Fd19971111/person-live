import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Field, Modal, type Notify } from "../../components/ui";
import {
  deleteStudySession,
  fetchStudySessions,
  saveStudySession,
  type StudyCourse,
  type StudySession,
} from "../../api/study";
import { durationText, hourText, shortDate, todayDate } from "./studyFormat";

/** 学习记录：左侧按时间列出，右侧新增/编辑一条记录。 */
export function StudySessionsDialog({
  courses,
  onClose,
  onChanged,
  notify,
}: {
  courses: StudyCourse[];
  onClose: () => void;
  onChanged: () => void;
  notify: Notify;
}) {
  const [month, setMonth] = useState("");
  const [items, setItems] = useState<StudySession[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);

  const [date, setDate] = useState(todayDate());
  const [minutes, setMinutes] = useState("45");
  const [courseId, setCourseId] = useState<number | "new">(0);
  const [courseName, setCourseName] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStudySessions(month || undefined)
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotalMinutes(data.totalMinutes);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "读取失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [month, reload]);

  const resetForm = () => {
    setEditingId(0);
    setDate(todayDate());
    setMinutes("45");
    setCourseId(0);
    setCourseName("");
    setNote("");
    setError("");
  };

  const submit = async () => {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) {
      setError("请填写大于 0 的学习时长");
      return;
    }
    if (courseId === "new" && !courseName.trim()) {
      setError("请填写课程名称");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await saveStudySession({
        id: editingId,
        date,
        minutes: Math.round(value),
        courseId: courseId === "new" ? 0 : courseId,
        courseName: courseId === "new" ? courseName.trim() : "",
        note: note.trim(),
      });
      notify(editingId ? "学习记录已更新" : "已添加学习记录");
      resetForm();
      setReload((current) => current + 1);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const edit = (session: StudySession) => {
    setEditingId(session.id);
    setDate(session.date);
    setMinutes(String(session.minutes));
    setCourseId(session.courseId || 0);
    setCourseName("");
    setNote(session.note);
    setError("");
  };

  const remove = async (session: StudySession) => {
    setBusy(true);
    try {
      await deleteStudySession(session.id);
      notify("学习记录已删除");
      if (editingId === session.id) resetForm();
      setReload((current) => current + 1);
      onChanged();
    } catch (err) {
      notify(err instanceof Error ? err.message : "删除失败", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="学习记录"
      eyebrow="STUDY LOG"
      subtitle="记录每天投入的时长，热力图、连续天数与周进度会自动更新。"
      onClose={onClose}
      wide
      footer={
        <button className="primary-btn" onClick={onClose}>
          完成
        </button>
      }
    >
      <div className="category-manager">
        <div className="study-log">
          <div className="study-log-head">
            <span>
              共 <b>{items.length}</b> 条 · {durationText(totalMinutes)}
            </span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="按月筛选"
            />
          </div>
          <div className="study-log-list">
            {items.map((session) => (
              <div className={`session-item ${editingId === session.id ? "editing" : ""}`} key={session.id}>
                <div className="session-main">
                  <b>{shortDate(session.date)}</b>
                  <small>{session.course}</small>
                  {session.note && <span>{session.note}</span>}
                </div>
                <strong>{durationText(session.minutes)}</strong>
                <button className="text-btn" onClick={() => edit(session)}>
                  编辑
                </button>
                <button className="text-btn danger-text" disabled={busy} onClick={() => void remove(session)}>
                  删除
                </button>
              </div>
            ))}
            {!items.length && <p className="muted-text">{loading ? "读取中…" : "还没有学习记录"}</p>}
          </div>
        </div>
        <div className="category-form">
          <b>{editingId ? "编辑记录" : "新增记录"}</b>
          <Field label="学习日期">
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
          <Field label="时长（分钟）" hint="一次最多 1440 分钟">
            <input
              type="number"
              min={1}
              max={1440}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="45"
            />
          </Field>
          <Field label="课程" hint="可在「课程管理」中维护课程">
            <select
              value={courseId === "new" ? "new" : courseId}
              onChange={(event) => setCourseId(event.target.value === "new" ? "new" : Number(event.target.value))}
            >
              <option value={0}>未关联课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
              <option value="new">＋ 新建课程…</option>
            </select>
          </Field>
          {courseId === "new" && (
            <Field label="新课程名称">
              <input
                value={courseName}
                maxLength={64}
                onChange={(event) => setCourseName(event.target.value)}
                placeholder="例如：日语 · N3 语法"
              />
            </Field>
          )}
          <Field label="备注">
            <input value={note} maxLength={255} onChange={(event) => setNote(event.target.value)} placeholder="可留空" />
          </Field>
          {error && <div className="form-error">{error}</div>}
          <div className="category-form-actions">
            {editingId > 0 && (
              <button className="text-btn" onClick={resetForm}>
                取消编辑
              </button>
            )}
            <button className="primary-btn indigo" disabled={busy} onClick={() => void submit()}>
              {busy ? "保存中…" : editingId ? "保存修改" : "添加记录"}
            </button>
          </div>
          <p className="muted-text">
            <Icon name="clock" size={12} /> 本周累计 {hourText(totalMinutes)} 小时（当前筛选范围）
          </p>
        </div>
      </div>
    </Modal>
  );
}
