var express = require('express');
var router = express.Router();

var GanttServer = require('../javascripts/gantt');
ganttServer = new GanttServer();
ganttServer.start();

/*************
 *** GANTT ***
 *************/

/* GET Home page with GANTT */
router.get('/', function(req, res, next) {
  res.render('index', { headTitle: 'SMITh' });
});

/* GET GANTT information */
router.get('/gantt', function(req, res, next) {
	res.json( JSON.stringify( ganttServer.getDevices() ) );
});

/**************
 *** DEVICE ***
 **************/

router.get('/device', function(req, res, next) {
    var device_id = req.query.id;
    
    var devices = ganttServer.getDevices();
    if (!(parseInt(device_id) in devices)) {
		res.redirect('./');
		return;
	}
 
	var params = {
        headTitle : 'Device',
        device    : null,
        start_hh  : 0,
        start_mm  : 0,
        end_hh    : 0,
        end_mm    : 0
    };
    
	var device = devices[device_id];
	params.device = device;
	
	// params.start_hh = startTime.hh;
	// params.start_mm = startTime.mm;
	// params.end_hh   = endTime.hh;
	// params.end_mm   = endTime.hh;
 
	res.render('device', params);
});

module.exports = router;
