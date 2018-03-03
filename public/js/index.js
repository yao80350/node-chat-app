var socket = io();

// 前端网页es6兼容少，所以改es5
socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
    console.log('newMessage', message);
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);

    jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
    // 后端数据与li a 分开(防止jQuery送的string被篡改)
    var li = jQuery('<li></li>');
    var a = jQuery('<a target="_blank">这是我的当前位置</a>');

    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);
    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();

    var messageTextbox = jQuery('[name=message]');

    socket.emit('createMessage', {
        from: '用户',
        text: messageTextbox.val()
    }, function() {
        messageTextbox.val('');
    });
});

var locationButton = jQuery('#send-location');
locationButton.on("click", function(e) {
    // PC geolocation 需要用到google定位服务，所有需要翻墙。手机有google定位的话可以用。
    // position是翻墙给的position
    // 国内可以用 https://api.map.baidu.com/location/ip?ip=&ak=54HTqRT5AzWhub69FfOhGUrVaPiXX8qL&coor=bd09ll
    if (!navigator.geolocation) {
        return alert("你的浏览器不支持Geolocation.");
    }

    locationButton.attr('disabled', 'disabled').text('发送中...');

    navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        locationButton.removeAttr('disabled').text('发送位置');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() { // err 比如拿position需要用户同意,拒绝会失败
        //上线后的链接需要是https才能用geolocation
        locationButton.removeAttr('disabled').text('发送位置');
        alert('无法获取你的位置.');
    });
});
