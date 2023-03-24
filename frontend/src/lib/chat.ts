import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import useSWR, { useSWRConfig } from 'swr'
import { useAuth, type User } from './auth'

export interface Thread {
  id: number
  createdAt: string
  updatedAt: string
  customer: { id: number; name: string }
  messages: Message[]
}

export interface Message {
  id: string
  user: User
  content: string
  attachmentUrl?: string
  latitude?: number
  longitude?: number
  createdAt: string
}

export interface MessageInit {
  content: string
  attachment?: File
  latitude?: number
  longitude?: number
}

export interface Chat {
  completions: string[]
  typing?: { name: string }
  message: MessageInit
  setMessage: React.Dispatch<React.SetStateAction<MessageInit>>
  messages: Message[]
  sendMessage: (message: MessageInit) => Promise<void>
}

export function useChat(threadId: number): Chat {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const { data, mutate } = useSWR<Thread>(
    `/api/threads/${threadId}`,
    async (url: string) => {
      return await fetch(url)
        .then(async (res) => await res.json())
        .then(({ thread }) => thread)
    }
  )
  const [completions, setCompletions] = useState<string[]>([])
  const [typing, setTyping] = useState<{ name: string } | undefined>(undefined)
  const [message, setMessage] = useState<MessageInit>({
    content: '',
    attachment: undefined,
    latitude: undefined,
    longitude: undefined
  })
  const swrConfig = useSWRConfig()
  const messages = (data?.messages ?? []).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  useEffect(() => {
    const newSocket = io()

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
    }
  }, [threadId])

  useEffect(() => {
    if (!socket || !user) return
    else if (message.content === '' && message.attachment == null) {
      socket.emit('stop typing')
      return
    }

    socket.emit('typing')

    const timeout = setTimeout(() => {
      socket.emit('stop typing')
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [socket, user, message])

  useEffect(() => {
    if (!socket || !user) return

    socket.on('connect', () => {
      console.log('[socket] connected')
      socket.emit('join', { id: threadId })
    })
    socket.on('joined', ({ id }: { id: number }) => {
      console.log(`[socket] joined thread ${id}`)
    })
    socket.on('disconnect', () => {
      console.log('[socket] disconnected')
    })
    socket.on('message', (message: Message) => {
      console.log('[socket] received message: ', message)
      if (!messages.some((m) => m.id === message.id)) {
        void mutate((thread?: Thread) => {
          if (thread == null) return
          return {
            ...thread,
            updatedAt: message.createdAt,
            messages: [...(thread?.messages ?? []), message].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
          }
        }, false)
      }
    })
    socket.on('typing', (user?: { name: string }) => {
      console.log('[socket] received typing: ', typing)
      setTyping(user)
    })
    socket.on('stop typing', () => {
      console.log('[socket] received stop typing')
      setTyping(undefined)
    })
    socket.on('error', (err: Error) => {
      console.error('[socket] error', err)
    })
    socket.on(
      'completions',
      ({ admin, completions }: { admin: boolean; completions: string[] }) => {
        console.log('[socket] received completions: ', { admin, completions })
        if (admin !== user.isAdmin) return
        setCompletions(completions)
      }
    )

    return () => {
      socket.off('connect')
      socket.off('joined')
      socket.off('disconnect')
      socket.off('message')
      socket.off('error')
    }
  }, [socket, user, threadId])

  // update swr master list of threads
  useEffect(() => {
    if (!socket || !user || !data) return
    void swrConfig.mutate('/api/threads')
  }, [socket, user, data])

  const sendMessage = async ({
    content,
    attachment,
    latitude,
    longitude
  }: MessageInit): Promise<void> => {
    if (!socket || !user) throw new Error('Not connected to chat')

    let attachmentUrl: string | undefined

    if (attachment != null) {
      const data = new FormData()
      data.append('file', attachment)
      const uploadResult = await fetch('/api/attachment', {
        method: 'POST',
        body: data
      }).then(async (res) => await res.json())
      attachmentUrl = uploadResult.attachmentUrl
    }
    setCompletions([])
    socket.emit('message', {
      content,
      attachmentUrl,
      latitude,
      longitude
    })

    await new Promise<void>((resolve, reject) => {
      socket.once('message', () => {
        resolve()
      })
      socket.once('error', (err: Error) => {
        reject(err)
      })
    })
  }

  return {
    completions: completions ?? [],
    messages,
    sendMessage,
    message,
    setMessage,
    typing
  }
}
