/**
 * jQuery Clock plugin
 * 
 * Display a dynamically updating client-side clock.
 *
 * The element(s) on which the plugin is called must contain one of the following:
 *
 * 1. An RFC 2822 compliant date-time, e.g. 29-07-2012 18:07:44 +08:00
 * 2. A UNIX timestamp, i.e. number of seconds since the beginning of the year 1970, followed by a timezone offset,
 *    e.g. 1343630387+0800
 * 3. Nothing.  The client system's clock and timezone offset will be used for the time.
 *
 * The timezone specifier must be either like +HH:MM or like +HHMM, the plugin does not support timezone names such as
 * "WST" or "PDT".
 *
 * The difference between the server time embedded in the element's content, and the browser time, is stored and used
 * to keep the displayed time in synch with the server.  For example, if the client is determined to be 3h 2m 51s ahead
 * of the server, then the browser's time, minus 3h 2m 51s, will be displayed on the page at any given time.
 *
 * Optionally, the plugin can use AJAX to maintain synchronisation between the browser clock and the server clock. This
 * is useful for pages that are expected to remain loaded for long periods of time, or where client clock is not
 * expected to be stable.  Note that causing it too frequently will cause heavy load on the server.  The URL that is
 * given by the "ajaxUrl" option must return one of the valid date formats identified above, anything else will give
 * unexpected results (probably a lot of "NaN").
 *
 * Other options are explained in the definition of $.clock.defaults.
 *
 * (c) 2012 Leftclick.com.au
 * Licensed under the GNU General Public License (GPL).
 */

(function($) {
	$.clock = {
		/**
		 * Version of the clock plugin.
		 */
		version: '0.3',

		/**
		 * Default clock plugin options.
		 */
		defaults: {
			/**
			 * Number of milliseconds between display updates.  If you are not displaying seconds, then this can be set
			 * to a larger value.  To display the server time when the page was initially loaded only, parsed and
			 * formatted according to outputFormat, set this to false.
			 */
			updateInterval: 100,

			/**
			 * Number of milliseconds between AJAX calls to the URL given by ajaxUrl, which must also be set if this is
			 * non-false.  The default value of false means no AJAX updates are performed.  See main description for
			 * details.
			 */
			ajaxInterval: false,

			/**
			 * URL to retrieve the time updates from.  See main description details.
			 */
			ajaxUrl: false,

			/**
			 * Format mask for the date output.  This uses the same format string as used by the PHP date() function.
			 * See http://php.net/manual/en/function.date.php for details.
			 */
			outputFormat: 'default',

			/**
			 * Day names for formatting using the 'D' and 'L' format specifiers.  Override this if your language is not
			 * English, or to use a different abbreviation style.
			 */
			dayNames: {
				abbr: [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ],
				full: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
			},

			/**
			 * Month names for formatting using the 'F' and 'H' format specifiers.  Override this if your language is
			 * not English, or to use a different abbreviation style.
			 */
			monthNames: {
				abbr: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
				full: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
			},

			/**
			 * Ordinal suffixes for formatting using the 'S' format specifier.    Override this if your language is not
			 * English, or to use a different abbreviation style.
			 */
			ordinalSuffixes: {
				common: 'th',
				overrides: {
					'1': 'st',
					'2': 'nd',
					'3': 'rd',
					'21': 'st',
					'22': 'nd',
					'23': 'rd',
					'31': 'st'
				}
			},

			/**
			 * Format specifier aliases.  Each entry in this array specifies a shortcut that replaces the given regex
			 * with the given replacement.  This step happens before parsing the regular format specifiers, so the
			 * tokens in the replacement pattern are themselves replaced.
			 */
			aliases: [
				{
					regex: /%r/,
					replacement: '%D, %d %M %Y %H:%i:%s %O'
				}
			]
		}
	};

	$.fn.clock = function(options) {
		var self = $(this),
			o = $.extend(true, {}, $.clock.defaults, options),
			// Used to store the difference between local time and server time, to simplify calculations
			serverOffset, serverTimezoneOffset, localTimezoneOffset = new Date().getTimezoneOffset() * -60,
			// Get the current, local timestamp
			getCurrentTimestamp = function() {
				return $.isFunction(Date.now) ? Date.now() : new Date().getTime();
			},
			// Date formatting function.
			formatDate = function(date, format) {
				// If no format specified, or format is empty, just return the default textual representation
				if (!format || format.toString().length === 0) {
					return date.toString();
				}
				// Check for certain specific identifiers in the format
				if (format === 'default') {
					return date.toString();
				}
				if (format === 'locale') {
					return date.toLocaleString();
				}
				// Utility formatting functions
				var formatNumber = function(number, pad, plusSign) {
						return (pad && Math.abs(number) < 10) ? (number < 0 ? '-' : (plusSign ? '+' : '')) + '0' + Math.abs(number).toString() : number.toString();
					},
					formatDayName = function(date, abbr) {
						return o.dayNames[abbr ? 'abbr' : 'full'][date.getDay()];
					},
					formatDaySuffix = function(date) {
						var d = date.getDate().toString();
						return (o.ordinalSuffixes.overrides[d]) ? o.ordinalSuffixes.overrides[d] : o.ordinalSuffixes.common;
					},
					formatMonthName = function(date, abbr) {
						return o.monthNames[abbr ? 'abbr' : 'full'][date.getMonth() - 1];
					},
					formatAmPm = function(date) {
						return date.getHours() < 12 ? 'AM' : 'PM';
					},
					formatTimezoneOffset = function(offsetMinutes) {
						return formatNumber(offsetMinutes / 60, true, true) + formatNumber(offsetMinutes % 60, true);
					};
				// Expand full format specifiers into their equivalent components
				$.each(o.aliases, function(alias) {
					format = format.replace(alias.regex, alias.replacement);
				});
				// Expand component format specifiers
				return format.replace(/%\w/g, function(token) {
					token = token.substring(1);
					switch (token) {
						case 'd': return formatNumber(date.getDate(), true);
						case 'D': return formatDayName(date, true);
						case 'j': return formatNumber(date.getDate(), false);
						case 'l': return formatDayName(date, false);
						//case 'N': return date.getDay() + 1; // Disabled because other correlating methods are not done
						case 'S': return formatDaySuffix(date);
						case 'w': return date.getDay();
						//case 'z': return date.getDayOfYear(); // TODO
						//case 'W': return date.getWeekOfYear(); // TODO
						case 'F': return formatMonthName(date, false);
						case 'm': return formatNumber(date.getMonth() + 1, true);
						case 'M': return formatMonthName(date, true);
						case 'n': return formatNumber(date.getMonth() + 1, false);
						//case 't': return date.getDaysInMonth(); // TODO
						//case 'L': return date.isLeapYear() ? '1' : '0'; // TODO
						//case 'o': return date.getYear(); // Disabled because other correlating methods are not done
						case 'Y': return date.getFullYear();
						case 'y': return date.getFullYear().toString().substring(2,4);
						case 'a': return formatAmPm(date).toLowerCase();
						case 'A': return formatAmPm(date).toUpperCase();
						//case 'B': // wtf?!
						case 'g': return formatNumber((date.getHours() - 1) % 12 + 1, false);
						case 'G': return formatNumber(date.getHours(), false);
						case 'h': return formatNumber((date.getHours() - 1) % 12 + 1, true);
						case 'H': return formatNumber(date.getHours(), true);
						case 'i': return formatNumber(date.getMinutes(), true);
						case 's': return formatNumber(date.getSeconds(), true);
						//case 'u': return formatNumber(date.getMicroseconds(), true); // TODO
						//case 'e': // TODO
						//case 'I': // TODO
						case 'O': return formatTimezoneOffset(serverTimezoneOffset / 60);
						//case 'P': // TODO
						//case 'T': // TODO
						//case 'Z': // TODO
						case 'U': return date.getTime();
						default: return token;
					}
				});
			},
			// Utility functions
			parseServerDate = function(text) {
				var serverTimezone, serverTime, localTime = getCurrentTimestamp();

				// Determine the UTC time
				serverTime = (text.length === 0) ?
					localTime :
					((text.match(/^\d+(?:[\+\-]\d{2}:?\d{2})?$/)) ?
						parseInt(text.replace(/[\+\-]\d{2}:?\d{2}$/, ''), 10) * 1000 :
						new Date(text).getTime());
				serverOffset = localTime - serverTime;

				// Determine the timezone offset
				if (text.match(/[\+\-]\d{2}:?\d{2}$/)) {
					// Parse timezone offset from text.
					serverTimezone = text.replace(/^.*([\+\-]\d{2}:?\d{2})$/, '$1');
					serverTimezoneOffset = (parseInt(serverTimezone.substring(0, 3), 10) * 60 + parseInt(serverTimezone.substring(serverTimezone.length - 2), 10)) * 60;
				} else {
					// Use client-side timezone offset.
					serverTimezoneOffset = new Date().getTimezoneOffset() * -60;
				}
			},
			updateView = function() {
				var d = new Date();
				d.setTime(getCurrentTimestamp() - serverOffset + (serverTimezoneOffset - localTimezoneOffset) * 1000);
				self.html(formatDate(d, o.outputFormat));
			},
			updateModel = function() {
				$.get(o.ajaxUrl, null, function(result) {
					parseServerDate(result);
					updateView();
				});
			};
		// Bootstrap
		parseServerDate(self.text());
		updateView();
		if (o.updateInterval > 0) {
			setInterval(updateView, o.updateInterval);
		}
		if (o.ajaxInterval > 0 && o.ajaxUrl) {
			setInterval(updateModel, o.ajaxInterval);
		}
	}
}(jQuery));
