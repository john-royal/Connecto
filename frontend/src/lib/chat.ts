import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth, type User } from './auth'
import useSWR from 'swr'

export interface Message {
  id: string
  user: User
  content: string
  createdAt: Date
}

export interface Chat {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
}

export function useChat(threadId: number): Chat {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const { data, mutate } = useSWR<Message[]>(
    `/api/threads/${threadId}`,
    async (url: string) => {
      return await fetch(url)
        .then(async (res) => await res.json())
        .then(({ thread }) => thread.messages)
    }
  )
  const messages = data ?? []

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
      void mutate((messages) => [...(messages ?? []), message], false)
    })
    socket.on('error', (err: Error) => {
      console.error('[socket] error', err)
    })

    return () => {
      socket.off('connect')
      socket.off('joined')
      socket.off('disconnect')
      socket.off('message')
      socket.off('error')
    }
  }, [socket, user, threadId])

  const sendMessage = async (content: string): Promise<void> => {
    if (!socket || !user) throw new Error('Not connected to chat')
    socket.emit('message', content)
    await new Promise<void>((resolve, reject) => {
      socket.once('message', () => {
        resolve()
      })
      socket.once('error', (err: Error) => {
        reject(err)
      })
    })
  }

  return { messages, sendMessage }
}
