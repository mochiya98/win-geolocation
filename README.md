# win-geolocation🗺
like "navigator.geolocation" in node.js.  
**alpha-release**  
> only for windows  
> --> System.Device.Location.GeoCoordinateWatcher  

## How to use
```js
const {Geolocator} = require("win-geolocation");

// use only one geolocator recommend.
// the watcher process already staying when construct.
const geolocation = new Geolocator();

// if you want :)
const navigator = {geolocation};

// get position once
geolocation.getCurrentPosition(pos=>{});

// watch position
let watchId = geolocation.watchPosition(pos => {
  console.log(pos.coords.latitude, pos.coords.longitude, pos.timestamp);
});

// stop watching position
geolocation.clearWatch(watchId);

// use this operation when you want to kill the watcher explicitly.
// (for powersave, etc.)
geolocation.dispose();
```
