import { useLoaderData } from 'react-router-dom'
import '../../App.css'
import Header from '../../components/Header'
import MessageContainer from '../../components/MessageContainer'
import DashboardLayout from '../../layouts/DashboardLayout'

function ChatView() {
  const { thread } = useLoaderData() as { thread: { id: number } }

  return (
    <>
      <DashboardLayout>
        <Header leaveChatThreadId={thread.id} />
        <div className="chatContainer">
          <MessageContainer threadId={thread.id} />
        </div>
      </DashboardLayout>
    </>
  )
}

export default ChatView
