import { useCallback, useEffect, useState } from 'react'
import { detectLanguage, STRINGS } from '../../../config/i18n.js'
import { sendChatRequest } from '../../../services/api/chatApi.js'
import {
  createConversation,
  loadActiveConversationId,
  loadConversations,
  recentChatTitle,
  saveActiveConversationId,
  saveConversations,
} from '../../../services/storage/conversationStorage.js'
import { cleanAssistantReply } from '../../../utils/cleanAssistantReply.js'

export function useChatWorkspace({ activeLanguage, languageMode, setActiveLanguage, strings }) {
  const [conversations, setConversations] = useState(() => {
    const stored = loadConversations()
    return stored.length ? stored : [createConversation(STRINGS.en.welcomeMessage)]
  })
  const [activeConversationId, setActiveConversationId] = useState(() => {
    const stored = loadConversations()
    return loadActiveConversationId(stored)
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0]
  const messages = activeConversation?.messages || [{ role: 'assistant', content: strings.welcomeMessage }]

  const persistConversations = useCallback((updater) => {
    setConversations((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const sorted = [...next].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      saveConversations(sorted)
      return sorted
    })
  }, [])

  useEffect(() => {
    saveActiveConversationId(activeConversationId)
  }, [activeConversationId])

  useEffect(() => {
    saveConversations(conversations)
  }, [])

  useEffect(() => {
    if (!activeConversationId && conversations[0]?.id) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversationId, conversations])

  useEffect(() => {
    persistConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.messages.length === 1 && conversation.messages[0].role === 'assistant') {
          return {
            ...conversation,
            messages: [{ role: 'assistant', content: strings.welcomeMessage }],
          }
        }
        return conversation
      })
    )
  }, [activeLanguage, persistConversations, strings.welcomeMessage])

  const createNewChat = useCallback(() => {
    const conversation = createConversation(strings.welcomeMessage)
    persistConversations((prev) => [conversation, ...prev])
    setActiveConversationId(conversation.id)
    setError(null)
    return conversation.id
  }, [persistConversations, strings.welcomeMessage])

  const selectConversation = useCallback((conversationId) => {
    setActiveConversationId(conversationId)
    setError(null)
  }, [])

  const renameConversation = useCallback(
    (conversationId) => {
      const current = conversations.find((chat) => chat.id === conversationId)
      if (!current) return
      const nextTitle = window.prompt(strings.renameChatPrompt, current.title)
      const normalized = recentChatTitle(nextTitle)
      if (!normalized) return
      persistConversations((prev) =>
        prev.map((chat) =>
          chat.id === conversationId ? { ...chat, title: normalized, updatedAt: Date.now() } : chat
        )
      )
    },
    [conversations, persistConversations, strings.renameChatPrompt]
  )

  const deleteConversation = useCallback(
    (conversationId) => {
      const current = conversations.find((chat) => chat.id === conversationId)
      if (!current) return null
      if (!window.confirm(strings.deleteChatConfirm)) return null

      const remaining = conversations.filter((chat) => chat.id !== conversationId)
      const nextConversations = remaining.length ? remaining : [createConversation(strings.welcomeMessage)]
      const nextActiveId =
        conversationId === activeConversationId ? nextConversations[0].id : activeConversationId
      persistConversations(nextConversations)
      setActiveConversationId(nextActiveId)
      setError(null)
      return nextActiveId
    },
    [activeConversationId, conversations, persistConversations, strings.deleteChatConfirm, strings.welcomeMessage]
  )

  const sendMessage = useCallback(
    async (text, imageDataUrl = null, options = {}) => {
      const trimmed = (text || '').trim()
      if (!trimmed && !imageDataUrl) return
      if (isLoading) return
      const conversationId = activeConversation?.id
      if (!conversationId) return

      const detected =
        trimmed && languageMode === 'auto' ? detectLanguage(trimmed) : activeLanguage
      if (detected !== activeLanguage) setActiveLanguage(detected)

      const intent = options.intent || (imageDataUrl && options.diseaseMode ? 'disease' : 'general')
      const userTurn = { role: 'user', content: trimmed, image: imageDataUrl }
      const nextMessages = [...messages, userTurn]
      const title = recentChatTitle(trimmed || (imageDataUrl ? strings.detectDisease : ''))

      setError(null)
      if (title) {
        persistConversations((prev) =>
          prev.map((conversation) => {
            if (conversation.id !== conversationId) return conversation
            const hasUserMessage = conversation.messages.some((message) => message.role === 'user')
            return {
              ...conversation,
              title: hasUserMessage ? conversation.title : title,
              updatedAt: Date.now(),
              messages: nextMessages,
            }
          })
        )
      }
      setIsLoading(true)

      try {
        const data = await sendChatRequest({
          message: trimmed,
          image: imageDataUrl,
          language: detected,
          intent,
          history: messages.map((message) => ({ role: message.role, content: message.content || '' })),
        })

        persistConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: Date.now(),
                  messages: [
                    ...conversation.messages,
                    { role: 'assistant', content: cleanAssistantReply(data.reply) },
                  ],
                }
              : conversation
          )
        )
      } catch (err) {
        setError(err.message || 'Something went wrong talking to the AI service.')
      } finally {
        setIsLoading(false)
      }
    },
    [
      activeConversation?.id,
      activeLanguage,
      isLoading,
      languageMode,
      messages,
      persistConversations,
      setActiveLanguage,
      strings.detectDisease,
    ]
  )

  return {
    activeConversationId,
    conversations,
    messages,
    isLoading,
    error,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
  }
}
