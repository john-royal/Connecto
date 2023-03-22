import { useParams } from 'react-router-dom'
import '../../App.css'
import MessageContainer from '../../components/MessageContainer'

function AdminChatView() {
  const params = useParams<{ threadId: string }>()
  const threadId = Number(params.threadId)

  return (
    <div className="adminChatContainer">
      <MessageContainer threadId={threadId} key={threadId} />
    </div>
  )
}

export default AdminChatView
