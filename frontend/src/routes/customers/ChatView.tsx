import '../../App.css'
import { useLoaderData } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import MessageContainer from '../../components/MessageContainer'
import Header from '../../components/Header'

function ChatView() {
  const { thread } = useLoaderData() as { thread: { id: number } }

  return (
    <>
      <DashboardLayout>
        <Header leaveChat={true}/>
        <div className="chatContainer">
          <MessageContainer threadId={thread.id} />
        </div>
      </DashboardLayout>
    </>
  )
}

export default ChatView
