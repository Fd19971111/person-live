import { Icon } from "../../components/Icon";
import type { FitnessRecord } from "../../api/fitness";

/** 最近运动记录，点击行可编辑。 */
export function FitnessList({
  records,
  onEdit,
  onDelete,
}: {
  records: FitnessRecord[];
  onEdit: (record: FitnessRecord) => void;
  onDelete: (record: FitnessRecord) => void;
}) {
  if (!records.length) {
    return <p className="muted-text">还没有运动记录，点右上角「记录运动」开始第一条。</p>;
  }
  return (
    <div className="record-list">
      {records.map((record) => (
        <div className="record-row" key={record.id} onClick={() => onEdit(record)}>
          <span className="record-dot" style={{ background: record.color }} />
          <div className="record-main">
            <b>{record.activity}</b>
            <small>
              {record.date} 周{record.weekday}
              {record.note ? ` · ${record.note}` : ""}
            </small>
          </div>
          <span className="record-metric">{record.minutes} 分钟</span>
          {record.distanceKm > 0 && <span className="record-metric">{record.distanceKm.toFixed(2)} km</span>}
          {record.calories > 0 && <span className="record-metric">{record.calories} 千卡</span>}
          <button
            className="pin-btn"
            title="删除"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(record);
            }}
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
