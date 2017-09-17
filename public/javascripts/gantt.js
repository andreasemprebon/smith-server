var kTIME_STEPS = 96;

function timestepToDate(timestep, tau) {
	tau = (typeof tau !== 'undefined') ?  tau : 15;
	
	var today = new Date();
	
	// Estraggo i componenti della data di oggi
	var day 	= today.getDate();
	var month 	= today.getMonth();
	var year 	= today.getFullYear();
	
	// Calcolo il minuto e l'ora di inizio
	var raw_minutes = timestep * tau;
	
	var hours 	= Math.floor(raw_minutes / 60);
	var minutes = raw_minutes - hours * 60;
	
	// Secondi e Millisecondi sono sempre 0
	var seconds 		= 0;
	var milliseconds 	= 0;
	
	// Ritorno la data completa
	return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}

function SMIThGantt() {
	this.htmlPlotElement = null; // Dove plottare il grafico
	this.devices = [];
	this.autoupdate_timer = null;
}

SMIThGantt.prototype.addDevice = function (device) {
	this.devices.push( device );
};

SMIThGantt.prototype.removeAllDevices = function () {
	this.devices = [];
};

SMIThGantt.prototype.plotGantt = function() {
	if (this.htmlPlotElement === null) {
		return false;
	}
	// Resetto il contenuto dell'elemento HTML nel caso si trattasse di un re-plot
	$(this.htmlPlotElement).html("");
	
	// Ottengo la width dell'elemento HTML che contiene il grafico
	var name_width = 200;
	var html_width = $(this.htmlPlotElement).width() - name_width;
	
	var timestep_to_pixel_factor = Math.floor( html_width / kTIME_STEPS );
	
	// Creo un elemento HTML per ogni device associato al Gantt
	for(var i = 0; i < this.devices.length; i++) {
		var device = this.devices[i];
		
		var elem = $(document.createElement("div"));
		elem.addClass("device");
		
		/**
		 * NOME
		 */
		var name = $(document.createElement("div"));
		name.addClass("name");
		name.html( "<a href='./device?id=" + device.id + "'>" + device.name + "</a>" );
		
		/**
		 * BARRA
		 */
		var bar = $(document.createElement("div"));
		bar.addClass("bar");
		
		bar.css({
			"left"	: (timestep_to_pixel_factor * device.start) + "px",
			"width" : (timestep_to_pixel_factor * device.duration() ) + "px",
			"background-color" : device.color
				});
		
		// Pallini bianchi ad inizio e fine barra
		// Il 35 è un numero inventato, se la lunghezza della barra colorata non è almeno di 40px, allora
		// i due pallini bianchi non ci stanno e quindi non serve stamparli
		if ( bar.width() > 35 ) {
			var pallino_inizio = $(document.createElement("div"));
			pallino_inizio.addClass("pallino");
			pallino_inizio.addClass("inizio");
			
			var pallino_fine = $(document.createElement("div"));
			pallino_fine.addClass("pallino");
			pallino_fine.addClass("fine");
			
			bar.append(pallino_inizio);
			bar.append(pallino_fine);
		}
		
		elem.append(name);
		elem.append(bar);
		
		$(this.htmlPlotElement).append(elem);
	}
	
	/**
	 * BARRE VERTICALI
	 */
	var vertical_bars_timesteps = [0, 24, 48, 72, kTIME_STEPS];
	
	for (var i = 0; i < vertical_bars_timesteps.length; i++) {
		var timestep 	= vertical_bars_timesteps[i];
		
		var date = timestepToDate(timestep);
		var text = date.toTimeString().slice(0,5);
		
		var v_bar = $(document.createElement("div"));
		v_bar.addClass("vertical-bar");
		
		v_bar.css({
			"left"	: ((timestep_to_pixel_factor * timestep) + name_width) + "px"
		});
		
		var p_v_bar = $(document.createElement("p"));
		p_v_bar.html( text );
		
		v_bar.append(p_v_bar);
		
		$(this.htmlPlotElement).append(v_bar);
		
		p_v_bar.css({"left": "-" + Math.floor(p_v_bar.width() / 2) + "px"});
	}
};

SMIThGantt.prototype.startAutomaticUpdate = function () {
	var _this = this;
	
	if (this.autoupdate_timer === null) {
		this.update();
		this.autoupdate_timer = setInterval(function () {
			_this.update();
		}, 5000);
	}

};

SMIThGantt.prototype.stopAutomaticUpdate = function () {
	clearInterval(this.autoupdate_timer);
	this.autoupdate_timer = null;
};

SMIThGantt.prototype.update = function () {
	var _this = this;
	
	$.ajax({
		type: "GET",
		url: "./gantt",
		cache: false,
		success: function(html) {
			var json = false;
			try {
				json = $.parseJSON(html);
			} catch(err) {
				console.log(err.message);
				return;
			}
			
			var recieved_devices = json;
			
			_this.removeAllDevices();
			
			for (var i = 0; i < Object.keys(recieved_devices).length; i++) {
				var device = recieved_devices[Object.keys(recieved_devices)[i]];
				var d_temp = new SMIThDevice(device['name'], device['id'], device['start'], device['end'], device['ip']);
				if (!('color' in device)) {
					d_temp.color = device_colors[d_temp.id % device_colors.length];
				} else {
					d_temp.color = device['color'];
				}
				_this.addDevice(d_temp);
			}
			
			_this.plotGantt();
			
		} ,
		error: function(html) {
			console.log("Impossibile raggiungere la pagina del server Gantt");
		}
	});
};

/**
 * AVVIO DEL GRAFICO GANTT
 */
$(document).ready(function () {
	var gantt = new SMIThGantt();
	gantt.htmlPlotElement = ".gantt";
	
	gantt.startAutomaticUpdate();
	
	/*var d1 = new SMIThDevice("Washing Machine", 1, 18, 25);
	d1.color = "#266b8b";
	
	var d2 = new SMIThDevice("Dish Washer", 2, 28, 36);
	d2.color = "#5f7f68";
	
	var d3 = new SMIThDevice("Boiler", 3, 56, 89);
	d3.color = "#445f74";
	
	var d4 = new SMIThDevice("Battery", 4, 75, 96);
	d4.color = "#0d6493";
	
	var d5 = new SMIThDevice("Solar Panel", 4, 25, 75);
	d5.color = "#932b1c";
	
	gantt.addDevice(d1);
	gantt.addDevice(d2);
	gantt.addDevice(d3);
	gantt.addDevice(d4);
	gantt.addDevice(d5);
	
	gantt.plotGantt();*/
});