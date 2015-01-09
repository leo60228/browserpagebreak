(function() {
	//CSS Loader
	function loadCss(url) {
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}
	
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
	require(['modernizr'], function() {
		//if (!Modernizr.cssvhunit) {
		if (true) {
			require(['tokenizer', 'parser', 'vminpoly']);
		}
		if (Modernizr.mq('only all')) {
			loadCss('media.css');
		};
	});
})();
