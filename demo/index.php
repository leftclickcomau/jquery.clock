<!doctype html>
<html>
<head>
	<title>Test page for jquery-clock plugin</title>
	<style type="text/css">
		.clock { display: inline-block; font-size: x-large; font-family: monospace; white-space: nowrap; }
		#clock2.clock { font-size: 1em; }
		.clock .date-part { color: red; }
		.clock .time-part { color: blue; }
		pre { margin: 0; }
		table#demonstrations { border-collapse: collapse; }
		table#demonstrations th, table#demonstrations td { vertical-align: top; border: 1px #666 solid; padding: 1em; }
		table#demonstrations th { background-color: #eee; }
		table#demonstrations td.explanation code { white-space: nowrap; }
		.popup { position: absolute; z-index: 100; background-color: #eee; border: 1px solid #000; padding: .5em; min-width: 300px; }
		.display-hover { cursor: pointer; }
	</style>
</head>
<body>
<h1>jQuery Clock plugin test page</h1>
<p>
The below timestamp is printed by PHP, and then updated by jQuery.
The timestamp can be printed as an integer representing milliseconds since epoch (i.e. <code>&lt;?php echo time(); ?&gt;</code>), or in any format that can be interpreted by <code>Date.parse()</code>.
</p>
<p>
If PHP doesn't print the timestamp, it will use the current local time from the browser.
</p>
<p>
If enabled, periodic calls are made to the PHP using AJAX, to ensure the timer is kept synchronised with the server.
</p>

<table id="demonstrations">
	<thead>
	<tr>
		<th class="demonstration">Demonstration</th>
		<th class="summary">Summary</th>
		<th class="explanation">Initial Content</th>
		<th class="explanation">AJAX Requests</th>
		<th class="explanation">Additional Settings</th>
		<th class="javascript">JavaScript</th>
	</tr>
	</thead>
	<tbody>
	<tr>
		<td class="demonstration"><div id="clock0" class="clock"></div></td>
		<td class="summary">Default behaviour, <strong>browser time only</strong>, no server time</td>
		<td class="explanation">Empty (use browser time)</td>
		<td class="explanation">None</td>
		<td class="explanation">None</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock0').clock();
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	<tr>
		<td class="demonstration"><div id="clock1" class="clock"><?php echo date('UO'); ?></div></td>
		<td class="summary">Default behaviour with initial server time and timezone</td>
		<td class="explanation">Timestamp from server:<br/><code><?php echo date('UO'); ?></code></td>
		<td class="explanation">None</td>
		<td class="explanation">None</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock1').clock();
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	<tr>
		<td class="demonstration"><div id="clock3" class="clock"><?php echo date('UP'); ?></div></td>
		<td class="summary">Custom formatting (HTML) with initial server time and timezone</td>
		<td class="explanation">Timestamp from server:<br/><code><?php echo date('UP'); ?></code></td>
		<td class="explanation">None</td>
		<td class="explanation"><code>outputFormat</code> demonstrating use of HTML markup in the output</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock3').clock({
		outputFormat: '<span class="date-part">%d-%m-%Y</span> <span class="time-part">%H:%i:%s</span>'
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	<tr>
		<td class="demonstration"><div id="clock5" class="clock"><?php echo date('UP'); ?></div></td>
		<td class="summary">Default behaviour with initial server timestamp and AJAX updates (also timestamps)</td>
		<td class="explanation">Timestamp from server:<br/><code><?php echo date('UP'); ?></code></td>
		<td class="explanation">Once per minute from <code>date.php</code> (returns a timestamp from server)</td>
		<td class="explanation">None</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock5').clock({
		ajaxInterval: 60000,
		ajaxUrl: 'date.php',
	});
});
<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	<tr>
		<td class="demonstration"><div id="clock8" class="clock"><?php echo date('d/m/Y H:i:s O'); ?></div></td>
		<td class="summary">Default behaviour with custom input/output format</td>
		<td class="explanation">Custom formatted time from server:<br/><code><?php echo date('d/m/Y H:i:s O'); ?></code></td>
		<td class="explanation">None</td>
		<td class="explanation">None</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock8').clock({
		outputFormat: '%d/%m/%Y %H:%i:%s %O'
	});
});
	<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	<tr>
		<td class="demonstration"><div id="clock9" class="clock"><?php echo date('d/m/Y H:i:s O'); ?></div></td>
		<td class="summary">Default behaviour with custom input/output format</td>
		<td class="explanation">Custom formatted time from server:<br/><code><?php echo date('d/m/Y H:i:s O'); ?></code></td>
		<td class="explanation">None</td>
		<td class="explanation">None</td>
		<td class="javascript">
<pre>
<?php ob_start(); ?>
$(function() {
	$('#clock9').clock({
		inputFormat: '%d/%m/%Y %H:%i:%s %O'
		outputFormat: '%d/%m/%Y %H:%i:%s'
	});
});
	<?php echo htmlentities(ob_get_clean()); ?>
</pre>
		</td>
	</tr>
	</tbody>
</table>

<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="../jquery.clock/jquery.clock.js"></script>
<script type="text/javascript">
	$(function() {
		$('#clock0').clock();
		$('#clock1').clock();
		$('#clock3').clock({
			outputFormat: '<span class="date-part">%d-%m-%Y</span> <span class="time-part">%H:%i:%s</span>'
		});
		$('#clock5').clock({
			ajaxInterval: 60000,
			ajaxUrl: 'date.php'
		});
		$('#clock8').clock({
			outputFormat: '%d/%m/%Y %H:%i:%s %O'
		});
		$('#clock9').clock({
			inputFormat: '%d/%m/%Y %H:%i:%s %O',
			outputFormat: '%d/%m/%Y %H:%i:%s'
		});

		$('td.javascript').each(function() {
			var $popup = $('<div></div>').addClass('popup').html($(this).html()).hide().appendTo($(document.body));
			$(this).html('Display').addClass('display-hover').hover(function(evt) {
				$popup.css({ top: evt.pageY + 'px', left: evt.pageX - $popup.width() + 'px' }).show();
			}, function() {
				$popup.hide();
			});
		});
	});
</script>
</body>
</html>
