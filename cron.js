var Config = require('./config');

var Spotify = require('./lib/spotify');
Spotify.credentials = Config.spotify;

var Utils = require('./lib/utils');
var TTS = require('ttsay');
var Q = require('q');

var FB = require('fb');
FB.setAccessToken(Config.facebook.accessToken);

var Moment = require('moment');
Moment.locale("it");


function startSpotify() {
	var defer = Q.defer();

	Spotify.login(function() {
		Spotify.getStarredTracks(function(tracks) {

			Spotify.playListOfTracks(tracks);

			defer.resolve();

		});
	});

	return defer.promise;
}

function fadeIn(from, to, duration) {
	var defer = Q.defer();

	Utils.fadeVolume(from, to, duration, function() {
		defer.resolve();
	});

	return defer.promise;
}

function wait(t) {
	var defer = Q.defer();
	setTimeout(defer.resolve, t);
	return defer.promise;
}

function sayGoodMorning() {
	var defer = Q.defer();

	TTS("Buongiorno, Flavio!", null, function(){
		TTS("Oggi è "+Moment().format('dddd D MMMM')+", sono le "+Moment().format('HH [e] mm')+
		" e stiamo ascoltando "+Spotify.currentTrack.name+" di "+Spotify.currentTrack.artists[0].name,
		null, defer.resolve);
	});

	return defer.promise;
}

function sayForecast() {
	var defer = Q.defer();

	Utils.getForecast(function(forecast) {
		TTS("Il tempo previsto per oggi indica "+forecast.conditions+", con una temperatura media di "+forecast.average+" gradi",
		null, defer.resolve);
	});

	return defer.promise;
}

function sayNotifications() {
	var defer = Q.defer();

	FB.api('/me/notifications', function(res) {
		if (!res || res.error || !res.data) return;

		var count = 0;
		res.data.forEach(function(t) {
			if (t.unread) count++;
		});

		TTS("Hai "+count+" notifiche non lette su Facebook.", null, defer.resolve);
	});

	return defer.promise;
}

Utils.getForecast(function(forecast) {
	console.log(forecast);
});


startSpotify()

 .then(sayGoodMorning)
 .then(function(){ return wait(1500); })

 .then(sayForecast)
 .then(function(){ return wait(1500); })

 .then(sayNotifications);
