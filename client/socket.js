var socket = io('//' + window.location.host);

socket.on('GameActions', function (data) {
    console.log(data);
});

module.exports = socket;