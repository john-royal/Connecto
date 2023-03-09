import app from '.'
import { Server, Socket } from 'socket.io';

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})

const io = new Server(server);

io.on('connection', (socket: Socket) => {
  console.log('New client connected');

  // Listen for incoming messages
  socket.on('message', (data: string) => {
    console.log(`Message received: ${data}`);

    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});