import { Panel, Ring } from "../../components/ui";
import type { StudyOverview } from "../../api/study";
import { durationText, hourText } from "./studyFormat";

/** 学习页顶部三块：本月累计、连续学习、本周目标。 */
export function StudySummary({
  overview,
  onEditGoal,
}: {
  overview: StudyOverview;
  onEditGoal: () => void;
}) {
  const change = overview.changeMinutes;
  const changeText =
    change > 0
      ? `比上月多 ${durationText(change)}`
      : change < 0
        ? `比上月少 ${durationText(-change)}`
        : "与上月持平";
  const remain = Math.max(0, overview.weekGoalMinutes - overview.weekMinutes);

  return (
    <div className="learning-summary">
      <Panel title="本月学习">
        <div className="learning-ring">
          <Ring value={Math.round(overview.monthRate)} color="#5F6E9C" size={126} />
          <div>
            <span>本月累计</span>
            <strong>{durationText(overview.monthMinutes)}</strong>
            <small>{changeText}</small>
          </div>
        </div>
      </Panel>
      <Panel title="连续学习">
        <div className="streak">
          <strong>{overview.streakDays}</strong>
          <span>天</span>
          <div>
            {overview.weekDays.map((day) => (
              <i className={day.minutes > 0 ? "on" : ""} key={day.date} title={`${day.date} · ${day.minutes} 分钟`}>
                {day.weekday}
              </i>
            ))}
          </div>
        </div>
      </Panel>
      <Panel
        title="本周目标"
        aside={
          <button className="text-btn" onClick={onEditGoal}>
            修改
          </button>
        }
      >
        <div className="goal">
          <strong>
            {hourText(overview.weekMinutes)} <small>/ {hourText(overview.weekGoalMinutes)} 小时</small>
          </strong>
          <div>
            <i style={{ width: `${Math.min(100, overview.weekRate)}%` }} />
          </div>
          <span>{remain === 0 ? "本周目标已达成" : `还差 ${hourText(remain)} 小时`}</span>
        </div>
      </Panel>
    </div>
  );
}
