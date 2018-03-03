const path = require('path'); //nodejs 内置module
const http = require('http'); //nodejs
const express = require('express'); //利用nodejs的http请求
const socketIO = require('socket.io'); // websocket 请求 后端的库

const {generateMessage, generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app); // 默认使用http请求，这里是为了区分出来
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => { // websocket事件 --- 连接
    console.log('New user connected');

    socket.emit('newMessage', generateMessage('管理员', '欢迎来到聊天室'));

    socket.broadcast.emit('newMessage', generateMessage('管理员', '有新成员加入'));

    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('管理员', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
