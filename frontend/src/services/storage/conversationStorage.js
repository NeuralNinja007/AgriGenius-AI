export const CONVERSATIONS_KEY = 'agrigenius_conversations'
export const ACTIVE_CONVERSATION_KEY = 'agrigenius_active_conversation'

export function recentChatTitle(text) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return null
  return normalized.length > 42 ? `${normalized.slice(0, 41).trim()}...` : normalized
}

export function createConversation(welcomeMessage) {
  const id =
    window.crypto?.randomUUID?.() ||
    `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return {
    id,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: 'assistant', content: welcomeMessage }],
  }
}

export function loadConversations() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONVERSATIONS_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed
          .filter((chat) => chat?.id && Array.isArray(chat.messages))
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      : []
  } catch {
    return []
  }
}

export function saveConversations(conversations) {
  try {
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch {
    // Local storage is optional; the in-memory workspace still works.
  }
}

export function loadActiveConversationId(conversations) {
  const storedActiveId = window.localStorage.getItem(ACTIVE_CONVERSATION_KEY)
  return conversations.find((chat) => chat.id === storedActiveId)?.id || conversations[0]?.id || null
}

export function saveActiveConversationId(conversationId) {
  if (conversationId) {
    window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId)
  }
}
