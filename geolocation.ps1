Add-Type -AssemblyName System.Device
 
$watcher = New-Object System.Device.Location.GeoCoordinateWatcher
$sourceId = "Location"
$job = Register-ObjectEvent -InputObject $watcher -EventName PositionChanged -SourceIdentifier $sourceId -Action{
	$loc=$event.SourceEventArgs.Position.Location;
	Write-Host (
		[string]$loc.Latitude+","+
		[string]$loc.Longitude+","+
		[string]$loc.Altitude+","+
		[string]$loc.HorizontalAccuracy+","+
		[string]$loc.VerticalAccuracy+","+
		[string]$loc.Course+","+
		[string]$loc.Speed
	)
}
$watcher.Start()
while(1){
	Start-Sleep -Seconds 1
}