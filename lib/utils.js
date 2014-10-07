exports.getForecast = function(callback) {
	require('request')('https://api.wunderground.com/api/52b9eb40eff73d91/forecast/lang:IT/q/autoip.json', function(err, response, body) {
		if (err) throw err;

		body = JSON.parse(body);
		var forecast = body.forecast.simpleforecast.forecastday[0];
		callback({
			conditions: forecast.conditions,
			average: Math.round((parseInt(forecast.high.celsius)+parseInt(forecast.low.celsius))/2)
		});
	});
};