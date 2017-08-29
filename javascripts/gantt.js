var ip		= "127.0.0.1";
var port 	= 5556;
var dgram 	= require('dgram');
var client 	= dgram.createSocket('udp4');

client.bind(port, ip);

client.on("message", function(msg, rinfo) {
	var buf 		= new Buffer.from(msg);
	var textChunk 	= JSON.parse(buf.toString());
	console.log(textChunk);
	//console.log(JSON.parse(textChunk));
	console.log(rinfo);
	client.close();
	//res.send(textChunk);
});

client.on("error",function(err) {
	console.log(err);
	client.close();
});

client.on("listening", function() {
	console.log("UDP Server is running on port " + port);
	console.log("Server IP is: " + ip);
});
