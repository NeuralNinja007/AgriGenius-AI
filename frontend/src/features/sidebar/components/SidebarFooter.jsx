export default function SidebarFooter({ strings }) {
  return (
    <div className="intro-footer">
      <div className="sidebar-status">
        <span className="sidebar-status-dot" aria-hidden="true" />
        <span>{strings.sidebarStatus}</span>
      </div>
      <div className="sidebar-powered">{strings.poweredBy}</div>
    </div>
  )
}
