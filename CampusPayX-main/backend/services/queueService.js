let queue = [];
let ioInstance;

const setupQueueSocket = (io) => {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    // Send current queue to newly connected client
    socket.emit('queueUpdate', queue);

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });

    socket.on('callNext', () => {
      if (queue.length > 0) {
        const nextStudent = queue.shift();
        
        // Notify everyone of the new queue
        io.emit('queueUpdate', queue);
        
        // Broadcast the specific student called over socket
        io.emit('studentCalled', nextStudent);
      }
    });
  });
};

const addToQueue = (transactionId, studentName, rollNumber, amount) => {
  const queueItem = {
    id: transactionId,
    studentName,
    rollNumber,
    amount,
    status: 'waiting',
    timestamp: new Date()
  };
  
  queue.push(queueItem);
  
  if (ioInstance) {
    ioInstance.emit('queueUpdate', queue);
  }
};

const getQueue = () => queue;

module.exports = {
  setupQueueSocket,
  addToQueue,
  getQueue
};
