var WebSocketServer = require('websocket').server,
	WebSocketRouter = require('websocket').router,
	http            = require('http'),
	converter       = require('./app/converter.js'),
	utils           = require('./app/utils.js');

var args = {
	port: 6374,
	secure: false
};

var timeout,
	CamerasModule = require('./app/camera.js'),
	cameras = new CamerasModule();


function sendCallback(err) {
	if (err) {
		console.error(utils.getConsoleTimestamp() + 'Websocket send error: ' + err);
	}
}

args.protocol = args.secure ? 'wss:' : 'ws:';

// Create server
var server = http.createServer(function(request, response) {
	console.log(utils.getConsoleTimestamp() + 'Received HTTP request for ' + request.url);
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
	console.log(utils.getConsoleTimestamp() + 'Server is listening on port ' + args.port);
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
		utils.getConsoleTimestamp() +
		'videostream-webcam-protocol connection accepted from ' + connection.remoteAddress +
		' - Protocol Version ' + connection.webSocketVersion
	);

	connection.on('message', function(message) {
		// We only care about text messages
		if (message.type === 'utf8') {
			var commandArray = message.utf8Data.split('|'),
				command = commandArray[0],
				configString = (commandArray[1] || '');

			switch (command) {
				case 'start':
				case 'restart':
					cameras.startCamera(configString, function (camera) {
						console.log(utils.getConsoleTimestamp() + 'Starting ' + camera.config.type + '-videostream for peer ' + connection.remoteAddress + '...');
						if ( connection.connected ) {
							var frequency = (camera.config.fps !== undefined ? Math.round(1000 / parseInt(camera.config.fps, 10)) : 100),
								videostream = function () {
									camera.getFrame()
										.then(
											function (image) {
												connection.send(converter('.jpg', image));
												timeout = setTimeout(videostream, frequency)
											},
											function (error) {
												clearTimeout(timeout);
												console.error(utils.getConsoleTimestamp() + error.message);
											}
										);

									clearTimeout(timeout);
								};

							timeout = setTimeout(videostream, frequency);
						}
						console.log('done');
					});
					break;
				case 'stop':
					console.log(utils.getConsoleTimestamp() + 'Stoping videostream-webcam for peer ' + connection.remoteAddress + '...');
					clearTimeout(timeout);
					console.log('done');
					break;
				case 'release':
					console.log(utils.getConsoleTimestamp() + 'Releasing current connections of videostream-webcam for peer ' + connection.remoteAddress + '...');
					clearTimeout(timeout);
					console.log('done');
					break;
				default:
					console.warn(utils.getConsoleTimestamp() + 'Unknown command from client');
					break;
			}
		}
	});

	connection.on('close', function(closeReason, description) {
		clearTimeout(timeout);
		console.log(utils.getConsoleTimestamp() + 'videostream-webcam-protocol peer ' + connection.remoteAddress + ' disconnected, code: ' + closeReason + '.');
	});

	connection.on('error', function(error) {
		console.log(utils.getConsoleTimestamp() + 'Connection error for peer ' + connection.remoteAddress + ': ' + error);
	});
});

console.log(
	'FDSS\n' +
	'Fire Detection System Server' +
	'\n\n' +
	'Welcome!\n'
);