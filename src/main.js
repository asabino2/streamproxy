/********************************************/
/* Stream Proxy - A Proxy for a Livestream  */
/* Desenvolvido por Alexander Sabino        */
/********************************************/

const { spawn } = require('child_process');
const express = require('express');
const os = require('os');
var config = {};
var processes = [];
var debug = { PID: 0, url: "", endpoint: "", remoteIP: "", app: "", command: "", statusExec: "", lastEvent: "", exitCode: "", exitSignal: "", message: "", lastError: "", lastConsoleData: { stdErr: "", stdin: "" } };
var pageTitle = "";
//var cookieParser = require('cookie-parser');
//import { loadconfig, addprocess } from './functions.js'


//console.log("port: " + config.port);
//initialcheck();
loadconfig();
// Initialization of variables
const app = express();
var portlisten = process.argv[2];
var ippublic = "";
var publicip = "44";


//app.use(cookieParser());

getPageTitle("https://www.youtube.com/watch?v=sPLewJEn_p0")
    //console.log("Platform: " + os.platform);
    // Title screen
console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                         A Proxy for the livestreams                   ")
console.log("                              Developed by Alexander Sabino (asabino2.github.io)       ")
console.log("                                           Rio de Janeiro - Brazil                     ")



console.log("");
console.log("starting...")
console.log("");
console.log("streamproxy is listening on port ", config.port)
console.log("try http://" + os.hostname + ":" + config.port + "/ or http://localhost:" + config.port + "/");
console.log("");
console.log("");
console.log("");
/*
console.log("OS Platform: " + os.platform);
console.log("Hostname: " + os.hostname);
console.log("Arch: " + os.arch);
console.log("port configured:" + config.port);
console.log("streamlink path:" + config.streamlinkpath);
*/

// Service for streamlink stream proxy
app.get('/videostream/streamlink', (req, res) => {
    if (checkToken(req, res) == false) {
        return false;
    };

    appsetheader(res);
    var clientIP = req.ip;
    url = req.query.url;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    console.log(`opening connect to stream in url ${url} from ${clientIP}`);

    const stream = spawn(config.streamlinkpath + "streamlink", [url, 'best', '--stdout']);
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    //console.log("ended");
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        //console.log("to string " + spawncommand.toString());
        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        //addprocess(url, stream.pid, "streamlink", spawncommand);
        addprocess(req, stream)
        console.log(`running streamlink app (PID ${stream.pid}) [${spawncommand}]`);
        debug.PID = stream.pid;
        debug.app = "streamlink";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "spawn";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = "On Spawn command";
        debug.statusExec = "Running";


    })
    stream.on('close', (code, signal) => { // on app closed
        console.log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = "streamlink";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "close";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On close";
        debug.statusExec = "closed";


    })

    stream.stdout.on('data', (data) => {
        //console.log("data len " + data.length + "\r");
        //process.stdout.write("data len " + data.length + "\r");
    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })

    stream.on('exit', (code, signal) => {
        //console.log("exit stop code " + code + " signal " + signal);
        debug.PID = stream.pid;
        debug.app = "streamlink";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "exit";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On exit";
        debug.statusExec = "closed";

    })

    stream.on('error', (err) => { // on error on app
        console.log(`error ocurred: ${err}`);
        debug.PID = stream.pid;
        debug.app = "streamlink";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "error";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = err;
        debug.statusExec = "closed with error";
        debug.lastError = err;
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
    if (checkToken(req, res) == false) {
        return false;
    };

    appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    var clientIP = req.ip;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    console.log(`opening connect to stream in url ${url} for ffmpeg from ${clientIP}`);
    const stream = spawn(config.ffmpegpath + 'ffmpeg', ['-loglevel', 'fatal', '-i', url, '-vcodec', config.ffmpeg.codec, '-acodec', 'aac', '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=' + config.ffmpeg.serviceprovider, '-f', config.ffmpeg.format, '-tune', 'zerolatency', '-']);

    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        //spawncommand = spawncommand.ReplaceAll(",", " ");
        //addprocess(url, stream.pid, "ffmpeg", spawncommand);
        addprocess(req, stream)
        console.log(`running ffmpeg app (PID ${stream.pid}) [${spawncommand}]`);
        debug.PID = stream.pid;
        debug.app = "ffmpeg";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "spawn";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = "On Spawn command";
        debug.statusExec = "Running";
    })
    stream.on('close', (code, signal) => { // on app closed
        console.log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = "ffmpeg";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "close";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On close";
        debug.statusExec = "closed";
    })

    stream.on('exit', (code, signal) => {
        //console.log("exit stop code " + code + " signal " + signal);
        debug.PID = stream.pid;
        debug.app = "ffmpeg";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "exit";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On exit";
        debug.statusExec = "closed";
    })

    stream.on('error', (err) => { // on error on app
        debug.PID = stream.pid;
        debug.app = "ffmpeg";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "error";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = err;
        debug.statusExec = "closed with error";
        console.log(`error ocurred: ${err}`);
        debug.lastError = err;
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)
    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
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
    if (checkToken(req, res) == false) {
        return false;
    };

    appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url

    var returncommand = "";
    var commandffmpeg = config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams -show_programs " + url;
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
    if (checkToken(req, res) == false) {
        return false;
    };

    appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url

    var commandffmpeg = config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i \"" + url + "\" -vframes 1 -q:v 2 -f null -";
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

app.get('/debug', (req, res) => {
    res.json(debug);
})

/*
// only a test (will be used in future)
app.get('/info', (req, res) => {
    //res.cookie('testestreamproxy', 'teste1', { expires: new Date(Date.now() + 900000), httpOnly: true });
    //console.dir(req.cookies.cookieName);
    res.json({ ip: req.ip, cookie: req.cookies['testestreamproxy'] });
});
*/

/*
app.get('/teste', (req, res) => {
    //res.status(900).send(JSON.stringify(processes));
    var child_process = require("child_process");
    var returncommand = child_process.execSync("streamlink https://www.youtube.com/watch?v=0M5uIYQCKyU best --stdout | ffprobe -show_format -pretty -loglevel quiet -");
    res.setHeader('content-type', 'application/json');
    res.send(returncommand);
}); 
*/
app.get('/status', (req, res) => {
    appsetheader(res);
    var data = "";
    data += '<h1> Status </h1><br>';
    data += '<table style="border-collapse: collapse; width: 100%; height: 33px;" border="1">';
    data += '<tbody>';
    data += '<tr style="background-color: blue;">';
    data += '<td style="width: 11.3163%; height: 15px;"><span style="color: #ffffff;">PID</span></td>';
    data += '<td style="width: 27.5094%; height: 15px;"><span style="color: #ffffff;">Url</span></td>';
    data += '<td style="width: 14.5123%; height: 15px;"><span style="color: #ffffff;">Endpoint</span></td>';
    data += '<td style="width: 12.5237%;"><span style="color: #ffffff;">Client</span></td>';
    data += '<td style="width: 34.1383%; height: 15px;"><span style="color: #ffffff;">Command</span></td>';
    data += '</tr>';
    processes.forEach(function(table) {
        data += '<tr style="height: 18px;">';
        data += `<td style="width: 11.3163%; height: 18px;">${table.PID}</td>`;
        data += `<td style="width: 27.5094%; height: 18px;">${table.url}</td>`;
        data += `<td style="width: 14.5123%; height: 18px;">${table.endpoint}</td>`;
        data += `<td style="width: 12.5237%;">${table.clientIP}</td>`;
        data += `<td style="width: 34.1383%; height: 18px;">${table.command}</td>`;
        data += '</tr>';
    })

    data += '</tbody>';
    data += '</table>';
    res.send(data);
})




// help page, captured from github pages
app.get('/', async function(req, res) {
    const https = require("https");
    const serversearch = "&lt;serverip&gt;";
    const portsearch = "&lt;port&gt;";
    const localhostsearch = "localhost:3000";

    const serverreplacer = new RegExp(serversearch, 'g');
    const portreplacer = new RegExp(portsearch, 'g');
    const localhostreplacer = new RegExp(localhostsearch, 'g');
    appsetheader(res);
    https.get('https://raw.githubusercontent.com/asabino2/streamproxy/master/README.md', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;

        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log("response data: " + data);
            data = data.replace(serverreplacer, req.hostname);
            data = data.replace(portreplacer, config.port);
            data = data.replace(localhostreplacer, req.hostname + ":" + config.port);
            res.send(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);

    });

});

//convert to audio
app.get('/audiostream/play', (req, res) => {
    if (checkToken(req, res) == false) {
        return false;
    };

    appsetheader(res);

    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    var runner = req.query.runner;
    console.log("*** Convert videostream to audiostream")
    console.log("you selected the runner " + runner)
    var stream = "";
    var title = req.query.title;

    var clientIP = req.ip;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    var metadata = "";
    if (title == undefined) {
        title = "streamproxy audio";
    }
    metadata = `-metadata icy-aim="N/A" -metadata icy-br=128 -metadata icy-genre="misc" -metadata icy-icq="N/A" -metadata icy-irc="N/A" -metadata icy-name="streamproxy" -metadata icy-prebuffer=64000 -metadata icy-pub=1 -metadata StreamTitle="${title}" -metadata title="${title}"`;
    if (os.platform == 'win32') {
        //res.status(500).send("This endpoint is avaiable only in linux platform")

        console.log(`opening connect to stream in url ${url} for audiconverter with ffmpeg in win32 platform (from ${clientIP})`);
        stream = spawn(config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 320k -joint_stereo 0 -y -f mp3 -metadata artist=\'streamproxy\' -metadata title=\'' + title + '\'  -', { shell: 'powershell.exe' });
    } else {




        if (runner == undefined) {
            if (checkIfstreamlinkCanHandle(url) == true) {
                runner = "streamlink"
                console.log("System selected the runner " + runner);
            } else {
                runner = "ffmpeg"
                console.log("System selected the runner " + runner);
            }
        }


        switch (runner) {
            case "streamlink":
                console.log(`opening connect to stream in url ${url} for audiconverter with streamlink and ffmpeg (from ${clientIP})`);
                stream = spawn(config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + ' -', { shell: true });
                //stream = spawn(config.streamlinkpath + 'streamlink ' + url + ' best --stdout', { shell: true });
                break;
            case "ffmpeg":
                console.log(`opening connect to stream in url ${url} for audiconverter with ffmpeg (from ${clientIP})`);
                stream = spawn(config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + '  -', { shell: true });
                break;
            default:
                console.log("runner " + runner + " is invalid");
                res.status(500).send("invalid runner");
                return false;
        }



    }




    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');

        addprocess(req, stream)
        console.log(`running ffmpeg app (PID ${stream.pid}) [${spawncommand}]`);
        debug.PID = stream.pid;
        debug.app = "audiostreamconverter";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "spawn";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = "On Spawn command";
        debug.statusExec = "Running";
    })
    stream.on('close', (code, signal) => { // on app closed
        console.log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = "audiostreamconverter";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "close";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On close";
        debug.statusExec = "closed";

    })

    stream.on('exit', (code, signal) => {

        debug.PID = stream.pid;
        debug.app = "audiostreamconverter";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "exit";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On exit";
        debug.statusExec = "closed";

    })

    stream.on('error', (err) => { // on error on app
        debug.PID = stream.pid;
        debug.app = "audiostreamconverter";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "error";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = err;
        debug.statusExec = "closed with error";
        console.log(`error ocurred: ${err}`);
        debug.lastError = err;
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)

    })

    stream.on('message', (message, sendHandle) => {
        console.log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        console.log(`closed connection of url ${url}`);
        console.log(`kill PID ${stream.pid} of program ffmpeg/streamlink`)
        removeprocess(stream.pid);
        stream.kill();
    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});



var server = app.listen(config.port);

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
        config = { port: 4211, stramlinkpath: "", ffmpegpath: "", ffmpeg: { codec: "mpeg2video", format: "mpegts", serviceprovider: "streamproxy" } };

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
function addprocess(req, spawn) {
    var spawncommand = spawn.spawnargs;
    spawncommand = spawncommand.toString();
    spawncommand = spawncommand.replace(/,/g, ' ');

    processes.push({ url: req.query.url, PID: spawn.pid, clientIP: req.ip, endpoint: req.path, command: spawncommand })

}

// remove process
function removeprocess(PID) {
    processes = processes.filter(val => val.PID !== PID);
}

function ffprobeStreamlink(url) {
    var child_process = require("child_process");
    var returncommand = child_process.execSync(config.streamlinkpath + "streamlink " + url + " best --stdout | " + config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams -show_programs -");

    return returncommand;
}

function checkStreamlink(url) {
    var status = "";
    var erro = "";

    var child_process = require("child_process");
    var command = config.streamlinkpath + "streamlink " + url + " best --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f null -";

    try {
        retunrcommand = require('child_process').execSync(command);
        status = "online";
    } catch (e) {
        status = "offline";
        erro = e.message;
    }
    return { streamurl: url, streamstatus: status, mensagem: erro };



}

function checkIfstreamlinkCanHandle(url) {
    var child_process = require("child_process");
    try {
        var returncommand = child_process.execSync(config.streamlinkpath + "streamlink --can-handle-url " + url);
        return true;
    } catch (e) {
        return false;
    }

}

function getPageTitle(url) {
    /*
        const https = require("https");



        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;

            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                //console.log("response data: " + data);
                //console.log("end, data: " + data);
                let [, , title = null] = data.match(/<title( [^>]*)?>(.*)<[/]title>/i) || [];
                //console.log("title> " + title);
                if (!title) {
                    title = "streamproxy audio";
                }
                return data;
                //console.log("Page title ::=> " + pageTitle);

            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);

        });

    */




}

function appsetheader(res) {
    res.set({ 'Server': 'streamproxy' });
}

function checkToken(req, res) {
    var endpointRestricted = false;

    if (config.token == undefined || config.token == "") //if doesn't have token tag in config file, always return true (access ok)
    {
        return true;
    }



    if (config.restrictedEndpoints == undefined) {
        endpointRestricted = true;
    }

    if (config.restrictedEndpoints.length == 0 || config.restrictedEndpoints.indexOf(req.path) >= 0) {
        endpointRestricted = true;
    }


    if (req.query.token != config.token && (endpointRestricted == true)) {
        res.status(401).send("invalid token");
        return false;
    } else {
        return true;
    }
}