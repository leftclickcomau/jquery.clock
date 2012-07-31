<!doctype html>
<html>
<head>
	<title>Test page for jquery-clock plugin</title>
	<style type="text/css">
		html, body { margin: 0; padding: 0; }
		h1, h2, h3 { font-family: sans-serif; font-weight: normal; }
		h1, h2 { margin-top: 0; }
		.intro { padding: 1em; }
		.odd, .even { border-top: 2px solid #aaa; padding: 1em; }
		.odd { background-color: #ffe; }
		pre { display: inline-block; font-family: monospace; margin: 0; border: 1px solid #666; background-color: #eee; color: #666; padding: .5em; }
		.original-content { display: inline-block; margin: 0; border: 1px solid #666; background-color: #eee; color: #666; padding: .5em; }
		.clock { display: inline-block; font-size: xx-large; font-family: monospace; white-space: nowrap; border: 1px solid #000; background-color: #eee; padding: .5em; }
	</style>
</head>
<body>
<div class="intro">
	<h1>jQuery Clock plugin - demonstration page</h1>
	<p>
	Each of the sections below demonstrates a different aspect of the functionality of the clock plugin.
	Functionality from different sections can be combined.
	</p>
</div>

<div class="odd">
	<h2>Default behaviour with client time</h2>
	<p>
	If there is no server time provided, the plugin will use the local client time and timezone as the basis for the model.
	</p>
	<p>
	It will also use the browser's default date rendering behaviour.
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an empty element, in order to use the browser's time.
	</p>
	<h3>PHP Source</h3>
<pre>
&lt;div id="clock1"&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock1').clock();
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Your local time is currently...<br/>
	<div class="clock" id="clock1"></div>
</div>

<div class="even">
	<h2>Default behaviour with server timestamp and time zone</h2>
	<p>
	If the element that the plugin is called on contains text, and no options are given, then the text must exactly match a UNIX timestamp followed by the timezone.
	The time zone must be specified like "+HHMM" or "+HH:MM", not as a whole number or as a time zone name (e.g. "WST").
	</p>
	<p>
	Note that if the time zone is omitted, then the plugin will assume the server is in UTC (offset 0000), which is most likely not the case.
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an element with the following embedded content:
	</p>
	<div class="original-content">
		<?php echo date('UO'); ?>
	</div>
	<h3>PHP Source</h3>
<pre>
&lt;div id="clock2"&gt;&lt;?php echo date('UO'); ?&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock2').clock();
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Server time is currently...<br/>
	<div class="clock" id="clock2"><?php echo date('UO'); ?></div>
</div>

<div class="odd">
	<h2>Custom format with client time</h2>
	<p>
	An <code>outputFormat</code> can be specified to override the date format used for output.
	In this example, the element is empty, which means the time is being taken from the browser.
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an empty element, in order to use the browser's time:
	</p>
<pre>
&lt;div id="clock3"&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock3').clock({
		outputFormat: '%d/%m/%Y %H:%i:%s %O'
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Your local time is currently...<br/>
	<div class="clock" id="clock3"></div>
</div>

<div class="even">
	<h2>Custom format with server time</h2>
	<p>
	If an <code>outputFormat</code> is specified, and the element contains any text, then by default, the server time must be formatted according to the <code>outputFormat</code>.
	This uses custom parsing code, which avoids browser incompatibilities.
	</p>
	<p>
	Note that if the time zone is omitted, then the plugin will assume the server is in UTC (offset 0000), which is most likely not the case.
	Also note, the time zone must be specified like "HHMM" or "HH:MM", not as a whole number or as a time zone name (e.g. "WST").
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an element with the following embedded content:
	</p>
	<div class="original-content">
		<?php echo date('d/m/Y H:i:s O'); ?>
	</div>
	<h3>PHP Source</h3>
<pre>
&lt;div id="clock4"&gt;&lt;?php echo date('d/m/Y H:i:s O'); ?&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock4').clock({
		outputFormat: '%d/%m/%Y %H:%i:%s %O'
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Server time is currently...<br/>
	<div class="clock" id="clock4"><?php echo date('d/m/Y H:i:s O'); ?></div>
</div>

<div class="odd">
	<h2>Different input and output formats with server time</h2>
	<p>
	To accept a server generated, formatted time in one format, and display in a different format, you can use the <code>inputFormat</code> parameter in combination with the <code>outputFormat</code> parameter.
	When both are specified, the initial date is parsed according to <code>inputFormat</code>, and then the date is displayed using <code>outputFormat</code>.
	</p>
	<p>
	This might be useful to send the time zone information from the server, but hide it from the user (as in the example below).
	It might also be useful when the server output can't be controlled.
	</p>
	<p>
	Note: to accept input in a custom format, but force output in the browser's default format, set <code>outputFormat</code> to <code>'default'</code>, or to <code>'locale'</code> to use the locale-specific default settings.
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an element with the following embedded content:
	</p>
	<div class="original-content">
		<?php echo date('d/m/Y H:i:s O'); ?>
	</div>
	<h3>PHP Source</h3>
<pre>
&lt;div id="clock5"&gt;&lt;?php echo date('d/m/Y H:i:s O'); ?&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock5').clock({
		inputFormat: '%d/%m/%Y %H:%i:%s %O',
		outputFormat: '%d/%m/%Y %H:%i:%s'
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Server time is currently...<br/>
	<div class="clock" id="clock5"><?php echo date('d/m/Y H:i:s O'); ?></div>
</div>

<div class="even">
	<h2>Specifying time components through plugin options</h2>
	<p>
	The best case scenario is that the server-generated time and the time displayed by the plugin use the same format.
	However, in some cases, the output format might be missing some elements.
	For example, the server's time zone is required information, but it is not necessarily relevant to the user, or it might be displayed elsewhere using boilerplate.
	</p>
	<p>
	For this reason, it is possible to assign values to the various time components through the plugin options object.
	This example uses a date format that does not include the time zone specifier, and the time zone is set in options.
	</p>
	<h3>Original content</h3>
	<p>
	The plugin is called on an element with the following embedded content:
	</p>
	<div class="original-content">
		<?php echo date('d/m/Y H:i:s'); ?>
	</div>
	<h3>PHP Source</h3>
<pre>
&lt;div id="clock6"&gt;&lt;?php echo date('d/m/Y H:i:s'); ?&gt;&lt;/div&gt;
</pre>
	<h3>JavaScript call</h3>
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock6').clock({
		outputFormat: '%d/%m/%Y %H:%i:%s',
		dateParts: {
			timezoneOffset: '+0800'
		}
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
	<h3>Result</h3>
	Server time is currently...<br/>
	<div class="clock" id="clock6"><?php echo date('d/m/Y H:i:s'); ?></div>
</div>

<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="../jquery.clock/jquery.clock.js"></script>
<script type="text/javascript">
	$(function() {
		$('#clock1').clock();
		$('#clock2').clock();
		$('#clock3').clock();
		$('#clock4').clock({
			outputFormat: '%d/%m/%Y %H:%i:%s %O'
		});
		$('#clock5').clock({
			outputFormat: '%d/%m/%Y %H:%i:%s %O'
		});
		$('#clock6').clock({
			inputFormat: '%d/%m/%Y %H:%i:%s %O',
			outputFormat: '%d/%m/%Y %H:%i:%s'
		});
		$('#clock7').clock({
			outputFormat: '%d/%m/%Y %H:%i:%s',
			dateParts: {
				timezoneOffset: '+0800'
			}
		});
	});
</script>
</body>
</html>
