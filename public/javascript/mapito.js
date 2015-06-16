var googleLoaded = false, bingLoaded = false;

(function() {
	var docWrite = document.write;
	document.write = function(text) {
		var res = /^<script[^>]*src="([^"]*)"[^>]*><\/script>$/.exec(text);
		if (res) {
			// alert("Adding script " + res[1]);
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement("script");
			script.src = res[1];
			head.appendChild(script);
		} else {
			docWrite(text);
		}
	}
})();

function Mapito(type) {
	this._type = type;
	this._options = {
		center: {
			lat: 38,
			lon: 40
		},
		zoom: 10,
		scrollZoom: true,
		mousePan: true,
		dbclickZoom: true,
		panControl: false,
		panControlOptions: {
			position: "TOP_LEFT"
		},
		zoomControl: false,
		zoomControlOptions: {
			style: "DEFAULT",
			position: "RIGHT_CENTER"
		},
		mapTypeControl: false,
		mapTypeControlOptions: {
			style: "DEFAULT",
			position: "TOP_RIGHT"
		}
	};
	this._obj = null;
	this._id = "";

}

Mapito.prototype = {

	initialize : function(id, options) {
		this._id = id;

		for (x in options) {
			this._options[x] = options[x];
		}


		if (this._type == "google") {
			var mapOptions = {
				center : {
					lat : parseFloat(this._options.center.lat),
					lng : parseFloat(this._options.center.lon)
				},
				zoom : this._options.zoom,
				panControl: this._options.panControl,
				panControlOptions: {
					position: google.maps.ControlPosition[this._options.panControlOptions.position]
				},
				zoomControl: this._options.zoomControl,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle[this._options.zoomControlOptions.style],
					position: google.maps.ControlPosition[this._options.zoomControlOptions.position]
				},
				mapTypeControl: this._options.mapTypeControl,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle[this._options.mapTypeControlOptions.style],
					position: google.maps.ControlPosition[this._options.mapTypeControlOptions.position]
				},
				scrollwheel: this._options.scrollZoom,
				draggable: this._options.mousePan,
				disableDoubleClickZoom: !this._options.dbclickZoom,
				scaleControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				disableDefaultUI: true
			};


			this._obj = new google.maps.Map(document.getElementById(id), mapOptions);

		} else if (this._type == "bing") {

			var mapOptions = {
					credentials: "AkmBpeqO4CzaED6qjZNRnvJ4BICit5e54ZHuuAW-uZkfQ36-hpjaEN6XRgLf2MtQ",
					center: new Microsoft.Maps.Location(parseFloat(this._options.center.lat), parseFloat(this._options.center.lon)),
					zoom: this._options.zoom,
					showDashboard: true,
					customizeOverlays: true,
					showScalebar: false,
					disablePanning: !this._options.mousePan,
					disableZooming: false,
					enableSearchLogo: false,
					showMapTypeSelector: true
			}

			var self = this;

			self._obj = new Microsoft.Maps.Map(document.getElementById(id), mapOptions);
			Microsoft.Maps.Events.addHandler(self._obj, 'dblclick', function(e) {
				e.handled = !self._options.dbclickZoom;
			});
			Microsoft.Maps.Events.addHandler(self._obj, 'mousewheel', function(e) {
				e.handled = !self.getOptions().scrollZoom;
			});

			var zoomControl = 'none', panControl = 'none', mapType = 'none';
			if (self._options.zoomControl) {
				zoomControl = 'inline'
			}
			if (self._options.panControl) {
				panControl = 'inline'
			}
			if (self._options.mapTypeControl) {
				mapType = 'inline'
			}
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '#' + id + ' .NavBar_modeSelectorControlContainer { display: ' + mapType + '; } #' + id + ' .NavBar_zoomControlContainer { display: ' + zoomControl + '; } #' + id + ' .NavBar_compassControlContainer { display: ' + panControl + '; }';
			document.getElementsByTagName('head')[0].appendChild(style);

		}
	},

	getType : function() {
		return this._type;
	},

	getMap : function() {
		return this._obj;
	},

	getOptions : function () {
		return this._options;
	},

    getZoom : function () {
    	if (this._type == "google") {
    		return this._obj.getZoom();
    	} else if (this._type == "bing") {
    		return this._obj.getZoom();
    	}
    },

    getCenter : function () {
    	if (this._type == "google") {
    		return { lat: this._obj.getCenter().lat(), lon: this._obj.getCenter().lng() };
    	} else if (this._type == "bing") {
    		var latlon = this._obj.getCenter();
    		return { lat: latlon.latitude, lon: latlon.longitude }
    	}
    },

    setZoom : function(zoom) {
    	if (this._type == "google") {
    		this._obj.setZoom(parseInt(zoom));
    	} else if (this._type == "bing") {
    		this._obj.setView({ zoom : parseInt(zoom) });
    	}
    },

    setCenter : function(lat, lon) {

    	if (this._type == "google") {
    		this._obj.setCenter(new google.maps.LatLng(parseFloat(lat), parseFloat(lon)));
    	} else if (this._type == "bing") {
			this._obj.setView({ center: new Microsoft.Maps.Location(parseFloat(lat), parseFloat(lon)) });
    	}
    },

    setAccurateCenter : function(method) {
    	var self = this;
    	if (method.toLowerCase() == "ip-based") {
	    	getJSON("https://freegeoip.net/json/", function(data) {
	    		self.setCenter(data.latitude, data.longitude);
			});
    	} else if (method.toLowerCase() == "geolocation") {
    		getJSON("https://freegeoip.net/json/", function(data) {
	    		self.setCenter(data.latitude, data.longitude);
			});
	    	if (navigator.geolocation) {
	            navigator.geolocation.getCurrentPosition(function (position) {
	            	self.setCenter(position.coords.latitude, position.coords.longitude);
	            });
	        } else {
	            alert("Geolocation is not supported by this browser.");
	        }
    	}
    	else throw "setAccurateCenter method: Invalid Argument";
    },

    setOptions : function (options) {
    	for (x in options) {
    		this._options[x] = options[x];
    	}

    	if (this._type == "google") {
    		this._obj.setOptions({
				panControl: this._options.panControl,
				panControlOptions: {
					position: google.maps.ControlPosition[this._options.panControlOptions.position]
				},
				zoomControl: this._options.zoomControl,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle[this._options.zoomControlOptions.style],
					position: google.maps.ControlPosition[this._options.zoomControlOptions.position]
				},
				mapTypeControl: this._options.mapTypeControl,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle[this._options.mapTypeControlOptions.style],
					position: google.maps.ControlPosition[this._options.mapTypeControlOptions.position]
				},
				scrollwheel: this._options.scrollZoom,
				draggable: this._options.mousePan,
				disableDoubleClickZoom: !this._options.dbclickZoom
    		});

    		if (options.hasOwnProperty("center")) {
    			this._obj.setOptions({
    				center : {
    					lat : parseFloat(options.center.lat),
    					lng : parseFloat(options.center.lon)
    				}
    			});
    		}

    		if (options.hasOwnProperty("zoom")) {
    			this._obj.setOptions({
    				zoom : options.zoom
    			});
    		}
    	} else if (this._type == "bing") {

    		this._obj.setView({
    			disablePanning: !this._options.mousePan
    		});

    		if (options.hasOwnProperty("zoomControl")) {
    			if(options.zoomControl) {
    				document.querySelector('#' + this._id + ' .NavBar_zoomControlContainer').style.display = "inline";
    			} else {
    				document.querySelector('#' + this._id + ' .NavBar_zoomControlContainer').style.display = "none";
    			}
    		}

    		if (options.hasOwnProperty("panControl")) {
    			if (options.panControl) {
    				document.querySelector('#' + this._id + ' .NavBar_compassControlContainer').style.display = "inline";
    			} else {
    				document.querySelector('#' + this._id + ' .NavBar_compassControlContainer').style.display = "none";
    			}
    		}

    		if (options.hasOwnProperty("mapTypeControl")) {
    			if (options.mapTypeControl == true) {
    				document.querySelector('#' + this._id + ' .NavBar_modeSelectorControlContainer').style.display = "inline";
    			} else {
    				document.querySelector('#' + this._id + ' .NavBar_modeSelectorControlContainer').style.display = "none";
    			}
    		}

    		if (options.hasOwnProperty("center")) {
    			this._obj.setView({
    				center: new Microsoft.Maps.Location(parseFloat(options.center.lat), parseFloat(options.center.lon))
    			});
    		}

    		if (options.hasOwnProperty("zoom")) {
    			this._obj.setView({
    				zoom: options.zoom
    			});
    		}
    	}

    },

    pushControl: function(obj, pos) {

		var div = document.createElement('div');

		div.style.padding = '5px';

		div.appendChild(obj);

		obj.index = 1;

    	if (this._type == "google") {
    		var btnPos = google.maps.ControlPosition[pos];
    		this._obj.controls[btnPos].push(div);
    	} else if(this._type == "bing") {

    		var positionElem = position(this._id, pos, div)

    		positionElem.appendChild(div);
    	}

    	return div;
    },

    removeControl: function(elem) {
    	if (typeof elem != 'undefined' && elem.parentNode != null) {
    		elem.parentNode.removeChild(elem);
    	}
    },

    getWidth: function() {
    	return document.getElementById(this._id).offsetWidth;
    },

    getHeight: function() {
    	return document.getElementById(this._id).offsetHeight;
    },

    panBy: function(x,y) {
    	if (this._type == "google") {
    		this._obj.panBy(x, y)
		} else if (this._type == "bing") {
			var centerInPixels = this._obj.tryLocationToPixel(this._obj.getCenter(), Microsoft.Maps.PixelReference.control)

			var newCenter = new Microsoft.Maps.Point(
					centerInPixels.x + x,
					centerInPixels.y + y,
					Microsoft.Maps.PixelReference.control );

            var newCenterLocation = this._obj.tryPixelToLocation(newCenter, Microsoft.Maps.PixelReference.control);

            if (newCenterLocation != null) {
            	this._obj.setView({center:new Microsoft.Maps.Location(newCenterLocation.latitude, newCenterLocation.longitude)});
            }
		}
    },

    addListener : function(elem, event, f) {
		if (this._type == "google") {
			google.maps.event.addDomListener(elem, event, f);
		} else if (this._type == "bing") {
			if (typeof elem.tagName != 'undefined' && elem.tagName.toLowerCase() == 'div') {
				elem.addEventListener(event, f);
			} else {
				Microsoft.Maps.Events.addHandler(elem, event,f);
			}
		}
    },

    viewChange : function(f) {
    	if (this._type == "google") {
			google.maps.event.addDomListener(this._obj, 'bounds_changed', f);
		} else if (this._type == "bing") {
			Microsoft.Maps.Events.addHandler(this._obj, 'viewchange', f);
		}
    }
};

function MapitoLine(coords, map, options) {

	this._options = options;
	var pathCoordinates = new Array();

	if (map.getType() == "google") {

		for(i=0;i<coords.length;i++) {
			pathCoordinates.push(new google.maps.LatLng(coords[i].lat, coords[i].lon))
		}

		var path = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: options.strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: options.strokeWeight
          });

 		path.setMap(map.getMap());

	} else if (map.getType() == "bing") {

		var pathCoordinates;

		for(i=0;i<coords.length;i++) {
			pathCoordinates.push(new Microsoft.Maps.Location(coords[i].lat, coords[i].lon))
		}

		var polyline = new Microsoft.Maps.Polyline(pathCoordinates, {
			strokeColor: new Microsoft.Maps.Color.fromHex(options.strokeColor),
			strokeThickness: options.strokeWeight
		});

		var bmap = map.getMap();

		bmap.entities.push(polyline);
	}
}

MapitoLine.prototype.remove = function() {

}

/* MAPITO MARKER */
function MapitoMarker(pos, map, options) {
	this._pos = pos;
	this._map = map;
	this._options = options;

	var marker;

	if (map.getType() == "google") {
		var mopt = {
				position: new google.maps.LatLng(pos.lat, pos.lon),
				map: map.getMap()
			};
		if (typeof options != "undefined" && options.hasOwnProperty("icon"))
			mopt.icon = options.icon
		marker = new google.maps.Marker(mopt);
	} else if (map.getType() == "bing") {
		var mopt = new Object();
		if (this._options.hasOwnProperty('icon'))
			mopt.icon = options.icon

		marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(pos.lat, pos.lon), mopt);
		var bmap = map.getMap();
		bmap.entities.push(marker);
	}

	this._obj = marker;
}

MapitoMarker.prototype.remove = function() {
	if (this._map.getType() == "google") {
		this._obj.setMap(null);
	} else if (this._map.getType() == "bing") {
		var bmap = this._map.getMap();
		bmap.entities.remove(this._obj);
	}
};

MapitoMarker.prototype.draggable = function(truefalse) {
	if (this._map.getType() == "google") {
		this._obj.setDraggable(truefalse);
	} else if (this._map.getType() == "bing") {
		this._obj.setOptions({draggable: truefalse});;
	}
};

MapitoMarker.prototype.getCenter = function() {
	if (this._map.getType() == "google") {
		return { lat: this._obj.getPosition().lat(), lon: this._obj.getPosition().lng() };
	} else if (this._map.getType() == "bing") {
		return { lat: this._obj.getLocation().latitude, lon: this._obj.getLocation().longitude };
	}
};

MapitoMarker.prototype.setPosition = function(pos) {
	this._pos = {lat: parseFloat(pos.lat), lon: parseFloat(pos.lon)};
	if (this._map.getType() == "google") {
		this._obj.setPosition(new google.maps.LatLng(parseFloat(pos.lat), parseFloat(pos.lon)));
	} else if (this._map.getType() == "bing") {
		this._obj.setLocation(new Microsoft.Maps.Location(parseFloat(pos.lat), parseFloat(pos.lon)));
	}
};

MapitoMarker.prototype.setOptions = function(options) {

	this._options = options;

	if (this._map.getType() == "google") {
		this._obj.setOptions(this._options)
	} else if (this._map.getType() == "bing") {
		this._obj.setOptions(this._options)
	}
};

MapitoMarker.prototype.getPosition = function() {
	return this._pos;
};

MapitoMarker.prototype.getObj = function() {
	return this._obj;
};

MapitoMarker.prototype.getOptions = function() {
	return this._options;
};

/* MAPITO CIRCLE */
function MapitoCircle(pos, map, options) {
	this._pos = pos;
	this._map = map;
	this._options = options;

	if (map.getType() == "google") {
		var gmap = map.getMap();
		this._obj = new google.maps.Circle({
			map: gmap,
			center:  new google.maps.LatLng(pos.lat, pos.lon)
		});
		this.setOptions(options);
	} else if (map.getType() == "bing") {

	    var color = Microsoft.Maps.Color.fromHex(options.fillColor);
	    var strokecolor = Microsoft.Maps.Color.fromHex(options.strokeColor);

	    this._obj = new Microsoft.Maps.Polygon(circleLocs(pos, options.radius), {
			fillColor: new Microsoft.Maps.Color(parseFloat(options.fillOpacity) * 255, color.r, color.g,color.b),
			strokeColor: new Microsoft.Maps.Color(parseFloat(options.strokeOpacity) * 255, strokecolor.r, strokecolor.g, strokecolor.b),
			strokeThickness: parseInt(options.strokeWeight)
	    });

	    var bmap = map.getMap();
		bmap.entities.push(this._obj);
	}

}

MapitoCircle.prototype.remove = function() {
	if (this._map.getType() == "google") {
		this._obj.setMap(null);
	} else if (this._map.getType() == "bing") {
		var bmap = this._map.getMap();
		bmap.entities.remove(this._obj);
	}
};

MapitoCircle.prototype.setOptions = function(options) {

	this._options.strokeColor = options.strokeColor;
	this._options.strokeOpacity = parseFloat(options.strokeOpacity);
	this._options.strokeWeight = parseInt(options.strokeWeight);
	this._options.fillColor = options.fillColor;
	this._options.fillOpacity = parseFloat(options.fillOpacity);
	this._options.radius = parseInt(options.radius)

	if (this._map.getType() == "google") {
		this._obj.setOptions(this._options)
	} else if (this._map.getType() == "bing") {
		var color = Microsoft.Maps.Color.fromHex(this._options.fillColor);
	    var strokecolor = Microsoft.Maps.Color.fromHex(this._options.strokeColor);

	    this._obj.setOptions({
			fillColor: new Microsoft.Maps.Color(this._options.fillOpacity * 255, color.r, color.g,color.b),
			strokeColor: new Microsoft.Maps.Color(this._options.strokeOpacity * 255, strokecolor.r, strokecolor.g, strokecolor.b),
			strokeThickness: this._options.strokeWeight
	    });

	    this._obj.setLocations(circleLocs(this._pos,this._options.radius));
	}
};

MapitoCircle.prototype.getCenter = function() {
	if (this._map.getType() == "google") {
		return { lat: this._obj.getCenter().lat(), lon: this._obj.getCenter().lng() };
	} else if (this._map.getType() == "bing") {
		return this._pos;
	}
};

MapitoCircle.prototype.setPosition = function(pos) {
	this._pos = {lat: parseFloat(pos.lat), lon: parseFloat(pos.lon)};
	if (this._map.getType() == "google") {
		this._obj.setOptions({center: new google.maps.LatLng(parseFloat(pos.lat), parseFloat(pos.lon))});
	} else if (this._map.getType() == "bing") {
		this._obj.setLocations(circleLocs(pos,this._options.radius));
	}
};

MapitoCircle.prototype.getOptions = function() {
	return this._options;
};

MapitoCircle.prototype.getPosition = function() {
	return this._pos;
};

MapitoCircle.prototype.getObj = function() {
	return this._obj;
};

MapitoCircle.prototype.getCenter = function() {
	if (this._map.getType() == "google") {
		return { lat: this._obj.getCenter().lat(), lon: this._obj.getCenter().lng() };
	} else if (this._map.getType() == "bing") {
		return this._pos;
	}
};

MapitoCircle.prototype.getRadius = function() {
	if (this._map.getType() == "google") {
		return this._obj.getRadius();
	} else if (this._map.getType() == "bing") {
		this._obj.setOptions({draggable: truefalse});;
	}
};

MapitoCircle.prototype.draggable = function(truefalse) {
	if (this._map.getType() == "google") {
		this._obj.setDraggable(truefalse);
	} else if (this._map.getType() == "bing") {
		this._obj.setOptions({draggable: truefalse});;
	}
};

MapitoCircle.prototype.editable = function(truefalse) {
	if (this._map.getType() == "google") {
		this._obj.setEditable(truefalse);
	} else if (this._map.getType() == "bing") {
		// unimplemented
	}
};


function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};


function position(mapId, pos, obj) {

	var mapDiv = document.getElementById(mapId);

	var positionDiv = document.getElementById(mapId + pos);

	if (pos.lastIndexOf("BOTTOM", 0) === 0 || pos.lastIndexOf("TOP", 0) === 0) {
		obj.style.float = 'right';
	}

	if (positionDiv == null) {

		positionDiv = document.createElement('div');
		positionDiv.id = mapId + pos;
		positionDiv.style.position = 'absolute';
		positionDiv.style.zIndex = 10;

		mapDiv.appendChild(positionDiv);

		if (pos == "BOTTOM_CENTER") {
			positionDiv.style.bottom = "10px";
			positionDiv.style.left = "50%";
			positionDiv.style.transform = "translateX(-50%)";
			positionDiv.style.webkitTransform = "translateX(-50%)";
			positionDiv.style.msTransform = "translateX(-50%)";
		} else if ((pos == "BOTTOM_LEFT")) {
			//obj.style.top = "px";
			//obj.style.right = "px";
			positionDiv.style.bottom = "10px";
			positionDiv.style.left = "5px";
		} else if ((pos == "BOTTOM_RIGHT")) {
			//obj.style.top = "px";
			positionDiv.style.right = "5px";
			positionDiv.style.bottom = "10px";
			//obj.style.left = "px";
		} else if ((pos == "LEFT_BOTTOM")) {
			//obj.style.top = "px";
			//obj.style.right = "px";
			positionDiv.style.bottom = "10px";
			positionDiv.style.left = "5px";
		} else if ((pos == "LEFT_CENTER")) {
			positionDiv.style.top = "50%";
			positionDiv.style.left = "5px";
			positionDiv.style.transform = "translateY(-50%)";
			positionDiv.style.webkitTransform = "translateY(-50%)";
			positionDiv.style.msTransform = "translateY(-50%)";
		} else if ((pos == "LEFT_TOP")) {
			positionDiv.style.top = "5px";
			//obj.style.right = "px";
			//obj.style.bottom = "px";
			positionDiv.style.left = "5px";
		} else if ((pos == "RIGHT_BOTTOM")) {
			//obj.style.top = "px";
			positionDiv.style.right = "5px";
			positionDiv.style.bottom = "10px";
			//obj.style.left = "px";
		} else if ((pos == "RIGHT_CENTER")) {
			positionDiv.style.top = "50%";
			positionDiv.style.right = "5px";
			positionDiv.style.transform = "translateY(-50%)";
			positionDiv.style.webkitTransform = "translateY(-50%)";
			positionDiv.style.msTransform = "translateY(-50%)";
		} else if ((pos == "RIGHT_TOP")) {
			positionDiv.style.top = "5px";
			positionDiv.style.right = "5px";
			//obj.style.bottom = "px";
			//obj.style.left = "px";
		} else if ((pos == "TOP_CENTER")) {
			positionDiv.style.top = "5px";
			positionDiv.style.left = "50%";
			positionDiv.style.transform = "translateX(-50%)";
			positionDiv.style.webkitTransform = "translateX(-50%)";
			positionDiv.style.msTransform = "translateX(-50%)";
		} else if ((pos == "TOP_LEFT")) {
			positionDiv.style.top = "5px";
			//obj.style.right = "px";
			//obj.style.bottom = "px";
			positionDiv.style.left = "5px";
		} else if ((pos == "TOP_RIGHT")) {
			positionDiv.style.top = "5px";
			positionDiv.style.right = "5px";
			//obj.style.bottom = "px";
			//obj.style.left = "px";
		}
	}

	return positionDiv;
}

function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function circleLocs(pos, radius) {
	var latin = pos.lat, lonin= pos.lon;

	var locs = new Array();

    var lat1 = latin * Math.PI / 180.0;
    var lon1 = lonin * Math.PI / 180.0;
    var d = radius / 6371000;
    var x;
    for (x = 0; x <= 360; x+=10) {
        var tc = (x / 90) * Math.PI / 2;
        var lat = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc));
        lat = 180.0 * lat / Math.PI;
        var lon;
        if (Math.cos(lat1) == 0) {
            lon = lonin; // endpoint a pole
        }
        else {
            lon = ((lon1 - Math.asin(Math.sin(tc) * Math.sin(d) / Math.cos(lat1)) + Math.PI) % (2 * Math.PI)) - Math.PI;
        }
        lon = 180.0 * lon / Math.PI;
        var loc = new Microsoft.Maps.Location(lat, lon);
        locs.push(loc);
    }

    return locs;
}

function successBingMapsApiLoad() {
	bingLoaded = true;
}

function loadBingMapsApi() {
	if (!bingLoaded) {
		var script = document.createElement('script');

		script.type = 'text/javascript';
		script.async = false;
		script.src = 'https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1&onScriptLoad=successBingMapsApiLoad';
		document.head.appendChild(script);
	}
}

function successGoogleMapsApiLoad() {
	googleLoaded = true;
}

function loadGoogleMapsApi() {
	if(!googleLoaded) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCa7LoaP6jFrs30eq82SiLotZ5g-MGUPvI&sensor=true&callback=successGoogleMapsApiLoad';
		document.body.appendChild(script);
	}
}

function loadMapitoApi(map_services, callback) {

	var both = false, google = false, bing = false;

	if (map_services.indexOf("google") != -1 && map_services.indexOf("bing") != -1) {
		both = true;
	}

	if (map_services.indexOf("google") != -1) {
		google = true;
		if (!googleLoaded) {
			loadGoogleMapsApi();
		}
	}
	if (map_services.indexOf("bing") != -1) {
		bing = true;
		if(!bingLoaded) {
			loadBingMapsApi();
		}
	}

	var interval = setInterval(function() {
		if(both) {
			if (googleLoaded && bingLoaded) {
				clearInterval(interval);
				callback();
			}
		} else {
			if (google && googleLoaded) {
				clearInterval(interval);
				callback();
			} else if (bing && bingLoaded) {
				clearInterval(interval);
				callback();
			}
		}
	}, 300);
}

function getJSON (file, callback) {
	var http_request = new XMLHttpRequest();
	try {
		// Opera 8.0+, Firefox, Chrome, Safari
		http_request = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			http_request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				http_request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		}
	}

	http_request.onreadystatechange = function() {
		if (http_request.readyState == 4 && http_request.status == 200) {
			callback(JSON.parse(http_request.responseText));
		}
	}

	http_request.open("GET", file, false);
	http_request.send();

}
