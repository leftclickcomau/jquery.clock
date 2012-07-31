/**
 * jQuery Clock plugin
 * 
 * Dynamically updating client-side clock that can display either server or client time.
 *
 * The element on which the plugin is called must contain either a date which matches the dateFormat option, or
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
			 * Format mask for date output.
			 *
			 * This uses the same format string as used by the PHP date() function.  See
			 * http://php.net/manual/en/function.date.php for details.
			 *
			 * It may also be set to the string 'default' or null (the default value) to use the Date.toString()
			 * method, or to the string 'locale' to use the Date.toLocaleString() method, for formatting.
			 */
			outputFormat: null,

			/**
			 * Format mask for date input.
			 *
			 * The default behaviour (with value null), is to use the same format as is specified by outputFormat.
			 *
			 * If inputFormat is 'browser', or if inputFormat is null and outputFormat is either 'default' or 'locale',
			 * then the date input will be parsed by Date.parse(), unless it is a timestamp followed by a timezone
			 * offset (i.e., matches /^\d+[\+\-]\d\d:?\d\d$/).
			 *
			 * Note that Date.parse() has variable results across different browsers, although this can be fixed
			 * somewhat by adding date.js available from http://datejs.org/
			 */
			inputFormat: null,

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
			// Expand full format specifiers into their equivalent components
			expandAliases = function(format) {
				$.each(o.aliases, function(alias) {
					format = format.replace(alias.regex, alias.replacement);
				});
				return format;
			},
			// Date formatting functions.
			formatDate = function(date, format) {
				// Check for default behaviours
				if (!format || format.toString().length === 0 || format === 'default') {
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
				// Expand component format specifiers
				return expandAliases(format).replace(/%\w/g, function(token) {
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
			// Parse a date string, according to the given format, returning a UNIX timestamp (milliseconds since
			// epoch). The date string must exactly match the format string, otherwise an invalid Date is returned.
			parseDate = function(text, format) {
				// Check for default behaviours
				// TODO Support 'locale'
				if (!format || format.toString().length === 0 || format === 'browser') {
					return Date.parse(text);
				}
				var i, s,
					invalidDate = Date.parse(NaN),
					dateParts = {
						year: null,
						month: null,
						dayOfMonth: null,
						dayOfWeek: null, // Currently this is ignored, it is only included for validation
						hour: null,
						hour12: null,
						ampm: null,
						minute: 0,
						second: 0,
						timezoneOffset: 0 // Allow timezone to be omitted and assume GMT / UTC
					};
				format = expandAliases(format);

				while (format.match(/%\w/)) {
					var matchType, pattern, regex, array, abbr, part, adjustment = 0,
						match, matchIndex, matchLength,
						formatBefore = format.replace(/^(.*?)%\w.*$/, '$1'),
						token = format.replace(/.*?%(\w).*/, '$1');
					// Process the boilerplate up to the next token
					if (formatBefore.length > 0) {
						if (text.substring(0, formatBefore.length) !== formatBefore) {
							return invalidDate;
						}
						text = text.substring(formatBefore.length);
					}
					// Match the text to the specified token, returning an error immediately if there is not a match,
					// or updating the dateParts key-value array
					switch (token) {
						case 'd':
							matchType = 'regexParseInt';
							pattern = '\\d\\d?';
							part = 'dayOfMonth';
							break;
						case 'D':
							matchType = 'arrayIndex';
							array = 'dayNames';
							abbr = true;
							part = 'dayOfWeek';
							break;
						case 'j':
							matchType = 'regexParseInt';
							pattern = '[1-9]\\d?';
							part = 'dayOfMonth';
							break;
						case 'l':
							matchType = 'arrayIndex';
							array = 'dayNames';
							abbr = false;
							part = 'dayOfWeek';
							break;
						//case 'N': // Disabled because other correlating methods are not done
						case 'S':
							matchType = 'suffixIndex';
							part = 'dayOfMonth';
							break;
						case 'w':
							matchType = 'regexParseInt';
							pattern = '[0-6]';
							part = 'dayOfWeek';
							break;
						//case 'z': // TODO
						//case 'W': // TODO
						case 'F':
							matchType = 'regexParseInt';
							array = 'monthNames';
							abbr = false;
							part = 'month';
							break;
						case 'm':
							matchType = 'regexParseInt';
							pattern = '\\d\\d?';
							part = 'month';
							adjustment = -1;
							break;
						case 'M':
							matchType = 'arrayIndex';
							array = 'monthNames';
							abbr = true;
							part = 'month';
							break;
						case 'n':
							matchType = 'regexParseInt';
							pattern = '[1-9]\\d?';
							part = 'month';
							adjustment = -1;
							break;
						//case 't': // TODO
						//case 'L': // TODO
						//case 'o': // Disabled because other correlating methods are not done
						case 'Y':
							matchType = 'regexParseInt';
							pattern = '\\d\\d\\d\\d';
							part = 'year';
							break;
						case 'y':
							matchType = 'regexParseInt';
							pattern = '\\d\\d\\d\\d';
							part = 'year';
							adjustment = 2000; // TODO Allow dates in the 20th century?
							break;
						case 'a':
							matchType = 'ampm';
							part = 'ampm';
							break;
						case 'A':
							matchType = 'ampm';
							part = 'ampm';
							break;
						//case 'B': // wtf?!
						case 'g':
							matchType = 'regexParseInt';
							pattern = '[1-9]\\d';
							part = 'hour12';
							break;
						case 'G':
							matchType = 'regexParseInt';
							pattern = '[1-9]\\d';
							part = 'hour';
							break;
						case 'h':
							matchType = 'regexParseInt';
							pattern = '\\d\\d';
							part = 'hour12';
							break;
						case 'H':
							matchType = 'regexParseInt';
							pattern = '\\d\\d';
							part = 'hour';
							break;
						case 'i':
							matchType = 'regexParseInt';
							pattern = '\\d\\d';
							part = 'minute';
							break;
						case 's':
							matchType = 'regexParseInt';
							pattern = '\\d\\d';
							part = 'second';
							break;
						//case 'u': // TODO
						//case 'e': // TODO
						//case 'I': // TODO
						case 'O':
							matchType = 'timezone';
							break;
						//case 'P': // TODO
						//case 'T': // TODO
						//case 'Z': // TODO
						case 'U':
							matchType = 'regexParseInt';
							pattern = '\\d+';
							part = 'timestamp';
							break;
						default:
							if (text.substring(0, 1) === token) {
								text = text.substring(1);
							} else {
								return invalidDate;
							}
					}
					switch (matchType) {
						case 'regexParseInt':
							regex = new RegExp('^' + pattern);
							if ((match = regex.exec(text)) !== null) {
								dateParts[part] = parseInt(match[0], 10) + adjustment;
								text = text.replace(regex, '');
							} else {
								return invalidDate;
							}
							break;

						case 'arrayIndex':
							matchIndex = null;
							matchLength = 0;
							$.each(o[array][abbr ? 'abbr' : 'full'], function(i, s) {
								if (text.substring(s.length) === s) {
									matchIndex = i;
									matchLength = s.length;
								}
							});
							if (matchIndex !== null && matchLength > 0) {
								dateParts[part] = matchIndex + adjustment;
								text = text.substring(matchLength);
							} else {
								return invalidDate;
							}
							break;

						case 'suffixIndex':
							matchIndex = null;
							if (text.substring(0, o.ordinalSuffixes.common) !== o.ordinalSuffixes.common) {
								$.each(o.ordinalSuffixes.overrides, function(i, s) {
									if (text.substring(0, s.length) === s) {
										matchIndex = i;
										matchLength = s.length;
									}
								})
							}
							if (matchIndex !== null) {
								text = text.substring(matchLength);
							} else {
								return invalidDate;
							}
							break;

						case 'ampm':
							// TODO Match case.
							match = text.substring(0, 2);
							if (match.toUpperCase() === 'AM' || match.toLowerCase() === 'PM') {
								dateParts.ampm = (match.toUpperCase() === 'AM') ? 0 : 12;
								text = text.substring(match.length);
							} else {
								return invalidDate;
							}
							break;

						case 'timezone':
							match = text.replace(/^(\d\d:?\d\d)/, '$1');
							dateParts.timezoneOffset = (parseInt(match.substring(0, 3), 10) * 60 + parseInt(match.substring(match.length - 2), 10)) * 60;
							text = text.substring(match.length);
							break;
					}
					format = format.replace(/^.*?%\w/, '');
				}
				if (dateParts.hour12 !== null && dateParts.ampm !== null) {
					if (dateParts.hour !== null && dateParts.hour !== dateParts.hour12 + dateParts.ampm) {
						// Both 12 hour time and 24 hour time were given, and they don't match
						return invalidDate;
					} else {
						dateParts.hour = dateParts.hour12 + dateParts.ampm;
					}
				}
				if (dateParts.hour === null) {
					dateParts.hour = 0;
				}
				if (dateParts.year === null || dateParts.month === null || dateParts.dayOfMonth === null) {
					return invalidDate;
				}
				// TODO Range checking / strict dates
				// TODO milliseconds
				return new Date(dateParts.year, dateParts.month, dateParts.dayOfMonth, dateParts.hour, dateParts.minute, dateParts.second).getTime() - (dateParts.timezoneOffset + new Date().getTimezoneOffset() * 60) * 1000;
			},
			// Utility functions
			parseServerDate = function(text) {
				var serverTimezone, serverTime, localTime = getCurrentTimestamp();

				// Determine the UTC time
				serverTime = (text.length === 0) ?
					localTime :
					((text.match(/^\d+(?:[\+\-]\d{2}:?\d{2})?$/)) ?
						parseInt(text.replace(/[\+\-]\d{2}:?\d{2}$/, ''), 10) * 1000 :
						parseDate(text, o.inputFormat ? o.inputFormat : o.outputFormat));
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
