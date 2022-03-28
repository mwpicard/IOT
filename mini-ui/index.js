require("dotenv").config();

const express = require("express")
    , app = express()
    , http = require("http")
    , server = http.Server(app)
    , basicAuth = require("express-basic-auth")
    , axios = require("axios")
    , PORT = process.env.PORT || 6147
    , uiRegistry = [
        require("./user04/index")
    ]
    ;

// make requests to /assets folder (ie. css) work
app.use("/assets", express.static(__dirname + "/assets"));

//command proxy
app.get('/command_proxy', function (req, res) {
    console.log(req.route.path);
    const command = req.query["command"];
    let userName = ""
        , foundRoute = false;
    uiRegistry.forEach(ui => {
        if (req.headers.referer && req.headers.referer.indexOf(ui.path) > -1 && ui.commandIsValid(command)) {
            foundRoute = true;
            userName = ui.userName;
        }
    });

    if (foundRoute) {
        const device = req.query["device"]
            , type = req.query["type"];

        //send command
        const url = "http://18.198.130.243/mytest/"
            , data = { userName: userName, device: device, type: type, command: command };

        axios({
            method: "POST",
            url: url,
            data: data,
            auth: {
                username: process.env.AMAZONPROXY_USERNAME,
                password: process.env.AMAZONPROXY_SECRET
            }
        })
            .then(response => {
                console.log("Successful response: " + response.data);
                res.send(response.data);
            })
            .catch(err => {
                console.error(err);
                res.status(400).send(err);
            });
    } else {
        res.status(404).send("Didn't find your command.");
    }
});

//home page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
uiRegistry.forEach(ui => ui.register(app, server, basicAuth));

//start server
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});