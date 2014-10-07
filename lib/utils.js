var Spotify = require('./spotify');

function fadeVolume(x, to, duration, callback) {
	var FPS = 5;
	var inc = (to-x)/(duration/FPS*1000);

	(function _inc() {
		if (x>=to) return callback();
		setTimeout(_inc, FPS);

		Spotify.volume = x;
		x += inc;
	})();
}
exports.fadeVolume = fadeVolume;


function getForecast(callback) {
	require('request')('https://api.wunderground.com/api/52b9eb40eff73d91/forecast/lang:IT/q/autoip.json', function(err, response, body) {
		if (err) throw err;

		body = JSON.parse(body);
		var forecast = body.forecast.simpleforecast.forecastday[0];
		callback({
			conditions: forecast.conditions,
			average: Math.round((parseInt(forecast.high.celsius)+parseInt(forecast.low.celsius))/2)
		});
	});
}
exports.getForecast = getForecast;