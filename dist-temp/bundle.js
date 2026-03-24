/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/socket.io-parser/node_modules/debug/src/browser.js"
/*!*************************************************************************!*\
  !*** ./node_modules/socket.io-parser/node_modules/debug/src/browser.js ***!
  \*************************************************************************/
(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	let m;

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	// eslint-disable-next-line no-return-assign
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(/*! ./common */ "./node_modules/socket.io-parser/node_modules/debug/src/common.js")(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ },

/***/ "./node_modules/socket.io-parser/node_modules/debug/src/common.js"
/*!************************************************************************!*\
  !*** ./node_modules/socket.io-parser/node_modules/debug/src/common.js ***!
  \************************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(/*! ms */ "./node_modules/socket.io-parser/node_modules/ms/index.js");
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		const split = (typeof namespaces === 'string' ? namespaces : '')
			.trim()
			.replace(/\s+/g, ',')
			.split(',')
			.filter(Boolean);

		for (const ns of split) {
			if (ns[0] === '-') {
				createDebug.skips.push(ns.slice(1));
			} else {
				createDebug.names.push(ns);
			}
		}
	}

	/**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */
	function matchesTemplate(search, template) {
		let searchIndex = 0;
		let templateIndex = 0;
		let starIndex = -1;
		let matchIndex = 0;

		while (searchIndex < search.length) {
			if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
				// Match character or proceed with wildcard
				if (template[templateIndex] === '*') {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++; // Skip the '*'
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
				// Backtrack to the last '*' and try to match more characters
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else {
				return false; // No match
			}
		}

		// Handle trailing '*' in template
		while (templateIndex < template.length && template[templateIndex] === '*') {
			templateIndex++;
		}

		return templateIndex === template.length;
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names,
			...createDebug.skips.map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		for (const skip of createDebug.skips) {
			if (matchesTemplate(name, skip)) {
				return false;
			}
		}

		for (const ns of createDebug.names) {
			if (matchesTemplate(name, ns)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ },

/***/ "./node_modules/socket.io-parser/node_modules/ms/index.js"
/*!****************************************************************!*\
  !*** ./node_modules/socket.io-parser/node_modules/ms/index.js ***!
  \****************************************************************/
(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ },

/***/ "./assets/audio/impact-shared.mp3"
/*!****************************************!*\
  !*** ./assets/audio/impact-shared.mp3 ***!
  \****************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "de227f0048779b4e16e2.mp3";

/***/ },

/***/ "./assets/audio/space-bgm.mp3"
/*!************************************!*\
  !*** ./assets/audio/space-bgm.mp3 ***!
  \************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "b8a4e74ed597d06874a1.mp3";

/***/ },

/***/ "./assets/planets/Planets/planet00.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet00.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "6130d658fa08519167dc.png";

/***/ },

/***/ "./assets/planets/Planets/planet01.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet01.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "519ec87b9662bc976c0a.png";

/***/ },

/***/ "./assets/planets/Planets/planet02.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet02.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "d95f12b71fe3884ffb67.png";

/***/ },

/***/ "./assets/planets/Planets/planet03.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet03.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "c115be88b73a9f413790.png";

/***/ },

/***/ "./assets/planets/Planets/planet04.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet04.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "4af4c00eb4888baa06e0.png";

/***/ },

/***/ "./assets/planets/Planets/planet05.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet05.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "73ceaa54a7b8506fedf7.png";

/***/ },

/***/ "./assets/planets/Planets/planet06.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet06.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "1fae756979ccafca4d3d.png";

/***/ },

/***/ "./assets/planets/Planets/planet07.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet07.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "d8cea8a2467870e44707.png";

/***/ },

/***/ "./assets/planets/Planets/planet08.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet08.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "9b60f350be03bb11f738.png";

/***/ },

/***/ "./assets/planets/Planets/planet09.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet09.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "7175b844a6681bf4d662.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0000.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0000.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "e8b3fe7d920eeb192a11.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0004.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0004.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "5e2ff325333d330d85bf.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0008.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0008.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "73b96227760eedc74f2f.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0012.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0012.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "6f193a8b8f6e32760091.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0016.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0016.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "57f41a28cf3832e4dfc3.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0020.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0020.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "727f77fc52df4f1428b9.png";

/***/ },

/***/ "./js/assets.js"
/*!**********************!*\
  !*** ./js/assets.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getOnlinePlanetTexture: () => (/* binding */ getOnlinePlanetTexture),
/* harmony export */   getOnlineShipTexture: () => (/* binding */ getOnlineShipTexture),
/* harmony export */   getPlanetTexture: () => (/* binding */ getPlanetTexture),
/* harmony export */   getShipTexture: () => (/* binding */ getShipTexture),
/* harmony export */   loadAssets: () => (/* binding */ loadAssets)
/* harmony export */ });
const PLANET_IMAGE_URLS = {
  base: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet04.png */ "./assets/planets/Planets/planet04.png"), __webpack_require__.b).href,
  rebuiltBlue: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet00.png */ "./assets/planets/Planets/planet00.png"), __webpack_require__.b).href,
  rebuiltRed: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet08.png */ "./assets/planets/Planets/planet08.png"), __webpack_require__.b).href,
  'online-1': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet00.png */ "./assets/planets/Planets/planet00.png"), __webpack_require__.b).href,
  'online-2': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet01.png */ "./assets/planets/Planets/planet01.png"), __webpack_require__.b).href,
  'online-3': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet02.png */ "./assets/planets/Planets/planet02.png"), __webpack_require__.b).href,
  'online-4': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet03.png */ "./assets/planets/Planets/planet03.png"), __webpack_require__.b).href,
  'online-5': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet05.png */ "./assets/planets/Planets/planet05.png"), __webpack_require__.b).href,
  'online-6': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet06.png */ "./assets/planets/Planets/planet06.png"), __webpack_require__.b).href,
  'online-7': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet07.png */ "./assets/planets/Planets/planet07.png"), __webpack_require__.b).href,
  'online-8': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet08.png */ "./assets/planets/Planets/planet08.png"), __webpack_require__.b).href,
  'online-9': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet09.png */ "./assets/planets/Planets/planet09.png"), __webpack_require__.b).href,
};

const SHIP_IMAGE_URLS = {
  blue: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0000.png */ "./assets/planets/Ships/ship_0000.png"), __webpack_require__.b).href,
  red: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0012.png */ "./assets/planets/Ships/ship_0012.png"), __webpack_require__.b).href,
  'slot-1': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0000.png */ "./assets/planets/Ships/ship_0000.png"), __webpack_require__.b).href,
  'slot-2': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0004.png */ "./assets/planets/Ships/ship_0004.png"), __webpack_require__.b).href,
  'slot-3': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0008.png */ "./assets/planets/Ships/ship_0008.png"), __webpack_require__.b).href,
  'slot-4': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0012.png */ "./assets/planets/Ships/ship_0012.png"), __webpack_require__.b).href,
  'slot-5': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0016.png */ "./assets/planets/Ships/ship_0016.png"), __webpack_require__.b).href,
  'slot-6': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0020.png */ "./assets/planets/Ships/ship_0020.png"), __webpack_require__.b).href,
  'online-1': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0000.png */ "./assets/planets/Ships/ship_0000.png"), __webpack_require__.b).href,
  'online-2': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0004.png */ "./assets/planets/Ships/ship_0004.png"), __webpack_require__.b).href,
  'online-3': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0008.png */ "./assets/planets/Ships/ship_0008.png"), __webpack_require__.b).href,
  'online-4': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0012.png */ "./assets/planets/Ships/ship_0012.png"), __webpack_require__.b).href,
  'online-5': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0016.png */ "./assets/planets/Ships/ship_0016.png"), __webpack_require__.b).href,
  'online-6': new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0020.png */ "./assets/planets/Ships/ship_0020.png"), __webpack_require__.b).href,
};

const ONLINE_SHIP_ALIAS = {
  'slot-1': 'online-1',
  'slot-2': 'online-2',
  'slot-3': 'online-3',
  'slot-4': 'online-4',
  'slot-5': 'online-5',
  'slot-6': 'online-6',
};

const imageCache = new Map();

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadAssets() {
  const entries = [
    ...Object.entries(PLANET_IMAGE_URLS).map(([key, url]) => [`planet:${key}`, url]),
    ...Object.entries(SHIP_IMAGE_URLS).map(([key, url]) => [`ship:${key}`, url]),
  ];
  await Promise.all(entries.map(async ([key, url]) => {
    const image = await loadImage(url);
    imageCache.set(key, image);
  }));
}

function getPlanetTexture(key = 'base') {
  return imageCache.get(`planet:${key}`) || imageCache.get('planet:base') || null;
}

function getShipTexture(team) {
  return imageCache.get(`ship:${team}`) || imageCache.get(`ship:${ONLINE_SHIP_ALIAS[team]}`) || null;
}

function getOnlineShipTexture(key) {
  return imageCache.get(`ship:${key}`) || imageCache.get('ship:online-1') || getShipTexture('blue');
}

function getOnlinePlanetTexture(key) {
  return imageCache.get(`planet:${key}`) || imageCache.get('planet:base') || null;
}


/***/ },

/***/ "./js/audio.js"
/*!*********************!*\
  !*** ./js/audio.js ***!
  \*********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioManager: () => (/* binding */ AudioManager)
/* harmony export */ });
const BGM_TRACK_URL = new URL(/* asset import */ __webpack_require__(/*! ../assets/audio/space-bgm.mp3 */ "./assets/audio/space-bgm.mp3"), __webpack_require__.b).href;
const IMPACT_SHARED_URL = new URL(/* asset import */ __webpack_require__(/*! ../assets/audio/impact-shared.mp3 */ "./assets/audio/impact-shared.mp3"), __webpack_require__.b).href;

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.track = null;
    this.trackSource = null;
    this.buffers = new Map();
    this.loadingBuffers = new Map();
    this.lastSfxAt = new Map();
    this.started = false;
    this.enabled = true;
    this.scene = 'start';
    this.button = null;
    this.lastSceneApplied = '';
    this.playPromise = null;
  }

  attachButton(button) {
    this.button = button;
    if (!this.button) return;
    this.button.addEventListener('click', async () => {
      const wasStarted = this.started;
      await this.ensureStarted();
      if (!wasStarted) {
        this.syncButton();
        return;
      }
      this.enabled = !this.enabled;
      this.applySceneMix(true);
      if (this.enabled) {
        this.tryPlayTrack();
      } else {
        this.track?.pause();
      }
      this.syncButton();
    });
    this.syncButton();
  }

  syncButton() {
    if (!this.button) return;
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.classList.toggle('is-muted', !this.enabled);
    this.button.textContent = this.enabled ? 'AUDIO' : 'MUTE';
  }

  async ensureStarted() {
    if (!this.ctx) {
      this.createEngine();
    }
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.started) {
      this.started = true;
      this.applySceneMix(true);
    }
    if (this.enabled) {
      await this.tryPlayTrack();
    }
  }

  createEngine() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.0001;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.82;
    this.sfxBus.connect(this.master);

    this.track = new Audio(BGM_TRACK_URL);
    this.track.loop = true;
    this.track.preload = 'auto';

    this.trackSource = this.ctx.createMediaElementSource(this.track);
    this.trackSource.connect(this.musicBus);
  }

  async loadBuffer(key, url) {
    if (!this.ctx) return null;
    if (this.buffers.has(key)) return this.buffers.get(key);
    if (this.loadingBuffers.has(key)) return this.loadingBuffers.get(key);

    const pending = fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.ctx.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(key, buffer);
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        this.loadingBuffers.delete(key);
      });

    this.loadingBuffers.set(key, pending);
    return pending;
  }

  playBuffer(buffer, { gain = 1, playbackRate = 1 } = {}) {
    if (!this.ctx || !this.sfxBus || !buffer || !this.enabled) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = gain;

    source.connect(gainNode);
    gainNode.connect(this.sfxBus);
    source.start();
  }

  canPlaySfx(key, cooldownMs) {
    const now = performance.now();
    const lastPlayedAt = this.lastSfxAt.get(key) || 0;
    if (now - lastPlayedAt < cooldownMs) return false;
    this.lastSfxAt.set(key, now);
    return true;
  }

  async playPlanetImpact() {
    if (!this.started || !this.enabled) return;
    if (!this.canPlaySfx('planet-impact', 90)) return;
    const buffer = await this.loadBuffer('impact-shared', IMPACT_SHARED_URL);
    if (!buffer) return;
    this.playBuffer(buffer, {
      gain: 0.24 + Math.random() * 0.05,
      playbackRate: 1.14 + Math.random() * 0.14,
    });
  }

  async playPlanetShatter() {
    if (!this.started || !this.enabled) return;
    const buffer = await this.loadBuffer('impact-shared', IMPACT_SHARED_URL);
    if (!buffer) return;
    this.playBuffer(buffer, {
      gain: 0.88 + Math.random() * 0.08,
      playbackRate: 0.72 + Math.random() * 0.06,
    });
  }

  setScene(scene) {
    this.scene = scene;
    this.applySceneMix();
  }

  applySceneMix(immediate = false) {
    if (!this.ctx || !this.master || !this.musicBus) return;

    const now = this.ctx.currentTime;
    const ramp = immediate ? 0.01 : 0.9;
    const sceneMix = this.enabled
      ? this.scene === 'playing'
        ? { master: 0.76, music: 0.92 }
        : this.scene === 'victory'
          ? { master: 0.58, music: 0.76 }
          : { master: 0.68, music: 0.84 }
      : { master: 0.0001, music: 0.0001 };

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(sceneMix.master, now + ramp);

    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.linearRampToValueAtTime(sceneMix.music, now + ramp);

    this.lastSceneApplied = this.scene;
  }

  async tryPlayTrack() {
    if (!this.track || !this.enabled) return;
    if (!this.track.paused) return;
    if (this.playPromise) return this.playPromise;

    this.playPromise = this.track.play()
      .catch(() => {})
      .finally(() => {
        this.playPromise = null;
      });

    return this.playPromise;
  }

  tick() {
    if (!this.ctx || !this.started) return;

    if (this.lastSceneApplied !== this.scene) {
      this.applySceneMix();
    }

    if (this.enabled && this.ctx.state === 'running' && this.track?.paused) {
      this.tryPlayTrack();
    }
  }
}


/***/ },

/***/ "./js/camera.js"
/*!**********************!*\
  !*** ./js/camera.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config.js */ "./js/config.js");



class Camera {
  constructor() {
    this.position = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(_config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.width * 0.5, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.height * 0.5);
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 1.2;
    this.zoomSmooth = 0.05;
    this.posSmooth = 0.1;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.impactShakeMultiplier = 0;
    this.shakeOffset = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2();
  }

  update(p1, p2, viewportWidth, viewportHeight, tick = 1) {
    const midX = (p1.pos.x + p2.pos.x) * 0.5;
    const midY = (p1.pos.y + p2.pos.y) * 0.5;
    const spanX = Math.abs(p1.pos.x - p2.pos.x) + 420;
    const spanY = Math.abs(p1.pos.y - p2.pos.y) + 320;
    const targetZoom = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(
      Math.min(viewportWidth / spanX, viewportHeight / spanY),
      this.minZoom,
      this.maxZoom,
    );

    this.zoom = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.zoom, targetZoom, 1 - Math.pow(1 - this.zoomSmooth, tick));
    this.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.position.x, midX, 1 - Math.pow(1 - this.posSmooth, tick));
    this.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.position.y, midY, 1 - Math.pow(1 - this.posSmooth, tick));

    const halfWidth = viewportWidth / this.zoom / 2;
    const halfHeight = viewportHeight / this.zoom / 2;

    this.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(this.position.x, halfWidth, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.width - halfWidth);
    this.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(this.position.y, halfHeight, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.height - halfHeight);

    this.impactShakeMultiplier = Math.max(0, this.impactShakeMultiplier - 0.03 * tick);

    if (this.shakeTime > 0 || this.shakeStrength > 0.01) {
      this.shakeTime = Math.max(0, this.shakeTime - tick);
      const activeDamping = Math.pow(0.9, tick);
      const idleDamping = Math.pow(0.62, tick);
      this.shakeStrength *= this.shakeTime > 0 ? activeDamping : idleDamping;
      if (this.shakeStrength < 0.01) this.shakeStrength = 0;
      const intensity = this.shakeStrength;
      this.shakeOffset.set((Math.random() * 2 - 1) * intensity, (Math.random() * 2 - 1) * intensity);
    } else {
      this.shakeStrength = 0;
      this.shakeOffset.set(0, 0);
    }
  }

  apply(ctx, canvas) {
    ctx.save();
    ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x + this.shakeOffset.x, -this.position.y + this.shakeOffset.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  worldToScreen(x, y, canvas) {
    return {
      x: (x - this.position.x) * this.zoom + canvas.width * 0.5,
      y: (y - this.position.y) * this.zoom + canvas.height * 0.5,
    };
  }

  screenToWorld(x, y, canvas) {
    return {
      x: (x - canvas.width * 0.5) / this.zoom + this.position.x,
      y: (y - canvas.height * 0.5) / this.zoom + this.position.y,
    };
  }

  shake(strength = 10, duration = 10, { progressive = false } = {}) {
    let appliedStrength = strength;
    if (progressive) {
      this.impactShakeMultiplier = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(this.impactShakeMultiplier + 0.18, 0, 1);
      appliedStrength *= 0.35 + this.impactShakeMultiplier * 0.65;
    }

    this.shakeStrength = Math.max(this.shakeStrength * 0.72, appliedStrength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  resetShake() {
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.impactShakeMultiplier = 0;
    this.shakeOffset.set(0, 0);
  }
}


/***/ },

/***/ "./js/collision.js"
/*!*************************!*\
  !*** ./js/collision.js ***!
  \*************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   overlapsCircle: () => (/* binding */ overlapsCircle),
/* harmony export */   resolveCircleCollision: () => (/* binding */ resolveCircleCollision)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");


function overlapsCircle(a, b, padding = 0) {
  const radius = (a.radius || 0) + (b.radius || 0) + padding;
  return (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.distance)(a, b) < radius;
}

function resolveCircleCollision(a, b, push = 0.5) {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dist = Math.hypot(dx, dy) || 0.001;
  const minDist = a.radius + b.radius;
  const overlap = minDist - dist;

  if (overlap <= 0) {
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const offset = overlap * push;

  a.pos.x -= nx * offset;
  a.pos.y -= ny * offset;
  b.pos.x += nx * offset;
  b.pos.y += ny * offset;

  a.vel.x -= nx * 0.08;
  a.vel.y -= ny * 0.08;
  b.vel.x += nx * 0.08;
  b.vel.y += ny * 0.08;
}


/***/ },

/***/ "./js/config.js"
/*!**********************!*\
  !*** ./js/config.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BALANCE: () => (/* binding */ BALANCE),
/* harmony export */   BUFF_LABELS: () => (/* binding */ BUFF_LABELS),
/* harmony export */   ITEM_TYPES: () => (/* binding */ ITEM_TYPES),
/* harmony export */   TEAM_COLORS: () => (/* binding */ TEAM_COLORS),
/* harmony export */   WORLD: () => (/* binding */ WORLD)
/* harmony export */ });
const WORLD = {
  width: 2000,
  height: 2000,
  stars: 150,
  grid: 100,
  planets: 6,
};

const TEAM_COLORS = {
  blue: {
    primary: '#4fd4ff',
    secondary: '#128be6',
    glow: 'rgba(79, 212, 255, 0.32)',
    text: 'Blue Fleet',
  },
  red: {
    primary: '#ff8a7a',
    secondary: '#ef4747',
    glow: 'rgba(255, 138, 122, 0.32)',
    text: 'Red Fleet',
  },
  neutral: {
    primary: '#d6d8de',
    secondary: '#79859a',
    glow: 'rgba(214, 216, 222, 0.18)',
    text: 'Neutral',
  },
  'slot-1': {
    primary: '#4fd4ff',
    secondary: '#0f6cdd',
    glow: 'rgba(79, 212, 255, 0.28)',
    text: 'Azure',
  },
  'slot-2': {
    primary: '#ff8a7a',
    secondary: '#e14d55',
    glow: 'rgba(255, 138, 122, 0.28)',
    text: 'Ember',
  },
  'slot-3': {
    primary: '#ffd36f',
    secondary: '#d6861b',
    glow: 'rgba(255, 211, 111, 0.26)',
    text: 'Solar',
  },
  'slot-4': {
    primary: '#7cffd8',
    secondary: '#14b88e',
    glow: 'rgba(124, 255, 216, 0.24)',
    text: 'Mint',
  },
  'slot-5': {
    primary: '#8fb7ff',
    secondary: '#4268ff',
    glow: 'rgba(143, 183, 255, 0.26)',
    text: 'Nova',
  },
  'slot-6': {
    primary: '#ffb46b',
    secondary: '#ff6d3a',
    glow: 'rgba(255, 180, 107, 0.26)',
    text: 'Flare',
  },
};

const BALANCE = {
  mothership: {
    radius: 28,
    health: 100,
    acceleration: 0.2,
    maxSpeed: 3,
    friction: 0.95,
    boostMultiplier: 1.75,
    boostTransition: 0.18,
    turnSpeed: 0.12,
    turnAcceleration: 0.028,
    turnDrag: 0.82,
    spawnRate: 30,
    baseCap: 30,
  },
  drone: {
    radius: 8,
    health: 30,
    maxSpeed: 2.8,
    senseRange: 80,
    attackCooldown: 18,
    attackDamage: 6,
    shipDamage: 3.5,
    planetDamage: 4.5,
  },
  planet: {
    radius: 48,
    health: 200,
    captureRestore: 0.2,
    recoverPerFrame: 0.06,
    recoverDelay: 180,
    supportSpawnRate: 240,
    supportThreshold: 0.3,
  },
  item: {
    radius: 20,
    maxActive: 3,
    spawnRate: 600,
  },
};

const ITEM_TYPES = [
  { id: 'ship-speed', icon: 'thruster', name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.', duration: 3, accent: '#75f2ff' },
  { id: 'production', icon: 'factory', name: 'Production', description: 'Drone output doubles for 3 seconds.', duration: 3, accent: '#ffd95a' },
  { id: 'drone-size', icon: 'expand', name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.', duration: 3, accent: '#ffb05c' },
  { id: 'drone-speed', icon: 'bolt', name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.', duration: 3, accent: '#7cffd8' },
  { id: 'drone-attack', icon: 'crosshair', name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.', duration: 3, accent: '#ff8a7a' },
  { id: 'neutralize', icon: 'eclipse', name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.', duration: 0, accent: '#c8d1ff' },
  { id: 'autocapture', icon: 'flag', name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.', duration: 3, accent: '#b2ff8e' },
];

const BUFF_LABELS = {
  shipSpeed: 'Ship Speed',
  production: 'Production',
  droneSize: 'Drone Size',
  droneSpeed: 'Drone Speed',
  droneDamage: 'Attack x2',
  autocapture: 'Auto Capture',
};


/***/ },

/***/ "./js/controls.js"
/*!************************!*\
  !*** ./js/controls.js ***!
  \************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Controls: () => (/* binding */ Controls)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");


class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.mode = 'local';
    this.keys = new Set();
    this.codes = new Set();
    this.touchBoost = {
      blue: false,
      red: false,
      online: false,
    };
    this.touchState = {
      blue: this.createTouchSlot(),
      red: this.createTouchSlot(),
      online: this.createTouchSlot(),
    };
    this.bind();
  }

  createTouchSlot() {
    return {
      active: false,
      id: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      vector: new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(),
    };
  }

  setMode(mode) {
    this.mode = mode === 'online' ? 'online' : 'local';
    this.touchBoost.online = false;
    this.touchBoost.blue = false;
    this.touchBoost.red = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
    this.touchState.online = this.createTouchSlot();
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      this.codes.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
      this.codes.delete(event.code);
    });

    this.canvas.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
    this.canvas.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });
    this.canvas.addEventListener('touchend', (event) => this.handleTouchEnd(event), { passive: false });
    this.canvas.addEventListener('touchcancel', (event) => this.handleTouchEnd(event), { passive: false });

    this.bindBoostButton('blue', document.getElementById('blue-boost-button'));
    this.bindBoostButton('red', document.getElementById('red-boost-button'));
    this.bindBoostButton('online', document.getElementById('online-boost-button'));
  }

  bindBoostButton(team, element) {
    if (!element) return;

    const activate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = true;
    };

    const deactivate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = false;
    };

    element.addEventListener('pointerdown', activate);
    element.addEventListener('pointerup', deactivate);
    element.addEventListener('pointerleave', deactivate);
    element.addEventListener('pointercancel', deactivate);
  }

  handleTouchStart(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const midpoint = rect.left + rect.width * 0.5;

    for (const touch of event.changedTouches) {
      if (this.mode === 'online') {
        if (touch.clientX >= midpoint || this.touchState.online.active) continue;
        this.activateTouchSlot(this.touchState.online, touch);
        continue;
      }

      const side = touch.clientX < midpoint ? 'blue' : 'red';
      if (this.touchState[side].active) continue;
      this.activateTouchSlot(this.touchState[side], touch);
    }
  }

  activateTouchSlot(slot, touch) {
    slot.active = true;
    slot.id = touch.identifier;
    slot.startX = touch.clientX;
    slot.startY = touch.clientY;
    slot.currentX = touch.clientX;
    slot.currentY = touch.clientY;
    slot.vector.set(0, 0);
  }

  handleTouchMove(event) {
    event.preventDefault();

    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) continue;

      const slot = this.touchState[side];
      slot.currentX = touch.clientX;
      slot.currentY = touch.clientY;
      const dx = slot.currentX - slot.startX;
      const dy = slot.currentY - slot.startY;
      slot.vector.set(dx / 60, dy / 60);
      if (slot.vector.length() > 1) {
        slot.vector.normalize();
      }
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) continue;
      this.touchState[side] = this.createTouchSlot();
    }
  }

  findTouchSide(identifier) {
    for (const side of ['blue', 'red', 'online']) {
      if (this.touchState[side].id === identifier) {
        return side;
      }
    }
    return null;
  }

  getMoveVector(team) {
    const vector = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2();

    if (team === 'blue') {
      if (this.keys.has('w')) vector.y -= 1;
      if (this.keys.has('s')) vector.y += 1;
      if (this.keys.has('a')) vector.x -= 1;
      if (this.keys.has('d')) vector.x += 1;
    } else {
      if (this.keys.has('arrowup')) vector.y -= 1;
      if (this.keys.has('arrowdown')) vector.y += 1;
      if (this.keys.has('arrowleft')) vector.x -= 1;
      if (this.keys.has('arrowright')) vector.x += 1;
    }

    const slot = this.touchState[team];
    vector.x += slot.vector.x;
    vector.y += slot.vector.y;
    if (vector.length() > 1) {
      vector.normalize();
    }
    return vector;
  }

  getOnlineInput() {
    const vector = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2();
    if (this.keys.has('w')) vector.y -= 1;
    if (this.keys.has('s')) vector.y += 1;
    if (this.keys.has('a')) vector.x -= 1;
    if (this.keys.has('d')) vector.x += 1;

    vector.x += this.touchState.online.vector.x;
    vector.y += this.touchState.online.vector.y;
    if (vector.length() > 1) {
      vector.normalize();
    }

    return {
      x: vector.x,
      y: vector.y,
      boost: this.codes.has('Space') || this.touchBoost.online,
    };
  }

  getJoystickState(team) {
    const slot = this.touchState[team];
    if (!slot?.active) return null;
    return {
      startX: slot.startX,
      startY: slot.startY,
      currentX: slot.startX + slot.vector.x * 60,
      currentY: slot.startY + slot.vector.y * 60,
    };
  }

  getBoostHeld(team) {
    if (team === 'blue') {
      return this.codes.has('Space') || this.touchBoost.blue;
    }
    return this.codes.has('NumpadEnter') || this.touchBoost.red;
  }

  reset() {
    this.keys.clear();
    this.codes.clear();
    this.touchBoost.blue = false;
    this.touchBoost.red = false;
    this.touchBoost.online = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
    this.touchState.online = this.createTouchSlot();
  }
}


/***/ },

/***/ "./js/entities/drone.js"
/*!******************************!*\
  !*** ./js/entities/drone.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Drone: () => (/* binding */ Drone)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");



class Drone {
  constructor(team, x, y) {
    this.team = team;
    this.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team];
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(x, y);
    this.vel = _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.fromAngle((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2), (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0.2, 1.2));
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.radius;
    this.baseRadius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.health;
    this.health = this.maxHealth;
    this.senseRange = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.senseRange;
    this.attackCooldown = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackCooldown);
    this.heading = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2);
    this.orbitSeed = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2);
    this.destroyedByImpact = false;
  }

  calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time) {
    const separation = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    const alignment = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    const cohesion = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    let closeAllies = 0;
    let farAllies = 0;

    for (const ally of allies) {
      if (ally === this) continue;
      const dx = this.pos.x - ally.pos.x;
      const dy = this.pos.y - ally.pos.y;
      const dist = Math.hypot(dx, dy) || 0.001;

      if (dist < 18) {
        separation.x += dx / dist;
        separation.y += dy / dist;
        closeAllies += 1;
      }

      if (dist < 70) {
        alignment.add(ally.vel);
        cohesion.add(ally.pos);
        farAllies += 1;
      }
    }

    if (closeAllies > 0) {
      separation.scale(1 / closeAllies).normalize().scale(0.62);
    }

    if (farAllies > 0) {
      alignment.scale(1 / farAllies).normalize().scale(0.22);
      cohesion.scale(1 / farAllies).subtract(this.pos).normalize().scale(0.2);
    }

    let target = null;
    let hostileTargetDistance = Infinity;

    for (const enemy of enemies) {
      const dist = this.pos.distanceTo(enemy.pos);
      if (dist < Math.max(this.senseRange, 150) && dist < hostileTargetDistance) {
        target = enemy;
        hostileTargetDistance = dist;
      }
    }

    const enemyShipDistance = this.pos.distanceTo(enemyMothership.pos);
    if (enemyShipDistance < 220 && enemyShipDistance < hostileTargetDistance) {
      target = enemyMothership;
      hostileTargetDistance = enemyShipDistance;
    }

    // When both are available, hostile units should always outrank planets.
    if (!target) {
      let planetTargetDistance = Infinity;
      for (const planet of planets) {
        if (planet.owner === this.team) continue;
        const dist = this.pos.distanceTo(planet.pos);
        if (dist < 260 && dist < planetTargetDistance) {
          target = planet;
          planetTargetDistance = dist;
        }
      }
    }

    const targetForce = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    if (target) {
      targetForce.set(target.pos.x - this.pos.x, target.pos.y - this.pos.y).normalize().scale(target.kind === 'planet' ? 0.48 : 0.56);
    } else {
      const orbitRadius = 74 + (this.orbitSeed % 1) * 44;
      const orbitTarget = mothership.pos.clone().add(_utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.fromAngle(this.orbitSeed + time * 0.002, orbitRadius));
      targetForce.set(orbitTarget.x - this.pos.x, orbitTarget.y - this.pos.y).normalize().scale(0.3);
    }

    const edgeForce = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    if (this.pos.x < 120) edgeForce.x += 1;
    if (this.pos.x > world.width - 120) edgeForce.x -= 1;
    if (this.pos.y < 120) edgeForce.y += 1;
    if (this.pos.y > world.height - 120) edgeForce.y -= 1;
    edgeForce.normalize().scale(0.42);

    return { separation, alignment, cohesion, targetForce, edgeForce, target };
  }

  flock(allies, enemies, mothership, enemyMothership, planets, world, tick, time) {
    const forces = this.calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time);
    const modifiers = mothership.getDroneModifiers();
    this.radius = this.baseRadius * modifiers.size;
    const maxSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.maxSpeed * modifiers.speed;

    this.vel
      .add(forces.separation.scale(tick))
      .add(forces.alignment.scale(tick))
      .add(forces.cohesion.scale(tick))
      .add(forces.targetForce.scale(tick))
      .add(forces.edgeForce.scale(tick))
      .limit(maxSpeed);

    this.update(tick);
    this.tryAttack(forces.target, modifiers, mothership);
  }

  tryAttack(target, modifiers, mothership) {
    this.attackCooldown = Math.max(0, this.attackCooldown - 1);
    if (!target || this.attackCooldown > 0) return;

    const attackRange = this.radius + target.radius + 10;
    if (this.pos.distanceTo(target.pos) > attackRange) return;

    this.attackCooldown = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackCooldown;
    const damageScale = modifiers.damage;
    const impactEffect = mothership?.onDroneImpact;

    if (target.kind === 'mothership') {
      target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.shipDamage * damageScale);
      impactEffect?.(this, target);
      return;
    }

    if (target.kind === 'planet') {
      target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.planetDamage * damageScale, this.team);
      impactEffect?.(this, target);
      return;
    }

    target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackDamage * damageScale);
    impactEffect?.(this, target);
  }

  update(tick) {
    this.pos.add(this.vel.clone().scale(tick));
    this.heading = this.vel.length() > 0.01 ? this.vel.angle() : this.heading;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { primary, secondary, glow } = this.color;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.heading);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 1.1, 0);
    ctx.lineTo(-this.radius * 2.3, 0);
    ctx.lineTo(-this.radius * 1.8, this.radius * 0.7);
    ctx.lineTo(-this.radius * 1.4, 0);
    ctx.lineTo(-this.radius * 1.8, -this.radius * 0.7);
    ctx.closePath();
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
    bodyGradient.addColorStop(0, primary);
    bodyGradient.addColorStop(1, secondary);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.45, 0);
    ctx.lineTo(-this.radius * 0.7, this.radius * 0.82);
    ctx.lineTo(-this.radius * 0.5, 0);
    ctx.lineTo(-this.radius * 0.7, -this.radius * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.stroke();
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/item.js"
/*!*****************************!*\
  !*** ./js/entities/item.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Item: () => (/* binding */ Item)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _item_icons_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../item-icons.js */ "./js/item-icons.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




class Item {
  constructor(x, y, type = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.pick)(_config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES)) {
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.radius;
    this.type = type;
    this.pulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
  }

  static random(x, y) {
    return new Item(x, y, (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.pick)(_config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES));
  }

  update(tick) {
    this.pulse += 0.05 * tick;
  }

  applyEffect(mothership, game) {
    switch (this.type.id) {
      case 'ship-speed':
        mothership.applyBuff('shipSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'production':
        mothership.applyBuff('production', { multiplier: 2, duration: this.type.duration });
        break;
      case 'drone-size':
        mothership.applyBuff('droneSize', { multiplier: 1.8, duration: this.type.duration });
        break;
      case 'drone-speed':
        mothership.applyBuff('droneSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'drone-attack':
        mothership.applyBuff('droneDamage', { multiplier: 2, duration: this.type.duration });
        break;
      case 'neutralize':
        game.neutralizeRandomEnemyPlanet(mothership.team);
        break;
      case 'autocapture':
        mothership.applyBuff('autocapture', { multiplier: 1, duration: this.type.duration });
        game.queueAutocapture(mothership.team, this.type.duration);
        break;
      default:
        break;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    const size = this.radius + Math.sin(this.pulse) * 2;
    const glow = size + 12;

    ctx.fillStyle = `${this.type.accent}24`;
    ctx.beginPath();
    ctx.arc(0, 0, glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}aa`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
    ctx.stroke();

    const plateGradient = ctx.createLinearGradient(-size, -size, size, size);
    plateGradient.addColorStop(0, '#102131');
    plateGradient.addColorStop(1, '#07111a');
    ctx.fillStyle = plateGradient;
    ctx.beginPath();
    ctx.roundRect(-size, -size, size * 2, size * 2, 12);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}88`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(-size + 3, -size + 3, size * 2 - 6, size * 0.8, 9);
    ctx.fill();

    (0,_item_icons_js__WEBPACK_IMPORTED_MODULE_1__.drawItemIcon)(ctx, this.type, size * 1.1);
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/mothership.js"
/*!***********************************!*\
  !*** ./js/entities/mothership.js ***!
  \***********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mothership: () => (/* binding */ Mothership)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets.js */ "./js/assets.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




function normalizeAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

class Mothership {
  constructor(team, x, y) {
    this.kind = 'mothership';
    this.team = team;
    this.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team];
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.vel = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2();
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.health;
    this.health = this.maxHealth;
    this.acceleration = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.acceleration;
    this.maxSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.maxSpeed;
    this.friction = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.friction;
    this.boostMultiplier = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.boostMultiplier ?? 1.7;
    this.boostTransition = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.boostTransition ?? 0.16;
    this.boostBlend = 0;
    this.spawnAccumulator = 0;
    this.auraRotationA = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.auraRotationB = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.angle = team === 'blue' ? 0 : Math.PI;
    this.turnSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnSpeed ?? 0.16;
    this.turnAcceleration = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnAcceleration ?? 0.03;
    this.turnDrag = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnDrag ?? 0.84;
    this.angularVelocity = 0;
    this.thrusterPulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.buffs = new Map();
    this.onDroneImpact = null;
  }

  update(input, boosting, tick, world) {
    this.updateBuffs(tick);
    const boostEase = 1 - Math.pow(1 - this.boostTransition, tick);
    this.boostBlend += ((boosting ? 1 : 0) - this.boostBlend) * boostEase;
    this.boostBlend = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.boostBlend, 0, 1);
    const driveMultiplier = this.getShipSpeedMultiplier() * (1 + this.boostBlend * (this.boostMultiplier - 1));

    if (input.length() > 0.01) {
      const thrust = input.clone().normalize().scale(this.acceleration * driveMultiplier * tick);
      this.vel.add(thrust);
      const targetAngle = Math.atan2(input.y, input.x);
      const angleDelta = normalizeAngle(targetAngle - this.angle);
      const turnBoost = driveMultiplier;
      const steerForce = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(angleDelta * this.turnAcceleration * turnBoost, -this.turnAcceleration * 2.2, this.turnAcceleration * 2.2);
      this.angularVelocity += steerForce * tick;
      const maxTurn = this.turnSpeed * turnBoost;
      this.angularVelocity = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.angularVelocity, -maxTurn, maxTurn);
    }

    this.angle += this.angularVelocity * tick;
    this.angularVelocity *= Math.pow(this.turnDrag, tick);
    this.angle = normalizeAngle(this.angle);

    this.vel.scale(Math.pow(this.friction, tick));
    this.vel.limit(this.maxSpeed * driveMultiplier);
    this.pos.add(this.vel.clone().scale(tick));

    this.pos.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.pos.x, this.radius, world.width - this.radius);
    this.pos.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.pos.y, this.radius, world.height - this.radius);

    this.spawnAccumulator += tick;
    this.auraRotationA += 0.015 * tick;
    this.auraRotationB -= 0.011 * tick;
    this.thrusterPulse += 0.18 * tick;

    let ready = 0;
    const actualRate = this.getActualSpawnRate();
    while (this.spawnAccumulator >= actualRate) {
      this.spawnAccumulator -= actualRate;
      ready += 1;
      if (ready >= 4) {
        break;
      }
    }

    return ready;
  }

  getSpawnPosition() {
    const offset = _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2.fromAngle(this.angle + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-0.8, 0.8), this.radius + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(8, 20));
    return this.pos.clone().add(offset);
  }

  getSpawnRate() {
    return _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.spawnRate;
  }

  getActualSpawnRate() {
    return this.getSpawnRate() / this.getBuffMultiplier('production', 1);
  }

  applyBuff(type, data) {
    this.buffs.set(type, {
      type,
      ...data,
      remaining: data.duration * 60,
      total: data.duration * 60,
      label: _config_js__WEBPACK_IMPORTED_MODULE_0__.BUFF_LABELS[type] || type,
    });
  }

  updateBuffs(tick) {
    for (const [key, buff] of this.buffs.entries()) {
      buff.remaining -= tick;
      if (buff.remaining <= 0) {
        this.buffs.delete(key);
      }
    }
  }

  getBuffMultiplier(type, fallback = 1) {
    return this.buffs.get(type)?.multiplier ?? fallback;
  }

  getShipSpeedMultiplier() {
    return this.getBuffMultiplier('shipSpeed', 1);
  }

  getDroneModifiers() {
    return {
      size: this.getBuffMultiplier('droneSize', 1),
      speed: this.getBuffMultiplier('droneSpeed', 1),
      damage: this.getBuffMultiplier('droneDamage', 1),
    };
  }

  getActiveBuffs() {
    return [...this.buffs.values()].map((buff) => ({
      type: buff.type,
      label: buff.label,
      remaining: buff.remaining,
      total: buff.total,
    }));
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { glow } = this.color;
    const shipTexture = (0,_assets_js__WEBPACK_IMPORTED_MODULE_1__.getShipTexture)(this.team);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);

    const speed = this.vel.length();
    if (speed > 0.18 || this.boostBlend > 0.05) {
      const boostFlare = this.boostBlend * 32;
      const flameLength = 26 + speed * 5.8 + Math.sin(this.thrusterPulse) * (5.2 + this.boostBlend * 5.8) + boostFlare;
      const flameWidth = 11 + this.boostBlend * 8.5;
      ctx.fillStyle = `rgba(255, 214, 132, ${0.82 + this.boostBlend * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 3, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), flameWidth * 1.28);
      ctx.lineTo(-this.radius - 11, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), -flameWidth * 1.28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 120, 72, ${0.18 + this.boostBlend * 0.24})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 2, 0);
      ctx.lineTo(-this.radius - flameLength, flameWidth);
      ctx.lineTo(-this.radius - 6, 0);
      ctx.lineTo(-this.radius - flameLength, -flameWidth);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 248, 230, ${0.74 + this.boostBlend * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 1, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, 5.4 + this.boostBlend * 3.8);
      ctx.lineTo(-this.radius - 7, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, -5.4 - this.boostBlend * 3.8);
      ctx.closePath();
      ctx.fill();

      if (this.boostBlend > 0.12) {
        ctx.fillStyle = `rgba(123, 223, 255, ${0.28 + this.boostBlend * 0.34})`;
        ctx.beginPath();
        ctx.moveTo(-this.radius - 8, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, 3.2 + this.boostBlend * 2.8);
        ctx.lineTo(-this.radius - flameLength * 1.02, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, -3.2 - this.boostBlend * 2.8);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (shipTexture) {
      const shipWidth = this.radius * 2.5;
      const shipHeight = this.radius * 1.7;

      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(shipTexture, -shipWidth * 0.5, -shipHeight * 0.5, shipWidth, shipHeight);
      ctx.restore();

      ctx.strokeStyle = glow;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(235, 242, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(this.radius - 2, 0);
      ctx.lineTo(-8, -14);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, this.auraRotationA, this.auraRotationA + Math.PI * 1.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 17, this.auraRotationB, this.auraRotationB + Math.PI * 1.45);
    ctx.stroke();

    let offset = -0.8;
    for (const buff of this.getActiveBuffs()) {
      const progress = buff.remaining / buff.total;
      ctx.strokeStyle = 'rgba(255, 213, 116, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 24 + offset * 2, offset, offset + Math.PI * 0.9 * progress);
      ctx.stroke();
      offset += 0.72;
    }
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/planet.js"
/*!*******************************!*\
  !*** ./js/entities/planet.js ***!
  \*******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Planet: () => (/* binding */ Planet)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets.js */ "./js/assets.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




class Planet {
  constructor(x, y, radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.radius) {
    this.kind = 'planet';
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.radius = radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.health;
    this.health = this.maxHealth;
    this.owner = null;
    this.pulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringAngle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringTilt = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.22, 0.42);
    this.ringTiltPhase = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringOffset = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-4, 4);
    this.recoverCooldown = 0;
    this.spawnAccumulator = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate);
    this.impactHeat = 0;
    this.onDamaged = null;
    this.onShattered = null;
    this.onCaptured = null;
    this.pendingOwner = null;
    this.rebuildTimer = 0;
    this.rebuildDuration = 68;
    this.revealTimer = 0;
    this.revealDuration = 18;
    this.texturePhase = 'base';
    this.fragments = Array.from({ length: 28 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 28 + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-0.22, 0.22),
      orbit: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(this.radius * 1.35, this.radius * 2.35),
      size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(1.8, 5.5),
      drift: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-12, 12),
      phase: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2),
      swirl: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.55, 1.35),
      inwardOffset: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.15, 0.95),
    }));
  }

  update(tick) {
    this.pulse += 0.02 * tick;
    this.ringAngle += 0.0045 * tick;
    this.ringTiltPhase += 0.011 * tick;
    this.recoverCooldown = Math.max(0, this.recoverCooldown - tick);
    this.impactHeat = Math.max(0, this.impactHeat - 0.18 * tick);

    if (this.rebuildTimer > 0) {
      this.rebuildTimer = Math.max(0, this.rebuildTimer - tick);
      if (this.rebuildTimer <= 0 && this.pendingOwner) {
        this.completeCapture();
      }
      return 0;
    }

    if (this.revealTimer > 0) {
      this.revealTimer = Math.max(0, this.revealTimer - tick);
    }

    if (this.recoverCooldown <= 0) {
      this.health = Math.min(this.maxHealth, this.health + _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.recoverPerFrame * tick);
    }

    if (!this.owner || this.health / this.maxHealth <= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportThreshold) {
      return 0;
    }

    this.spawnAccumulator += tick;
    let ready = 0;
    while (this.spawnAccumulator >= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate) {
      this.spawnAccumulator -= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate;
      ready += 1;
    }
    return ready;
  }

  takeDamage(amount, team) {
    if (this.rebuildTimer > 0) return;
    this.health -= amount;
    this.recoverCooldown = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.recoverDelay;
    this.impactHeat = Math.min(8, this.impactHeat + 1);
    this.onDamaged?.(this, team, {
      amount,
      impactHeat: this.impactHeat,
      willCapture: this.health <= 0,
    });
    if (this.health <= 0) {
      this.shatter(team);
    }
  }

  shatter(team) {
    const previousOwner = this.owner;
    this.owner = null;
    this.pendingOwner = team;
    this.health = 0;
    this.spawnAccumulator = 0;
    this.rebuildTimer = this.rebuildDuration;
    this.revealTimer = 0;
    this.onShattered?.(this, team, previousOwner);
  }

  completeCapture() {
    const team = this.pendingOwner;
    const previousOwner = this.owner;
    this.pendingOwner = null;
    this.owner = team;
    this.texturePhase = team === 'blue' ? 'rebuiltBlue' : team === 'red' ? 'rebuiltRed' : 'base';
    this.revealTimer = this.revealDuration;
    this.health = this.maxHealth * _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.captureRestore;
    this.spawnAccumulator = 120;
    this.onCaptured?.(this, team, previousOwner);
  }

  shouldSupport(target) {
    return Boolean(this.owner && target && target.team === this.owner);
  }

  setNeutral() {
    this.owner = null;
    this.pendingOwner = null;
    this.health = this.maxHealth * 0.45;
    this.spawnAccumulator = 0;
    this.rebuildTimer = 0;
  }

  getDisplayPalette() {
    if (this.pendingOwner) return _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[this.pendingOwner];
    return this.owner ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[this.owner] : _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.neutral;
  }

  getRebuildProgress() {
    if (this.rebuildTimer <= 0) return 1;
    return 1 - this.rebuildTimer / this.rebuildDuration;
  }

  getRevealProgress() {
    if (this.revealTimer <= 0) return 1;
    return 1 - this.revealTimer / this.revealDuration;
  }

  draw(ctx) {
    const palette = this.getDisplayPalette();
    const texture = (0,_assets_js__WEBPACK_IMPORTED_MODULE_1__.getPlanetTexture)(this.texturePhase);
    const glowRadius = this.radius + 20 + Math.sin(this.pulse) * 4;
    const ringRadiusX = this.radius + 22;
    const ringTiltWave = 0.2 + Math.abs(Math.sin(this.ringTiltPhase)) * 0.34;
    const ringRadiusY = ringRadiusX * (this.ringTilt * 0.45 + ringTiltWave * 0.55);
    const ringDrift = Math.sin(this.pulse * 0.8) * 1.8 + Math.cos(this.ringTiltPhase * 0.9) * 1.6;
    const ringShear = Math.sin(this.ringTiltPhase) * 0.08;
    const ringGlow = `${palette.primary}66`;
    const ringCore = `${palette.primary}dd`;
    const ringEdge = `${palette.secondary}7a`;
    const rebuildProgress = this.getRebuildProgress();
    const revealProgress = this.getRevealProgress();
    const isRebuilding = this.rebuildTimer > 0;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    const drawRingBand = (isFront) => {
      ctx.save();
      ctx.rotate(this.ringAngle);
      ctx.transform(1, 0, ringShear, 1, 0, this.ringOffset + ringDrift);
      ctx.beginPath();
      ctx.rect(-ringRadiusX - 30, isFront ? 0 : -ringRadiusX, ringRadiusX * 2 + 60, ringRadiusX);
      ctx.clip();

      const ringGradient = ctx.createLinearGradient(-ringRadiusX, 0, ringRadiusX, 0);
      ringGradient.addColorStop(0, isFront ? ringEdge : `${palette.secondary}36`);
      ringGradient.addColorStop(0.5, isFront ? ringCore : ringGlow);
      ringGradient.addColorStop(1, isFront ? ringEdge : `${palette.secondary}36`);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 2, ringRadiusY + 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = isFront ? 7 : 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isFront ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 5, ringRadiusY + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (!isRebuilding || rebuildProgress > 0.28) {
      drawRingBand(false);
    }

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    if (!isRebuilding) {
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.1 + rebuildProgress * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const gradient = ctx.createRadialGradient(-12, -12, 8, 0, 0, this.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.14, palette.primary);
    gradient.addColorStop(1, palette.secondary);
    ctx.fillStyle = gradient;
    if (isRebuilding) {
      const spreadPhase = Math.min(1, rebuildProgress / 0.42);
      const gatherPhase = rebuildProgress < 0.42 ? 0 : (rebuildProgress - 0.42) / 0.58;
      const coreRadius = this.radius * Math.max(0, (gatherPhase - 0.28) / 0.72);

      ctx.globalAlpha = 0.08 + gatherPhase * 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      for (const fragment of this.fragments) {
        const reactionBurst = 0.45 + Math.sin(spreadPhase * Math.PI) * 1.1;
        const gatherPull = 1 - gatherPhase;
        const radius = fragment.orbit * (gatherPhase > 0 ? gatherPull * (0.45 + fragment.inwardOffset) : reactionBurst);
        const angle = fragment.angle
          + this.ringAngle * fragment.swirl
          + spreadPhase * (1.8 + fragment.swirl)
          - gatherPhase * (0.9 + fragment.swirl * 0.4);
        const wobble = Math.sin(this.pulse * 1.3 + fragment.phase + rebuildProgress * 10) * (6 + fragment.drift * 0.3);
        const x = Math.cos(angle) * radius + Math.cos(fragment.phase + rebuildProgress * 8) * wobble * 0.22;
        const y = Math.sin(angle) * radius * 0.72 + fragment.drift * (gatherPhase > 0 ? gatherPull : 1) + wobble * 0.16;
        const particleSize = fragment.size * (gatherPhase > 0 ? 0.65 + gatherPhase * 0.75 : 0.85 + Math.sin(spreadPhase * Math.PI) * 0.2);

        const fragmentGradient = ctx.createRadialGradient(x - particleSize * 0.3, y - particleSize * 0.3, 0, x, y, particleSize * 1.8);
        fragmentGradient.addColorStop(0, '#ffffff');
        fragmentGradient.addColorStop(0.32, palette.primary);
        fragmentGradient.addColorStop(1, `${palette.secondary}00`);
        ctx.fillStyle = fragmentGradient;
        ctx.globalAlpha = 0.2 + Math.sin(rebuildProgress * Math.PI) * 0.25 + gatherPhase * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.14 + gatherPhase * 0.36;
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (0.22 + gatherPhase * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      if (texture) {
        const revealScale = 0.92 + revealProgress * 0.08;

        ctx.save();
        ctx.globalAlpha = revealProgress;
        ctx.scale(revealScale, revealScale);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(texture, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

        // Keep the new planet art, but lightly tint it so team ownership still reads quickly.
        const tintGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        tintGradient.addColorStop(0, `${palette.primary}18`);
        tintGradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
        tintGradient.addColorStop(1, `${palette.secondary}3a`);
        ctx.fillStyle = tintGradient;
        ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

        const shadowGradient = ctx.createRadialGradient(this.radius * 0.15, this.radius * 0.2, this.radius * 0.1, 0, 0, this.radius * 1.15);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(3, 10, 20, 0.26)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (revealProgress < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - revealProgress) * 0.35;
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * (0.88 + revealProgress * 0.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    if (!isRebuilding || rebuildProgress > 0.62) {
      drawRingBand(true);
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    ctx.strokeStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.health / this.maxHealth));
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }
    ctx.restore();
  }
}


/***/ },

/***/ "./js/game.js"
/*!********************!*\
  !*** ./js/game.js ***!
  \********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ "./js/config.js");
/* harmony import */ var _camera_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./camera.js */ "./js/camera.js");
/* harmony import */ var _collision_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collision.js */ "./js/collision.js");
/* harmony import */ var _controls_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./controls.js */ "./js/controls.js");
/* harmony import */ var _entities_drone_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./entities/drone.js */ "./js/entities/drone.js");
/* harmony import */ var _entities_item_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./entities/item.js */ "./js/entities/item.js");
/* harmony import */ var _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./entities/mothership.js */ "./js/entities/mothership.js");
/* harmony import */ var _entities_planet_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./entities/planet.js */ "./js/entities/planet.js");
/* harmony import */ var _network_client_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./network-client.js */ "./js/network-client.js");
/* harmony import */ var _online_constants_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./online-constants.js */ "./js/online-constants.js");
/* harmony import */ var _ui_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ui.js */ "./js/ui.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");













class Game {
  constructor(canvas, audio = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.ui = new _ui_js__WEBPACK_IMPORTED_MODULE_10__.UI();
    this.controls = new _controls_js__WEBPACK_IMPORTED_MODULE_3__.Controls(canvas);
    this.camera = new _camera_js__WEBPACK_IMPORTED_MODULE_1__.Camera();
    this.mode = 'local';
    this.state = 'start';
    this.lastTime = performance.now();
    this.time = 0;
    this.stars = this.createStars();
    this.delayedEffects = [];
    this.particles = [];
    this.online = {
      client: null,
      slotId: null,
      snapshot: null,
      previousSnapshot: null,
      renderedShips: new Map(),
      renderedPlanets: new Map(),
      renderedDrones: new Map(),
      visualShips: new Map(),
      visualPlanets: new Map(),
      visualDrones: new Map(),
      backgroundChunks: new Map(),
      particles: [],
      inputTimer: 0,
      lastInput: { x: 0, y: 0, boost: false },
      hudTimer: 0,
      rosterSignature: '',
    };

    this.ui.bindCallbacks({
      onStart: () => this.beginMatch(),
      onOnlineStart: () => this.beginOnlineMatch(),
      onRestart: () => this.restartMatch(),
      onHome: () => this.returnToHome(),
      onOnlineHome: () => this.returnToHome(),
    });

    this.resize();
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('scroll', this.resize);

    this.setupMatch();
  }

  createStars() {
    return Array.from({ length: 170 }, () => ({
      x: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.width),
      y: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.height),
      size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(1, 3),
      depth: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.3, 1),
      alpha: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.35, 0.95),
    }));
  }

  resize = () => {
    const deviceDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(deviceDpr, this.mode === 'online' ? 1.5 : 2);
    const viewport = window.visualViewport;
    const width = viewport?.width || document.documentElement.clientWidth || window.innerWidth;
    const height = viewport?.height || document.documentElement.clientHeight || window.innerHeight;
    this.viewportWidth = Math.round(width);
    this.viewportHeight = Math.round(height);
    this.canvas.width = Math.round(this.viewportWidth * dpr);
    this.canvas.height = Math.round(this.viewportHeight * dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  };

  setupMatch() {
    this.blue = new _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__.Mothership('blue', 300, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.red = new _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__.Mothership('red', _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 300, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.drones = [];
    this.items = [];
    this.particles = [];
    this.delayedEffects = [];
    this.itemAccumulator = 0;
    this.camera.resetShake();

    this.planets = [];
    while (this.planets.length < _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.planets) {
      const pos = new _utils_js__WEBPACK_IMPORTED_MODULE_11__.Vector2((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(360, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 360), (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(260, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - 260));
      if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.distance)(pos, this.blue.pos) < 240 || (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.distance)(pos, this.red.pos) < 240) continue;
      if (this.planets.some((planet) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.distance)(pos, planet.pos) < 210)) continue;
      this.planets.push(new _entities_planet_js__WEBPACK_IMPORTED_MODULE_7__.Planet(pos.x, pos.y));
    }

    for (const planet of this.planets) {
      planet.onDamaged = (damagedPlanet, team, info) => {
        if (info.willCapture) return;
        this.camera.shake((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)((info.impactHeat - 1.6) * 0.85, 0.28, 3.2), 3.5, { progressive: true });
        this.audio?.playPlanetImpact();
      };
      planet.onShattered = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 42, 3.2);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, capturedPlanet.radius * 0.55, 2);
        this.camera.shake(30, 15);
        this.audio?.playPlanetShatter();
      };
      planet.onCaptured = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 18, 1.35);
      };
    }

    this.camera.position.set(_config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width * 0.5, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.camera.zoom = 0.9;
    this.controls.reset();
    this.controls.setMode('local');
  }

  beginMatch() {
    this.disconnectOnline();
    this.mode = 'local';
    this.resize();
    this.setupMatch();
    this.state = 'playing';
    this.ui.showPlaying();
  }

  beginOnlineMatch() {
    this.mode = 'online';
    this.resize();
    this.state = 'connecting';
    this.controls.reset();
    this.controls.setMode('online');
    this.camera.position.set(_online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.width * 0.5, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.height * 0.5);
    this.camera.zoom = 0.78;
    this.ui.showOnlineStatus();
    this.ensureOnlineClient();
  }

  restartMatch() {
    if (this.mode === 'online') {
      this.beginOnlineMatch();
      return;
    }
    this.beginMatch();
  }

  returnToHome() {
    this.disconnectOnline();
    this.mode = 'local';
    this.resize();
    this.setupMatch();
    this.state = 'start';
    this.ui.showStart();
  }

  ensureOnlineClient() {
    if (this.online.client) return;
    this.online.client = new _network_client_js__WEBPACK_IMPORTED_MODULE_8__.NetworkClient({
      onConnection: (state, detail) => {
        if (this.mode !== 'online') return;
        if (state === 'connected') {
          this.ui.showOnlineStatus({ meta: 'Connected. Reserving a room slot...' });
        } else if (state === 'disconnected') {
          this.state = 'connecting';
          this.ui.showOnlineStatus({
            title: 'Connection Lost',
            subtitle: 'Trying to reconnect to your room slot.',
            meta: detail || 'Reconnecting...',
          });
        } else if (state === 'error') {
          this.ui.showOnlineStatus({
            title: 'Unable To Reach Server',
            subtitle: 'Start the multiplayer server and try again.',
            meta: detail || 'No Socket.IO server response.',
          });
        }
      },
      onJoined: (payload) => {
        this.online.slotId = payload.slotId;
        this.ui.showOnlineStatus({
          meta: `${payload.roomId} · ${payload.playerCount}/${payload.capacity}`,
        });
      },
      onSnapshot: (payload) => {
        this.handleOnlineSnapshotEffects(this.online.snapshot, payload);
        this.online.previousSnapshot = this.online.snapshot;
        this.online.snapshot = payload;
        this.syncOnlineRenderState(payload);
        if (this.mode === 'online' && this.online.slotId) {
          this.state = 'playing';
          this.ui.showOnlinePlaying();
          this.ui.updateOnlineHud(payload, this.online.slotId);
        }
      },
    });
    this.online.client.connect();
  }

  handleOnlineSnapshotEffects(previousSnapshot, nextSnapshot) {
    if (!previousSnapshot || !nextSnapshot) return;

    for (const ship of nextSnapshot.ships) {
      const prevShip = previousSnapshot.ships.find((entry) => entry.slotId === ship.slotId);
      if (!prevShip) continue;
      if (ship.health < prevShip.health - 0.9) {
        this.spawnBurst(ship.x, ship.y, ship.theme?.primary || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[ship.slotId]?.primary || '#ffffff', 10, 1.2);
        if (ship.slotId === this.online.slotId) {
          this.camera.shake((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)((prevShip.health - ship.health) * 0.12, 2, 10), 5, { progressive: true });
        }
      }
    }

    for (const planet of nextSnapshot.planets) {
      const prevPlanet = previousSnapshot.planets.find((entry) => entry.id === planet.id);
      if (!prevPlanet) continue;

      if (planet.health < prevPlanet.health - 0.3 && planet.rebuildTimer <= 0) {
        const accent = planet.pendingOwnerSlotId
          ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[planet.pendingOwnerSlotId]?.primary || '#d6d8de'
          : planet.ownerSlotId
            ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[planet.ownerSlotId]?.primary || '#d6d8de'
            : _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.neutral.primary;
        this.spawnBurst(planet.x, planet.y, accent, 8, 0.9);
        this.camera.shake(2.4, 4, { progressive: true });
        this.audio?.playPlanetImpact();
      }

      if (prevPlanet.rebuildTimer <= 0 && planet.rebuildTimer > 0 && planet.pendingOwnerSlotId) {
        const accent = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[planet.pendingOwnerSlotId]?.primary || '#d6d8de';
        this.spawnBurst(planet.x, planet.y, accent, 42, 3.2);
        this.spawnShockwave(planet.x, planet.y, accent, planet.radius * 0.55, 2);
        this.camera.shake(30, 15);
        this.audio?.playPlanetShatter();
      }

      if (prevPlanet.rebuildTimer > 0 && planet.rebuildTimer <= 0 && planet.ownerSlotId) {
        const accent = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[planet.ownerSlotId]?.primary || '#d6d8de';
        this.spawnBurst(planet.x, planet.y, accent, 24, 1.8);
        this.spawnShockwave(planet.x, planet.y, accent, planet.radius * 0.28, 0.9);
      }
    }
  }

  disconnectOnline() {
    this.online.client?.disconnect();
    this.online.client = null;
    this.online.slotId = null;
    this.online.previousSnapshot = null;
    this.online.snapshot = null;
    this.online.renderedShips.clear();
    this.online.renderedPlanets.clear();
    this.online.renderedDrones.clear();
    this.online.visualShips.clear();
    this.online.visualPlanets.clear();
    this.online.visualDrones.clear();
    this.online.backgroundChunks.clear();
    this.online.particles = [];
    this.online.inputTimer = 0;
    this.online.lastInput = { x: 0, y: 0, boost: false };
    this.online.hudTimer = 0;
    this.online.rosterSignature = '';
  }

  queueAutocapture(team, seconds) {
    this.delayedEffects.push({ type: 'autocapture', team, remaining: seconds * 60 });
  }

  neutralizeRandomEnemyPlanet(team) {
    const candidates = this.planets.filter((planet) => planet.owner && planet.owner !== team);
    if (candidates.length) (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.pick)(candidates).setNeutral();
  }

  autoCaptureNearestPlanet(team) {
    const mothership = team === 'blue' ? this.blue : this.red;
    const candidates = this.planets.filter((planet) => planet.owner !== team);
    if (!candidates.length) return;
    candidates.sort((a, b) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.distance)(a.pos, mothership.pos) - (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.distance)(b.pos, mothership.pos));
    candidates[0].shatter(team);
  }

  getDroneCount(team) {
    return this.drones.filter((drone) => drone.team === team).length;
  }

  getPlanetCount(team) {
    return this.planets.filter((planet) => planet.owner === team).length;
  }

  getDroneCap(team) {
    return _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.baseCap + this.getPlanetCount(team) * 10;
  }

  spawnDrone(team, source) {
    const spawnPos = source.getSpawnPosition
      ? source.getSpawnPosition()
      : source.pos.clone().add(_utils_js__WEBPACK_IMPORTED_MODULE_11__.Vector2.fromAngle((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0, Math.PI * 2), source.radius + 14));
    this.drones.push(new _entities_drone_js__WEBPACK_IMPORTED_MODULE_4__.Drone(team, spawnPos.x, spawnPos.y));
    this.spawnBurst(spawnPos.x, spawnPos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 6, 1.2);
  }

  spawnItems(tick) {
    this.itemAccumulator += tick;
    if (this.itemAccumulator < _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.spawnRate || this.items.length >= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.maxActive) return;
    this.itemAccumulator = 0;
    this.items.push(_entities_item_js__WEBPACK_IMPORTED_MODULE_5__.Item.random((0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(220, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 220), (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(220, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - 220)));
  }

  spawnBurst(x, y, color, count, scale = 1) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos((Math.PI * 2 * i) / count + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-0.4, 0.4)) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.4, 2.8) * scale,
        vy: Math.sin((Math.PI * 2 * i) / count + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-0.4, 0.4)) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.4, 2.8) * scale,
        life: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(18, 42),
        maxLife: 42,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(1.5, 4.5) * scale,
        color,
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.9, 0.95),
      });
    }
  }

  spawnShockwave(x, y, color, radius = 14, scale = 1) {
    this.particles.push({
      type: 'ring',
      x,
      y,
      life: 20 * scale,
      maxLife: 20 * scale,
      size: radius,
      color,
      growth: 5.5 * scale,
      lineWidth: 3.5 * scale,
    });
  }

  spawnShipTrail(ship, tick, targetParticles = this.particles, options = {}) {
    const {
      cap = 0,
      intensity = 1,
    } = options;
    const x = ship.pos?.x ?? ship.x ?? 0;
    const y = ship.pos?.y ?? ship.y ?? 0;
    const vx = ship.vel?.x ?? ship.vx ?? 0;
    const vy = ship.vel?.y ?? ship.vy ?? 0;
    const speed = Math.hypot(vx, vy);
    const boostIntensity = ship.boostBlend || 0;

    if (speed < 0.16 && boostIntensity < 0.04) return;

    const angle = ship.angle || 0;
    const radius = ship.radius || _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.radius;
    const exhaustOffset = radius + 2 + boostIntensity * 6;
    const exhaustX = x - Math.cos(angle) * exhaustOffset;
    const exhaustY = y - Math.sin(angle) * exhaustOffset;
    const laneX = -Math.sin(angle);
    const laneY = Math.cos(angle);
    const plumePower = (0.75 + speed * 0.42 + boostIntensity * 2.9) * intensity;
    const count = Math.min(6, Math.max(1, Math.round(plumePower * tick)));
    const speedCarry = 0.24 + boostIntensity * 0.08;
    const lifeBonus = boostIntensity * 8 + speed * 1.3;
    const teamColor = ship.color?.primary || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[ship.team]?.primary || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[ship.slotId]?.primary || '#ffffff';

    for (let i = 0; i < count; i += 1) {
      const laneOffset = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-4.8, 4.8) * (1 + boostIntensity * 0.45);
      const baseLife = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(14, 24 + lifeBonus);
      const warmCore = i % 3 === 0;
      const ionPulse = boostIntensity > 0.18 && i % 2 === 1;

      targetParticles.push({
        type: 'spark',
        x: exhaustX + laneX * laneOffset + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-2.2, 2.2),
        y: exhaustY + laneY * laneOffset + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-2.2, 2.2),
        vx: -Math.cos(angle) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(1.6, 3.8 + boostIntensity * 2.4) - vx * speedCarry + laneX * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-0.55, 0.55),
        vy: -Math.sin(angle) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(1.6, 3.8 + boostIntensity * 2.4) - vy * speedCarry + laneY * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-0.55, 0.55),
        life: baseLife,
        maxLife: baseLife,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(1.8, 4.8) * (1 + boostIntensity * 0.55) * intensity,
        color: ionPulse
          ? 'rgba(123, 223, 255, 0.88)'
          : warmCore
            ? 'rgba(255, 247, 232, 0.94)'
            : `${teamColor}${boostIntensity > 0.12 ? 'd0' : 'aa'}`,
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.84, 0.92),
      });
    }

    if (boostIntensity > 0.28) {
      const shockLife = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(8, 13);
      targetParticles.push({
        type: 'spark',
        x: exhaustX + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-3.5, 3.5),
        y: exhaustY + (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(-3.5, 3.5),
        vx: -Math.cos(angle) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(2.4, 5.2 + boostIntensity * 2.8) - vx * 0.12,
        vy: -Math.sin(angle) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(2.4, 5.2 + boostIntensity * 2.8) - vy * 0.12,
        life: shockLife,
        maxLife: shockLife,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(3.2, 6.2) * (1 + boostIntensity * 0.28) * intensity,
        color: 'rgba(255, 180, 112, 0.3)',
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.rand)(0.88, 0.94),
      });
    }

    if (cap > 0 && targetParticles.length > cap) {
      targetParticles.splice(0, targetParticles.length - cap);
    }
  }

  updateParticles(tick) {
    this.particles = this.particles.filter((particle) => {
      particle.x += (particle.vx || 0) * tick;
      particle.y += (particle.vy || 0) * tick;
      if (particle.drag) {
        particle.vx *= Math.pow(particle.drag, tick);
        particle.vy *= Math.pow(particle.drag, tick);
      }
      if (particle.type === 'ring') particle.size += particle.growth * tick;
      particle.life -= tick;
      return particle.life > 0;
    });
  }

  updateStart() {
    this.planets.forEach((planet) => planet.update(1));
    this.camera.update(this.blue, this.red, this.viewportWidth, this.viewportHeight, 1);
  }

  fillDroneSpawns(team, ready, source) {
    for (let i = 0; i < ready; i += 1) {
      if (this.getDroneCount(team) >= this.getDroneCap(team)) return;
      this.spawnDrone(team, source);
    }
  }

  handleDroneCollisions(tick) {
    for (let i = 0; i < this.drones.length; i += 1) {
      for (let j = i + 1; j < this.drones.length; j += 1) {
        const a = this.drones[i];
        const b = this.drones[j];
        if (a.team === b.team || !(0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(a, b)) continue;
        (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.resolveCircleCollision)(a, b, 0.5);
        a.takeDamage(0.14 * tick);
        b.takeDamage(0.14 * tick);
      }
    }

    for (const drone of this.drones) {
      const enemyShip = drone.team === 'blue' ? this.red : this.blue;
      if ((0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(drone, enemyShip, 2)) {
        drone.takeDamage(0.5 * tick);
        enemyShip.takeDamage(0.22 * tick);
      }

      for (const planet of this.planets) {
        if (planet.owner === drone.team) continue;
        if (!(0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(drone, planet, 2)) continue;
        drone.takeDamage(0.16 * tick);
        planet.takeDamage(0.22 * tick, drone.team);
      }
    }
  }

  handleItems() {
    this.items = this.items.filter((item) => {
      const collector = (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(item, this.blue) ? this.blue : (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(item, this.red) ? this.red : null;
      if (!collector) return true;
      item.applyEffect(collector, this);
      this.spawnBurst(item.pos.x, item.pos.y, item.type.accent, 16, 1.6);
      this.ui.showPickupNotice?.(collector.team, item.type);
      return false;
    });
  }

  shatterDrone(drone) {
    if (!drone || drone.health <= 0) return;
    drone.destroyedByImpact = true;
    drone.health = 0;
    this.spawnBurst(drone.pos.x, drone.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.team].primary, 24, 2.1);
  }

  handleDelayedEffects(tick) {
    this.delayedEffects = this.delayedEffects.filter((effect) => {
      effect.remaining -= tick;
      if (effect.remaining > 0) return true;
      if (effect.type === 'autocapture') this.autoCaptureNearestPlanet(effect.team);
      return false;
    });
  }

  removeDestroyed() {
    this.drones = this.drones.filter((drone) => {
      if (drone.health > 0) return true;
      if (!drone.destroyedByImpact) this.spawnBurst(drone.pos.x, drone.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.team].primary, 8);
      return false;
    });
  }

  updatePlaying(tick) {
    const blueInput = this.controls.getMoveVector('blue');
    const redInput = this.controls.getMoveVector('red');
    const blueBoost = this.controls.getBoostHeld('blue');
    const redBoost = this.controls.getBoostHeld('red');
    this.blue.onDroneImpact = (drone) => this.shatterDrone(drone);
    this.red.onDroneImpact = (drone) => this.shatterDrone(drone);

    const blueReady = this.blue.update(blueInput, blueBoost, tick, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD);
    const redReady = this.red.update(redInput, redBoost, tick, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD);
    this.spawnShipTrail(this.blue, tick);
    this.spawnShipTrail(this.red, tick);
    this.fillDroneSpawns('blue', blueReady, this.blue);
    this.fillDroneSpawns('red', redReady, this.red);

    for (const planet of this.planets) {
      const ready = planet.update(tick);
      if (planet.owner) this.fillDroneSpawns(planet.owner, ready, planet);
    }

    this.spawnItems(tick);
    this.items.forEach((item) => item.update(tick));

    const blueDrones = this.drones.filter((drone) => drone.team === 'blue');
    const redDrones = this.drones.filter((drone) => drone.team === 'red');

    for (const drone of this.drones) {
      if (drone.team === 'blue') {
        drone.flock(blueDrones, redDrones, this.blue, this.red, this.planets, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD, tick, this.time);
      } else {
        drone.flock(redDrones, blueDrones, this.red, this.blue, this.planets, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD, tick, this.time);
      }
      drone.pos.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(drone.pos.x, drone.radius, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - drone.radius);
      drone.pos.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(drone.pos.y, drone.radius, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - drone.radius);
    }

    this.handleDroneCollisions(tick);
    this.handleItems();
    this.handleDelayedEffects(tick);
    this.removeDestroyed();
    this.camera.update(this.blue, this.red, this.viewportWidth, this.viewportHeight, tick);
    this.updateParticles(tick);

    const winner = this.blue.health <= 0 ? 'red' : this.red.health <= 0 ? 'blue' : null;
    if (winner) {
      this.state = 'victory';
      this.ui.showVictory(winner);
    }
  }

  syncOnlineRenderState(snapshot) {
    for (const ship of snapshot.ships) {
      const current = this.online.renderedShips.get(ship.slotId);
      if (!current) {
        this.online.renderedShips.set(ship.slotId, {
          ...ship,
          targetX: ship.x,
          targetY: ship.y,
          targetAngle: ship.angle,
        });
      } else {
        Object.assign(current, ship, {
          x: current.x,
          y: current.y,
          angle: current.angle,
          targetX: ship.x,
          targetY: ship.y,
          targetAngle: ship.angle,
        });
      }
    }
    for (const planet of snapshot.planets) {
      this.online.renderedPlanets.set(planet.id, { ...planet });
    }

    for (const drone of snapshot.drones || []) {
      const current = this.online.renderedDrones.get(drone.id);
      if (!current) {
        this.online.renderedDrones.set(drone.id, {
          ...drone,
          targetX: drone.x,
          targetY: drone.y,
          targetHeading: drone.heading,
        });
      } else {
        Object.assign(current, drone, {
          x: current.x,
          y: current.y,
          heading: current.heading,
          targetX: drone.x,
          targetY: drone.y,
          targetHeading: drone.heading,
        });
      }
    }

    for (const droneId of [...this.online.renderedDrones.keys()]) {
      if (!(snapshot.drones || []).find((drone) => drone.id === droneId)) {
        this.online.renderedDrones.delete(droneId);
      }
    }

    this.syncOnlineVisuals();
  }

  syncOnlineVisuals() {
    for (const ship of this.online.renderedShips.values()) {
      let visual = this.online.visualShips.get(ship.slotId);
      if (!visual) {
        visual = new _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__.Mothership(ship.slotId, ship.x, ship.y);
        this.online.visualShips.set(ship.slotId, visual);
      }
      visual.pos.set(ship.x, ship.y);
      visual.vel.set(ship.vx || 0, ship.vy || 0);
      visual.angle = ship.angle || 0;
      visual.health = ship.health;
      visual.maxHealth = ship.maxHealth;
      visual.radius = ship.radius;
      visual.boostBlend = ship.boostBlend || 0;
      visual.team = ship.slotId;
      visual.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[ship.slotId];
      visual.auraRotationA += 0.015;
      visual.auraRotationB -= 0.011;
      visual.thrusterPulse += 0.18;
    }

    for (const slotId of [...this.online.visualShips.keys()]) {
      if (!this.online.renderedShips.has(slotId)) this.online.visualShips.delete(slotId);
    }

    for (const planet of this.online.renderedPlanets.values()) {
      let visual = this.online.visualPlanets.get(planet.id);
      if (!visual) {
        visual = new _entities_planet_js__WEBPACK_IMPORTED_MODULE_7__.Planet(planet.x, planet.y, planet.radius);
        this.online.visualPlanets.set(planet.id, visual);
      }
      visual.pos.set(planet.x, planet.y);
      visual.radius = planet.radius;
      visual.owner = planet.ownerSlotId;
      visual.pendingOwner = planet.pendingOwnerSlotId;
      visual.maxHealth = planet.maxHealth;
      visual.health = planet.health;
      visual.impactHeat = planet.impactHeat;
      visual.rebuildTimer = planet.rebuildTimer;
      visual.rebuildDuration = planet.rebuildDuration;
      visual.revealTimer = planet.revealTimer;
      visual.revealDuration = planet.revealDuration;
      visual.texturePhase = 'base';
      visual.ringAngle += 0.0045;
      visual.ringTiltPhase += 0.011;
      visual.pulse += 0.02;
    }

    for (const planetId of [...this.online.visualPlanets.keys()]) {
      if (!this.online.renderedPlanets.has(planetId)) this.online.visualPlanets.delete(planetId);
    }

    for (const drone of this.online.renderedDrones.values()) {
      let visual = this.online.visualDrones.get(drone.id);
      if (!visual) {
        visual = new _entities_drone_js__WEBPACK_IMPORTED_MODULE_4__.Drone(drone.ownerSlotId, drone.x, drone.y);
        this.online.visualDrones.set(drone.id, visual);
      }
      visual.pos.set(drone.x, drone.y);
      visual.vel.set(drone.vx || 0, drone.vy || 0);
      visual.heading = drone.heading || 0;
      visual.health = drone.health;
      visual.maxHealth = drone.maxHealth;
      visual.radius = drone.radius;
      visual.baseRadius = drone.radius;
      visual.team = drone.ownerSlotId;
      visual.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.ownerSlotId];
    }

    for (const droneId of [...this.online.visualDrones.keys()]) {
      if (!this.online.renderedDrones.has(droneId)) this.online.visualDrones.delete(droneId);
    }
  }

  spawnOnlineShipTrail(ship, tick) {
    this.spawnShipTrail(ship, tick, this.online.particles, {
      cap: 320,
      intensity: 1.08,
    });
  }

  updateOnlineParticles(tick) {
    this.online.particles = this.online.particles.filter((particle) => {
      particle.x += (particle.vx || 0) * tick;
      particle.y += (particle.vy || 0) * tick;
      if (particle.drag) {
        particle.vx *= Math.pow(particle.drag, tick);
        particle.vy *= Math.pow(particle.drag, tick);
      }
      particle.life -= tick;
      return particle.life > 0;
    });
  }

  updateOnline(delta) {
    const tick = Math.min(2.5, delta / (1000 / 60));
    const snapshot = this.online.snapshot;
    if (snapshot) {
      for (const ship of snapshot.ships) {
        const rendered = this.online.renderedShips.get(ship.slotId);
        if (!rendered) continue;
        rendered.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(rendered.x, rendered.targetX ?? ship.x, 0.18);
        rendered.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(rendered.y, rendered.targetY ?? ship.y, 0.18);
        rendered.angle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(rendered.angle, rendered.targetAngle ?? ship.angle, 0.18);
        Object.assign(rendered, ship, {
          x: rendered.x,
          y: rendered.y,
          angle: rendered.angle,
          targetX: rendered.targetX ?? ship.x,
          targetY: rendered.targetY ?? ship.y,
          targetAngle: rendered.targetAngle ?? ship.angle,
        });
        this.spawnOnlineShipTrail(rendered, tick);
      }

      for (const drone of snapshot.drones || []) {
        const renderedDrone = this.online.renderedDrones.get(drone.id);
        if (!renderedDrone) continue;
        renderedDrone.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(renderedDrone.x, renderedDrone.targetX ?? drone.x, 0.22);
        renderedDrone.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(renderedDrone.y, renderedDrone.targetY ?? drone.y, 0.22);
        renderedDrone.heading = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(renderedDrone.heading, renderedDrone.targetHeading ?? drone.heading, 0.22);
        Object.assign(renderedDrone, drone, {
          x: renderedDrone.x,
          y: renderedDrone.y,
          heading: renderedDrone.heading,
          targetX: renderedDrone.targetX ?? drone.x,
          targetY: renderedDrone.targetY ?? drone.y,
          targetHeading: renderedDrone.targetHeading ?? drone.heading,
        });
      }

      this.updateOnlineParticles(tick);
      this.syncOnlineVisuals();
      this.updateOnlineCamera(tick);
      this.online.hudTimer += delta;
      if (this.online.hudTimer >= 120) {
        this.online.hudTimer = 0;
        this.ui.updateOnlineHud(snapshot, this.online.slotId);
      }
    }

    this.online.inputTimer += delta;
    const input = this.controls.getOnlineInput();
    const changed = Math.abs(input.x - this.online.lastInput.x) > 0.02
      || Math.abs(input.y - this.online.lastInput.y) > 0.02
      || input.boost !== this.online.lastInput.boost;
    if (this.online.client && (changed || this.online.inputTimer > 60)) {
      this.online.lastInput = { ...input };
      this.online.inputTimer = 0;
      this.online.client.sendInput({
        x: Number(input.x.toFixed(3)),
        y: Number(input.y.toFixed(3)),
        boost: input.boost,
      });
    }
  }

  updateOnlineCamera(tick) {
    const target = this.online.renderedShips.get(this.online.slotId) || this.online.renderedShips.values().next().value;
    if (!target) return;
    this.camera.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(this.camera.position.x, target.x, 1 - Math.pow(1 - 0.08, tick));
    this.camera.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(this.camera.position.y, target.y, 1 - Math.pow(1 - 0.08, tick));
    this.camera.zoom = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.lerp)(this.camera.zoom, 0.78, 1 - Math.pow(1 - 0.12, tick));
    const halfWidth = this.viewportWidth / this.camera.zoom / 2;
    const halfHeight = this.viewportHeight / this.camera.zoom / 2;
    this.camera.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.x, halfWidth, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.width - halfWidth);
    this.camera.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.y, halfHeight, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.height - halfHeight);
  }

  buildSnapshot() {
    return {
      blue: {
        health: this.blue.health,
        maxHealth: this.blue.maxHealth,
        healthRatio: this.blue.health / this.blue.maxHealth,
        drones: this.getDroneCount('blue'),
        cap: this.getDroneCap('blue'),
        planets: this.getPlanetCount('blue'),
        buffs: this.blue.getActiveBuffs(),
      },
      red: {
        health: this.red.health,
        maxHealth: this.red.maxHealth,
        healthRatio: this.red.health / this.red.maxHealth,
        drones: this.getDroneCount('red'),
        cap: this.getDroneCap('red'),
        planets: this.getPlanetCount('red'),
        buffs: this.red.getActiveBuffs(),
      },
      stateKey: this.state === 'playing' ? 'battleLive' : this.state === 'victory' ? 'awaitingRestart' : 'standBy',
      neutralPlanets: this.planets.filter((planet) => !planet.owner).length,
      itemCap: _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.maxActive,
    };
  }

  getVisibleWorldBounds(world) {
    const halfWidth = this.viewportWidth / this.camera.zoom / 2;
    const halfHeight = this.viewportHeight / this.camera.zoom / 2;
    return {
      left: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.x - halfWidth - 96, 0, world.width),
      right: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.x + halfWidth + 96, 0, world.width),
      top: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.y - halfHeight - 96, 0, world.height),
      bottom: (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(this.camera.position.y + halfHeight + 96, 0, world.height),
    };
  }

  getOnlineBackgroundChunk(chunkX, chunkY) {
    const key = `${chunkX}:${chunkY}`;
    const cached = this.online.backgroundChunks.get(key);
    if (cached) return cached;

    const chunkCanvas = document.createElement('canvas');
    chunkCanvas.width = _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE;
    chunkCanvas.height = _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE;
    const chunkCtx = chunkCanvas.getContext('2d');
    const worldX = chunkX * _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE;
    const worldY = chunkY * _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE;

    chunkCtx.fillStyle = 'rgba(5, 12, 20, 0.92)';
    chunkCtx.fillRect(0, 0, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);

    const glow = chunkCtx.createRadialGradient(
      _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE * 0.35,
      _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE * 0.35,
      0,
      _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE * 0.35,
      _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE * 0.35,
      _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE * 0.75,
    );
    glow.addColorStop(0, 'rgba(79, 212, 255, 0.05)');
    glow.addColorStop(1, 'rgba(79, 212, 255, 0)');
    chunkCtx.fillStyle = glow;
    chunkCtx.fillRect(0, 0, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);

    chunkCtx.strokeStyle = 'rgba(126, 184, 227, 0.06)';
    chunkCtx.lineWidth = 1;

    const startGridX = Math.floor(worldX / 120) * 120;
    for (let x = startGridX; x <= worldX + _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE; x += 120) {
      const localX = x - worldX;
      chunkCtx.beginPath();
      chunkCtx.moveTo(localX, 0);
      chunkCtx.lineTo(localX, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);
      chunkCtx.stroke();
    }

    const startGridY = Math.floor(worldY / 120) * 120;
    for (let y = startGridY; y <= worldY + _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE; y += 120) {
      const localY = y - worldY;
      chunkCtx.beginPath();
      chunkCtx.moveTo(0, localY);
      chunkCtx.lineTo(_online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE, localY);
      chunkCtx.stroke();
    }

    this.online.backgroundChunks.set(key, chunkCanvas);
    return chunkCanvas;
  }

  drawOnlineChunkedBackground(ctx) {
    const bounds = this.getVisibleWorldBounds(_online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD);
    const startChunkX = Math.floor(bounds.left / _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);
    const endChunkX = Math.floor(bounds.right / _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);
    const startChunkY = Math.floor(bounds.top / _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);
    const endChunkY = Math.floor(bounds.bottom / _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY += 1) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
        const canvas = this.getOnlineBackgroundChunk(chunkX, chunkY);
        ctx.drawImage(canvas, chunkX * _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE, chunkY * _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_CHUNK_SIZE);
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.width, _online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD.height);
  }

  renderBackground(focusA, focusB) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    const sky = ctx.createLinearGradient(0, 0, this.viewportWidth, this.viewportHeight);
    sky.addColorStop(0, '#010204');
    sky.addColorStop(0.5, '#07111a');
    sky.addColorStop(1, '#04070d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    for (const target of [focusA, focusB].filter(Boolean)) {
      const glow = this.camera.worldToScreen(target.x, target.y, { width: this.viewportWidth, height: this.viewportHeight });
      const bloom = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, this.viewportWidth * 0.24);
      bloom.addColorStop(0, `${target.color}22`);
      bloom.addColorStop(1, `${target.color}00`);
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    }

    for (const star of this.stars) {
      const x = (star.x - this.camera.position.x) * star.depth * this.camera.zoom + this.viewportWidth * 0.5;
      const y = (star.y - this.camera.position.y) * star.depth * this.camera.zoom + this.viewportHeight * 0.5;
      if (x < -10 || x > this.viewportWidth + 10 || y < -10 || y > this.viewportHeight + 10) continue;
      ctx.fillStyle = `rgba(219, 240, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size * star.depth, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderLocalWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });
    ctx.fillStyle = 'rgba(5, 12, 20, 0.92)';
    ctx.fillRect(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);
    ctx.strokeStyle = 'rgba(126, 184, 227, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width; x += _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);
      ctx.stroke();
    }
    for (let y = 0; y <= _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height; y += _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(_config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, y);
      ctx.stroke();
    }
    this.planets.forEach((planet) => planet.draw(ctx));
    this.items.forEach((item) => item.draw(ctx));
    this.drones.forEach((drone) => drone.draw(ctx));
    this.blue.draw(ctx);
    this.red.draw(ctx);
    for (const particle of this.particles) {
      const alpha = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(particle.life / (particle.maxLife || 42), 0, 1);
      ctx.globalAlpha = alpha;
      if (particle.type === 'ring') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.lineWidth;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    this.camera.restore(ctx);
  }

  renderOnlineWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });
    const bounds = this.getVisibleWorldBounds(_online_constants_js__WEBPACK_IMPORTED_MODULE_9__.ONLINE_WORLD);
    this.drawOnlineChunkedBackground(ctx);

    for (const planet of this.online.renderedPlanets.values()) {
      if (
        planet.x + planet.radius < bounds.left
        || planet.x - planet.radius > bounds.right
        || planet.y + planet.radius < bounds.top
        || planet.y - planet.radius > bounds.bottom
      ) {
        continue;
      }

      const visualPlanet = this.online.visualPlanets.get(planet.id);
      if (visualPlanet) {
        visualPlanet.draw(ctx);
      }
    }

    for (const drone of this.online.renderedDrones.values()) {
      if (
        drone.x + drone.radius < bounds.left
        || drone.x - drone.radius > bounds.right
        || drone.y + drone.radius < bounds.top
        || drone.y - drone.radius > bounds.bottom
      ) {
        continue;
      }
      const visualDrone = this.online.visualDrones.get(drone.id);
      if (visualDrone) visualDrone.draw(ctx);
    }

    for (const ship of this.online.renderedShips.values()) {
      if (
        ship.x + ship.radius < bounds.left
        || ship.x - ship.radius > bounds.right
        || ship.y + ship.radius < bounds.top
        || ship.y - ship.radius > bounds.bottom
      ) {
        continue;
      }
      const visualShip = this.online.visualShips.get(ship.slotId);
      if (visualShip) {
        visualShip.draw(ctx);
        if (ship.slotId === this.online.slotId) {
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius + 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.font = '700 14px Aptos, Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('YOU', 0, -ship.radius - 22);
          ctx.restore();
        }
      }
    }

    for (const particle of this.online.particles) {
      if (
        particle.x < bounds.left
        || particle.x > bounds.right
        || particle.y < bounds.top
        || particle.y > bounds.bottom
      ) {
        continue;
      }
      const alpha = (0,_utils_js__WEBPACK_IMPORTED_MODULE_11__.clamp)(particle.life / (particle.maxLife || 18), 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    this.camera.restore(ctx);
  }

  renderTouchUi() {
    const ctx = this.ctx;
    const team = this.mode === 'online' ? 'online' : null;
    ctx.save();
    if (team) {
      const state = this.controls.getJoystickState(team);
      if (state) {
        ctx.strokeStyle = 'rgba(91, 228, 213, 0.72)';
        ctx.fillStyle = 'rgba(91, 228, 213, 0.12)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(state.startX, state.startY, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(91, 228, 213, 0.78)';
        ctx.beginPath();
        ctx.arc(state.currentX, state.currentY, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    for (const side of ['blue', 'red']) {
      const state = this.controls.getJoystickState(side);
      if (!state) continue;
      const color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[side].primary;
      ctx.strokeStyle = `${color}99`;
      ctx.fillStyle = `${color}22`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(state.startX, state.startY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `${color}bb`;
      ctx.beginPath();
      ctx.arc(state.currentX, state.currentY, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  update(delta) {
    this.time += delta;
    const tick = Math.min(2.5, delta / (1000 / 60));
    if (this.mode === 'online') {
      this.updateOnline(delta);
      return;
    }
    if (this.state === 'start') this.updateStart(delta);
    else if (this.state === 'playing') this.updatePlaying(tick);
    else if (this.state === 'victory') this.updateParticles(tick);
    this.ui.updateHUD(this.buildSnapshot());
  }

  render() {
    if (this.mode === 'online') {
      const self = this.online.renderedShips.get(this.online.slotId);
      this.renderBackground(self ? { x: self.x, y: self.y, color: self.theme.primary } : null, null);
      this.renderOnlineWorld();
      if (this.state === 'playing') this.renderTouchUi();
      return;
    }

    this.renderBackground(
      { x: this.blue.pos.x, y: this.blue.pos.y, color: _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.blue.primary },
      { x: this.red.pos.x, y: this.red.pos.y, color: _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.red.primary },
    );
    this.renderLocalWorld();
    if (this.state === 'playing') this.renderTouchUi();
  }

  frame = (now) => {
    const delta = Math.min(48, now - this.lastTime);
    this.lastTime = now;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.frame);
  };

  start() {
    this.ui.showStart();
    requestAnimationFrame(this.frame);
  }
}


/***/ },

/***/ "./js/item-icons.js"
/*!**************************!*\
  !*** ./js/item-icons.js ***!
  \**************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawItemIcon: () => (/* binding */ drawItemIcon),
/* harmony export */   getItemIconMarkup: () => (/* binding */ getItemIconMarkup)
/* harmony export */ });
const SVG_VIEWBOX = '0 0 24 24';

function iconSvg(inner) {
  return `<svg viewBox="${SVG_VIEWBOX}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

function getItemIconMarkup(item) {
  switch (item.icon) {
    case 'thruster':
      return iconSvg(`
        <path class="icon-fill-soft" d="M12 3.4 16.9 10v3.8L12 18.8 7.1 13.8V10Z"/>
        <path d="M12 4.2 16 10v3.2L12 16.8 8 13.2V10Z"/>
        <path d="M9.1 12.2h5.8"/>
        <path d="M10.2 17.1 8.7 20.1l3.3-1.2 3.3 1.2-1.5-3"/>
      `);
    case 'factory':
      return iconSvg(`
        <path class="icon-fill-soft" d="M4.5 19.5V9.1l4.5 2.4V8.7l4 2.2V7.5l6.5 3.4v8.6Z"/>
        <path d="M5 19V9.8l4.5 2.3V9.4l4 2.2V8.2l5.5 2.9V19Z"/>
        <path d="M8.2 19v-3.2"/>
        <path d="M11.9 19v-5.2"/>
        <path d="M15.8 19v-2.8"/>
        <path d="M7.2 7.2h2.6"/>
      `);
    case 'expand':
      return iconSvg(`
        <rect class="icon-fill-soft" x="9" y="9" width="6" height="6" rx="1.4"/>
        <rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1.2"/>
        <path d="M8.2 8.2 5 5"/>
        <path d="M15.8 8.2 19 5"/>
        <path d="M8.2 15.8 5 19"/>
        <path d="M15.8 15.8 19 19"/>
        <path d="M5 8V5h3"/>
        <path d="M19 8V5h-3"/>
        <path d="M5 16v3h3"/>
        <path d="M19 16v3h-3"/>
      `);
    case 'bolt':
      return iconSvg(`
        <path class="icon-fill-strong" d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M6 6.1 8 7.3"/>
        <path d="m16.4 17.5 2.2 1.3"/>
      `);
    case 'crosshair':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="12" cy="12" r="5.6"/>
        <circle cx="12" cy="12" r="5.1"/>
        <path d="M12 3.2v3.1"/>
        <path d="M12 17.7v3.1"/>
        <path d="M3.2 12h3.1"/>
        <path d="M17.7 12h3.1"/>
        <circle class="icon-fill-strong" cx="12" cy="12" r="1.6"/>
      `);
    case 'eclipse':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="10.7" cy="12" r="5.6"/>
        <path class="icon-fill-strong" d="M13.7 6.4a5.9 5.9 0 1 0 0 11.2 6.7 6.7 0 0 1-2.8.6 6.2 6.2 0 1 1 2.8-11.8Z"/>
        <circle cx="17.6" cy="7.4" r="1.2"/>
        <path d="m19.4 5.6.8-.8"/>
        <path d="m18.9 9.4.8.8"/>
      `);
    case 'flag':
      return iconSvg(`
        <path d="M7 20V4"/>
        <path class="icon-fill-soft" d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M7 20h10"/>
        <path d="M10.1 13.8c1.2-.8 2.5-.8 3.8 0"/>
      `);
    default:
      return iconSvg('<circle cx="12" cy="12" r="5"/><circle class="icon-fill-strong" cx="12" cy="12" r="1.8"/>');
  }
}

function drawItemIcon(ctx, type, size) {
  ctx.save();
  ctx.strokeStyle = '#ecf7ff';
  ctx.fillStyle = '#ecf7ff';
  ctx.lineWidth = Math.max(1.6, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 24;

  switch (type.icon) {
    case 'thruster':
      ctx.beginPath();
      ctx.moveTo(0, -8.5 * s);
      ctx.lineTo(4.7 * s, -2.1 * s);
      ctx.lineTo(4.7 * s, 1.8 * s);
      ctx.lineTo(0, 6.4 * s);
      ctx.lineTo(-4.7 * s, 1.8 * s);
      ctx.lineTo(-4.7 * s, -2.1 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.2 * s, 0.2 * s);
      ctx.lineTo(2.2 * s, 0.2 * s);
      ctx.moveTo(-2.2 * s, 6 * s);
      ctx.lineTo(0, 9.2 * s);
      ctx.lineTo(2.2 * s, 6 * s);
      ctx.stroke();
      break;
    case 'factory':
      ctx.beginPath();
      ctx.moveTo(-8 * s, 8.5 * s);
      ctx.lineTo(-8 * s, -2 * s);
      ctx.lineTo(-3.5 * s, 0.3 * s);
      ctx.lineTo(-3.5 * s, -2.5 * s);
      ctx.lineTo(0.3 * s, -0.4 * s);
      ctx.lineTo(0.3 * s, -3.8 * s);
      ctx.lineTo(7.3 * s, -0.2 * s);
      ctx.lineTo(7.3 * s, 8.5 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, 8.5 * s);
      ctx.lineTo(-4.8 * s, 3.8 * s);
      ctx.moveTo(-0.9 * s, 8.5 * s);
      ctx.lineTo(-0.9 * s, 2.2 * s);
      ctx.moveTo(3 * s, 8.5 * s);
      ctx.lineTo(3 * s, 5.2 * s);
      ctx.stroke();
      break;
    case 'expand':
      ctx.strokeRect(-3.6 * s, -3.6 * s, 7.2 * s, 7.2 * s);
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, -4.8 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.moveTo(4.8 * s, -4.8 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.moveTo(-4.8 * s, 4.8 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.moveTo(4.8 * s, 4.8 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.moveTo(-8.7 * s, -4.2 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.lineTo(-4.2 * s, -8.7 * s);
      ctx.moveTo(8.7 * s, -4.2 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.lineTo(4.2 * s, -8.7 * s);
      ctx.moveTo(-8.7 * s, 4.2 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.lineTo(-4.2 * s, 8.7 * s);
      ctx.moveTo(8.7 * s, 4.2 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.lineTo(4.2 * s, 8.7 * s);
      ctx.stroke();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(1.5 * s, -9.3 * s);
      ctx.lineTo(-4.8 * s, 0.1 * s);
      ctx.lineTo(-1.2 * s, 0.1 * s);
      ctx.lineTo(-2.7 * s, 9.2 * s);
      ctx.lineTo(5.6 * s, -1.2 * s);
      ctx.lineTo(1.9 * s, -1.2 * s);
      ctx.closePath();
      ctx.fill();
      break;
    case 'crosshair':
      ctx.beginPath();
      ctx.arc(0, 0, 5.2 * s, 0, Math.PI * 2);
      ctx.moveTo(0, -9 * s);
      ctx.lineTo(0, -6.1 * s);
      ctx.moveTo(0, 6.1 * s);
      ctx.lineTo(0, 9 * s);
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(-6.1 * s, 0);
      ctx.moveTo(6.1 * s, 0);
      ctx.lineTo(9 * s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.7 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'eclipse':
      ctx.beginPath();
      ctx.arc(-1.8 * s, 0, 5.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2 * s, 0, 5.8 * s, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6.6 * s, -4.8 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flag':
      ctx.beginPath();
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(-5.3 * s, -8.6 * s);
      ctx.moveTo(-4.4 * s, -7 * s);
      ctx.lineTo(5.4 * s, -7 * s);
      ctx.lineTo(2.4 * s, -3 * s);
      ctx.lineTo(5.4 * s, 0.8 * s);
      ctx.lineTo(-4.4 * s, 0.8 * s);
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(5.3 * s, 9 * s);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }

  ctx.restore();
}


/***/ },

/***/ "./js/network-client.js"
/*!******************************!*\
  !*** ./js/network-client.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NetworkClient: () => (/* binding */ NetworkClient)
/* harmony export */ });
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io-client */ "./node_modules/socket.io-client/build/esm/index.js");
/* harmony import */ var _online_constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./online-constants.js */ "./js/online-constants.js");



function resolveServerUrl() {
  const configured = window.localStorage.getItem('ssa-online-server');
  if (configured) {
    return configured;
  }

  const { protocol, hostname, port } = window.location;
  const normalizedProtocol = protocol === 'https:' ? 'https:' : 'http:';
  const preferredPort = port === String(_online_constants_js__WEBPACK_IMPORTED_MODULE_1__.ONLINE_SOCKET_PORT) ? port : String(_online_constants_js__WEBPACK_IMPORTED_MODULE_1__.ONLINE_SOCKET_PORT);
  return `${normalizedProtocol}//${hostname}:${preferredPort}`;
}

class NetworkClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.socket = null;
    this.playerSlotId = null;
    this.roomId = null;
  }

  connect() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_0__.io)(resolveServerUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 600,
      reconnectionDelayMax: 2200,
      timeout: 7000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.callbacks.onConnection?.('connected');
      this.socket.emit('match:join');
    });

    this.socket.on('disconnect', (reason) => {
      this.callbacks.onConnection?.('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.callbacks.onConnection?.('error', error?.message || 'Unable to connect');
    });

    this.socket.on('match:joined', (payload) => {
      this.playerSlotId = payload.slotId;
      this.roomId = payload.roomId;
      this.callbacks.onJoined?.(payload);
    });

    this.socket.on('match:status', (payload) => {
      this.callbacks.onStatus?.(payload);
    });

    this.socket.on('match:snapshot', (payload) => {
      this.callbacks.onSnapshot?.(payload);
    });

    return this.socket;
  }

  sendInput(input) {
    if (!this.socket?.connected) return;
    this.socket.emit('match:input', input);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.playerSlotId = null;
    this.roomId = null;
  }
}


/***/ },

/***/ "./js/online-constants.js"
/*!********************************!*\
  !*** ./js/online-constants.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ONLINE_CHUNK_SIZE: () => (/* binding */ ONLINE_CHUNK_SIZE),
/* harmony export */   ONLINE_DRONE_BASE_CAP: () => (/* binding */ ONLINE_DRONE_BASE_CAP),
/* harmony export */   ONLINE_DRONE_HEALTH: () => (/* binding */ ONLINE_DRONE_HEALTH),
/* harmony export */   ONLINE_DRONE_PLANET_BONUS: () => (/* binding */ ONLINE_DRONE_PLANET_BONUS),
/* harmony export */   ONLINE_DRONE_RADIUS: () => (/* binding */ ONLINE_DRONE_RADIUS),
/* harmony export */   ONLINE_DRONE_SPEED: () => (/* binding */ ONLINE_DRONE_SPEED),
/* harmony export */   ONLINE_MAX_ENERGY: () => (/* binding */ ONLINE_MAX_ENERGY),
/* harmony export */   ONLINE_MAX_HEALTH: () => (/* binding */ ONLINE_MAX_HEALTH),
/* harmony export */   ONLINE_PLANET_DRONE_SPAWN_RATE: () => (/* binding */ ONLINE_PLANET_DRONE_SPAWN_RATE),
/* harmony export */   ONLINE_PLANET_LAYOUT: () => (/* binding */ ONLINE_PLANET_LAYOUT),
/* harmony export */   ONLINE_PLANET_TEXTURES: () => (/* binding */ ONLINE_PLANET_TEXTURES),
/* harmony export */   ONLINE_ROOM_CAPACITY: () => (/* binding */ ONLINE_ROOM_CAPACITY),
/* harmony export */   ONLINE_SHIP_DRONE_SPAWN_RATE: () => (/* binding */ ONLINE_SHIP_DRONE_SPAWN_RATE),
/* harmony export */   ONLINE_SHIP_RADIUS: () => (/* binding */ ONLINE_SHIP_RADIUS),
/* harmony export */   ONLINE_SHIP_TEXTURES: () => (/* binding */ ONLINE_SHIP_TEXTURES),
/* harmony export */   ONLINE_SLOT_THEMES: () => (/* binding */ ONLINE_SLOT_THEMES),
/* harmony export */   ONLINE_SOCKET_PORT: () => (/* binding */ ONLINE_SOCKET_PORT),
/* harmony export */   ONLINE_WORLD: () => (/* binding */ ONLINE_WORLD),
/* harmony export */   getOnlineSpawnPoint: () => (/* binding */ getOnlineSpawnPoint),
/* harmony export */   getOnlineTheme: () => (/* binding */ getOnlineTheme)
/* harmony export */ });
const ONLINE_ROOM_CAPACITY = 6;
const ONLINE_WORLD = {
  width: 2600,
  height: 1800,
};

const ONLINE_SOCKET_PORT = 3001;
const ONLINE_SHIP_RADIUS = 28;
const ONLINE_MAX_HEALTH = 100;
const ONLINE_MAX_ENERGY = 100;
const ONLINE_CHUNK_SIZE = 512;
const ONLINE_DRONE_RADIUS = 6;
const ONLINE_DRONE_HEALTH = 18;
const ONLINE_DRONE_SPEED = 2.45;
const ONLINE_DRONE_BASE_CAP = 10;
const ONLINE_DRONE_PLANET_BONUS = 4;
const ONLINE_SHIP_DRONE_SPAWN_RATE = 78;
const ONLINE_PLANET_DRONE_SPAWN_RATE = 176;

const ONLINE_SLOT_THEMES = [
  { slotId: 'slot-1', badge: 'P1', callsign: 'Azure', primary: '#4fd4ff', secondary: '#0f6cdd', glow: 'rgba(79, 212, 255, 0.28)' },
  { slotId: 'slot-2', badge: 'P2', callsign: 'Ember', primary: '#ff8a7a', secondary: '#e14d55', glow: 'rgba(255, 138, 122, 0.28)' },
  { slotId: 'slot-3', badge: 'P3', callsign: 'Solar', primary: '#ffd36f', secondary: '#d6861b', glow: 'rgba(255, 211, 111, 0.26)' },
  { slotId: 'slot-4', badge: 'P4', callsign: 'Mint', primary: '#7cffd8', secondary: '#14b88e', glow: 'rgba(124, 255, 216, 0.24)' },
  { slotId: 'slot-5', badge: 'P5', callsign: 'Nova', primary: '#8fb7ff', secondary: '#4268ff', glow: 'rgba(143, 183, 255, 0.26)' },
  { slotId: 'slot-6', badge: 'P6', callsign: 'Flare', primary: '#ffb46b', secondary: '#ff6d3a', glow: 'rgba(255, 180, 107, 0.26)' },
];

const ONLINE_PLANET_LAYOUT = [
  { id: 'planet-a', x: 430, y: 430, radius: 72 },
  { id: 'planet-b', x: 1300, y: 280, radius: 66 },
  { id: 'planet-c', x: 2170, y: 430, radius: 72 },
  { id: 'planet-d', x: 560, y: 930, radius: 70 },
  { id: 'planet-e', x: 1300, y: 900, radius: 86 },
  { id: 'planet-f', x: 2040, y: 930, radius: 70 },
  { id: 'planet-g', x: 430, y: 1420, radius: 72 },
  { id: 'planet-h', x: 1300, y: 1540, radius: 68 },
  { id: 'planet-i', x: 2170, y: 1420, radius: 72 },
];

const ONLINE_SHIP_TEXTURES = {
  'slot-1': 'online-1',
  'slot-2': 'online-2',
  'slot-3': 'online-3',
  'slot-4': 'online-4',
  'slot-5': 'online-5',
  'slot-6': 'online-6',
};

const ONLINE_PLANET_TEXTURES = [
  'online-1',
  'online-2',
  'online-3',
  'online-4',
  'online-5',
  'online-6',
  'online-7',
  'online-8',
  'online-9',
];

function getOnlineTheme(slotId) {
  return ONLINE_SLOT_THEMES.find((theme) => theme.slotId === slotId) || ONLINE_SLOT_THEMES[0];
}

function getOnlineSpawnPoint(index) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / ONLINE_ROOM_CAPACITY;
  const radius = 560;
  return {
    x: ONLINE_WORLD.width * 0.5 + Math.cos(angle) * radius,
    y: ONLINE_WORLD.height * 0.5 + Math.sin(angle) * radius,
  };
}


/***/ },

/***/ "./js/ui.js"
/*!******************!*\
  !*** ./js/ui.js ***!
  \******************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UI: () => (/* binding */ UI)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ "./js/config.js");
/* harmony import */ var _item_icons_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./item-icons.js */ "./js/item-icons.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");




const TRANSLATIONS = {
  en: {
    langButton: 'EN',
    pageTitle: 'Star Swarm Arena',
    blueFleet: 'Blue Fleet',
    redFleet: 'Red Fleet',
    mothershipCommand: 'Mothership Command',
    strikeFormation: 'Strike Formation',
    arenaStatus: 'Arena Status',
    velocitySystem: 'Velocity Duel System',
    logoTitle: 'Star Swarm Arena',
    startOverline: 'Local And Online Fleet Arena',
    startTitle: 'Break Formation. Seize The Arena.',
    startDescription: 'Choose a same-screen duel or join a live 6-player room where bots hold the line until real pilots drop in and take over.',
    localPlay: 'Local Play',
    onlinePlay: 'Online Play',
    modeNotes: 'Mode Notes',
    localLabel: 'Local',
    onlineLabel: 'Online',
    mobileLabel: 'Mobile',
    localControls: 'W A S D / Arrows',
    onlineControls: 'W A S D + Space',
    mobileControls: 'Left Move / Right Boost',
    settingsNote: 'Online rooms hold 6 slots. Empty seats stay active as bots, and new players inherit that bot\'s current resources.',
    matchComplete: 'Match Complete',
    runItBack: 'Run It Back',
    backToHome: 'Back To Home',
    onlineMatch: 'Online Match',
    onlineConnectingTitle: 'Connecting To Fleet Relay',
    onlineConnectingSubtitle: 'Finding a room with up to 6 players. Empty seats stay active as bots until someone joins.',
    onlineWaiting: 'Waiting for server...',
    roomRoster: 'Room Roster',
    resourceLabel: 'Resources',
    planetLabel: 'Planets',
    elimLabel: 'Elims',
    hullLabel: 'Hull',
    boostLabel: 'Boost',
    battleLive: 'Battle Live',
    awaitingRestart: 'Awaiting Restart',
    standBy: 'Stand By',
    neutralTip: (count, cap) => `${count} neutral planets remain. Item cap: ${cap}.`,
    victoryTitle: (winner) => `${winner} Victory`,
    victorySubtitle: (winner) => `The enemy flagship is down. ${winner} now controls the arena.`,
    items: {
      'ship-speed': { name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.' },
      production: { name: 'Production', description: 'Drone output doubles for 3 seconds.' },
      'drone-size': { name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.' },
      'drone-speed': { name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.' },
      'drone-attack': { name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.' },
      neutralize: { name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.' },
      autocapture: { name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.' },
    },
    buffs: {
      shipSpeed: 'Ship Speed',
      production: 'Production',
      droneSize: 'Drone Size',
      droneSpeed: 'Drone Speed',
      droneDamage: 'Attack x2',
      autocapture: 'Auto Capture',
    },
    teams: {
      blue: 'Blue Fleet',
      red: 'Red Fleet',
    },
  },
  zh: {
    langButton: '中文',
    pageTitle: '星群竞技场',
    blueFleet: '蓝方舰队',
    redFleet: '红方舰队',
    mothershipCommand: '母舰指挥',
    strikeFormation: '突击编队',
    arenaStatus: '战场状态',
    velocitySystem: '高速对决系统',
    logoTitle: '星群竞技场',
    startOverline: '本地与在线舰队竞技',
    startTitle: '突破阵线，夺取战场。',
    startDescription: '你可以选择本地同屏对战，或进入一个最多 6 人的在线房间，让机器人先守住战局，玩家加入后直接接管它们当前的资源。',
    localPlay: '本地游玩',
    onlinePlay: '在线游玩',
    modeNotes: '模式说明',
    localLabel: '本地',
    onlineLabel: '在线',
    mobileLabel: '手机',
    localControls: 'W A S D / 方向键',
    onlineControls: 'W A S D + 空格',
    mobileControls: '左侧移动 / 右侧加速',
    settingsNote: '在线房间一共 6 个槽位，空位默认由机器人游玩，玩家加入后会接管该机器人的当前资源。',
    matchComplete: '对局结束',
    runItBack: '再来一局',
    backToHome: '返回主页',
    onlineMatch: '在线对局',
    onlineConnectingTitle: '正在连接舰队中继',
    onlineConnectingSubtitle: '正在寻找一个最多 6 人的房间。空位会先由机器人代打，直到玩家接入。',
    onlineWaiting: '正在等待服务器...',
    roomRoster: '房间成员',
    resourceLabel: '资源',
    planetLabel: '星球',
    elimLabel: '击破',
    hullLabel: '血量',
    boostLabel: '加速',
    battleLive: '战斗进行中',
    awaitingRestart: '等待重开',
    standBy: '待命中',
    neutralTip: (count, cap) => `剩余中立星球 ${count} 颗。道具上限 ${cap}。`,
    victoryTitle: (winner) => `${winner} 胜利`,
    victorySubtitle: (winner) => `敌方母舰已被摧毁，现在由 ${winner} 掌控这片战场。`,
    items: {
      'ship-speed': { name: '母舰加速', description: '母舰速度提升 50%，持续 3 秒。' },
      production: { name: '产能翻倍', description: '无人机产出翻倍，持续 3 秒。' },
      'drone-size': { name: '无人机增幅', description: '无人机体型提升 80%，持续 3 秒。' },
      'drone-speed': { name: '无人机提速', description: '无人机速度提升 50%，持续 3 秒。' },
      'drone-attack': { name: '攻击翻倍', description: '无人机伤害翻倍，持续 3 秒。' },
      neutralize: { name: '中立化', description: '立即将一颗敌方星球重置为中立。' },
      autocapture: { name: '自动占领', description: '3 秒后自动夺取最近的一颗星球。' },
    },
    buffs: {
      shipSpeed: '母舰加速',
      production: '产能翻倍',
      droneSize: '无人机增幅',
      droneSpeed: '无人机提速',
      droneDamage: '攻击翻倍',
      autocapture: '自动占领',
    },
    teams: {
      blue: '蓝方舰队',
      red: '红方舰队',
    },
  },
};

class UI {
  constructor() {
    this.appShell = document.querySelector('.app-shell');
    this.hud = document.getElementById('top-hud');
    this.onlineHud = document.getElementById('online-hud');
    this.onlineMobileHud = document.getElementById('online-mobile-hud');
    this.startScreen = document.getElementById('start-screen');
    this.onlineStatusScreen = document.getElementById('online-status-screen');
    this.victoryScreen = document.getElementById('victory-screen');
    this.startButton = document.getElementById('start-button');
    this.settingsButton = document.getElementById('settings-button');
    this.settingsPanel = document.getElementById('settings-panel');
    this.languageButton = document.getElementById('language-button');
    this.restartButton = document.getElementById('restart-button');
    this.homeButton = document.getElementById('home-button');
    this.onlineHomeButton = document.getElementById('online-home-button');
    this.blueBoostButton = document.getElementById('blue-boost-button');
    this.redBoostButton = document.getElementById('red-boost-button');
    this.onlineBoostButton = document.getElementById('online-boost-button');
    this.victoryTitle = document.getElementById('victory-title');
    this.victorySubtitle = document.getElementById('victory-subtitle');
    this.hudState = document.getElementById('hud-state');
    this.hudTip = document.getElementById('hud-tip');
    this.onlineStatusTitle = document.getElementById('online-status-title');
    this.onlineStatusSubtitle = document.getElementById('online-status-subtitle');
    this.onlineStatusMeta = document.getElementById('online-status-meta');
    this.pickupNoticeStacks = {
      blue: document.getElementById('blue-pickup-notices'),
      red: document.getElementById('red-pickup-notices'),
    };
    this.currentLanguage = 'en';
    this.lastWinner = null;
    this.pickupNoticeEntries = [];
    this.pickupNoticeTimers = new Map();
    this.pickupNoticeSeq = 0;
    this.currentMode = 'local';
    this.lastOnlineHudSignature = '';
    this.lastOnlineRosterSignature = '';

    this.textRefs = {
      html: document.documentElement,
      title: document.querySelector('title'),
      blueName: document.querySelector('.hud-panel.blue .hud-name'),
      blueSubname: document.querySelector('.hud-panel.blue .hud-subname'),
      redName: document.querySelector('.hud-panel.red .hud-name'),
      redSubname: document.querySelector('.hud-panel.red .hud-subname'),
      arenaStatus: document.querySelector('.hud-center .eyebrow'),
      logoKicker: document.querySelector('.start-logo-kicker'),
      logoTitle: document.querySelector('.start-logo-title'),
      startOverline: document.querySelector('.start-overline'),
      startTitle: document.querySelector('.start-copy h1'),
      startDescription: document.querySelector('.start-description'),
      settingsTitle: document.querySelector('.settings-title'),
      settingsLocalLabel: document.querySelector('#settings-panel .settings-row:nth-child(2) span'),
      settingsLocalValue: document.querySelector('#settings-panel .settings-row:nth-child(2) strong'),
      settingsOnlineLabel: document.querySelector('#settings-panel .settings-row:nth-child(3) span'),
      settingsOnlineValue: document.querySelector('#settings-panel .settings-row:nth-child(3) strong'),
      settingsMobileLabel: document.querySelector('#settings-panel .settings-row:nth-child(4) span'),
      settingsMobileValue: document.querySelector('#settings-panel .settings-row:nth-child(4) strong'),
      settingsNote: document.querySelector('.settings-note'),
      victoryEyebrow: document.querySelector('.victory-panel .eyebrow'),
      onlineHudTitle: document.querySelector('.online-card-title'),
      onlineStatusEyebrow: document.querySelector('.online-status-panel .eyebrow'),
    };

    this.refs = {
      blue: {
        bar: document.getElementById('blue-health-bar'),
        health: document.getElementById('blue-health-text'),
        drones: document.getElementById('blue-drone-text'),
        planets: document.getElementById('blue-planet-text'),
        buffs: document.getElementById('blue-buffs'),
      },
      red: {
        bar: document.getElementById('red-health-bar'),
        health: document.getElementById('red-health-text'),
        drones: document.getElementById('red-drone-text'),
        planets: document.getElementById('red-planet-text'),
        buffs: document.getElementById('red-buffs'),
      },
    };

    this.onlineRefs = {
      badge: document.getElementById('online-player-badge'),
      name: document.getElementById('online-player-name'),
      room: document.getElementById('online-player-room'),
      healthBar: document.getElementById('online-health-bar'),
      energyBar: document.getElementById('online-energy-bar'),
      resourceText: document.getElementById('online-resource-text'),
      planetText: document.getElementById('online-planet-text'),
      killText: document.getElementById('online-kill-text'),
      roster: document.getElementById('online-roster'),
      mobileRoom: document.getElementById('online-mobile-room'),
      mobileSeat: document.getElementById('online-mobile-seat'),
      mobileHealthBar: document.getElementById('online-mobile-health-bar'),
      mobileEnergyBar: document.getElementById('online-mobile-energy-bar'),
      mobileResourceText: document.getElementById('online-mobile-resource-text'),
      mobilePlanetText: document.getElementById('online-mobile-planet-text'),
      mobileKillText: document.getElementById('online-mobile-kill-text'),
    };

    this.bindLanguage();
    this.applyTranslations();
    this.setVisualState('start', 'local');
  }

  bindCallbacks(callbacks) {
    this.startButton?.addEventListener('click', callbacks.onStart);
    this.settingsButton?.addEventListener('click', callbacks.onOnlineStart);
    this.restartButton?.addEventListener('click', callbacks.onRestart);
    this.homeButton?.addEventListener('click', callbacks.onHome);
    this.onlineHomeButton?.addEventListener('click', callbacks.onOnlineHome || callbacks.onHome);
  }

  bindLanguage() {
    if (!this.languageButton) return;
    this.languageButton.addEventListener('click', () => {
      this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
      this.applyTranslations();
    });
  }

  applyTranslations() {
    const t = TRANSLATIONS[this.currentLanguage];
    this.textRefs.html?.setAttribute('lang', this.currentLanguage === 'en' ? 'en' : 'zh-CN');
    if (this.textRefs.title) this.textRefs.title.textContent = t.pageTitle;
    if (this.languageButton) this.languageButton.textContent = t.langButton;
    if (this.textRefs.blueName) this.textRefs.blueName.textContent = t.blueFleet;
    if (this.textRefs.blueSubname) this.textRefs.blueSubname.textContent = t.mothershipCommand;
    if (this.textRefs.redName) this.textRefs.redName.textContent = t.redFleet;
    if (this.textRefs.redSubname) this.textRefs.redSubname.textContent = t.strikeFormation;
    if (this.textRefs.arenaStatus) this.textRefs.arenaStatus.textContent = t.arenaStatus;
    if (this.textRefs.logoKicker) this.textRefs.logoKicker.textContent = t.velocitySystem;
    if (this.textRefs.logoTitle) this.textRefs.logoTitle.textContent = t.logoTitle;
    if (this.textRefs.startOverline) this.textRefs.startOverline.textContent = t.startOverline;
    if (this.textRefs.startTitle) this.textRefs.startTitle.textContent = t.startTitle;
    if (this.textRefs.startDescription) this.textRefs.startDescription.textContent = t.startDescription;
    if (this.startButton) this.startButton.textContent = t.localPlay;
    if (this.settingsButton) this.settingsButton.textContent = t.onlinePlay;
    if (this.textRefs.settingsTitle) this.textRefs.settingsTitle.textContent = t.modeNotes;
    if (this.textRefs.settingsLocalLabel) this.textRefs.settingsLocalLabel.textContent = t.localLabel;
    if (this.textRefs.settingsLocalValue) this.textRefs.settingsLocalValue.textContent = t.localControls;
    if (this.textRefs.settingsOnlineLabel) this.textRefs.settingsOnlineLabel.textContent = t.onlineLabel;
    if (this.textRefs.settingsOnlineValue) this.textRefs.settingsOnlineValue.textContent = t.onlineControls;
    if (this.textRefs.settingsMobileLabel) this.textRefs.settingsMobileLabel.textContent = t.mobileLabel;
    if (this.textRefs.settingsMobileValue) this.textRefs.settingsMobileValue.textContent = t.mobileControls;
    if (this.textRefs.settingsNote) this.textRefs.settingsNote.textContent = t.settingsNote;
    if (this.textRefs.victoryEyebrow) this.textRefs.victoryEyebrow.textContent = t.matchComplete;
    if (this.textRefs.onlineHudTitle) this.textRefs.onlineHudTitle.textContent = t.roomRoster;
    if (this.textRefs.onlineStatusEyebrow) this.textRefs.onlineStatusEyebrow.textContent = t.onlineMatch;
    if (this.onlineStatusTitle && !this.onlineStatusTitle.dataset.customized) this.onlineStatusTitle.textContent = t.onlineConnectingTitle;
    if (this.onlineStatusSubtitle && !this.onlineStatusSubtitle.dataset.customized) this.onlineStatusSubtitle.textContent = t.onlineConnectingSubtitle;
    if (this.onlineStatusMeta && !this.onlineStatusMeta.dataset.customized) this.onlineStatusMeta.textContent = t.onlineWaiting;
    if (this.restartButton) this.restartButton.textContent = t.runItBack;
    if (this.homeButton) this.homeButton.textContent = t.backToHome;
    if (this.onlineHomeButton) this.onlineHomeButton.textContent = t.backToHome;
    if (this.blueBoostButton) this.blueBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.redBoostButton) this.redBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.onlineBoostButton) this.onlineBoostButton.textContent = t.boostLabel.toUpperCase();
    if (this.lastWinner) this.setVictoryText(this.lastWinner);
    this.renderPickupNotices();
  }

  setVictoryText(team) {
    const t = TRANSLATIONS[this.currentLanguage];
    const winner = t.teams[team] || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].text;
    this.victoryTitle.textContent = t.victoryTitle(winner);
    this.victorySubtitle.textContent = t.victorySubtitle(winner);
  }

  setVisualState(state, mode = this.currentMode) {
    this.currentMode = mode;
    if (this.appShell) {
      this.appShell.dataset.mode = mode;
      this.appShell.classList.toggle('state-start', state === 'start');
      this.appShell.classList.toggle('state-playing', state === 'playing');
      this.appShell.classList.toggle('state-victory', state === 'victory');
    }
  }

  showStart() {
    this.clearPickupNotices();
    this.setVisualState('start', 'local');
    this.startScreen.classList.remove('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.settingsPanel?.classList.remove('hidden');
  }

  showPlaying() {
    this.clearPickupNotices();
    this.setVisualState('playing', 'local');
    this.startScreen.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
  }

  showOnlineStatus(status = {}) {
    const t = TRANSLATIONS[this.currentLanguage];
    this.setVisualState('start', 'online');
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineStatusScreen.classList.remove('hidden');

    if (this.onlineStatusTitle) {
      this.onlineStatusTitle.textContent = status.title || t.onlineConnectingTitle;
      this.onlineStatusTitle.dataset.customized = 'true';
    }
    if (this.onlineStatusSubtitle) {
      this.onlineStatusSubtitle.textContent = status.subtitle || t.onlineConnectingSubtitle;
      this.onlineStatusSubtitle.dataset.customized = 'true';
    }
    if (this.onlineStatusMeta) {
      this.onlineStatusMeta.textContent = status.meta || t.onlineWaiting;
      this.onlineStatusMeta.dataset.customized = 'true';
    }
  }

  showOnlinePlaying() {
    this.setVisualState('playing', 'online');
    this.startScreen.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.onlineHud.classList.remove('hidden');
    this.onlineMobileHud.classList.remove('hidden');
  }

  showVictory(team) {
    this.clearPickupNotices();
    this.setVisualState('victory', 'local');
    this.hud.classList.remove('hidden');
    this.onlineHud.classList.add('hidden');
    this.onlineMobileHud.classList.add('hidden');
    this.onlineStatusScreen.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.lastWinner = team;
    this.setVictoryText(team);
  }

  updateDualHold() {}

  getItemText(itemId) {
    const fallback = _config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES.find((item) => item.id === itemId);
    const translated = TRANSLATIONS[this.currentLanguage].items[itemId];
    return {
      name: translated?.name || fallback?.name || itemId,
      description: translated?.description || fallback?.description || '',
      accent: fallback?.accent || '#d6d8de',
      icon: fallback ? (0,_item_icons_js__WEBPACK_IMPORTED_MODULE_1__.getItemIconMarkup)(fallback) : '',
    };
  }

  getPickupLeadText() {
    return this.currentLanguage === 'en' ? 'Picked up' : '获得道具';
  }

  clearPickupNoticeForTeam(team) {
    const removed = this.pickupNoticeEntries.filter((entry) => entry.team === team);
    for (const entry of removed) {
      const timer = this.pickupNoticeTimers.get(entry.id);
      if (timer) {
        window.clearTimeout(timer);
        this.pickupNoticeTimers.delete(entry.id);
      }
    }
    this.pickupNoticeEntries = this.pickupNoticeEntries.filter((entry) => entry.team !== team);
  }

  clearPickupNotices() {
    for (const timer of this.pickupNoticeTimers.values()) {
      window.clearTimeout(timer);
    }
    this.pickupNoticeTimers.clear();
    this.pickupNoticeEntries = [];
    this.renderPickupNotices();
  }

  removePickupNotice(id) {
    const timer = this.pickupNoticeTimers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.pickupNoticeTimers.delete(id);
    }
    this.pickupNoticeEntries = this.pickupNoticeEntries.filter((entry) => entry.id !== id);
    this.renderPickupNotices();
  }

  renderPickupNotices() {
    for (const team of ['blue', 'red']) {
      const stack = this.pickupNoticeStacks[team];
      if (!stack) continue;
      const teamName = TRANSLATIONS[this.currentLanguage].teams[team] || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].text;
      const lead = this.getPickupLeadText();
      stack.innerHTML = this.pickupNoticeEntries
        .filter((entry) => entry.team === team)
        .map((entry) => {
          const itemText = this.getItemText(entry.itemId);
          return `
            <article class="pickup-notice-card ${team}" style="--pickup-accent:${entry.accent}">
              <div class="pickup-notice-icon" aria-hidden="true">${itemText.icon}</div>
              <div class="pickup-notice-copy">
                <div class="pickup-notice-kicker">${teamName} · ${lead}</div>
                <div class="pickup-notice-name">${itemText.name}</div>
                <div class="pickup-notice-desc">${itemText.description}</div>
              </div>
            </article>
          `;
        })
        .join('');
    }
  }

  showPickupNotice(team, itemType) {
    if (!team || !itemType?.id) return;
    this.clearPickupNoticeForTeam(team);
    const entry = {
      id: `pickup-${this.pickupNoticeSeq += 1}`,
      team,
      itemId: itemType.id,
      accent: itemType.accent,
    };
    this.pickupNoticeEntries.push(entry);
    this.renderPickupNotices();
    const timer = window.setTimeout(() => this.removePickupNotice(entry.id), 2200);
    this.pickupNoticeTimers.set(entry.id, timer);
  }

  updateHUD(snapshot) {
    if (!snapshot || this.currentMode !== 'local') return;
    for (const team of ['blue', 'red']) {
      const entry = snapshot[team];
      const refs = this.refs[team];
      if (!entry || !refs) continue;
      refs.bar.style.width = `${entry.healthRatio * 100}%`;
      refs.health.textContent = `${Math.ceil(entry.health)}/${entry.maxHealth}`;
      refs.drones.textContent = `${entry.drones}/${entry.cap}`;
      refs.planets.textContent = this.currentLanguage === 'en'
        ? `${entry.planets} planets`
        : `${entry.planets}颗星球`;
      refs.buffs.innerHTML = entry.buffs.length
        ? entry.buffs.map((buff) => `<span class="buff-pill">${TRANSLATIONS[this.currentLanguage].buffs[buff.type] || buff.label}<small>${(0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.padTime)(buff.remaining)}</small></span>`).join('')
        : '';
    }

    this.hudState.textContent = TRANSLATIONS[this.currentLanguage][snapshot.stateKey] || snapshot.stateKey;
    this.hudTip.textContent = TRANSLATIONS[this.currentLanguage].neutralTip(snapshot.neutralPlanets, snapshot.itemCap);
  }

  updateOnlineHud(snapshot, playerSlotId) {
    if (!snapshot || !playerSlotId) return;

    const t = TRANSLATIONS[this.currentLanguage];
    const player = snapshot.ships.find((ship) => ship.slotId === playerSlotId);
    if (!player) return;

    const hudSignature = [
      snapshot.roomId,
      snapshot.playerCount,
      player.badge,
      player.name,
      Math.round(player.health),
      Math.round(player.energy),
      Math.round(player.resources),
      player.planets,
      player.eliminations,
      ...snapshot.leaderboard.map((entry) => `${entry.slotId}:${entry.isBot ? 'b' : 'p'}:${entry.planets}:${entry.resources}:${entry.eliminations}`),
    ].join('|');

    if (hudSignature === this.lastOnlineHudSignature) {
      return;
    }
    this.lastOnlineHudSignature = hudSignature;

    this.onlineRefs.badge.textContent = player.badge;
    this.onlineRefs.badge.style.setProperty('--online-accent', player.theme.primary);
    this.onlineRefs.name.textContent = player.name;
    this.onlineRefs.room.textContent = `${snapshot.roomId} · ${snapshot.playerCount}/${snapshot.capacity}`;
    this.onlineRefs.healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.onlineRefs.energyBar.style.width = `${(player.energy / player.maxEnergy) * 100}%`;
    this.onlineRefs.resourceText.textContent = `${t.resourceLabel} ${Math.round(player.resources)}`;
    this.onlineRefs.planetText.textContent = `${t.planetLabel} ${player.planets}`;
    this.onlineRefs.killText.textContent = `${t.elimLabel} ${player.eliminations}`;

    this.onlineRefs.mobileRoom.textContent = snapshot.roomId;
    this.onlineRefs.mobileSeat.textContent = player.badge;
    this.onlineRefs.mobileHealthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.onlineRefs.mobileEnergyBar.style.width = `${(player.energy / player.maxEnergy) * 100}%`;
    this.onlineRefs.mobileResourceText.textContent = `${t.resourceLabel[0] || 'R'} ${Math.round(player.resources)}`;
    this.onlineRefs.mobilePlanetText.textContent = `${t.planetLabel[0] || 'P'} ${player.planets}`;
    this.onlineRefs.mobileKillText.textContent = `${t.elimLabel[0] || 'K'} ${player.eliminations}`;

    this.onlineRefs.roster.innerHTML = snapshot.leaderboard.map((entry) => `
      <article class="online-roster-item ${entry.slotId === playerSlotId ? 'is-self' : ''}" style="--online-accent:${entry.theme.primary}">
        <div class="online-roster-head">
          <span class="online-roster-badge">${entry.badge}</span>
          <div class="online-roster-copy">
            <strong>${entry.name}</strong>
            <small>${entry.isBot ? 'BOT' : 'PLAYER'}</small>
          </div>
        </div>
        <div class="online-roster-stats">
          <span>${t.planetLabel} ${entry.planets}</span>
          <span>${t.resourceLabel} ${entry.resources}</span>
          <span>${t.elimLabel} ${entry.eliminations}</span>
        </div>
      </article>
    `).join('');
  }
}


/***/ },

/***/ "./js/utils.js"
/*!*********************!*\
  !*** ./js/utils.js ***!
  \*********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vector2: () => (/* binding */ Vector2),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   distance: () => (/* binding */ distance),
/* harmony export */   lerp: () => (/* binding */ lerp),
/* harmony export */   padTime: () => (/* binding */ padTime),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   rand: () => (/* binding */ rand)
/* harmony export */ });
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  limit(max) {
    const lenSq = this.lengthSq();
    if (lenSq > max * max) {
      this.normalize().scale(max);
    }
    return this;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle, length = 1) {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getPoint(entity) {
  if (entity && typeof entity.x === 'number' && typeof entity.y === 'number') {
    return entity;
  }
  if (entity && entity.pos && typeof entity.pos.x === 'number' && typeof entity.pos.y === 'number') {
    return entity.pos;
  }
  return { x: 0, y: 0 };
}

function distance(a, b) {
  const pointA = getPoint(a);
  const pointB = getPoint(b);
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

function padTime(frames) {
  return (frames / 60).toFixed(1) + 's';
}


/***/ },

/***/ "./node_modules/@socket.io/component-emitter/lib/esm/index.js"
/*!********************************************************************!*\
  !*** ./node_modules/@socket.io/component-emitter/lib/esm/index.js ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Emitter: () => (/* binding */ Emitter)
/* harmony export */ });
/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

// alias used for reserved events (protected method)
Emitter.prototype.emitReserved = Emitter.prototype.emit;

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/contrib/has-cors.js"
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/has-cors.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasCORS: () => (/* binding */ hasCORS)
/* harmony export */ });
// imported from https://github.com/component/has-cors
let value = false;
try {
    value = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
}
catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
}
const hasCORS = value;


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js"
/*!********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/parseqs.js ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decode: () => (/* binding */ decode),
/* harmony export */   encode: () => (/* binding */ encode)
/* harmony export */ });
// imported from https://github.com/galkn/querystring
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */
function encode(obj) {
    let str = '';
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (str.length)
                str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
    }
    return str;
}
/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */
function decode(qs) {
    let qry = {};
    let pairs = qs.split('&');
    for (let i = 0, l = pairs.length; i < l; i++) {
        let pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js"
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/contrib/parseuri.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse)
/* harmony export */ });
// imported from https://github.com/galkn/parseuri
/**
 * Parses a URI
 *
 * Note: we could also have used the built-in URL object, but it isn't supported on all platforms.
 *
 * See:
 * - https://developer.mozilla.org/en-US/docs/Web/API/URL
 * - https://caniuse.com/url
 * - https://www.rfc-editor.org/rfc/rfc3986#appendix-B
 *
 * History of the parse() method:
 * - first commit: https://github.com/socketio/socket.io-client/commit/4ee1d5d94b3906a9c052b459f1a818b15f38f91c
 * - export into its own module: https://github.com/socketio/engine.io-client/commit/de2c561e4564efeb78f1bdb1ba39ef81b2822cb3
 * - reimport: https://github.com/socketio/engine.io-client/commit/df32277c3f6d622eec5ed09f493cae3f3391d242
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */
const re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
const parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];
function parse(str) {
    if (str.length > 8000) {
        throw "URI too long";
    }
    const src = str, b = str.indexOf('['), e = str.indexOf(']');
    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }
    let m = re.exec(str || ''), uri = {}, i = 14;
    while (i--) {
        uri[parts[i]] = m[i] || '';
    }
    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri['path']);
    uri.queryKey = queryKey(uri, uri['query']);
    return uri;
}
function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == '/' || path.length === 0) {
        names.splice(0, 1);
    }
    if (path.slice(-1) == '/') {
        names.splice(names.length - 1, 1);
    }
    return names;
}
function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
        if ($1) {
            data[$1] = $2;
        }
    });
    return data;
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/globals.js"
/*!************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/globals.js ***!
  \************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCookieJar: () => (/* binding */ createCookieJar),
/* harmony export */   defaultBinaryType: () => (/* binding */ defaultBinaryType),
/* harmony export */   globalThisShim: () => (/* binding */ globalThisShim),
/* harmony export */   nextTick: () => (/* binding */ nextTick)
/* harmony export */ });
const nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
        return (cb) => Promise.resolve().then(cb);
    }
    else {
        return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
})();
const globalThisShim = (() => {
    if (typeof self !== "undefined") {
        return self;
    }
    else if (typeof window !== "undefined") {
        return window;
    }
    else {
        return Function("return this")();
    }
})();
const defaultBinaryType = "arraybuffer";
function createCookieJar() { }


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/index.js"
/*!**********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/index.js ***!
  \**********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fetch: () => (/* reexport safe */ _transports_polling_fetch_js__WEBPACK_IMPORTED_MODULE_6__.Fetch),
/* harmony export */   NodeWebSocket: () => (/* reexport safe */ _transports_websocket_node_js__WEBPACK_IMPORTED_MODULE_8__.WS),
/* harmony export */   NodeXHR: () => (/* reexport safe */ _transports_polling_xhr_node_js__WEBPACK_IMPORTED_MODULE_7__.XHR),
/* harmony export */   Socket: () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_0__.Socket),
/* harmony export */   SocketWithUpgrade: () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_0__.SocketWithUpgrade),
/* harmony export */   SocketWithoutUpgrade: () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_0__.SocketWithoutUpgrade),
/* harmony export */   Transport: () => (/* reexport safe */ _transport_js__WEBPACK_IMPORTED_MODULE_1__.Transport),
/* harmony export */   TransportError: () => (/* reexport safe */ _transport_js__WEBPACK_IMPORTED_MODULE_1__.TransportError),
/* harmony export */   WebSocket: () => (/* reexport safe */ _transports_websocket_node_js__WEBPACK_IMPORTED_MODULE_8__.WS),
/* harmony export */   WebTransport: () => (/* reexport safe */ _transports_webtransport_js__WEBPACK_IMPORTED_MODULE_9__.WT),
/* harmony export */   XHR: () => (/* reexport safe */ _transports_polling_xhr_node_js__WEBPACK_IMPORTED_MODULE_7__.XHR),
/* harmony export */   installTimerFunctions: () => (/* reexport safe */ _util_js__WEBPACK_IMPORTED_MODULE_3__.installTimerFunctions),
/* harmony export */   nextTick: () => (/* reexport safe */ _globals_node_js__WEBPACK_IMPORTED_MODULE_5__.nextTick),
/* harmony export */   parse: () => (/* reexport safe */ _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_4__.parse),
/* harmony export */   protocol: () => (/* binding */ protocol),
/* harmony export */   transports: () => (/* reexport safe */ _transports_index_js__WEBPACK_IMPORTED_MODULE_2__.transports)
/* harmony export */ });
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./socket.js */ "./node_modules/engine.io-client/build/esm/socket.js");
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _transports_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transports/index.js */ "./node_modules/engine.io-client/build/esm/transports/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./contrib/parseuri.js */ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js");
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");
/* harmony import */ var _transports_polling_fetch_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./transports/polling-fetch.js */ "./node_modules/engine.io-client/build/esm/transports/polling-fetch.js");
/* harmony import */ var _transports_polling_xhr_node_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./transports/polling-xhr.js */ "./node_modules/engine.io-client/build/esm/transports/polling-xhr.js");
/* harmony import */ var _transports_websocket_node_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./transports/websocket.js */ "./node_modules/engine.io-client/build/esm/transports/websocket.js");
/* harmony import */ var _transports_webtransport_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./transports/webtransport.js */ "./node_modules/engine.io-client/build/esm/transports/webtransport.js");



const protocol = _socket_js__WEBPACK_IMPORTED_MODULE_0__.Socket.protocol;













/***/ },

/***/ "./node_modules/engine.io-client/build/esm/socket.js"
/*!***********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/socket.js ***!
  \***********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Socket: () => (/* binding */ Socket),
/* harmony export */   SocketWithUpgrade: () => (/* binding */ SocketWithUpgrade),
/* harmony export */   SocketWithoutUpgrade: () => (/* binding */ SocketWithoutUpgrade)
/* harmony export */ });
/* harmony import */ var _transports_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transports/index.js */ "./node_modules/engine.io-client/build/esm/transports/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contrib/parseqs.js */ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js");
/* harmony import */ var _contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contrib/parseuri.js */ "./node_modules/engine.io-client/build/esm/contrib/parseuri.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");







const withEventListeners = typeof addEventListener === "function" &&
    typeof removeEventListener === "function";
const OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) {
    // within a ServiceWorker, any event handler for the 'offline' event must be added on the initial evaluation of the
    // script, so we create one single event listener here which will forward the event to the socket instances
    addEventListener("offline", () => {
        OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
    }, false);
}
/**
 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
 *
 * This class comes without upgrade mechanism, which means that it will keep the first low-level transport that
 * successfully establishes the connection.
 *
 * In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
 *
 * @example
 * import { SocketWithoutUpgrade, WebSocket } from "engine.io-client";
 *
 * const socket = new SocketWithoutUpgrade({
 *   transports: [WebSocket]
 * });
 *
 * socket.on("open", () => {
 *   socket.send("hello");
 * });
 *
 * @see SocketWithUpgrade
 * @see Socket
 */
class SocketWithoutUpgrade extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_4__.Emitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri - uri or options
     * @param {Object} opts - options
     */
    constructor(uri, opts) {
        super();
        this.binaryType = _globals_node_js__WEBPACK_IMPORTED_MODULE_6__.defaultBinaryType;
        this.writeBuffer = [];
        this._prevBufferLen = 0;
        this._pingInterval = -1;
        this._pingTimeout = -1;
        this._maxPayload = -1;
        /**
         * The expiration timestamp of the {@link _pingTimeoutTimer} object is tracked, in case the timer is throttled and the
         * callback is not fired on time. This can happen for example when a laptop is suspended or when a phone is locked.
         */
        this._pingTimeoutTime = Infinity;
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = null;
        }
        if (uri) {
            const parsedUri = (0,_contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__.parse)(uri);
            opts.hostname = parsedUri.host;
            opts.secure =
                parsedUri.protocol === "https" || parsedUri.protocol === "wss";
            opts.port = parsedUri.port;
            if (parsedUri.query)
                opts.query = parsedUri.query;
        }
        else if (opts.host) {
            opts.hostname = (0,_contrib_parseuri_js__WEBPACK_IMPORTED_MODULE_3__.parse)(opts.host).host;
        }
        (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.installTimerFunctions)(this, opts);
        this.secure =
            null != opts.secure
                ? opts.secure
                : typeof location !== "undefined" && "https:" === location.protocol;
        if (opts.hostname && !opts.port) {
            // if no port is specified manually, use the protocol default
            opts.port = this.secure ? "443" : "80";
        }
        this.hostname =
            opts.hostname ||
                (typeof location !== "undefined" ? location.hostname : "localhost");
        this.port =
            opts.port ||
                (typeof location !== "undefined" && location.port
                    ? location.port
                    : this.secure
                        ? "443"
                        : "80");
        this.transports = [];
        this._transportsByName = {};
        opts.transports.forEach((t) => {
            const transportName = t.prototype.name;
            this.transports.push(transportName);
            this._transportsByName[transportName] = t;
        });
        this.opts = Object.assign({
            path: "/engine.io",
            agent: false,
            withCredentials: false,
            upgrade: true,
            timestampParam: "t",
            rememberUpgrade: false,
            addTrailingSlash: true,
            rejectUnauthorized: true,
            perMessageDeflate: {
                threshold: 1024,
            },
            transportOptions: {},
            closeOnBeforeunload: false,
        }, opts);
        this.opts.path =
            this.opts.path.replace(/\/$/, "") +
                (this.opts.addTrailingSlash ? "/" : "");
        if (typeof this.opts.query === "string") {
            this.opts.query = (0,_contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_2__.decode)(this.opts.query);
        }
        if (withEventListeners) {
            if (this.opts.closeOnBeforeunload) {
                // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                // closed/reloaded)
                this._beforeunloadEventListener = () => {
                    if (this.transport) {
                        // silently close the transport
                        this.transport.removeAllListeners();
                        this.transport.close();
                    }
                };
                addEventListener("beforeunload", this._beforeunloadEventListener, false);
            }
            if (this.hostname !== "localhost") {
                this._offlineEventListener = () => {
                    this._onClose("transport close", {
                        description: "network connection lost",
                    });
                };
                OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
            }
        }
        if (this.opts.withCredentials) {
            this._cookieJar = (0,_globals_node_js__WEBPACK_IMPORTED_MODULE_6__.createCookieJar)();
        }
        this._open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} name - transport name
     * @return {Transport}
     * @private
     */
    createTransport(name) {
        const query = Object.assign({}, this.opts.query);
        // append engine.io protocol identifier
        query.EIO = engine_io_parser__WEBPACK_IMPORTED_MODULE_5__.protocol;
        // transport name
        query.transport = name;
        // session id if we already have one
        if (this.id)
            query.sid = this.id;
        const opts = Object.assign({}, this.opts, {
            query,
            socket: this,
            hostname: this.hostname,
            secure: this.secure,
            port: this.port,
        }, this.opts.transportOptions[name]);
        return new this._transportsByName[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @private
     */
    _open() {
        if (this.transports.length === 0) {
            // Emit error on next tick so it can be listened to
            this.setTimeoutFn(() => {
                this.emitReserved("error", "No transports available");
            }, 0);
            return;
        }
        const transportName = this.opts.rememberUpgrade &&
            SocketWithoutUpgrade.priorWebsocketSuccess &&
            this.transports.indexOf("websocket") !== -1
            ? "websocket"
            : this.transports[0];
        this.readyState = "opening";
        const transport = this.createTransport(transportName);
        transport.open();
        this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @private
     */
    setTransport(transport) {
        if (this.transport) {
            this.transport.removeAllListeners();
        }
        // set up transport
        this.transport = transport;
        // set up transport listeners
        transport
            .on("drain", this._onDrain.bind(this))
            .on("packet", this._onPacket.bind(this))
            .on("error", this._onError.bind(this))
            .on("close", (reason) => this._onClose("transport close", reason));
    }
    /**
     * Called when connection is deemed open.
     *
     * @private
     */
    onOpen() {
        this.readyState = "open";
        SocketWithoutUpgrade.priorWebsocketSuccess =
            "websocket" === this.transport.name;
        this.emitReserved("open");
        this.flush();
    }
    /**
     * Handles a packet.
     *
     * @private
     */
    _onPacket(packet) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            this.emitReserved("packet", packet);
            // Socket is live - any packet counts
            this.emitReserved("heartbeat");
            switch (packet.type) {
                case "open":
                    this.onHandshake(JSON.parse(packet.data));
                    break;
                case "ping":
                    this._sendPacket("pong");
                    this.emitReserved("ping");
                    this.emitReserved("pong");
                    this._resetPingTimeout();
                    break;
                case "error":
                    const err = new Error("server error");
                    // @ts-ignore
                    err.code = packet.data;
                    this._onError(err);
                    break;
                case "message":
                    this.emitReserved("data", packet.data);
                    this.emitReserved("message", packet.data);
                    break;
            }
        }
        else {
        }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @private
     */
    onHandshake(data) {
        this.emitReserved("handshake", data);
        this.id = data.sid;
        this.transport.query.sid = data.sid;
        this._pingInterval = data.pingInterval;
        this._pingTimeout = data.pingTimeout;
        this._maxPayload = data.maxPayload;
        this.onOpen();
        // In case open handler closes socket
        if ("closed" === this.readyState)
            return;
        this._resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @private
     */
    _resetPingTimeout() {
        this.clearTimeoutFn(this._pingTimeoutTimer);
        const delay = this._pingInterval + this._pingTimeout;
        this._pingTimeoutTime = Date.now() + delay;
        this._pingTimeoutTimer = this.setTimeoutFn(() => {
            this._onClose("ping timeout");
        }, delay);
        if (this.opts.autoUnref) {
            this._pingTimeoutTimer.unref();
        }
    }
    /**
     * Called on `drain` event
     *
     * @private
     */
    _onDrain() {
        this.writeBuffer.splice(0, this._prevBufferLen);
        // setting prevBufferLen = 0 is very important
        // for example, when upgrading, upgrade packet is sent over,
        // and a nonzero prevBufferLen could cause problems on `drain`
        this._prevBufferLen = 0;
        if (0 === this.writeBuffer.length) {
            this.emitReserved("drain");
        }
        else {
            this.flush();
        }
    }
    /**
     * Flush write buffers.
     *
     * @private
     */
    flush() {
        if ("closed" !== this.readyState &&
            this.transport.writable &&
            !this.upgrading &&
            this.writeBuffer.length) {
            const packets = this._getWritablePackets();
            this.transport.send(packets);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this._prevBufferLen = packets.length;
            this.emitReserved("flush");
        }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */
    _getWritablePackets() {
        const shouldCheckPayloadSize = this._maxPayload &&
            this.transport.name === "polling" &&
            this.writeBuffer.length > 1;
        if (!shouldCheckPayloadSize) {
            return this.writeBuffer;
        }
        let payloadSize = 1; // first packet type
        for (let i = 0; i < this.writeBuffer.length; i++) {
            const data = this.writeBuffer[i].data;
            if (data) {
                payloadSize += (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.byteLength)(data);
            }
            if (i > 0 && payloadSize > this._maxPayload) {
                return this.writeBuffer.slice(0, i);
            }
            payloadSize += 2; // separator + packet type
        }
        return this.writeBuffer;
    }
    /**
     * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
     *
     * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
     * `write()` method then the message would not be buffered by the Socket.IO client.
     *
     * @return {boolean}
     * @private
     */
    /* private */ _hasPingExpired() {
        if (!this._pingTimeoutTime)
            return true;
        const hasExpired = Date.now() > this._pingTimeoutTime;
        if (hasExpired) {
            this._pingTimeoutTime = 0;
            (0,_globals_node_js__WEBPACK_IMPORTED_MODULE_6__.nextTick)(() => {
                this._onClose("ping timeout");
            }, this.setTimeoutFn);
        }
        return hasExpired;
    }
    /**
     * Sends a message.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    write(msg, options, fn) {
        this._sendPacket("message", msg, options, fn);
        return this;
    }
    /**
     * Sends a message. Alias of {@link Socket#write}.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    send(msg, options, fn) {
        this._sendPacket("message", msg, options, fn);
        return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} type: packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @private
     */
    _sendPacket(type, data, options, fn) {
        if ("function" === typeof data) {
            fn = data;
            data = undefined;
        }
        if ("function" === typeof options) {
            fn = options;
            options = null;
        }
        if ("closing" === this.readyState || "closed" === this.readyState) {
            return;
        }
        options = options || {};
        options.compress = false !== options.compress;
        const packet = {
            type: type,
            data: data,
            options: options,
        };
        this.emitReserved("packetCreate", packet);
        this.writeBuffer.push(packet);
        if (fn)
            this.once("flush", fn);
        this.flush();
    }
    /**
     * Closes the connection.
     */
    close() {
        const close = () => {
            this._onClose("forced close");
            this.transport.close();
        };
        const cleanupAndClose = () => {
            this.off("upgrade", cleanupAndClose);
            this.off("upgradeError", cleanupAndClose);
            close();
        };
        const waitForUpgrade = () => {
            // wait for upgrade to finish since we can't send packets while pausing a transport
            this.once("upgrade", cleanupAndClose);
            this.once("upgradeError", cleanupAndClose);
        };
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.readyState = "closing";
            if (this.writeBuffer.length) {
                this.once("drain", () => {
                    if (this.upgrading) {
                        waitForUpgrade();
                    }
                    else {
                        close();
                    }
                });
            }
            else if (this.upgrading) {
                waitForUpgrade();
            }
            else {
                close();
            }
        }
        return this;
    }
    /**
     * Called upon transport error
     *
     * @private
     */
    _onError(err) {
        SocketWithoutUpgrade.priorWebsocketSuccess = false;
        if (this.opts.tryAllTransports &&
            this.transports.length > 1 &&
            this.readyState === "opening") {
            this.transports.shift();
            return this._open();
        }
        this.emitReserved("error", err);
        this._onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @private
     */
    _onClose(reason, description) {
        if ("opening" === this.readyState ||
            "open" === this.readyState ||
            "closing" === this.readyState) {
            // clear timers
            this.clearTimeoutFn(this._pingTimeoutTimer);
            // stop event from firing again for transport
            this.transport.removeAllListeners("close");
            // ensure transport won't stay open
            this.transport.close();
            // ignore further transport communication
            this.transport.removeAllListeners();
            if (withEventListeners) {
                if (this._beforeunloadEventListener) {
                    removeEventListener("beforeunload", this._beforeunloadEventListener, false);
                }
                if (this._offlineEventListener) {
                    const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
                    if (i !== -1) {
                        OFFLINE_EVENT_LISTENERS.splice(i, 1);
                    }
                }
            }
            // set ready state
            this.readyState = "closed";
            // clear session id
            this.id = null;
            // emit close event
            this.emitReserved("close", reason, description);
            // clean buffers after, so users can still
            // grab the buffers on `close` event
            this.writeBuffer = [];
            this._prevBufferLen = 0;
        }
    }
}
SocketWithoutUpgrade.protocol = engine_io_parser__WEBPACK_IMPORTED_MODULE_5__.protocol;
/**
 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
 *
 * This class comes with an upgrade mechanism, which means that once the connection is established with the first
 * low-level transport, it will try to upgrade to a better transport.
 *
 * In order to allow tree-shaking, there are no transports included, that's why the `transports` option is mandatory.
 *
 * @example
 * import { SocketWithUpgrade, WebSocket } from "engine.io-client";
 *
 * const socket = new SocketWithUpgrade({
 *   transports: [WebSocket]
 * });
 *
 * socket.on("open", () => {
 *   socket.send("hello");
 * });
 *
 * @see SocketWithoutUpgrade
 * @see Socket
 */
class SocketWithUpgrade extends SocketWithoutUpgrade {
    constructor() {
        super(...arguments);
        this._upgrades = [];
    }
    onOpen() {
        super.onOpen();
        if ("open" === this.readyState && this.opts.upgrade) {
            for (let i = 0; i < this._upgrades.length; i++) {
                this._probe(this._upgrades[i]);
            }
        }
    }
    /**
     * Probes a transport.
     *
     * @param {String} name - transport name
     * @private
     */
    _probe(name) {
        let transport = this.createTransport(name);
        let failed = false;
        SocketWithoutUpgrade.priorWebsocketSuccess = false;
        const onTransportOpen = () => {
            if (failed)
                return;
            transport.send([{ type: "ping", data: "probe" }]);
            transport.once("packet", (msg) => {
                if (failed)
                    return;
                if ("pong" === msg.type && "probe" === msg.data) {
                    this.upgrading = true;
                    this.emitReserved("upgrading", transport);
                    if (!transport)
                        return;
                    SocketWithoutUpgrade.priorWebsocketSuccess =
                        "websocket" === transport.name;
                    this.transport.pause(() => {
                        if (failed)
                            return;
                        if ("closed" === this.readyState)
                            return;
                        cleanup();
                        this.setTransport(transport);
                        transport.send([{ type: "upgrade" }]);
                        this.emitReserved("upgrade", transport);
                        transport = null;
                        this.upgrading = false;
                        this.flush();
                    });
                }
                else {
                    const err = new Error("probe error");
                    // @ts-ignore
                    err.transport = transport.name;
                    this.emitReserved("upgradeError", err);
                }
            });
        };
        function freezeTransport() {
            if (failed)
                return;
            // Any callback called by transport should be ignored since now
            failed = true;
            cleanup();
            transport.close();
            transport = null;
        }
        // Handle any error that happens while probing
        const onerror = (err) => {
            const error = new Error("probe error: " + err);
            // @ts-ignore
            error.transport = transport.name;
            freezeTransport();
            this.emitReserved("upgradeError", error);
        };
        function onTransportClose() {
            onerror("transport closed");
        }
        // When the socket is closed while we're probing
        function onclose() {
            onerror("socket closed");
        }
        // When the socket is upgraded while we're probing
        function onupgrade(to) {
            if (transport && to.name !== transport.name) {
                freezeTransport();
            }
        }
        // Remove all listeners on the transport and on self
        const cleanup = () => {
            transport.removeListener("open", onTransportOpen);
            transport.removeListener("error", onerror);
            transport.removeListener("close", onTransportClose);
            this.off("close", onclose);
            this.off("upgrading", onupgrade);
        };
        transport.once("open", onTransportOpen);
        transport.once("error", onerror);
        transport.once("close", onTransportClose);
        this.once("close", onclose);
        this.once("upgrading", onupgrade);
        if (this._upgrades.indexOf("webtransport") !== -1 &&
            name !== "webtransport") {
            // favor WebTransport
            this.setTimeoutFn(() => {
                if (!failed) {
                    transport.open();
                }
            }, 200);
        }
        else {
            transport.open();
        }
    }
    onHandshake(data) {
        this._upgrades = this._filterUpgrades(data.upgrades);
        super.onHandshake(data);
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} upgrades - server upgrades
     * @private
     */
    _filterUpgrades(upgrades) {
        const filteredUpgrades = [];
        for (let i = 0; i < upgrades.length; i++) {
            if (~this.transports.indexOf(upgrades[i]))
                filteredUpgrades.push(upgrades[i]);
        }
        return filteredUpgrades;
    }
}
/**
 * This class provides a WebSocket-like interface to connect to an Engine.IO server. The connection will be established
 * with one of the available low-level transports, like HTTP long-polling, WebSocket or WebTransport.
 *
 * This class comes with an upgrade mechanism, which means that once the connection is established with the first
 * low-level transport, it will try to upgrade to a better transport.
 *
 * @example
 * import { Socket } from "engine.io-client";
 *
 * const socket = new Socket();
 *
 * socket.on("open", () => {
 *   socket.send("hello");
 * });
 *
 * @see SocketWithoutUpgrade
 * @see SocketWithUpgrade
 */
class Socket extends SocketWithUpgrade {
    constructor(uri, opts = {}) {
        const o = typeof uri === "object" ? uri : opts;
        if (!o.transports ||
            (o.transports && typeof o.transports[0] === "string")) {
            o.transports = (o.transports || ["polling", "websocket", "webtransport"])
                .map((transportName) => _transports_index_js__WEBPACK_IMPORTED_MODULE_0__.transports[transportName])
                .filter((t) => !!t);
        }
        super(uri, o);
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transport.js"
/*!**************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transport.js ***!
  \**************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Transport: () => (/* binding */ Transport),
/* harmony export */   TransportError: () => (/* binding */ TransportError)
/* harmony export */ });
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contrib/parseqs.js */ "./node_modules/engine.io-client/build/esm/contrib/parseqs.js");




class TransportError extends Error {
    constructor(reason, description, context) {
        super(reason);
        this.description = description;
        this.context = context;
        this.type = "TransportError";
    }
}
class Transport extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__.Emitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} opts - options
     * @protected
     */
    constructor(opts) {
        super();
        this.writable = false;
        (0,_util_js__WEBPACK_IMPORTED_MODULE_2__.installTimerFunctions)(this, opts);
        this.opts = opts;
        this.query = opts.query;
        this.socket = opts.socket;
        this.supportsBinary = !opts.forceBase64;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @protected
     */
    onError(reason, description, context) {
        super.emitReserved("error", new TransportError(reason, description, context));
        return this;
    }
    /**
     * Opens the transport.
     */
    open() {
        this.readyState = "opening";
        this.doOpen();
        return this;
    }
    /**
     * Closes the transport.
     */
    close() {
        if (this.readyState === "opening" || this.readyState === "open") {
            this.doClose();
            this.onClose();
        }
        return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     */
    send(packets) {
        if (this.readyState === "open") {
            this.write(packets);
        }
        else {
            // this might happen if the transport was silently closed in the beforeunload event handler
        }
    }
    /**
     * Called upon open
     *
     * @protected
     */
    onOpen() {
        this.readyState = "open";
        this.writable = true;
        super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @protected
     */
    onData(data) {
        const packet = (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_0__.decodePacket)(data, this.socket.binaryType);
        this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @protected
     */
    onPacket(packet) {
        super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @protected
     */
    onClose(details) {
        this.readyState = "closed";
        super.emitReserved("close", details);
    }
    /**
     * Pauses the transport, in order not to lose packets during an upgrade.
     *
     * @param onPause
     */
    pause(onPause) { }
    createUri(schema, query = {}) {
        return (schema +
            "://" +
            this._hostname() +
            this._port() +
            this.opts.path +
            this._query(query));
    }
    _hostname() {
        const hostname = this.opts.hostname;
        return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
    }
    _port() {
        if (this.opts.port &&
            ((this.opts.secure && Number(this.opts.port) !== 443) ||
                (!this.opts.secure && Number(this.opts.port) !== 80))) {
            return ":" + this.opts.port;
        }
        else {
            return "";
        }
    }
    _query(query) {
        const encodedQuery = (0,_contrib_parseqs_js__WEBPACK_IMPORTED_MODULE_3__.encode)(query);
        return encodedQuery.length ? "?" + encodedQuery : "";
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/index.js"
/*!*********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/index.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   transports: () => (/* binding */ transports)
/* harmony export */ });
/* harmony import */ var _polling_xhr_node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polling-xhr.node.js */ "./node_modules/engine.io-client/build/esm/transports/polling-xhr.js");
/* harmony import */ var _websocket_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./websocket.node.js */ "./node_modules/engine.io-client/build/esm/transports/websocket.js");
/* harmony import */ var _webtransport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./webtransport.js */ "./node_modules/engine.io-client/build/esm/transports/webtransport.js");



const transports = {
    websocket: _websocket_node_js__WEBPACK_IMPORTED_MODULE_1__.WS,
    webtransport: _webtransport_js__WEBPACK_IMPORTED_MODULE_2__.WT,
    polling: _polling_xhr_node_js__WEBPACK_IMPORTED_MODULE_0__.XHR,
};


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/polling-fetch.js"
/*!*****************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/polling-fetch.js ***!
  \*****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fetch: () => (/* binding */ Fetch)
/* harmony export */ });
/* harmony import */ var _polling_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polling.js */ "./node_modules/engine.io-client/build/esm/transports/polling.js");

/**
 * HTTP long-polling based on the built-in `fetch()` method.
 *
 * Usage: browser, Node.js (since v18), Deno, Bun
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @see https://caniuse.com/fetch
 * @see https://nodejs.org/api/globals.html#fetch
 */
class Fetch extends _polling_js__WEBPACK_IMPORTED_MODULE_0__.Polling {
    doPoll() {
        this._fetch()
            .then((res) => {
            if (!res.ok) {
                return this.onError("fetch read error", res.status, res);
            }
            res.text().then((data) => this.onData(data));
        })
            .catch((err) => {
            this.onError("fetch read error", err);
        });
    }
    doWrite(data, callback) {
        this._fetch(data)
            .then((res) => {
            if (!res.ok) {
                return this.onError("fetch write error", res.status, res);
            }
            callback();
        })
            .catch((err) => {
            this.onError("fetch write error", err);
        });
    }
    _fetch(data) {
        var _a;
        const isPost = data !== undefined;
        const headers = new Headers(this.opts.extraHeaders);
        if (isPost) {
            headers.set("content-type", "text/plain;charset=UTF-8");
        }
        (_a = this.socket._cookieJar) === null || _a === void 0 ? void 0 : _a.appendCookies(headers);
        return fetch(this.uri(), {
            method: isPost ? "POST" : "GET",
            body: isPost ? data : null,
            headers,
            credentials: this.opts.withCredentials ? "include" : "omit",
        }).then((res) => {
            var _a;
            // @ts-ignore getSetCookie() was added in Node.js v19.7.0
            (_a = this.socket._cookieJar) === null || _a === void 0 ? void 0 : _a.parseCookies(res.headers.getSetCookie());
            return res;
        });
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/polling-xhr.js"
/*!***************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/polling-xhr.js ***!
  \***************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseXHR: () => (/* binding */ BaseXHR),
/* harmony export */   Request: () => (/* binding */ Request),
/* harmony export */   XHR: () => (/* binding */ XHR)
/* harmony export */ });
/* harmony import */ var _polling_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polling.js */ "./node_modules/engine.io-client/build/esm/transports/polling.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");
/* harmony import */ var _contrib_has_cors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../contrib/has-cors.js */ "./node_modules/engine.io-client/build/esm/contrib/has-cors.js");





function empty() { }
class BaseXHR extends _polling_js__WEBPACK_IMPORTED_MODULE_0__.Polling {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @package
     */
    constructor(opts) {
        super(opts);
        if (typeof location !== "undefined") {
            const isSSL = "https:" === location.protocol;
            let port = location.port;
            // some user agents have empty `location.port`
            if (!port) {
                port = isSSL ? "443" : "80";
            }
            this.xd =
                (typeof location !== "undefined" &&
                    opts.hostname !== location.hostname) ||
                    port !== opts.port;
        }
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @private
     */
    doWrite(data, fn) {
        const req = this.request({
            method: "POST",
            data: data,
        });
        req.on("success", fn);
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr post error", xhrStatus, context);
        });
    }
    /**
     * Starts a poll cycle.
     *
     * @private
     */
    doPoll() {
        const req = this.request();
        req.on("data", this.onData.bind(this));
        req.on("error", (xhrStatus, context) => {
            this.onError("xhr poll error", xhrStatus, context);
        });
        this.pollXhr = req;
    }
}
class Request extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_1__.Emitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @package
     */
    constructor(createRequest, uri, opts) {
        super();
        this.createRequest = createRequest;
        (0,_util_js__WEBPACK_IMPORTED_MODULE_2__.installTimerFunctions)(this, opts);
        this._opts = opts;
        this._method = opts.method || "GET";
        this._uri = uri;
        this._data = undefined !== opts.data ? opts.data : null;
        this._create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @private
     */
    _create() {
        var _a;
        const opts = (0,_util_js__WEBPACK_IMPORTED_MODULE_2__.pick)(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        opts.xdomain = !!this._opts.xd;
        const xhr = (this._xhr = this.createRequest(opts));
        try {
            xhr.open(this._method, this._uri, true);
            try {
                if (this._opts.extraHeaders) {
                    // @ts-ignore
                    xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                    for (let i in this._opts.extraHeaders) {
                        if (this._opts.extraHeaders.hasOwnProperty(i)) {
                            xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
                        }
                    }
                }
            }
            catch (e) { }
            if ("POST" === this._method) {
                try {
                    xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                }
                catch (e) { }
            }
            try {
                xhr.setRequestHeader("Accept", "*/*");
            }
            catch (e) { }
            (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
            // ie6 check
            if ("withCredentials" in xhr) {
                xhr.withCredentials = this._opts.withCredentials;
            }
            if (this._opts.requestTimeout) {
                xhr.timeout = this._opts.requestTimeout;
            }
            xhr.onreadystatechange = () => {
                var _a;
                if (xhr.readyState === 3) {
                    (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.parseCookies(
                    // @ts-ignore
                    xhr.getResponseHeader("set-cookie"));
                }
                if (4 !== xhr.readyState)
                    return;
                if (200 === xhr.status || 1223 === xhr.status) {
                    this._onLoad();
                }
                else {
                    // make sure the `error` event handler that's user-set
                    // does not throw in the same tick and gets caught here
                    this.setTimeoutFn(() => {
                        this._onError(typeof xhr.status === "number" ? xhr.status : 0);
                    }, 0);
                }
            };
            xhr.send(this._data);
        }
        catch (e) {
            // Need to defer since .create() is called directly from the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            this.setTimeoutFn(() => {
                this._onError(e);
            }, 0);
            return;
        }
        if (typeof document !== "undefined") {
            this._index = Request.requestsCount++;
            Request.requests[this._index] = this;
        }
    }
    /**
     * Called upon error.
     *
     * @private
     */
    _onError(err) {
        this.emitReserved("error", err, this._xhr);
        this._cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @private
     */
    _cleanup(fromError) {
        if ("undefined" === typeof this._xhr || null === this._xhr) {
            return;
        }
        this._xhr.onreadystatechange = empty;
        if (fromError) {
            try {
                this._xhr.abort();
            }
            catch (e) { }
        }
        if (typeof document !== "undefined") {
            delete Request.requests[this._index];
        }
        this._xhr = null;
    }
    /**
     * Called upon load.
     *
     * @private
     */
    _onLoad() {
        const data = this._xhr.responseText;
        if (data !== null) {
            this.emitReserved("data", data);
            this.emitReserved("success");
            this._cleanup();
        }
    }
    /**
     * Aborts the request.
     *
     * @package
     */
    abort() {
        this._cleanup();
    }
}
Request.requestsCount = 0;
Request.requests = {};
/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */
if (typeof document !== "undefined") {
    // @ts-ignore
    if (typeof attachEvent === "function") {
        // @ts-ignore
        attachEvent("onunload", unloadHandler);
    }
    else if (typeof addEventListener === "function") {
        const terminationEvent = "onpagehide" in _globals_node_js__WEBPACK_IMPORTED_MODULE_3__.globalThisShim ? "pagehide" : "unload";
        addEventListener(terminationEvent, unloadHandler, false);
    }
}
function unloadHandler() {
    for (let i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
            Request.requests[i].abort();
        }
    }
}
const hasXHR2 = (function () {
    const xhr = newRequest({
        xdomain: false,
    });
    return xhr && xhr.responseType !== null;
})();
/**
 * HTTP long-polling based on the built-in `XMLHttpRequest` object.
 *
 * Usage: browser
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 */
class XHR extends BaseXHR {
    constructor(opts) {
        super(opts);
        const forceBase64 = opts && opts.forceBase64;
        this.supportsBinary = hasXHR2 && !forceBase64;
    }
    request(opts = {}) {
        Object.assign(opts, { xd: this.xd }, this.opts);
        return new Request(newRequest, this.uri(), opts);
    }
}
function newRequest(opts) {
    const xdomain = opts.xdomain;
    // XMLHttpRequest can be disabled on IE
    try {
        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || _contrib_has_cors_js__WEBPACK_IMPORTED_MODULE_4__.hasCORS)) {
            return new XMLHttpRequest();
        }
    }
    catch (e) { }
    if (!xdomain) {
        try {
            return new _globals_node_js__WEBPACK_IMPORTED_MODULE_3__.globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
        }
        catch (e) { }
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/polling.js"
/*!***********************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/polling.js ***!
  \***********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Polling: () => (/* binding */ Polling)
/* harmony export */ });
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");



class Polling extends _transport_js__WEBPACK_IMPORTED_MODULE_0__.Transport {
    constructor() {
        super(...arguments);
        this._polling = false;
    }
    get name() {
        return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @protected
     */
    doOpen() {
        this._poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} onPause - callback upon buffers are flushed and transport is paused
     * @package
     */
    pause(onPause) {
        this.readyState = "pausing";
        const pause = () => {
            this.readyState = "paused";
            onPause();
        };
        if (this._polling || !this.writable) {
            let total = 0;
            if (this._polling) {
                total++;
                this.once("pollComplete", function () {
                    --total || pause();
                });
            }
            if (!this.writable) {
                total++;
                this.once("drain", function () {
                    --total || pause();
                });
            }
        }
        else {
            pause();
        }
    }
    /**
     * Starts polling cycle.
     *
     * @private
     */
    _poll() {
        this._polling = true;
        this.doPoll();
        this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @protected
     */
    onData(data) {
        const callback = (packet) => {
            // if its the first message we consider the transport open
            if ("opening" === this.readyState && packet.type === "open") {
                this.onOpen();
            }
            // if its a close packet, we close the ongoing requests
            if ("close" === packet.type) {
                this.onClose({ description: "transport closed by the server" });
                return false;
            }
            // otherwise bypass onData and handle the message
            this.onPacket(packet);
        };
        // decode payload
        (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_2__.decodePayload)(data, this.socket.binaryType).forEach(callback);
        // if an event did not trigger closing
        if ("closed" !== this.readyState) {
            // if we got data we're not polling
            this._polling = false;
            this.emitReserved("pollComplete");
            if ("open" === this.readyState) {
                this._poll();
            }
            else {
            }
        }
    }
    /**
     * For polling, send a close packet.
     *
     * @protected
     */
    doClose() {
        const close = () => {
            this.write([{ type: "close" }]);
        };
        if ("open" === this.readyState) {
            close();
        }
        else {
            // in case we're trying to close while
            // handshaking is in progress (GH-164)
            this.once("open", close);
        }
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} packets - data packets
     * @protected
     */
    write(packets) {
        this.writable = false;
        (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_2__.encodePayload)(packets, (data) => {
            this.doWrite(data, () => {
                this.writable = true;
                this.emitReserved("drain");
            });
        });
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
        const schema = this.opts.secure ? "https" : "http";
        const query = this.query || {};
        // cache busting is forced
        if (false !== this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.randomString)();
        }
        if (!this.supportsBinary && !query.sid) {
            query.b64 = 1;
        }
        return this.createUri(schema, query);
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/websocket.js"
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/websocket.js ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseWS: () => (/* binding */ BaseWS),
/* harmony export */   WS: () => (/* binding */ WS)
/* harmony export */ });
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util.js */ "./node_modules/engine.io-client/build/esm/util.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");




// detect ReactNative environment
const isReactNative = typeof navigator !== "undefined" &&
    typeof navigator.product === "string" &&
    navigator.product.toLowerCase() === "reactnative";
class BaseWS extends _transport_js__WEBPACK_IMPORTED_MODULE_0__.Transport {
    get name() {
        return "websocket";
    }
    doOpen() {
        const uri = this.uri();
        const protocols = this.opts.protocols;
        // React Native only supports the 'headers' option, and will print a warning if anything else is passed
        const opts = isReactNative
            ? {}
            : (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.pick)(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        if (this.opts.extraHeaders) {
            opts.headers = this.opts.extraHeaders;
        }
        try {
            this.ws = this.createSocket(uri, protocols, opts);
        }
        catch (err) {
            return this.emitReserved("error", err);
        }
        this.ws.binaryType = this.socket.binaryType;
        this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @private
     */
    addEventListeners() {
        this.ws.onopen = () => {
            if (this.opts.autoUnref) {
                this.ws._socket.unref();
            }
            this.onOpen();
        };
        this.ws.onclose = (closeEvent) => this.onClose({
            description: "websocket connection closed",
            context: closeEvent,
        });
        this.ws.onmessage = (ev) => this.onData(ev.data);
        this.ws.onerror = (e) => this.onError("websocket error", e);
    }
    write(packets) {
        this.writable = false;
        // encodePacket efficient as it uses WS framing
        // no need for encodePayload
        for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_2__.encodePacket)(packet, this.supportsBinary, (data) => {
                // Sometimes the websocket has already been closed but the browser didn't
                // have a chance of informing us about it yet, in that case send will
                // throw an error
                try {
                    this.doWrite(packet, data);
                }
                catch (e) {
                }
                if (lastPacket) {
                    // fake drain
                    // defer to next tick to allow Socket to clear writeBuffer
                    (0,_globals_node_js__WEBPACK_IMPORTED_MODULE_3__.nextTick)(() => {
                        this.writable = true;
                        this.emitReserved("drain");
                    }, this.setTimeoutFn);
                }
            });
        }
    }
    doClose() {
        if (typeof this.ws !== "undefined") {
            this.ws.onerror = () => { };
            this.ws.close();
            this.ws = null;
        }
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
        const schema = this.opts.secure ? "wss" : "ws";
        const query = this.query || {};
        // append timestamp to URI
        if (this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.randomString)();
        }
        // communicate binary support capabilities
        if (!this.supportsBinary) {
            query.b64 = 1;
        }
        return this.createUri(schema, query);
    }
}
const WebSocketCtor = _globals_node_js__WEBPACK_IMPORTED_MODULE_3__.globalThisShim.WebSocket || _globals_node_js__WEBPACK_IMPORTED_MODULE_3__.globalThisShim.MozWebSocket;
/**
 * WebSocket transport based on the built-in `WebSocket` object.
 *
 * Usage: browser, Node.js (since v21), Deno, Bun
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 * @see https://caniuse.com/mdn-api_websocket
 * @see https://nodejs.org/api/globals.html#websocket
 */
class WS extends BaseWS {
    createSocket(uri, protocols, opts) {
        return !isReactNative
            ? protocols
                ? new WebSocketCtor(uri, protocols)
                : new WebSocketCtor(uri)
            : new WebSocketCtor(uri, protocols, opts);
    }
    doWrite(_packet, data) {
        this.ws.send(data);
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/transports/webtransport.js"
/*!****************************************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/transports/webtransport.js ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WT: () => (/* binding */ WT)
/* harmony export */ });
/* harmony import */ var _transport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../transport.js */ "./node_modules/engine.io-client/build/esm/transport.js");
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");
/* harmony import */ var engine_io_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! engine.io-parser */ "./node_modules/engine.io-parser/build/esm/index.js");



/**
 * WebTransport transport based on the built-in `WebTransport` object.
 *
 * Usage: browser, Node.js (with the `@fails-components/webtransport` package)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebTransport
 * @see https://caniuse.com/webtransport
 */
class WT extends _transport_js__WEBPACK_IMPORTED_MODULE_0__.Transport {
    get name() {
        return "webtransport";
    }
    doOpen() {
        try {
            // @ts-ignore
            this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
        }
        catch (err) {
            return this.emitReserved("error", err);
        }
        this._transport.closed
            .then(() => {
            this.onClose();
        })
            .catch((err) => {
            this.onError("webtransport error", err);
        });
        // note: we could have used async/await, but that would require some additional polyfills
        this._transport.ready.then(() => {
            this._transport.createBidirectionalStream().then((stream) => {
                const decoderStream = (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_2__.createPacketDecoderStream)(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
                const reader = stream.readable.pipeThrough(decoderStream).getReader();
                const encoderStream = (0,engine_io_parser__WEBPACK_IMPORTED_MODULE_2__.createPacketEncoderStream)();
                encoderStream.readable.pipeTo(stream.writable);
                this._writer = encoderStream.writable.getWriter();
                const read = () => {
                    reader
                        .read()
                        .then(({ done, value }) => {
                        if (done) {
                            return;
                        }
                        this.onPacket(value);
                        read();
                    })
                        .catch((err) => {
                    });
                };
                read();
                const packet = { type: "open" };
                if (this.query.sid) {
                    packet.data = `{"sid":"${this.query.sid}"}`;
                }
                this._writer.write(packet).then(() => this.onOpen());
            });
        });
    }
    write(packets) {
        this.writable = false;
        for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            this._writer.write(packet).then(() => {
                if (lastPacket) {
                    (0,_globals_node_js__WEBPACK_IMPORTED_MODULE_1__.nextTick)(() => {
                        this.writable = true;
                        this.emitReserved("drain");
                    }, this.setTimeoutFn);
                }
            });
        }
    }
    doClose() {
        var _a;
        (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
    }
}


/***/ },

/***/ "./node_modules/engine.io-client/build/esm/util.js"
/*!*********************************************************!*\
  !*** ./node_modules/engine.io-client/build/esm/util.js ***!
  \*********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   byteLength: () => (/* binding */ byteLength),
/* harmony export */   installTimerFunctions: () => (/* binding */ installTimerFunctions),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   randomString: () => (/* binding */ randomString)
/* harmony export */ });
/* harmony import */ var _globals_node_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./globals.node.js */ "./node_modules/engine.io-client/build/esm/globals.js");

function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
        if (obj.hasOwnProperty(k)) {
            acc[k] = obj[k];
        }
        return acc;
    }, {});
}
// Keep a reference to the real timeout functions so they can be used when overridden
const NATIVE_SET_TIMEOUT = _globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.setTimeout;
const NATIVE_CLEAR_TIMEOUT = _globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
        obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(_globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
        obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(_globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
    }
    else {
        obj.setTimeoutFn = _globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.setTimeout.bind(_globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
        obj.clearTimeoutFn = _globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim.clearTimeout.bind(_globals_node_js__WEBPACK_IMPORTED_MODULE_0__.globalThisShim);
    }
}
// base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
const BASE64_OVERHEAD = 1.33;
// we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
function byteLength(obj) {
    if (typeof obj === "string") {
        return utf8Length(obj);
    }
    // arraybuffer or blob
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
    let c = 0, length = 0;
    for (let i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            length += 1;
        }
        else if (c < 0x800) {
            length += 2;
        }
        else if (c < 0xd800 || c >= 0xe000) {
            length += 3;
        }
        else {
            i++;
            length += 4;
        }
    }
    return length;
}
/**
 * Generates a random 8-characters string.
 */
function randomString() {
    return (Date.now().toString(36).substring(3) +
        Math.random().toString(36).substring(2, 5));
}


/***/ },

/***/ "./node_modules/engine.io-parser/build/esm/commons.js"
/*!************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/commons.js ***!
  \************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ERROR_PACKET: () => (/* binding */ ERROR_PACKET),
/* harmony export */   PACKET_TYPES: () => (/* binding */ PACKET_TYPES),
/* harmony export */   PACKET_TYPES_REVERSE: () => (/* binding */ PACKET_TYPES_REVERSE)
/* harmony export */ });
const PACKET_TYPES = Object.create(null); // no Map = no polyfill
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
const PACKET_TYPES_REVERSE = Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
const ERROR_PACKET = { type: "error", data: "parser error" };



/***/ },

/***/ "./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js"
/*!*******************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js ***!
  \*******************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decode: () => (/* binding */ decode),
/* harmony export */   encode: () => (/* binding */ encode)
/* harmony export */ });
// imported from https://github.com/socketio/base64-arraybuffer
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
const encode = (arraybuffer) => {
    let bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};
const decode = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return arraybuffer;
};


/***/ },

/***/ "./node_modules/engine.io-parser/build/esm/decodePacket.browser.js"
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/decodePacket.browser.js ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodePacket: () => (/* binding */ decodePacket)
/* harmony export */ });
/* harmony import */ var _commons_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commons.js */ "./node_modules/engine.io-parser/build/esm/commons.js");
/* harmony import */ var _contrib_base64_arraybuffer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contrib/base64-arraybuffer.js */ "./node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js");


const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
        return {
            type: "message",
            data: mapBinary(encodedPacket, binaryType),
        };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
        return {
            type: "message",
            data: decodeBase64Packet(encodedPacket.substring(1), binaryType),
        };
    }
    const packetType = _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type];
    if (!packetType) {
        return _commons_js__WEBPACK_IMPORTED_MODULE_0__.ERROR_PACKET;
    }
    return encodedPacket.length > 1
        ? {
            type: _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type],
            data: encodedPacket.substring(1),
        }
        : {
            type: _commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES_REVERSE[type],
        };
};
const decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer) {
        const decoded = (0,_contrib_base64_arraybuffer_js__WEBPACK_IMPORTED_MODULE_1__.decode)(data);
        return mapBinary(decoded, binaryType);
    }
    else {
        return { base64: true, data }; // fallback for old browsers
    }
};
const mapBinary = (data, binaryType) => {
    switch (binaryType) {
        case "blob":
            if (data instanceof Blob) {
                // from WebSocket + binaryType "blob"
                return data;
            }
            else {
                // from HTTP long-polling or WebTransport
                return new Blob([data]);
            }
        case "arraybuffer":
        default:
            if (data instanceof ArrayBuffer) {
                // from HTTP long-polling (base64) or WebSocket + binaryType "arraybuffer"
                return data;
            }
            else {
                // from WebTransport (Uint8Array)
                return data.buffer;
            }
    }
};


/***/ },

/***/ "./node_modules/engine.io-parser/build/esm/encodePacket.browser.js"
/*!*************************************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/encodePacket.browser.js ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   encodePacket: () => (/* binding */ encodePacket),
/* harmony export */   encodePacketToBinary: () => (/* binding */ encodePacketToBinary)
/* harmony export */ });
/* harmony import */ var _commons_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./commons.js */ "./node_modules/engine.io-parser/build/esm/commons.js");

const withNativeBlob = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
const withNativeArrayBuffer = typeof ArrayBuffer === "function";
// ArrayBuffer.isView method is not defined in IE10
const isView = (obj) => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj && obj.buffer instanceof ArrayBuffer;
};
const encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(data, callback);
        }
    }
    else if (withNativeArrayBuffer &&
        (data instanceof ArrayBuffer || isView(data))) {
        if (supportsBinary) {
            return callback(data);
        }
        else {
            return encodeBlobAsBase64(new Blob([data]), callback);
        }
    }
    // plain string
    return callback(_commons_js__WEBPACK_IMPORTED_MODULE_0__.PACKET_TYPES[type] + (data || ""));
};
const encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
        const content = fileReader.result.split(",")[1];
        callback("b" + (content || ""));
    };
    return fileReader.readAsDataURL(data);
};
function toArray(data) {
    if (data instanceof Uint8Array) {
        return data;
    }
    else if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    else {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
}
let TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
    if (withNativeBlob && packet.data instanceof Blob) {
        return packet.data.arrayBuffer().then(toArray).then(callback);
    }
    else if (withNativeArrayBuffer &&
        (packet.data instanceof ArrayBuffer || isView(packet.data))) {
        return callback(toArray(packet.data));
    }
    encodePacket(packet, false, (encoded) => {
        if (!TEXT_ENCODER) {
            TEXT_ENCODER = new TextEncoder();
        }
        callback(TEXT_ENCODER.encode(encoded));
    });
}



/***/ },

/***/ "./node_modules/engine.io-parser/build/esm/index.js"
/*!**********************************************************!*\
  !*** ./node_modules/engine.io-parser/build/esm/index.js ***!
  \**********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPacketDecoderStream: () => (/* binding */ createPacketDecoderStream),
/* harmony export */   createPacketEncoderStream: () => (/* binding */ createPacketEncoderStream),
/* harmony export */   decodePacket: () => (/* reexport safe */ _decodePacket_js__WEBPACK_IMPORTED_MODULE_1__.decodePacket),
/* harmony export */   decodePayload: () => (/* binding */ decodePayload),
/* harmony export */   encodePacket: () => (/* reexport safe */ _encodePacket_js__WEBPACK_IMPORTED_MODULE_0__.encodePacket),
/* harmony export */   encodePayload: () => (/* binding */ encodePayload),
/* harmony export */   protocol: () => (/* binding */ protocol)
/* harmony export */ });
/* harmony import */ var _encodePacket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./encodePacket.js */ "./node_modules/engine.io-parser/build/esm/encodePacket.browser.js");
/* harmony import */ var _decodePacket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./decodePacket.js */ "./node_modules/engine.io-parser/build/esm/decodePacket.browser.js");
/* harmony import */ var _commons_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./commons.js */ "./node_modules/engine.io-parser/build/esm/commons.js");



const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
const encodePayload = (packets, callback) => {
    // some packets may be added to the array while encoding, so the initial length must be saved
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i) => {
        // force base64 encoding for binary packets
        (0,_encodePacket_js__WEBPACK_IMPORTED_MODULE_0__.encodePacket)(packet, false, (encodedPacket) => {
            encodedPackets[i] = encodedPacket;
            if (++count === length) {
                callback(encodedPackets.join(SEPARATOR));
            }
        });
    });
};
const decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
        const decodedPacket = (0,_decodePacket_js__WEBPACK_IMPORTED_MODULE_1__.decodePacket)(encodedPackets[i], binaryType);
        packets.push(decodedPacket);
        if (decodedPacket.type === "error") {
            break;
        }
    }
    return packets;
};
function createPacketEncoderStream() {
    return new TransformStream({
        transform(packet, controller) {
            (0,_encodePacket_js__WEBPACK_IMPORTED_MODULE_0__.encodePacketToBinary)(packet, (encodedPacket) => {
                const payloadLength = encodedPacket.length;
                let header;
                // inspired by the WebSocket format: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#decoding_payload_length
                if (payloadLength < 126) {
                    header = new Uint8Array(1);
                    new DataView(header.buffer).setUint8(0, payloadLength);
                }
                else if (payloadLength < 65536) {
                    header = new Uint8Array(3);
                    const view = new DataView(header.buffer);
                    view.setUint8(0, 126);
                    view.setUint16(1, payloadLength);
                }
                else {
                    header = new Uint8Array(9);
                    const view = new DataView(header.buffer);
                    view.setUint8(0, 127);
                    view.setBigUint64(1, BigInt(payloadLength));
                }
                // first bit indicates whether the payload is plain text (0) or binary (1)
                if (packet.data && typeof packet.data !== "string") {
                    header[0] |= 0x80;
                }
                controller.enqueue(header);
                controller.enqueue(encodedPacket);
            });
        },
    });
}
let TEXT_DECODER;
function totalLength(chunks) {
    return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
    if (chunks[0].length === size) {
        return chunks.shift();
    }
    const buffer = new Uint8Array(size);
    let j = 0;
    for (let i = 0; i < size; i++) {
        buffer[i] = chunks[0][j++];
        if (j === chunks[0].length) {
            chunks.shift();
            j = 0;
        }
    }
    if (chunks.length && j < chunks[0].length) {
        chunks[0] = chunks[0].slice(j);
    }
    return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
    if (!TEXT_DECODER) {
        TEXT_DECODER = new TextDecoder();
    }
    const chunks = [];
    let state = 0 /* State.READ_HEADER */;
    let expectedLength = -1;
    let isBinary = false;
    return new TransformStream({
        transform(chunk, controller) {
            chunks.push(chunk);
            while (true) {
                if (state === 0 /* State.READ_HEADER */) {
                    if (totalLength(chunks) < 1) {
                        break;
                    }
                    const header = concatChunks(chunks, 1);
                    isBinary = (header[0] & 0x80) === 0x80;
                    expectedLength = header[0] & 0x7f;
                    if (expectedLength < 126) {
                        state = 3 /* State.READ_PAYLOAD */;
                    }
                    else if (expectedLength === 126) {
                        state = 1 /* State.READ_EXTENDED_LENGTH_16 */;
                    }
                    else {
                        state = 2 /* State.READ_EXTENDED_LENGTH_64 */;
                    }
                }
                else if (state === 1 /* State.READ_EXTENDED_LENGTH_16 */) {
                    if (totalLength(chunks) < 2) {
                        break;
                    }
                    const headerArray = concatChunks(chunks, 2);
                    expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
                    state = 3 /* State.READ_PAYLOAD */;
                }
                else if (state === 2 /* State.READ_EXTENDED_LENGTH_64 */) {
                    if (totalLength(chunks) < 8) {
                        break;
                    }
                    const headerArray = concatChunks(chunks, 8);
                    const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
                    const n = view.getUint32(0);
                    if (n > Math.pow(2, 53 - 32) - 1) {
                        // the maximum safe integer in JavaScript is 2^53 - 1
                        controller.enqueue(_commons_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_PACKET);
                        break;
                    }
                    expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
                    state = 3 /* State.READ_PAYLOAD */;
                }
                else {
                    if (totalLength(chunks) < expectedLength) {
                        break;
                    }
                    const data = concatChunks(chunks, expectedLength);
                    controller.enqueue((0,_decodePacket_js__WEBPACK_IMPORTED_MODULE_1__.decodePacket)(isBinary ? data : TEXT_DECODER.decode(data), binaryType));
                    state = 0 /* State.READ_HEADER */;
                }
                if (expectedLength === 0 || expectedLength > maxPayload) {
                    controller.enqueue(_commons_js__WEBPACK_IMPORTED_MODULE_2__.ERROR_PACKET);
                    break;
                }
            }
        },
    });
}
const protocol = 4;



/***/ },

/***/ "./node_modules/socket.io-client/build/esm/contrib/backo2.js"
/*!*******************************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/contrib/backo2.js ***!
  \*******************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Backoff: () => (/* binding */ Backoff)
/* harmony export */ });
/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */
function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
}
/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */
Backoff.prototype.duration = function () {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var rand = Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
};
/**
 * Reset the number of attempts.
 *
 * @api public
 */
Backoff.prototype.reset = function () {
    this.attempts = 0;
};
/**
 * Set the minimum duration
 *
 * @api public
 */
Backoff.prototype.setMin = function (min) {
    this.ms = min;
};
/**
 * Set the maximum duration
 *
 * @api public
 */
Backoff.prototype.setMax = function (max) {
    this.max = max;
};
/**
 * Set the jitter
 *
 * @api public
 */
Backoff.prototype.setJitter = function (jitter) {
    this.jitter = jitter;
};


/***/ },

/***/ "./node_modules/socket.io-client/build/esm/index.js"
/*!**********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/index.js ***!
  \**********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fetch: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.Fetch),
/* harmony export */   Manager: () => (/* reexport safe */ _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager),
/* harmony export */   NodeWebSocket: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.NodeWebSocket),
/* harmony export */   NodeXHR: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.NodeXHR),
/* harmony export */   Socket: () => (/* reexport safe */ _socket_js__WEBPACK_IMPORTED_MODULE_2__.Socket),
/* harmony export */   WebSocket: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.WebSocket),
/* harmony export */   WebTransport: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.WebTransport),
/* harmony export */   XHR: () => (/* reexport safe */ engine_io_client__WEBPACK_IMPORTED_MODULE_4__.XHR),
/* harmony export */   connect: () => (/* binding */ lookup),
/* harmony export */   "default": () => (/* binding */ lookup),
/* harmony export */   io: () => (/* binding */ lookup),
/* harmony export */   protocol: () => (/* reexport safe */ socket_io_parser__WEBPACK_IMPORTED_MODULE_3__.protocol)
/* harmony export */ });
/* harmony import */ var _url_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url.js */ "./node_modules/socket.io-client/build/esm/url.js");
/* harmony import */ var _manager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./manager.js */ "./node_modules/socket.io-client/build/esm/manager.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./socket.js */ "./node_modules/socket.io-client/build/esm/socket.js");
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm-debug/index.js");
/* harmony import */ var engine_io_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! engine.io-client */ "./node_modules/engine.io-client/build/esm/index.js");



/**
 * Managers cache.
 */
const cache = {};
function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = (0,_url_js__WEBPACK_IMPORTED_MODULE_0__.url)(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;
    let io;
    if (newConnection) {
        io = new _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager(source, opts);
    }
    else {
        if (!cache[id]) {
            cache[id] = new _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager(source, opts);
        }
        io = cache[id];
    }
    if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
}
// so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
// namespace (e.g. `io.connect(...)`), for backward compatibility
Object.assign(lookup, {
    Manager: _manager_js__WEBPACK_IMPORTED_MODULE_1__.Manager,
    Socket: _socket_js__WEBPACK_IMPORTED_MODULE_2__.Socket,
    io: lookup,
    connect: lookup,
});
/**
 * Protocol version.
 *
 * @public
 */

/**
 * Expose constructors for standalone build.
 *
 * @public
 */




/***/ },

/***/ "./node_modules/socket.io-client/build/esm/manager.js"
/*!************************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/manager.js ***!
  \************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Manager: () => (/* binding */ Manager)
/* harmony export */ });
/* harmony import */ var engine_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-client */ "./node_modules/engine.io-client/build/esm/index.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./socket.js */ "./node_modules/socket.io-client/build/esm/socket.js");
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm-debug/index.js");
/* harmony import */ var _on_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./on.js */ "./node_modules/socket.io-client/build/esm/on.js");
/* harmony import */ var _contrib_backo2_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./contrib/backo2.js */ "./node_modules/socket.io-client/build/esm/contrib/backo2.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");






class Manager extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_5__.Emitter {
    constructor(uri, opts) {
        var _a;
        super();
        this.nsps = {};
        this.subs = [];
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        opts.path = opts.path || "/socket.io";
        this.opts = opts;
        (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.installTimerFunctions)(this, opts);
        this.reconnection(opts.reconnection !== false);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1000);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
        this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
        this.backoff = new _contrib_backo2_js__WEBPACK_IMPORTED_MODULE_4__.Backoff({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor(),
        });
        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
        this._readyState = "closed";
        this.uri = uri;
        const _parser = opts.parser || socket_io_parser__WEBPACK_IMPORTED_MODULE_2__;
        this.encoder = new _parser.Encoder();
        this.decoder = new _parser.Decoder();
        this._autoConnect = opts.autoConnect !== false;
        if (this._autoConnect)
            this.open();
    }
    reconnection(v) {
        if (!arguments.length)
            return this._reconnection;
        this._reconnection = !!v;
        if (!v) {
            this.skipReconnect = true;
        }
        return this;
    }
    reconnectionAttempts(v) {
        if (v === undefined)
            return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
    }
    reconnectionDelay(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelay;
        this._reconnectionDelay = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
        return this;
    }
    randomizationFactor(v) {
        var _a;
        if (v === undefined)
            return this._randomizationFactor;
        this._randomizationFactor = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
        return this;
    }
    reconnectionDelayMax(v) {
        var _a;
        if (v === undefined)
            return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
        return this;
    }
    timeout(v) {
        if (!arguments.length)
            return this._timeout;
        this._timeout = v;
        return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */
    maybeReconnectOnOpen() {
        // Only try to reconnect if it's the first time we're connecting
        if (!this._reconnecting &&
            this._reconnection &&
            this.backoff.attempts === 0) {
            // keeps reconnection from firing twice for the same reconnection loop
            this.reconnect();
        }
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */
    open(fn) {
        if (~this._readyState.indexOf("open"))
            return this;
        this.engine = new engine_io_client__WEBPACK_IMPORTED_MODULE_0__.Socket(this.uri, this.opts);
        const socket = this.engine;
        const self = this;
        this._readyState = "opening";
        this.skipReconnect = false;
        // emit `open`
        const openSubDestroy = (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "open", function () {
            self.onopen();
            fn && fn();
        });
        const onError = (err) => {
            this.cleanup();
            this._readyState = "closed";
            this.emitReserved("error", err);
            if (fn) {
                fn(err);
            }
            else {
                // Only do this if there is no fn to handle the error
                this.maybeReconnectOnOpen();
            }
        };
        // emit `error`
        const errorSub = (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "error", onError);
        if (false !== this._timeout) {
            const timeout = this._timeout;
            // set timer
            const timer = this.setTimeoutFn(() => {
                openSubDestroy();
                onError(new Error("timeout"));
                socket.close();
            }, timeout);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(() => {
                this.clearTimeoutFn(timer);
            });
        }
        this.subs.push(openSubDestroy);
        this.subs.push(errorSub);
        return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */
    connect(fn) {
        return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */
    onopen() {
        // clear old subs
        this.cleanup();
        // mark as open
        this._readyState = "open";
        this.emitReserved("open");
        // add new subs
        const socket = this.engine;
        this.subs.push((0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "ping", this.onping.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "data", this.ondata.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "error", this.onerror.bind(this)), (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(socket, "close", this.onclose.bind(this)), 
        // @ts-ignore
        (0,_on_js__WEBPACK_IMPORTED_MODULE_3__.on)(this.decoder, "decoded", this.ondecoded.bind(this)));
    }
    /**
     * Called upon a ping.
     *
     * @private
     */
    onping() {
        this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */
    ondata(data) {
        try {
            this.decoder.add(data);
        }
        catch (e) {
            this.onclose("parse error", e);
        }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */
    ondecoded(packet) {
        // the nextTick call prevents an exception in a user-provided event listener from triggering a disconnection due to a "parse error"
        (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.nextTick)(() => {
            this.emitReserved("packet", packet);
        }, this.setTimeoutFn);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */
    onerror(err) {
        this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */
    socket(nsp, opts) {
        let socket = this.nsps[nsp];
        if (!socket) {
            socket = new _socket_js__WEBPACK_IMPORTED_MODULE_1__.Socket(this, nsp, opts);
            this.nsps[nsp] = socket;
        }
        else if (this._autoConnect && !socket.active) {
            socket.connect();
        }
        return socket;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */
    _destroy(socket) {
        const nsps = Object.keys(this.nsps);
        for (const nsp of nsps) {
            const socket = this.nsps[nsp];
            if (socket.active) {
                return;
            }
        }
        this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */
    _packet(packet) {
        const encodedPackets = this.encoder.encode(packet);
        for (let i = 0; i < encodedPackets.length; i++) {
            this.engine.write(encodedPackets[i], packet.options);
        }
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */
    cleanup() {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs.length = 0;
        this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */
    _close() {
        this.skipReconnect = true;
        this._reconnecting = false;
        this.onclose("forced close");
    }
    /**
     * Alias for close()
     *
     * @private
     */
    disconnect() {
        return this._close();
    }
    /**
     * Called when:
     *
     * - the low-level engine is closed
     * - the parser encountered a badly formatted packet
     * - all sockets are disconnected
     *
     * @private
     */
    onclose(reason, description) {
        var _a;
        this.cleanup();
        (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
        this.backoff.reset();
        this._readyState = "closed";
        this.emitReserved("close", reason, description);
        if (this._reconnection && !this.skipReconnect) {
            this.reconnect();
        }
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */
    reconnect() {
        if (this._reconnecting || this.skipReconnect)
            return this;
        const self = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) {
            this.backoff.reset();
            this.emitReserved("reconnect_failed");
            this._reconnecting = false;
        }
        else {
            const delay = this.backoff.duration();
            this._reconnecting = true;
            const timer = this.setTimeoutFn(() => {
                if (self.skipReconnect)
                    return;
                this.emitReserved("reconnect_attempt", self.backoff.attempts);
                // check again for the case socket closed in above events
                if (self.skipReconnect)
                    return;
                self.open((err) => {
                    if (err) {
                        self._reconnecting = false;
                        self.reconnect();
                        this.emitReserved("reconnect_error", err);
                    }
                    else {
                        self.onreconnect();
                    }
                });
            }, delay);
            if (this.opts.autoUnref) {
                timer.unref();
            }
            this.subs.push(() => {
                this.clearTimeoutFn(timer);
            });
        }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */
    onreconnect() {
        const attempt = this.backoff.attempts;
        this._reconnecting = false;
        this.backoff.reset();
        this.emitReserved("reconnect", attempt);
    }
}


/***/ },

/***/ "./node_modules/socket.io-client/build/esm/on.js"
/*!*******************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/on.js ***!
  \*******************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   on: () => (/* binding */ on)
/* harmony export */ });
function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
        obj.off(ev, fn);
    };
}


/***/ },

/***/ "./node_modules/socket.io-client/build/esm/socket.js"
/*!***********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/socket.js ***!
  \***********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Socket: () => (/* binding */ Socket)
/* harmony export */ });
/* harmony import */ var socket_io_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io-parser */ "./node_modules/socket.io-parser/build/esm-debug/index.js");
/* harmony import */ var _on_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./on.js */ "./node_modules/socket.io-client/build/esm/on.js");
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");



/**
 * Internal events.
 * These events can't be emitted by the user.
 */
const RESERVED_EVENTS = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1,
});
/**
 * A Socket is the fundamental class for interacting with the server.
 *
 * A Socket belongs to a certain Namespace (by default /) and uses an underlying {@link Manager} to communicate.
 *
 * @example
 * const socket = io();
 *
 * socket.on("connect", () => {
 *   console.log("connected");
 * });
 *
 * // send an event to the server
 * socket.emit("foo", "bar");
 *
 * socket.on("foobar", () => {
 *   // an event was received from the server
 * });
 *
 * // upon disconnection
 * socket.on("disconnect", (reason) => {
 *   console.log(`disconnected due to ${reason}`);
 * });
 */
class Socket extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_2__.Emitter {
    /**
     * `Socket` constructor.
     */
    constructor(io, nsp, opts) {
        super();
        /**
         * Whether the socket is currently connected to the server.
         *
         * @example
         * const socket = io();
         *
         * socket.on("connect", () => {
         *   console.log(socket.connected); // true
         * });
         *
         * socket.on("disconnect", () => {
         *   console.log(socket.connected); // false
         * });
         */
        this.connected = false;
        /**
         * Whether the connection state was recovered after a temporary disconnection. In that case, any missed packets will
         * be transmitted by the server.
         */
        this.recovered = false;
        /**
         * Buffer for packets received before the CONNECT packet
         */
        this.receiveBuffer = [];
        /**
         * Buffer for packets that will be sent once the socket is connected
         */
        this.sendBuffer = [];
        /**
         * The queue of packets to be sent with retry in case of failure.
         *
         * Packets are sent one by one, each waiting for the server acknowledgement, in order to guarantee the delivery order.
         * @private
         */
        this._queue = [];
        /**
         * A sequence to generate the ID of the {@link QueuedPacket}.
         * @private
         */
        this._queueSeq = 0;
        this.ids = 0;
        /**
         * A map containing acknowledgement handlers.
         *
         * The `withError` attribute is used to differentiate handlers that accept an error as first argument:
         *
         * - `socket.emit("test", (err, value) => { ... })` with `ackTimeout` option
         * - `socket.timeout(5000).emit("test", (err, value) => { ... })`
         * - `const value = await socket.emitWithAck("test")`
         *
         * From those that don't:
         *
         * - `socket.emit("test", (value) => { ... });`
         *
         * In the first case, the handlers will be called with an error when:
         *
         * - the timeout is reached
         * - the socket gets disconnected
         *
         * In the second case, the handlers will be simply discarded upon disconnection, since the client will never receive
         * an acknowledgement from the server.
         *
         * @private
         */
        this.acks = {};
        this.flags = {};
        this.io = io;
        this.nsp = nsp;
        if (opts && opts.auth) {
            this.auth = opts.auth;
        }
        this._opts = Object.assign({}, opts);
        if (this.io._autoConnect)
            this.open();
    }
    /**
     * Whether the socket is currently disconnected
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log(socket.disconnected); // false
     * });
     *
     * socket.on("disconnect", () => {
     *   console.log(socket.disconnected); // true
     * });
     */
    get disconnected() {
        return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */
    subEvents() {
        if (this.subs)
            return;
        const io = this.io;
        this.subs = [
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "open", this.onopen.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "packet", this.onpacket.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "error", this.onerror.bind(this)),
            (0,_on_js__WEBPACK_IMPORTED_MODULE_1__.on)(io, "close", this.onclose.bind(this)),
        ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
     *
     * @example
     * const socket = io();
     *
     * console.log(socket.active); // true
     *
     * socket.on("disconnect", (reason) => {
     *   if (reason === "io server disconnect") {
     *     // the disconnection was initiated by the server, you need to manually reconnect
     *     console.log(socket.active); // false
     *   }
     *   // else the socket will automatically try to reconnect
     *   console.log(socket.active); // true
     * });
     */
    get active() {
        return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @example
     * const socket = io({
     *   autoConnect: false
     * });
     *
     * socket.connect();
     */
    connect() {
        if (this.connected)
            return this;
        this.subEvents();
        if (!this.io["_reconnecting"])
            this.io.open(); // ensure open
        if ("open" === this.io._readyState)
            this.onopen();
        return this;
    }
    /**
     * Alias for {@link connect()}.
     */
    open() {
        return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * This method mimics the WebSocket.send() method.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     *
     * @example
     * socket.send("hello");
     *
     * // this is equivalent to
     * socket.emit("message", "hello");
     *
     * @return self
     */
    send(...args) {
        args.unshift("message");
        this.emit.apply(this, args);
        return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @example
     * socket.emit("hello", "world");
     *
     * // all serializable datastructures are supported (no need to call JSON.stringify)
     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
     *
     * // with an acknowledgement from the server
     * socket.emit("hello", "world", (val) => {
     *   // ...
     * });
     *
     * @return self
     */
    emit(ev, ...args) {
        var _a, _b, _c;
        if (RESERVED_EVENTS.hasOwnProperty(ev)) {
            throw new Error('"' + ev.toString() + '" is a reserved event name');
        }
        args.unshift(ev);
        if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
            this._addToQueue(args);
            return this;
        }
        const packet = {
            type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.EVENT,
            data: args,
        };
        packet.options = {};
        packet.options.compress = this.flags.compress !== false;
        // event ack callback
        if ("function" === typeof args[args.length - 1]) {
            const id = this.ids++;
            const ack = args.pop();
            this._registerAckCallback(id, ack);
            packet.id = id;
        }
        const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
        const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
        const discardPacket = this.flags.volatile && !isTransportWritable;
        if (discardPacket) {
        }
        else if (isConnected) {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        }
        else {
            this.sendBuffer.push(packet);
        }
        this.flags = {};
        return this;
    }
    /**
     * @private
     */
    _registerAckCallback(id, ack) {
        var _a;
        const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
        if (timeout === undefined) {
            this.acks[id] = ack;
            return;
        }
        // @ts-ignore
        const timer = this.io.setTimeoutFn(() => {
            delete this.acks[id];
            for (let i = 0; i < this.sendBuffer.length; i++) {
                if (this.sendBuffer[i].id === id) {
                    this.sendBuffer.splice(i, 1);
                }
            }
            ack.call(this, new Error("operation has timed out"));
        }, timeout);
        const fn = (...args) => {
            // @ts-ignore
            this.io.clearTimeoutFn(timer);
            ack.apply(this, args);
        };
        fn.withError = true;
        this.acks[id] = fn;
    }
    /**
     * Emits an event and waits for an acknowledgement
     *
     * @example
     * // without timeout
     * const response = await socket.emitWithAck("hello", "world");
     *
     * // with a specific timeout
     * try {
     *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
     * } catch (err) {
     *   // the server did not acknowledge the event in the given delay
     * }
     *
     * @return a Promise that will be fulfilled when the server acknowledges the event
     */
    emitWithAck(ev, ...args) {
        return new Promise((resolve, reject) => {
            const fn = (arg1, arg2) => {
                return arg1 ? reject(arg1) : resolve(arg2);
            };
            fn.withError = true;
            args.push(fn);
            this.emit(ev, ...args);
        });
    }
    /**
     * Add the packet to the queue.
     * @param args
     * @private
     */
    _addToQueue(args) {
        let ack;
        if (typeof args[args.length - 1] === "function") {
            ack = args.pop();
        }
        const packet = {
            id: this._queueSeq++,
            tryCount: 0,
            pending: false,
            args,
            flags: Object.assign({ fromQueue: true }, this.flags),
        };
        args.push((err, ...responseArgs) => {
            if (packet !== this._queue[0]) {
            }
            const hasError = err !== null;
            if (hasError) {
                if (packet.tryCount > this._opts.retries) {
                    this._queue.shift();
                    if (ack) {
                        ack(err);
                    }
                }
            }
            else {
                this._queue.shift();
                if (ack) {
                    ack(null, ...responseArgs);
                }
            }
            packet.pending = false;
            return this._drainQueue();
        });
        this._queue.push(packet);
        this._drainQueue();
    }
    /**
     * Send the first packet of the queue, and wait for an acknowledgement from the server.
     * @param force - whether to resend a packet that has not been acknowledged yet
     *
     * @private
     */
    _drainQueue(force = false) {
        if (!this.connected || this._queue.length === 0) {
            return;
        }
        const packet = this._queue[0];
        if (packet.pending && !force) {
            return;
        }
        packet.pending = true;
        packet.tryCount++;
        this.flags = packet.flags;
        this.emit.apply(this, packet.args);
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */
    packet(packet) {
        packet.nsp = this.nsp;
        this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */
    onopen() {
        if (typeof this.auth == "function") {
            this.auth((data) => {
                this._sendConnectPacket(data);
            });
        }
        else {
            this._sendConnectPacket(this.auth);
        }
    }
    /**
     * Sends a CONNECT packet to initiate the Socket.IO session.
     *
     * @param data
     * @private
     */
    _sendConnectPacket(data) {
        this.packet({
            type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT,
            data: this._pid
                ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data)
                : data,
        });
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */
    onerror(err) {
        if (!this.connected) {
            this.emitReserved("connect_error", err);
        }
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */
    onclose(reason, description) {
        this.connected = false;
        delete this.id;
        this.emitReserved("disconnect", reason, description);
        this._clearAcks();
    }
    /**
     * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
     * the server.
     *
     * @private
     */
    _clearAcks() {
        Object.keys(this.acks).forEach((id) => {
            const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
            if (!isBuffered) {
                // note: handlers that do not accept an error as first argument are ignored here
                const ack = this.acks[id];
                delete this.acks[id];
                if (ack.withError) {
                    ack.call(this, new Error("socket has been disconnected"));
                }
            }
        });
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */
    onpacket(packet) {
        const sameNamespace = packet.nsp === this.nsp;
        if (!sameNamespace)
            return;
        switch (packet.type) {
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT:
                if (packet.data && packet.data.sid) {
                    this.onconnect(packet.data.sid, packet.data.pid);
                }
                else {
                    this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                }
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.EVENT:
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.BINARY_EVENT:
                this.onevent(packet);
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.ACK:
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.BINARY_ACK:
                this.onack(packet);
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.DISCONNECT:
                this.ondisconnect();
                break;
            case socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.CONNECT_ERROR:
                this.destroy();
                const err = new Error(packet.data.message);
                // @ts-ignore
                err.data = packet.data.data;
                this.emitReserved("connect_error", err);
                break;
        }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */
    onevent(packet) {
        const args = packet.data || [];
        if (null != packet.id) {
            args.push(this.ack(packet.id));
        }
        if (this.connected) {
            this.emitEvent(args);
        }
        else {
            this.receiveBuffer.push(Object.freeze(args));
        }
    }
    emitEvent(args) {
        if (this._anyListeners && this._anyListeners.length) {
            const listeners = this._anyListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, args);
            }
        }
        super.emit.apply(this, args);
        if (this._pid && args.length && typeof args[args.length - 1] === "string") {
            this._lastOffset = args[args.length - 1];
        }
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */
    ack(id) {
        const self = this;
        let sent = false;
        return function (...args) {
            // prevent double callbacks
            if (sent)
                return;
            sent = true;
            self.packet({
                type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.ACK,
                id: id,
                data: args,
            });
        };
    }
    /**
     * Called upon a server acknowledgement.
     *
     * @param packet
     * @private
     */
    onack(packet) {
        const ack = this.acks[packet.id];
        if (typeof ack !== "function") {
            return;
        }
        delete this.acks[packet.id];
        // @ts-ignore FIXME ack is incorrectly inferred as 'never'
        if (ack.withError) {
            packet.data.unshift(null);
        }
        // @ts-ignore
        ack.apply(this, packet.data);
    }
    /**
     * Called upon server connect.
     *
     * @private
     */
    onconnect(id, pid) {
        this.id = id;
        this.recovered = pid && this._pid === pid;
        this._pid = pid; // defined only if connection state recovery is enabled
        this.connected = true;
        this.emitBuffered();
        this._drainQueue(true);
        this.emitReserved("connect");
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */
    emitBuffered() {
        this.receiveBuffer.forEach((args) => this.emitEvent(args));
        this.receiveBuffer = [];
        this.sendBuffer.forEach((packet) => {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        });
        this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */
    ondisconnect() {
        this.destroy();
        this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */
    destroy() {
        if (this.subs) {
            // clean subscriptions to avoid reconnections
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs = undefined;
        }
        this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
     *
     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
     *
     * @example
     * const socket = io();
     *
     * socket.on("disconnect", (reason) => {
     *   // console.log(reason); prints "io client disconnect"
     * });
     *
     * socket.disconnect();
     *
     * @return self
     */
    disconnect() {
        if (this.connected) {
            this.packet({ type: socket_io_parser__WEBPACK_IMPORTED_MODULE_0__.PacketType.DISCONNECT });
        }
        // remove socket from pool
        this.destroy();
        if (this.connected) {
            // fire events
            this.onclose("io client disconnect");
        }
        return this;
    }
    /**
     * Alias for {@link disconnect()}.
     *
     * @return self
     */
    close() {
        return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */
    compress(compress) {
        this.flags.compress = compress;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */
    get volatile() {
        this.flags.volatile = true;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */
    timeout(timeout) {
        this.flags.timeout = timeout;
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */
    onAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */
    prependAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */
    offAny(listener) {
        if (!this._anyListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAny() {
        return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    onAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    prependAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */
    offAnyOutgoing(listener) {
        if (!this._anyOutgoingListeners) {
            return this;
        }
        if (listener) {
            const listeners = this._anyOutgoingListeners;
            for (let i = 0; i < listeners.length; i++) {
                if (listener === listeners[i]) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        else {
            this._anyOutgoingListeners = [];
        }
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAnyOutgoing() {
        return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */
    notifyOutgoingListeners(packet) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
            const listeners = this._anyOutgoingListeners.slice();
            for (const listener of listeners) {
                listener.apply(this, packet.data);
            }
        }
    }
}


/***/ },

/***/ "./node_modules/socket.io-client/build/esm/url.js"
/*!********************************************************!*\
  !*** ./node_modules/socket.io-client/build/esm/url.js ***!
  \********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   url: () => (/* binding */ url)
/* harmony export */ });
/* harmony import */ var engine_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! engine.io-client */ "./node_modules/engine.io-client/build/esm/index.js");

/**
 * URL parser.
 *
 * @param uri - url
 * @param path - the request path of the connection
 * @param loc - An object meant to mimic window.location.
 *        Defaults to window.location.
 * @public
 */
function url(uri, path = "", loc) {
    let obj = uri;
    // default to window.location
    loc = loc || (typeof location !== "undefined" && location);
    if (null == uri)
        uri = loc.protocol + "//" + loc.host;
    // relative path support
    if (typeof uri === "string") {
        if ("/" === uri.charAt(0)) {
            if ("/" === uri.charAt(1)) {
                uri = loc.protocol + uri;
            }
            else {
                uri = loc.host + uri;
            }
        }
        if (!/^(https?|wss?):\/\//.test(uri)) {
            if ("undefined" !== typeof loc) {
                uri = loc.protocol + "//" + uri;
            }
            else {
                uri = "https://" + uri;
            }
        }
        // parse
        obj = (0,engine_io_client__WEBPACK_IMPORTED_MODULE_0__.parse)(uri);
    }
    // make sure we treat `localhost:80` and `localhost` equally
    if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
            obj.port = "80";
        }
        else if (/^(http|ws)s$/.test(obj.protocol)) {
            obj.port = "443";
        }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    // define unique id
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    // define href
    obj.href =
        obj.protocol +
            "://" +
            host +
            (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
}


/***/ },

/***/ "./node_modules/socket.io-parser/build/esm-debug/binary.js"
/*!*****************************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm-debug/binary.js ***!
  \*****************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deconstructPacket: () => (/* binding */ deconstructPacket),
/* harmony export */   reconstructPacket: () => (/* binding */ reconstructPacket)
/* harmony export */ });
/* harmony import */ var _is_binary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is-binary.js */ "./node_modules/socket.io-parser/build/esm-debug/is-binary.js");

/**
 * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @public
 */
function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return { packet: pack, buffers: buffers };
}
function _deconstructPacket(data, buffers) {
    if (!data)
        return data;
    if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_0__.isBinary)(data)) {
        const placeholder = { _placeholder: true, num: buffers.length };
        buffers.push(data);
        return placeholder;
    }
    else if (Array.isArray(data)) {
        const newData = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
    }
    else if (typeof data === "object" && !(data instanceof Date)) {
        const newData = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newData[key] = _deconstructPacket(data[key], buffers);
            }
        }
        return newData;
    }
    return data;
}
/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @public
 */
function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    delete packet.attachments; // no longer useful
    return packet;
}
function _reconstructPacket(data, buffers) {
    if (!data)
        return data;
    if (data && data._placeholder === true) {
        const isIndexValid = typeof data.num === "number" &&
            data.num >= 0 &&
            data.num < buffers.length;
        if (isIndexValid) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else {
            throw new Error("illegal attachments");
        }
    }
    else if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i], buffers);
        }
    }
    else if (typeof data === "object") {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                data[key] = _reconstructPacket(data[key], buffers);
            }
        }
    }
    return data;
}


/***/ },

/***/ "./node_modules/socket.io-parser/build/esm-debug/index.js"
/*!****************************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm-debug/index.js ***!
  \****************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Decoder: () => (/* binding */ Decoder),
/* harmony export */   Encoder: () => (/* binding */ Encoder),
/* harmony export */   PacketType: () => (/* binding */ PacketType),
/* harmony export */   isPacketValid: () => (/* binding */ isPacketValid),
/* harmony export */   protocol: () => (/* binding */ protocol)
/* harmony export */ });
/* harmony import */ var _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @socket.io/component-emitter */ "./node_modules/@socket.io/component-emitter/lib/esm/index.js");
/* harmony import */ var _binary_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./binary.js */ "./node_modules/socket.io-parser/build/esm-debug/binary.js");
/* harmony import */ var _is_binary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is-binary.js */ "./node_modules/socket.io-parser/build/esm-debug/is-binary.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "./node_modules/socket.io-parser/node_modules/debug/src/browser.js");



 // debug()
const debug = debug__WEBPACK_IMPORTED_MODULE_3__("socket.io-parser"); // debug()
/**
 * These strings must not be used as event names, as they have a special meaning.
 */
const RESERVED_EVENTS = [
    "connect", // used on the client side
    "connect_error", // used on the client side
    "disconnect", // used on both sides
    "disconnecting", // used on the server side
    "newListener", // used by the Node.js EventEmitter
    "removeListener", // used by the Node.js EventEmitter
];
/**
 * Protocol version.
 *
 * @public
 */
const protocol = 5;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
    PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType[PacketType["EVENT"] = 2] = "EVENT";
    PacketType[PacketType["ACK"] = 3] = "ACK";
    PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
/**
 * A socket.io Encoder instance
 */
class Encoder {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */
    constructor(replacer) {
        this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */
    encode(obj) {
        debug("encoding packet %j", obj);
        if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
            if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_2__.hasBinary)(obj)) {
                return this.encodeAsBinary({
                    type: obj.type === PacketType.EVENT
                        ? PacketType.BINARY_EVENT
                        : PacketType.BINARY_ACK,
                    nsp: obj.nsp,
                    data: obj.data,
                    id: obj.id,
                });
            }
        }
        return [this.encodeAsString(obj)];
    }
    /**
     * Encode packet as string.
     */
    encodeAsString(obj) {
        // first is type
        let str = "" + obj.type;
        // attachments if we have them
        if (obj.type === PacketType.BINARY_EVENT ||
            obj.type === PacketType.BINARY_ACK) {
            str += obj.attachments + "-";
        }
        // if we have a namespace other than `/`
        // we append it followed by a comma `,`
        if (obj.nsp && "/" !== obj.nsp) {
            str += obj.nsp + ",";
        }
        // immediately followed by the id
        if (null != obj.id) {
            str += obj.id;
        }
        // json data
        if (null != obj.data) {
            str += JSON.stringify(obj.data, this.replacer);
        }
        debug("encoded %j as %s", obj, str);
        return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */
    encodeAsBinary(obj) {
        const deconstruction = (0,_binary_js__WEBPACK_IMPORTED_MODULE_1__.deconstructPacket)(obj);
        const pack = this.encodeAsString(deconstruction.packet);
        const buffers = deconstruction.buffers;
        buffers.unshift(pack); // add packet info to beginning of data list
        return buffers; // write all the buffers
    }
}
/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 */
class Decoder extends _socket_io_component_emitter__WEBPACK_IMPORTED_MODULE_0__.Emitter {
    /**
     * Decoder constructor
     */
    constructor(opts) {
        super();
        this.opts = Object.assign({
            reviver: undefined,
            maxAttachments: 10,
        }, typeof opts === "function" ? { reviver: opts } : opts);
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */
    add(obj) {
        let packet;
        if (typeof obj === "string") {
            if (this.reconstructor) {
                throw new Error("got plaintext data when reconstructing a packet");
            }
            packet = this.decodeString(obj);
            const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
            if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
                packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
                // binary packet's json
                this.reconstructor = new BinaryReconstructor(packet);
                // no attachments, labeled binary but no binary data to follow
                if (packet.attachments === 0) {
                    super.emitReserved("decoded", packet);
                }
            }
            else {
                // non-binary full packet
                super.emitReserved("decoded", packet);
            }
        }
        else if ((0,_is_binary_js__WEBPACK_IMPORTED_MODULE_2__.isBinary)(obj) || obj.base64) {
            // raw binary data
            if (!this.reconstructor) {
                throw new Error("got binary data when not reconstructing a packet");
            }
            else {
                packet = this.reconstructor.takeBinaryData(obj);
                if (packet) {
                    // received final buffer
                    this.reconstructor = null;
                    super.emitReserved("decoded", packet);
                }
            }
        }
        else {
            throw new Error("Unknown type: " + obj);
        }
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */
    decodeString(str) {
        let i = 0;
        // look up type
        const p = {
            type: Number(str.charAt(0)),
        };
        if (PacketType[p.type] === undefined) {
            throw new Error("unknown packet type " + p.type);
        }
        // look up attachments if type binary
        if (p.type === PacketType.BINARY_EVENT ||
            p.type === PacketType.BINARY_ACK) {
            const start = i + 1;
            while (str.charAt(++i) !== "-" && i != str.length) { }
            const buf = str.substring(start, i);
            if (buf != Number(buf) || str.charAt(i) !== "-") {
                throw new Error("Illegal attachments");
            }
            const n = Number(buf);
            if (!isInteger(n) || n < 0) {
                throw new Error("Illegal attachments");
            }
            else if (n > this.opts.maxAttachments) {
                throw new Error("too many attachments");
            }
            p.attachments = n;
        }
        // look up namespace (if any)
        if ("/" === str.charAt(i + 1)) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if ("," === c)
                    break;
                if (i === str.length)
                    break;
            }
            p.nsp = str.substring(start, i);
        }
        else {
            p.nsp = "/";
        }
        // look up id
        const next = str.charAt(i + 1);
        if ("" !== next && Number(next) == next) {
            const start = i + 1;
            while (++i) {
                const c = str.charAt(i);
                if (null == c || Number(c) != c) {
                    --i;
                    break;
                }
                if (i === str.length)
                    break;
            }
            p.id = Number(str.substring(start, i + 1));
        }
        // look up json data
        if (str.charAt(++i)) {
            const payload = this.tryParse(str.substr(i));
            if (Decoder.isPayloadValid(p.type, payload)) {
                p.data = payload;
            }
            else {
                throw new Error("invalid payload");
            }
        }
        debug("decoded %s as %j", str, p);
        return p;
    }
    tryParse(str) {
        try {
            return JSON.parse(str, this.opts.reviver);
        }
        catch (e) {
            return false;
        }
    }
    static isPayloadValid(type, payload) {
        switch (type) {
            case PacketType.CONNECT:
                return isObject(payload);
            case PacketType.DISCONNECT:
                return payload === undefined;
            case PacketType.CONNECT_ERROR:
                return typeof payload === "string" || isObject(payload);
            case PacketType.EVENT:
            case PacketType.BINARY_EVENT:
                return (Array.isArray(payload) &&
                    (typeof payload[0] === "number" ||
                        (typeof payload[0] === "string" &&
                            RESERVED_EVENTS.indexOf(payload[0]) === -1)));
            case PacketType.ACK:
            case PacketType.BINARY_ACK:
                return Array.isArray(payload);
        }
    }
    /**
     * Deallocates a parser's resources
     */
    destroy() {
        if (this.reconstructor) {
            this.reconstructor.finishedReconstruction();
            this.reconstructor = null;
        }
    }
}
/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 */
class BinaryReconstructor {
    constructor(packet) {
        this.packet = packet;
        this.buffers = [];
        this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */
    takeBinaryData(binData) {
        this.buffers.push(binData);
        if (this.buffers.length === this.reconPack.attachments) {
            // done with buffer list
            const packet = (0,_binary_js__WEBPACK_IMPORTED_MODULE_1__.reconstructPacket)(this.reconPack, this.buffers);
            this.finishedReconstruction();
            return packet;
        }
        return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */
    finishedReconstruction() {
        this.reconPack = null;
        this.buffers = [];
    }
}
function isNamespaceValid(nsp) {
    return typeof nsp === "string";
}
// see https://caniuse.com/mdn-javascript_builtins_number_isinteger
const isInteger = Number.isInteger ||
    function (value) {
        return (typeof value === "number" &&
            isFinite(value) &&
            Math.floor(value) === value);
    };
function isAckIdValid(id) {
    return id === undefined || isInteger(id);
}
// see https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
function isObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}
function isDataValid(type, payload) {
    switch (type) {
        case PacketType.CONNECT:
            return payload === undefined || isObject(payload);
        case PacketType.DISCONNECT:
            return payload === undefined;
        case PacketType.EVENT:
            return (Array.isArray(payload) &&
                (typeof payload[0] === "number" ||
                    (typeof payload[0] === "string" &&
                        RESERVED_EVENTS.indexOf(payload[0]) === -1)));
        case PacketType.ACK:
            return Array.isArray(payload);
        case PacketType.CONNECT_ERROR:
            return typeof payload === "string" || isObject(payload);
        default:
            return false;
    }
}
function isPacketValid(packet) {
    return (isNamespaceValid(packet.nsp) &&
        isAckIdValid(packet.id) &&
        isDataValid(packet.type, packet.data));
}


/***/ },

/***/ "./node_modules/socket.io-parser/build/esm-debug/is-binary.js"
/*!********************************************************************!*\
  !*** ./node_modules/socket.io-parser/build/esm-debug/is-binary.js ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasBinary: () => (/* binding */ hasBinary),
/* harmony export */   isBinary: () => (/* binding */ isBinary)
/* harmony export */ });
const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const isView = (obj) => {
    return typeof ArrayBuffer.isView === "function"
        ? ArrayBuffer.isView(obj)
        : obj.buffer instanceof ArrayBuffer;
};
const toString = Object.prototype.toString;
const withNativeBlob = typeof Blob === "function" ||
    (typeof Blob !== "undefined" &&
        toString.call(Blob) === "[object BlobConstructor]");
const withNativeFile = typeof File === "function" ||
    (typeof File !== "undefined" &&
        toString.call(File) === "[object FileConstructor]");
/**
 * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
 *
 * @private
 */
function isBinary(obj) {
    return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
        (withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File));
}
function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    if (Array.isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) {
            if (hasBinary(obj[i])) {
                return true;
            }
        }
        return false;
    }
    if (isBinary(obj)) {
        return true;
    }
    if (obj.toJSON &&
        typeof obj.toJSON === "function" &&
        arguments.length === 1) {
        return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
            return true;
        }
    }
    return false;
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (globalThis.importScripts) scriptUrl = globalThis.location + "";
/******/ 		var document = globalThis.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = (typeof document !== 'undefined' && document.baseURI) || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!********************!*\
  !*** ./js/main.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game.js */ "./js/game.js");
/* harmony import */ var _audio_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audio.js */ "./js/audio.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets.js */ "./js/assets.js");




window.addEventListener('DOMContentLoaded', async () => {
  await (0,_assets_js__WEBPACK_IMPORTED_MODULE_2__.loadAssets)();
  const canvas = document.getElementById('game-canvas');
  const audio = new _audio_js__WEBPACK_IMPORTED_MODULE_1__.AudioManager();
  const game = new _game_js__WEBPACK_IMPORTED_MODULE_0__.Game(canvas, audio);
  const appShell = document.querySelector('.app-shell');
  const startButton = document.getElementById('start-button');
  const onlineButton = document.getElementById('settings-button');
  audio.attachButton(document.getElementById('audio-button'));

  const syncViewportVars = () => {
    const viewport = window.visualViewport;
    const width = viewport?.width || document.documentElement.clientWidth || window.innerWidth;
    const height = viewport?.height || document.documentElement.clientHeight || window.innerHeight;
    document.documentElement.style.setProperty('--app-width', `${Math.round(width)}px`);
    document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
  };

  const tryEnterFullscreen = async () => {
    if (!appShell || document.fullscreenElement || !appShell.requestFullscreen) return;
    try {
      await appShell.requestFullscreen({ navigationUI: 'hide' });
    } catch {}
  };

  syncViewportVars();
  window.addEventListener('resize', syncViewportVars);
  window.visualViewport?.addEventListener('resize', syncViewportVars);
  window.visualViewport?.addEventListener('scroll', syncViewportVars);
  startButton?.addEventListener('click', tryEnterFullscreen, { passive: true });
  onlineButton?.addEventListener('click', tryEnterFullscreen, { passive: true });

  const unlockAudio = async () => {
    await audio.ensureStarted();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('mousedown', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('mousedown', unlockAudio, { passive: true });

  const syncAudio = () => {
    audio.setScene(game.state);
    audio.tick();
    requestAnimationFrame(syncAudio);
  };

  game.start();
  syncAudio();
});

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map