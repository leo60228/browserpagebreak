//Array Filter Polyfill
if (!Array.prototype.filter) {
	Array.prototype.filter = function(fun /*, thisp*/ ) {
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();
		var res = new Array();
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				var val = this[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, this))
					res.push(val);
			}
		}
		return res;
	};
}

/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
	if (!window.console) {
		window.console = {};
	}
	// union of Chrome, FF, IE, and Safari console methods
	var m = [
		"log", "info", "warn", "error", "debug", "trace", "dir", "group",
		"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
		"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
	];
	// define undefined methods as noops to prevent errors
	for (var i = 0; i < m.length; i++) {
		if (!window.console[m[i]]) {
			window.console[m[i]] = function() {};
		}
	}
})();

Modernizr.load({
	test: Modernizr.cssvhunit,
	nope: ['tokenizer.js', 'parser.js', 'vminpoly.js']
});

Modernizr.load({
	test: Modernizr.mq('only all'),
	yep: 'media.css'
});
