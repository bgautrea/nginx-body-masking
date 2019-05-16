# nginx-body-masking
Masking the request body of a payload in the access log.

## NJS - JavaScript for NGINX
First you will need to install the nginx-plus-module-njs module that enables the javascript engine

### CentOS/RHEL
```
  yum -y install nginx-plus-module-njs
```
### Ubuntu/Debian
```
  apt-get install nginx-plus-module-njs
```

## Editing the configs

### nginx.conf
There are two main edits to the nginx.conf file.
  1) load the module for njs
  2) setup a log format that will include the body.

### mask.js
mask.js has two functions. The first will extract the last parameter of the URI. This is not very intelligent currently and will not match correctly if there is a trailing slash. It just needs a little extra code to validate that the last character that it is splitting on is not the EOL. 

The second function will read if an NGINX variable is a zero. This indicates that the body should be masked. The value of the variable is derived from matching the last parameter of the URI with the KV Store.


### soap.conf
soap.conf is proxying requests on port 80 to port 30080. the server on 30080 is just responding with a SOAP formatted payload. Before proxying the request, it includes the javascript js/mask.js, it sets the nginx variable lastParam to whatever it finds as the last paramter, it sets a variable to the value of what it finds in the kv store for the lastParam, then sets a variable $body to the the output of the maskRequestBody function in the mask.js javascript. 

Finally when it proxies the request, it uses the logformat that was defined in the nginx.conf for the masked.log file.


### api.conf
api.conf enables the NGINX Plus API on port 8080 and sets it to read/write. This is necessary to enable the KV store. It also exposes the NGINX Plus dashboard.

## Usage

### Add an entry to the kv store, make a POST request to the kvstore endpoint

```
   curl -X POST -d '{"billing": 0}' http://<IP of NGINX>:8080/api/4/http/keyvals/mask
```

### Test any endpoint aside from billing:
```
   curl -X POST -H "Content-Type: text/soap+xml" -d '<?xml version="1.0"?>

<soap:Envelope
xmlns:soap="http://www.w3.org/2003/05/soap-envelope/"
soap:encodingStyle="http://www.w3.org/2003/05/soap-encoding">

<soap:Body xmlns:m="http://www.example.org/stock">
  <m:GetStockPrice>
    <m:StockName>IBM</m:StockName>
  </m:GetStockPrice>
</soap:Body>

</soap:Envelope>' http://<IP of NGINX/foo
```

### test  the billing endpoint
```
curl -X POST -H "Content-Type: text/soap+xml" -d '<?xml version="1.0"?>

<soap:Envelope
xmlns:soap="http://www.w3.org/2003/05/soap-envelope/"
soap:encodingStyle="http://www.w3.org/2003/05/soap-encoding">

<soap:Body xmlns:m="http://www.example.org/stock">
  <m:GetStockPrice>
    <m:StockName>IBM</m:StockName>
  </m:GetStockPrice>
</soap:Body>

</soap:Envelope>' http://127.0.0.1/billing
```

### Validate the logs
```
tail -5 /var/log/nginx/masked.log
```
