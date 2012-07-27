/**
 * jQuery Clock plugin
 * 
 * Display a dynamically updating client-side clock.
 * 
 * (c) 2012 Leftclick.com.au
 * Licensed under the GNU General Public License (GPL).
 */

(function($) {
	$.clock = {
		version: '0.1',
		defaults: {
			updateInterval: 100,
			ajaxInterval: false,
			ajaxUrl: false,
			outputFormat: '%Y-%m-%d %H:%i:%s',
			dayNames: {
				abbr: [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ],
				full: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
			},
			monthNames: {
				abbr: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
				full: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
			},
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
			aliases: [
				{
					regex: /%r/,
					replacement: '%D, %d %M %Y %H:%i:%s %O'
				}
			]
		}
	};

	$.fn.clock = function(o) {
		var self = this,
			options = $.extend(true, {}, $.clock.defaults, o),
			// Used to store the difference between local time and server time, to simplify calculations
			serverOffset = 0,
			// Parse the given text as a date object
			parseDate = function(text) {
				return (text.length === 0) ? Date.now() : (text.match(/^\d+$/) ? new Date(parseInt(text * 1000, 10)) : new Date(Date.parse(text)));
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
				var formatNumber = function(number, pad) {
						var s = number.toString();
						return pad ? ((s.length === 1) ? "0" + s : s) : s;
					},
					formatDayName = function(date, abbr) {
						return options.dayNames[abbr ? 'abbr' : 'full'][date.getDay()];
					},
					formatDaySuffix = function(date) {
						var d = date.getDate().toString();
						return (options.ordinalSuffixes.overrides[d]) ? options.ordinalSuffixes.overrides[d] : options.ordinalSuffixes.common;
					},
					formatMonthName = function(date, abbr) {
						return options.monthNames[abbr ? 'abbr' : 'full'][date.getMonth() - 1];
					},
					formatAmPm = function(date) {
						return date.getHours() < 12 ? 'AM' : 'PM';
					};
				// Expand full format specifiers into their equivalent components
				$.each(options.aliases, function(alias) {
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
						case 'g': return formatNumber(date.getHours() % 12, false);
						case 'G': return formatNumber(date.getHours(), false);
						case 'h': return formatNumber(date.getHours() % 12, true);
						case 'H': return formatNumber(date.getHours(), true);
						case 'i': return formatNumber(date.getMinutes(), true);
						case 's': return formatNumber(date.getSeconds(), true);
						//case 'u': return formatNumber(date.getMicroseconds(), true); // TODO
						//case 'e': // TODO
						//case 'I': // TODO
						case 'O': return date.getTimezoneOffset()
						//case 'P': // TODO
						//case 'T': // TODO
						//case 'Z': // TODO
						default: return token;
					}
				});
			},
			// Utility functions
			calculateServerOffset = function(serverDate) {
				var localDate = Date.now();
				return localDate - serverDate.getTime();
			},
			updateView = function() {
				var d = new Date();
				d.setTime(Date.now() + serverOffset);
				self.html(formatDate(d, options.outputFormat));
			},
			updateModel = function() {
				$.get(options.ajaxUrl, null, function(timestamp) {
					serverOffset = calculateServerOffset(parseDate(timestamp.trim()));
					updateView();
				});
			};
		// Bootstrap
		serverOffset = (self.text().trim().length > 0) ? calculateServerOffset(parseDate(self.text().trim())) : 0;
		updateView();
		if (options.updateInterval > 0) {
			setInterval(updateView, options.updateInterval);
		}
		if (options.ajaxInterval > 0 && options.ajaxUrl) {
			setInterval(updateModel, options.ajaxInterval);
		}
	}
}(jQuery));
