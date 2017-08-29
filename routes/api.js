var express = require('express');
var router = express.Router();

// Necessari per la lettura dei file
var fs    = require('fs');
var path  = require('path');

var filePath = path.join(__dirname, '../../shared_resources/device.json');

/**
 * GET REQUEST
 * Le richieste di tipo GET ottengono un file JSON contenente i dati relativi all'elettrodomestico
 * considerato.
 * Questi dati sono in un formato standard, ovvero le voci disponibili sono uguali per tutti, starà poi
 * ad ogni elettrodomestico modificare opportunamente quelle che gli appartengono
 */
router.get('/', function(req, res, next) {
	fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
        // File json letto correttamente, lo riporto in output
        if (!err) {
            var jsonData = JSON.parse(data);
            res.json({"status" : true, "data": jsonData});
        } else {
			res.json({"status" : false, "data": ""});
			console.log(err);
        }
    });
});

module.exports = router;
