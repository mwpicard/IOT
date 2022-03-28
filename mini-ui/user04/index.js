const userName = "user04"
    , modulePath = `/${userName}/`
    ;

function configureRtspsStream(server) {
    const io = require("socket.io")(server)
        , rtsp = require("rtsp-ffmpeg");

    //setup rtsps streaming
    var stream = new rtsp.FFMpeg({
        input: "rtsps://192.168.0.159:7441/PpWjQBlt5uMxp5Zw?enableSrtp",
        resolution: '640x480',
        quality: 3
    });
    stream.on('start', function () {
        console.log('stream started');
    });
    stream.on('stop', function () {
        console.log('stream stopped');
    });

    var ns = io.of('/cam');
    ns.on('connection', function (wsocket) {
        console.log('connected to /cam');
        var pipeStream = function (data) {
            wsocket.emit('data', data);
        };
        stream.on('data', pipeStream);

        wsocket.on('disconnect', function () {
            console.log('disconnected from /cam');
            stream.removeListener('data', pipeStream);
        });
    });

    io.on('connection', function (socket) {
        socket.emit('start', "rtsps://192.168.0.159:7441/PpWjQBlt5uMxp5Zw?enableSrtp");
    });
}

function registerMiniUi(app, basicAuth) {
    //register static paths
    app.use(modulePath + "assets", require("express").static(__dirname + "/assets"));
    
    //register authentication
    const basicAuthUsers = {};
    basicAuthUsers[userName] = process.env.USER04_SECRET;
    app.use(modulePath, basicAuth({
        users: basicAuthUsers,
        challenge: true
    }));
    //serve index.html
    app.get(modulePath, (req, res) => {
        res.sendFile(__dirname + "/index.html");
    });
}

module.exports = {
    userName: userName,
    path: modulePath,
    commandIsValid: (cmd) => {
        return cmd === "shellies_Relay0_MomentaryOnOff";
    },
    register: (app, server, basicAuth) => {
        registerMiniUi(app, basicAuth);
        configureRtspsStream(server);
    }
};