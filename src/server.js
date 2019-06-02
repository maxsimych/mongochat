import mongodb from 'mongodb'
import socketIo from 'socket.io';
const mongo = mongodb.MongoClient;
const io = socketIo.listen(4000).sockets;

(async () => {
  try {
    const db = (await mongo.connect('mongodb://localhost/mongochat', { useNewUrlParser: true })).db('mongochat');
    console.log(`MongoDB connected!`);
    io.on('connection', async (socket) => {
      try {
        const chat = db.collection('chats');
        const sendStatus = (s) => {
          socket.emit('status', s);
        };
        const res = await chat.find().limit(100).sort({_id:1}).toArray();
        socket.on('input', async (data) => {
          try {
            const name = data.name;
            const message = data.message;
            if(name == ''|| message == '') {
              sendStatus('Please enter a name and message');
            } else {
              await chat.insert({name: name, message: message});
              io.emit('output', [data]);
              sendStatus({
                message: 'message sent',
                clear: true
              });
            };
          } catch(error) {
            throw error;
          };
        });
        socket.on('clear', async () => {
          try {
            await chat.remove({});
            io.emit('cleared');
          } catch(error) {
            throw error;
          };
        });
      } catch(error) {
        throw error;
      };
    }); 
  } catch(error) {
    console.log(`Error: ${error}`);
  };
})();