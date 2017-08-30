var dgram 	= require('dgram');

var kPORT = 5556;

var kSECONDS_FOR_REMOVE = 60;

function GanttServer() {
	this.client = null; // Connessione a MongoDB
	this.devices = {};
	
	this.timerRemoveOldDevice = null;
}

GanttServer.prototype.start = function() {
	var _this = this;
	
	// Avvio il servers
	this.client = dgram.createSocket({type: 'udp4', reuseAddr: true});
	
	this.client.bind(kPORT, function(){
		_this.client.setBroadcast(true);
	});
	
	this.client.on("message", function(msg, rinfo) {
		var buf 		= new Buffer.from(msg);
		var json_device = JSON.parse(buf.toString());
		
		var id = parseInt(json_device['id']);
		
		json_device['addedAt'] = Date.now();
		_this.devices[id] = json_device;
		
		console.log("Dispositivo: " + json_device['name'] + " " + id);
		
		//console.log(json_device);
		//console.log(rinfo);
	});
	
	this.client.on("error",function(err) {
		console.log(err);
		_this.client.close();
	});
	
	this.client.on("close", function () {
		clearInterval(_this.timerRemoveOldDevice);
		_this.timerRemoveOldDevice = null;
	});
	
	this.client.on("listening", function() {
		var addr = _this.client.address();
		console.log("UDP Server is running on port " + addr.port);
		console.log("Server IP is: " + addr.address);
		
		if (_this.timerRemoveOldDevice === null) {
			_this.timerRemoveOldDevice = setInterval(function () {
				_this.removeOldDevices()
			}, 1000 * kSECONDS_FOR_REMOVE);
		}
	});
	
};

GanttServer.prototype.getDevices = function () {
	return this.devices;
};

GanttServer.prototype.removeOldDevices = function () {
	var current_time = Date.now();
	for (var i = 0; i < Object.keys(this.devices).length; i++) {
		var id = Object.keys(this.devices)[i];
		var device = this.devices[id];
		console.log(device);
		if (current_time - device['addedAt'] > 1000 * kSECONDS_FOR_REMOVE) {
			delete this.devices[id];
			console.log("Rimosso " + device['name'] + " " + id);
			i = 0;
		}
	}
};

module.exports = GanttServer;