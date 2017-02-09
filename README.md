# sq_request
## Description
Util for send http and https post and signed get request.
## Usage
###Install module
```
npm install sq_request
```
###Use
```
let request = requiere('sq_request');

request.sendPost(host, path, params, port, json, useHttps); 
//return Promise (resolve = result, reject = error)
```
## Requirements
A javascript module sq_request need http, https, querystring modules.
## API
You can init logs for your request. First param for debug message, second for error message.
```
request.initLogs(console.log, console.info);
```
You can create bind for your request.
```
/*
name - name of your bind
type - type of your request ('sendPost, sendSignedGet')
params - params object for request
catcher - function, wich will be catch errors
*/
request.createBind(name, type, params, catcher);
```
For run your bind request use:
```
//new params merge with old params
request.createBind(params);
```
For send post request use:
```
/*
addres = host:port + path
json - if true set mode json for params
https - if true set mode https for request
*/
request.sendPost(host, path, params, port, json, useHttps)
```
For send signed get request use:
```
request.sendSignedGet(host, path, sig, params)
```
For see all of your binds use:
```
request.binds
```
## License
The JavaScript MD5 script is released under the MIT license.
