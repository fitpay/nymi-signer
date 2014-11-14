
var Signer = require('signer');

var nconf = require('nconf');
nconf.argv().env();
nconf.file({file: '/etc/fitpay/conf/nymi-signer-config.js'});

nconf.defaults({
    "http": {
        "address": "localhost",
        "port" : 3000
    }
});

var signer = new Signer();

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.post('/signature', function(req, res) {
    var request = req.body;

    if (request.privateKey) {
        var pk = [];
        for (var s in request.privateKey) {
            pk.unshift(request.privateKey[s].toString(16));
        }
    } else {
        res.status(400).json({"message":"privateKey is required"});
        return;
    }

    if (request.data) {
        var data = [];
        for (var i in request.data) {
            data.unshift(request.data[i].toString(16));
        }
    } else {
        res.status(400).json({"message":"data is required"});
    }

    var signatures = signer.sign(pk, data);
    var signature = signatures[0].concat(signatures[1]);

    var s="";
    for (var i in signature) {
        s = s + pad(signature[i].toString(16), 2);
    }
    console.log('signature: %s', s);

    res.json({
        "signature": signature
    });
});

app.get('/health', function(req, res) {
    res.json({'status': 'OK'});
});

var server = app.listen(nconf.get('http:port'), nconf.get('http:address'), function() {
	var host = server.address().address
	var port = server.address().port
	console.log('nymisigner listening at http://%s:%s', host, port)
})

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}



