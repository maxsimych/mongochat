import mongodb from 'mongodb'
import socketIo from 'socket.io';
const mongo = mongodb.MongoClient;
const client = socketIo.listen(4000).sockets;

mongo.connect('mongodb://127.0.0.1:27017/mongochat', (err, db) => {
  if(err) {
    throw err;
  };

  console.log('MongoDB connected!');
  client.on('connection', (socket) => {
    const chat = db.collection('chats');
    const sendStatus = (s) => {
      socket.emit('status', s);
    }
    chat.find().limit(100).sort({_id:1}).toArray((err,res) =>{
      if (err) {
        throw err;
      }
      socket.emit('output', res);
    });
    socket.on('input', (data) => {
      const name = data.name;
      const message = data.message;

      if(name == ''|| message == '') {
        sendStatus('Please enter a name and message');
      } else {
        chat.insert({name: name, message: message}, () => {
          client.emit('output', [data]);
          sendStatus({
            message: 'message sent',
            clear: true
          })
        });
      };
    });
    socket.on('clear', (data) => {
      chat.remove({},() => {
        socket.emit('cleared');
      });
    });
  });
});