/********************************************/
/* Stream Proxy - A Proxy for a Livestream  */
/* Desenvolvido por Alexander Sabino        */
/********************************************/

const { spawn } = require('child_process');
const express = require('express');
const os = require('os');

const yargs = require('yargs');

const argv = yargs
    .usage('Usage: $0 [options]')  
.options({
    'port': {
      alias: 'p',
      demandOption: false,
      describe: 'port number',
      type: 'integer',
    },
    'datadirectory': {
      alias: 'd',
      demandOption: false,
      describe: 'data files path (streamproxy.authroles.json, streamproxy.users.json, streamproxy.streamservers.json)',
      type: 'string',
    },
  })
  .help()
  .alias('help', 'h')
  .argv;
//console.log("port: "+argv['port']);
var useragent = require('express-useragent');
var config = {};
var info = { pid: 0, platform: "", arch: "", freemem: 0, totalmem: 0, ostype: "", versions: { ffmpeg: "", streamlink: "", os: "" } }
var processes = [];
var databuf = { header: [{ bytes: [] }], data: undefined };
var databufheaderlen = 4;
var mydatabuf = undefined;
var streamserverstatus = [];
var arrstreamserverlist = [];
//var streamlinkconfigfile = process.env.streamlinkconfigfile;

const crypto = require('crypto');
const createHash = crypto.createHash;
//const datadirectory = argv['datadirectory'] || process.env.STREAMPROXY_DATA_DIR || './';
const datadirectory = argv['datadirectory'] || process.env.STREAMPROXY_DATA_DIR || '/data/';



/*
var authroles = [{
        "name": "basic",
        "description": "Basic Authorization",
        "authorizations": [
            { "endpoint": "/", "methods": ["GET"] },
            { "endpoint": "/about", "methods": ["GET"] }
        ]
    },
    {
        "name": "basicWatchers",
        "description": "Basic Watches",
        "authorizations": [
            { "endpoint": "/videostream/*", "methods": ["GET"] },
            { "endpoint": "/audiostream/play", "methods": ["GET"] }
        ]
    },
    {
        "name": "streamserverWatchers",
        "description": "Stream Server Watchers",
        "authorizations": [
            { "endpoint": "/play/*", "methods": ["GET"] }
        ]
    },
    {
        "name": "administrator",
        "description": "Administrator",
        "authorizations": [
            { "endpoint": "*", "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"] }
        ]
    }
]

var users = [
    { "username": "anonymous", "password": "", "fullname": "Anonymous", "authorizations": { "basic": true, streamserverWatchers: true } },
    { "username": "teste", "password": "2e6f9b0d5885b6010f9167787445617f553a735f", "fullname": "Teste", "authorizations": { "basic": true } },
    { "username": "admin", "password": "d033e22ae348aeb5660fc2140aec35850c4da997", "fullname": "Administrator", "authorizations": { "administrator": true } }
]

*/
var authroles = [];
var users = [];

var systempassword = randPass(10, 13);

const { PassThrough } = require("stream").Duplex;
//const { tunnelteste } = require("stream").Duplex;

var arrstreamserver = []


var debug = { PID: 0, url: "", endpoint: "", remoteIP: "", app: "", command: "", statusExec: "", lastEvent: "", exitCode: "", exitSignal: "", message: "", lastError: "", lastConsoleData: { stdErr: "", stdin: "" } };

var logdata = [];
var pageTitle = "";

const bodyParser = require('body-parser');
const { application, response } = require('express');
const showdown = require('showdown');
const markdownConverter = new showdown.Converter({
    tables: true,
    ghCompatibleHeaderId: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

loadconfig();
//console.log(`port ${config.port} is occupied: ${portIsOccupied(config.port)}`);
loadAuthRoles();
loadUsers();
loadStreamServers();
getInfo();

/*
process.stdin.resume();
process.on('exit', function() {
    console.log('Got SIGINT.  Press Control-D to exit.');
    process.exit();
});
*/

// prevent server shutdown on error
process.on('uncaughtException', (err, origin) => {
    log(
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}`
    );
});


// Initialization of variables
const app = express();
var portlisten = process.argv[2];
var ippublic = "";
var publicip = "44";





app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(useragent.express());

var pjson = require('../package.json');
const { request } = require('http');
//const { isGeneratorFunction } = require('util/types');



// Title screen
console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                       A Proxy for the livestreams                   ")
console.log(`                                          version ${pjson.version}                   `)
console.log("                          Developed by Alexander Sabino (https://github.com/asabino2/)       ")
console.log("                                      Rio de Janeiro - Brazil                     ")



console.log("");
console.log("starting...")
console.log("");
console.log("streamproxy is listening on port ", config.port)
console.log("try http://" + os.hostname + ":" + config.port + "/ or http://localhost:" + config.port + "/");
console.log("");
console.log("");
console.log("");
//console.log("process: " + process.pid + "memory: " + process.memory)


// Service for streamlink stream proxy
app.get('/videostream/streamlink', (req, res) => {

    url = req.query.url;

    try {
        runStream(req, res, spawn(config.streamlinkpath + "streamlink", [url,  'best', '--config', '/config.txt', '-l', 'error', '--stdout']), "streamlink")
    } catch (e) {
        res.status(500).send("<h2>Internal Error, try again<h2>");

    }



});




app.get('/videostream/ffmpeg', (req, res) => {
    var stream = undefined;
    var streamerror = undefined;
    var streamstart = false;
    var showErrorInStream = false;
    var streamerrorpid = 0;
    var bitrates = undefined;
    var url = req.query.url;
    var vcodec = undefined;
    var acodec = undefined;
    var vformat = undefined;
    var framesize = undefined;
    var framerate = undefined;
    var service_provider = undefined;
    var service_name = undefined;

    if (req.query.videocodec != undefined) {
        vcodec = encodeURI(req.query.videocodec);
    } else if (config.ffmpeg.codec != undefined) {
        vcodec = config.ffmpeg.codec;
    } else {
        vcodec = "mpeg2video";
    }

    if (req.query.audiocodec != undefined) {
        acodec = encodeURI(req.query.audiocodec);
    } else if (config.ffmpeg.acodec != undefined) {
        acodec = config.ffmpeg.acodec;
    } else {
        acodec = "aac";
    }

    if (req.query.bitrate != undefined) {
        bitrates = encodeURI(req.query.bitrate);
    } else if (config.ffmpeg.bitrate != undefined) {
        bitrates = config.ffmpeg.bitrate;
    } else {
        bitrates = "15000k";
    }

    if (req.query.serviceprovider != undefined) {
        service_provider = encodeURI(req.query.serviceprovider);
    } else if (config.ffmpeg.serviceprovider != undefined) {
        service_provider = config.ffmpeg.serviceprovider;
    } else {
        service_provider = "streamproxy";
    }

    if (req.query.videoformat != undefined) {
        vformat = encodeURI(req.query.videoformat);
    } else if (config.ffmpeg.format != undefined) {
        vformat = config.ffmpeg.format;
    } else {
        vformat = "mpegts";
    }

    if (req.query.streamdescription != undefined) {
        service_name = encodeURI(req.query.streamdescription);
    } else {
        service_name = "streamproxyservice";
    }

    if (req.query.framesize != undefined) {
        framesize = encodeURI(req.query.framesize);
    }

    if (req.query.framerate != undefined) {
        framerate = encodeURI(req.query.framerate);
    }

    var ffmpegparams = [];
    ffmpegparams.push('-loglevel');
    ffmpegparams.push('error');
    ffmpegparams.push('-i');
    ffmpegparams.push(url);
    if (vcodec != undefined) {
        ffmpegparams.push('-vcodec');
        ffmpegparams.push(vcodec);
    }

    if (acodec != undefined) {
        ffmpegparams.push('-acodec');
        ffmpegparams.push(acodec);
    }

    if (framesize != undefined) {
        ffmpegparams.push('-s');
        ffmpegparams.push(framesize);
    }

    if (framerate != undefined) {
        ffmpegparams.push('-r');
        ffmpegparams.push(framerate);
    }


    ffmpegparams.push('-b');
    ffmpegparams.push(bitrates);
    ffmpegparams.push('-strict');
    ffmpegparams.push('-2');
    ffmpegparams.push('-mbd');
    ffmpegparams.push('rd');
    ffmpegparams.push('-copyinkf');
    ffmpegparams.push('-flags');
    ffmpegparams.push('+ilme+ildct');
    ffmpegparams.push('-fflags');
    ffmpegparams.push('+genpts');
    //ffmpegparams.push('-filter:v');
    //ffmpegparams.push('fps=60');
    if (service_provider != undefined) {
        ffmpegparams.push('-metadata');
        ffmpegparams.push('service_provider="' + service_provider + '"');

    }
    if (service_provider != undefined) {
        ffmpegparams.push('-metadata');
        ffmpegparams.push('service_name="' + service_name + '"');

    }



    if (vformat != undefined) {
        ffmpegparams.push('-f');
        ffmpegparams.push(vformat);
    }
    ffmpegparams.push('-tune');
    ffmpegparams.push('zerolatency');
    ffmpegparams.push('-');

    //ffmpegparams = ['-loglevel', 'error', '-i', url, '-vcodec', vcodec, '-acodec', acodec, '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=' + service_provider, '-metadata', 'service_name=' + service_name, '-f', config.ffmpeg.format, '-tune', 'zerolatency', '-'];
    try {
        runStream(req, res, spawn(config.ffmpegpath + 'ffmpeg', ffmpegparams), "ffmpeg");
    } catch (e) {
        res.status(500).send("<h2>Internal Error, try again<h2>");

    }

});

//convert to audio
app.get('/audiostream/play', (req, res) => {
    var PIDOffset = 0;
    var command = "";
    var url = req.query.url;

    var runner = req.query.runner;
    log("*** Convert videostream to audiostream")
    log("you selected the runner " + runner)
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

    if (runner == undefined) {
        if (checkIfstreamlinkCanHandle(url) == true) {
            runner = "streamlink"
            log("System selected the runner " + runner);
            PIDOffset = 1;
        } else {
            runner = "ffmpeg"
            log("System selected the runner " + runner);
            PIDOffset = 0;
        }
    }


    switch (runner) {
        case "streamlink":
            log(`opening connect to stream in url ${url} for audiconverter with streamlink and ffmpeg (from ${clientIP})`);
            if (os.platform != "win32") {
                command = config.streamlinkpath + 'streamlink ' + url + ' worst --config /config.txt --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + ' -'
            } else {
                command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + '  -'
            }

            break;
        case "ffmpeg":
            log(`opening connect to stream in url ${url} for audiconverter with ffmpeg (from ${clientIP})`);
            command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + '  -'

            break;
        default:
            log("runner " + runner + " is invalid");
            res.status(500).send("invalid runner");
            return false;
    }
    try {
        if (os.platform == 'win32') {
            //stream = spawn(command, { shell: 'powershell.exe' });
            runStream(req, res, spawn(command, { shell: 'powershell.exe' }), runner + "(VideoToAudioConverter)", true)
        } else {
            //stream = spawn(command, { shell: true });
            runStream(req, res, spawn(command, { shell: true }), runner + "(VideoToAudioConverter)", true)
        }
    } catch (e) {
        res.status(500).send("<h2>Internal Error, try again<h2>");

    }



});



//videostream play
app.get('/videostream/play', (req, res) => {
    var command = "";
    var url = req.query.url;
    var clientIP = req.ip;



    var vcodec = undefined;
    var acodec = undefined;
    var vformat = undefined;
    var framesize = undefined;
    var framerate = undefined;
    var bitrates = undefined;
    var service_provider = undefined;
    var service_name = undefined;

    if (req.query.videocodec != undefined) {
        vcodec = encodeURI(req.query.videocodec);
    } else if (config.ffmpeg.codec != undefined) {
        vcodec = config.ffmpeg.codec;
    } else {
        vcodec = "mpeg2video";
    }
    vcodec = '-vcodec ' + vcodec;

    if (req.query.audiocodec != undefined) {
        acodec = encodeURI(req.query.audiocodec);
    } else if (config.ffmpeg.acodec != undefined) {
        acodec = config.ffmpeg.acodec;
    } else {
        acodec = "aac";
    }

    if (req.query.bitrate != undefined) {
        bitrates = encodeURI(req.query.bitrate);
    } else if (config.ffmpeg.bitrate != undefined) {
        bitrates = config.ffmpeg.bitrate;
    } else {
        bitrates = "15000k";
    }

    acodec = '-acodec ' + acodec;

    if (req.query.serviceprovider != undefined) {
        service_provider = encodeURI(req.query.serviceprovider);
    } else if (config.ffmpeg.serviceprovider != undefined) {
        service_provider = config.ffmpeg.serviceprovider;
    } else {
        service_provider = "streamproxy";
    }

    service_provider = '-metadata service_provider="' + service_provider + '"';

    if (req.query.videoformat != undefined) {
        vformat = encodeURI(req.query.videoformat);
    } else if (config.ffmpeg.format != undefined) {
        vformat = config.ffmpeg.format;
    } else {
        vformat = "mpegts";
    }

    vformat = '-f ' + vformat;

    if (req.query.streamdescription != undefined) {
        service_name = encodeURI(req.query.streamdescription);
    } else {
        service_name = "streamproxyservice";
    }

    service_name = '-metadata service_name="' + service_name + '"';

    if (req.query.framesize != undefined) {
        framesize = '-f ' + encodeURI(req.query.framesize);
    } else {
        framesize = "";
    }

    if (req.query.framerate != undefined) {
        framerate = '-r ' + encodeURI(req.query.framerate);
    } else {
        framerate = "";
    }

    if (req.query.bitrate != undefined) {
        bitrates = '-b ' + encodeURI(req.query.bitrate);
    } else {
        bitrates = "";
    }


    command = config.streamlinkpath + 'streamlink ' + url + '  best --config /config.txt --stdout | ' + config.ffmpegpath + 'ffmpeg -loglevel error -i pipe:0 ' + vcodec + ' ' + framesize + ' ' + framerate + ' ' + acodec + ' ' + bitrates + ' -strict -2 -mbd rd -copyinkf -flags +ilme+ildct -fflags +genpts ' + service_provider + ' ' + service_name + ' ' + vformat + ' -tune zerolatency -'

    log(`opening connect to stream in url ${url} for audiconverter with streamlink and ffmpeg (from ${clientIP})`);
    if (os.platform == 'win32') {
        res.statusMessage = "this endpoint is not compatible with windows, use linux instead"
        res.status(400).send("this endpoint is not compatible with windows, use linux instead");
        return false;
        stream = spawn('"' + command + '"', { shell: 'powershell.exe' });
    } else {
        //stream = spawn(command, { shell: true });
        runStream(req, res, spawn(command, { shell: true }), "streamlink/ffmpeg")
    }

});


app.get('/videostream/displaytext', (req, res) => {

    runStream(req, res, displayErrorInStream("teste"), "ffmpeg", true);
})




app.get('/streamserver/create', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    mountStreamServerAdminPage(req, res);
})

app.get('/streamserver/edit', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var streamserverlistIndex = arrstreamserverlist.findIndex(val => val.streamname === req.query.streamname);
    if (streamserverlistIndex < 0) {
        res.status(404).send("<h2>Stream server not found</h2>");
    } else {
        mountStreamServerAdminPage(req, res, "PUT", arrstreamserverlist[streamserverlistIndex]);
    }
});

app.get('/streamserver/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    data += `<html>
            <head> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Stream server status</title>
            <link rel="stylesheet" href="/styles.css">
            <link rel="stylesheet" href="/toast.css">
            <script>
             var lasttotalitems = 0;
             /* common functions */
             ${commonFrontendFunctionsGet()}
          

              function getStatusData(){
                
                const date = new Date();
                var datasize = 0;
                
                let xhr = new XMLHttpRequest();`
    if (req.query.streamname !== undefined) {
        data += `xhr.open('GET', '/api/streamserver/status?streamname=${req.query.streamname}');`
    } else {
        data += `xhr.open('GET', '/api/streamserver/status');`
    }

    data += `xhr.responseType = 'json';
                xhr.send();
                xhr.onload = function() {
                    let responseObj = xhr.response;
                      
                        mountStatus(responseObj);
                        
                        
                    
                   
                  };
                  

              
              }

              function mountStatus(responseObj) {
                var htmlData = "";
                if(lasttotalitems != responseObj.length || document.getElementById("status").innerHTML == ""){
                    lasttotalitems = responseObj.length;
                htmlData += "<table>";
                htmlData += "<tr>";
                htmlData += "<th>UUID</th>";
                htmlData += "<th>Streamname</th>";
                htmlData += "<th>user</th>";
                htmlData += "<th>IP</th>";
                htmlData += " <th>OS</th>";
                htmlData += "<th>Browser</th>";
                htmlData += "<th>User-Agent</th>";
                
                htmlData += "</tr>";
                responseObj.forEach(function(table) {
                  
                  
                  htmlData += '<tr>';
                  
                  htmlData += '<td>'+table.UUID+'</td>';
                  htmlData += '<td>'+table.streamname+'</td>';
                  htmlData += '<td>'+table.user+'</td>';
                  htmlData += '<td>'+table.client.ip+'</td>';
                  htmlData += '<td>'+table.client.os+'</td>';
                 
                      htmlData += '<td>'+table.client.browser+'</td>';
                  
                  htmlData += '<td>'+table.client.source+'</td>';
                  
                  
                  htmlData += '</tr>';
                });
                htmlData += '</table>';
                htmlData += '</body>';
                htmlData += '</html>';
                document.getElementById("status").innerHTML = htmlData;
            }
            }

              function startTimer() {
                getStatusData();
                setInterval(getStatusData, 1000);  
            }
              
               

            </script>   
            </head>
            <body onload="startTimer()">
            ${CreateMenu(auth)}
            <div id="status"></div>
            
            `
    res.send(data);
})

app.get('/streamserver/playlist.m3u', (req, res) => {
    var userpassword = undefined
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    if (auth.auth != undefined) {
        userpassword = Buffer.from(auth.auth, 'base64').toString()
    }




    var playlistdata = "";
    var channelname = "";
    var channelnumber = "";
    var radio = "";
    var arrstreamserverlistnew = getStreamServersListData();
    if (config.streamserver.hideStoppedStreamServerInPlaylist == true) {
        arrstreamserverlistnew = arrstreamserverlistnew.filter(val => val.status === "running");
    }
    playlistdata += "#EXTM3U\n";
    if (arrstreamserverlistnew.length > 0) {
        arrstreamserverlistnew.forEach(val => {
            if (val.channelnumber != undefined && val.channelnumber != "") {
                channelnumber = `tvg-chno="${val.channelnumber}"`;
            }
            if (val.streamdescription != undefined && val.streamdescription != "") {
                channelname = val.streamdescription
            } else {
                channelname = val.streamname
            }

            if (val.type == "radio") {
                radio = "radio=true";
            }
            playlistdata += `#EXTINF:-1 ${channelnumber} ${radio}, ${channelname}\n`;
            if (userpassword != undefined && userpassword != "") {
                playlistdata += `http://${userpassword}@${req.hostname}:${getPortCalled(req)}/play/${val.streamname}\n`
            } else {
                playlistdata += `http://${req.hostname}:${getPortCalled(req)}/play/${val.streamname}\n`
            }
        })
    }
    res.set({ 'Content-Type': 'application/octet-stream' });
    res.send(playlistdata);
});

app.get('/videostream/restream', (req, res) => {
    var PIDOffset = 0;
    var command = "";
    var format = req.query.format;
    var vcodec = "";
    var acodec = "";
    var warning = "";
    if (format == undefined) {
        format = "flv";
    }
    /*
    if (checkToken(req, res) == false) {
        return false;
    };
*/
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var output = req.query.output;
    if (output == undefined) {
        res.status(400).send("<h1>400 Bad Request - the query parameter output is required</h1>");
        return false;
    }

    if (req.query.vcodec != undefined) {
        vcodec = "-c:v " + req.query.vcodec;
    }
    if (req.query.acodec != undefined) {
        acodec = "-c:a " + req.query.acodec;
    }


    //appsetheader(res);

    url = req.query.url;

    announceStreaming(url);
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    var runner = req.query.runner;
    log("*** restream " + url + " to " + output);
    log("you selected the runner " + runner)
    var stream = "";


    var clientIP = req.ip;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;








    if (runner == undefined) {
        if (checkIfstreamlinkCanHandle(url) == true) {
            runner = "streamlink"
            log("System selected the runner " + runner);
            PIDOffset = 1;
        } else {
            runner = "ffmpeg"
            log("System selected the runner " + runner);
            PIDOffset = 0;
        }
    }


    switch (runner) {
        case "streamlink":
            log(`opening connect for restream ${url} to ${output} with streamlink and ffmpeg (from ${clientIP})`);
            if (os.platform != "win32") {
                command = config.streamlinkpath + 'streamlink ' + url + '  best --config /config.txt --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -f ' + format + ' ' + output;
            } else {
                command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' ' + vcodec + ' ' + acodec + '  -f ' + format + ' ' + output;
            }

            break;
        case "ffmpeg":
            log(`opening connect for restream ${url} to ${output} with ffmpeg (from ${clientIP})`);
            command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' ' + vcodec + ' ' + acodec + '  -f ' + format + ' ' + output;

            break;
        default:
            log("runner " + runner + " is invalid");
            res.status(500).send("invalid runner");
            return false;
    }
    if (os.platform == 'win32') {
        stream = spawn(command, { shell: 'powershell.exe' });
    } else {
        stream = spawn(command, { shell: true });
    }





    if (runner == 'streamlink' && os.platform == 'win32') {
        warning = "note that as the server runs on windows platform, it is only possible to restream urls that are compatible with ffmpeg";
    }


    res.send(`<h2>restream started, url ${url} is restreaming to ${output} <h2><br><h3>${warning}</h3>`);
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');

        addprocess(req, stream, auth.user, "restream", output)
        log(`running ffmpeg app (PID ${stream.pid}) [${spawncommand}]`);
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
        log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
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

    stream.stdout.on('data', (data) => {

        setDataSize(stream.pid, data);
    })

    stream.on('exit', (code, signal) => {
        removeprocess(stream.pid);
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
        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = "audiostreamconverter";
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "error";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = err;
        debug.statusExec = "closed with error";
        log(`error ocurred: ${err}`);
        debug.lastError = err;
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)

    })

    stream.on('message', (message, sendHandle) => {
        log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app


    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
        log(data.toString());
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});

app.get('/play/:streamname', (req, res) => {


    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }



    var streamname = req.path;
    var UUID = generateUUID();
    var arrstreamserverlistIndex = 0;

    //streamname = streamname.substring(streamname.lastIndexOf('/') + 1);
    streamname = req.params.streamname;
    arrstreamserverlistIndex = arrstreamserverlist.findIndex(val => val.streamname === streamname);
    var arrstreamserverfilter = arrstreamserver.filter(value => value.streamname == streamname);
    if (arrstreamserverlistIndex < 0) {
        res.status(404).send("no stream server has created with name " + streamname);
        return false;
    }
    if (getStreamServerListSingle(streamname).status != "running") {
        if (config.streamserver.startOnInvoke == true) {
            startStreamServer(streamname, req);
        } else {
            res.statusMessage = "Stream Server " + streamname + " is not running, start before play"
            res.status(500).end();
            return false;
        }
    }
    addStreamServerStatus(req, auth, streamname, UUID);

    try {
        var mytunnel = arrstreamserverfilter[0].tunnel;
        mytunnel.pipe(res);
    } catch (e) {
        res.statusMessage = "error on playing streamserver " + streamname + " (probably not running), e: " + e.message;
        res.status(500).end();
    }

    req.on('close', () => { // on connection close, kill PID of app
        removeStreamServerStatus(UUID);
        if(getStreamServerConnectionCount(streamname) == 0 && config.streamserver.stopOnNoConnection == true){
            stopStreamServer(streamname);
        }

    })
});

app.get('/youtubetopodcast/:channelid', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }



    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    const httpsChannelData = require("https");
    const httpslistData = require("https");
    var htmldata = "";
    var youtubeapikey = config.youtubeapikey || process.env.YOUTUBE_API_KEY || req.query.apikey;
    var channelid = req.params.channelid;
    var authenticationpart = "";

    //var request = require('sync-request');
    var channeldataraw = "";
    //var channellistitemsraw = request('GET', `https://www.googleapis.com/youtube/v3/search?key=${youtubeapikey}&channelId=${channelid}&part=snippet,id&order=date&maxResults=20`)
    var channellistitemsraw = ""
    var channeldata = undefined;
    var channellistitems = undefined;

    if (os.platform == 'win32') {
        res.statusMessage = "this endpoint is not compatible with windows, use linux instead"
        res.status(400).send("this endpoint is not compatible with windows, use linux instead");
        return false;
    }

    if (req.headers.authorization != undefined) {
        authenticationpart = login + ":" + password + "@";
    }


    httpsChannelData.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet&fields=items%2Fsnippet&id=${channelid}&key=${youtubeapikey}`, (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;

        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            channeldata = JSON.parse(data);
            if (channeldata.error != undefined) {
                res.status(400).send("api youtube call error: " + channeldata.error.message);
                return false;
            }
            httpslistData.get(`https://www.googleapis.com/youtube/v3/search?key=${youtubeapikey}&channelId=${channelid}&part=snippet,id&order=date&maxResults=20`, (resp) => {
                let data2 = '';
                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data2 += chunk;

                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    channellistitems = JSON.parse(data2);
                    if (channellistitems.error != undefined) {
                        res.status(400).send("api youtube call error: " + channellistitems.error.message);
                        return false;
                    }
                    channellistitems.items = channellistitems.items.filter(value => value.snippet.liveBroadcastContent === 'none');

                    res.setHeader('Content-Type', 'text/xml')
                    htmldata += `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>${channeldata.items[0].snippet.title}</title> <link>https://www.apple.com/itunes/podcasts/</link>
<itunes:author>Streamproxy</itunes:author>
<description>${channeldata.items[0].snippet.description}
</description>
<itunes:type>serial</itunes:type>
<itunes:owner> <itunes:name>${channeldata.items[0].snippet.customUrl}</itunes:name>
</itunes:owner>
<itunes:image
href="${channeldata.items[0].snippet.thumbnails.default.url}"
/>

<itunes:explicit>false</itunes:explicit>
`


                    channellistitems.items.forEach(item => {
                        htmldata += `<item>
       <itunes:title>${item.snippet.title}</itunes:title>
<description>
<content:encoded>
<![CDATA[${item.snippet.description}]]>
</content:encoded>
</description>
<enclosure

type="audio/mpeg"
url="http://${authenticationpart}${req.hostname}:${getPortCalled(req)}/audiostream/play?url=https://www.youtube.com/watch?v=${item.id.videoId}" />

<pubDate>${new Date(item.snippet.publishedAt).toUTCString()}</pubDate>
<itunes:image href="${item.snippet.thumbnails.default.url}"/>
<itunes:explicit>false</itunes:explicit>
</item>`
                    })

                    htmldata += `</channel>
 </rss>`

                    res.send(htmldata);
                });

            }).on("error", (err) => {
                log("Error: " + err.message);
                res.status(400).send("api youtube call error: " + err.message);
                return false;
            });

        });

    }).on("error", (err) => {
        log("Error: " + err.message);
        res.status(400).send("api youtube call error: " + err.message);
        return false;
    });




})

app.get('/test', (req, res) => {
    //res.send(new Date('2022-08-19T20:30:00Z').toUTCString())
    var envvar = req.query.var;
    res.send(envvar + "=" + process.env[envvar]);
    //res.send(getYoutubeLiveVideos());
})

app.get('/api/streamserver/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var streamservername = req.query.streamname;
    var streamserverstatusfiltered = undefined;
    if (streamservername != undefined) {
        streamserverstatusfiltered = streamserverstatus.filter(val => val.streamname == streamservername);
    } else {
        streamserverstatusfiltered = streamserverstatus;
    }
    res.json(streamserverstatusfiltered);
});

/*
app.get('/api/streamserver', (req, res) => {
    res.json(arrstreamserver);
});
*/

// Get streaminfo: http://<ip>:<port>?url=<url>
app.get('/api/streaminfo', (req, res) => {
    /*
    if (checkToken(req, res) == false) {
        return false;
    };
*/
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
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

            res.setHeader('content-type', 'application/json');
            res.send(streamlinkprobe);
        } catch (eStreamlink) {
            status = "offline";
            erro = e.message;
            res.json({ error: "true", message: e.message });
        }


    }
});

app.get('/api/streamserver', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.json(getStreamServersListData());
});

app.post('/api/streamserver', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var mystreamserver = req.body;

    var mystreamserverindex = arrstreamserverlist.findIndex(value => value.streamname === mystreamserver.streamname);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');
    if (mystreamserver.streammethod == "/audiostream/play") {
        mystreamserver.type = "radio";
    } else {
        mystreamserver.type = "tv";
    }

    if (mystreamserverindex < 0) {
        arrstreamserverlist.push(mystreamserver);
        log("Streamserver " + mystreamserver.streamname + " has created")
        res.json({ streamadded: true, message: "Streamserver " + mystreamserver.streamname + " has created" });
        saveStreamServers();
        startStreamServer(mystreamserver.streamname, req)
    } else {
        log("error on trying to stop: streamserver " + mystreamserver.streamname + " already exists, choose another name")
        res.statusMessage = "Streamserver " + mystreamserver.streamname + " already exists, choose another name"
        res.status(500).json({ streamadded: false, message: "Streamserver " + mystreamserver.streamname + " already exists, choose another name" });
    }


});

app.put('/api/streamserver', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var mystreamserver = req.body;
    try {
        log(`streamserver ${mystreamserver.streamname} change requested from ${req.ip}, json data: ${JSON.stringify(mystreamserver)}`)
        var mystreamserverindex = arrstreamserverlist.findIndex(value => value.streamname === mystreamserver.streamname);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');
        if (mystreamserver.streammethod != "/audiostream/play") {
            mystreamserver.type = "tv";
        } else {
            mystreamserver.type = "radio";
        }

        if (mystreamserverindex >= 0) {
            /* save the existent fields */
            for (var key in mystreamserver) {
                if (mystreamserver[key] != undefined) {
                    arrstreamserverlist[mystreamserverindex][key] = mystreamserver[key];
                    log(`field ${key} changed to ${mystreamserver[key]}`)
                }
            }
            //arrstreamserverlist[mystreamserverindex] = mystreamserver
            log("Streamserver " + mystreamserver.streamname + " has changed")
            saveStreamServers();
            stopStreamServer(mystreamserver.streamname);
            //startStreamServer(mystreamserver.streamname);
            if (getStreamServerListSingle(mystreamserver.streamname).status == "running") {
                setTimeout(startStreamServer, 5000, mystreamserver.streamname, req);
            } else {
                startStreamServer(mystreamserver.streamname, req);
            }
            res.json({ streamchanged: true, message: "Streamserver " + mystreamserver.streamname + " has changed" });
        } else {
            log("error on trying to change: Streamserver " + mystreamserver.streamname + " not exists")
            res.statusMessage = "Streamserver " + mystreamserver.streamname + " not exists";
            res.status(500).json({ streamchanged: false, message: "Streamserver " + mystreamserver.streamname + " not exists" });
        }
    } catch (e) {
        res.status(500).json({ streamchanged: false, message: "internal error: " + e.message })
    }
});

app.delete('/api/streamserver/:streamname', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var mystreamserver = { streamname: req.params.streamname };
    var mystreamserverindex = arrstreamserverlist.findIndex(value => value.streamname === mystreamserver.streamname);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    if (mystreamserverindex >= 0) {

        stopStreamServer(mystreamserver.streamname);
        arrstreamserverlist = arrstreamserverlist.filter(value => value.streamname != mystreamserver.streamname);
        saveStreamServers();
        res.json({ streamdeleted: true, message: "Streamserver " + mystreamserver.streamname + " has deleted" });
    } else {
        log("error on trying to deleted: Streamserver " + mystreamserver.streamname + " not exists")
        res.statusMessage = "Streamserver " + mystreamserver.streamname + " not exists";
        res.status(500).json({ streamdeleted: false, message: "Streamserver " + mystreamserver.streamname + " not exists" });
    }
})


app.post('/api/streamserver/start', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var body = req.body;

    if (body.streamname != "*") {
        var response = startStreamServer(body.streamname, req);
    } else {
        startAllStreamServers(req);
        var response = {};
        response.statusMessage = "all stream servers has started";
        response.status = 200;
        response.json = { status: "started", message: "all streamservers started" }
    }

    res.statusMessage = response.statusMessage;
    res.status(response.status).json(response.json);
})

app.post('/api/streamserver/stop', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    if (req.body.streamname != "*") {
        var response = stopStreamServer(req.body.streamname);
    } else {
        stopAllStreamServers();
        var response = {};
        response.statusMessage = "all stream servers has stopped";
        response.message = "all stream servers has stopped";
        response.status = "stopped";
    }
    if (response.status != "stopped") {
        res.statusMessage = "Error on stopping stream server";
        res.status(500).json(response);
    } else {
        res.json(response);
    }

});

// Check stream: http://<ip>:<port>?url=<url>
app.get('/api/checkstream', (req, res) => {
    /*
    if (checkToken(req, res) == false) {
        return false;
    };
*/
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url


    res.json(checkstream(url));
});

app.get('/api/getsnapshot', (req, res) => {
 
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    //resolution = req.query.resolution;
    const resolution = req.query.resolution || "0x0";
    const [reswidth, resheight] = resolution.split('x');
    

    res.json(getsnapshotfromStream(url, reswidth, resheight));
})


app.get('/api/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.json(processes);
})


app.get('/api/users', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.json(getUsersList());
});

app.post('/api/users', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var newuser = req.body;
    newuser.password = sha1(newuser.password);
    newuser.username = encodeURI(newuser.username);
    // check if user already exists

    if (newuser.username == "system") {
        res.statusText = "user system is a internal user";
        res.status(500).json({ useradded: false, message: "user system is a internal user" });
        return false;
    }

    var userIndex = users.findIndex(user => user.username == newuser.username);
    if (userIndex == -1) {
        users.push(newuser);
        saveUsers();
        res.json({ useradded: true, message: "user " + newuser.username + " was created" })
    } else {
        res.status(500).json({ useradded: false, message: "user " + newuser.username + " already exists" })
    }
});

app.put('/api/users', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }


    var changeuser = req.body;

    if (changeuser.username == "system") {
        res.statusText = "user system is a internal user";
        res.status(500).json({ useradded: false, message: "user system is a internal user" });
        return false;
    }

    var userIndex = users.findIndex(user => user.username == changeuser.username);
    if (userIndex == -1) {
        res.statusText = "user " + changeuser.username + "doesn exists";
        res.status(500).json({ userchanged: false, message: "user " + changeuser.username + "doesn exists" })
    } else {
        for (var key in changeuser) {
            if (changeuser[key] != undefined) {
                users[userIndex][key] = changeuser[key];
                log(`field ${key} changed to ${changeuser[key]}`)
            }
        }


        saveUsers();
        res.status(200).json({ userchanged: true, message: "user " + changeuser.username + " has been updated" })
    }
})

app.delete('/api/users/:username', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    //var deleteuser = req.body;
    var deleteuser = { username: req.params.username }
    var userIndex = users.findIndex(user => user.username == deleteuser.username);
    if (userIndex == -1) {
        res.statusText = "user " + deleteuser.username + "doesn exists";
        res.status(500).json({ userdeleted: false, message: "user " + deleteuser.username + "doesn exists" })
    } else {
        users = users.filter(user => user.username != deleteuser.username);
        saveUsers();
        res.status(200).json({ userdeleted: true, message: "user " + deleteuser.username + " has been deleted" })
    }
});

app.put('/api/users/changepassword', (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login == "" || login == undefined) {
        res.set('WWW-Authenticate', 'Basic realm="401"') // change this
        res.status(401).send('Authentication required.') // custom message
        return false;
    }
    var userIndex = users.findIndex(user => user.username == login);
    if (userIndex < 0) {
        res.status(500).send('Internal Server Error');
        return false;
    }
    var newpassword = req.body.password;
    users[userIndex].password = sha1(newpassword);
    saveUsers();
    res.status(200).json({ passwordchanged: true });
});

app.get('/debug', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.json(debug);
})


// only a test (will be used in future)
app.get('/info', (req, res) => {
    /* try to create a http stream server, not sucessfully, maybe next release
        const Stream = require('stream');
        var buffered = false;

        const readableStream = new Stream.Readable();
        console.log(databuf.data.length + ' lines ReadableStream');
        readableStream.pipe(res);

        readableStream._read = () => {
            if (buffered == false) {
                databuf.header.forEach(data => {
                    readableStream.push(data.bytes);
                });
                buffered = true;
            } else {
                readableStream.push(databuf.data);
            }
            

        };
    */
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    //var timestamp = new Date().getTime();
    res.setHeader('Content-Type', 'application/json');
    res.json(info);
    //res.send(req.useragent);
});

app.get('/clientinfo', (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    var clientinfo = { host: req.hostname, port: getPortCalled(req), path: req.path, authdata: { username: login, password: password }, clientdata: req.useragent };
    res.setHeader('Content-Type', 'application/json');
    res.json(clientinfo);
});

app.get('/api/log', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.json(logdata);
})

app.post('/api/clearlog', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    try {
        logdata = [];
        res.json({ run: true });
    } catch (e) {
        console.log("clear log error: " + e.message);
        res.status(500).json({ run: false, error: e.message });
    }
});

app.get('/log', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var htmldata = "";
    htmldata += `<header>
    <title>log</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">
    <script>
      
    let lineslog = 0;
      let lastline = 0;
      let initialized = false;
      var textarea = document.getElementById('log');
      function startTimer() {
        var textarea = document.getElementById('log');
        getlogData();
        setInterval(getlogData, 100);  
        //alert('log data');
    }
    
  function getlogData(){
                  
    
                
    var textarea = document.getElementById('log');
                  let xhr = new XMLHttpRequest();
                  xhr.open('GET', '/api/log');
                  xhr.responseType = 'json';
                  xhr.send();
                  xhr.onload = function() {
                      let responseObj = xhr.response;
                        if(lineslog != responseObj.length){
                          lineslog = responseObj.length;
                        
                            insertLog(responseObj);
                          
                        }
                          
                          
                          
                      
                     
                    }
  }

       function initializeLog(responseObj) {
        var textarea = document.getElementById('log');
        textarea.value = "";
        
        responseObj.forEach(data => {
          textarea.value += data + "\\n";  
        });
       }
       
        function insertLog(responseObj){
            var textarea = document.getElementById('log');
            //document.getElementById("log").innerText = document.getElementById("log").innerText + responseObj[responseObj.length] +"\\n";
            for(i=lastline;i<responseObj.length;i++){
                textarea.value += responseObj[i] + "\\n"; 
                lastline = i+1;
                textarea.scrollTop = textarea.scrollHeight;
            }
            
        }

        function clearlog(){
            var textarea = document.getElementById('log');
            var killlog = fetch('/api/clearlog', {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': '${req.headers.authorization}'
                 },
                  method: 'POST'
                  
                 }).then(response =>{
                   
                    if(response.status == 200){
                    
                    textarea.value = "";
                    lastline = 0;
                    lineslog = 0;
                   }
                   else{
                    alert("error on clear log, status: " + response.status);
                   }
                   
                   
                   
                   });
        }
       
     ${commonFrontendFunctionsGet()}
    </script>
  </header>
  <body onload="startTimer()">
  ${CreateMenu(auth)}
  <button onclick="clearlog()">Clear Log</button>
    <textarea
      readonly
      width="50%"
      rows="5%"
      charswidth="23"
      name="text_body"
      id="log"
  
    ></textarea>
  </body>
  `
    res.setHeader('Content-type', 'text/html');

    res.send(htmldata)
})

app.get('/teste', (req, res) => {
    if (req.query.password == undefined) {
        res.send(req.headers.authorization);
    } else {
        res.send("hashed password => " + sha1(req.query.password))
    }

    //req.pipe(tunnelteste);
})

app.post('/teste', (req, res) => {
    console.log(req.body);
})


app.post('/api/killProcess', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');

    log("kill process " + req.body.PID + " requested from IP " + req.ip);

    // check if user is authenticated

    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    try {
        killProcesses(req.body.PID);

        res.status(200).json({ message: "requested the SO to kill process " + req.body.PID });
    } catch (e) {
        res.statusMessage = e.message;
        res.status(500).send("error on kill process " + req.body.PID + ", error: " + e.message);
    }

})

app.get('/login', (req, res) => {
    if (basicAuth(req, res).authenticated == false) { //if authentication is required and fail, return 401
        return false;
    }
    //res.send("User authenticate");
    res.redirect('/');
})



app.get('/logout', (req, res) => {

    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    //res.status(401).send('Logout ok.') // custom message
    //res.status(401).redirect('/');
    res.status(401).send('logout ok <script language="javascript">window.location = "/"</script>');




})

app.get('/stopserver', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    res.send("<h1>server will be stopped</h1>");
    process.exit(0);
});

/*
app.get('/restartserver', (req, res) => {
    restartProgram();
})
*/


app.get('/status', (req, res) => {

    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    data += `<html>
            <head> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Status Page</title>
            <link rel="stylesheet" href="/styles.css">
            <link rel="stylesheet" href="/toast.css">
            <script>
            var totallines = 0;
                var totallinesant = 0;
            function killProcess(PID){
            var killProcessHTML = "";
            var status = 0;
            var body = "";
            var statusData = undefined;
            
                try{
                    killProcessHTML = fetch('/api/killProcess', {
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': '${req.headers.authorization}'
                     },
                      method: 'POST',
                      body: JSON.stringify({PID: PID})
                     }).then(response =>{
                       
                        if(response.status == 200){
                        
                        displayToast("green","ask to kill process "+PID+" send to server ");
                       }
                       else{
                        displayToast("red","error HTTP "+response.status+" "+response.statusText);
                       }
                       
                       
                       
                       });
                    
                     
                     
            }
            catch (e) {
                displayToast("red","error: "+e.message);
            }
             }

             function displayToast(color,text) {
                var x = document.getElementById("snackbar");
                x.className = "show";
                x.innerHTML = text;
                x.style.backgroundColor = color;
                setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
              }

              function getStatusData(){
                
                const date = new Date();
                var datasize = 0;
                
                let xhr = new XMLHttpRequest();
                xhr.open('GET', '/api/status');
                xhr.responseType = 'json';
                xhr.send();
                xhr.onload = function() {
                    let responseObj = xhr.response;
                      
                        mountStatus(responseObj);
                        
                        
                    
                   
                  };
                  

              
              }

              function mountStatus(responseObj) {
                var htmlData = "";
                var index = 0;
                totallines = responseObj.length;
                if(totallines != totallinesant || document.getElementById("status").innerHTML == ""){
                    totallinesant = totallines;
                htmlData += "<table>";
                htmlData += "<tr>";
                htmlData += "<th>PID</th>";
                htmlData += "<th>URL</th>";
                htmlData += "<th>Output</th>";
                htmlData += "<th>Endpoint</th>";
                htmlData += "<th>Client</th>";
                htmlData += "<th>Avg. Data Transfer</th>";
                htmlData += "<th>User</th>";
                htmlData += "<th>Command</th>";
                htmlData += "<th></th>";
                htmlData += "</tr>";
                
                responseObj.forEach(function(table) {
                  datasize = table.dataSize;
                  
                  htmlData += '<tr id="'+table.PID+'">';
                  if(table.childprocess.length == 0){
                  htmlData += '<td id="'+index+':PID">'+table.PID+'</td>';
                  } else {
                   htmlData += '<td id="'+table.PID+':PID"><a href="./status/'+table.PID+'">'+table.PID+'</a></td>';  
                  }
                  htmlData += '<td>'+table.url+'</td>';
                  if(table.streamlinkserver == true){
                      htmlData += '<td>http://${req.host}:'+table.streamArgs+'</td>';
                  } else if (table.restream == true) {
                    htmlData += '<td>'+table.streamArgs+'</td>';
                  } else if (table.isStreamServer == true) {
                    htmlData += '<td><a href="http://${req.hostname}:${getPortCalled(req)}/streamserver/status?streamname='+table.streamservername+'">http://${req.hostname}:${getPortCalled(req)}/play/'+table.streamArgs+'</a></td>';
                  } else {
                     htmlData += '<td>'+table.clientIP+'</td>';
                  }
                  htmlData += '<td>'+table.endpoint+'</td>';
                  htmlData += '<td>'+table.clientIP+'</td>';
                  if(table.streamlinkserver == false && table.restream == false){
                      htmlData += '<td id="'+table.PID+':datasize">'+formatDataSize(datasize)+'</td>';
                  } else {
                      htmlData += '<td id="'+table.PID+':datasize">none</td>';
                  }
                  htmlData += '<td>'+table.user+'</td>';
                  htmlData += '<td>'+table.command+'</td>';
                  htmlData += '<td><button onclick="killProcess('+table.PID+')" id="killbutton">kill process</button></td>';
                  htmlData += '</tr>';
                 
                });
                htmlData += '</table>';
           
            
                htmlData += '</body>';
                htmlData += '</html>';
                document.getElementById("status").innerHTML = htmlData;
            } else {
                index = 0;
                responseObj.forEach(function(table) {
                   
                    document.getElementById(table.PID+":datasize").innerHTML = formatDataSize(table.dataSize);
                    index++;
                });
            }
        }

              function startTimer() {
                getStatusData();
                setInterval(getStatusData, 1000);  
            }

            function formatDataSize(datasize){
                var catsize = "";
                if (datasize > 1024) {
                    datasize = datasize / 1024;
                    catsize = 'MB';
                }
                if (datasize > 1024) {
                    datasize = datasize / 1024;
                    catsize = 'GB';
                }
                datasize = datasize.toFixed(3);
                return datasize+' '+catsize;
            } 
             
            function teste(){
                document.getElementById("0:PID").innerHTML = "NULL";
            }
              
            ${commonFrontendFunctionsGet()}   

            </script>   
            </head>
            <body onload="startTimer()">
            ${CreateMenu(auth)}
            <div id="status"></div>
            <div id="snackbar"></div>
            `

    res.send(data);
})

app.get('/streamserver/list', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    var data = `<html>
    <head> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Stream Server Manager</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <script>
    var totallines = 0;
        var totallinesant = 0;
        `
    if (req.headers.authorization != undefined) {
        data += `var authorization = '${req.headers.authorization};'
            `
    } else {
        data += `var authorization = '';
            `
    }
    data += `    

    function startStreamServer(streamname){
    
    var statusData = undefined;
   
        try{
            ProcessHTML = fetch('/api/streamserver/start', {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authorization
             },
              method: 'POST',
              body: JSON.stringify({streamname: streamname})
             }).then(response =>{
               
                if(response.status == 200){
                
                displayToast("green",(typeof SP_T==='function'?SP_T('ss.msg.started').replace('%s',streamname):"StreamServer "+streamname+" has started"));
               }
               else{
                displayToast("red",(typeof SP_T==='function'?SP_T('err.http'):'error HTTP')+" "+response.status+" "+response.statusText);
               }
               
               
               
               });
            
             
             
    }
    catch (e) {
        displayToast("red","error: "+e.message);
    }
     }

     function stopStreamServer(streamname){
    
        var statusData = undefined;
        
            try{
                ProcessHTML = fetch('/api/streamserver/stop', {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authorization
                 },
                  method: 'POST',
                  body: JSON.stringify({streamname: streamname})
                 }).then(response =>{
                   
                    if(response.status == 200){
                    
                    displayToast("green",(typeof SP_T==='function'?SP_T('ss.msg.stopped').replace('%s',streamname):"StreamServer "+streamname+" has stopped"));
                   }
                   else{
                    displayToast("red",(typeof SP_T==='function'?SP_T('err.http'):'error HTTP')+" "+response.status+" "+response.statusText);
                   }
                   
                   
                   
                   });
                
                 
                 
        }
        catch (e) {
            displayToast("red","error: "+e.message);
        }
         }


         function deleteStreamServer(streamname){
    
            var statusData = undefined;
            if(confirm(typeof SP_T==='function'?SP_T('ss.confirm.delete').replace('%s',streamname):'Are you sure you want to delete the stream server '+streamname+'?')){
                try{
                    ProcessHTML = fetch('/api/streamserver/'+streamname, {
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': authorization
                     },
                      method: 'DELETE'
                     }).then(response =>{
                       
                        if(response.status == 200){
                        
                        displayToast("green",(typeof SP_T==='function'?SP_T('ss.msg.deleted').replace('%s',streamname):"StreamServer "+streamname+" has deleted"));
                       }
                       else{
                        displayToast("red",(typeof SP_T==='function'?SP_T('err.http'):'error HTTP')+" "+response.status+" "+response.statusText);
                       }
                       
                       
                       
                       });
                    
                     
                     
            }
            catch (e) {
                displayToast("red","error: "+e.message);
            }
        }
             }


     function downloadPlaylist(){
        document.location = '/streamserver/playlist.m3u';
     }

     function addStreamServer(){
        document.location = '/streamserver/create';
     }

     function editStreamServer(streamname){
        document.location = '/streamserver/edit?streamname='+streamname;
     }



     function displayToast(color,text) {
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = text;
        x.style.backgroundColor = color;
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }

      function getStatusData(){
        
        const date = new Date();
        var datasize = 0;
        
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/streamserver');
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = function() {
            let responseObj = xhr.response;
              
                mountStatus(responseObj);
                
                
            
           
          };
          

      
      }


      function getStreamTypeIcon(streamtype){
        if(streamtype == "radio"){
            return '<i class="fa fa-music"></i>';
        } else {
           return '<i class="fa fa-tv"></i>';
        }
      }
      function mountStatus(responseObj) {
        var htmlData = "";
        var index = 0;
        var streamserversRunning = undefined;
        var streamserversStopped = undefined;
        var totalstarted = 0;
        var totalstopped = 0;
        var streamserversRunning = responseObj.filter(val => val.status === "running");
            var streamserversStopped = responseObj.filter(val => val.status === "stopped");
            totalstarted = streamserversRunning.length;
            totalstopped = streamserversStopped.length;

        totallines = responseObj.length;
        if(totallines != totallinesant || document.getElementById("status").innerHTML == ""){
            totallinesant = totallines;
           
            
   
        htmlData += "<table>";
        htmlData += "<tr>";
        htmlData += "<th> </th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.name'):'Stream Name')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.channel'):'Channel Number')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.desc'):'Description')+"</th>";
        htmlData += "<th>URL</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.type'):'Type')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.endpoint'):'Endpoint')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.status'):'Status')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.transfer'):'Avg. Data Transfer')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.connections'):'Connections')+"</th>";
        htmlData += "<th>"+(typeof SP_T==='function'?SP_T('ss.th.command'):'Command')+"</th>";
        htmlData += "<th></th>";
        htmlData += "</tr>";
        
        responseObj.forEach(function(table) {
            var streamname = '\\''+table.streamname+'\\'';
            datasize = table.dataSize;
          
          htmlData += '<tr id="'+table.streamname+'">';
          if(table.logourl != "" && table.logourl != undefined) {
          htmlData += '<td> <div id="'+table.streamname+':logourl"><img src="'+table.logourl+'" width="60" height="60"/></div></td>';
          } else {
            htmlData += '<td width="60"> </td>';
          }
          htmlData += '<td >'+table.streamname+'</td>';
          htmlData += '<td id="'+table.streamname+':channelnumber">'+table.channelnumber+'</td>';
          htmlData += '<td id="'+table.streamname+':streamdescription">'+table.streamdescription+'</td>';
          htmlData += '<td id="'+table.streamname+':url">'+table.url+'</td>';
       
          htmlData += '<td id="'+table.streamname+':type">'+getStreamTypeIcon(table.type) + '</td>';
          htmlData += '<td id="'+table.streamname+':streammethod">'+table.streammethod+'</td>';
          if(table.status == "running"){
            htmlData += '<td id="'+table.streamname+':status"> <div  class="label-status label-status-green">'+(typeof SP_T==='function'?SP_T('ss.status.running'):'running')+'</div></td>';
          } else {
            htmlData += '<td id="'+table.streamname+':status"> <div  class="label-status label-status-red">'+(typeof SP_T==='function'?SP_T('ss.status.stopped'):'stopped')+'</div></td>';
          }
          htmlData += '<td id="'+table.streamname+':datasize">'+table.dataTransfered+'</td>';
          htmlData += '<td ><a href="/streamserver/status?streamname='+table.streamname+'"><div id="'+table.streamname+':connections">'+table.connections+'</div></a></td>';
          htmlData += '<td>'
          htmlData += '<button onclick="startStreamServer('+streamname+')" id="'+table.streamname+':start" class="listbutton listbutton-green"><i class="fa fa-play space-right"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.start'):'Start')+'</button>  '
          htmlData += '<button onclick="stopStreamServer('+streamname+')" id="'+table.streamname+':stop" class="listbutton listbutton-red"><i class="fa fa-stop space-right"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.stop'):'Stop')+'</button>  '
          htmlData += '<button onclick="editStreamServer('+streamname+')" id="'+table.streamname+':edit" class="listbutton listbutton-blue"><i class="fa fa-edit"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.edit'):'Edit')+'</button>  '
          htmlData += '<button onclick="deleteStreamServer('+streamname+')" id="'+table.streamname+':delete" class="listbutton listbutton-red"><i class="fa fa-trash-alt"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.delete'):'Delete')+'</button>  '
          htmlData += '</td>';
          htmlData += '</tr>';
         
        });
        if(totallines == 0){
            document.getElementById("startAll").disabled = true;
            document.getElementById("stopAll").disabled = true;
            document.getElementById("downloadPlaylist").disabled = true;
        } else {
           
            document.getElementById("downloadPlaylist").disabled = false;
        }
        htmlData += '</table>';
   
    
        htmlData += '</body>';
        htmlData += '</html>';
        document.getElementById("status").innerHTML = htmlData;
    } else {
        index = 0;
        responseObj.forEach(function(table) {
           
            document.getElementById(table.streamname+":datasize").innerHTML = table.dataTransfered;
            if(table.status == "running"){
                document.getElementById(table.streamname+":status").innerHTML = '<div  class="label-status label-status-green">'+(typeof SP_T==='function'?SP_T('ss.status.running'):'running')+'</div>';
                document.getElementById(table.streamname+":start").disabled = true;
                document.getElementById(table.streamname+":edit").disabled = true;
                document.getElementById(table.streamname+":delete").disabled = true;
                document.getElementById(table.streamname+":stop").disabled = false;
              } else {
                document.getElementById(table.streamname+":status").innerHTML = '<div  class="label-status label-status-red">'+(typeof SP_T==='function'?SP_T('ss.status.stopped'):'stopped')+'</div>';
                document.getElementById(table.streamname+":start").disabled = false;
                document.getElementById(table.streamname+":edit").disabled = false;
                document.getElementById(table.streamname+":delete").disabled = false;
                document.getElementById(table.streamname+":stop").disabled = true;
              }
             document.getElementById(table.streamname+":connections").innerHTML = table.connections;
             //document.getElementById(table.streamname+":logourl").innerHTML = '<img src="'+table.logourl+'">';
             document.getElementById(table.streamname+":type").innerHTML = getStreamTypeIcon(table.type);
             document.getElementById(table.streamname+":channelnumber").innerHTML = table.channelnumber;
             document.getElementById(table.streamname+":streamdescription").innerHTML = table.streamdescription;
             document.getElementById(table.streamname+":url").innerHTML = table.url;
             document.getElementById(table.streamname+":streammethod").innerHTML = table.streammethod;
        });
    }
    if(totalstopped == 0){
        document.getElementById("startAll").disabled = true;
        } else {
            document.getElementById("startAll").disabled = false;
        }
        if(totalstarted == 0) {
        document.getElementById("stopAll").disabled = true;
        } else {
            document.getElementById("stopAll").disabled = false;
        }
}

      function startTimer() {
        getStatusData();
        setInterval(getStatusData, 1000);  
    }

    function formatDataSize(datasize){
        var catsize = "";
        if (datasize > 1024) {
            datasize = datasize / 1024;
            catsize = 'MB';
        }
        if (datasize > 1024) {
            datasize = datasize / 1024;
            catsize = 'GB';
        }
        datasize = datasize.toFixed(3);
        return datasize+' '+catsize;
    } 
     
    function teste(){
        document.getElementById("0:PID").innerHTML = "NULL";
    }
      
    ${commonFrontendFunctionsGet()}   

    </script>   
    </head>
    <body onload="startTimer()">
    ${CreateMenu(auth)}
    <button onclick="startStreamServer('*')"  class="listbutton listbutton-green" id="startAll"><i class="fa fa-play space-right"></i> <span data-i18n="ss.btn.start_all">Start All</span></button>  
    <button onclick="stopStreamServer('*')" class="listbutton listbutton-red" id="stopAll"><i class="fa fa-stop space-right"></i> <span data-i18n="ss.btn.stop_all">Stop All</span></button>    
    <button onclick="addStreamServer()" class="listbutton listbutton-blue" id="addStreamServer"><i class="fa fa-plus"></i> <span data-i18n="ss.btn.add_server">Add Stream Server</span></button> 
    <button onclick="downloadPlaylist()" class="listbutton listbutton-blue" id="downloadPlaylist"><i class="fa fa-list"></i> <span data-i18n="ss.btn.playlist">Download Playlist</span></button>
    <div id="status"></div>
    <div id="snackbar"></div>`
    res.send(data);
});

app.get('/user/list', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    //appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    var data = `<html>
    <head> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Manager</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <script>
    var totallines = 0;
        var totallinesant = 0;
   


         function deleteUser(user){
    
            var statusData = undefined;
            if(confirm(typeof SP_T==='function'?SP_T('user.confirm.delete').replace('%s',user):'Are you sure you want to delete the user '+user+'?')){
                try{
                    ProcessHTML = fetch('/api/users/'+user, {
                    headers: { 
                        'Accept': 'application/json',
                        `

    if (req.headers.authorization != undefined) {
        data += `'Content-Type': 'application/json',
                        'Authorization': '${req.headers.authorization}' 
                        `
    } else {
        data += `'Content-Type': 'application/json' 
                        `
    }
    data += `
                     },
                      method: 'DELETE'
                     }).then(response =>{
                       
                        if(response.status == 200){
                        
                        displayToast("green",(typeof SP_T==='function'?SP_T('user.msg.deleted').replace('%s',user):"user "+user+" has deleted"));
                       }
                       else{
                        displayToast("red",(typeof SP_T==='function'?SP_T('err.http'):'error HTTP')+" "+response.status+" "+response.statusText);
                       }
                       
                       
                       
                       });
                    
                     
                     
            }
            catch (e) {
                displayToast("red","error: "+e.message);
            }
        }
             }


     

     function addUser(){
        document.location = '/user/create';
     }

     function editUser(user){
        document.location = '/user/edit?username='+user;
     }



     function displayToast(color,text) {
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = text;
        x.style.backgroundColor = color;
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }

      function getStatusData(){
        
        const date = new Date();
        var datasize = 0;
        
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/users');
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = function() {
            let responseObj = xhr.response;
              
                mountStatus(responseObj);
                
                
            
           
          };
          

      
      }


      
      function mountStatus(responseObj) {
        var htmlData = "";
        var index = 0;
       
       

        totallines = responseObj.length;
        if(totallines != totallinesant || document.getElementById("status").innerHTML == ""){
            totallinesant = totallines;
           
            
   
        htmlData += "<table>";
        htmlData += "<tr>";
        htmlData += "<th width='40%'>"+(typeof SP_T==='function'?SP_T('user.th.username'):'Username')+"</th>";
        htmlData += "<th width='50%'>"+(typeof SP_T==='function'?SP_T('user.th.fullname'):'Full Name')+"</th>";
       
        htmlData += "<th width='10%'>"+(typeof SP_T==='function'?SP_T('user.th.command'):'Command')+"</th>";
        htmlData += "<th></th>";
        htmlData += "</tr>";
        
        responseObj.forEach(function(table) {
            var username = '\\''+table.username+'\\'';
            datasize = table.dataSize;
          
          htmlData += '<tr id="'+table.username+'">';
          
          htmlData += '<td width="40%">'+table.username+'</td>';
          
          htmlData += '<td width="50%">'+table.fullname+'</td>';
         
          htmlData += '<td width="10%" >'
          htmlData += '<button onclick="editUser('+username+')" id="'+table.username+':edit" class="listbutton listbutton-blue"><i class="fa fa-edit"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.edit'):'Edit')+'</button>  '
          if(table.username == "anonymous"){
            htmlData += '<button onclick="deleteUser('+username+')" id="'+table.username+':delete" class="listbutton listbutton-red" disabled><i class="fa fa-trash-alt"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.delete'):'Delete')+'</button>  '
          } else {
            htmlData += '<button onclick="deleteUser('+username+')" id="'+table.username+':delete" class="listbutton listbutton-red"><i class="fa fa-trash-alt"></i> '+(typeof SP_T==='function'?SP_T('ss.btn.delete'):'Delete')+'</button>  '
          }
          
          htmlData += '</td>';
          htmlData += '</tr>';
         
        });
       
        htmlData += '</table>';
   
    
        htmlData += '</body>';
        htmlData += '</html>';
        document.getElementById("status").innerHTML = htmlData;
    } else {
        index = 0;
        
       
    }
   
}
function startTimer() {
    getStatusData();
    setInterval(getStatusData, 1000);  
}

     

      
    ${commonFrontendFunctionsGet()}   

    </script>   
    </head>
    <body onload="startTimer()">
    ${CreateMenu(auth)}
    <button onclick="addUser()"  class="listbutton listbutton-blue" id="addStreamServer"><i class="fa fa-plus"></i> <span data-i18n="user.btn.add">Add User</span></button>  
    <div id="status"></div>
    <div id="snackbar"></div>`
    res.send(data);
})

app.get('/status/*', (req, res) => {
    var pidtoSee = req.path;
    var data = "";
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    pidtoSee = pidtoSee.substring(pidtoSee.lastIndexOf('/') + 1);
    var myprocess = processes.filter(process => process.PID == pidtoSee)
    if (myprocess.length == 0) {
        res.status(400).send(`PID ${pidtoSee} is not child from streamproxy`);
        return false;
    }

    if (myprocess[0].childprocess.length == 0) {
        res.status(400).send(`PID ${pidtoSee} doesn't have child processes`);
        return false;
    }

    data += `<html>
    <head> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status of PID ${pidtoSee}</title>
    <style>
    table {
    border-collapse: collapse;
    width: 100%;
    }
    th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    }
    tr:hover {background-color:#f5f5f5;}
    th {
         background-color: #ddd;
       }



    </style>

    </head>
    <body>
    <h1>child processes from ${pidtoSee}</h1>
    OS: ${myprocess[0].client.os}<br>
    Browser: ${myprocess[0].client.browser}<br>
    platform: ${myprocess[0].client.platform}<br>
    user-agent: ${myprocess[0].client.source}<br>
    <p></p>
    <table>
    <tr>
      <th>PID</th>
      <th>command</th>
     
   </tr>`;

    myprocess[0].childprocess.forEach(table => {
        data += `<tr>`
        data += `<td>${table.pid}</td>`;
        data += `<td>${table.command}</td>`;
        data += `<tr>`;
    })
    data += `</table>`;
    data += `</body>`;
    data += `</html>`;
    res.send(data);
})


app.get('/settings', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var menu = CreateMenu(auth);
    var html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreamProxy - Configurações</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/toast.css">
  <script>
    ${commonFrontendFunctionsGet()}
    var SP_LANGUAGES = [
      {code:'pt', label:'Português (Brasil)'},
      {code:'en', label:'English'},
      {code:'es', label:'Español'},
      {code:'de', label:'Deutsch'},
      {code:'it', label:'Italiano'},
      {code:'ru', label:'Русский'},
      {code:'zh', label:'中文'},
      {code:'ja', label:'日本語'}
    ];
    var SP_THEME_KEYS = ['default','dark','sunrise','forest','ocean','purple','rose','orange','graphite','sapphire','contrast'];
    function initSettings() {
      var langSel = document.getElementById('settingsLanguage');
      SP_LANGUAGES.forEach(function(l){
        var opt = document.createElement('option');
        opt.value = l.code; opt.textContent = l.label;
        langSel.appendChild(opt);
      });
      langSel.value = localStorage.getItem('sp_lang') || 'pt';
      var themeSel = document.getElementById('settingsTheme');
      SP_THEME_KEYS.forEach(function(k){
        var opt = document.createElement('option');
        opt.value = k;
        opt.textContent = (typeof SP_T === 'function') ? SP_T('theme.' + k) : k;
        themeSel.appendChild(opt);
      });
      themeSel.value = localStorage.getItem('sp_theme') || 'default';
    }
    function applyLang(lang) {
      localStorage.setItem('sp_lang', lang);
    }
    function applyTheme(theme) {
      localStorage.setItem('sp_theme', theme);
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
    function saveSettings() {
      var lang = document.getElementById('settingsLanguage').value;
      var theme = document.getElementById('settingsTheme').value;
      applyLang(lang);
      applyTheme(theme);
      var msg = (typeof SP_T === 'function') ? SP_T('settings.saved') : 'Configurações salvas! Recarregando...';
      displayToast('green', msg);
      setTimeout(function(){ location.reload(); }, 1200);
    }
  </script>
</head>
<body onload="initSettings()">
  ${menu}
  <div class="settings-page">
    <h1 data-i18n="settings.title">Configurações</h1>
    <div class="settings-card">
      <div class="settings-section">
        <h2 data-i18n="settings.lang">Idioma</h2>
        <p data-i18n="settings.lang.desc">Selecione o idioma de toda a interface</p>
        <select id="settingsLanguage" class="settings-select"></select>
      </div>
      <div class="settings-section">
        <h2 data-i18n="settings.theme">Tema</h2>
        <p data-i18n="settings.theme.desc">Personalize a aparência da interface</p>
        <select id="settingsTheme" class="settings-select"></select>
      </div>
      <div>
        <button onclick="saveSettings()" class="btn btn--primary" data-i18n="settings.save">Salvar configurações</button>
      </div>
    </div>
  </div>
  <div id="snackbar"></div>
</body>
</html>`;
    res.send(html);
});


app.get('/about', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    var isAdmin = false;
    if (auth.user && auth.user !== 'anonymous') {
        var u = users.find(function(x){ return x.username === auth.user; });
        if (u && u.authorizations && u.authorizations.administrator === true) {
            isAdmin = true;
        }
    }

    res.set({ 'Server': 'streamproxy' });
    var menu = CreateMenu(auth);
    var html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreamProxy - Sobre</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/toast.css">
  <script>
    ${commonFrontendFunctionsGet()}
    var CURRENT_VERSION = '${pjson.version}';
    var IS_ADMIN = ${isAdmin};
    function loadAboutData() {
      document.getElementById('aboutCurrentVersion').textContent = CURRENT_VERSION;
      var x = new XMLHttpRequest();
      x.open('GET', 'https://raw.githubusercontent.com/asabino2/streamproxy/master/package.json');
      x.onload = function() {
        try {
          var data = JSON.parse(x.responseText);
          var latest = data.version || '?';
          document.getElementById('aboutLatestVersion').textContent = latest;
          var wrap = document.getElementById('aboutUpdateWrap');
          var btn = document.getElementById('aboutUpdateBtn');
          var status = document.getElementById('aboutUpdateStatus');
          wrap.style.display = 'flex';
          if (latest === CURRENT_VERSION) {
            status.textContent = (typeof SP_T==='function') ? SP_T('about.up_to_date') : '✅ Você está na versão mais recente.';
          } else {
            status.textContent = ((typeof SP_T==='function') ? SP_T('about.new_version') : '⬆️ Nova versão disponível:') + ' ' + latest;
            if (IS_ADMIN && btn) { btn.classList.remove('hidden'); }
          }
        } catch(e) {
          document.getElementById('aboutLatestVersion').textContent = (typeof SP_T==='function') ? SP_T('about.error') : 'Erro';
        }
      };
      x.onerror = function() { document.getElementById('aboutLatestVersion').textContent = (typeof SP_T==='function') ? SP_T('about.unavailable') : 'Indisponível'; };
      x.send();
      loadChangelog();
    }
    function loadChangelog() {
      var cx = new XMLHttpRequest();
      cx.open('GET', 'https://raw.githubusercontent.com/asabino2/streamproxy/master/README.md');
      cx.onload = function() {
        var md = cx.responseText;
        var lines = md.split('\\n');
        var html = '';
        var inList = false;
        for (var i = 0; i < lines.length && i < 60; i++) {
          var line = lines[i];
          if (line.startsWith('### ')) { if(inList){html+='</ul>';inList=false;} html += '<h4>' + line.substring(4) + '</h4>'; }
          else if (line.startsWith('## ')) { if(inList){html+='</ul>';inList=false;} break; }
          else if (line.startsWith('- ')) { if(!inList){html+='<ul>';inList=true;} html += '<li>' + line.substring(2) + '</li>'; }
        }
        if(inList) html += '</ul>';
        var fallback = (typeof SP_T==='function') ? SP_T('about.readme_fallback') : 'Veja o README.md no GitHub para o changelog completo.';
        document.getElementById('aboutChangelog').innerHTML = html || '<p>' + fallback + '</p>';
      };
      cx.onerror = function(){
        var errMsg = (typeof SP_T==='function') ? SP_T('about.readme_error') : 'Não foi possível carregar o changelog.';
        document.getElementById('aboutChangelog').innerHTML = '<p>' + errMsg + '</p>';
      };
      cx.send();
    }
  </script>
</head>
<body onload="loadAboutData()">
  ${menu}
  <div class="about-page">
    <h1 data-i18n="about.title">Sobre</h1>
    <div class="about-card">
      <div class="about-logo-wrap">
        <img src="/streamproxy_app_icon.png" class="about-logo" alt="StreamProxy"/>
        <h2>StreamProxy</h2>
      </div>
      <p class="about-description" data-i18n="about.desc">Proxy e servidor de streams de vídeo e áudio com suporte a múltiplos métodos de transmissão.</p>
      <p class="about-author" data-i18n="about.author">Desenvolvido por Alexander Sabino</p>
      <div class="about-version-grid">
        <div class="about-version-item">
          <span class="about-version-label" data-i18n="about.current_ver">Versão atual</span>
          <strong id="aboutCurrentVersion">—</strong>
        </div>
        <div class="about-version-item">
          <span class="about-version-label" data-i18n="about.latest_ver">Última versão</span>
          <strong id="aboutLatestVersion" data-i18n="about.checking">Verificando...</strong>
        </div>
      </div>
      <div id="aboutUpdateWrap" class="about-update-wrap" style="display:none">
        <span id="aboutUpdateStatus" class="about-update-status"></span>
        ${isAdmin ? '<a href="https://github.com/asabino2/streamproxy/releases" target="_blank" id="aboutUpdateBtn" class="btn btn--primary hidden" data-i18n="about.releases">Ver lançamentos</a>' : ''}
      </div>
      <div class="about-changelog">
        <h3 data-i18n="about.changelog">Últimas alterações</h3>
        <div id="aboutChangelog"><p style="font-style:italic;color:var(--text-muted)" data-i18n="about.loading">Carregando...</p></div>
      </div>
    </div>
  </div>
  <div id="snackbar"></div>
</body>
</html>`;
    res.send(html);
});


// help page, captured from github pages
app.get('/', async function(req, res) {
    if(config.logheader == true){
    log(JSON.stringify(req.headers));
    }
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    const port = getPortCalled(req)
    const https = require("https");
    const serversearch = "(&lt;serverip&gt;|<serverip>)";
    const portsearch = "(&lt;port&gt;|<port>)";
    const localhostsearch = "localhost:3000";

    const serverreplacer = new RegExp(serversearch, 'g');
    const portreplacer = new RegExp(portsearch, 'g');
    const localhostreplacer = new RegExp(localhostsearch, 'g');
    res.set({ 'Server': 'streamproxy' });
    res.set({ 'Access-Control-Allow-Origin': '*' });
    appsetheader(res);
    https.get('https://raw.githubusercontent.com/asabino2/streamproxy/master/README.md', (resp) => {
        let data = '';
        let markdownData = '';
        let menuStyle = CreateMenuStyle();
        let menu = CreateMenu(auth);
        data += `<html>
                  <head>
            <link rel="stylesheet" href="/styles.css">
            <link rel="stylesheet" href="/toast.css">
                </head>
                <body>
                ${menu}`
            // A chunk of data has been received.
        resp.on('data', (chunk) => {
            markdownData += chunk.toString();

        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            markdownData = markdownData.replace(serverreplacer, req.hostname);
            markdownData = markdownData.replace(portreplacer, port);
            markdownData = markdownData.replace(localhostreplacer, req.hostname + ":" + port);

            try {
                data += markdownConverter.makeHtml(markdownData);
            } catch (e) {
                log("Markdown conversion error: " + e.message);
                data += `<pre>${markdownData.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            }

            data += `</body></html>`;
            res.send(data);
        });

    }).on("error", (err) => {
        log("Error: " + err.message);

    });

});

app.get('/docs/api', (req, res) => {
    var html = `<!doctype html> <!-- Important: must specify -->
 <html>
 <head>
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>StreamProxy API Documentation</title>
   <meta charset="utf-8"> <!-- Important: rapi-doc uses utf8 characters -->
   <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
 </head>
 <body>
   <rapi-doc
     spec-url="https://stoplight.io/api/v1/projects/asabino/streamproxy/nodes/apidoc.yaml"
     theme = "dark"
     show-header = false
     sort-endpoints-by = "none"
   > </rapi-doc>
 </body>`
    res.send(html);
});

app.get('/streamproxy_app_icon.png', (req, res) => {
    const path = require('path');
    const fs = require('fs');
    const iconPath = path.join(__dirname, '..', 'streamproxy_app_icon.png');
    if (fs.existsSync(iconPath)) {
        res.setHeader('Content-Type', 'image/png');
        res.sendFile(iconPath);
    } else {
        res.status(404).send('');
    }
});

app.get('/styles.css', (req, res) => {
    var data = "";
    res.setHeader('Content-Type', 'text/css');
    data = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* === CSS Variables & Themes === */
:root {
  --sidebar-w: 220px;
  --sidebar-bg: #1a1a2e;
  --sidebar-text: #a0aec0;
  --sidebar-text-active: #ffffff;
  --sidebar-active-bg: rgba(255,255,255,0.08);
  --sidebar-hover-bg: rgba(255,255,255,0.05);
  --sidebar-accent: #4299e1;
  --bg: #f7f8fa;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text: #1a202c;
  --text-muted: #718096;
  --text-sm: #4a5568;
  --accent: #3182ce;
  --accent-hover: #2b6cb0;
  --danger: #e53e3e;
  --success: #38a169;
  --warning: #d69e2e;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  /* legacy compat */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

[data-theme="dark"] {
  --sidebar-bg: #0a0a14; --sidebar-text: #8892a4; --sidebar-text-active: #e2e8f0;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #60a5fa; --bg: #0f172a; --surface: #1e293b; --border: #334155;
  --text: #e2e8f0; --text-muted: #94a3b8; --text-sm: #cbd5e1; --accent: #60a5fa; --accent-hover: #3b82f6;
}
[data-theme="sunrise"] {
  --sidebar-bg: #7c2d12; --sidebar-text: #fed7aa; --sidebar-text-active: #fff7ed;
  --sidebar-active-bg: rgba(255,255,255,0.12); --sidebar-hover-bg: rgba(255,255,255,0.07);
  --sidebar-accent: #fb923c; --bg: #fff7ed; --surface: #ffffff; --border: #fed7aa;
  --text: #431407; --text-muted: #9a3412; --text-sm: #7c2d12; --accent: #ea580c; --accent-hover: #c2410c;
}
[data-theme="forest"] {
  --sidebar-bg: #14532d; --sidebar-text: #bbf7d0; --sidebar-text-active: #f0fdf4;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #4ade80; --bg: #f0fdf4; --surface: #ffffff; --border: #bbf7d0;
  --text: #14532d; --text-muted: #166534; --text-sm: #15803d; --accent: #16a34a; --accent-hover: #15803d;
}
[data-theme="ocean"] {
  --sidebar-bg: #164e63; --sidebar-text: #a5f3fc; --sidebar-text-active: #ecfeff;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #22d3ee; --bg: #ecfeff; --surface: #ffffff; --border: #a5f3fc;
  --text: #164e63; --text-muted: #0e7490; --text-sm: #0891b2; --accent: #0891b2; --accent-hover: #0e7490;
}
[data-theme="purple"] {
  --sidebar-bg: #3b0764; --sidebar-text: #e9d5ff; --sidebar-text-active: #faf5ff;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #c084fc; --bg: #faf5ff; --surface: #ffffff; --border: #e9d5ff;
  --text: #3b0764; --text-muted: #7e22ce; --text-sm: #6b21a8; --accent: #9333ea; --accent-hover: #7e22ce;
}
[data-theme="rose"] {
  --sidebar-bg: #881337; --sidebar-text: #fecdd3; --sidebar-text-active: #fff1f2;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #fb7185; --bg: #fff1f2; --surface: #ffffff; --border: #fecdd3;
  --text: #881337; --text-muted: #be123c; --text-sm: #9f1239; --accent: #e11d48; --accent-hover: #be123c;
}
[data-theme="orange"] {
  --sidebar-bg: #431407; --sidebar-text: #fed7aa; --sidebar-text-active: #fff7ed;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #fb923c; --bg: #fff7ed; --surface: #ffffff; --border: #fed7aa;
  --text: #1c1917; --text-muted: #78350f; --text-sm: #92400e; --accent: #f97316; --accent-hover: #ea580c;
}
[data-theme="graphite"] {
  --sidebar-bg: #111827; --sidebar-text: #9ca3af; --sidebar-text-active: #f9fafb;
  --sidebar-active-bg: rgba(255,255,255,0.08); --sidebar-hover-bg: rgba(255,255,255,0.04);
  --sidebar-accent: #9ca3af; --bg: #f3f4f6; --surface: #ffffff; --border: #d1d5db;
  --text: #111827; --text-muted: #6b7280; --text-sm: #374151; --accent: #374151; --accent-hover: #1f2937;
}
[data-theme="sapphire"] {
  --sidebar-bg: #1e1b4b; --sidebar-text: #c7d2fe; --sidebar-text-active: #eef2ff;
  --sidebar-active-bg: rgba(255,255,255,0.1); --sidebar-hover-bg: rgba(255,255,255,0.06);
  --sidebar-accent: #818cf8; --bg: #eef2ff; --surface: #ffffff; --border: #c7d2fe;
  --text: #1e1b4b; --text-muted: #4338ca; --text-sm: #3730a3; --accent: #4f46e5; --accent-hover: #4338ca;
}
[data-theme="contrast"] {
  --sidebar-bg: #000000; --sidebar-text: #e5e5e5; --sidebar-text-active: #ffff00;
  --sidebar-active-bg: rgba(255,255,0,0.15); --sidebar-hover-bg: rgba(255,255,255,0.08);
  --sidebar-accent: #ffff00; --bg: #ffffff; --surface: #ffffff; --border: #000000;
  --text: #000000; --text-muted: #333333; --text-sm: #1a1a1a; --accent: #0000cc; --accent-hover: #000099;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  background-color: var(--bg);
  margin-left: var(--sidebar-w);
  padding: 20px;
    }

    h1, h2, h3, h4, h5, h6 { color: var(--text); margin-bottom: 1rem; }

    a { color: var(--accent); text-decoration: none; transition: color 0.3s ease; }
    a:hover { color: var(--accent-hover); text-decoration: underline; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; background-color: var(--surface);
        box-shadow: var(--shadow-sm); border-radius: var(--radius-md); overflow: hidden; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border); }
    th { background-color: var(--dark-color); color: #fff; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; }
    tr:hover { background-color: rgba(0,0,0,0.02); }

    button, .button { display: inline-block; font-weight: 400; text-align: center; white-space: nowrap;
        vertical-align: middle; user-select: none; border: 1px solid transparent; padding: 0.375rem 0.75rem;
        font-size: 1rem; line-height: 1.5; border-radius: 0.25rem;
        transition: color 0.15s, background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
        cursor: pointer; background-color: var(--primary-color); color: white; }
    button:hover, .button:hover { background-color: #0056b3; text-decoration: none; }
    #killbutton { background-color: var(--danger-color); }
    #killbutton:hover { background-color: #c82333; }

    input[type="text"], input[type="password"], select, textarea { display: block; width: 100%;
        padding: 0.375rem 0.75rem; font-size: 1rem; line-height: 1.5; color: var(--text);
        background-color: var(--surface); background-clip: padding-box; border: 1px solid var(--border);
        border-radius: 0.25rem; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        box-sizing: border-box; }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(49,130,206,0.25); }
    @media screen and (max-width: 600px) { table { display: block; overflow-x: auto; white-space: nowrap; } }

    /* === Sidebar === */
    .sidebar {
      position: fixed; top: 0; left: 0; width: var(--sidebar-w); height: 100vh;
      background: var(--sidebar-bg); display: flex; flex-direction: column;
      overflow-y: auto; z-index: 100;
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 10px; padding: 20px 18px 16px;
      color: var(--sidebar-text-active); font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
      border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .brand-icon { width: 32px; height: 32px; border-radius: 8px; object-fit: contain; flex-shrink: 0; }
    .nav-list { list-style: none; padding: 8px 0; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 18px;
      background: transparent; border: none; cursor: pointer; color: var(--sidebar-text);
      font-size: 13.5px; font-weight: 500; border-radius: 0; border-left: 3px solid transparent;
      transition: background 150ms, color 150ms; text-decoration: none; text-align: left;
    }
    .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
    .nav-item:hover { background: var(--sidebar-hover-bg); color: var(--sidebar-text-active); text-decoration: none; }
    .nav-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-text-active);
      border-left-color: var(--sidebar-accent); padding-left: 15px; }
    .sidebar-footer {
      margin-top: auto; padding: 12px 16px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0;
    }
    .sidebar-username {
      font-size: 12px; color: var(--sidebar-text); padding: 4px 0 8px; text-align: center;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .sidebar-logout { width: 100%; justify-content: center; color: var(--sidebar-text);
      background: transparent; border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius-sm);
      padding: 7px 12px; font-size: 13px; cursor: pointer; display: block; text-align: center;
      transition: background 150ms, color 150ms; text-decoration: none; }
    .sidebar-logout:hover { color: #fff; background: rgba(255,255,255,0.1); text-decoration: none; }

    /* === New utility button classes === */
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
      border-radius: var(--radius-sm); border: none; cursor: pointer; font-size: 13.5px;
      font-weight: 500; transition: opacity 150ms, background 150ms, transform 120ms; white-space: nowrap; }
    .btn:disabled { opacity: 0.55; cursor: wait; }
    .btn:not(:disabled):hover { opacity: 0.88; }
    .btn:not(:disabled):active { transform: scale(0.97); }
    .btn--primary { background: var(--accent); color: #fff; }
    .btn--primary:not(:disabled):hover { background: var(--accent-hover); opacity: 1; }
    .btn--secondary { background: #edf2f7; color: var(--text-sm); }
    .btn--ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
    .btn--danger { background: #fff0f0; color: var(--danger); border: 1px solid #fecaca; }
    .btn--sm { padding: 5px 11px; font-size: 12.5px; }

    /* === Settings page === */
    .settings-card { max-width: 640px; display: flex; flex-direction: column; gap: 28px; }
    .settings-section { display: flex; flex-direction: column; gap: 10px; }
    .settings-section h2 { font-size: 1rem; font-weight: 600; color: var(--text); }
    .settings-section p { font-size: 0.85rem; color: var(--text-muted); }
    .settings-select {
      padding: 8px 12px; padding-right: 32px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 0.875rem; font-family: inherit; background: var(--surface); color: var(--text);
      cursor: pointer; max-width: 280px; appearance: none; -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; transition: border-color 150ms;
    }
    .settings-select:focus { outline: none; border-color: var(--accent); }
    .settings-page { padding: 20px 0; }
    .settings-page h1 { margin-bottom: 24px; color: var(--text); font-size: 22px; }

    /* === About page === */
    .about-card { max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
    .about-logo-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .about-logo { width: 80px; height: 80px; object-fit: contain; border-radius: 16px; }
    .about-logo-wrap h2 { font-size: 1.4rem; font-weight: 700; color: var(--text); }
    .about-description { font-size: 0.9rem; color: var(--text-muted); max-width: 480px; line-height: 1.6; }
    .about-version-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 380px; }
    .about-version-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px; }
    .about-version-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .03em; }
    .about-version-item strong { font-size: 1.1rem; color: var(--text); }
    .about-update-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }
    .about-update-status { font-size: 0.875rem; color: var(--text-muted); }
    .about-changelog { width: 100%; text-align: left; border-top: 1px solid var(--border); padding-top: 16px; }
    .about-changelog h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; color: var(--text); }
    .about-author { margin-top: 1.5rem; font-size: 0.82rem; color: var(--text-muted); text-align: center; }
    .about-page { padding: 20px 0; }
    .about-page h1 { margin-bottom: 24px; color: var(--text); font-size: 22px; }
    .hidden { display: none !important; }

    /* === Toast === */
    #snackbar {
        visibility: hidden; min-width: 250px; margin-left: -125px; background-color: #333; color: #fff;
        text-align: center; border-radius: 2px; padding: 16px; position: fixed; z-index: 200;
        left: 50%; bottom: 30px; font-size: 17px;
    }
    #snackbar.show { visibility: visible; -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s; animation: fadein 0.5s, fadeout 0.5s 2.5s; }
    @-webkit-keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
    @keyframes fadein { from {bottom: 0; opacity: 0;} to {bottom: 30px; opacity: 1;} }
    @-webkit-keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }
    @keyframes fadeout { from {bottom: 30px; opacity: 1;} to {bottom: 0; opacity: 0;} }

    /* === Label status badges === */
    .label-status { border-radius: .25em; font-family: var(--font-family); font-style: normal; font-weight: 700;
        font-size: 13px !important; color: #fff; display: inline; line-height: 1;
        padding: .2em .6em .3em; text-align: center; vertical-align: baseline; white-space: nowrap; }
    .label-status-green { background-color: var(--success-color); }
    .label-status-red { background-color: var(--danger-color); }

    /* === List buttons === */
    .listbutton { text-decoration: none; border: none; padding: 8px 20px; font-size: 12px;
        color: #fff; border-radius: 5px; cursor: pointer; outline: none; transition: 0.2s all; }
    .listbutton-red { background-color: var(--danger-color); }
    .listbutton-green { background-color: var(--success-color); }
    .listbutton-blue { background-color: var(--primary-color); }
    .listbutton:active { transform: scale(0.98); }
    .listbutton:disabled { background-color: gray; }

    /* === Responsive === */
    @media (max-width: 900px) {
      :root { --sidebar-w: 60px; }
      .sidebar-brand span, .nav-item span { display: none; }
      .nav-item { justify-content: center; padding: 10px; }
      .nav-item.active { padding-left: 10px; }
      .sidebar-username { display: none; }
    }
    @media (max-width: 600px) {
      body { margin-left: 0; }
      .sidebar { display: none; }
    }
          `;
    res.send(data);
});

app.get('/toast.css', (req, res) => {
    var data = "";
    data = `/* Start of toast */  
    #snackbar {
      visibility: hidden;
      min-width: 250px;
      margin-left: -125px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 2px;
      padding: 16px;
      position: fixed;
      z-index: 1;
      left: 50%;
      bottom: 30px;
      font-size: 17px;
    }
    
    #snackbar.show {
      visibility: visible;
      -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
      animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }`;
    res.send(data);
});

app.get('/user/create', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    mountUserAdminPage(req, res, "POST");
});

app.get('/user/edit', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    var username = req.query.username;
    var user = users.find(value => value.username == username)
    mountUserAdminPage(req, res, "PUT", user);
});

app.get('/changepassword', (req, res) => {
    var html = "";
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login == "" || login == undefined) {
        res.set('WWW-Authenticate', 'Basic realm="401"') // change this
        res.status(401).send('Authentication required.') // custom message
        return false;
    }





    html += `<html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">`;

    //styles
    html += `<style>
    
    
    
    .label {
      position: absolute;
        /*left: 42%; */
       
    }
    
    .secondaryinput {
      position: absolute;
      /*  left: 42%; */
       width: 800px;
       height: 30px;
       border-radius: 5px;
       
       
    }
    
    
    #main {
      width: 100%;
    }
    
    #forms {
      position: relative;
      top: 30px;
      width:800px;
      margin: auto;
      
    }
    
    
   
    #logdiv {
        position: relative;
        border:  1px solid black;
        width: 1300px;
        height: 500px;
        margin: auto;
        top: 200px;
      }

    #maintainuserbutton {
                   /* transform: translatex(1180px) translatey(352px);*/
                   /* min-height: 35px; */
                     position: relative;
                     width: 186px;
                     
                     
                                 text-decoration: none;
                                 border: none;
                                 padding: 12px 40px;
                                 font-size: 16px;
                                 background-color: blue;
                                 color: #fff;
                                 border-radius: 5px;
                                 box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                                 cursor: pointer;
                                 outline: none;
                                 transition: 0.2s all;
                             }
                 
                             #maintainuserbutton:active {
                                 transform: scale(0.98);
                                 
                                 box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                 
                             } 
                             #maintainuserbutton:disabled {
                                background-color: gray;
                             }  


    #resetbutton {
                    /* transform: translatex(1180px) translatey(352px);*/
                    /* min-height: 35px; */
                        position: relative;
                        width: 186px;
                                  
                                  
                        text-decoration: none;
                        border: none;
                        padding: 12px 40px;
                        font-size: 16px;
                        background-color: red;
                        color: #fff;
                        border-radius: 5px;
                        box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                        cursor: pointer;
                        outline: none;
                        transition: 0.2s all;
                        }
                              
                        #resetbutton:active {
                            transform: scale(0.98);
                                              
                            box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                              
                            } 
                        #resetbutton:disabled {
                            background-color: gray;
                            }  
                             
    </style>`
        /* Scripts */
    html += `<script>
    ${commonFrontendFunctionsGet()}
    
    function maintainpassword(){
       
       
       var password =  document.getElementById("password").value;
     
   
    //document.getElementById("logdiv").innerHTML = "processing....";
    document.getElementById("maintainuserbutton").disabled = true;

    fetch("/api/users/changepassword", {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': '${req.headers.authorization}'
        },
        body: JSON.stringify({password: password})
    }).then(
        response => {

            if (response.status != 200) {
                displayToast("red","Error "+response.status+" "+response.statusText);
                document.getElementById("maintainuserbutton").disabled = false;
            }
            return response.text();
        }).then(
        data => {
            var response = JSON.parse(data);
            document.getElementById("maintainuserbutton").disabled = false;
          if (response.passwordchanged == true) {
                //document.getElementById("logdiv").innerHTML = "<h2>password changed<h2>";
                displayToast("green","password changed");
                
                //alert("stream server has added in list");
               
                resetData();

     
        enabledisablefields()
        window.location.assign("/")
       
    
           
            } else {
                displayToast("red","Error on execute: " + response.message);
                

            }
        });
}

    function enabledisablefields() {
        

    }

    function checkForSpecialCharacter(text) {
        //  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // removed because javascript error
        // return format.test(text);
        //return false;
    }

    function onlyNumbers(str) {
        return /^[0-9]+$/.test(str);
    }

    function resetData(){
        document.getElementById("password").value = "";
        
        }
    </script>
    </head>
    <body>
      ${CreateMenu({authenticated: true, user: login, authorized: true})}
      <div id="main">
        <center><h1>Change Password for user ${login}</h1></center>
        <h2><center><center></h2>
      <div id="forms">
     
        <!-- password-->
          <div id="passworddiv" >
             <label class="label">Password:</label> <br>
          <input type="password" id="password" name="password" class="secondaryinput" size="50" value=""/><br /><br /><br />
        </div>
        
                    
                    

                    
     <center>
     <button onclick="maintainpassword()" id="maintainuserbutton" >Save</button>
     <button onclick="resetData()" id="resetbutton" >Reset</button>
     </center>
   </div>
  
   <div id="snackbar"></div>
     </div>                
                         </body>
                         </html>`;

    res.send(html);
})

app.get("/.well-known/ai-plugin.json", function (req, res) {
    var pluginjson = {
  schema_version: "v1",
  name_for_human: "StreamProxy ChatGPT Plugin",
  name_for_model: "streamproxy_chatgpt_plugin",
  description_for_human: "Plugin for managing streams in streamproxy",
  description_for_model: "Plugin for managing streams in streamproxy",
  auth: {
    type: "none"
  },
  api: {
    type: "openapi",
    url: "https://stoplight.io/api/v1/projects/asabino/streamproxy/nodes/apidoc.yaml",
    is_user_authenticated: false
  },
  logo_url: "PLUGIN_HOSTNAME/logo.png",
  contact_email: "asabino2@gmail.com",
  legal_info_url: "https://example.com/legal"
}

    res.send(pluginjson);
})

app.get("/snapshot.jpg", function (req, res) {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    //resolution = req.query.resolution;
    const resolution = req.query.resolution || "0x0";
    const [reswidth, resheight] = resolution.split('x');
    var binfile = getbinaryimagefromStream(url, reswidth, resheight);
    res.set({ 'Content-Type': 'image/jpeg' });
    res.send(binfile);
})

var server = app.listen(config.port);
//var server = app.listen(8500);








/********************************************************************************************************************************/
/*                                       F U N C T I O N S                                                                      */
/*******************************************************************************************************************************/


// Load configuration
function loadconfig() {
    //console.log("port defined: " + argv['port']);
    config = {};
    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync(datadirectory + "streamproxy.config.json");
        config = JSON.parse(jsonString);

    } catch (err) {



        config = { port: argv['port'] || 4211, logheader: false, logConsole: true, logWeb: false, showErrorInStream: false, streamlinkpath: "", ffmpegpath: "", ffmpeg: { codec: "mpeg2video", format: "mpegts", serviceprovider: "streamproxy" }, streamserver: { startOnInvoke: false, hideStoppedStreamServerInPlaylist: true, stopOnNoConnection: false } };


        const fswrite = require("fs");
        try {
            var configstr = JSON.stringify(config);

            fswrite.writeFileSync(datadirectory + "streamproxy.config.json", configstr);
        } catch (err) {

        }

    }
    //config.port = 9122;
    // if port defined in command line, overwrite config file
    if (argv['port'] != undefined) {
        config.port = argv['port'];
    }

    if (config.streamlinkpath == undefined) {
        config.streamlinkpath = "";
    }

    if (config.ffmpegpath == undefined) {
        config.ffmpegpath = "";
    }

    if(config.logheader == undefined){
        config.logheader = false;
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

    if (config.logConsole == undefined) {
        config.logConsole = true;
    }

    if (config.logWeb == undefined) {
        config.logWeb = false;
    }

    if (config.showErrorInStream == undefined) {
        config.showErrorInStream = false;
    }



    if (config.streamserver == undefined) {
        config.streamserver = { startOnInvoke: false, hideStoppedStreamServerInPlaylist: true };
    } else {

        if (config.streamserver.startOnInvoke == undefined) {
            config.streamserver.startOnInvoke = false;
        }



        if (config.streamserver.hideStoppedStreamServerInPlaylist == undefined) {
            config.streamserver.hideStoppedStreamServerInPlaylist = true;
        }

        if (config.streamserver.stopOnNoConnection == undefined) {
            config.streamserver.stopOnNoConnection = false;
        }
    }

    /*    
        if (config.youtubeapikey == undefined) {
            config.youtubeapikey = process.env.YOUTUBE_API_KEY;
        }
    */

}

// add process
function addprocess(req, spawn, user, streamservertype, streamserverArgs) {
    var spawncommand = spawn.spawnargs;
    var PID = spawn.pid; // to do: use command pgrep -P PID para ver todos os processos subsequentes
    var childprocesses = getChildProcess(spawn.pid);
    var streamlinkserver = false;
    var restream = false;
    var isStreamServer = false;
    var streamserver = streamserverArgs;
    var streamservername = "";
    var useragent = req.headers["user-agent"];
    var mystreamserverlist = {};
    var mystreamserverlistIndex = 0;

    switch (streamservertype) {
        case "streamlinkServer":
            streamlinkserver = true;
            break;
        case "restream":
            restream = true;
            break;
        case "streamserver":
            isStreamServer = true;
            streamservername = streamserverArgs;
            // start streamserver 
            mystreamserverlistIndex = arrstreamserverlist.findIndex(val => val.streamname === streamservername);
            if (mystreamserverlistIndex != -1) {
            arrstreamserverlist[mystreamserverlistIndex].status = "running";
            }

    }


    spawncommand = spawncommand.toString();
    spawncommand = spawncommand.replace(/,/g, ' ');
    log("added process " + PID + " to status");
    processes.push({ url: req.query.url, PID: PID, childprocess: childprocesses, clientIP: req.ip, endpoint: req.path, command: spawncommand, dataSize: 0, user: user, streamlinkserver: streamlinkserver, restream: restream, isStreamServer: isStreamServer, streamArgs: streamserverArgs, spawnArgs: spawn.spawnargs, streamservername: streamservername, client: { ip: req.ip, isMobile: req.useragent.isMobile, isPhone: req.useragent.isPhone, isAndroid: req.useragent.isAndroid, isDesktop: req.useragent.isDesktop, isLinux: req.useragent.isLinux, isWindows: req.useragent.isWindows, isBot: req.useragent.isBot, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, platform: req.useragent.platform, source: req.useragent.source } });

}

// remove process
function removeprocess(PID) {
    log("remove process " + PID + " from status");
    processes = processes.filter(val => val.PID !== PID);
}

function ffprobeStreamlink(url) {
    var child_process = require("child_process");
    var returncommand = child_process.execSync(config.streamlinkpath + "streamlink " + url + "  best --config /config.txt --stdout | " + config.ffmpegpath + "ffprobe -v quiet -print_format json -show_format -show_streams -show_programs -");

    return returncommand;
}

function checkStreamlink(url) {
    var status = "";
    var erro = "";

    var child_process = require("child_process");
    var command = config.streamlinkpath + "streamlink " + url + "  best --config /config.txt --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f null -";

    try {
        retunrcommand = require('child_process').execSync(command);
        status = "online";
    } catch (e) {
        status = "offline";
        erro = e.message;
    }
    return { streamurl: url, streamstatus: status, mensagem: erro };



}

function getsnapshotfromStream(url, width, height)
{
    
    var status = "";
    var erro = "";
    var base64image = "";
    /*
    var child_process = require("child_process");
    if(width == 0 || height == 0)
    {
        var command = config.streamlinkpath + "streamlink " + url + " best --config /config.txt --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f image2 -";
    }
    else
    {
        var command = config.streamlinkpath + "streamlink " + url + " best --config /config.txt --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f image2 -s " + width + "x" + height + " -";
    }
    */
    try {
        //retunrcommand = require('child_process').execSync(command);
        returncommand = getbinaryimagefromStream(url, width, height);
        base64image = retunrcommand.toString('base64');
        status = "online";
    } catch (e) {
        status = "offline";
        erro = e.message;
    }
    return { streamurl: url, streamstatus: status, mensagem: erro, snapshot: base64image };
}

function getbinaryimagefromStream(url, width, height)
{
    var status = "";
    var erro = "";
    var base64image = "";

    var child_process = require("child_process");
    if(width == 0 || height == 0)
    {
        var command = config.streamlinkpath + "streamlink " + url + " best --config /config.txt --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f image2 -";
    }
    else
    {
        var command = config.streamlinkpath + "streamlink " + url + " best --config /config.txt --stdout | " + config.ffmpegpath + "ffmpeg -hide_banner -loglevel error -ss 00:00:01 -i pipe:0 -vframes 1 -q:v 2 -f image2 -s " + width + "x" + height + " -";
    }
    

    try {
        retunrcommand = require('child_process').execSync(command);
        return retunrcommand;
    } catch (e) {
        status = "offline";
        erro = e.message;
        return {ststus: status, mensagem: erro};
    }
   
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
    res.set({ 'Server': 'asabino2.streamproxy' });
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

function setDataSize(PID, data) {
    var objIndex = processes.findIndex(obj => obj.PID == PID);

    if (objIndex > -1) {

        //processes[objIndex].dataSize = processes[objIndex].dataSize + data.length / 1024;
        //processes[objIndex].dataSize = data.length / 1024;
        processes[objIndex].dataSize = data.length / 8;
    }
}




function basicAuth(req, res) {
    const b64systemAuth = req.headers.systemauthorization;
    var user = "";
    if (b64systemAuth != undefined) {
        const [login, password] = Buffer.from(b64systemAuth, 'base64').toString().split(':');
        if (login == "system") {
            if (password == systempassword) {
                return { authenticated: true, user: "system", auth: undefined, authorized: true };

            }
        }
    }

    if ((req.headers.authorization == undefined || req.headers.authorization == "") && req.path != "/login") {
        user = "anonymous";
        var isAuthorized = checkAuthorization(req, user);
        if (isAuthorized == true) {
            return { authenticated: true, user: user, auth: undefined, authorized: true };
        }
    }
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');






    authdataconfig = users.find(item => item.username == login)
    if (authdataconfig != undefined) {

        if (authdataconfig.password == sha1(password)) { // login successfully, check if authorized
            var isAuthorized = checkAuthorization(req, login);
            if (isAuthorized == true && login != "anonymous" && login != "system") {
                return { authenticated: true, user: login, auth: b64auth, authorized: true };
            } else {
                res.status(403).end();
                return { authenticated: true, user: login, auth: b64auth, authorized: false };
            }

        } else {

            res.set('WWW-Authenticate', 'Basic realm="401"') // change this
            res.status(401).send('Authentication required.') // custom message
            return { authenticated: false, user: undefined, auth: b64auth };
        }
    } else {

        res.set('WWW-Authenticate', 'Basic realm="401"') // change this
        res.status(401).send('Authentication required.') // custom message
        return { authenticated: false, user: undefined, auth: undefined };
    }
}

function getChildProcess(PID, globalpids = []) {
    //Get-WmiObject -Class Win32_Process -Filter "ParentProcessID=17956" | Select-Object -ExpandProperty ProcessID
    var pids = [];

    var exitloop = false;
    var command = "";
    var returncommand = "";
    var pscommand = undefined;

    try {

        pids = [];
        if (os.platform == 'win32') {
            command = `powershell -c "Get-WmiObject -Class Win32_Process -Filter "ParentProcessID=${PID}" | Select-Object -ExpandProperty ProcessID"`;

        } else {

            command = "ps h --ppid " + PID + " -o pid";
        }

        returncommand = require('child_process').execSync(command)
        returncommand = returncommand.toString();

        if (os.platform == 'win32') {
            pids = returncommand.split('\r\n');
        } else {
            pids = returncommand.split('\n');
        }

        pids = pids.filter(val => val !== '');
        if (pids.length <= 0) {
            globalpids = globalpids.filter(val => val !== '');

            return globalpids;
        }

        pids.forEach((pid) => {
            pscommand = getPIDData(pid);
            globalpids.push({ pid: pid, command: pscommand.command });
            var dummy = getChildProcess(pid, globalpids);
        })

        globalpids = globalpids.filter(val => val !== '');
        return globalpids;

    } catch (e) {


        return globalpids;
    }

}

function killProcesses(parentPID) {
    var childprocesses = getChildProcess(parentPID);



    removeStreamServer(parentPID);
    if (childprocesses.length > 0) {
        childprocesses.forEach((pid) => {
            process.kill(pid.pid);
            log("process " + pid.pid + " killed");
        })


    };
    try {
        process.kill(parentPID);
        log("process " + parentPID + " killed");
    } catch (e) {}
}

function announceStreaming(url) {
    log("");
    log("");
    log("*******************************************************************************************************");
    log(url);
    log("*******************************************************************************************************");
    log("");
}

function getPIDData(pid) {
    var command = "";
    var returncommand = "";
    var parts = [];
    if (os.platform != "win32") {
        command = "ps h --pid " + pid + " -o args";
    } else {
        command = `powershell -c "Get-WmiObject -Class Win32_Process -Filter ParentProcessID=${pid} | Select-Object -ExpandProperty CommandLine"`;
    }

    returncommand = require('child_process').execSync(command)
    returncommand = returncommand.toString();

    return { pid: pid, command: returncommand };

}

function streamlinkHTTPServer(req, res, auth, port = 0) {
    appsetheader(res);
    var clientIP = req.ip;
    url = req.query.url;
    announceStreaming(url);
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    log(`opening connect to server stream in url ${url} from ${clientIP}`);

    const stream = spawn(config.streamlinkpath + "streamlink", ['--config','/config.txt','--player-continuous-http', '--player-external-http-port', port, '--player-external-http', url, 'best']);


    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization



        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        addprocess(req, stream, auth.user, "streamlinkServer", port)
        log(`running streamlink server app (PID ${stream.pid}) [${spawncommand}]`);
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
        log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
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

        setDataSize(stream.pid, data);

    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })

    stream.on('exit', (code, signal) => {

        removeprocess(stream.pid);
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
        removeprocess(stream.pid);
        log(`error ocurred: ${err}`);
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
        log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        //console.log(`closed connection of url ${url}`);
        //console.log(`kill PID ${stream.pid} of program streamlink`)
        //stream.kill();
        //killProcesses(stream.pid);
    })
}

function log(logtext) {
    if (config.logConsole == true) {
        console.log(logtext);
    }

    if (config.logWeb == true) {
        if (logdata.length == 500) {
            logdata.splice(0, 1);
        }
        logdata.push(logtext);
    }

}

function ffmpegDisplayText(text = "", bgimage = "", size = "1920x1080", bgcolor = "blue", fontcolor = "white", font = "/path/to/font.ttf", format = "h264") {
    var ffmpegcomm = "";
    var bgimagestr = ""
    var textstr = "";
    var textlen = text.length;
    var fontsize = 0;
    if (textlen < 15) {
        fontsize = 55;
    } else {
        fontsize = 130 - textlen;
    }
    if (fontsize < 5) {
        fontsize = 25;
    }

    if (bgimage != "" && bgimage != undefined) {
        bgimagestr = `-loop 1 -f image2 -i ${bgimage} `
    }
    if (text != "" && text != undefined) {
        textstr = `-f lavfi  -i color=size=${size}:rate=25:color=${bgcolor}  -vf "drawtext=fontfile=${font}:fontsize=${fontsize}:fontcolor=${fontcolor}:x=(w-text_w)/2:y=(h-text_h)/2:text='${text}'"`
    }

    ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel error  ${bgimagestr} ${textstr} -c:v libx264  -t 30  -f ${format} -`;


    if (os.platform() == 'win32') {
        return spawn(ffmpegcomm, { shell: 'powershell.exe' });
    } else {
        return spawn(ffmpegcomm, { shell: true });
    }
}



function displayErrorInStream(errortext) {
    var texttodisplay = errortext;
    var separatedtext = errortext.split("\r\n");


    var ffmpegcomm = "";
    var bgimagestr = ""
    var textstr = "";
    var textlen = errortext.length;
    var fontsize = 0;
    if (textlen < 15) {
        fontsize = 55;
    } else {
        fontsize = 130 - textlen;
    }
    if (fontsize < 5) {
        fontsize = 25;
    }


    ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel error -loop 1 -f image2 -i ./resources/nosignal.jpg -c:v libx264 -t 50 -f h264 -`;

    console.log("ffmpeg command for errordisplay: " + ffmpegcomm);
    if (os.platform() == 'win32') {
        return spawn(ffmpegcomm, { shell: 'powershell.exe' });
    } else {
        return spawn(ffmpegcomm, { shell: true });
    }


}

function getInfo() {
    var theosplatform = os.platform();
    var commandffmpeg = config.ffmpegpath + "ffmpeg -version";
    var commandstreamlink = config.streamlinkpath + "streamlink --version";
    var onlyversion = "";
    var regex = /ffmpeg version (\d+\.\d+\.\d+)/
    var returncommand = require('child_process').execSync(commandffmpeg);
    var ffmpegversion = "";
    var streamlinkversion = "";

    try {
        onlyversion = regex.exec(returncommand);
        if (onlyversion.length > 0) {
            ffmpegversion = onlyversion[1];
        } else {
            ffmpegversion = onlyversion[0];
        }

        regex = /streamlink (\d+\.\d+\.\d+)/
        returncommand = require('child_process').execSync(commandstreamlink);
        onlyversion = regex.exec(returncommand);
        if (onlyversion.length > 0) {
            streamlinkversion = onlyversion[1];
        } else {
            streamlinkversion = onlyversion[0];
        }
    } catch (e) {

    }

    info = { pid: process.pid, platform: theosplatform, arch: os.arch(), freemem: os.freemem(), totalmem: os.totalmem(), ostype: os.type(), versions: { ffmpeg: ffmpegversion, streamlink: streamlinkversion, os: os.version() } }

}

function checkVersion(a, b) {
    let x = a.split('.').map(e => parseInt(e));
    let y = b.split('.').map(e => parseInt(e));
    let z = "";

    for (i = 0; i < x.length; i++) {
        if (x[i] === y[i]) {
            z += "e";
        } else
        if (x[i] > y[i]) {
            z += "m";
        } else {
            z += "l";
        }
    }
    if (!z.match(/[l|m]/g)) {
        return 0;
    } else if (z.split('e').join('')[0] == "m") {
        return 1;
    } else {
        return -1;
    }
}

function runStream(req, res, spawn, app, noDisplayErrorInStream = false) {
    var bufcount = 0;
    var stream = undefined;
    var streamerror = undefined;
    var streamstart = false;
    var showErrorInStream = false;
    var streamerrorpid = 0;
    var streamserver = req.query.streamserver;
    var isStreamServer = false;
    var tunnel = new PassThrough();
    var html = "";
    var clientIP = req.ip;
    var streamcheck = undefined;
    var serverdescription = undefined;
    var chnumber = undefined;
    var radio = false;

    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url


    /*
        if (checkToken(req, res) == false) {
            return false;
        };
    */




    var auth = basicAuth(req, res);
    if (auth.authenticated == false || auth.authorized != true) {
        return false;
    }

    if (streamserver != undefined) {
        isStreamServer = true;
        streamserver = encodeURI(streamserver);
        if (req.query.streamdescription != undefined) {
            serverdescription = req.query.streamdescription;
        } else {
            serverdescription = req.query.streamserver;
        }
        chnumber = req.query.chnumber;
        if (req.path.indexOf('audiostream') >= 0) {
            radio = true;
        }

    }

    if (isCallFromBrowser(req) == true && isStreamServer == false) {
        res.status(400).send(`<h2>This endpoint must be inserted in IPTV app</h2><br> 
                              <h2> if you are trying to create a stream server, enter in url on browser</h2> 
                              <h3>http://${os.hostname}:${config.port}${req.path}?url=${url}&streamserver=&lt;streamservernamel&gt;</h3>`)
        return false;
    }

    if (isCallFromBrowser(req) == false && isStreamServer == true) {
        res.statusMessage = "you can only use the streamserver query parameter in browser"
        res.status(400).end()
        return false;
    }

    /*
        if (streamServerExist(streamserver) == true) {
            res.statusMessage = `the stream server ${streamserver} already exists!`;
            res.status(500).send(`<h2> the stream server ${streamserver} already exists!</h2>`);
            return false;
        }
    */
    if ((config.showErrorInStream == true || req.query.showerrorinstream == 'true') && noDisplayErrorInStream == false && isStreamServer == false) {
        showErrorInStream = true;
        log("Show error in stream is enabled");
    }

    /*
    if (isCallFromBrowser(req) == true && isStreamServer == true) {
        res.status(400).send(`<h2>it is no longer possible to create a stremserver directly from the url</h2><br>
                              <p>you need to use the streamserver create wizard:</p> 
                              <p><a href="http://${os.hostname}:${config.port}/streamserver/create">http://${os.hostname}:${config.port}/streamserver/create</a></p>`)
        return false;
    }
*/
    //appsetheader(res);

    announceStreaming(url);
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;

    log(`opening connect to stream in url ${url} from ${clientIP}`);

    stream = spawn;

    if (showErrorInStream == false && isStreamServer == false) {
        stream.stdout.pipe(res);
    }


    stream.stderr.pipe(process.stderr);

    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization

        databuf = { header: [], data: undefined };

        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        if (isStreamServer == false) {
            addprocess(req, stream, auth.user, 0)
        } else {
            addprocess(req, stream, auth.user, "streamserver", streamserver)
        }
        log(`running ${app} app (PID ${stream.pid}) [${spawncommand}]`);
        debug.PID = stream.pid;
        debug.app = app;
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "spawn";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = "On Spawn command";
        debug.statusExec = "Running";



    })
    stream.on('close', (code, signal) => { // on app closed
        log(`close stop of PID ${stream.pid}, code ${code}, signal ${signal}`);
        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = app;
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "close";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On close";
        debug.statusExec = "closed";
        removeStreamServer(stream.pid, streamserver);


    })

    stream.stdout.on('data', (data) => {
        if (streamstart == false && showErrorInStream == true && isStreamServer == false) {
            stream.stdout.pipe(res);

        }

        if (isStreamServer == true) {
            tunnel.write(data);
        }

        setDataSize(stream.pid, data);
        //tunnel.write(data);
        if (isStreamServer == true && streamstart == false) {
            html += `<h1>Stream Server created successfully</h1><br>
            <p></p>
            <p> to play this stream, add the url http://${req.hostname}:${getPortCalled(req)}/play/${streamserver} in your IPTV app</p>
            <p> ex: ffplay http://${req.hostname}:${getPortCalled(req)}/play/${streamserver}</p>
            <p> you can also download a playlist with all stream serves created from <a href="http://${req.hostname}:${getPortCalled(req)}/streamserver/playlist.m3u">http://${req.hostname}:${getPortCalled(req)}/streamserver/playlist.m3u</a>`
            if (isStreamServer == true) {
                var arrstreamserverIndex = arrstreamserver.findIndex(value => value.streamname === streamserver);
                if (arrstreamserverIndex < 0) {
                    arrstreamserver.push({ streamname: streamserver, tunnel: tunnel })
                } else {
                    arrstreamserver[arrstreamserverIndex].tunnel = tunnel;
                }

            }
            res.send(html);
        }
        streamstart = true;

    })

    stream.stderr.on('data', (data) => {
        var stderrmsg = data.toString()
        var msgtodisplay = "";

        var msgsplit = stderrmsg.split('\r\n');
        debug.lastConsoleData.stdErr = data.toString();

        log(data.toString());
        var haserror = stderrmsg.indexOf("error");
        removeStreamServer(stream.pid, streamserver);

        if (showErrorInStream == true && haserror > -1) {
            if (msgsplit.length > 0) {
                // var msgtodisplay = msgsplit[1].substring(7, 30)
            } else {
                // var msgtodisplay = msgsplit[0].substring(7, 30)
            }

            //msgtodisplay = msgtodisplay.replace(/'/g, "");
            //streamerror = displayErrorInStream(msgtodisplay);
            streamerror = displayErrorInStream("error");
            streamerrorpid = streamerror.pid;
            log("start ffmpeg for message error in PID: " + streamerror.pid);
            streamerror.stdout.pipe(res);
        }

        if (isStreamServer == true) {
            html += `<h1>Stream Server creation not successfully</h1><br>
            <p></p>
            <p> Message returned : <b><font color="red">${stderrmsg}</font></b></p>
            `
            res.statusMessage = "Error on creation a stream server";
            res.status(500).send(html);
        }

    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })

    stream.on('exit', (code, signal) => {

        removeprocess(stream.pid);
        debug.PID = stream.pid;
        debug.app = app;
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "exit";
        debug.exitCode = code;
        debug.exitSignal = signal;
        debug.message = "On exit";
        debug.statusExec = "closed";
        removeStreamServer(stream.pid, streamserver);

    })

    stream.on('error', (err) => { // on error on app
        removeprocess(stream.pid);
        log(`error ocurred: ${err}`);
        debug.PID = stream.pid;
        debug.app = app;
        debug.url = url;
        debug.command = spawncommand;
        debug.lastEvent = "error";
        debug.exitCode = "";
        debug.exitSignal = "";
        debug.message = err;
        debug.statusExec = "closed with error";
        debug.lastError = err;
        res.statusMessage = "Error on calling streamlink app => " + err
        if (isStreamServer == true) {
            html += `<h1>Stream Server creation not successfully</h1><br>
            <p></p>
            <p> Message returned : <b><font color="red">${error}</font></b></p>
            `
            res.send(html);
        } else {
            res.status(500).send("<h2>Error on calling streamlink app</h2><br>" + err)
        }

    })

    stream.on('message', (message, sendHandle) => { // on message
        log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        if (isStreamServer == false) {
            log(`closed connection of url ${url}`);
            log(`kill PID ${stream.pid} of program streamlink`)
                //stream.kill();
            killProcesses(stream.pid);
            try {
                killProcesses(streamerror.pid);
            } catch (e) {
                //console.log("error on kill process of ffmpeg display error: " + e.message);
            }
        }
    })
}

function streamServerExist(streamservername) {
    var findstreamservername = arrstreamserver.filter(val => val.servername == streamservername);
    if (findstreamservername.length > 0) {
        return true;
    } else {
        return false;
    }
}

function removeStreamServer(PID, streamname = "") {
    var streamnametofind = streamname;
    if (streamname != "" && streamname != undefined) {
        var processIndex = processes.findIndex(val => val.PID === PID);
        try {
            streamnametofind = processes[processIndex].streamservername
        } catch (e) {
            streamnametofind = "";
        }

    }
    if (streamnametofind != "") {
        arrstreamserver = arrstreamserver.filter(val => val.streamname !== processes[processIndex].streamservername);
        streamserverstatus = streamserverstatus.filter(val => val.streamname !== streamnametofind);
    }

}

function isCallFromBrowser(req) {
    if (req.useragent.isAuthoritative == true) {
        return true;
    } else {
        return false;
    }
}

function checkstream(url) {
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
    return { streamurl: url, streamstatus: status, mensagem: erro };
}

function addStreamServerStatus(req, auth, streamname, UUID) {
    //var theprocess = processes.filter(val => val.isStreamServer == true && val.streamArgs == streamname);
    streamserverstatus.push({ UUID: UUID, streamname: streamname, pid: 0, user: auth.user, client: { ip: req.ip, isMobile: req.useragent.isMobile, isPhone: req.useragent.isPhone, isAndroid: req.useragent.isAndroid, isDesktop: req.useragent.isDesktop, isLinux: req.useragent.isLinux, isWindows: req.useragent.isWindows, isBot: req.useragent.isBot, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, platform: req.useragent.platform, source: req.useragent.source } })

}

function removeStreamServerStatus(UUID) {
    streamserverstatus = streamserverstatus.filter(val => val.UUID != UUID);
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) { //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else { //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getPortCalled(req) {
    const host = req.get('host');
    var [hostname, port] = host.split(':');
    if (port == undefined) {
        if (req.prtocol == 'https') {
            port = 443;
        } else {
            port = 80;
        }
    }
    return port;
}

function checkForSpecialCharacter(text) {
    const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return format.test(text);
}

function commonFrontendFunctionsGet() {
    var data = "";
    data = `
    /* Common functions */
    function displayToast(color,text) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = text;
    x.style.backgroundColor = color;
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }`;
    return data;
}

function startStreamServer(streamname, req) {



    var mystreamserver = {};
    var arrstreamserverlistnew = getStreamServersListData();
    var mystreamserverIndex = arrstreamserverlistnew.findIndex(val => val.streamname === streamname);
    var response = {};
    var userpass = "system:" + systempassword;
    try {
        userpass = Buffer.from(userpass).toString('base64');

        if (mystreamserverIndex < 0) {
            response.status = 404;
            response.statusMessage = "streamserver " + streamname + " not found";
            response.json = { status: "error", message: "streamserver " + streamname + " not found" };
            log("error on trying to start stream server " + streamname + "streamserver " + streamname + " not found")
            return response;
        }

        mystreamserver = arrstreamserverlistnew[mystreamserverIndex]

        if (mystreamserver.status == "running") {
            response.status = 500;
            response.statusMessage = "streamserver " + streamname + " already started";
            response.json = { status: "error", message: "streamserver " + streamname + " already started" };
            log("error on trying to start stream server " + streamname + "streamserver " + streamname + " already started")
            return response;
        }

        if (streamdescription == "") {
            streamdescription = streamname;
        }

        var streammethod = mystreamserver.streammethod;
        var streamdescription = mystreamserver.streamdescription;
        var url = mystreamserver.url;
        var service_provider = mystreamserver.service_provider;
        var videoformat = mystreamserver.videoformat;
        var videocodec = mystreamserver.videocodec;
        var audiocodec = mystreamserver.audiocodec;
        var framesize = mystreamserver.framesize;
        var framerate = mystreamserver.framerate;
        var bitrate = mystreamserver.bitrate;
        var channelnumber = mystreamserver.channelnumber;
        var title = mystreamserver.title;
        var hasError = false;
        var response = { status: 200, json: {} };




        var url = mystreamserver.url;
        var urltocall = "";

        if (streamname == "" || streamname == undefined) {
            //alert('fill stream name field');

            hasError = true;
        } else {

            streamname = "&streamserver=" + streamname
        }

        if (videoformat == "" || videoformat == undefined) {
            videoformat = "";
        } else {
            videoformat = "&videoformat=" + videoformat;
        }
        if (framesize == "" || framesize == undefined) {
            framesize = "";
        } else {
            framesize = "&framesize=" + framesize;
        }

        if (framerate == "" || framerate == undefined) {
            framerate = "";
        } else {
            framerate = "&framerate=" + framerate;
        }

        if (streamdescription == "" || streamdescription == undefined) {
            streamdescription = "";
        } else {
            streamdescription = "&streamdescription=" + encodeURI(streamdescription);
        }

        if (service_provider == "" || service_provider == undefined) {
            service_provider = "";
        } else {
            service_provider = "&serviceprovider=" + service_provider;
        }

        if (bitrate == "" || bitrate == undefined) {
            bitrate = "";
        } else {
            bitrate = "&bitrate=" + bitrate;
        }

        /*
    if (channelnumber == "" || channelnumber == undefined) {
        channelnumber = "";

    } else {
        channelnumber = "&chnumber=" + channelnumber;
    }
*/
        if (videocodec == "" || videocodec == undefined) {
            videocodec = "";

        } else {
            videocodec = "&videocodec=" + videocodec;
        }

        if (audiocodec == "" || audiocodec == undefined) {
            audiocodec = "";
        } else {
            audiocodec = "&audiocodec=" + audiocodec;
        }

        if (title == "" || title == undefined) {
            title = "";
        } else {
            title = "&title=" + title;
        }

        if (url == "" || url == undefined) {
            //alert('fill stream name field');

            hasError = true;
        }

        if (hasError == true) {
            response.status = 500;
            response.json = { status: "error", message: "server error on start streamserver " + streamname };
            return response;
        }


        if (streammethod != "/videostream/ffmpeg" && streammethod != "/videostream/play") {
            videoformat = "";
            service_provider = "";

            videocodec = "";
            audiocodec = "";
        }

        if (streammethod != "/videostream/ffmpeg" && streammethod != "/videostream/play" && streammethod != "/videostream/streamlink") {
            channelnumber = "";
        }
        if (streammethod != "/audiostream/play") {
            title = "";
        }



        urltocall = "http://localhost:" + config.port + streammethod + "?url=" + url + streamname + videoformat + streamdescription + service_provider + videocodec + framesize + framerate + audiocodec + title + bitrate;

        const http = require("http");
        var options = {};
        /*
            if (req.headers.authorization != undefined) {
                options = {
                    port: config.port,
                    path: streammethod + "?url=" + url + streamname + videoformat + streamdescription + service_provider + videocodec + framesize + framerate + audiocodec + title,
                    headers: { authorization: req.headers.authorization }
                }
            } else {
                options = {
                    port: config.port,
                    path: streammethod + "?url=" + url + streamname + videoformat + streamdescription + service_provider + videocodec + framesize + framerate + audiocodec + title

                }
            }
        */

        options = {
            port: config.port,
            path: streammethod + "?url=" + url + streamname + videoformat + streamdescription + service_provider + videocodec + framesize + framerate + audiocodec + title,
            headers: { systemAuthorization: userpass }
        }

        http.get(options, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;

            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {



            });

        }).on("error", (err) => {
            log("Error on call start streanserver " + streamname + ": " + err.message);


        });
        log("stream server " + streamname + " has started");
        response.status = 200;
        response.json = { status: "ok", message: "process executed asynchronous" };
        return response;
    } catch (e) {
        log("Error on call start streanserver " + streamname + ": " + e.message);
        console.log("internal error: " + e.message);
        response.json = { status: "internalerror", message: e.message };
    }

}

function getStreamServerConnectionCount(streamname) {
    var count = 0;
    var streamserverstatusfilter = streamserverstatus.filter(value => value.streamname === streamname);
    return streamserverstatusfilter.length;
}
function getStreamServersListData() {
    var arrstreamserverlistnew = [];
    var processIndex = 0;
    var processSingle = {};
    var streamserverSingle = {};
    var datasize = 0;
    var catsize = "";
    arrstreamserverlist.forEach(data => {
        //var streamserverstatusfilter = streamserverstatus.filter(value => value.streamname === data.streamname);
        streamserverSingle.users = 0
        processIndex = processes.findIndex(val => val.streamservername === data.streamname);
        streamserverSingle = data;
        if (processIndex >= 0) {

            streamserverSingle.status = "running";
            streamserverSingle.PID = processes[processIndex].PID;

            datasize = processes[processIndex].dataSize;
            catsize = 'KB';
            if (datasize > 1024) {
                datasize = datasize / 1024;
                catsize = 'MB';
            }
            if (datasize > 1024) {
                datasize = datasize / 1024;
                catsize = 'GB';
            }
            datasize = datasize.toFixed(3);
            streamserverSingle.dataTransfered = datasize + " " + catsize;
        } else {
            streamserverSingle.status = "stopped";
            streamserverSingle.PID = undefined;
            streamserverSingle.dataTransfered = "0 bytes"
        }
        //streamserverSingle.connections = streamserverstatusfilter.length;
        streamserverSingle.connections = getStreamServerConnectionCount(data.streamname);
        arrstreamserverlistnew.push(streamserverSingle);
    })
    return arrstreamserverlistnew;
}

function getStreamServerListSingle(streamname) {
    var arrstreamserverlistnew = getStreamServersListData();
    var arrstreamserverlistnewIndex = arrstreamserverlistnew.findIndex(val => val.streamname === streamname);
    if (arrstreamserverlistnewIndex >= 0) {
        return arrstreamserverlistnew[arrstreamserverlistnewIndex];
    } else {
        return {};
    }
}

function stopStreamServer(streamservername) {
    var streamserverlistnew = getStreamServerListSingle(streamservername);
    var timestamp1 = Date.now();
    var diff = 0;
    if (streamserverlistnew.PID != undefined) {
        try {
            killProcesses(streamserverlistnew.PID);
            log("stream server " + streamservername + " stopped");

            return { status: "stopped", message: "process (PID) " + streamserverlistnew.PID + " and your childs has killed" }

        } catch (e) {
            log(" error on trying to stop stream server " + streamservername + " " + e.message);
            return { status: "not stopped", message: e.message };
        }

    } else {
        log(" error on trying to stop stream server " + streamservername + " stream server not found");
        return { status: "not stopped", message: "stream server " + streamservername + " not found" };
    }
}

function mountStreamServerAdminPage(req, res, method = "POST", actualdata) {
    var html = "";



    if (actualdata == undefined) {
        actualdata = { streamname: "", streamdescription: "", streamdescription: "", channelnumber: "", logourl: "", streammethod: "/videostream/streamlink", streamprovider: "", videoformat: "", videocodec: "", framesize: "", framerate: "", audiocodec: "", title: "", url: "", bitrate: "2000k" }

    }

    var pagedata = {
        methods: [
            { name: "Videostream (streamlink)", value: "/videostream/streamlink" },
            { name: "Videostream (ffmpeg)", value: "/videostream/ffmpeg" },
            { name: "Videostream (streamlink+ffmpeg)", value: "/videostream/play", linuxonly: true },
            { name: "convert videostream to audiostream", value: "/audiostream/play" }
        ],
        mainfields: {
            streamname: actualdata.streamname,
            streamdescription: actualdata.streamdescription,
            channelnumber: actualdata.channelnumber,
            logourl: actualdata.logourl,
            url: actualdata.url,
            methoddefault: actualdata.streammethod
        },
        blocks: [{
                name: "ffmpeg",
                validfor: ['/videostream/ffmpeg', '/videostream/play'],
                fields: [
                    { name: "streamprovider", description: "Provider", required: false, type: "String", default: actualdata.streamprovider },
                    { name: "videoformat", description: "Video format", required: false, type: "string", default: actualdata.videoformat },
                    { name: "videocodec", description: "Video codec", required: false, type: "string", default: actualdata.videocodec },
                    { name: "framesize", description: "Frame size", required: false, type: "choice", default: actualdata.framesize, values: [{ description: "Auto (copy from original video)", value: "" }, { description: "320x240", value: "320x240" }, { description: "480p", value: "720x480" }, { description: "720p", value: "1280x720" }, { description: "1080p", value: "1920x1080" }, { description: "1440p", value: "2560x1440" }, { description: "4K", value: "3840x2160" }, { description: "8K", value: "7680x4320" }, { description: "16K", value: "15360x8640" }] },
                    { name: "framerate", description: "Frame rate", required: false, type: "choice", default: actualdata.framerate, values: [{ description: "Auto (copy from original video)", value: "" }, { description: "10fps", value: "10" }, { description: "15fps", value: "15" }, { description: "24fps", value: "24" }, { description: "25fps", value: "25" }, { description: "29.97fps", value: "29.97" }, { description: "30fps", value: "30" }, { description: "59.97fps", value: "59.97" }, { description: "60fps", value: "60" }] },
                    { name: "bitrate", description: "Bitrate", required: false, type: "string", default: actualdata.bitrate },
                    { name: "audiocodec", description: "Audio codec", required: false, type: "string", default: actualdata.audiocodec },

                ]
            },
            {
                name: "Audiostream",
                validfor: ['/audiostream/play'],
                fields: [
                    { name: "title", description: "Title", required: false, type: "string", default: actualdata.title }
                ]
            }
        ]
    };


    // main header
    html += `<html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    `
    if (method == "POST") {
        html += `<title>Create a Stream server</title>
        `
    } else if (method == "PUT") {
        html += `<title>Edit stream Server ${actualdata.streamname}</title>
        `
    }
    html += `
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">`;

    //styles
    html += `<style>
    
    
    
    .label {
      position: absolute;
        /*left: 42%; */
       
    }
    
    .secondaryinput {
      position: absolute;
      /*  left: 42%; */
       width: 800px;
       height: 30px;
       border-radius: 5px;
       
       
    }
    
    
    #main {
      width: 100%;
    }
    
    #forms {
      position: relative;
      top: 30px;
      width:800px;
      margin: auto;
      
    }
    
    
    `
    pagedata.blocks.forEach(data => {
        html += `#for_${data.name}{
            display: none;
        }

    `
    });
    html += `
    #logdiv {
        position: relative;
        border:  1px solid black;
        width: 1300px;
        height: 500px;
        margin: auto;
        top: 200px;
      }

    #maintainserverbutton {
                   /* transform: translatex(1180px) translatey(352px);*/
                   /* min-height: 35px; */
                     position: relative;
                     width: 186px;
                     
                     
                                 text-decoration: none;
                                 border: none;
                                 padding: 12px 40px;
                                 font-size: 16px;
                                 background-color: blue;
                                 color: #fff;
                                 border-radius: 5px;
                                 box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                                 cursor: pointer;
                                 outline: none;
                                 transition: 0.2s all;
                             }
                 
                             #maintainserverbutton:active {
                                 transform: scale(0.98);
                                 
                                 box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                 
                             } 
                             #maintainserverbutton:disabled {
                                background-color: gray;
                             }  


    #resetbutton {
                    /* transform: translatex(1180px) translatey(352px);*/
                    /* min-height: 35px; */
                        position: relative;
                        width: 186px;
                                  
                                  
                        text-decoration: none;
                        border: none;
                        padding: 12px 40px;
                        font-size: 16px;
                        background-color: red;
                        color: #fff;
                        border-radius: 5px;
                        box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                        cursor: pointer;
                        outline: none;
                        transition: 0.2s all;
                        }
                              
                        #resetbutton:active {
                            transform: scale(0.98);
                                              
                            box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                              
                            } 
                        #resetbutton:disabled {
                            background-color: gray;
                            }  
                             
    </style>`
        /* Scripts */
    html += `<script>
    ${commonFrontendFunctionsGet()}
    function start(){
        document.getElementById("streammethod").value = "${pagedata.mainfields.methoddefault}";
        `
    pagedata.blocks.forEach(block => {
        block.fields.filter(fieldfilter => fieldfilter.type === "choice").forEach(field => {
            html += `document.getElementById("${block.name}_${field.name}").value = "${field.default}";
        `
        });
    });
    html += `    enabledisablefields();
    }
    function maintainserver(){
       
        var streamname = document.getElementById("streamname").value;
        var streammethod = document.getElementById("streammethod").value;
        var streamdescription = document.getElementById("streamdescription").value;
        var channelnumber = document.getElementById("channelnumber").value;
        var logourl = document.getElementById("logourl").value;
        var url = document.getElementById("url").value;
        `
    pagedata.blocks.forEach(block => {
        block.fields.forEach(field => {
            html += `var ${field.name} = document.getElementById("${block.name}_${field.name}").value;
                `
        })
    })
    html += `
        var hasError = false;
        var streamserverdata = {"streamname": "", "streammethod": "", "streamdescription": "", "channelnumber":"","url": ""`
    pagedata.blocks.forEach(block => {
        block.fields.forEach(field => {
            html += `,"${field.name}": ""`
        })
    })
    html += `};
        
    
        document.getElementById("streamname").style.borderColor = "black";
          document.getElementById("streamdescription").style.borderColor = "black";
          document.getElementById("url").style.borderColor = "black";
          document.getElementById("channelnumber").style.borderColor = "black";
    
        if(streamdescription == ""){
          streamdescription = streamname;
        }
    
        if(checkForSpecialCharacter(streamdescription) == true){
          alert("don't use special character in service description");
          document.getElementById("streamdescription").style.borderColor = "red"
          return false;
        }
    
        if(checkForSpecialCharacter(streamname) == true){
          alert("don't use special character in service name");
          document.getElementById("streamname").style.borderColor = "red"
          return false;
        }
    
        if(onlyNumbers(channelnumber) == false && channelnumber != ""){
          alert('in channel number field, use only numbers');
          document.getElementById("channelnumber").style.borderColor = "red";
          return false;
        }
    
        var url = document.getElementById("url").value;
        var urltocall = "";
        
        if(streamname == "" || streamname == undefined){
          //alert('fill stream name field');
          document.getElementById("streamname").style.borderColor = "red"
          hasError = true;
        } else {
        
          //streamname = "&streamserver="+streamname
          streamserverdata.streamname = streamname;
        }

        if(streamdescription == "" || streamdescription == undefined){
            streamserverdata.streamdescription = "" ;
        } else {
            streamserverdata.streamdescription = streamdescription ;
        }

        if(logourl == "" || logourl == undefined){
            streamserverdata.logourl = "" ;
        } else {
            streamserverdata.logourl = logourl;
        }

        if(channelnumber == "" || channelnumber == undefined){
            streamserverdata.channelnumber = "" ;
          
        } else {
            streamserverdata.channelnumber = channelnumber ;
        }

        if(url == "" || url == undefined){
            //alert('fill stream name field');
            document.getElementById("url").style.borderColor = "red"
            hasError = true;
          }
      
          if(hasError == true){
            alert('fill all required fields in red');
            return false;
          } 
    `
    pagedata.blocks.forEach(block => {
        block.fields.forEach(field => {
            if (field.required == false) {
                html += `streamserverdata.${field.name} = ${field.name};
                `
            } else {
                html += `if(${field.name} == "" || ${field.name} == undefined){
                    
                    document.getElementById("${field.name}").style.borderColor = "red"
                    hasError = true;
                  } else {
                  
                    
                    streamserverdata.${field.name} = ${field.name};
                  }`
            }

        })
    })

    pagedata.blocks.forEach(block => {
        var ifargs = "";

        block.validfor.forEach(validfor => {
            ifargs += `&& streammethod != "${validfor}" `
        })
        ifargs = ifargs.substring(3);
        html += `if(${ifargs}){
            `
        block.fields.forEach(field => {
            html += `${field.name} = "";
            `
        })
        html += `}
        `
    })


    html += `
    streamserverdata.streamdescription = streamdescription;
    streamserverdata.url = url;
    streamserverdata.streammethod = streammethod;
    urltocall = streammethod + "?url=" + url + streamname +  streamdescription + channelnumber `
    pagedata.blocks.forEach(block => {
        block.fields.forEach(field => {
            html += `+ ${field.name}`
        })
    })
    html += `;
    


    //alert("teste")
    //window.location.href = urltocall;
    //document.getElementById("logdiv").innerHTML = "processing....";
    document.getElementById("maintainserverbutton").disabled = true;

    fetch("/api/streamserver", {
        method: "${method}",
        headers: {
            'Accept': 'application/json',
            
            `
    if (req.headers.authorization != undefined) {
        html += `'Content-Type': 'application/json',
                     'Authorization': '${req.headers.authorization}'
            `
    } else {
        html += `'Content-Type': 'application/json'
       `
    }
    html += `
            
        },
        body: JSON.stringify(streamserverdata)
    }).then(
        response => {

            if (response.status != 200) {
                displayToast("red","Error "+response.status+" "+response.statusText);
            }
            return response.text();
        }).then(
        data => {
            var response = JSON.parse(data);
            document.getElementById("maintainserverbutton").disabled = false;
            `

    if (method == "POST") {
        html += `if (response.streamadded == true) {
                //document.getElementById("logdiv").innerHTML = "<h2>stream server has added in list<h2>"
                displayToast("green","stream server has added in list");
                `
    } else {
        html += `if (response.streamchanged == true) {
                //document.getElementById("logdiv").innerHTML = "<h2>stream server has change<h2>";
                displayToast("green","stream server has changed");
                `
    }
    html += `
                //alert("stream server has added in list");
                resetData();
     
                enabledisablefields()
                `

    if (req.headers.referer != undefined) {
        if (req.headers.referer.indexOf('/streamserver/list') > -1) {
            html += `window.location.assign("${req.headers.referer}");
        `;
        }
    }
    html += `
                
           
            } else {
                document.getElementById("logdiv").innerHTML = "<h2>Error on execute: " + response.message + "<h2>";

            }
        });`
        //location.replace(urltocall)
    html += `
}
`

    html += `
    function enabledisablefields() {
        var streammethod = document.getElementById("streammethod").value;
`
    pagedata.blocks.forEach(block => {
        var ifargs = "";
        block.validfor.forEach(validfor => {
            ifargs += `|| streammethod == "${validfor}" `
        })
        ifargs = ifargs.substring(3);
        html += `if(${ifargs}){
        document.getElementById("for_${block.name}").style.display = 'block';
    } else {
        document.getElementById("for_${block.name}").style.display = 'none';
    }
    `

    })


    html += `
    }

    function checkForSpecialCharacter(text) {
        //  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // removed because javascript error
        // return format.test(text);
        //return false;
    }

    function onlyNumbers(str) {
        return /^[0-9]+$/.test(str);
    }

    function resetData(){
        document.getElementById("streamname").value = "${pagedata.mainfields.streamname}";
        document.getElementById("streamdescription").value = "${pagedata.mainfields.streamdescription}";
        document.getElementById("url").value = "${pagedata.mainfields.url}";
        document.getElementById("streammethod").value = "${pagedata.methods[0].value}";
        document.getElementById("channelnumber").value = "${pagedata.mainfields.channelnumber}";
        `
    pagedata.blocks.forEach(block => {
        block.fields.forEach(field => {
            html += `document.getElementById("${block.name}_${field.name}").value = "${field.default}";
        `
        })
    })

    html += `}
    </script>
    </head>
    <body onload="start()">
      ${CreateMenu(basicAuth(req, res))}
      <div id="main">`
    if (method == "POST") {
        html += `
        <center><h1>Create a Stream server</h1></center>
        <h2><center>use this page to create a streamserver and serve it to multiple users (only one thread per stream server is created)<center></h2>`
    } else if (method == "PUT") {
        html += `
        <center><h1>Edit stream Server ${actualdata.streamname}</h1></center>
        <h2><center><center></h2>`
    }


    html += `
      <div id="forms">
      <!-- streamname -->
            <div id="streamnamediv" > 
          <label  for="streamname" class="label" id="teste">Streaming Name:</label><br>
          `
    if (method == "POST") {
        html += `<input id="streamname" name="streamname" class="secondaryinput" size="50" value=""/><br /><br /><br /> 
           `
    } else if (method == "PUT") {
        html += `<input id="streamname" name="streamname" class="secondaryinput" size="50" value="${pagedata.mainfields.streamname}" disabled = "true"/><br /><br /><br /> 
            `
    }
    html += `
        </div>
      <!-- stream description-->
          <div id="streamdescriptiondiv" >
             <label class="label">Stream Description (optional):</label> <br>
          <input id="streamdescription" name="streamdescription" class="secondaryinput" size="50" value="${pagedata.mainfields.streamdescription}"/><br /><br /><br />
        </div>
        
                   
                     <!-- stream methods -->
                     <div id="streammethoddiv" >
                     <label  class="label">Streaming Method:</label> <br>
                     <select id="streammethod" name="streammethod" class="secondaryinput" onchange = "enabledisablefields()" value="${pagedata.mainfields.methoddefault}">`;
    pagedata.methods.forEach(data => {
        if (data.linuxonly != true || os.platform == "linux") {
            html += `<option value="${data.value}">${data.name}</option>\n`;
        }
    })

    html += `</select><br /><br />   <br>
                </div>`

    pagedata.blocks.forEach(block => {
        html += `<!-- Block ${block.name} -->
        `;
        html += `<div id="for_${block.name}">
        `
        block.fields.forEach(field => {
            var labeldescription = "";
            labeldescription += `${field.description}`;
            if (field.required == false) {
                labeldescription += `(optional)`;
            }
            labeldescription += `:`;
            html += `<!-- ${block.name}:${field.description} -->
          <div id="${block.name}_${field.name}div">
          <label class="label">${labeldescription}</label><br>
          `;
            if (field.type != "choice") {
                html += `<input id="${block.name}_${field.name}" name="${block.name}_${field.name}" class="secondaryinput" size="50" value="${field.default || ""}"/><br /><br /><br />
                `
            } else {
                html += `<select id="${block.name}_${field.name}" name="${block.name}_${field.name}" class="secondaryinput" value="${field.default}">
            `
                field.values.forEach(value => {
                    html += `<option value="${value.value}">${value.description}</option>
             `
                });
                html += `</select><br /><br />   <br>
                `;
            }
            html += `</div>
            
            `;
        });
        html += `</div>
        
        `;

    })
    html += `
    <div id="channelnumberdiv">
    <label class="label">Channel Number (optional):</label> <br>
 <input id="channelnumber" name="channelnumber" class="secondaryinput" size="50" value="${pagedata.mainfields.channelnumber}"/><br /><br /><br />
 <label class="label">LogoUrl (optional):</label> <br>
 <input id="logourl" name="logourl" class="secondaryinput" size="50" value="${pagedata.mainfields.logourl}"/><br /><br /><br />
</div>

    <!-- url --> 
    <div id="urldiv"> 
      <label  class="label">Url:</label><br>
     <input id="url" name="url" size="50" id="urllabel" placeholder="URL to stream" class="secondaryinput" value="${pagedata.mainfields.url}"/><br /><br><br />
     <center>
     <button onclick="maintainserver()" id="maintainserverbutton" >Save</button>
     <button onclick="resetData()" id="resetbutton" >Reset</button>
     </center>
   </div>
   </div>
   <div id="snackbar"></div>
     </div>  `
    html += `               
                         </body>
                         </html>`;

    res.send(html);
}


function mountUserAdminPage(req, res, method = "POST", actualdata) {
    // main header
    var html = "";

    if (actualdata == undefined) {
        actualdata = { username: "", fullname: "", password: "", authorizations: {} }
        authroles.forEach(role => {
            actualdata.authorizations[role.name] = false;
        });

    }

    html += `<html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/toast.css">`;

    //styles
    html += `<style>
    
    
    
    .label {
      position: absolute;
        /*left: 42%; */
       
    }
    
    .secondaryinput {
      position: absolute;
      /*  left: 42%; */
       width: 800px;
       height: 30px;
       border-radius: 5px;
       
       
    }
    
    
    #main {
      width: 100%;
    }
    
    #forms {
      position: relative;
      top: 30px;
      width:800px;
      margin: auto;
      
    }
    
    
   
    #logdiv {
        position: relative;
        border:  1px solid black;
        width: 1300px;
        height: 500px;
        margin: auto;
        top: 200px;
      }

    #maintainuserbutton {
                   /* transform: translatex(1180px) translatey(352px);*/
                   /* min-height: 35px; */
                     position: relative;
                     width: 186px;
                     
                     
                                 text-decoration: none;
                                 border: none;
                                 padding: 12px 40px;
                                 font-size: 16px;
                                 background-color: blue;
                                 color: #fff;
                                 border-radius: 5px;
                                 box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                                 cursor: pointer;
                                 outline: none;
                                 transition: 0.2s all;
                             }
                 
                             #maintainuserbutton:active {
                                 transform: scale(0.98);
                                 
                                 box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                 
                             } 
                             #maintainuserbutton:disabled {
                                background-color: gray;
                             }  


    #resetbutton {
                    /* transform: translatex(1180px) translatey(352px);*/
                    /* min-height: 35px; */
                        position: relative;
                        width: 186px;
                                  
                                  
                        text-decoration: none;
                        border: none;
                        padding: 12px 40px;
                        font-size: 16px;
                        background-color: red;
                        color: #fff;
                        border-radius: 5px;
                        box-shadow: 7px 6px 28px 1px rgba(0, 0, 0, 0.24);
                        cursor: pointer;
                        outline: none;
                        transition: 0.2s all;
                        }
                              
                        #resetbutton:active {
                            transform: scale(0.98);
                                              
                            box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                              
                            } 
                        #resetbutton:disabled {
                            background-color: gray;
                            }  
                             
    </style>`
        /* Scripts */
    html += `<script>
    ${commonFrontendFunctionsGet()}
    
    function maintainuser(){
       var user = {username: "",  password: undefined, fullname: "", authorizations: {}};
       
       user.username = document.getElementById("username").value;
       user.fullname = document.getElementById("fullname").value;
    `
    if (method == "POST") {
        html += `user.password = document.getElementById("password").value;
        `
    }
    authroles.forEach(role => {
        html += `user.authorizations.${role.name} = document.getElementById("authrole_${role.name}").checked;
        `
    })
    html += `
    //document.getElementById("logdiv").innerHTML = "processing....";
    document.getElementById("maintainuserbutton").disabled = true;

    fetch("/api/users", {
        method: "${method}",
        headers: {
            'Accept': 'application/json', 
            `
    if (req.headers.authorization != undefined) {
        html += `'Content-Type': 'application/json',
            'Authorization': '${req.headers.authorization}'
             `
    } else {
        html += `'Content-Type': 'application/json'
                 `
    }
    html += `
        },
        body: JSON.stringify(user)
    }).then(
        response => {

            if (response.status != 200) {
                displayToast("red","Error "+response.status+" "+response.statusText);
                document.getElementById("maintainuserbutton").disabled = false;
            }
            return response.text();
        }).then(
        data => {
            var response = JSON.parse(data);
            document.getElementById("maintainuserbutton").disabled = false;
            `

    if (method == "POST") {
        html += `if (response.useradded == true) {
                //document.getElementById("logdiv").innerHTML = "<h2>user created<h2>"
                displayToast("green","user created");
                `
    } else {
        html += `if (response.userchanged == true) {
                //document.getElementById("logdiv").innerHTML = "<h2>user changed<h2>";
                displayToast("green","user changed");
                `
    }
    html += `
                //alert("stream server has added in list");
               
                `

    if (req.headers.referer != undefined) {
        if (req.headers.referer.indexOf('/user/list') > -1) {
            html += `window.location.assign("${req.headers.referer}");
        `;
        }
    } else {
        html += `resetData();
     
        enabledisablefields()
        `
    }
    html += `
    
           
            } else {
                displayToast("red","Error on execute: " + response.message);
                

            }
        });
}

    function enabledisablefields() {
        

    }

    function checkForSpecialCharacter(text) {
        //  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // removed because javascript error
        // return format.test(text);
        //return false;
    }

    function onlyNumbers(str) {
        return /^[0-9]+$/.test(str);
    }

    function resetData(){
        document.getElementById("username").value = "${actualdata.username}";
        document.getElementById("fullname").value = "${actualdata.fullname}";`
    if (method == "POST") {
        html += `document.getElementById("password").value = "";
        `
    }

    authroles.forEach(role => {
        html += `document.getElementById("authrole_${role.name}").checked = ${actualdata.authorizations[role.name]}
        `
    })
    html += `
        }
    </script>
    </head>
    <body>
      ${CreateMenu(basicAuth(req, res))}
      <div id="main">`
    if (method == "POST") {
        html += `
        <center><h1>Create User</h1></center>
        <h2><center>use this page to create a new user<center></h2>`
    } else if (method == "PUT") {
        html += `
        <center><h1>Edit user ${actualdata.username}</h1></center>
        <h2><center><center></h2>`
    }


    html += `
      <div id="forms">
      <!-- streamname -->
            <div id="userdiv" > 
          <label  for="username" class="label" id="teste">Username:</label><br>
          `
    if (method == "POST") {
        html += `<input id="username" name="username" class="secondaryinput" size="50" value=""/><br /><br /><br /> 
           `
    } else if (method == "PUT") {
        html += `<input id="username" name="username" class="secondaryinput" size="50" value="${actualdata.username}" disabled = "true"/><br /><br /><br /> 
            `
    }
    html += `
        </div>
      <!-- Full Name-->
          <div id="fullnamediv" >
             <label class="label">Full Name:</label> <br>
          <input id="fullname" name="fullname" class="secondaryinput" size="50" value="${actualdata.fullname}"/><br /><br /><br />
        </div>
        `
    if (method == "POST") {
        html += `
        <!-- password-->
          <div id="passworddiv" >
             <label class="label">Password:</label> <br>
          <input type="password" id="password" name="password" class="secondaryinput" size="50" value="${actualdata.password}"/><br /><br /><br />
        </div>
        `
    }
    html += `
                   <div id="rolesdiv">
                   <fieldset>
                    <legend> Authorization Roles </legend>
                    `
    authroles.forEach(role => {
        html += `<div>
                        `
        if (actualdata.authorizations[role.name] == true) {
            html += `<input type="checkbox" id="authrole_${role.name}" name="${role.name}" checked>
                         `
        } else {
            html += `<input type="checkbox" id="authrole_${role.name}" name="${role.name}" >
                            `
        }
        html += `<label for="authrole_${role.name}">${role.description}</label>
                        </div>
                        `
    })
    html += `</fieldset>
                    </div>

                    
     <center>
     <button onclick="maintainuser()" id="maintainuserbutton" >Save</button>
     <button onclick="resetData()" id="resetbutton" >Reset</button>
     </center>
   </div>
   </div>
   <div id="snackbar"></div>
     </div>  `
    html += `               
                         </body>
                         </html>`;

    res.send(html);
}

function startAllStreamServers(req) {
    var arrstreamserverlistnew = getStreamServersListData();
    var arrstreamserverlistnewFilter = arrstreamserverlistnew.filter(val => val.status != "running");
    arrstreamserverlistnewFilter.forEach(val => {
        startStreamServer(val.streamname, req);
    })
}

function stopAllStreamServers() {
    var arrstreamserverlistnew = getStreamServersListData();
    var arrstreamserverlistnewFilter = arrstreamserverlistnew.filter(val => val.status != "stopped");
    arrstreamserverlistnewFilter.forEach(val => {
        stopStreamServer(val.streamname);
    })
}

function loadStreamServers() {

    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync(datadirectory + "streamproxy.streamservers.json");
        arrstreamserverlist = JSON.parse(jsonString);
        //startAllStreamServers();
    } catch (err) {


        saveStreamServers();


    }
}

function saveStreamServers() {
    const fswrite = require("fs");
    try {
        var arrstreamserverliststr = JSON.stringify(arrstreamserverlist);

        fswrite.writeFileSync(datadirectory + "streamproxy.streamservers.json", arrstreamserverliststr);
    } catch (err) {

    }
}

function checkAuthorization(req, user) {
    var userIndex = users.findIndex(val => val.username === user);
    var user = users[userIndex];
    var isAuthorized = false;
    var rolesForThisEndpoint = [];
    var endpointnow = [];
    var endpointsfilter = [];
    endpointnow.push(req.path);


    var path = req.path;

    authroles.forEach(role => {
        /*
        if (role.authorizations.findIndex(authorization => authorization.endpoint === path && authorization.method === req.method) > -1) {
            rolesForThisEndpoint.push(role.name);
        }
        */
        role.authorizations.forEach(authorization => {
            endpointsfilter = endpointnow.filter(x => wildTest(authorization.endpoint, x));
            authorization.methods.forEach(method => {
                if (endpointsfilter.length > 0 && method == req.method) {
                    if (rolesForThisEndpoint.findIndex(y => y === role.name) < 0) {
                        rolesForThisEndpoint.push(role.name);
                    }
                }
            })

        })


    })

    for (var key in user.authorizations) {
        if (user.authorizations[key] == true && rolesForThisEndpoint.findIndex(role => role === key) > -1) {
            isAuthorized = true;
            return true;
        }
    }

    return isAuthorized;

}


function randPass(lettersLength, numbersLength) {
    var j, x, i;
    var result = '';
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var numbers = '0123456789';
    for (i = 0; i < lettersLength; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (i = 0; i < numbersLength; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    result = result.split("");
    for (i = result.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = result[i];
        result[i] = result[j];
        result[j] = x;
    }
    result = result.join("");
    return result
}

function wildTest(wildcard, str) {
    let w = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape 
    const re = new RegExp(`^${w.replace(/\*/g,'.*').replace(/\?/g,'.')}$`, 'i');
    return re.test(str); // remove last 'i' above to have case sensitive
}

function sha1(txt) {
    return createHash('sha1') // <-- You can use other than sha1
        .update(txt) //set what to encode
        .digest('hex') //basically another way to encode. hex is base16 so for example doing .digest('base64') encodes 4x more effenciently
}


function getUsersList() {
    return users;
}

function getRolesList() {
    return authroles;
}

function restartProgram() {
    var child_process = require('child_process');

    process.on('SIGINT', function() {
        console.log('restarting...');
        child_process.fork(__filename); // TODO: pass args...
        process.exit(0);
    });

    console.log('Running as %d', process.pid);

    setTimeout(function() {}, 1000000); // just some code to keep the process running
}


function loadUsers() {

    var isMigrated = false;
    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync(datadirectory + "streamproxy.users.json");
        users = JSON.parse(jsonString);

    } catch (err) {



        users = [
            { "username": "anonymous", "password": "", "fullname": "Anonymous", "authorizations": { "basic": true, streamserverWatchers: true } },
            { "username": "admin", "password": "d033e22ae348aeb5660fc2140aec35850c4da997", "fullname": "Administrator", "authorizations": { "administrator": true } }
        ]
        if (config.basicAuthentication != undefined) {
            try {
                config.basicAuthentication.users.forEach(user => {
                    users.push({ username: user.username, fullname: "", password: sha1(user.password), authorizations: { administrator: true } });
                    isMigrated = true;
                });
            } catch (e) {
                console.log("error: " + e.message);
            }
        }

        if (isMigrated == true) {
            config.basicAuthentication = undefined;
            const fswrite = require("fs");
            try {
                var configstr = JSON.stringify(config);

                fswrite.writeFileSync(datadirectory + "streamproxy.config.json", configstr);
            } catch (err) {

            }
        }

        const fswriteuser = require("fs");
        try {
            var usersstr = JSON.stringify(users);

            fswriteuser.writeFileSync(datadirectory + "streamproxy.users.json", usersstr);
        } catch (err) {

        }


    }


}

function saveUsers() {
    const fswriteuser = require("fs");
    try {
        var usersstr = JSON.stringify(users);

        fswriteuser.writeFileSync(datadirectory + "streamproxy.users.json", usersstr);
    } catch (err) {

    }
}

function loadAuthRoles() {

    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync(datadirectory + "streamproxy.authroles.json");
        authroles = JSON.parse(jsonString);
    } catch (err) {

        authroles = [{
                "name": "basic",
                "description": "Basic Authorization",
                "authorizations": [
                    { "endpoint": "/", "methods": ["GET"] },
                    { "endpoint": "/about", "methods": ["GET"] }
                ]
            },
            {
                "name": "basicWatchers",
                "description": "Basic Watches",
                "authorizations": [
                    { "endpoint": "/videostream/*", "methods": ["GET"] },
                    { "endpoint": "/audiostream/play", "methods": ["GET"] }
                ]
            },
            {
                "name": "podcastsubscriber",
                "description": "podcast subscriber",
                "authorizations": [
                    { "endpoint": "/youtubetopodcast/*", "methods": ["GET"] }
                ]
            },
            {
                "name": "streamserverWatchersbasic",
                "description": "Stream Server Watchers Basic (without playlist Download)",
                "authorizations": [
                    { "endpoint": "/play/*", "methods": ["GET"] }
                ]
            },
            {
                "name": "playlistdownloader",
                "description": "Playlist Downloader",
                "authorizations": [
                    { "endpoint": "/streamserver/playlist.m3u", "methods": ["GET"] }
                ]
            },
            {
                "name": "streamserverWatchersfull",
                "description": "Stream Server Watchers Full (with playlist Download)",
                "authorizations": [
                    { "endpoint": "/play/*", "methods": ["GET"] },
                    { "endpoint": "/streamserver/playlist.m3u", "methods": ["GET"] }
                ]
            },
            {
                "name": "administrator",
                "description": "Administrator",
                "authorizations": [
                    { "endpoint": "*", "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"] }
                ]
            }
        ]

        const fswriteauthroles = require("fs");
        try {
            var authrolesstr = JSON.stringify(authroles);

            fswriteauthroles.writeFileSync(datadirectory + "streamproxy.authroles.json", authrolesstr);
        } catch (err) {
            console.log("err: " + err.message);
        }

    }

}

function CreateMenu(auth) {
    var isAuthenticated = auth.authenticated == true && auth.user != 'anonymous';

    var SVG_HOME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
    var SVG_SERVERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>';
    var SVG_USERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    var SVG_STATUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>';
    var SVG_LOG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
    var SVG_API = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    var SVG_SETTINGS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    var SVG_ABOUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    var html = `<script>
(function(){
  var SP_TRANS = {
    pt: {
      "nav.home":"Home","nav.servers":"Stream Servers","nav.users":"Usuários","nav.status":"Status","nav.logs":"Logs","nav.api":"API Docs","nav.settings":"Configurações","nav.about":"Sobre","nav.logout":"Sair","nav.login":"Entrar",
      "settings.title":"Configurações","settings.lang":"Idioma","settings.lang.desc":"Selecione o idioma de toda a interface","settings.theme":"Tema","settings.theme.desc":"Personalize a aparência da interface","settings.save":"Salvar configurações","settings.saved":"Configurações salvas! Recarregando...",
      "theme.default":"Padrão (Azul)","theme.dark":"Escuro","theme.sunrise":"Amanhecer","theme.forest":"Floresta","theme.ocean":"Oceano","theme.purple":"Púrpura","theme.rose":"Rosa","theme.orange":"Laranja","theme.graphite":"Grafite","theme.sapphire":"Safira","theme.contrast":"Alto Contraste",
      "about.title":"Sobre","about.desc":"Proxy e servidor de streams de vídeo e áudio com suporte a múltiplos métodos de transmissão.","about.author":"Desenvolvido por Alexander Sabino","about.current_ver":"Versão atual","about.latest_ver":"Última versão","about.checking":"Verificando...","about.changelog":"Últimas alterações","about.loading":"Carregando...","about.up_to_date":"✅ Você está na versão mais recente.","about.new_version":"⬆️ Nova versão disponível:","about.releases":"Ver lançamentos","about.error":"Erro","about.unavailable":"Indisponível","about.readme_fallback":"Veja o README.md no GitHub para o changelog completo.","about.readme_error":"Não foi possível carregar o changelog."
    },
    en: {
      "nav.home":"Home","nav.servers":"Stream Servers","nav.users":"Users","nav.status":"Status","nav.logs":"Logs","nav.api":"API Docs","nav.settings":"Settings","nav.about":"About","nav.logout":"Logout","nav.login":"Login",
      "settings.title":"Settings","settings.lang":"Language","settings.lang.desc":"Select the interface language","settings.theme":"Theme","settings.theme.desc":"Customize the interface appearance","settings.save":"Save settings","settings.saved":"Settings saved! Reloading...",
      "theme.default":"Default (Blue)","theme.dark":"Dark","theme.sunrise":"Sunrise","theme.forest":"Forest","theme.ocean":"Ocean","theme.purple":"Purple","theme.rose":"Rose","theme.orange":"Orange","theme.graphite":"Graphite","theme.sapphire":"Sapphire","theme.contrast":"High Contrast",
      "about.title":"About","about.desc":"Video and audio stream proxy with support for multiple transmission methods.","about.author":"Developed by Alexander Sabino","about.current_ver":"Current version","about.latest_ver":"Latest version","about.checking":"Checking...","about.changelog":"Changelog","about.loading":"Loading...","about.up_to_date":"✅ You are on the latest version.","about.new_version":"⬆️ New version available:","about.releases":"View releases","about.error":"Error","about.unavailable":"Unavailable","about.readme_fallback":"See README.md on GitHub for the full changelog.","about.readme_error":"Could not load changelog."
    },
    es: {
      "nav.home":"Inicio","nav.servers":"Servidores","nav.users":"Usuarios","nav.status":"Estado","nav.logs":"Registros","nav.api":"API Docs","nav.settings":"Ajustes","nav.about":"Acerca de","nav.logout":"Salir","nav.login":"Entrar",
      "settings.title":"Ajustes","settings.lang":"Idioma","settings.lang.desc":"Seleccione el idioma de la interfaz","settings.theme":"Tema","settings.theme.desc":"Personalice la apariencia de la interfaz","settings.save":"Guardar ajustes","settings.saved":"¡Ajustes guardados! Recargando...",
      "theme.default":"Predeterminado (Azul)","theme.dark":"Oscuro","theme.sunrise":"Amanecer","theme.forest":"Bosque","theme.ocean":"Océano","theme.purple":"Púrpura","theme.rose":"Rosa","theme.orange":"Naranja","theme.graphite":"Grafito","theme.sapphire":"Zafiro","theme.contrast":"Alto Contraste",
      "about.title":"Acerca de","about.desc":"Proxy de flujos de vídeo y audio con soporte para múltiples métodos de transmisión.","about.author":"Desarrollado por Alexander Sabino","about.current_ver":"Versión actual","about.latest_ver":"Última versión","about.checking":"Comprobando...","about.changelog":"Últimos cambios","about.loading":"Cargando...","about.up_to_date":"✅ Estás en la versión más reciente.","about.new_version":"⬆️ Nueva versión disponible:","about.releases":"Ver lanzamientos","about.error":"Error","about.unavailable":"No disponible","about.readme_fallback":"Vea el README.md en GitHub para el changelog completo.","about.readme_error":"No se pudo cargar el changelog."
    },
    de: {
      "nav.home":"Startseite","nav.servers":"Stream-Server","nav.users":"Benutzer","nav.status":"Status","nav.logs":"Protokolle","nav.api":"API Docs","nav.settings":"Einstellungen","nav.about":"Über","nav.logout":"Abmelden","nav.login":"Anmelden",
      "settings.title":"Einstellungen","settings.lang":"Sprache","settings.lang.desc":"Sprache der Benutzeroberfläche auswählen","settings.theme":"Thema","settings.theme.desc":"Erscheinungsbild der Benutzeroberfläche anpassen","settings.save":"Einstellungen speichern","settings.saved":"Einstellungen gespeichert! Wird neu geladen...",
      "theme.default":"Standard (Blau)","theme.dark":"Dunkel","theme.sunrise":"Sonnenaufgang","theme.forest":"Wald","theme.ocean":"Ozean","theme.purple":"Lila","theme.rose":"Rosa","theme.orange":"Orange","theme.graphite":"Graphit","theme.sapphire":"Saphir","theme.contrast":"Hoher Kontrast",
      "about.title":"Über","about.desc":"Video- und Audio-Stream-Proxy mit Unterstützung mehrerer Übertragungsmethoden.","about.author":"Entwickelt von Alexander Sabino","about.current_ver":"Aktuelle Version","about.latest_ver":"Neueste Version","about.checking":"Wird geprüft...","about.changelog":"Änderungsprotokoll","about.loading":"Wird geladen...","about.up_to_date":"✅ Sie haben die neueste Version.","about.new_version":"⬆️ Neue Version verfügbar:","about.releases":"Versionen ansehen","about.error":"Fehler","about.unavailable":"Nicht verfügbar","about.readme_fallback":"Siehe README.md auf GitHub für das vollständige Changelog.","about.readme_error":"Changelog konnte nicht geladen werden."
    },
    it: {
      "nav.home":"Home","nav.servers":"Server Stream","nav.users":"Utenti","nav.status":"Stato","nav.logs":"Log","nav.api":"API Docs","nav.settings":"Impostazioni","nav.about":"Informazioni","nav.logout":"Esci","nav.login":"Accedi",
      "settings.title":"Impostazioni","settings.lang":"Lingua","settings.lang.desc":"Seleziona la lingua dell'interfaccia","settings.theme":"Tema","settings.theme.desc":"Personalizza l'aspetto dell'interfaccia","settings.save":"Salva impostazioni","settings.saved":"Impostazioni salvate! Ricaricamento...",
      "theme.default":"Predefinito (Blu)","theme.dark":"Scuro","theme.sunrise":"Alba","theme.forest":"Foresta","theme.ocean":"Oceano","theme.purple":"Viola","theme.rose":"Rosa","theme.orange":"Arancione","theme.graphite":"Grafite","theme.sapphire":"Zaffiro","theme.contrast":"Alto Contrasto",
      "about.title":"Informazioni","about.desc":"Proxy per stream video e audio con supporto per più metodi di trasmissione.","about.author":"Sviluppato da Alexander Sabino","about.current_ver":"Versione attuale","about.latest_ver":"Ultima versione","about.checking":"Controllo in corso...","about.changelog":"Ultime modifiche","about.loading":"Caricamento...","about.up_to_date":"✅ Sei alla versione più recente.","about.new_version":"⬆️ Nuova versione disponibile:","about.releases":"Vedi versioni","about.error":"Errore","about.unavailable":"Non disponibile","about.readme_fallback":"Vedi README.md su GitHub per il changelog completo.","about.readme_error":"Impossibile caricare il changelog."
    },
    ru: {
      "nav.home":"Главная","nav.servers":"Серверы","nav.users":"Пользователи","nav.status":"Статус","nav.logs":"Журнал","nav.api":"API Docs","nav.settings":"Настройки","nav.about":"О программе","nav.logout":"Выйти","nav.login":"Войти",
      "settings.title":"Настройки","settings.lang":"Язык","settings.lang.desc":"Выберите язык интерфейса","settings.theme":"Тема","settings.theme.desc":"Настройте внешний вид интерфейса","settings.save":"Сохранить настройки","settings.saved":"Настройки сохранены! Перезагрузка...",
      "theme.default":"По умолчанию (Синий)","theme.dark":"Тёмный","theme.sunrise":"Рассвет","theme.forest":"Лес","theme.ocean":"Океан","theme.purple":"Фиолетовый","theme.rose":"Розовый","theme.orange":"Оранжевый","theme.graphite":"Графит","theme.sapphire":"Сапфировый","theme.contrast":"Высокий контраст",
      "about.title":"О программе","about.desc":"Прокси-сервер для видео- и аудиопотоков с поддержкой нескольких методов передачи.","about.author":"Разработано Alexander Sabino","about.current_ver":"Текущая версия","about.latest_ver":"Последняя версия","about.checking":"Проверка...","about.changelog":"Журнал изменений","about.loading":"Загрузка...","about.up_to_date":"✅ Вы используете последнюю версию.","about.new_version":"⬆️ Доступна новая версия:","about.releases":"Просмотр выпусков","about.error":"Ошибка","about.unavailable":"Недоступно","about.readme_fallback":"Смотрите README.md на GitHub для полного журнала изменений.","about.readme_error":"Не удалось загрузить журнал изменений."
    },
    zh: {
      "nav.home":"首页","nav.servers":"流服务器","nav.users":"用户","nav.status":"状态","nav.logs":"日志","nav.api":"API 文档","nav.settings":"设置","nav.about":"关于","nav.logout":"退出","nav.login":"登录",
      "settings.title":"设置","settings.lang":"语言","settings.lang.desc":"选择界面语言","settings.theme":"主题","settings.theme.desc":"自定义界面外观","settings.save":"保存设置","settings.saved":"设置已保存！正在重新加载...",
      "theme.default":"默认（蓝色）","theme.dark":"深色","theme.sunrise":"日出","theme.forest":"森林","theme.ocean":"海洋","theme.purple":"紫色","theme.rose":"玫瑰","theme.orange":"橙色","theme.graphite":"石墨","theme.sapphire":"蓝宝石","theme.contrast":"高对比度",
      "about.title":"关于","about.desc":"支持多种传输方式的视频和音频流代理服务器。","about.author":"由 Alexander Sabino 开发","about.current_ver":"当前版本","about.latest_ver":"最新版本","about.checking":"检查中...","about.changelog":"更改日志","about.loading":"加载中...","about.up_to_date":"✅ 您使用的是最新版本。","about.new_version":"⬆️ 有新版本可用:","about.releases":"查看发布","about.error":"错误","about.unavailable":"不可用","about.readme_fallback":"请在 GitHub 上查看 README.md 获取完整的更改日志。","about.readme_error":"无法加载更改日志。"
    },
    ja: {
      "nav.home":"ホーム","nav.servers":"ストリームサーバー","nav.users":"ユーザー","nav.status":"ステータス","nav.logs":"ログ","nav.api":"API ドキュメント","nav.settings":"設定","nav.about":"について","nav.logout":"ログアウト","nav.login":"ログイン",
      "settings.title":"設定","settings.lang":"言語","settings.lang.desc":"インターフェース言語を選択","settings.theme":"テーマ","settings.theme.desc":"インターフェースの外観をカスタマイズ","settings.save":"設定を保存","settings.saved":"設定が保存されました！再読み込み中...",
      "theme.default":"デフォルト（青）","theme.dark":"ダーク","theme.sunrise":"サンライズ","theme.forest":"フォレスト","theme.ocean":"オーシャン","theme.purple":"パープル","theme.rose":"ローズ","theme.orange":"オレンジ","theme.graphite":"グラファイト","theme.sapphire":"サファイア","theme.contrast":"ハイコントラスト",
      "about.title":"について","about.desc":"複数の伝送方式をサポートするビデオ・オーディオストリームプロキシ。","about.author":"Alexander Sabino 開発","about.current_ver":"現在のバージョン","about.latest_ver":"最新バージョン","about.checking":"確認中...","about.changelog":"変更履歴","about.loading":"読み込み中...","about.up_to_date":"✅ 最新バージョンを使用しています。","about.new_version":"⬆️ 新しいバージョンが利用可能です:","about.releases":"リリースを見る","about.error":"エラー","about.unavailable":"利用不可","about.readme_fallback":"完全な変更履歴は GitHub の README.md をご覧ください。","about.readme_error":"変更履歴を読み込めませんでした。"
    }
  };
  var SP_EXTRA = {
    pt:{ "ss.btn.start_all":"Iniciar Todos","ss.btn.stop_all":"Parar Todos","ss.btn.add_server":"Adicionar Servidor","ss.btn.playlist":"Download Playlist","ss.th.name":"Nome do Stream","ss.th.channel":"Nº do Canal","ss.th.desc":"Descrição","ss.th.url":"URL","ss.th.type":"Tipo","ss.th.endpoint":"Endpoint","ss.th.status":"Status","ss.th.transfer":"Transferência Média","ss.th.connections":"Conexões","ss.th.command":"Ação","ss.status.running":"ativo","ss.status.stopped":"parado","ss.btn.start":"Iniciar","ss.btn.stop":"Parar","ss.btn.edit":"Editar","ss.btn.delete":"Excluir","ss.msg.started":"StreamServer %s iniciado","ss.msg.stopped":"StreamServer %s parado","ss.msg.deleted":"StreamServer %s excluído","ss.confirm.delete":"Tem certeza que deseja excluir o servidor %s?","user.btn.add":"Adicionar Usuário","user.th.username":"Usuário","user.th.fullname":"Nome Completo","user.th.command":"Ação","user.msg.deleted":"Usuário %s excluído","user.confirm.delete":"Tem certeza que deseja excluir o usuário %s?","err.http":"erro HTTP" },
    en:{ "ss.btn.start_all":"Start All","ss.btn.stop_all":"Stop All","ss.btn.add_server":"Add Stream Server","ss.btn.playlist":"Download Playlist","ss.th.name":"Stream Name","ss.th.channel":"Channel Number","ss.th.desc":"Description","ss.th.url":"URL","ss.th.type":"Type","ss.th.endpoint":"Endpoint","ss.th.status":"Status","ss.th.transfer":"Avg. Data Transfer","ss.th.connections":"Connections","ss.th.command":"Command","ss.status.running":"running","ss.status.stopped":"stopped","ss.btn.start":"Start","ss.btn.stop":"Stop","ss.btn.edit":"Edit","ss.btn.delete":"Delete","ss.msg.started":"StreamServer %s has started","ss.msg.stopped":"StreamServer %s has stopped","ss.msg.deleted":"StreamServer %s has deleted","ss.confirm.delete":"Are you sure you want to delete the stream server %s?","user.btn.add":"Add User","user.th.username":"Username","user.th.fullname":"Full Name","user.th.command":"Command","user.msg.deleted":"user %s has deleted","user.confirm.delete":"Are you sure you want to delete the user %s?","err.http":"error HTTP" },
    es:{ "ss.btn.start_all":"Iniciar Todos","ss.btn.stop_all":"Detener Todos","ss.btn.add_server":"Agregar Servidor","ss.btn.playlist":"Descargar Lista","ss.th.name":"Nombre del Stream","ss.th.channel":"Nº de Canal","ss.th.desc":"Descripción","ss.th.url":"URL","ss.th.type":"Tipo","ss.th.endpoint":"Endpoint","ss.th.status":"Estado","ss.th.transfer":"Transferencia Media","ss.th.connections":"Conexiones","ss.th.command":"Acción","ss.status.running":"activo","ss.status.stopped":"detenido","ss.btn.start":"Iniciar","ss.btn.stop":"Detener","ss.btn.edit":"Editar","ss.btn.delete":"Eliminar","ss.msg.started":"StreamServer %s iniciado","ss.msg.stopped":"StreamServer %s detenido","ss.msg.deleted":"StreamServer %s eliminado","ss.confirm.delete":"¿Seguro que deseas eliminar el servidor %s?","user.btn.add":"Agregar Usuario","user.th.username":"Usuario","user.th.fullname":"Nombre Completo","user.th.command":"Acción","user.msg.deleted":"Usuario %s eliminado","user.confirm.delete":"¿Seguro que deseas eliminar el usuario %s?","err.http":"error HTTP" },
    de:{ "ss.btn.start_all":"Alle starten","ss.btn.stop_all":"Alle stoppen","ss.btn.add_server":"Server hinzufügen","ss.btn.playlist":"Playlist herunterladen","ss.th.name":"Stream-Name","ss.th.channel":"Kanal-Nr.","ss.th.desc":"Beschreibung","ss.th.url":"URL","ss.th.type":"Typ","ss.th.endpoint":"Endpunkt","ss.th.status":"Status","ss.th.transfer":"Ø Datenübertragung","ss.th.connections":"Verbindungen","ss.th.command":"Aktion","ss.status.running":"aktiv","ss.status.stopped":"gestoppt","ss.btn.start":"Starten","ss.btn.stop":"Stoppen","ss.btn.edit":"Bearbeiten","ss.btn.delete":"Löschen","ss.msg.started":"StreamServer %s gestartet","ss.msg.stopped":"StreamServer %s gestoppt","ss.msg.deleted":"StreamServer %s gelöscht","ss.confirm.delete":"StreamServer %s wirklich löschen?","user.btn.add":"Benutzer hinzufügen","user.th.username":"Benutzername","user.th.fullname":"Vollständiger Name","user.th.command":"Aktion","user.msg.deleted":"Benutzer %s gelöscht","user.confirm.delete":"Benutzer %s wirklich löschen?","err.http":"HTTP-Fehler" },
    it:{ "ss.btn.start_all":"Avvia tutti","ss.btn.stop_all":"Ferma tutti","ss.btn.add_server":"Aggiungi Server","ss.btn.playlist":"Scarica Playlist","ss.th.name":"Nome Stream","ss.th.channel":"N. Canale","ss.th.desc":"Descrizione","ss.th.url":"URL","ss.th.type":"Tipo","ss.th.endpoint":"Endpoint","ss.th.status":"Stato","ss.th.transfer":"Trasf. Media","ss.th.connections":"Connessioni","ss.th.command":"Azione","ss.status.running":"attivo","ss.status.stopped":"fermo","ss.btn.start":"Avvia","ss.btn.stop":"Ferma","ss.btn.edit":"Modifica","ss.btn.delete":"Elimina","ss.msg.started":"StreamServer %s avviato","ss.msg.stopped":"StreamServer %s fermato","ss.msg.deleted":"StreamServer %s eliminato","ss.confirm.delete":"Eliminare il server %s?","user.btn.add":"Aggiungi Utente","user.th.username":"Nome utente","user.th.fullname":"Nome completo","user.th.command":"Azione","user.msg.deleted":"Utente %s eliminato","user.confirm.delete":"Eliminare l'utente %s?","err.http":"errore HTTP" },
    ru:{ "ss.btn.start_all":"Запустить всё","ss.btn.stop_all":"Остановить всё","ss.btn.add_server":"Добавить сервер","ss.btn.playlist":"Скачать плейлист","ss.th.name":"Имя потока","ss.th.channel":"№ канала","ss.th.desc":"Описание","ss.th.url":"URL","ss.th.type":"Тип","ss.th.endpoint":"Эндпойнт","ss.th.status":"Статус","ss.th.transfer":"Ср. передача","ss.th.connections":"Подключения","ss.th.command":"Действие","ss.status.running":"активен","ss.status.stopped":"остановлен","ss.btn.start":"Запуск","ss.btn.stop":"Стоп","ss.btn.edit":"Изменить","ss.btn.delete":"Удалить","ss.msg.started":"StreamServer %s запущен","ss.msg.stopped":"StreamServer %s остановлен","ss.msg.deleted":"StreamServer %s удалён","ss.confirm.delete":"Удалить сервер %s?","user.btn.add":"Добавить пользователя","user.th.username":"Имя пользователя","user.th.fullname":"Полное имя","user.th.command":"Действие","user.msg.deleted":"Пользователь %s удалён","user.confirm.delete":"Удалить пользователя %s?","err.http":"ошибка HTTP" },
    zh:{ "ss.btn.start_all":"全部启动","ss.btn.stop_all":"全部停止","ss.btn.add_server":"添加流服务器","ss.btn.playlist":"下载播放列表","ss.th.name":"流名称","ss.th.channel":"频道号","ss.th.desc":"描述","ss.th.url":"URL","ss.th.type":"类型","ss.th.endpoint":"端点","ss.th.status":"状态","ss.th.transfer":"平均数据传输","ss.th.connections":"连接数","ss.th.command":"操作","ss.status.running":"运行中","ss.status.stopped":"已停止","ss.btn.start":"启动","ss.btn.stop":"停止","ss.btn.edit":"编辑","ss.btn.delete":"删除","ss.msg.started":"StreamServer %s 已启动","ss.msg.stopped":"StreamServer %s 已停止","ss.msg.deleted":"StreamServer %s 已删除","ss.confirm.delete":"确定删除流服务器 %s？","user.btn.add":"添加用户","user.th.username":"用户名","user.th.fullname":"全名","user.th.command":"操作","user.msg.deleted":"用户 %s 已删除","user.confirm.delete":"确定删除用户 %s？","err.http":"HTTP 错误" },
    ja:{ "ss.btn.start_all":"すべて開始","ss.btn.stop_all":"すべて停止","ss.btn.add_server":"サーバーを追加","ss.btn.playlist":"プレイリストをDL","ss.th.name":"ストリーム名","ss.th.channel":"チャンネル番号","ss.th.desc":"説明","ss.th.url":"URL","ss.th.type":"タイプ","ss.th.endpoint":"エンドポイント","ss.th.status":"ステータス","ss.th.transfer":"平均データ転送","ss.th.connections":"接続数","ss.th.command":"操作","ss.status.running":"実行中","ss.status.stopped":"停止","ss.btn.start":"開始","ss.btn.stop":"停止","ss.btn.edit":"編集","ss.btn.delete":"削除","ss.msg.started":"StreamServer %s を開始しました","ss.msg.stopped":"StreamServer %s を停止しました","ss.msg.deleted":"StreamServer %s を削除しました","ss.confirm.delete":"ストリームサーバー %s を削除しますか？","user.btn.add":"ユーザーを追加","user.th.username":"ユーザー名","user.th.fullname":"フルネーム","user.th.command":"操作","user.msg.deleted":"ユーザー %s を削除しました","user.confirm.delete":"ユーザー %s を削除しますか？","err.http":"HTTP エラー" }
  };
  Object.keys(SP_EXTRA).forEach(function(l){ if(SP_TRANS[l]) Object.assign(SP_TRANS[l], SP_EXTRA[l]); });
  var t = localStorage.getItem('sp_theme') || 'default';
  if (t !== 'default') document.documentElement.setAttribute('data-theme', t);
  var _spLang = localStorage.getItem('sp_lang') || 'pt';
  window.SP_LANG = _spLang;
  window.SP_T = function(key) {
    var tr = SP_TRANS[_spLang] || SP_TRANS.pt;
    return (tr && tr[key]) ? tr[key] : (SP_TRANS.pt[key] || key);
  };
  document.addEventListener('DOMContentLoaded', function(){
    var tr = SP_TRANS[_spLang] || SP_TRANS.pt;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      if (tr[k]) el.textContent = tr[k];
    });
    var path = window.location.pathname;
    document.querySelectorAll('.nav-item[href]').forEach(function(el){
      var href = el.getAttribute('href');
      if (href && (path === href || (href !== '/' && path.startsWith(href)))) {
        el.classList.add('active');
      }
    });
  });
})();
</script>
<nav class="sidebar">
  <div class="sidebar-brand">
    <img src="/streamproxy_app_icon.png" class="brand-icon" alt="StreamProxy"/>
    <span>StreamProxy</span>
  </div>
  <ul class="nav-list">
    <li><a class="nav-item" href="/">${SVG_HOME}<span data-i18n="nav.home">Home</span></a></li>`;

    if (isAuthenticated) {
        html += `
    <li><a class="nav-item" href="/streamserver/list">${SVG_SERVERS}<span data-i18n="nav.servers">Stream Servers</span></a></li>
    <li><a class="nav-item" href="/user/list">${SVG_USERS}<span data-i18n="nav.users">Usuários</span></a></li>
    <li><a class="nav-item" href="/status">${SVG_STATUS}<span data-i18n="nav.status">Status</span></a></li>
    <li><a class="nav-item" href="/log">${SVG_LOG}<span data-i18n="nav.logs">Logs</span></a></li>
    <li><a class="nav-item" href="/docs/api/">${SVG_API}<span data-i18n="nav.api">API Docs</span></a></li>
    <li><a class="nav-item" href="/settings">${SVG_SETTINGS}<span data-i18n="nav.settings">Configurações</span></a></li>`;
    }
    html += `
    <li><a class="nav-item" href="/about">${SVG_ABOUT}<span data-i18n="nav.about">Sobre</span></a></li>
  </ul>
  <div class="sidebar-footer">`;
    if (isAuthenticated) {
        html += `<div class="sidebar-username">${auth.user}</div>
    <a href="/logout" class="sidebar-logout" data-i18n="nav.logout">Sair</a>`;
    } else {
        html += `<a href="/login" class="sidebar-logout" data-i18n="nav.login">Entrar</a>`;
    }
    html += `
  </div>
</nav>`;
    return html;
}


function CreateMenuStyle() {
    return "";
}


//function to check if a port is not in use
function portIsOccupied(port) {
    var net = require('net');
    var isOccupied = false;
    var checked = false;
    
    var server = net.createServer().listen(port);
    
    server.on('listening', () => {
      server.close();
      isOccupied = false; // porta disponível
      checked = true;
    });
  
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        isOccupied = true; // porta ocupada
        checked = true;
      }
    });
  
    // Espera o servidor fechar antes de retornar o resultado
    while (checked === false) {
      require('deasync').runLoopOnce();
    }
  
    return isOccupied;
  }
  
  
  





/* end of program */