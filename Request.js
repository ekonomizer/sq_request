'use strict';
const http = require('http');
const https = require('https');
const Querystring = require('querystring');

let log = {
    debug: function() {},
    warn: function() {}
};

let binds = {};

class bind {
    constructor(type, params, catcher) {
        this.type = type;
        this.params = params;
        this.catcher = catcher;
    }

    run(params) {
        if (typeof params !== 'object')
            return new Error("params isn't object");

        let bind;
        Object.assign(this.params, params);

        switch (this.type) {
            case 'sendPost':
                bind = Request.sendPost(params.host, params.path, params.params, params.port, params.json, params.useHttps);
                break;
            case 'sendSignedGet':
                bind = Request.sendSignedGet(params.host, params.path, params.sig, params.params);
                break;
        }

        if (this.catcher) {
            bind.catch((err) => {this.catcher(err)});
        }
    }
}

class Request {
    static initLogs(debug, warn) {
        if (typeof debug === 'function')
            log.debug = debug;

        if (typeof warn === 'function')
            log.warn = warn;
    }

    static createBind(name, type, params, catcher) {
        binds[name] = new bind(type, params, catcher);
    }

    static get binds() {
        return binds;
    }

    static sendPost(host, path, params, port, json = true, useHttps=true) {
        return new Promise((resolve, reject) => {
            log.debug("Send Post", {host, port, path, params, json, useHttps});

            var type;
            var postData;
            if (json) {
                type = "application/json";
                postData = JSON.stringify(params)
            } else {
                type = "application/x-www-form-urlencoded";
                postData = Querystring.stringify(params)
            }

            var postOptions = {
                host: host, //'closure-compiler.appspot.com'
                path: path,  //'/compile'
                method: 'POST',
                headers: {
                    'Content-Type': type,
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            if (port)
                postOptions.port = port;

            log.debug('postOptions', postOptions);

            let protocol = useHttps? https : http;
            let postReq = protocol.request(postOptions, (res)=> {
                res.setEncoding('utf8');
                res.once('data', (chunk)=> {
                    log.debug("Remote host response", {chunk: chunk});
                    resolve(chunk);
                });
                res.once('end', ()=> {
                    log.debug('No more data in response.');
                    res.removeAllListeners();
                })
            });

            postReq.on('error', (e)=> {
                log.warn("Problem with request", {err: e});
                postReq.removeAllListeners();
                reject(e);
            });

            postReq.on('response', ()=> {
                postReq.removeAllListeners();
            });

            postReq.write(postData);
            postReq.end();
        })
    }

    static sendSignedGet(host, path, sig, params) {
        return new Promise((resolve, reject) => {
            var sigParams = "";
            var urlParams = "";

            for (let k in params) {
                sigParams += `${k}=${params[k]}`;
                if (urlParams != "")
                    urlParams += `&${k}=${params[k]}`;
                else
                    urlParams += `${k}=${params[k]}`
            }
            path += urlParams + `&sig=${sig}`;

            let reqOptions = {host, path};

            let postReq = http.request(reqOptions, (res)=> {
                res.setEncoding('utf8');
                res.once('data', (chunk)=> {
                    log.debug("Remote host response", {chunk: chunk});
                    resolve(chunk);
                });
                res.once('end', ()=> {
                    log.debug('No more data in response.');
                    res.removeAllListeners();
                })
            });
            postReq.on('error', (e)=> {
                log.warn("Problem with request", {err: e});
                postReq.removeAllListeners();
                reject(e);
            });

            postReq.on('response', ()=> {
                postReq.removeAllListeners();
            });

            postReq.end();
        });
    }
}

module.exports = Request;