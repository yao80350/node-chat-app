const path = require('path'); //nodejs 内置module
const http = require('http'); //nodejs
const express = require('express'); //利用nodejs的http请求
const socketIO = require('socket.io'); // websocket 请求 后端的库

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app); // 默认使用http请求，这里是为了区分出来
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => { // websocket事件 --- 连接
    console.log('New user connected');

    socket.emit('newMessage', { // server发给自己
        form: 'Admin',
        text: 'Welcome to the chat app'
    });

    socket.broadcast.emit('newMessage', { // server发给除去自己的所有人
        from: 'Admin',
        text: 'New user joined',
        createdAt: new Date().getTime()
    });

    socket.on('createMessage', (message) => {
        console.log('createMessage', message);
        io.emit('newMessage', { // server发给所有人
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        });
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
