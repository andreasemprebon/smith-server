var device_colors = ["#108193", "#266b8b", "#5f7f68", "#445f74"];

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function SMIThDevice(name, id, start, end, ip) {
	this.name 	= name;
	this.start 	= start;
	this.end 	= end;
	this.ip 	= ip;
	this.id		= id;
	this.color 	= device_colors[this.id % device_colors.length];
	this.rgb_color = hexToRgb(this.color);
	this.cycle  = new Array(96);
	
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
		url: _this.getURL() + "/possible_conf.php",
		//dataType: "jsonp",
		cache: false,
		success: function(html) {
			//console.log(html);
			var json = false;
			try {
				json = $.parseJSON(html);
			} catch(err) {
				console.log(err.message);
				console.log(html);
				return;
			}
			
			console.log(json);
			var show_update_btn = false;
			for (var key in json) {
				if (json.hasOwnProperty(key)) {
					show_update_btn = true;
					
					var select_html = "<div class='form-group'>";
					select_html += "<p class='input-description'>" + json[key]['display_name'] + "</p>";
					select_html += "<div class='input-group'>";
					
					var type = json[key]['type'];
					var current = json[key]['current'];
					
					if (type === 'timestep') {
						var select_hh = "<select class='custom-select' name='" + key + "_hh' >";
						var select_mm = "<select class='custom-select' name='" + key + "_mm' >";
						
						var json_values = json[key]['values'];
						
						var hours = [];
						var minutes = [];
						
						var currentTime = _this.getHourMinutesFromTimeStep( parseInt(current) );
						
						$(json_values).each(function () {
							var humanTime = _this.getHourMinutesFromTimeStep( this );
							
							if (hours.indexOf(humanTime.hh) < 0) {
								select_hh += "<option value='" + humanTime.hh + "' ";
								
								if (humanTime.hh == currentTime.hh) {
									select_hh += "selected='selected' ";
								}
								
								select_hh += ">" + humanTime.hh + "</option>";
								hours.push(humanTime.hh);
							}
							
							if (minutes.indexOf(humanTime.mm) < 0) {
								select_mm += "<option value='" + humanTime.mm + "' ";
								
								
								if (humanTime.mm == currentTime.mm) {
									select_mm += "selected='selected' ";
								}
								
								select_mm += ">" + humanTime.mm + "</option>";
								minutes.push(humanTime.mm);
							}
						});
						select_hh += "</select>";
						select_mm += "</select>";
						
						select_html += "<div class='input-group'>";
						select_html += "<div class='input-group-addon'>Hours</div>";
						select_html += select_hh;
						select_html += "</div>";
						
						select_html += "<div class='input-group'>";
						select_html += "<div class='input-group-addon'>Minutes</div>";
						select_html += select_mm;
						select_html += "</div>";
						
					} else {
						select_html += "<select class='custom-select' name='" + key + "' >";
						var json_values = json[key]['values'];
						$(json_values).each(function () {
							select_html += "<option value='" + this + "' ";
							if (parseInt(current) == parseInt(this)) {
								
								select_html += "selected='selected' ";
							}
							
							select_html += ">" + this + "</option>";
						});
						select_html += "</select>";
					}
					
					
					select_html += "</div>";
					select_html += "</div>";
					
					$("form[name='web-constraints']").append(select_html);
				}
			}
			
			if (show_update_btn) {
				$(".web-conf").show();
				var btn_html = "<button class='btn btn-primary' type='submit'>Update Preferences</button>";
				$("form[name='web-constraints']").append(btn_html);
			} else {
				$(".web-conf").hide();
			}
			
			_this.colorSetup();
			
		} ,
		error: function(html) {
			console.log("Impossibile raggiungere la pagina di gestione del device" + html );
		}
	});
};

SMIThDevice.prototype.plotCycleGraph = function () {
	var _this = this;
	
	var ctx = document.getElementById("cycleChart");
	
	var labels_array = [];
	
	for (var i=0; i<=96; i++) {
		var t = _this.getHourMinutesFromTimeStep(i);
		labels_array.push( ((t.hh < 10) ? ("0" + t.hh) : t.hh)
			+ ":"
			+ ((t.mm < 10) ? ("0" + t.mm) : t.mm)  );
	}
	
	var config = {
		type: 'line',
		data: {
			labels: labels_array,
			datasets: [{
				label: "Power",
				backgroundColor: "rgba(" + _this.rgb_color.r + "," + _this.rgb_color.g + "," + _this.rgb_color.b + ",0.1)",
				borderColor: _this.color,
				data: _this.cycle,
				fill: true,
				pointRadius : 0
			}]
		},
		options: {
			maintainAspectRatio: false,
			title : {
				display : false
			},
			legend : {
				display: false
			},
			scales: {
				xAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Timestep'
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Power'
					}
				}]
			}
		}
	};
	
	
	
	var myCycleChart = new Chart(ctx, config);
};

SMIThDevice.prototype.saveConstraints = function () {
	var _this = this;
	
	var conf_dict = {};
	$("select").each(function () {
		var name = $(this).attr('name');
		// Campo timestep - da ore-minuti lo riconverto a timestep
		if ( name.indexOf("_mm") !== -1 || name.indexOf("_hh") !== -1) {
			
			value = name.replace("_mm", "");
			value = value.replace("_hh", "");
			
			var hours 	= $("select[name='" + value + "_hh']").val();
			var minutes = $("select[name='" + value + "_mm']").val();
			
			conf_dict[value] = _this.getTimeStepFromHoursMinutes(hours, minutes);
			
		} else {
			
			conf_dict[name] = $(this).val();
			
		}
		
	});
	
	$.ajax({
		type: "POST",
		data: conf_dict,
		url: _this.getURL() + "/save_conf.php",
		cache: false,
		success: function(html) {
			console.log(html);
			window.location.href = "/";
		} ,
		error: function(html) {
			console.log("Impossibile raggiungere la pagina di gestione del device");
		}
	});
};

SMIThDevice.prototype.getTimeStepFromHoursMinutes = function(hours, minutes, tau) {
	tau = (typeof tau !== 'undefined') ?  tau : 15;
	
	var hours_timestep 		= hours * 60 / tau;
	var minutes_timestep 	= minutes / tau;
	
	return hours_timestep + minutes_timestep;
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
	$(".device p.name a").css({'color': this.color});
	$(".btn-primary").css({
		'background-color'	: this.color,
		'border-color'		: this.color
	});
};