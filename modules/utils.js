const Cookie = require('cookie');
const CookieParser = require('cookie-parser');
const server = require('../index');

//// Object
global.extractValues = function(obj){
    var d = {};
    for(var i=1; i<arguments.length; i++){
        if(arguments[i] in obj)
            d[arguments[i]] = obj[arguments[i]];
    }
    return d;
};

//// Is None / Is Empty
global.isNone = function(v){
    return v == null || v == undefined;
};
global.isEmpty = function(v){
    return v == null || v == undefined || v == "" || v == 0;
};

//// Form
global.extractFormData = function(req){
    var data = JSON.parse(req.body ? req.body.__formData : req);
    var d = {};
    for(var i=1; i<arguments.length; i++){
        if(arguments[i] in data)
            d[arguments[i]] = data[arguments[i]];
    }
    return d;
};

//// Paths
global.ROOT_PATH = __dirname.replace("/modules", "");
console.log("root path: "+ROOT_PATH);

//// Sync Call Function
global.sync = function(func){
    return new Promise(func);
}

//// Session
global.getSessionData = function(sessionID) {
    return new Promise((resolve, reject) => {
        server.sessionStore.get(sessionID, function(err, data) {
            resolve(data);
        });
    });
}
global.extractSessionID = function(cookie) {
    if (cookie) {
        cookie = Cookie.parse(cookie);
        var sessionID = CookieParser.signedCookie(cookie['connect.sid'], server.SESSION_SECRET);
        if (cookie['connect.sid'] != sessionID)
            return sessionID;
    }
    return null;
}

//// Date
Date.isValidTimeStr = function(time){
    return time.length > 2 && new Date("2000-01-01 "+time) != "Invalid Date";
};
Date.isValidDateStr = function(date){
    return date.length > 2 && new Date(date) != "Invalid Date";
};

//// Bitwise
Number.prototype.includes = function(flag){
    return (flag & this.valueOf()) != 0;
}
Number.prototype.invert = function(flag){
    return ~this.valueOf();
}
Number.toBinary = function(){
    return (this.valueOf() >>> 0).toString(2);
}

