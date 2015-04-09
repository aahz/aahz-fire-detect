var WebSocketServer = require('websocket').server,
	WebSocketRouter = require('websocket').router,
	DataUri         = require('datauri'),
	http            = require('http'),
	cv              = require('opencv'),
	converter       = new DataUri();

var args = {
	port: 6374,
	secure: false
};

var interval;

function getConsoleTimestamp() {
	var d = new Date(),
		data = {
			date: d.getDate(),
			month: d.getMonth(),
			year: d.getFullYear(),
			hours: d.getHours(),
			minutes: d.getMinutes(),
			seconds: d.getSeconds()
		};

	for (var part in data) {
		if ( data.hasOwnProperty(part) && (data[part] >= 0 && data[part] < 10) ) {
			data[part] = '0' + data[part];
		}
	}

	return data.date + '.' + data.month + '.' + data.year + ' ' + data.hours + ':' + data.minutes + ':' + data.seconds + '> ';
}

function sendCallback(err) {
	if (err) {
		console.error(getConsoleTimestamp() + 'Websocket send error: ' + err);
	}
}

/* Parse command line options */
var pattern = /^--(.*?)(?:=(.*))?$/;

process.argv.forEach(function(value) {
	var match = pattern.exec(value);
	if (match) {
		args[match[1]] = match[2] ? match[2] : true;
	}
});

args.protocol = args.secure ? 'wss:' : 'ws:';

// Create server
var server = http.createServer(function(request, response) {
	console.log(getConsoleTimestamp() + 'Received HTTP request for ' + request.url);
	if (request.url === '/') {
		response.writeHead(200, {
			'Content-Type': 'text/html'
		});
		response.end('OK');
	}
	else {
		response.writeHead(404);
		response.end();
	}
});

// Listen for defined port
server.listen(args.port, function() {
	console.log(getConsoleTimestamp() + 'Server is listening on port ' + args.port);
});

// WebSocket Server
var wsServer = new WebSocketServer({
	httpServer: server
});

var router = new WebSocketRouter();
router.attachServer(wsServer);

router.mount('*', 'videostream-webcam-protocol', function(request) {
	var connection = request.accept(request.origin);

	console.log(
		getConsoleTimestamp() +
		'videostream-webcam-protocol connection accepted from ' + connection.remoteAddress +
		' - Protocol Version ' + connection.webSocketVersion
	);

	var cameraConfig = {};

	connection.on('message', function(message) {
		// We only care about text messages
		if (message.type === 'utf8') {
			switch (message.utf8Data) {
				case 'start':
				case 'restart':
					console.log(getConsoleTimestamp() + 'Starting videostream-webcam for peer ' + connection.remoteAddress + '...');

					var camera,
						cameraRead = function () {
							camera.read(function (error, image) {
								if (error) {
									console.error(getConsoleTimestamp() + 'Error while reading image from web camera', error);
								}

								var size = image.size();

								if (size[0] > 0 && size[1] > 0) {
									if (connection.connected) {

										var imageCopy = image.copy();
										imageCopy.convertGrayscale();
										imageCopy.dilate(4);

										imageCopy.inRange([150, 150, 150], [255, 255, 255]);

										var contours = imageCopy.findContours();

										image.drawAllContours(contours, [0,0,200]);

										connection.send(converter.format('.png', image.toBuffer()).content);
									}
									else {
										console.log(getConsoleTimestamp() + 'Connection to peer ' + connection.remoteAddress + ' lost');
										clearInterval(interval);
										camera = undefined;
									}
								}
								else {
									console.warn(getConsoleTimestamp() + 'Got a blank image from web camera');
								}
							});
						};

					if ( cameraConfig.index ) {
						camera = new cv.VideoCapture(parseInt(cameraConfig.index, 10));

						interval = setInterval(cameraRead, (cameraConfig.fps !== undefined ? Math.round(1000 / parseInt(cameraConfig.fps)) : 100));
						console.log('done');
					}
					else {
						console.warn(getConsoleTimestamp() + 'Camera configuration not set');
					}
					break;
				case 'stop':
					console.log(getConsoleTimestamp() + 'Stoping videostream-webcam for peer ' + connection.remoteAddress + '...');
					if ( interval ) {
						clearInterval(interval);
						camera = undefined;
					}
					console.log('done');
					break;
				default:
					if ( message.utf8Data.indexOf('config') === 0 ) {
						var configStr = message.utf8Data.split('|');

						if ( typeof configStr[1] === 'string' ) {
							var config = {},
								tempConfigArray = configStr[1].split(';');

							for (var i = 0, ic = tempConfigArray.length - 1; i <= ic; i++ ) {
								var tempConfig = tempConfigArray[i].split('=');

								if ( typeof tempConfig[1] !== 'undefined' ) {
									cameraConfig[tempConfig[0]] = tempConfig[1];
								}
							}
						}
					}
					break;
			}
		}
	});

	connection.on('close', function(closeReason, description) {
		clearInterval(interval);
		console.log(getConsoleTimestamp() + 'videostream-webcam-protocol peer ' + connection.remoteAddress + ' disconnected, code: ' + closeReason + '.');
	});

	connection.on('error', function(error) {
		console.log(getConsoleTimestamp() + 'Connection error for peer ' + connection.remoteAddress + ': ' + error);
	});
});

console.log(
	'FDSS\n' +
	'Fire Detection System Server' +
	'\n\n' +
	'Welcome!\n'
);