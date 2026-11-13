import { Icon } from "../../components/Icon";
import type { TravelTrip } from "../../api/travel";

/** 按年份分组的足迹时间线，点击可编辑。 */
export function TravelTimeline({
  trips,
  onEdit,
  onDelete,
}: {
  trips: TravelTrip[];
  onEdit: (trip: TravelTrip) => void;
  onDelete: (trip: TravelTrip) => void;
}) {
  if (!trips.length) {
    return <p className="muted-text">还没有足迹，点右上角「记录一次旅行」写下第一个目的地。</p>;
  }

  const years: number[] = [];
  const grouped = new Map<number, TravelTrip[]>();
  for (const trip of trips) {
    if (!grouped.has(trip.year)) {
      grouped.set(trip.year, []);
      years.push(trip.year);
    }
    grouped.get(trip.year)?.push(trip);
  }

  return (
    <div className="travel-timeline">
      {years.map((year) => {
        const list = grouped.get(year) ?? [];
        const days = list.reduce((sum, trip) => sum + trip.days, 0);
        return (
          <section className="travel-year" key={year}>
            <header>
              <h4>{year}</h4>
              <span>
                {list.length} 次 · {days} 天
              </span>
            </header>
            <div className="travel-stops">
              {list.map((trip) => (
                <article
                  className="travel-stop"
                  key={trip.id}
                  style={{ borderLeftColor: trip.color }}
                  onClick={() => onEdit(trip)}
                >
                  <div className="travel-stop-head">
                    <b>{trip.title}</b>
                    {trip.region && <span className="travel-region">{trip.region}</span>}
                    <small>{trip.date}</small>
                    <button
                      className="pin-btn"
                      title="删除"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(trip);
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  <p>{trip.note || "还没有写下这次旅行的记忆。"}</p>
                  <footer>
                    <span>{trip.days} 天</span>
                    <span className="travel-stars" title={trip.rating ? `${trip.rating} 星` : "未评分"}>
                      {trip.rating > 0
                        ? "★".repeat(trip.rating) + "☆".repeat(Math.max(0, 5 - trip.rating))
                        : "未评分"}
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
