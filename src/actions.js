var Reflux = require("reflux");

var Actions = Reflux.createActions([
		"saveUserInfo",
    "getUserInfo",
    "getLocation",
    "getLocationInfo",
    "getPosts",
		"makeVote",
		"postImage",
		"deletPost",
		"updatePost"
	]);

module.exports = Actions;