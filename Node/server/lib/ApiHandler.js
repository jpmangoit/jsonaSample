const englishMessageList = require("../LanguageFiles/tineon_message_list");
const germanMessageList = require("../LanguageFiles/tineon_message_list_ger");
const espMessageList = require("../LanguageFiles/tineon_message_list_esp");
const trMessageList = require("../LanguageFiles/tineon_message_list_tr");
const itMessageList = require("../LanguageFiles/tineon_message_list_it");
const frenchMessageList = require("../LanguageFiles/tineon_message_list_french");

let messageList;
function switchLan(language) {
	if (language == 'en') {
		messageList = englishMessageList;
	} else if (language == 'tr') {
		messageList = trMessageList;
	} else if (language == 'it') {
		messageList = itMessageList;
	} else if (language == 'es') {
		messageList = espMessageList;
	} else if (language == 'fr') {
		messageList = frenchMessageList;
	} else {
		messageList = germanMessageList;
	}
}
// ApiHandler to return Success Data to front-end or Errors
var ApiHandler = function (req, res) {
	this.req = req;
	this.res = res;
};

ApiHandler.prototype.require = function (required) {
	var _this = this;
	return new Promise(function (resolve, reject) {
		var checkExists = function (data) {
			return data !== null && typeof data != 'undefined' && data != "undefined";
		};
		if (required.body) {
			for (var i = 0; i < required.body.length; i++) {
				if (required.multiple) {
					var error = false;
					for (var j = 0; j < _this.req.body.length; j++) {
						if (!checkExists(_this.req.body[j][required.body[i]])) {
							error = true;
							j = _this.req.body[required.body[i]].length;
						}
					}
					if (error) {
						_this.error('Missing parameters.');
						break;
					}
				} else if (!checkExists(_this.req.body[required.body[i]])) {
					_this.error('Missing parameter "' + required.body[i] + '"');
					break;
				}
			}
		}
		if (required.params && _this._error) {
			for (var i = 0; i < required.params.length; i++) {
				if (!checkExists(_this.req.params[required.params[i]])) {
					_this.error('Missing parameter "' + required.params[i] + '"');
					break;
				}
			}
		}
		if (!_this._error) {
			resolve();
		}
	});
};


ApiHandler.prototype.status = function (status) {
	this.statusCode = status;
	return this;
};

ApiHandler.prototype.error = function (message) {
	switchLan(this.req.headers.lang);

	if (messageList[message]) {

		message = messageList[message]
	}
	else {
		message = message
	}
	if (this.res.headerSent) {
		return;
	}
	this._error = true;
	this.res.status(this.statusCode || 400).json({
		isError: true,
		message: message
	});
};

ApiHandler.prototype.success = function (data) {
	switchLan(this.req.headers.lang);
	if (data.message) {
		let mes = data.message
		if (messageList[mes]) {
			data.message = messageList[mes]
		}
		else {
			data.message = mes;
		}
	}
	else if (typeof (data) == "string") {
		data = messageList[data]
	}
	else {
		data = data
	}

	if (this.res.headerSent) {
		return;
	}
	this.res.status(this.statusCode || 200).json({
		isError: false,
		result: data
	});
};

ApiHandler.prototype.send = function (data) {
	switchLan(this.req.headers.lang);

	if (messageList[data]) {
		data = messageList[data]
	}
	if (this.res.headerSent) {
		return;
	}
	this.res.status(this.statusCode || 200).json(data);
}

ApiHandler.prototype.unauthorized = function () {
	this.statusCode = 403;
	this.error('Unauthorized');
};

ApiHandler.prototype.redirect = function (url) {
	if (this.res.headerSent) {
		return;
	}
	this.res.writeHead(302, {
		'Location': url
	});
	this.res.end();
};

module.exports = ApiHandler;