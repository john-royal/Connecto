import useSWR from 'swr'
import '../../App.css'
import Header from '../../components/Header'
import LoadingView from '../../components/LoadingView'
import MessageContainer from '../../components/MessageContainer'

function ChatView() {
  const { data: thread } = useSWR('/api/threads', async (url) => {
    const { threads } = await (await fetch(url)).json()
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
  })

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

export default ChatView
