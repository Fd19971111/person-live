/** 学习模块的时长与日期格式化。 */

export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayDate(): string {
  return formatDate(new Date());
}

/** 分钟 → 「9h 15m」，不足 1 小时只显示分钟。 */
export function durationText(minutes: number): string {
  const value = Math.max(0, Math.round(minutes));
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** 分钟 → 小时数，保留一位小数（4.5 小时）。 */
export function hourText(minutes: number): string {
  const hours = Math.max(0, minutes) / 60;
  return hours.toFixed(1).replace(/\.0$/, "");
}

/** 分钟 → 「1 小时 20 分」，用于提示文案。 */
export function readableDuration(minutes: number): string {
  const value = Math.max(0, Math.round(minutes));
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (hours === 0) return `${rest} 分钟`;
  if (rest === 0) return `${hours} 小时`;
  return `${hours} 小时 ${rest} 分`;
}

/** 「2026-11-13」→「11月13日」。 */
export function shortDate(date: string): string {
  if (!date) return "";
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日`;
}
