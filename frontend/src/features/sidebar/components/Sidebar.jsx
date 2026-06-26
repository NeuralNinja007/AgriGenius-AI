import { useState } from 'react'
import { NavIcon } from '../../../components/common/Icons.jsx'
import BrandMark from './BrandMark.jsx'
import FarmingTipCard from './FarmingTipCard.jsx'
import RecentChats from './RecentChats.jsx'
import SidebarFooter from './SidebarFooter.jsx'
import SidebarNavSection from './SidebarNavSection.jsx'

export default function Sidebar({
  strings,
  languageToggle,
  cropActions = [],
  informationActions = [],
  conversations = [],
  activeConversationId,
  onCropAction,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  disabled,
  className = '',
  onCloseMobile,
}) {
  const [activeCropId, setActiveCropId] = useState(null)
  const [activeInfoId, setActiveInfoId] = useState(null)

  const handleCropAction = (action) => {
    setActiveCropId(action.id)
    onCropAction?.(action)
  }

  const handleInfoAction = (action) => {
    setActiveInfoId(action.id)
    onCropAction?.(action)
  }

  return (
    <aside className={`intro-panel ${className}`}>
      <div className="sidebar-main">
        <div className="intro-top-row">
          <div className="brand">
            <BrandMark />
            <div className="brand-copy">
              <span className="brand-name">{strings.brandName}</span>
              <span className="brand-subtitle">{strings.brandSubtitle}</span>
            </div>
          </div>

          {onCloseMobile && (
            <button type="button" className="mobile-close-btn" onClick={onCloseMobile} aria-label="Close menu">
              ×
            </button>
          )}
        </div>

        <div className="sidebar-language">{languageToggle}</div>

        <button type="button" className="new-chat-btn" onClick={onNewChat}>
          <NavIcon id="plus" />
          <span>{strings.newChat}</span>
        </button>

        <SidebarNavSection
          id="crop-support"
          title={strings.cropSupportGroup}
          actions={cropActions}
          activeActionId={activeCropId}
          disabled={disabled}
          onAction={handleCropAction}
        />

        <SidebarNavSection
          id="information"
          title={strings.informationGroup}
          actions={informationActions}
          activeActionId={activeInfoId}
          disabled={disabled}
          onAction={handleInfoAction}
        />

        <RecentChats
          strings={strings}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
        />

        <FarmingTipCard strings={strings} />
      </div>

      <SidebarFooter strings={strings} />
    </aside>
  )
}
