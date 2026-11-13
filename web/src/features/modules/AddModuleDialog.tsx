import { Icon } from "../../components/Icon";
import { Modal } from "../../components/ui";
import type { WorkspaceModule } from "../../api/module";

/** 模块库：已删除（隐藏）的模块会回到这里，可重新加回侧边栏。 */
export function AddModuleDialog({
  modules,
  onAdd,
  onRemove,
  onClose,
  busy,
}: {
  modules: WorkspaceModule[];
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  onClose: () => void;
  busy?: boolean;
}) {
  const available = modules.filter((item) => item.hidden);
  const added = modules.filter((item) => !item.hidden);
  return (
    <Modal
      title="模块设置"
      eyebrow="MODULE LIBRARY"
      subtitle="这里的每次增删都会立即保存到当前账号，下次登录按保存的顺序和显隐恢复。"
      onClose={onClose}
    >
      <p className="module-library-label">显示在侧边栏 · {added.length}</p>
      <div className="module-options">
        {added.map((item) => (
          <button
            key={item.key}
            className="added"
            disabled={busy}
            onClick={() => onRemove(item.key)}
            title="从侧边栏移出（数据保留）"
          >
            <i style={{ background: item.color }} />
            <div>
              <b>{item.name}</b>
              <span>{item.template} 模板</span>
            </div>
            <em>移出</em>
            <Icon name="close" size={16} />
          </button>
        ))}
        {!added.length && <p className="muted-text">侧边栏里还没有模块</p>}
      </div>

      <p className="module-library-label">已隐藏 · {available.length}</p>
      <div className="module-options">
        {available.map((item) => (
          <button key={item.key} disabled={busy} onClick={() => onAdd(item.key)} title="加回侧边栏">
            <i style={{ background: item.color }} />
            <div>
              <b>{item.name}</b>
              <span>{item.template} 模板</span>
            </div>
            <em>添加</em>
            <Icon name="plus" size={16} />
          </button>
        ))}
        {!available.length && <p className="muted-text">所有模块都已在侧边栏中</p>}
      </div>
    </Modal>
  );
}
