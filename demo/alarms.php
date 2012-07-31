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
	<h1>jQuery Clock plugin - demonstration page - alarms</h1>
	<p>
	This page shows the alarms functionality of jQuery clock plugin.
	</p>
	<p>
	<a href="index.php">Back to main page</a>.
	</p>
</div>

<?php
// Set alarm for 2 minutes in the future
$minutes = intval(date('i')) + 2;
$alarmDate = date('d/m/Y H:') . ($minutes < 10 ? '0' : '') . $minutes . ':00';
?>

<div class="odd">
	<p>
	Server time based alarm clock...
	</p>
	<div class="clock" id="alarmclock"><?php echo date('d/m/Y H:i:s'); ?></div>
	<p>
	Alarm is set for <?php echo $alarmDate; ?>.
	</p>
</div>

<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="../jquery.clock/jquery.clock.js"></script>
<script type="text/javascript">
	$(function() {
		$('#alarmclock').clock({
			outputFormat: '%d/%m/%Y %H:%i:%s',
			dateParts: {
				timezoneOffset: '+0800'
			},
			alarms: [
				{
					time: '<?php echo $alarmDate; ?>',
					action: function() {
						alert('!!! This is your alarm !!!');
					}
				}
			]
		});
	});
</script>
</body>
</html>
