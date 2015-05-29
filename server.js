var WebSocketServer = require('websocket').server,
	WebSocketRouter = require('websocket').router,
	console = require('./app/console.js'),
	colors = require('colors'),
	http = require('http');

var args = {
	port: 6374,
	secure: false
};

var CameraManager = require('./app/cameramanager.js'),
	Detector = require('./app/detector.js'),
	cameraManager = new CameraManager(),
	detector = new Detector(),
	converter = require('./app/converter.js'),
	utils = require('./app/utils.js');

var activeCameras = {};

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
	console.log('Server is listening on port ' + args.port);
});

// WebSocket Server
var wsServer = new WebSocketServer({
	httpServer: server
});

var router = new WebSocketRouter();
router.attachServer(wsServer);

router.mount('*', 'videostream-protocol', function(request) {
	var connection = request.accept(request.origin);

	console.info('videostream-protocol connection accepted from ' + connection.remoteAddress + ' - Protocol Version ' + connection.webSocketVersion);

	connection.on('message', function(message) {
		// We only care about text messages
		if (message.type === 'utf8') {
			var commandArray = message.utf8Data.split('|'),
				command = commandArray[0],
				configString = (commandArray[1] || '');

			switch (command) {
				case 'start':
					var camera = cameraManager.startCamera(configString),
						cameraConfigObject = utils.parseConfigString(configString);

					console.info('Starting ' + camera.config.type + '-videostream for peer ' + connection.remoteAddress + '...');

					camera.loop.run();

					camera.observable.on('frame', function (image) {
						if ( connection.connected ) {
							var imageObject = converter('.jpg', image);

							imageObject.detection = {
								'movement': detector.detectMotion(image),
								'flame':  detector.detectFlame(image, (cameraConfigObject.detectionBase || 'common'))
							};

							detector.setFrames(image);

							// Send image to client
							connection.send(JSON.stringify(imageObject));
						}
					});

					camera.observable.on('error', function (error) {
						camera.loop.stop();
						console.error(error);
					});

					activeCameras[camera.id] = camera;

					console.write('done');
					break;
				case 'stop':
					if ( activeCameras['cam_' + configString] ) {
						console.info('Stoping videostream for peer ' + connection.remoteAddress + '...');
						var cameraId = 'cam_' + configString;
						activeCameras[cameraId].loop.stop();
						delete activeCameras[cameraId];
						console.write('done');
					}
					break;
				case 'release':
					console.info('Releasing current connections of videostream for peer ' + connection.remoteAddress + '...');
					for (var cameraId in activeCameras) {
						if ( activeCameras.hasOwnProperty(cameraId) ) {
							activeCameras[cameraId].loop.stop();
							delete activeCameras[cameraId];
						}
					}
					console.write('done');
					break;
				default:
					console.warn('Unknown command from client');
					break;
			}
		}
	});

	connection.on('close', function(closeReason, description) {
		console.warn('Disconnected videostream-webcam-protocol peer ' + connection.remoteAddress + ', code: ' + closeReason + '.');
		if ( description ) {
			console.write(description);
		}
	});

	connection.on('error', function(error) {
		console.error('Connection error for peer ' + connection.remoteAddress + ': ' + error);
	});
});

process.stdout.write(
	'\nFDSS\n' +
	'Fire Detection System Server' +
	'\n\n' +
	'Welcome!\n\n'
);