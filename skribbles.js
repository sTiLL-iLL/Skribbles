
//skribbles.js

var fs = require('fs'),
	pth = require('path'),
	cueMngr = {},
	skribbles = null;

function Skribbles(fileNm) {
	this.handle = fileNm;
	this.canWrite = false;
	this.actionsRoster = [];
}

skribbles = Skribbles.prototype;

skribbles.broadcast = function (er, dta, signal) {
	if (er) {
		throw er;
	}
	signal();
}

skribbles.assign = function (signals) {
	this.broadcast = signals;
	return this;
}

skribbles.skribble = function (dta, signals) {
	if (this.canWrite) {
		this.signal = dta;
		if (signals) {
			this.actionsRoster.push(signals);
		}
	} 
	else {
		this.canWrite = true;
		var slf = this,
			channel = {};
		fs.appendFile(this.handle, dta, function (er) {
			function signal() {
				slf.canWrite = false;
				if (slf.signal) {
					var dta = slf.signal;
					slf.signal = null;
					slf.skribble(dta);
				}
			}
			slf.broadcast(er, dta, signal);
			while (channel = slf.actionsRoster.shift()) {
				channel(er);
			}
			if (signal) {
				signal(er);
			}
		});
	}
	return this;
};
module.exports = function (fil) {
	var nm = pth.resolve(fil);
	return (cueMngr[nm] = cueMngr[nm] || new Skribbles(fil));
}
