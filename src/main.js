/****************************************/
/* Stream Proxy - A Proxy a Livestream  */
/* Desenvolvido por Alexander Sabino    */
/************************************** */

const { spawn } = require('child_process');
const express = require('express');
var config = {};
var processes = [];
//import { loadconfig, addprocess } from './functions.js'


//console.log("port: " + config.port);
console.log("antes de ler as configurações");
//initialcheck();
loadconfig();
console.log("apos de ler as configurações");
// Initialization of variables
const app = express();
var portlisten = process.argv[2];
var ippublic = "";
var publicip = "44";





// Title screen
console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                         A Proxy for the livestreams         ")
console.log("                                     Developed by Alexander Sabino in 2022   ")



console.log("");
console.log("starting...")
console.log("");
console.log("streamproxy is listening on port ", config.port)
console.log("");
console.log("");
console.log("");

// Service for streamlink stream proxy
app.get('/videostream/streamlink', (req, res) => {


    url = req.query.url;
    console.log(`opening connect to stream in url ${url}`);

    const stream = spawn(config.streamlinkpath + "streamlink", [url, 'best', '--stdout']);
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    //console.log("ended");
    stream.on('spawn', () => { // on app initialization

        var spawncommand = stream.spawnargs;
        //console.log("to string " + spawncommand.toString());
        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        addprocess(url, stream.pid, "streamlink", spawncommand);
        console.log(`running streamlink app (PID ${stream.pid}) [${spawncommand}]`);
    })
    stream.on('close', (code, signal) => { // on app closed
        console.log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
        removeprocess(stream.pid);

    })

    stream.on('exit', (code, signal) => {
        //console.log("exit stop code " + code + " signal " + signal);
    })

    stream.on('error', (err) => { // on error on app
        console.log(`error ocurred: ${err}`);
        res.status(500).send("<h2>Error on calling streamlink app</h2><br>" + err)
    })

    stream.on('message', (message, sendHandle) => { // on message
        console.log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        console.log(`closed connection of url ${url}`);
        console.log(`kill PID ${stream.pid} of program streamlink`)
        stream.kill();
    })

});




app.get('/videostream/ffmpeg', (req, res) => {
    url = req.query.url;
    console.log(`opening connect to stream in url ${url} for ffmpeg`);
    const stream = spawn(config.ffmpegpath + 'ffmpeg', ['-loglevel', 'fatal', '-i', url, '-vcodec', config.ffmpeg.codec, '-acodec', 'aac', '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=' + config.ffmpeg.serviceprovider, '-f', config.ffmpeg.format, '-tune', 'zerolatency', '-']);

    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);

    stream.on('spawn', () => { // on app initialization

        var spawncommand = stream.spawnargs;
        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        //spawncommand = spawncommand.ReplaceAll(",", " ");
        addprocess(url, stream.pid, "ffmpeg", spawncommand);
        console.log(`running ffmpeg app (PID ${stream.pid}) [${spawncommand}]`);
    })
    stream.on('close', (code, signal) => { // on app closed
        console.log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);

    })

    stream.on('exit', (code, signal) => {
        //console.log("exit stop code " + code + " signal " + signal);
    })

    stream.on('error', (err) => { // on error on app
        console.log(`error ocurred: ${err}`);
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)
    })

    stream.on('message', (message, sendHandle) => {
        console.log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        console.log(`closed connection of url ${url}`);
        console.log(`kill PID ${stream.pid} of program ffmpeg`)
        stream.kill();
    })


});


// Get streaminfo: http://<ip>:<port>?url=<url>
app.get('/api/streaminfo', (req, res) => {
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
        try {
            var streamlinkprobe = ffprobeStreamlink(url);
            //console.log("streamlink info: "+streamlinkprobe)
            res.setHeader('content-type', 'application/json');
            res.send(streamlinkprobe);
        } catch (eStreamlink) {
            status = "offline";
            erro = e.message;
            res.json({ error: "true", message: e.message });
        }


    }
});

// Check stream: http://<ip>:<port>?url=<url>
app.get('/api/checkstream', (req, res) => {
    url = req.query.url;
    var commandffmpeg = config.ffmpegpath + "ffmpeg -ss 00:00:01 -i \"" + url + "\" -vframes 1 -q:v 2 -f null -";
    var status = "";
    var erro = "";

    try {
        retunrcommand = require('child_process').execSync(commandffmpeg);
        status = "online";
    } catch (e) {
        var streamlinkcheck = checkStreamlink(url);
        if (streamlinkcheck.streamstatus == "offline") {
            status = "offline";
            erro = e.message;
        } else {
            status = streamlinkcheck.streamstatus;
            erro = "get from streamlink";

        }

    }
    res.json({ streamurl: url, streamstatus: status, mensagem: erro });
});


/*
// only a test (will be used in future)
app.get('/info', (req, res) => {
    res.json({ teste: "true" });
});


app.get('/teste', (req, res) => {
    //res.status(900).send(JSON.stringify(processes));
    var child_process = require("child_process");
    var returncommand = child_process.execSync("streamlink https://www.youtube.com/watch?v=0M5uIYQCKyU best --stdout | ffprobe -show_format -pretty -loglevel quiet -");
    res.setHeader('content-type', 'application/json');
    res.send(returncommand);
});
*/
app.get('/status', (req, res) => {
    var data = "";
    data += '<h1> Status </h1><br>';
    data += '<table style="border-collapse: collapse; width: 100%; height: 33px;" border="1">';
    data += '<tbody>';
    data += '<tr style="background-color: blue;">';
    data += '<td style="width: 11.3163%; height: 15px;"><span style="color: #ffffff;">PID</span></td>';
    data += '<td style="width: 41.714%; height: 15px;"><span style="color: #ffffff;">Url</span></td>';
    data += '<td style="width: 12.8314%; height: 15px;"><span style="color: #ffffff;">App</span></td>';
    data += '<td style="width: 34.1383%;"><span style="color: #ffffff;">Command</span></td>';
    data += '</tr>';
    processes.forEach(function(table) {
        data += '<tr style="height: 18px;">';
        data += `<td style="width: 11.3163%; height: 18px;">${table.PID}</td>`;
        data += `<td style="width: 41.714%; height: 18px;">${table.url}</td>`;
        data += `<td style="width: 12.8314%; height: 18px;">${table.app}</td>`;
        data += `<td style="width: 34.1383%;">${table.command}</td>`;
        data += '</tr>';
    })

    data += '</tbody>';
    data += '</table>';
    res.send(data);
})




// help page, captured from github pages
app.get('/', async function(req, res) {
    const https = require("https");
    https.get('https://asabino2.github.io/streamproxy/streamproxy.html', (resp) => {
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

/*
function announceServers() {
    var http = require('http');
    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function(resp) {
        resp.on('data', function(ip) {
            publicip = ip;
            console.log("server on internet http://" + publicip + ":" + portlisten + "/");
        });
    });
}
*/

/* Functions */
// Load configuration
function loadconfig() {
    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync("./streamproxy.config.json");
        config = JSON.parse(jsonString);
    } catch (err) {

        //console.log("error on loading configfile: " + err)
        config = { port: 3000, stramlinkpath: "", ffmpegpath: "", ffmpeg: { codec: "mpeg2video", format: "mpegts", serviceprovider: "streamproxy" } };
    }

    if (config.streamlinkpath == undefined) {
        config.streamlinkpath = "";
    }

    if (config.ffmpegpath == undefined) {
        config.ffmpegpath = "";
    }



    if (config.ffmpeg.codec == undefined) {
        config.ffmpeg.codec = "mpeg2video";
    }
    if (config.ffmpeg.serviceprovider == undefined) {
        config.ffmpeg.serviceprovider = "streamproxy";
    }
    if (config.ffmpeg.format == undefined) {
        config.ffmpeg.format = "mpegts";
    }
    //if (config.ffmpeg.servicename == undefined) {
    //    config.ffmpeg.servicename = "service01";
    //}


}

// add process
function addprocess(url, PID, app, command) {
    processes.push({ url: url, PID: PID, app: app, command: command });
}

// remove process
function removeprocess(PID) {
    processes = processes.filter(val => val.PID !== PID);
}

function ffprobeStreamlink(url) {
    var child_process = require("child_process");
    var returncommand = child_process.execSync(config.streamlinkpath + "streamlink " + url + " best --stdout | " + config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams -");

    return returncommand;
}

function checkStreamlink(url) {
    var child_process = require("child_process");
    var command = config.streamlinkpath + "streamlink " + url + " best --stdout | " + config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams -";
    var status = "";
    try {
        retunrcommand = require('child_process').execSync(command);
        status = "online";
    } catch (e) {
        status = "offline";
        erro = e.message;
    }
    return { streamurl: url, streamstatus: status, mensagem: erro };



}