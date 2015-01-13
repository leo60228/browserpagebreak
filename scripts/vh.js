(function(window, undefined) {
	"use strict";

	function getviewport() {
		var viewPortWidth;
		var viewPortHeight;
		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != 'undefined') {
			viewPortWidth = window.innerWidth;
			viewPortHeight = window.innerHeight;
		}
		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !=
			'undefined' && document.documentElement.clientWidth != 0) {
			viewPortWidth = document.documentElement.clientWidth;
			viewPortHeight = document.documentElement.clientHeight;
		}
		// older versions of IE
		else {
			viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
			viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
		}
		return [viewPortWidth, viewPortHeight];
	}
	// test for REM unit support
	var cssvhunit = function() {
		var div = document.createElement('div');
		div.style.cssText = 'font-size: 1vh;';
		return (/vh/).test(div.style.fontSize);
	},
	// filter returned links for stylesheets
	isStyleSheet = function() {
		var styles = document.getElementsByTagName('link'),
			filteredLinks = [];
		for (var i = 0; i < styles.length; i++) {
			if (styles[i].rel.toLowerCase() === 'stylesheet' && styles[i].getAttribute('data-novh') === null) {
				filteredLinks.push(styles[i].href);
			}
		}
		return filteredLinks;
	},
	processLinks = function() {
		//prepare to match each link
		for (var i = 0; i < links.length; i++) {
			xhr(links[i], storeCSS);
		}
	},
	storeCSS = function(response, link) {
		preCSS.push(response.responseText);
		CSSLinks.push(link);
		if (CSSLinks.length === links.length) {
			for (var j = 0; j < CSSLinks.length; j++) {
				matchCSS(preCSS[j], CSSLinks[j]);
			}
			if ((links = importLinks.slice(0)).length > 0) { //after finishing all current links, set links equal to the new imports found
				CSSLinks = [];
				preCSS = [];
				importLinks = [];
				processLinks();
			} else {
				buildCSS();
			}
		}
	},
	matchCSS = function(sheetCSS, link) { // collect all of the rules from the xhr response texts and match them to a pattern
		var clean = removeMediaQueries(sheetCSS).replace(/\/\*[\s\S]*?\*\//g, ''), // remove MediaQueries and comments
			pattern = /[\w\d\s\-\/\\\[\]:,.'"*()<>+~%#^$_=|@]+\{[\w\d\s\-\/\\%#:!;,.'"*()]+\d*\.?\d+vh[\w\d\s\-\/\\%#:!;,.'"*()]*\}/g, //find selectors that use vh in one or more of their rules
			current = clean.match(pattern),
			vhPattern = /\d*\.?\d+vh/g,
			vhCurrent = clean.match(vhPattern),
			sheetPathPattern = /(.*\/)/,
			sheetPath = sheetPathPattern.exec(link)[0], //relative path to css file specified in @import
			importPattern = /@import (?:url\()?['"]?([^'\)"]*)['"]?\)?[^;]*/gm, //matches all @import variations outlined at: https://developer.mozilla.org/en-US/docs/Web/CSS/@import
			importStatement;
		while ((importStatement = importPattern.exec(sheetCSS)) !== null) {
			importLinks.push(sheetPath + importStatement[1]);
		}
		if (current !== null && current.length !== 0) {
			found = found.concat(current); // save all of the blocks of rules with vh in a property
			foundProps = foundProps.concat(vhCurrent); // save all of the properties with vh
		}
	},
	buildCSS = function() { // first build each individual rule from elements in the found array and then add it to the string of rules.
		var pattern = /[\w\d\s\-\/\\%#:,.'"*()]+\d*\.?\d+vh[\w\d\s\-\/\\%#:!,.'"*()]*[;}]/g; // find properties with vh values in them
		for (var i = 0; i < found.length; i++) {
			rules = rules + found[i].substr(0, found[i].indexOf("{") + 1); // save the selector portion of each rule with a vh value
			var current = found[i].match(pattern);
			for (var j = 0; j < current.length; j++) { // build a new set of with only the selector and properties that have vh in the value
				rules = rules + current[j];
				if (j === current.length - 1 && rules[rules.length - 1] !== "}") {
					rules = rules + "\n}";
				}
			}
		}
		parseCSS();
	},
	parseCSS = function() { // replace each set of parentheses with evaluated content
		for (var i = 0; i < foundProps.length; i++) {
			css[i] = Math.round(parseFloat((foundProps[i].substr(0, foundProps[i].length - 2) / 100) * vh)) + 'px';
		}
		loadCSS();
	},
	loadCSS = function() { // replace and load the new rules
		for (var i = 0; i < css.length; i++) { // only run this loop as many times as css has entries
			if (css[i]) {
				rules = rules.replace(foundProps[i], css[i]); // replace old rules with our processed rules
			}
		}
		var vhcss = document.createElement('style');
		vhcss.setAttribute('type', 'text/css');
		vhcss.id = 'vhReplace';
		document.getElementsByTagName('head')[0].appendChild(vhcss); // create the new element
		if (vhcss.styleSheet) {
			vhcss.styleSheet.cssText = rules; // IE8 will not support innerHTML on read-only elements, such as STYLE
		} else {
			vhcss.appendChild(document.createTextNode(rules));
		}
	},
	xhr = function(url, callback) { // create new XMLHttpRequest object and run it
		try {
			//try to create a request object
			//arranging the two conditions this way is for IE7/8's benefit
			//so that it works with any combination of ActiveX or Native XHR settings, 
			//as long as one or the other is enabled; but if both are enabled
			//it prefers ActiveX, which means it still works with local files
			//(Native XHR in IE7/8 is blocked and throws "access is denied",
			// but ActiveX is permitted if the user allows it [default is to prompt])
			var xhr = window.ActiveXObject ? (new ActiveXObject('Microsoft.XMLHTTP') || new ActiveXObject('Msxml2.XMLHTTP')) : new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					callback(xhr, url);
				} // else { callback function on AJAX error }
			};
			xhr.send(null);
		} catch (e) {
			if (window.XDomainRequest) {
				var xdr = new XDomainRequest();
				xdr.open('get', url);
				xdr.onload = function() {
					callback(xdr, url);
				};
				xdr.onerror = function() {
					return false; // xdr load fail
				};
				xdr.send();
			}
		}
	},
	// Remove queries.
	removeMediaQueries = function(css) {
		// Test for Media Query support
		if (!window.matchMedia && !window.msMatchMedia) {
			// If the browser doesn't support media queries, we find all @media declarations in the CSS and remove them.
			// Note: Since @rules can't be nested in the CSS spec, we're safe to just check for the closest following "}}" to the "@media".
			css = css.replace(/@media[\s\S]*?\}\s*\}/g, "");
		}
		return css;
	};
	if (!cssvhunit()) { // this checks if the vh value is supported
		var rules = '', // initialize the rules variable in this scope so it can be used later
			links = isStyleSheet(), // initialize the array holding the sheets urls for use later
			importLinks = [], //initialize the array holding the import sheet urls for use later
			found = [], // initialize the array holding the found rules for use later
			foundProps = [], // initialize the array holding the found properties for use later
			preCSS = [], // initialize array that holds css before being parsed
			CSSLinks = [], //initialize array holding css links returned from xhr
			css = [], // initialize the array holding the parsed rules for use later
			vh = '';
		vh = (function() {
			var size;
			size = getviewport()[1];
			return size;
		}());
		processLinks();
	} // else { do nothing, you are awesome and have REM support }
})(window);
