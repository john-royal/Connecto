import { useParams } from 'react-router-dom'
import '../../App.css'
import MessageContainer from '../../components/MessageContainer'


function AdminChatView() {
  const { threadId } = useParams<{ threadId: string }>()

  return (
    <div className="adminChatContainer">
      <MessageContainer threadId={Number(threadId)} />
    </div>
  )
}

export default AdminChatView