const { spawn } = require('child_process');
const express = require('express');


const app = express();
var portlisten = process.argv[2];
var streamlinkapp = "streamlink";
var ffmpegapp = "ffmpeg";
var ippublic = "";
var publicip = "44";

//ippublic = getPublicIP();
//console.log("public ip: " + ippublic);
//announceServers();
if (process.argv[3] != undefined) {
    streamlinkapp = process.argv[3];
}

/*
if (process.argv[4] != undefined) {
    ffmpegapp = process.argv[4];
}
*/
//portlisten = portlisten.toString();
if (portlisten == undefined) {
    portlisten = 3000;
}

console.log("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2557   \u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u255A\u2588\u2588\u2557\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2557 \u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551    \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551 \u255A\u2588\u2588\u2588\u2554\u255D  \u255A\u2588\u2588\u2588\u2588\u2554\u255D \r\n\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551\u255A\u2588\u2588\u2554\u255D\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551 \u2588\u2588\u2554\u2588\u2588\u2557   \u255A\u2588\u2588\u2554\u255D  \r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551 \u255A\u2550\u255D \u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2554\u255D \u2588\u2588\u2557   \u2588\u2588\u2551   \r\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u255D     \u255A\u2550\u255D    \u255A\u2550\u255D     \u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   ");
console.log("                                         A Proxy for the livestreams         ")
console.log("                                     Developed by Alexander Sabino in 2022   ")



console.log("");
console.log("starting...")
console.log("");
console.log("streamproxy is listening on port ", portlisten)
app.get('/videostream/streamlink', (req, res) => {
    url = req.query.url;
    //const stream = spawn('streamlink', url + '  best --stdout 2> /dev/null');
    const stream = spawn(streamlinkapp, [url, 'best', '--stdout']);
    //const stream = spawn('testenumbershow');
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
});

app.get('/videostream/ffmpeg', (req, res) => {
    url = req.query.url;
    //const stream = spawn('streamlink', url + '  best --stdout 2> /dev/null');
    ///usr/bin/ffmpeg -loglevel fatal -i " . $_GET['url'] . " -vcodec mpeg2video -acodec aac -b 15000k  -strict -2 -mbd rd -copyinkf -flags +ilme+ildct -fflags +genpts -metadata service_provider=" . $_GET['provider'] . " -metadata service_name=" . $_GET['service'] . " -f mpegts -tune zerolatency - 2> /dev/null";
    const stream = spawn('ffmpeg', ['-loglevel', 'fatal', '-i', url, '-vcodec', 'mpeg2video', '-acodec', 'aac', '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-metadata', 'service_provider=streamproxy', '-f', 'mpegts', '-tune', 'zerolatency', '-']);
    //const stream = spawn('testenumbershow');
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    //console.log(stream);

    /* check if stream is offline */
    /*
     stream.on('exit', function(code) {
         //console.log('child exit code (spawn)', code);
         if (code == 1) {
             console.log("exit code: ", code);
             const stream3 = spawn('ffmpeg', ['-loglevel', 'fatal', '-i', 'http://api.new.livestream.com:80/accounts/5381476/events/8947634/live.m3u8', '-vcodec', 'mpeg2video', '-acodec', 'aac', '-b', '15000k', '-strict', '-2', '-mbd', 'rd', '-copyinkf', '-flags', '+ilme+ildct', '-fflags', '+genpts', '-f', 'mpegts', '-tune', 'zerolatency', '-']);
             //const stream = spawn('testenumbershow');
             stream3.stdout.pipe(res);
             stream3.stderr.pipe(process.stderr);
         }
     });

     stream.on('spawn', function(data) {
         console.log("data in");
         stream.stdout.pipe(res);
     })
    */

});

/*
app.get('/videostream/info', (req, res) => {
    url = req.query.url;
    //const stream = spawn('streamlink', url + '  best --stdout 2> /dev/null');
    const stream = spawn('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', url]);
    //const stream = spawn('ffprobe', '-v quiet -print_format json -show_format -show_streams ' + url);
    //const stream = spawn('testenumbershow');
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
});
*/

app.get('/videostream/info', (req, res) => {
    url = req.query.url;
    var returncommand = "";
    var commandffmpeg = "ffprobe -v quiet -print_format json -show_format -show_streams " + url;
    var status = "";
    var erro = "";

    try {
        var child_process = require("child_process");
        var returncommand = child_process.execSync(commandffmpeg);
        //console.log("return command: " + returncommand);
        res.setHeader('content-type', 'application/json');
        res.send(returncommand);
    } catch (e) {
        //console.log("error: ",e.message,"\n");
        status = "offline";
        erro = e.message;
        res.json({ error: "true", message: e.message });
    }
    //res.json({ streamurl: url, streamstatus: status, mensagem: erro });
});

app.get('/videostream/checkstream', (req, res) => {
    url = req.query.url;
    var commandffmpeg = "ffmpeg -ss 00:00:01 -i \"" + url + "\" -vframes 1 -q:v 2 -f null -";
    var status = "";
    var erro = "";

    try {
        retunrcommand = require('child_process').execSync(commandffmpeg);
        status = "online";
    } catch (e) {
        //console.log("error: ",e.message,"\n");
        status = "offline";
        erro = e.message;
    }
    res.json({ streamurl: url, streamstatus: status, mensagem: erro });
});

app.get('/', (req, res) => {
    res.send('<h1>Stream Get<h1><br><br>See asabino2/streamget in docker hub for more info')
});

/*
 var commandffmpeg = "ffmpeg -ss 00:00:01 -i \"" + fbResponse[i].streamurl + "\" -vframes 1 -q:v 2 -f null -";
            var status = "";
            var returncommand = "";
            //commandffmpeg = commandffmpeg.replace("&","\"&\"");
            var commandrm = "rm ./screenshots/" + fbResponse[i].channelgroup + "_" + fbResponse[i].channel_peso + ".jpg";
            console.log("**** channel_group:", fbResponse[i].channelgroup, "channel_peso:", fbResponse[i].channel_peso, "name: ", fbResponse[i].descricao, " ****");

            console.log("ffmpeg command: ", commandffmpeg, "\n");

            try {
                retunrcommand = require('child_process').execSync(commandffmpeg);
                status = "sucesso";
            } catch (e) {
                //console.log("error: ",e.message,"\n");
                status = "erro";
            }
*/

/* not working
app.get('/videostream/getscreenshot', (req, res) => {
    url = req.query.url;
    //const stream = spawn('streamlink', url + '  best --stdout 2> /dev/null');
    const stream = spawn('ffmpeg', ['-ss', '00:00:01', '-i', url, '-vframes', '1', '-q:v', '2', '-f', 'jpg', '-tune', 'zerolatency', '-']);
    //const stream = spawn('testenumbershow');
    res.setHeader("Content-type", "application/jpg");
    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
});
*/

app.get('/info', (req, res) => {
    res.json({ teste: "true" });
});



app.listen(portlisten);

function announceServers() {
    var http = require('http');
    //console.log("valor do publicip: " + publicip);
    http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function(resp) {
        resp.on('data', function(ip) {
            //console.log("My public IP address is: " + ip);
            publicip = ip;
            //console.log("valor do publicip: " + publicip);
            console.log("server on internet http://" + publicip + ":" + portlisten + "/");
        });
    });
    //console.log("return: " + publicip);
    //return publicip;
}