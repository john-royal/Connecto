import { useEffect, useState } from 'react'
import { redirect } from 'react-router-dom'
import '../../App.css'
import Header from '../../components/Header'
import LoadingView from '../../components/LoadingView'
import MessageContainer from '../../components/MessageContainer'

interface Thread {
  id: number
}

function ChatView() {
  const [thread, setThread] = useState<Thread | null>(null)

  useEffect(() => {
    void loadOrCreateThread().then(setThread)
  }, [])

  if (thread == null) {
    return <LoadingView />
  }

  return (
    <>
      <Header leaveChatThreadId={thread.id} />
      <div className="chatContainer">
        <MessageContainer threadId={thread.id} />
      </div>
    </>
  )
}

const loadOrCreateThread = async () => {
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

export default ChatView
