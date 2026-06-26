import { NavIcon } from '../../../components/common/Icons.jsx'

export default function SidebarNavSection({ id, title, actions, activeActionId, disabled, onAction }) {
  return (
    <nav className={`sidebar-section ${id}-nav`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="sidebar-nav-list">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`sidebar-nav-item ${activeActionId === action.id ? 'active' : ''}`}
            disabled={disabled}
            onClick={() => onAction(action)}
          >
            <NavIcon id={action.id} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
