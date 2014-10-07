exports.currentTrack = null;
exports.credentials = {
	username : "",
	password : "",
};

var Spotify = require('node-spotify')({
	appkeyFile: __dirname+'/../spotify.key'
});

var User = null;

exports.login = function(callback) {
	Spotify.on({
		ready: function() {
			User = Spotify.createFromLink('spotify:user:' + exports.credentials.username);
			callback();
		}
	});
	Spotify.login(exports.credentials.username, exports.credentials.password, false, false);
};

exports.getStarredTracks = function(callback) {
	Spotify.waitForLoaded([ User.starredPlaylist ], function(playlist) {
		var tracks = [];
		(function next(i) {
			Spotify.waitForLoaded([ playlist.getTracks()[i] ], function(track) {
				tracks.push(track);
				if (i > 4) return callback(tracks);
				next(i+1);
			});
		})(0);
	});
};

exports.playListOfTracks = function(tracks, callback) {
	(function next() {
		if (tracks.length === 0) return callback();
		exports.playTrack(tracks.shift(), next);
	})();
};

exports.playTrack = function(track, callback) {
	exports.currentTrack = track;
	Spotify.player.on({ endOfTrack: callback });
	Spotify.player.play(track);
};