/** 计划模块的日期工具，全部按本地时区处理 YYYY-MM-DD。 */

export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayDate(): string {
  return formatDate(new Date());
}

export function addDays(base: string, days: number): string {
  const date = new Date(`${base || todayDate()}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/** 把截止日期转成「今天 / 明天 / 11月20日」这类展示文案。 */
export function dueLabel(dueDate: string): string {
  if (!dueDate) return "无期限";
  const today = todayDate();
  if (dueDate === today) return "今天";
  if (dueDate === addDays(today, 1)) return "明天";
  if (dueDate === addDays(today, -1)) return "昨天";
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}月${Number(day)}日`;
}
