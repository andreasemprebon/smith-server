var device_colors = ["#266b8b", "#5f7f68", "#5f7f68", "#445f74", "#108193"];

function SMIThDevice(name, id, start, end, ip) {
	this.name 	= name;
	this.start 	= start;
	this.end 	= end;
	this.ip 	= ip;
	this.id		= id;
	this.color 	= "#014c8c";
}

SMIThDevice.prototype.duration = function() {
	return this.end - this.start;
};

SMIThDevice.prototype.getURL = function () {
	return "http://" + this.ip + "/api";
};

SMIThDevice.prototype.getInfo = function () {
	var _this = this;
	
	$.ajax({
		type: "GET",
		url: _this.getURL(),
		cache: false,
		success: function(html) {
			console.log(html);
			var json = false;
			try {
				json = $.parseJSON(html);
			} catch(err) {
				console.log(err.message);
				return;
			}
			
		} ,
		error: function(html) {
			console.log("Impossibile raggiungere la pagina di gestione del device");
		}
	});
};

SMIThDevice.prototype.setConstraints = function () {
	var _this = this;
	
	$.ajax({
		type: "POST",
		url: _this.getURL(),
		cache: false,
		success: function(html) {
			console.log(html);
			var json = false;
			try {
				json = $.parseJSON(html);
			} catch(err) {
				console.log(err.message);
				return;
			}
			
		} ,
		error: function(html) {
			console.log("Impossibile raggiungere la pagina di gestione del device");
		}
	});
};

SMIThDevice.prototype.getHourMinutesFromTimeStep = function(timestep, tau) {
	tau = (typeof tau !== 'undefined') ?  tau : 15;
	
	// Calcolo il minuto e l'ora di inizio
	var raw_minutes = timestep * tau;
	
	var hours 	= Math.floor(raw_minutes / 60);
	var minutes = raw_minutes - hours * 60;
	
	return {
		'hh' : hours,
		'mm' : minutes
	};
};

SMIThDevice.prototype.setStartEndHoursAndMinutes = function () {
	// Setto orari di inizio e fine
	var startTime = this.getHourMinutesFromTimeStep( this.start );
	var endTime   = this.getHourMinutesFromTimeStep( this.end );
	
	$('select[name="start-hh"]').val(startTime.hh);
	$('select[name="start-mm"]').val(startTime.mm);
	
	$('select[name="end-hh"]').val(endTime.hh);
	$('select[name="end-mm"]').val(endTime.mm);
};

SMIThDevice.prototype.colorSetup = function () {
	$(".device p.name").css({'color': this.color});
	$(".btn-primary").css({
		'background-color'	: this.color,
		'border-color'		: this.color
	});
};