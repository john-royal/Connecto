import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import { Fragment, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../../App.css'
import DashboardLayout from '../../layouts/DashboardLayout'
import { useAuth } from '../../lib/auth'
import { useChat } from '../../lib/chat'

function MessageContainer({ threadId }: { threadId: number }) {
  const { messages, sendMessage } = useChat(threadId)
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage(inputValue)
      .then(() => {
        setInputValue('')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <>
      <DashboardLayout>
        <div className="adminChatContainer">
          <div className="chatMessages">
            <ul>
              {messages
                .map((message) => ({
                  message,
                  isMe: message.user.id === user?.id
                }))
                .map(({ message, isMe }) =>
                  isMe ? (
                    <Fragment key={message.id}>
                      <div className="rightMessageName">
                        {message.user.name}
                      </div>
                      <div className="rightMessageBubble">
                        <li>{message.content}</li>
                      </div>
                    </Fragment>
                  ) : (
                    <Fragment key={message.id}>
                      <div className="leftMessageName">{message.user.name}</div>
                      <div className="leftMessageBubble">
                        <li>{message.content}</li>
                      </div>
                    </Fragment>
                  )
                )}
            </ul>
          </div>
          <div className="chatInputs">
            <form onSubmit={handleSubmit}>
              <div className="attachFileButton">
                <button type="submit">
                  <AttachFileIcon
                    sx={{
                      height: 0.8,
                      width: 0.9,
                      minHeight: 20,
                      minWidth: 20
                    }}
                  />
                  <input hidden accept="image/*" multiple type="file" />
                </button>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value)
                }}
              />
              <div className="sendButton">
                <button type="submit">
                  <SendIcon
                    sx={{
                      height: 0.8,
                      width: 0.9,
                      minHeight: 20,
                      minWidth: 20
                    }}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

function AdminChatView() {
  const { threadId } = useParams<{ threadId: string }>()

  return <MessageContainer threadId={Number(threadId)} />
}

export default AdminChatView
