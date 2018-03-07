var socket = io();

function scrollToBottom() {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight(); // newMessage包括padding的高
    var lastMessageHeight = newMessage.prev().innerHeight(); // mewMessage前一个

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight); //将scrollTop值设为scrollHeight保证最大---也就是滚条一定推到最底部
    }
};

// 前端网页es6兼容少，所以改es5
socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
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
