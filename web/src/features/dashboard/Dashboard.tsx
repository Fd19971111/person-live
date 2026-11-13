import { useEffect, useState } from "react";
import { Icon, type IconName } from "../../components/Icon";
import { Ring, money } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";
import { fetchFinanceOverview, type FinanceOverview } from "../../api/finance";
import { fetchStudyOverview, type StudyOverview } from "../../api/study";
import { fetchFitnessOverview, type FitnessOverview } from "../../api/fitness";
import { fetchMusicOverview, type MusicOverview } from "../../api/music";

/** 把分钟数写成 4h 30m / 45m。 */
function minutesText(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function OverviewCard({
  icon,
  color,
  eyebrow,
  title,
  onOpen,
  children,
}: {
  icon: IconName;
  color: string;
  eyebrow: string;
  title: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="dash-card">
      <header>
        <div className="dash-card-title">
          <span className="dash-card-icon" style={{ background: color + "18", color }}>
            <Icon name={icon} size={15} />
          </span>
          <div>
            <span className="dash-card-eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
          </div>
        </div>
        <button className="text-btn" onClick={onOpen}>
          查看 <Icon name="arrow" size={13} />
        </button>
      </header>
      {children}
    </section>
  );
}

export default function Dashboard({ open }: { open: (page: string) => void }) {
  const { user } = useAuth();
  const [finance, setFinance] = useState<FinanceOverview | null>(null);
  const [study, setStudy] = useState<StudyOverview | null>(null);
  const [fitness, setFitness] = useState<FitnessOverview | null>(null);
  const [music, setMusic] = useState<MusicOverview | null>(null);

  useEffect(() => {
    let active = true;
    fetchFinanceOverview()
      .then((result) => {
        if (active) setFinance(result);
      })
      .catch(() => undefined);
    fetchStudyOverview()
      .then((result) => {
        if (active) setStudy(result);
      })
      .catch(() => undefined);
    fetchFitnessOverview()
      .then((result) => {
        if (active) setFitness(result);
      })
      .catch(() => undefined);
    fetchMusicOverview()
      .then((result) => {
        if (active) setMusic(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const now = new Date();
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  const dateText = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${weekday}`;
  const hour = now.getHours();
  const greeting = hour < 5 ? "夜深了" : hour < 11 ? "早上好" : hour < 13 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
  const [balanceInt, balanceDec] = money(finance?.balanceCents ?? 0, 2).split(".");

  const monthLabel = finance ? `${Number(finance.month.slice(5, 7))} 月` : "本月";
  const categories = (finance?.categories ?? []).slice(0, 4);
  const weekDays = study?.weekDays ?? [];
  const weekMax = Math.max(1, ...weekDays.map((day) => day.minutes));
  const recentFitness = (fitness?.heatmap ?? []).slice(-7);
  const fitnessMax = Math.max(1, ...recentFitness.map((day) => day.minutes));

  return (
    <div className="page dashboard">
      <div className="page-intro dash-intro">
        <div>
          <div className="eyebrow">{dateText}</div>
          <h1>
            {greeting}，{user?.nickname || "朋友"}
          </h1>
          <p>今天也按自己的节奏来。下面是最近在发生的几件事。</p>
        </div>
      </div>

      <div className="dash-stats">
        <button className="dash-stat" onClick={() => open("finance")}>
          <span className="dash-stat-label">
            <i style={{ background: "#E56F4A" }} />
            本月结余
          </span>
          <strong>
            ¥ {balanceInt}
            <small>.{balanceDec}</small>
          </strong>
          <em>支出 ¥ {money(finance?.expenseCents ?? 0)}</em>
          <Icon name="arrow" size={15} />
        </button>
        <button className="dash-stat" onClick={() => open("learning")}>
          <span className="dash-stat-label">
            <i style={{ background: "#5F6E9C" }} />
            本周学习
          </span>
          <strong>{study ? minutesText(study.weekMinutes) : "—"}</strong>
          <em>连续 {study?.streakDays ?? 0} 天</em>
          <Icon name="arrow" size={15} />
        </button>
        <button className="dash-stat" onClick={() => open("fitness")}>
          <span className="dash-stat-label">
            <i style={{ background: "#5C927A" }} />
            本周运动
          </span>
          <strong>{fitness ? minutesText(fitness.weekMinutes) : "—"}</strong>
          <em>连续 {fitness?.streakDays ?? 0} 天</em>
          <Icon name="arrow" size={15} />
        </button>
        <button className="dash-stat" onClick={() => open("music")}>
          <span className="dash-stat-label">
            <i style={{ background: "#9B72D2" }} />
            音乐记录
          </span>
          <strong>
            {music?.total ?? 0}
            <small> 首</small>
          </strong>
          <em>{music?.playlistCount ?? 0} 个歌单</em>
          <Icon name="arrow" size={15} />
        </button>
      </div>

      <div className="dash-grid">
        <OverviewCard
          icon="wallet"
          color="#E56F4A"
          eyebrow={`FINANCE · ${monthLabel}`}
          title="本月收支"
          onOpen={() => open("finance")}
        >
          <div className="dash-finance">
            <div className="dash-finance-main">
              <span>本月结余</span>
              <strong>
                ¥ {balanceInt}
                <small>.{balanceDec}</small>
              </strong>
              <div className="dash-finance-row">
                <div>
                  <span>收入</span>
                  <b>¥ {money(finance?.incomeCents ?? 0)}</b>
                </div>
                <div>
                  <span>支出</span>
                  <b>¥ {money(finance?.expenseCents ?? 0)}</b>
                </div>
              </div>
            </div>
            <div className="dash-cats">
              <span className="dash-sub">支出分类</span>
              {categories.map((item) => (
                <div className="dash-cat" key={item.name}>
                  <i style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <em>{item.percent}%</em>
                </div>
              ))}
              {!categories.length && <p className="muted-text">本月还没有支出记录。</p>}
            </div>
          </div>
        </OverviewCard>

        <OverviewCard
          icon="book"
          color="#5F6E9C"
          eyebrow="STUDY · 本周"
          title="学习节奏"
          onOpen={() => open("learning")}
        >
          <div className="dash-study">
            <Ring value={Math.round(study?.weekRate ?? 0)} color="#5F6E9C" size={96}>
              <b>{Math.round(study?.weekRate ?? 0)}%</b>
              <small>本周目标</small>
            </Ring>
            <div className="dash-study-side">
              <div className="dash-study-total">
                <b>{study ? minutesText(study.weekMinutes) : "—"}</b>
                <span>/ 目标 {study ? minutesText(study.weekGoalMinutes) : "—"}</span>
              </div>
              <div className="dash-bars">
                {weekDays.map((day) => (
                  <div key={day.date} title={`${day.date} · ${day.minutes} 分钟`}>
                    <i style={{ height: `${Math.max(6, (day.minutes / weekMax) * 100)}%` }} />
                    <span>{day.weekday}</span>
                  </div>
                ))}
                {!weekDays.length && <p className="muted-text">本周还没有学习记录。</p>}
              </div>
            </div>
          </div>
          <p className="dash-foot">连续学习 {study?.streakDays ?? 0} 天 · 正在学习 {study?.courses.length ?? 0} 门课</p>
        </OverviewCard>

        <OverviewCard
          icon="activity"
          color="#5C927A"
          eyebrow="FITNESS · 最近 7 天"
          title="运动记录"
          onOpen={() => open("fitness")}
        >
          <div className="dash-bars dash-bars-green">
            {recentFitness.map((day) => (
              <div key={day.date} title={`${day.date} · ${day.minutes} 分钟`}>
                <i style={{ height: `${Math.max(6, (day.minutes / fitnessMax) * 100)}%` }} />
                <span>{day.weekday}</span>
              </div>
            ))}
            {!recentFitness.length && <p className="muted-text">最近还没有运动记录。</p>}
          </div>
          <div className="dash-list">
            {(fitness?.items ?? []).slice(0, 3).map((item) => (
              <div className="dash-line" key={item.id}>
                <i style={{ background: item.color }} />
                <b>{item.activity}</b>
                <span>{item.date}</span>
                <em>{item.minutes} 分钟</em>
              </div>
            ))}
            {fitness && !fitness.items.length && <p className="muted-text">还没有运动记录。</p>}
          </div>
        </OverviewCard>

        <OverviewCard
          icon="music"
          color="#9B72D2"
          eyebrow="MUSIC · 常听"
          title="我的歌单"
          onOpen={() => open("music")}
        >
          <div className="dash-list">
            {(music?.items ?? []).slice(0, 4).map((track) => (
              <div className="dash-line" key={track.id}>
                <i style={{ background: track.color }} />
                <b>{track.title}</b>
                <span>{[track.artist, track.album].filter(Boolean).join(" · ")}</span>
                <em>{track.playlist || "未分类"}</em>
              </div>
            ))}
            {music && !music.items.length && <p className="muted-text">还没有音乐记录。</p>}
          </div>
        </OverviewCard>
      </div>
    </div>
  );
}
