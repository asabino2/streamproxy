const { spawn } = require('child_process');
const express = require('express');
var config = {};
try {
    const fs = require("fs");
    const jsonString = fs.readFileSync("./config.json");
    config = JSON.parse(jsonString);
} catch (err) {
    config = { port: 3000, stramlinkpath: "", ffmpegpath: "" };
}
//console.log("port: " + config.port);


const app = express();
var portlisten = process.argv[2];
var streamlinkapp = "streamlink";
var ffmpegapp = "ffmpeg";
var ippublic = "";
var publicip = "44";

if (config.streamlinkpath == undefined) {
    config.streamlinkpath = "";
}

if (config.ffmpegpath == undefined) {
    config.ffmpegpath = "";
}




console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                         A Proxy for the livestreams         ")
console.log("                                     Developed by Alexander Sabino in 2022   ")



console.log("");
console.log("starting...")
console.log("");
console.log("streamproxy is listening on port ", config.port)
app.get('/videostream/streamlink', (req, res) => {
    url = req.query.url;
    const stream = spawn(config.streamlinkpath + "streamlink", [url, 'best', '--stdout']);
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    //console.log("ended");
    stream.on('spawn', () => {
        console.log("playing... (" + stream.pid + ")");

    })
    stream.on('close', (code, signal) => {
        console.log("close stop code " + code + " signal " + signal);
    })

    stream.on('exit', (code, signal) => {
        console.log("exit stop code " + code + " signal " + signal);
    })

    req.on('close', () => {
        console.log("closed connection");
        stream.kill();
    })

});




app.get('/videostream/ffmpeg', (req, res) => {
    url = req.query.url;

    const stream = spawn(config.ffmpegpath + 'ffmpeg', ['-loglevel', 'fatal', '-i', url, '-vcodec', 'mpeg2video', '-acodec', 'aac', '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=streamproxy', '-f', 'mpegts', '-tune', 'zerolatency', '-']);

    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);




});



app.get('/videostream/info', (req, res) => {
    url = req.query.url;
    var returncommand = "";
    var commandffmpeg = config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams " + url;
    var status = "";
    var erro = "";

    try {
        var child_process = require("child_process");
        var returncommand = child_process.execSync(commandffmpeg);
        res.setHeader('content-type', 'application/json');
        res.send(returncommand);
    } catch (e) {
        status = "offline";
        erro = e.message;
        res.json({ error: "true", message: e.message });
    }
});

app.get('/videostream/checkstream', (req, res) => {
    url = req.query.url;
    var commandffmpeg = config.ffmpegpath + "ffmpeg -ss 00:00:01 -i \"" + url + "\" -vframes 1 -q:v 2 -f null -";
    var status = "";
    var erro = "";

    try {
        retunrcommand = require('child_process').execSync(commandffmpeg);
        status = "online";
    } catch (e) {
        status = "offline";
        erro = e.message;
    }
    res.json({ streamurl: url, streamstatus: status, mensagem: erro });
});




app.get('/info', (req, res) => {
    res.json({ teste: "true" });
});





app.get('/', async function(req, res) {
    const https = require("https");
    https.get('https://asabino2.github.io/streamproxy.html', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;

        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log("response data: " + data);
            res.send(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);

    });

});




app.listen(config.port);

function announceServers() {
    var http = require('http');
    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function(resp) {
        resp.on('data', function(ip) {
            publicip = ip;
            console.log("server on internet http://" + publicip + ":" + portlisten + "/");
        });
    });
}


function loadconfig() {

}