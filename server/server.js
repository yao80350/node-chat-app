const path = require('path'); //nodejs 内置module
const http = require('http'); //nodejs
const express = require('express'); //利用nodejs的http请求
const socketIO = require('socket.io'); // websocket 请求 后端的库

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app); // 默认使用http请求，这里是为了区分出来
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => { // websocket事件 --- 连接
    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required.');
        }

        socket.join(params.room); // 凭借socket.join内的string连接到相同房间，才可以用下面的.to()
        users.removeUser(socket.id); // 暂时不知道什么作用
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('管理员', '欢迎来到聊天室'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('管理员', `${params.name}加入了房间`));
        callback();
    });

    socket.on('createMessage', (message, callback) => {
        let user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }

        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name}离开了`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
