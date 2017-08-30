$(document).ready(function () {
	var device = new SMIThDevice(	globalDevice.name,
		globalDevice.id,
		globalDevice.start,
		globalDevice.end,
		globalDevice.ip);
	//device.color = globalDevice.color;
	device.colorSetup();
	device.setStartEndHoursAndMinutes();
	
});