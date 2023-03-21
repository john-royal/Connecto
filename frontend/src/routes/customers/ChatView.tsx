import { redirect, useLoaderData } from 'react-router-dom'
import '../../App.css'
import Header from '../../components/Header'
import MessageContainer from '../../components/MessageContainer'

interface Thread {
  id: number
}

export default function ChatView() {
  const thread = useLoaderData() as Thread

  return (
    <>
      <Header leaveChatThreadId={thread.id} />
      <div className="chatContainer">
        <MessageContainer threadId={thread.id} />
      </div>
    </>
  )
}

export const loadOrCreateThread = async () => {
  const existingThreadsResponse = await fetch('/api/threads')
  if (existingThreadsResponse.status === 401) {
    return redirect('/sign-in?redirect=/chat')
  }
  const { threads } = await existingThreadsResponse.json()
  if (threads.length > 0) {
    return threads[0]
  }
  const newThreadsResponse = await fetch('/api/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{}'
  })
  const { thread } = await newThreadsResponse.json()
  return thread
}
