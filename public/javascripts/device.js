$(document).ready(function () {
	var device = new SMIThDevice(	globalDevice.name,
		globalDevice.id,
		globalDevice.start,
		globalDevice.end,
		globalDevice.ip);
	
	device.getInfo();
	
	$("form[name='web-constraints']").on("click", "button", function (e) {
		device.saveConstraints();
		e.preventDefault();
	});
	
});