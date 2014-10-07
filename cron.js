var Config = require('./config.json');

var Utils = require('./lib/utils');
var TTS = require('ttsay');
var Q = require('q');

var Spotify = require('./lib/spotify');
Spotify.credentials = Config.spotify;

var FB = require('fb');
FB.setAccessToken(Config.facebook.accessToken);

var Moment = require('moment');
Moment.locale("it");


function startSpotify() {
	var q = Q.defer();

	Spotify.login(function() {
		Spotify.getStarredTracks(function(tracks) {
			Spotify.playListOfTracks(tracks);

			q.resolve();

		});
	});

	return q.promise;
}

function wait(t) {
	var defer = Q.defer();
	setTimeout(defer.resolve, t);
	return defer.promise;
}

function sayGoodMorning() {
	var q = Q.defer();

	TTS("Buongiorno, Flavio!", null, function(){
		TTS("Oggi è " + Moment().format('dddd D MMMM') + ", sono le " + Moment().format('HH [e] mm') + " e stiamo ascoltando " + Spotify.currentTrack.name + " di " + Spotify.currentTrack.artists[0].name, null, q.resolve);
	});

	return q.promise;
}

function sayForecast() {
	var q = Q.defer();

	Utils.getForecast(function(forecast) {
		TTS("Il tempo previsto per oggi indica " + forecast.conditions + ", con una temperatura media di " + forecast.average + " gradi",
		null, q.resolve);
	});

	return q.promise;
}

function sayNotifications() {
	var q = Q.defer();

	FB.api('/me/notifications', function(res) {
		if (res.error == null || _.isObject(res.data)) return;

		var count = 0;
		res.data.forEach(function(t) {
			if (t.unread) count++;
		});

		TTS("Hai " + count + " notifiche non lette su Facebook.", null, q.resolve);
	});

	return q.promise;
}

sayNotifications();

startSpotify()

 .then(sayGoodMorning)
 .then(function(){ return wait(1500); })

 .then(sayForecast)
 .then(function(){ return wait(1500); })

 .then(sayNotifications);
