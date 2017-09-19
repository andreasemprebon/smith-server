$(document).ready(function () {
	var device = new SMIThDevice(	globalDevice.name,
		globalDevice.id,
		globalDevice.start,
		globalDevice.end,
		globalDevice.ip);
	
	device.cycle = globalDevice.cycle;
	device.getInfo();
	device.plotCycleGraph();
	
	$("form[name='web-constraints']").on("click", "button", function (e) {
		device.saveConstraints();
		e.preventDefault();
	});
	
});