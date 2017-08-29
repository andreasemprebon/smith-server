function SMIThDevice(name, start, end) {
	this.name 	= name;
	this.start 	= start;
	this.end 	= end;
	this.color 	= "#014c8c";
}

SMIThDevice.prototype.duration = function() {
	return this.end - this.start;
};
