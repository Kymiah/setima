const utils = require("./modules/utils");
const conns = require("./configs/conns");
const routdata = require("./configs/routes-data");
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const MemoryStore = require('memorystore')(session);
const app = express();
/*
var NoIP = require('no-ip')

var noip = new NoIP({
  hostname: 'setima.ddns.net',
  user: 'thiagodslr@hotmail.com',
  pass: 'Rk164803'
})

noip.on('error', function(err){
  console.log(err)
})

noip.on('success', function(isChanged, ip){
  console.log(isChanged, ip)
})



noip.update() // Manual update, you can also provide a custom IP address

 noip.start() // start an automatic renewal every 1h by default or provide a custom ms.
// noip.stop() // stop the previously started automatic update
*/
//// Errors
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

//// Start App
var server = require("http").createServer(app);
server.listen(conns.server.port,"0.0.0.0");
exports.server = server;
exports.app = app;

// upload
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

//// Session
// app.set('trust proxy', 1); // trust first proxy
// app.use(session({
//   secret : 's3Cur3',
//   name : 'sessionId',
//   resave: false,
//   saveUninitialized: true,
//   //cookie: { secure: true }
//   cookie: {
//     //secure: true,
//     httpOnly: true,
//     //domain: '127.0.0.1:9000',
//     //path: '/',
//     expires: new Date(new Date().getTime() + 1000*60*60*24)
//   }
// }));
// app.disable('x-powered-by');

/*var SESSION_SECRET = "keycat";
exports.SESSION_SECRET = SESSION_SECRET;
var sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
});
exports.sessionStore = sessionStore;
//app.use(cookieParser(SESSION_SECRET, {}));
app.use(session({
    store: sessionStore,
    secret: SESSION_SECRET,
    name: 'connect.sid',
    key: 'connect.sid',
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false }
}));*/

//// Start Body Parser
app.use(bodyParser.json({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

//// Start Pug
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));

app.locals.basedir = path.join(__dirname, 'views');
app.locals.global = routdata.global;

//// Start Routes
require('./configs/routes');

//// Start Mysql
const mysql = require("./modules/mysql");

//// Start MongoDB
//require("./modules/mongo");

//// Start Socket IO
//require("./modules/socketio");

//// Start AMI
//require("./modules/ami");

//// Start AGI
//require("./modules/agi");

//// Start Asterisk
//require("./modules/asterisk-writer");

//// Start Siptrace
//require("./modules/monitoring/siptrace");

//// Dominus Settings
//exports.settings = null;
//(async function(){ exports.settings = await mysql.dominus.selectFirst("settings", "*", {id: 1}); console.log("settings: "+JSON.stringify(exports.settings)); })();

//// Criação automática de pastas
//if(!fs.existsSync("views/files"))
  //fs.mkdirSync("views/files");
//if(!fs.existsSync("views/files/audios"))