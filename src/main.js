/********************************************/
/* Stream Proxy - A Proxy for a Livestream  */
/* Desenvolvido por Alexander Sabino        */
/********************************************/

const { spawn } = require('child_process');
const express = require('express');
const os = require('os');
var useragent = require('express-useragent');
var config = {};
var info = { pid: 0, platform: "", arch: "", freemem: 0, totalmem: 0, ostype: "", versions: { ffmpeg: "", streamlink: "", os: "" } }
var processes = [];
var databuf = { header: [{ bytes: [] }], data: undefined };
var databufheaderlen = 4;
var mydatabuf = undefined;
var streamserverstatus = [];
const { PassThrough } = require("stream").Duplex;
//var arrstreamserver = [{ PID: 0, streamname: "", tunnel: undefined }]
var arrstreamserver = []
    //const tunnel = new PassThrough();

var debug = { PID: 0, url: "", endpoint: "", remoteIP: "", app: "", command: "", statusExec: "", lastEvent: "", exitCode: "", exitSignal: "", message: "", lastError: "", lastConsoleData: { stdErr: "", stdin: "" } };

var logdata = [];
var pageTitle = "";
//var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { application, response } = require('express');


loadconfig();
getInfo();
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
//console.log(pjson.version);


// Title screen
console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                         A Proxy for the livestreams                   ")
console.log(`                                             version ${pjson.version}                  `)
console.log("                              Developed by Alexander Sabino (asabino2.github.io)       ")
console.log("                                           Rio de Janeiro - Brazil1                     ")



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

    runStream(req, res, spawn(config.streamlinkpath + "streamlink", [url, 'best', '-l', 'error', '--stdout']), "streamlink")


});




app.get('/videostream/ffmpeg', (req, res) => {
    var stream = undefined;
    var streamerror = undefined;
    var streamstart = false;
    var showErrorInStream = false;
    var streamerrorpid = 0;
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
    ffmpegparams.push('15000k');
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
        //ffmpegparams.push(service_provider);
    }
    if (service_provider != undefined) {
        ffmpegparams.push('-metadata');
        ffmpegparams.push('service_name="' + service_name + '"');
        //ffmpegparams.push(service_name);
    }
    if (vformat != undefined) {
        ffmpegparams.push('-f');
        ffmpegparams.push(vformat);
    }
    ffmpegparams.push('-tune');
    ffmpegparams.push('zerolatency');
    ffmpegparams.push('-');

    //ffmpegparams = ['-loglevel', 'error', '-i', url, '-vcodec', vcodec, '-acodec', acodec, '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=' + service_provider, '-metadata', 'service_name=' + service_name, '-f', config.ffmpeg.format, '-tune', 'zerolatency', '-'];

    runStream(req, res, spawn(config.ffmpegpath + 'ffmpeg', ffmpegparams), "ffmpeg");


});

//convert to audio
app.get('/audiostream/play', (req, res) => {
    var PIDOffset = 0;
    var command = "";
    var url = req.query.url;
    /*   
       if (checkToken(req, res) == false) {
           return false;
       };

       var auth = basicAuth(req, res);
       if (auth.authenticated == false) {
           return false;
       }

       appsetheader(res);

       
       announceStreaming(url);
       url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    */
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
                command = config.streamlinkpath + 'streamlink ' + url + ' worst --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + ' -'
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
    if (os.platform == 'win32') {
        //stream = spawn(command, { shell: 'powershell.exe' });
        runStream(req, res, spawn(command, { shell: 'powershell.exe' }), runner + "(VideoToAudioConverter)", true)
    } else {
        //stream = spawn(command, { shell: true });
        runStream(req, res, spawn(command, { shell: true }), runner + "(VideoToAudioConverter)", true)
    }




});



//videostream play
app.get('/videostream/play', (req, res) => {
    var command = "";
    var url = req.query.url;
    var clientIP = req.ip;
    /*
        if (checkToken(req, res) == false) {
            return false;
        };

        var auth = basicAuth(req, res);
        if (auth.authenticated == false) {
            return false;
        }

        appsetheader(res);

        
        announceStreaming(url);
        url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url



        var clientIP = req.ip;
        debug.remoteIP = req.ip;
        debug.endpoint = req.path;
        var metadata = "";
    */


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
    vcodec = '-vcodec ' + vcodec;

    if (req.query.audiocodec != undefined) {
        acodec = encodeURI(req.query.audiocodec);
    } else if (config.ffmpeg.acodec != undefined) {
        acodec = config.ffmpeg.acodec;
    } else {
        acodec = "aac";
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
    }

    if (req.query.framerate != undefined) {
        framerate = '-r ' + encodeURI(req.query.framerate);
    }

    //command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg -loglevel error -i pipe:0 -vcodec ' + config.ffmpeg.codec + ' -acodec aac -b 15000k -strict -2 -mbd rd -copyinkf -flags +ilme+ildct -fflags +genpts -metadata service_provider="' + config.ffmpeg.serviceprovider + '" -f ' + config.ffmpeg.format + ' -tune zerolatency -'
    command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg -loglevel error -i pipe:0 ' + vcodec + ' ' + framesize + ' ' + framerate + ' ' + acodec + ' -b 15000k -strict -2 -mbd rd -copyinkf -flags +ilme+ildct -fflags +genpts ' + service_provider + ' ' + service_name + ' ' + vformat + ' -tune zerolatency -'

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
    //runStream(req, res, ffmpegDisplayText(req.query.text, req.query.bgimage, undefined, undefined, undefined, undefined, undefined), "ffmpeg", true);
    runStream(req, res, displayErrorInStream("teste"), "ffmpeg", true);
})


app.get('/streamserver/create', (req, res) => {
    var auth = basicAuth(req, res);
    var port = req.query.port;
    var html = "";
    if (port == undefined) {
        port = config.port + 1;
    }
    if (auth.authenticated == false) {
        return false;
    }

    //streamlinkHTTPServer(req, res, auth, port);
    /*
    res.send(`<h3>this endpoint is deprecated, to create a stream server, call a videostream or audiostream url in the browser with the streamserver parameter <br>
             ex: http://${os.hostname}:${config.port}/videostream/streamlink?url =https://cdnlive.shooowit.net/canalextremaduralive/smil:channel1DVR.smil/playlist.m3u8&streamserver=extremadura</h3><br>
             <h3>to watch the stream created with command above, insert in your IPTV app the url: http://${os.hostname}:${config.port}/streamserverplay/extremadura</h3>`)
    */
    html = `
    <html>
    <head>
    <style>
    
    
    
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
    
    
    
    #for_ffmpeg {
      display: none;
    }
    
    #for_audiostream {
      display: none;
    }
    
    #logdiv {
        position: relative;
        border:  1px solid black;
        width: 1300px;
        height: 500px;
        margin: auto;
        top: 200px;
      }

    #createserverbutton {
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
                 
                             #createserverbutton:active {
                                 transform: scale(0.98);
                                 
                                 box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                                 
                             } 
                             #createserverbutton:disabled {
                                background-color: gray;
                             }  
                             
    </style>
    <script>
      function createserver(){
       
        var streamname = document.getElementById("streamname").value;
        var streammethod = document.getElementById("streammethod").value;
        var streamdescription = document.getElementById("streamdescription").value;
        var url = document.getElementById("url").value;
        var service_provider = document.getElementById("ffmpeg_providerdiv").value;
        var videoformat = document.getElementById("ffmpeg_videoformat").value;
        var videocodec = document.getElementById("ffmpeg_videocodec").value;
        var audiocodec = document.getElementById("ffmpeg_audiocodec").value;
        var framesize = document.getElementById("ffmpeg_framesize").value;
        var framerate = document.getElementById("ffmpeg_framerate").value;
        var channelnumber = document.getElementById("channelnumber").value;
        var title = document.getElementById("audiostream_title").value;
        var hasError = false;
    
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
        
          streamname = "&streamserver="+streamname
        }
    
        if(videoformat == "" || videoformat == undefined){
          videoformat = "" ;
        } else {
          videoformat = "&videoformat="+videoformat ;
        }

        if(framesize == "" || framesize == undefined){
            framesize = "" ;
          } else {
            framesize = "&framesize="+framesize ;
          }
          
          if(framerate == "" || framerate == undefined){
            framerate = "" ;
          } else {
            framerate = "&framerate="+framerate ;
          }
          
        if(streamdescription == "" || streamdescription == undefined){
          streamdescription = "" ;
        } else {
          streamdescription = "&streamdescription="+streamdescription ;
        }
    
        if(service_provider == "" || service_provider == undefined){
          service_provider = "" ;
        } else {
          service_provider = "&serviceprovider="+service_provider ;
        }
    
        if(channelnumber == "" || channelnumber == undefined){
          channelnumber = "" ;
          
        } else {
          channelnumber = "&chnumber="+channelnumber ;
        }
    
        if(videocodec == "" || videocodec == undefined){
          videocodec = "" ;
          
        } else {
          videocodec = "&videocodec="+videocodec ;
        }
    
        if(audiocodec == "" || audiocodec == undefined){
          audiocodec = "" ;
        } else {
          audiocodec = "&audiocodec="+audiocodec ;
        }
    
        if(title == "" || title == undefined){
          title = "" ;
        } else {
          title = "&title="+title ;
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
    
    
       if(streammethod != "/videostream/ffmpeg" && streammethod != "/videostream/play"){
        videoformat = "";
        service_provider = "";
        
        videocodec = "";
        audiocodec = "";
       }
    
       if(streammethod != "/videostream/ffmpeg" && streammethod != "/videostream/play" && streammethod != "/videostream/streamlink"){
        channelnumber = "";
    }

       if(streammethod != "/audiostream/play"){
         title = "";
       } 
    
    
       
        urltocall = streammethod+"?url="+url+streamname+videoformat+streamdescription+service_provider+channelnumber+videocodec+framesize+framerate+audiocodec+title
       
        //alert("teste")
       //window.location.href = urltocall;
       document.getElementById("logdiv").innerHTML = "processing....";
       document.getElementById("createserverbutton").disabled = true;
       let xhr = new XMLHttpRequest();
xhr.open('GET', urltocall);
xhr.send();
                xhr.onload = function() {
                    let responseObj = xhr.response;
                      
                        logdiv = responseObj;
                        document.getElementById("logdiv").innerHTML = responseObj;
                        document.getElementById("createserverbutton").disabled = false;
                        
                        
                   
                  };
                  xhr.onerror = function(e) {
                   console.log("error", e);
                };
        
        //location.replace(urltocall)
        
      }
      function enabledisablefields(){
        var streammethod = document.getElementById("streammethod").value;
        
        if(streammethod == "/videostream/ffmpeg"){
          document.getElementById("for_ffmpeg").style.display = 'block';
        } else {
          document.getElementById("for_ffmpeg").style.display = 'none';
        }
    
        if(streammethod != '/audiostream/play'){
          document.getElementById("for_videostream").style.display = 'block';
          document.getElementById("for_audiostream").style.display = 'none';
        } else {
          document.getElementById("for_videostream").style.display = 'none';
          document.getElementById("for_audiostream").style.display = 'block';
        }
    
      
      }
    
      function checkForSpecialCharacter(text){
      //  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/; // removed because javascript error
   // return format.test(text);
        //return false;
    }
    
    function onlyNumbers(str) {
      return /^[0-9]+$/.test(str);
    }
    
    </script>
    </head>
    <body>
      <div id="main">
      <center><h1>Create a Stream server</h1></center>
      <h2><center>use this page to create a streamserver and serve this to n users (one thread will be created)<center></h2>
       
      
       
        <div id="forms">
    <!-- streamname -->
          <div id="streamnamediv" > 
        <label  for="streamname" class="label" id="teste">Streaming Name:</label><br>
        <input id="streamname" name="streamname" class="secondaryinput" size="50"/><br /><br /><br />
      </div>
    <!-- stream description-->
        <div id="streamdescriptiondiv" >
           <label class="label">Stream Description (optional):</label> <br>
        <input id="streamdescription" name="streamdescription" class="secondaryinput" size="50"/><br /><br /><br />
      </div>
    
     <!-- stream method --> 
        <div id="streammethoddiv" >
          <label  class="label">Streaming Method:</label> <br>
        <select id="streammethod" name="streammethod" class="secondaryinput" onchange = "enabledisablefields()">
          <option value="/videostream/streamlink">Videostream (streamlink)</option>
          <option value="/videostream/ffmpeg">Videostream (ffmpeg)</option>`

    if (info.platform != "win32") {
        html += `<option value="/videostream/play">Videostream (streamlink+ffmpeg)</option>`
    }
    html += `<option value="/audiostream/play"
        >convert videostream to audiostream</option
      >
    </select><br /><br />   <br>
  </div>

  <div id="for_ffmpeg">
  <!-- FFMPEG:streamprovider-->  
  <div id="ffmpeg_providerdiv" >
      <label class="label">Provider (optional):</label> <br>
   <input id="ffmpeg_provider" name="ffmpeg_provider" class="secondaryinput" size="50"/><br /><br /><br />
  </div> 
<!-- FFMPEG:video format-->
  <div id="ffmpeg_videoformatdiv" >
      <label class="label">Video Format (optional):</label> <br>
   <input id="ffmpeg_videoformat" name="ffmpeg_videoformat" class="secondaryinput" size="50"/><br /><br /><br />
  </div>    

<!-- FFMPEG:vcodec-->
<div id="ffmpeg_videocodecdiv" >
    <label class="label">Video Codec (optional):</label> <br>
 <input id="ffmpeg_videocodec" name="ffmpeg_videocodec" class="secondaryinput" size="50"/><br /><br /><br />
</div>  

<!-- FFMPEG:framesize-->
<div id="ffmpeg_framesizediv" >
    <label class="label">Frame Size:</label> <br>
    <select id="ffmpeg_framesize" name="ffmpeg_framesize" class="secondaryinput" ">
    <option value="">Auto (copy from original video)</option>
    <option value="320x240">320x240</option>
    <option value="720x480">480p</option>
    <option value="1280x720">720p (HD)</option>
    <option value="1920x1080">1080p (fullhd)</option>
    <option value="2560x1440">QUAD HD</option>
    <option value="3840x2160">4K</option>
    <option value="7680x4320">8K</option>
    <option value="15360x8640">16K</option>

</select><br /><br />   <br>
</div> 

<!-- FFMPEG:framerate-->
<div id="ffmpeg_frameratediv" >
    <label class="label">Framerate:</label> <br>
    <select id="ffmpeg_framerate" name="ffmpeg_framerate" class="secondaryinput" ">
    <option value="">Auto (copy from original video)</option>
    <option value="10">10fps</option>
    <option value="15">15fps</option>
    <option value="24">24fps</option>
    <option value="25">25fps</option>
    <option value="29.97">29.97fps</option>
    <option value="30">30fps</option>
    <option value="59.97">59.97fps</option>
    <option value="60">60fps</option>

</select><br /><br />   <br>
</div> 

<!-- FFMPEG:acodec-->
<div id="ffmpeg_audiocodecdiv" >
    <label class="label">Audio Codec (optional):</label> <br>
 <input id="ffmpeg_audiocodec" name="ffmpeg_audiocodec" class="secondaryinput" size="50"/><br /><br /><br />
</div>
</div>

<div id="for_videostream">
<div id="channelnumberdiv">
    <label class="label">Channel Number (optional):</label> <br>
 <input id="channelnumber" name="channelnumber" class="secondaryinput" size="50"/><br /><br /><br />
</div>
</div>    

<div id="for_audiostream">
<div id="audiostream_titlediv">
    <label class="label">Title (optional):</label> <br>
 <input id="audiostream_title" name="audiostream_title" class="secondaryinput" size="50"/><br /><br /><br />    
</div>
</div>

    <!-- url --> 
   <div id="urldiv"> 
     <label  class="label">Url:</label><br>
    <input id="url" name="url" size="50" id="urllabel" placeholder="URL to stream" class="secondaryinput"/><br /><br><br />
    <center><button onclick="createserver()" id="createserverbutton" >Create Server</button></center>
  </div>

  </div> 
  <div id="logdiv">
  
    </div>  
</div> 
</body>
</html>`
    res.send(html);

})

app.get('/streamserver/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    data += `<html>
            <head> 
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

               /* Start of toast */  
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
               }
           
               /* kill button */
               #killbutton {
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
            /* Adding transformation when the button is active */
              
            #killbutton:active {
                transform: scale(0.98);
                /* Scaling button to 0.98 to its original size */
                box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                /* Lowering the shadow */
            }
            /* kill button end */
               
               @-webkit-keyframes fadein {
                 from {bottom: 0; opacity: 0;} 
                 to {bottom: 30px; opacity: 1;}
               }
               
               @keyframes fadein {
                 from {bottom: 0; opacity: 0;}
                 to {bottom: 30px; opacity: 1;}
               }
               
               @-webkit-keyframes fadeout {
                 from {bottom: 30px; opacity: 1;} 
                 to {bottom: 0; opacity: 0;}
               }
               
               @keyframes fadeout {
                 from {bottom: 30px; opacity: 1;}
                 to {bottom: 0; opacity: 0;}
               }
               /* end of toast */                   

            </style>
            <script>;
           

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
                htmlData += "<table>";
                htmlData += "<tr>";
                htmlData += "<th>UUID</th>";
                htmlData += "<th>PID</th>";
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
                  htmlData += '<td>'+table.pid+'</td>';
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

              function startTimer() {
                getStatusData();
                setInterval(getStatusData, 1000);  
            }
              
               

            </script>   
            </head>
            <body onload="startTimer()">
            <div id="status"></div>
            
            `
    res.send(data);
})

app.get('/streamserver/playlist.m3u', (req, res) => {
    var userpassword = undefined
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    if (auth.auth != undefined) {
        userpassword = Buffer.from(auth.auth, 'base64').toString()
    }




    var playlistdata = "";
    var channelname = "";
    var channelnumber = "";
    var radio = "";

    playlistdata += "#EXTM3U\n";
    arrstreamserver.forEach(val => {
            if (val.chnumber != undefined && val.chnumber != "") {
                channelnumber = `tvg-chno="${val.chnumber}"`;
            }
            if (val.serverdescription != undefined && val.serverdescription != "") {
                channelname = val.serverdescription
            } else {
                channelname = val.servername
            }

            if (val.radio == true) {
                radio = "radio=true";
            }
            playlistdata += `#EXTINF:-1 ${channelnumber} ${radio}, ${channelname}\n`;
            if (userpassword != undefined && userpassword != "") {
                playlistdata += `http://${userpassword}@${req.hostname}:${getPortCalled(req)}/play/${val.servename}\n`
            } else {
                playlistdata += `http://${req.hostname}:${getPortCalled(req)}/play/${val.servername}\n`
            }
        })
        //res.setHeader('Content-Type', 'application/octet-stream')
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
    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
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


    appsetheader(res);

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
                command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -f ' + format + ' ' + output;
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
        // console.log(`closed connection of url ${url}`);
        //  removeprocess(stream.pid);
        //stream.kill();
        // killProcesses(stream.pid);

    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
        log(data.toString());
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});

app.get('/play/*', (req, res) => {
    //res.status(900).send(JSON.stringify(processes));
    //while (actualstream != null) {
    //    res.send(actualstream);
    //}

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    var streamname = req.path;
    var UUID = generateUUID();
    streamname = streamname.substring(streamname.lastIndexOf('/') + 1);
    //var streamserver = req.query.streamserver;
    var arrstreamserverfilter = arrstreamserver.filter(value => value.servername == streamname);
    if (arrstreamserverfilter.length <= 0) {
        res.status(404).send("no stream server has created with name " + streamname);
        return false;
    }
    addStreamServerStatus(req, auth, streamname, UUID);
    var mytunnel = arrstreamserverfilter[0].tunnel;
    mytunnel.pipe(res);

    req.on('close', () => { // on connection close, kill PID of app
        removeStreamServerStatus(UUID);
        //console.log(`closed connection of url ${url}`);
        //console.log(`kill PID ${stream.pid} of program streamlink`)
        //stream.kill();
        //killProcesses(stream.pid);
    })
});

app.get('/api/streamserver/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }
    var streamservername = req.query.servername;
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
    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

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

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);
    url = req.query.url;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url


    res.json(checkstream(url));
});

app.get('/api/status', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }
    res.json(processes);
})

app.get('/debug', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
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
    if (auth.authenticated == false) {
        return false;
    }
    //var timestamp = new Date().getTime();
    res.setHeader('Content-Type', 'application/json');
    res.json(info);
    //res.send(req.useragent);
});

app.get('/clientinfo', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(req.useragent);
});

app.get('/api/log', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }
    res.json(logdata);
})

app.post('/api/clearlog', (req, res) => {
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
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
    if (auth.authenticated == false) {
        return false;
    }
    var htmldata = "";
    htmldata += `<header>
    <style>
      textarea {
        border: 1px solid #999999;
        width: 100%;
        height: 95%;
        margin: 5px 0;
        padding: 3px;
        resize: none;
      }
    </style>
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
       
     
    </script>
  </header>
  <body onload="startTimer()">
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


app.post('/api/killProcess', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');

    log("kill process " + req.body.PID + " requested from IP " + req.ip);

    // check if user is authenticated
    /*
    var b64auth = req.body.auth;
    if (config.basicAuthentication != undefined) {
        const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
        authdataconfig = config.basicAuthentication.users.find(item => item.username == login)
        if (authdataconfig == undefined) {
            res.status(401).send("forbidden")
            return false;
        }

    }
    */
    //basicAuth(req, res);
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }
    try {
        killProcesses(req.body.PID);

        res.status(200).send("requested the SO to kill process " + req.body.PID);
    } catch (e) {
        res.statusMessage = e.message;
        res.status(500).send("error on kill process " + req.body.PID + ", error: " + e.message);
    }

})

app.get('/login', (req, res) => {
    if (basicAuth(req, res).authenticated == false) { //if authentication is required and fail, return 401
        return false;
    }
    res.send("User authenticate");
})



app.get('/logout', (req, res) => {
    //res.clearCookie('authbase64stremproxy');

    //res.statusCode = 401;
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Logout ok.') // custom message





})

app.get('/stopserver', (req, res) => {
    if (basicAuth(req, res).authenticated == false) { //if authentication is required and fail, return 401
        return false;
    }
    res.send("<h1>server will be stopped</h1>");
    process.exit(0);
});





app.get('/status', (req, res) => {

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);
    var catsize = 'KB';
    var datasize = 0;

    var data = "";
    data += `<html>
            <head> 
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

               /* Start of toast */  
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
               }
           
               /* kill button */
               #killbutton {
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
            /* Adding transformation when the button is active */
              
            #killbutton:active {
                transform: scale(0.98);
                /* Scaling button to 0.98 to its original size */
                box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
                /* Lowering the shadow */
            }
            /* kill button end */
               
               @-webkit-keyframes fadein {
                 from {bottom: 0; opacity: 0;} 
                 to {bottom: 30px; opacity: 1;}
               }
               
               @keyframes fadein {
                 from {bottom: 0; opacity: 0;}
                 to {bottom: 30px; opacity: 1;}
               }
               
               @-webkit-keyframes fadeout {
                 from {bottom: 30px; opacity: 1;} 
                 to {bottom: 0; opacity: 0;}
               }
               
               @keyframes fadeout {
                 from {bottom: 30px; opacity: 1;}
                 to {bottom: 0; opacity: 0;}
               }
               /* end of toast */                   

            </style>
            <script>;
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
                htmlData += "<table>";
                htmlData += "<tr>";
                htmlData += "<th>PID</th>";
                htmlData += "<th>URL</th>";
                htmlData += "<th>Output</th>";
                htmlData += "<th>Endpoint</th>";
                htmlData += "<th>Client</th>";
                htmlData += " <th>Data Transferred</th>";
                htmlData += "<th>User</th>";
                htmlData += "<th>Command</th>";
                htmlData += "<th></th>";
                htmlData += "</tr>";
                responseObj.forEach(function(table) {
                  datasize = table.dataSize;
                  if (datasize > 1024) {
                      datasize = datasize / 1024;
                      catsize = 'MB';
                  }
                  if (datasize > 1024) {
                      datasize = datasize / 1024;
                      catsize = 'GB';
                  }
                  datasize = datasize.toFixed(3);
                  htmlData += '<tr>';
                  if(table.childprocess.length == 0){
                  htmlData += '<td>'+table.PID+'</td>';
                  } else {
                   htmlData += '<td><a href="./status/'+table.PID+'">'+table.PID+'</a></td>';  
                  }
                  htmlData += '<td>'+table.url+'</td>';
                  if(table.streamlinkserver == true){
                      htmlData += '<td>http://${req.host}:'+table.streamArgs+'</td>';
                  } else if (table.restream == true) {
                    htmlData += '<td>'+table.streamArgs+'</td>';
                  } else if (table.isStreamServer == true) {
                    htmlData += '<td><a href="http://${req.hostname}:${getPortCalled(req)}/streamserver/status?streamname='+table.streamArgs+'">http://${req.hostname}:${getPortCalled(req)}/play/'+table.streamArgs+'</a></td>';
                  } else {
                     htmlData += '<td>${req.ip}</td>';
                  }
                  htmlData += '<td>'+table.endpoint+'</td>';
                  htmlData += '<td>'+table.clientIP+'</td>';
                  if(table.streamlinkserver == false && table.restream == false){
                      htmlData += '<td>'+datasize+' '+catsize+'</td>';
                  } else {
                      htmlData += '<td>none</td>';
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
            }

              function startTimer() {
                getStatusData();
                setInterval(getStatusData, 1000);  
            }
              
               

            </script>   
            </head>
            <body onload="startTimer()">
            <div id="status"></div>
            <div id="snackbar">Some text some message..</div>
            `
        /*
            <table>
            <tr>
              <th>PID</th>
              <th>URL</th>
              <th>Output</th>
              <th>Endpoint</th>
              <th>Client</th>
              <th>Data Transferred</th>
              <th>User</th>
              <th>Command</th>
              <th></th>
           </tr>`;
           */
        /*
    processes.forEach(function(table) {
        datasize = table.dataSize;
        if (datasize > 1024) {
            datasize = datasize / 1024;
            catsize = 'MB';
        }
        if (datasize > 1024) {
            datasize = datasize / 1024;
            catsize = 'GB';
        }
        datasize = datasize.toFixed(3);
        data += `<tr>`
        if (table.childprocess.length == 0) {
            data += `<td>${table.PID}</td>`
        } else {
            data += `<td><a href="./status/${table.PID}">${table.PID}</a></td>`
        }
        data += `<td>${table.url}</td>`

        if (table.streamlinkserver == true) {
            data += `<td>http://${os.hostname}:${table.streamArgs}</td>`
        } else if (table.restream == true) {
            data += `<td>${table.streamArgs}</td>`
        } else {
            data += `<td>${req.ip}</td>`
        }

        data += `<td>${table.endpoint}</td>`
        data += `<td>${table.clientIP}</td>`
        if (table.streamlinkserver == false && table.restream == false) {
            data += `<td>${datasize} ${catsize}</td>`
        } else {
            data += "<td>none</td>";
        }

        data += `<td>${table.user}</td>`
        data += `<td>${table.command}</td>`
        data += `<td><button onclick="killProcess(${table.PID})" id="killbutton">kill process</button></td>`
        data += `</tr>`;
    })


    data += `</table>
             </body>
            </html>`;
    */
    res.send(data);
})

app.get('/status/*', (req, res) => {
    var pidtoSee = req.path;
    var data = "";
    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
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


app.get('/', (req, res) => {
    res.redirect("/about");
});

// help page, captured from github pages
app.get('/about', async function(req, res) {
    const port = getPortCalled(req)
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

            data = data.replace(serverreplacer, req.hostname);
            data = data.replace(portreplacer, port);
            data = data.replace(localhostreplacer, req.hostname + ":" + port);
            res.send(data);
        });

    }).on("error", (err) => {
        log("Error: " + err.message);

    });

});




var server = app.listen(config.port);









/********************************************************************************************************************************/
/*                                       F U N C T I O N S                                                                      */
/*******************************************************************************************************************************/


// Load configuration
function loadconfig() {
    config = {};
    try {
        const fs = require("fs");
        const jsonString = fs.readFileSync("./streamproxy.config.json");
        config = JSON.parse(jsonString);

    } catch (err) {

        //console.log("error on loading configfile: " + err)

        config = { port: 4211, logConsole: true, logWeb: false, showErrorInStream: false, streamlinkpath: "", ffmpegpath: "", ffmpeg: { codec: "mpeg2video", format: "mpegts", serviceprovider: "streamproxy" } };


        const fswrite = require("fs");
        try {
            var configstr = JSON.stringify(config);
            //console.log("recording configuration file");
            fswrite.writeFileSync("./streamproxy.config.json", configstr);
        } catch (err) {
            //console.log("error on recording configuration file: " + err);
        }

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

    if (config.logConsole == undefined) {
        config.logConsole = true;
    }

    if (config.logWeb == undefined) {
        config.logWeb = false;
    }

    if (config.showErrorInStream == undefined) {
        config.showErrorInStream = false;
    }

    //if (config.ffmpeg.servicename == undefined) {
    //    config.ffmpeg.servicename = "service01";
    //}



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
    var useragent = req.headers["user-agent"];
    //console("stream server type: " + streamservertype);
    //console("stream args: " + streamserverArgs);
    switch (streamservertype) {
        case "streamlinkServer":
            streamlinkserver = true;
            break;
        case "restream":
            restream = true;
            break;
        case "streamserver":
            isStreamServer = true;
            //streamserver = streamserverArgs;
    }


    spawncommand = spawncommand.toString();
    spawncommand = spawncommand.replace(/,/g, ' ');
    log("added process " + PID + " to status");
    processes.push({ url: req.query.url, PID: PID, childprocess: childprocesses, clientIP: req.ip, endpoint: req.path, command: spawncommand, dataSize: 0, user: user, streamlinkserver: streamlinkserver, restream: restream, isStreamServer: isStreamServer, streamArgs: streamserverArgs, client: { ip: req.ip, isMobile: req.useragent.isMobile, isPhone: req.useragent.isPhone, isAndroid: req.useragent.isAndroid, isDesktop: req.useragent.isDesktop, isLinux: req.useragent.isLinux, isWindows: req.useragent.isWindows, isBot: req.useragent.isBot, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, platform: req.useragent.platform, source: req.useragent.source } });

}

// remove process
function removeprocess(PID) {
    log("remove process " + PID + " from status");
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

function setDataSize(PID, data) {
    var objIndex = processes.findIndex(obj => obj.PID == PID);

    if (objIndex > -1) {

        processes[objIndex].dataSize = processes[objIndex].dataSize + data.length / 1024;
    }
}




function basicAuth(req, res) {
    if (config.basicAuthentication == undefined) {
        return { authenticated: true, user: undefined, auth: undefined };
    }
    if (config.basicAuthentication.active != true) {
        return { authenticated: true, user: undefined, auth: undefined };
    }
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    authdataconfig = config.basicAuthentication.users.find(item => item.username == login)
    if (authdataconfig != undefined) {

        if (authdataconfig.password == password) { // login successfully
            return { authenticated: true, user: login, auth: b64auth };
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
            //command = "pgrep -P " + PID;
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
    //arrstreamserver = arrstreamserver.filter(val => val.PID != parentPID);
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

    const stream = spawn(config.streamlinkpath + "streamlink", ['--player-continuous-http', '--player-external-http-port', port, '--player-external-http', url, 'best']);


    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        //console.log("to string " + spawncommand.toString());
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
    //ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel fatal ${bgimagestr} -f lavfi  -i color=size=${size}:rate=25:color=${bgcolor}  -vf "drawtext=fontfile=${font}:fontsize=${fontsize}:fontcolor=${fontcolor}:x=(w-text_w)/2:y=(h-text_h)/2:text='${text}'" -c:a copy -shortest -tune zerolatency -f ${format} -`;
    ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel error  ${bgimagestr} ${textstr} -c:v libx264  -t 30  -f ${format} -`;

    //console.log("ffmpeg command for errordisplay: " + ffmpegcomm);
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

    //return ffmpegDisplayText(separatedtext[0]);
    ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel error -loop 1 -f image2 -i ./resources/nosignal.jpg -c:v libx264 -t 50 -f h264 -`;
    //ffmpegcomm = `${config.ffmpegpath}ffmpeg -loglevel error -loop 1 -f image2 -i ./resources/nosignal.jpg -f lavfi  -i color=size=1280x720:rate=25:color=blue  -vf "drawtext=fontfile=/path/to/font.ttf:fontsize=25:fontcolor=white:box=1:boxcolor=black:x=(w-text_w)/2:y=(h-text_h)/2:text='teste123'"-c:v libx264 -t 50 -f h264 -`;
    console.log("ffmpeg command for errordisplay: " + ffmpegcomm);
    if (os.platform() == 'win32') {
        return spawn(ffmpegcomm, { shell: 'powershell.exe' });
    } else {
        return spawn(ffmpegcomm, { shell: true });
    }
    //texttodisplay = texttodisplay.replace(/\r/g, " ");
    //texttodisplay = texttodisplay.substring(0, 166)

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



    if (checkToken(req, res) == false) {
        return false;
    };





    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
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


    if (streamServerExist(streamserver) == true) {
        res.status(500).send(`<h2> the stream server ${streamserver} already exists!</h2>`);
        return false;
    }

    if ((config.showErrorInStream == true || req.query.showerrorinstream == 'true') && noDisplayErrorInStream == false && isStreamServer == false) {
        showErrorInStream = true;
        log("Show error in stream is enabled");
    }

    appsetheader(res);
    /*
    if (isStreamServer == true) {
        
        streamcheck = checkstream(url);
        if (streamcheck.streamstatus == 'online') {
            html += `<h1>Stream Server created successfully</h1><br>
                <p></p>
                <p> to play this stream, add the url http://${req.hostname}:${getPortCalled(req)}/play/${streamserver} in your IPTV app</p>
                <p> ex: ffplay http://${req.hostname}:${getPortCalled(req)}/play/${streamserver}</p>
                <p> you can also download a playlist with all stream serves created from <a href="http://${req.hostname}:${getPortCalled(req)}/streamserver/playlist.m3u">http://${req.hostname}:${getPortCalled(req)}/streamserver/playlist.m3u</a>`
            res.send(html);

        } else {
            html += `<h1>Stream Server creation not successfully</h1><br>
                <p></p>
                <p> Message returned on check stream: <b><font color="red">${streamcheck.mensagem}</font></b></p>
                `
            res.send(html);
        }

    }
*/
    announceStreaming(url);
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;

    log(`opening connect to stream in url ${url} from ${clientIP}`);

    stream = spawn;

    if (showErrorInStream == false && isStreamServer == false) {
        stream.stdout.pipe(res);
    }
    //stream.stdout.pipe(tunnel);
    //res.send("tunnel criado");

    stream.stderr.pipe(process.stderr);

    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization

        databuf = { header: [], data: undefined };
        //console.log("to string " + spawncommand.toString());
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

        /*
        if (isStreamServer == true) {
            arrstreamserver.push({ PID: stream.pid, servername: streamserver, serverdescription: decodeURI(serverdescription), chnumber: chnumber, tunnel: tunnel })
        }
*/

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
        removeStreamServer(stream.pid);


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
                arrstreamserver.push({ PID: stream.pid, servername: streamserver, serverdescription: decodeURI(serverdescription), chnumber: chnumber, radio: radio, tunnel: tunnel })
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
        removeStreamServer(stream.pid);
        //console.log("has error: " + haserror);
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
            res.send(html);
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
        removeStreamServer(stream.pid);

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
    var findstreamservername = arrstreamserver.filter(val => val.streamname == streamservername);
    if (findstreamservername.length > 0) {
        return true;
    } else {
        return false;
    }
}

function removeStreamServer(PID) {
    arrstreamserver = arrstreamserver.filter(val => val.PID !== PID)
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
    var theprocess = processes.filter(val => val.isStreamServer == true && val.streamArgs == streamname);
    streamserverstatus.push({ UUID: UUID, streamname: streamname, pid: theprocess[0].PID, user: auth.user, client: { ip: req.ip, isMobile: req.useragent.isMobile, isPhone: req.useragent.isPhone, isAndroid: req.useragent.isAndroid, isDesktop: req.useragent.isDesktop, isLinux: req.useragent.isLinux, isWindows: req.useragent.isWindows, isBot: req.useragent.isBot, browser: req.useragent.browser, version: req.useragent.version, os: req.useragent.os, platform: req.useragent.platform, source: req.useragent.source } })

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