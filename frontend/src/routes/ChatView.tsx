import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { io, Socket } from 'socket.io-client';

function ChatView() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const newSocket = io();

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (newMessage: string) => {
      setMessages((messages) => [...messages, newMessage]);
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (socket && inputValue) {
      socket.emit('message', inputValue);
      setInputValue('');
    }
  }

  return (
    <DashboardLayout sidebarItems={<LeaveChatButton />}>
      <div>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function LeaveChatButton(): JSX.Element {
  const card = (
    <Card>
      <CardContent>
        <Typography level="h4" component="div">
          Leave Chat
        </Typography>
        <CloseIcon sx={{ fontSize: 75, color: '#5e8b8f' }} />
      </CardContent>
    </Card>
  );

  return (
    <div className="LeaveChat">
      <Box sx={{ minWidth: 100, minHeight: 100, border: 3, borderColor: '#59606D' }}>
        <Link to="/">{card}</Link>
      </Box>
    </div>
  );
}

export default ChatView;
