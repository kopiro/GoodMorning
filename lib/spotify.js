var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('node-spotify')({
	appkeyFile: __dirname+'/../spotify_appkey.key'
});

var SpotifyUser = null;

exports.volume = 1;
exports.credentials = {
	username : "",
	password : "",
};

exports.currentTrack = null;

var volumeTransformer = new require('stream').Transform();
volumeTransformer._transform = function(bytes, encoding, callback) {
	if (exports.volume!==1) {
		for (var i=0; i<bytes.length; i+=2) {
			var b = Math.round( Math.min(1, exports.volume) * bytes.readInt16LE(i) );
			bytes.writeInt16LE(b, i);
		}
	}

	this.push(bytes);
	callback();
};

exports.getAudibleVolume = function() {
	return Math.log(exports.volume) / Math.LN10;
};

exports.setAudibleVolume = function(v) {
	exports.volume = Math.pow(v, 2);
};

function login(callback) {
	Spotify.on({
		ready: function() {
			SpotifyUser = Spotify.createFromLink('spotify:user:' + exports.credentials.username);
			callback();
		}
	});
	Spotify.login(exports.credentials.username, exports.credentials.password, false, false);
}
exports.login = login;


function getStarredTracks(callback) {
	Spotify.waitForLoaded([ SpotifyUser.starredPlaylist ], function(playlist) {
		var tracks = [];
		(function next (i) {

			Spotify.waitForLoaded([ playlist.getTracks()[i] ], function(track) {
				tracks.push(track);
				if (i > 4) {
					return callback(tracks);
				}

				next(i+1);
			});

		})(0);
	});
}
exports.getStarredTracks = getStarredTracks;


function playListOfTracks(tracks, callback) {
	(function next () {

		if (tracks.length === 0) {
			return callback();
		}

		playTrack(tracks.shift(), next);

	})();
}
exports.playListOfTracks = playListOfTracks;


function playTrack(track) {
	exports.currentTrack = track;
	Spotify.player.play(track);
}
exports.playTrack = playTrack;
