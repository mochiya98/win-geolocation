const path = require("path");
const readline = require("readline");
const {spawn} = require("child_process");
const {EventEmitter} = require("events");

function Position(coords,timestamp){
	this.coords = coords;
	this.timestamp = timestamp;
}
function Coordinates(){}

class Geolocator extends EventEmitter
{
	constructor(){
		super();
		this.loc = null;
		this.loc_ts = 0;
		this._watchList = [null];
		this._watchIndex = 0;
		if(process.platform !== "win32"){
			throw "only for win32";
		}
		this._spawnPublisher();
	}
	_spawnPublisher(){
		this.cp=spawn("cmd", ["/c", "powershell -File " + path.join(__dirname, "geolocation.ps1")]);
		this.ri=readline.createInterface(this.cp.stdout);
		this.ri.on("line", line => {
			let [
				latitude,
				longitude,
				altitude,
				accuracy,
				altitudeAccuracy,
				heading,
				speed
			] = line.split(",").map(c => parseFloat(c)).map(c => isNaN(c)?null:c);
			this.loc = new Coordinates();
			this.loc_ts = Date.now();
			if(altitudeAccuracy === null) altitude = null;
			Object.defineProperty(this.loc, "latitude", {value: latitude, enumerable: true});
			Object.defineProperty(this.loc, "longitude", {value: longitude, enumerable: true});
			Object.defineProperty(this.loc, "altitude", {value: altitude, enumerable: true});
			Object.defineProperty(this.loc, "accuracy", {value: accuracy, enumerable: true});
			Object.defineProperty(this.loc, "altitudeAccuracy", {value: altitudeAccuracy, enumerable: true});
			Object.defineProperty(this.loc, "heading", {value: heading, enumerable: true});
			Object.defineProperty(this.loc, "speed", {value: speed, enumerable: true});
			//like WinNative(undocumented)
			//dummy-link
			Object.defineProperty(this.loc, "Coordinate", {value:this.loc});
			Object.defineProperty(this.loc, "Point", {value:this.loc});
			Object.defineProperty(this.loc, "Position", {value:this.loc});
			//position-properties
			Object.defineProperty(this.loc, "Latitude", {value: latitude});
			Object.defineProperty(this.loc, "Longitude", {value: longitude});
			Object.defineProperty(this.loc, "Altitude", {value: altitude});
			Object.defineProperty(this.loc, "HorizontalAccuracy", {value: accuracy});
			Object.defineProperty(this.loc, "VerticalAccuracy", {value: altitudeAccuracy});
			Object.defineProperty(this.loc, "Course", {value: heading});
			Object.defineProperty(this.loc, "Speed", {value: speed});
			this.emit("PositionChanged", {Position: {Location: this.loc, Timestamp: this.loc_ts}});
			this.emit("positionChanged", {Position: {Location: this.loc, Timestamp: this.loc_ts}});
			this.emit("data", this.loc, this.loc_ts);
		});
		this.cp.on("exit",()=>{
			this._spawnPublisher();
		});
	}
	GetGeopositionAsync(){
		if(this.loc){
			return Promise.resolve({
				Location:  this.loc,
				Timestamp: this.loc_ts
			});
		}
		return new Promise(resolve=>{
			this.once(
				"PositionChanged",
				({Position})=>resolve(Position)
			);
		});
	}
	getCurrentPosition(cb){
		this.GetGeopositionAsync().then(
			({Location: coords, Timestamp: timestamp}) => 
				cb(new Position(coords, timestamp))
		);
	}
	watchPosition(cb){
		let watchId = ++this._watchIndex;
		this.on("data",
			this._watchList[watchId] =
				(coords, timestamp) => cb(new Position(coords, timestamp))
		);
		return watchId;
	}
	clearWatch(watchId){
		if(this._watchList[watchId]){
			this.removeListener("data", this._watchList[watchId]);
			this._watchList[watchId] = null;
		}
	}
	dispose(){
		this.cp.removeAllListeners("exit");
		this.cp.kill();
	}
}

module.exports = {Geolocator};