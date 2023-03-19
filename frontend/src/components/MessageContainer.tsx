import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import IconButton from '@mui/joy/IconButton'
import {
  Fragment,
  useRef,
  useState,
  type FormEventHandler,
  type MouseEventHandler
} from 'react'
import { useAuth } from '../lib/auth'
import { useChat } from '../lib/chat'

function MessageContainer({ threadId }: { threadId: number }) {
  const { messages, sendMessage } = useChat(threadId)
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadButton: MouseEventHandler = (e) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    sendMessage({
      content: inputValue,
      attachment: fileInputRef.current?.files?.[0]
    })
      .then(() => {
        setInputValue('')
        ;(fileInputRef.current as HTMLInputElement).value = ''
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <>
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
                  <div className="rightMessageName">{message.user.name}</div>
                  {message.attachmentUrl != null && (
                    <div className="rightMessageBubble">
                      <img
                        src={message.attachmentUrl}
                        alt="attachment"
                        width={100}
                      />
                    </div>
                  )}
                  <div className="rightMessageBubble">
                    <li>{message.content}</li>
                  </div>
                </Fragment>
              ) : (
                <Fragment key={message.id}>
                  <div className="leftMessageName">{message.user.name}</div>
                  {message.attachmentUrl != null && (
                    <div className="rightMessageBubble">
                      <img
                        src={message.attachmentUrl}
                        alt="attachment"
                        width={100}
                      />
                    </div>
                  )}
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
          <input accept="image/*" type="file" ref={fileInputRef} hidden />
          <div className="attachFileButton">
            <IconButton type="submit" onClick={handleUploadButton}>
              <AttachFileIcon />
            </IconButton>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value)
            }}
            required
            placeholder="Enter message"
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
    </>
  )
}

export default MessageContainer
