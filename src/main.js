/********************************************/
/* Stream Proxy - A Proxy for a Livestream  */
/* Desenvolvido por Alexander Sabino        */
/********************************************/

const { spawn } = require('child_process');
const express = require('express');
const os = require('os');
var config = {};
var processes = [];
var databuf = { header: [{ bytes: [] }], data: undefined };
var databufheaderlen = 4;
var mydatabuf = undefined;

var debug = { PID: 0, url: "", endpoint: "", remoteIP: "", app: "", command: "", statusExec: "", lastEvent: "", exitCode: "", exitSignal: "", message: "", lastError: "", lastConsoleData: { stdErr: "", stdin: "" } };
var pageTitle = "";
//var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { application, response } = require('express');


loadconfig();
// Initialization of variables
const app = express();
var portlisten = process.argv[2];
var ippublic = "";
var publicip = "44";





app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

var pjson = require('../package.json');
console.log(pjson.version);


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


// Service for streamlink stream proxy
app.get('/videostream/streamlink', (req, res) => {
    var bufcount = 0;

    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }


    appsetheader(res);
    var clientIP = req.ip;
    url = req.query.url;
    announceStreaming(url);
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url
    console.log(`opening connect to stream in url ${url} from ${clientIP}`);

    const stream = spawn(config.streamlinkpath + "streamlink", [url, 'best', '--stdout']);
    stream.stdout.pipe(res);

    stream.stderr.pipe(process.stderr);

    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization

        databuf = { header: [], data: undefined };
        //console.log("to string " + spawncommand.toString());
        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        addprocess(req, stream, auth.user, 0)
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
        /*
                if (databuf.header.length < databufheaderlen) {

                    databuf.header.push({ bytes: data });
                } else {

                    //console.log("linhas atuais: " + databuf.data.length);
                    //console.log("databuf atual: " + databuf.toString);
                    databuf.data = data;
                    //console.log("databuf shifted: " + databuf.data.shift());
                    // console.log("databuf not shifted: " + databuf.data);
                    //console.log("databuf depois: " + databuf);

                    //databuf.data.push({ bytes: data });

                }
        */


        //bufcount++;
        //console.log("databuf header length: " + databuf.header.length);
        //console.log("databuf data length: " + databuf.data.length);
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
            //stream.kill();
        killProcesses(stream.pid);
    })

});




app.get('/videostream/ffmpeg', (req, res) => {
    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);
    url = req.query.url;
    announceStreaming(url);
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

        addprocess(req, stream, auth.user, 0)
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

    stream.stdout.on('data', (data) => {

        setDataSize(stream.pid, data);
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

        removeprocess(stream.pid);
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
        removeprocess(stream.pid);
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
        killProcesses(stream.pid);
    })


});


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
});

app.get('/info2', (req, res) => {
    res.send(databuf);
})


app.post('/killProcess', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');

    console.log("kill process " + req.body.PID + " requested from IP " + req.ip);

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
    basicAuth(req, res);
    try {
        killProcesses(req.body.PID);
        res.status(200).send("requested the SO to kill process " + req.body.PID);
    } catch (e) {
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

/*
app.get('/teste', (req, res) => {
    //res.status(900).send(JSON.stringify(processes));
    while (actualstream != null) {
        res.send(actualstream);
    }
});
*/

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
                try{
                    killProcessHTML = fetch('/killProcess', {
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

            </script>   
            </head>
            <body>
            <div id="snackbar">Some text some message..</div>
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
    res.send(data);
})

app.get('/status/*', (req, res) => {
    var pidtoSee = req.path;
    var data = "";
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
    var PIDOffset = 0;
    var command = "";
    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);

    url = req.query.url;
    announceStreaming(url);
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







    if (runner == undefined) {
        if (checkIfstreamlinkCanHandle(url) == true) {
            runner = "streamlink"
            console.log("System selected the runner " + runner);
            PIDOffset = 1;
        } else {
            runner = "ffmpeg"
            console.log("System selected the runner " + runner);
            PIDOffset = 0;
        }
    }


    switch (runner) {
        case "streamlink":
            console.log(`opening connect to stream in url ${url} for audiconverter with streamlink and ffmpeg (from ${clientIP})`);
            if (os.platform != "win32") {
                command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + ' -'
            } else {
                command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + '  -'
            }

            break;
        case "ffmpeg":
            console.log(`opening connect to stream in url ${url} for audiconverter with ffmpeg (from ${clientIP})`);
            command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' -c:v none -c:a libmp3lame -b:a 128k -joint_stereo 0 -y -f mp3 ' + metadata + '  -'

            break;
        default:
            console.log("runner " + runner + " is invalid");
            res.status(500).send("invalid runner");
            return false;
    }
    if (os.platform == 'win32') {
        stream = spawn(command, { shell: 'powershell.exe' });
    } else {
        stream = spawn(command, { shell: true });
    }








    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');

        addprocess(req, stream, auth.user, PIDOffset)
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
        console.log(`error ocurred: ${err}`);
        debug.lastError = err;
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)

    })

    stream.on('message', (message, sendHandle) => {
        console.log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        console.log(`closed connection of url ${url}`);
        removeprocess(stream.pid);
        //stream.kill();
        killProcesses(stream.pid);

    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});



//videostream play
app.get('/videostream/play', (req, res) => {
    var command = "";
    if (checkToken(req, res) == false) {
        return false;
    };

    var auth = basicAuth(req, res);
    if (auth.authenticated == false) {
        return false;
    }

    appsetheader(res);

    url = req.query.url;
    announceStreaming(url);
    url = encodeURI(url); // prevent Remote Code Execution via arbitrary command in url



    var clientIP = req.ip;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;
    var metadata = "";





    command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg -loglevel fatal -i pipe:0 -vcodec ' + config.ffmpeg.codec + ' -acodec aac -b 15000k -strict -2 -mbd rd -copyinkf -flags +ilme+ildct -fflags +genpts -metadata service_provider="' + config.ffmpeg.serviceprovider + '" -f ' + config.ffmpeg.format + ' -tune zerolatency -'










    console.log(`opening connect to stream in url ${url} for audiconverter with streamlink and ffmpeg (from ${clientIP})`);
    if (os.platform == 'win32') {
        res.status(400).send("this endpoint is not compatible with windows, use linux instead");
        return false;
        stream = spawn('"' + command + '"', { shell: 'powershell.exe' });
    } else {
        stream = spawn(command, { shell: true });
    }












    stream.stdout.pipe(res);
    stream.stderr.pipe(process.stderr);
    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');

        addprocess(req, stream, auth.user, 1)
        console.log(`running ffmpeg app (PID ${stream.pid}) [${spawncommand}]`);
        debug.PID = stream.pid;
        debug.app = "videostreamplay";
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
        debug.app = "videostreamplay";
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
        debug.app = "videostreamplay";
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
        debug.app = "videostreamplay";
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

        removeprocess(stream.pid);
        //stream.kill();
        killProcesses(stream.pid);


    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});


app.get('/streamserver/create', (req, res) => {
    var auth = basicAuth(req, res);
    var port = req.query.port;
    if (port == undefined) {
        port = config.port + 1;
    }
    if (auth.authenticated == false) {
        return false;
    }

    streamlinkHTTPServer(req, res, auth, port);
    res.send(`<h2>server created, see it in http://${os.hostname}:${port}</h2>`)
})


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
    console.log("*** restream " + url + " to " + output);
    console.log("you selected the runner " + runner)
    var stream = "";


    var clientIP = req.ip;
    debug.remoteIP = req.ip;
    debug.endpoint = req.path;








    if (runner == undefined) {
        if (checkIfstreamlinkCanHandle(url) == true) {
            runner = "streamlink"
            console.log("System selected the runner " + runner);
            PIDOffset = 1;
        } else {
            runner = "ffmpeg"
            console.log("System selected the runner " + runner);
            PIDOffset = 0;
        }
    }


    switch (runner) {
        case "streamlink":
            console.log(`opening connect for restream ${url} to ${output} with streamlink and ffmpeg (from ${clientIP})`);
            if (os.platform != "win32") {
                command = config.streamlinkpath + 'streamlink ' + url + ' best --stdout | ' + config.ffmpegpath + 'ffmpeg  -loglevel error -i pipe:0 -f ' + format + ' ' + output;
            } else {
                command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' ' + vcodec + ' ' + acodec + '  -f ' + format + ' ' + output;
            }

            break;
        case "ffmpeg":
            console.log(`opening connect for restream ${url} to ${output} with ffmpeg (from ${clientIP})`);
            command = config.ffmpegpath + 'ffmpeg  -loglevel error -i ' + url + ' ' + vcodec + ' ' + acodec + '  -f ' + format + ' ' + output;

            break;
        default:
            console.log("runner " + runner + " is invalid");
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
        console.log(`error ocurred: ${err}`);
        debug.lastError = err;
        res.status(500).send("<h2>Error on calling ffmpeg app</h2><br>" + err)

    })

    stream.on('message', (message, sendHandle) => {
        console.log(`message: ${message}`);
    })

    req.on('close', () => { // on connection close, kill PID of app
        // console.log(`closed connection of url ${url}`);
        //  removeprocess(stream.pid);
        //stream.kill();
        // killProcesses(stream.pid);

    })

    stream.stderr.on('data', (data) => {
        debug.lastConsoleData.stdErr = data.toString();
    })

    stream.stdin.on('data', (data) => {
        debug.lastConsoleData.stdin = data.toString();
    })


});


var server = app.listen(config.port);



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
function addprocess(req, spawn, user, streamservertype, streamserverArgs) {
    var spawncommand = spawn.spawnargs;
    var PID = spawn.pid; // to do: use command pgrep -P PID para ver todos os processos subsequentes
    var childprocesses = getChildProcess(spawn.pid);
    var streamlinkserver = false;
    var restream = false;
    //console("stream server type: " + streamservertype);
    //console("stream args: " + streamserverArgs);
    switch (streamservertype) {
        case "streamlinkServer":
            streamlinkserver = true;
            break;
        case "restream":
            restream = true;
            break;
    }


    spawncommand = spawncommand.toString();
    spawncommand = spawncommand.replace(/,/g, ' ');
    console.log("added process " + PID + " to status");
    processes.push({ url: req.query.url, PID: PID, childprocess: childprocesses, clientIP: req.ip, endpoint: req.path, command: spawncommand, dataSize: 0, user: user, streamlinkserver: streamlinkserver, restream: restream, streamArgs: streamserverArgs });

}

// remove process
function removeprocess(PID) {
    console.log("remove process " + PID + " from status");
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

    if (childprocesses.length > 0) {
        childprocesses.forEach((pid) => {
            process.kill(pid.pid);
            console.log("process " + pid.pid + " killed");
        })


    };
    try {
        process.kill(parentPID);
        console.log("process " + parentPID + " killed");
    } catch (e) {}
}

function announceStreaming(url) {
    console.log("");
    console.log("");
    console.log("*******************************************************************************************************");
    console.log(url);
    console.log("*******************************************************************************************************");
    console.log("");
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
    console.log(`opening connect to server stream in url ${url} from ${clientIP}`);

    const stream = spawn(config.streamlinkpath + "streamlink", ['--player-continuous-http', '--player-external-http-port', port, '--player-external-http', url, 'best']);


    var spawncommand = stream.spawnargs;
    stream.on('spawn', () => { // on app initialization


        //console.log("to string " + spawncommand.toString());
        spawncommand = spawncommand.toString();
        spawncommand = spawncommand.replace(/,/g, ' ');
        addprocess(req, stream, auth.user, "streamlinkServer", port)
        console.log(`running streamlink server app (PID ${stream.pid}) [${spawncommand}]`);
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
        //console.log(`closed connection of url ${url}`);
        //console.log(`kill PID ${stream.pid} of program streamlink`)
        //stream.kill();
        //killProcesses(stream.pid);
    })
}