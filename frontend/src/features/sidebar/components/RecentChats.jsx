import { NavIcon } from '../../../components/common/Icons.jsx'

export default function RecentChats({
  strings,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  const recentConversations = conversations
    .filter((conversation) => conversation.messages?.some((message) => message.role === 'user'))
    .slice(0, 8)

  return (
    <section className="sidebar-section recent-chats" aria-labelledby="recent-chats-title">
      <h2 id="recent-chats-title">{strings.recentChatsTitle}</h2>
      {recentConversations.length ? (
        <ul>
          {recentConversations.map((conversation) => (
            <li key={conversation.id} className={conversation.id === activeConversationId ? 'active' : ''}>
              <button
                type="button"
                className="chat-history-select"
                onClick={() => onSelectConversation?.(conversation.id)}
                title={conversation.title}
              >
                <NavIcon id="clock" />
                <span>{conversation.title}</span>
              </button>
              <div className="chat-row-actions" aria-label={strings.chatActions}>
                <span className="chat-more" aria-hidden="true">
                  <NavIcon id="more" />
                </span>
                <button
                  type="button"
                  onClick={() => onRenameConversation?.(conversation.id)}
                  aria-label={strings.renameChat}
                  title={strings.renameChat}
                >
                  <NavIcon id="edit" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConversation?.(conversation.id)}
                  aria-label={strings.deleteChat}
                  title={strings.deleteChat}
                >
                  <NavIcon id="trash" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="recent-empty">
          <NavIcon id="chat" />
          <p>{strings.noRecentChats}</p>
        </div>
      )}
    </section>
  )
}
