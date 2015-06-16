var mapito_url = "http://YOUR_DOMAIN"; // without slash '/' in the end of the url, e.g http://yourdomain.com
//var mapito_url = "http://127.0.0.1:3000";

var start;
var controlUI;
var mapitoMaps = {};

function post(url, data, callback) {
	var http_request = new XMLHttpRequest();
	try {
		// Opera 8.0+, Firefox, Chrome, Safari
		http_request = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer Browsers
		try {
			http_request = new ActiveXObject("Msxml2.XMLHTTP");
			try {
				http_request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				// Something went wrong
				alert("Your browser broke!");
				return false;
			}
		} catch(err) {
		    console.log("error in post");
		}
	}

	http_request.onreadystatechange = function() {
		if (http_request.readyState == 4 && http_request.status == 200) {
			if (typeof callback !== 'undefined') {
				callback(JSON.parse(http_request.responseText));
			}
		}
	}

	http_request.open("POST", url);
	http_request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	http_request.send(JSON.stringify(data));
}

var panfrom = new Object();
var zoomfrom = new Object();

window.onload = function(){

	var elements = document.querySelectorAll('[data-mapito]');

	for (var i = 0, n = elements.length; i < n; i++) {

	    var url = "/embedded_map?mapId="+elements[i].getAttribute("data-mapito");

		getJSON(url, function(data) {

			elements[i].id = "mapito-map" + data.map._id ;

			var id = data.map._id;

			loadMapitoApi(data.map.service, function () {
				mapitoMaps[data.map._id] = new Mapito(data.map.service);

				mapitoMaps[data.map._id].initialize("mapito-map" + data.map._id, {
					center: {
						lat: 38,
						lon: 40
					},
					zoom: data.map.initial.zoom,
					scrollZoom: data.map.controls.standard.scroll_zoom,
					mousePan: data.map.controls.standard.mouse_pan,
					dbclickZoom: data.map.controls.standard.dbclick_zoom,
					panControl: data.map.controls.standard.pan.enabled,
					panControlOptions: {
						position: data.map.controls.standard.pan.position
					},
					zoomControl: data.map.controls.standard.zoom.enabled,
					zoomControlOptions: {
						style: data.map.controls.standard.zoom.style,
						position: data.map.controls.standard.zoom.position
					},
					mapTypeControl: data.map.controls.standard.map_type.enabled,
					mapTypeControlOptions: {
						style: data.map.controls.standard.map_type.style,
						position: data.map.controls.standard.map_type.position
				}});

				if (typeof data.map.controls.custom != "undefined" && typeof data.map.controls.custom.pan != "undefined" && data.map.controls.custom.pan.enabled) {
					var customPan = new CustomPan(mapitoMaps[data.map._id], {
						position: data.map.controls.custom.pan.position,
						background : {
							shape: data.map.controls.custom.pan.background.shape,
							color: data.map.controls.custom.pan.background.color,
							size: data.map.controls.custom.pan.background.size
						},
						buttons : {
							shape: data.map.controls.custom.pan.buttons.shape,
							color: data.map.controls.custom.pan.buttons.color,
							size: data.map.controls.custom.pan.buttons.size
						},
						border : {
							color: data.map.controls.custom.pan.border.color,
							width: data.map.controls.custom.pan.border.width
						}
					});
				}

				if (typeof data.map.controls.custom != "undefined" && typeof data.map.controls.custom.zoom != "undefined" && data.map.controls.custom.zoom.enabled) {
					var customZoom = new CustomZoom(mapitoMaps[data.map._id], {
						position: data.map.controls.custom.zoom.position,
						background : {
							layout: data.map.controls.custom.zoom.background.layout,
							color: data.map.controls.custom.zoom.background.color,
							length: data.map.controls.custom.zoom.background.length
						},
						buttons : {
							shape: data.map.controls.custom.zoom.buttons.shape,
							color: data.map.controls.custom.zoom.buttons.color,
							size: data.map.controls.custom.zoom.buttons.size
						},
						border : {
							color: data.map.controls.custom.zoom.border.color,
							width: data.map.controls.custom.zoom.border.width
						}
					});
				}

				if (parseInt(data.map.initial.method) == 1) {
					mapitoMaps[data.map._id].setAccurateCenter("geolocation");
				} else if (parseInt(data.map.initial.method) == 2) {
					mapitoMaps[data.map._id].setAccurateCenter("ip-based");
				} else if (parseInt(data.map.initial.method) == 3) {
					mapitoMaps[data.map._id].setCenter(data.map.initial.center.lat,data.map.initial.center.lon);
				}

				if (data.map.controls.route_tracking.start_stop.enabled) {
					var button = mapitoMaps[id].pushControl(mapitoRouteTrackingControl(mapitoMaps[id], id), data.map.controls.route_tracking.start_stop.position);
				}

				if (data.map.markers != null) {
					for (var i=0; i<data.map.markers.length; i++) {
						var m = data.map.markers[i];

						var show_marker = new MapitoMarker(m.position, mapitoMaps[data.map._id], { icon: m.icon });
					}
				}

				if (data.map.circles != null) {
					for (var i=0; i<data.map.circles.length; i++) {
						var c = data.map.circles[i];

						var show_circle = new MapitoCircle(c.position, mapitoMaps[data.map._id], c);
					}
				}


				var fromPosition = new Object();

				fromPosition.lat = mapitoMaps[data.map._id].getCenter().lat;
				fromPosition.lon = mapitoMaps[data.map._id].getCenter().lon;
				fromPosition.zoom = mapitoMaps[data.map._id].getZoom();

				var vc_timeout;
				setTimeout(function () {
					mapitoMaps[id].viewChange(function () {
						clearTimeout(vc_timeout);
						vc_timeout = setTimeout(function () {
							post(mapito_url + "/user_action", {
								map_id: id,
								time: new Date(),
								from: {
									lat : fromPosition.lat,
									lon: fromPosition.lon,
									zoom: fromPosition.zoom
								},
								to : {
									lat : mapitoMaps[data.map._id].getCenter().lat,
									lon: mapitoMaps[data.map._id].getCenter().lon,
									zoom: mapitoMaps[data.map._id].getZoom()
								}
							});
							fromPosition.lat = mapitoMaps[data.map._id].getCenter().lat;
							fromPosition.lon = mapitoMaps[data.map._id].getCenter().lon;
							fromPosition.zoom = mapitoMaps[data.map._id].getZoom();
						}, 1000);
					});
				}, 3000);

			})
		});

	}
};

/////////////////////////////////////////////////////////
//////////////////// ROUTE TRACKING//////////////////////
/////////////////////////////////////////////////////////
var mapitoRoutePath = [];
var mapitoTrackingHasStarted = false;

function mapitoStartTracking(map, mapId) {

	var geo_options = {
	  enableHighAccuracy: true,
	  timeout: 10000
	};

	var routeId;

	var startTrue = false;
	var routeCreated = false;

	gpsWait(mapId);

	if (navigator.geolocation) {

	     navigator.geolocation.getCurrentPosition(function (position) {
			map.setCenter(position.coords.latitude, position.coords.longitude);
	    	 //mapitoRoutePath.push({lat: position.coords.latitude, lon: position.coords.longitude})
	     });

		var attempts = 0;
	     watchID = navigator.geolocation.watchPosition(function (position) {
			attempts += 1;

			map.setCenter(position.coords.latitude, position.coords.longitude);
			map.setZoom(16)
			
			if (!startTrue && attempts > 2) {
				if (document.getElementById("mapito-map" + mapId)) {
					post( mapito_url + "/create_route", {mapId : mapId}, function (data) {
						routeId = data.id;
						routeCreated = true;
					});
				}
				hideGpsWait();
         		var marker = new MapitoMarker(
         			{lat: position.coords.latitude, lon: position.coords.longitude},
					map,
		 		    { icon: "../images/rt_start_flag.png"}
		 		);
				
				startTrue = true;
         	}

			if (startTrue && routeCreated) {
	         	mapitoRoutePath.push({lat: position.coords.latitude, lon: position.coords.longitude})

				if (document.getElementById("mapito-map" + mapId)) {
		         	post(mapito_url + "/save_point", {
		         		id : routeId,
		         		lat: position.coords.latitude,
		         		lon: position.coords.longitude,
		         		ele: position.coords.altitude
		         	});
				}
			}
    
         	var pathLine = new MapitoLine(mapitoRoutePath, map, {strokeColor: '#FF0000', strokeWeight: 8});

	    }, function () {
			hideGpsWait();
	    	gpsError(mapId)
	        mapitoStopTracking(map, mapId);
	    	start.innerHTML = '<b>Start</b>';
			controlUI.style.backgroundColor = '#00FF00';
			mapitoTrackingHasStarted = false;
	    },
	    geo_options);
	 }
}

function mapitoStopTracking(map, mapId){
	navigator.geolocation.clearWatch(watchID);
	if (mapitoRoutePath.length > 0 ) {
		var marker = new MapitoMarker(
			{lat: mapitoRoutePath[mapitoRoutePath.length-1].lat, lon: mapitoRoutePath[mapitoRoutePath.length-1].lon},
			map,
		    { icon: "../images/rt_stop_flag.png"}
		);
	}
}

function mapitoRouteTrackingControl(map, mapId) {

	var controlDiv = document.createElement('div');

	controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#00FF00';
	controlUI.style.width='60px';
	controlUI.style.height='60px';
	controlUI.style.borderRadius = "50%";
	controlUI.style.cursor = 'pointer';
	controlUI.style.border = '2px solid #000';
	controlUI.style.boxShadow = "1px 2px 3px #606060 ";
	controlUI.style.textAlign = 'center';
	controlDiv.appendChild(controlUI);

	start = document.createElement('span');
	start.style.fontFamily = 'Arial,sans-serif';
	start.style.fontSize = '22px';
	start.style.display = "inline-block"
	start.style.margin = "0 auto";
	start.style.position = "relative";
	start.style.color = '#000000';
	start.style.top = parseInt(controlUI.style.height)/2 + "px";
	start.style.transform = "translateY(-50%)";
	start.style.webkitTransform = "translateY(-50%)";
	start.style.msTransform = "translateY(-50%)";
	start.innerHTML = '<b>Start</b>';
	controlUI.appendChild(start);

	map.addListener(controlUI, 'click', function () {
		if (!isMobile()) {
			hideGpsWait();
			gpsError(mapId)
			return false;
		} else {

			if (mapitoTrackingHasStarted) {
				mapitoStopTracking(map, mapId)
				start.innerHTML = '<b>Start</b>';
				controlUI.style.backgroundColor = '#00FF00';
				mapitoTrackingHasStarted = false;
				hideGpsWait();
			} else {
				mapitoStartTracking(map, mapId);
				start.innerHTML = '<b>Stop</b>';
				controlUI.style.backgroundColor = '#FF0000';
				mapitoTrackingHasStarted = true
			}

		}
	})

	return controlDiv;

}

function hideGpsError() {
	var el = document.getElementById("mapito-gps-error");
	el.parentNode.removeChild( el );
}

function gpsError(mapId) {
	var div = document.createElement("div");
	div.setAttribute("id", "mapito-gps-error");
	div.onclick = hideGpsError;
	div.style.fontFamily = "Arial,sans-serif";
	div.style.fontSize = "14px";
	div.style.width = "250px";
	div.style.height = "300px";
	div.style.border = "6px solid #777";
	div.style.borderRadius = "5px";
	div.style.padding = "10px 20px";
	div.style.position = "absolute";
	div.style.zIndex = "10000";
	div.style.background = "#FFFFFF";
	div.style.color = "#777777";
	div.innerHTML = "<p><b>You need a mobile device with GPS to track a route.</b></p>"
		+ "<p><b>Please check if:</b></p>"
		+ "<p><ul>"
		+ "<li>GPS is enable on your device</li>"
		+ "<li>Your browser supports the HTML5 Gelocation</li>"
		+ "<li>Geolocation is enabled in your browser</li>"
		+ "<li>Internet connection is enabled</li>"
		+ "</ul></p>";
	div.style.top = "50%";
	div.style.left = "50%";
	div.style.webkitTransform = "translate(-50%, -50%)";
	div.style.MozTransform = "translate(-50%, -50%)";
	div.style.msTransform = "translate(-50%, -50%)";
	div.style.OTransform = "translate(-50%, -50%)";
	div.style.transform = "translate(-50%, -50%)";

	var span = document.createElement("span");
	span.innerHTML = "<i>GPS tracking powered by <a style='color:#368ECA' href='http://www.mapito.org'>Mapito.org</a>.</i>"
	span.style.bottom = "5px";
	span.style.position = "absolute";
	span.style.fontSize = "11px";
	span.style.left = "50%";
	span.style.textAlign = "center";
	span.style.width = "100%";
	span.style.webkitTransform = "translateX(-50%)";
	span.style.MozTransform = "translateX(-50%)";
	span.style.msTransform = "translateX(-50%)";
	span.style.OTransform = "translateX(-50%)";
	span.style.transform = "translateX(-50%)";

	div.appendChild(span);

	if (document.getElementById("mapito-map" + mapId)) {
		document.getElementById("mapito-map" + mapId).appendChild(div);
	} else {
		document.getElementById(mapId).appendChild(div);
	}
}

function hideGpsWait() {
	var el = document.getElementById("mapito-gps-wait");
	if (el != null) {
		el.parentNode.removeChild( el );
	}
}

function gpsWait(mapId) {
	var div = document.createElement("div");
	div.setAttribute("id", "mapito-gps-wait");
	div.onclick = hideGpsError;
	div.style.fontFamily = "Arial,sans-serif";
	div.style.fontSize = "16px";
	div.style.width = "250px";
	div.style.height = "60px";
	div.style.textAlign = "center";
	div.style.border = "6px solid #777";
	div.style.borderRadius = "5px";
	div.style.padding = "10px 20px";
	div.style.position = "absolute";
	div.style.zIndex = "10000";
	div.style.background = "#FFFFFF";
	div.style.color = "#777777";
	div.innerHTML = "<p><b>Please wait...</b></p>"
	div.style.top = "50%";
	div.style.left = "50%";
	div.style.webkitTransform = "translate(-50%, -50%)";
	div.style.MozTransform = "translate(-50%, -50%)";
	div.style.msTransform = "translate(-50%, -50%)";
	div.style.OTransform = "translate(-50%, -50%)";
	div.style.transform = "translate(-50%, -50%)";

	var span = document.createElement("span");
	span.innerHTML = "<i>GPS tracking powered by <a style='color:#368ECA' href='http://www.mapito.org'>Mapito.org</a>.</i>"
	span.style.bottom = "5px";
	span.style.position = "absolute";
	span.style.fontSize = "11px";
	span.style.left = "50%";
	span.style.width = "100%";
	span.style.webkitTransform = "translateX(-50%)";
	span.style.MozTransform = "translateX(-50%)";
	span.style.msTransform = "translateX(-50%)";
	span.style.OTransform = "translateX(-50%)";
	span.style.transform = "translateX(-50%)";

	div.appendChild(span);

	if (document.getElementById("mapito-map" + mapId)) {
		document.getElementById("mapito-map" + mapId).appendChild(div);
	} else {
		document.getElementById(mapId).appendChild(div);
	}
}


// END ROUTE TRACKING


////////////////////////
// CUSTOM PAN //////////
////////////////////////

//Custom control background shape

function mapitoCustomPanBgShape(options) {
	var shapediv = document.createElement('DIV');
	var shape = options.background.shape;
	var borderWidth = options.border.width;
	var borderColor = options.border.color;

	if (shape == "cross") {

		shapediv.style.width = "100%";
		shapediv.style.height = "100%";
		shapediv.style.position = 'relative';

		var crossVertical;
		var crossHorizontal;

		crossHorizontal = document.createElement('div');
		crossHorizontal.style.position = 'absolute';
		crossHorizontal.style.top = "33.33%";
		crossHorizontal.style.width = "100%";
		crossHorizontal.style.height = "33.33%";
		crossHorizontal.style.borderRadius = "10%";
		crossHorizontal.style.boxShadow = "0px 0px 3px #777";
		shapediv.appendChild(crossHorizontal);

		crossVertical = document.createElement('div');
		crossVertical.style.position = 'absolute';
		crossVertical.style.backgroundColor = options.background.color;
		crossVertical.style.left = "33.33%";
		crossVertical.style.width = "33.33%";
		crossVertical.style.height = "100%";
		crossVertical.style.borderRadius = "10%";
		crossVertical.style.boxShadow = "0px 0px 3px #777";
		if (parseInt(options.border.width) > 0) {
			crossVertical.style.borderColor = options.border.color;
			crossVertical.style.borderWidth = options.border.width + 'px';
			crossVertical.style.borderStyle = "solid";
		}
		shapediv.appendChild(crossVertical);


		crossHorizontal = document.createElement('div');
		crossHorizontal.style.position = 'absolute';
		crossHorizontal.style.top = "33.33%";
		crossHorizontal.style.backgroundColor = options.background.color;
		crossHorizontal.style.width = "100%";
		crossHorizontal.style.height = "33.33%";
		crossHorizontal.style.borderRadius = "10%";
		crossHorizontal.style.cursor = 'pointer';
		if (parseInt(options.border.width) > 0) {
			crossHorizontal.style.borderColor = options.border.color;
			crossHorizontal.style.borderWidth = options.border.width + 'px';
			crossHorizontal.style.borderStyle = "solid";
		}
		shapediv.appendChild(crossHorizontal);

		crossVertical = document.createElement('div');
		crossVertical.style.position = 'absolute';
		crossVertical.style.left = 33.33 + (options.border.width/options.background.size) * 100 + "%";
		crossVertical.style.backgroundColor = options.background.color;
		crossVertical.style.width = 33.33 - (options.border.width/options.background.size) * 100 *2 + "%";
		crossVertical.style.top = (options.border.width/options.background.size) * 100 + "%";
		crossVertical.style.height = 100 - (options.border.width/options.background.size) * 100 *2 + "%";
		crossVertical.style.borderRadius = "10%";

		shapediv.appendChild(crossVertical);
	} else if (shape == "circle") {
		shapediv.style.width = "100%";
		shapediv.style.height = "100%";
		shapediv.style.borderRadius = "50%";
		shapediv.style.backgroundColor = options.background.color;
		if (parseInt(options.border.width) > 0) {
			shapediv.style.borderColor = options.border.color;
			shapediv.style.borderWidth = options.border.width + 'px';
			shapediv.style.borderStyle = "solid";
		}
		shapediv.style.position = 'relative';
		shapediv.style.boxShadow = "0px 0px 3px #777";
	}

	return shapediv;
}


// end bg pan control shapes


function customPanControl(map, options) {

	var controlDiv = document.createElement('div');

	controlDiv.style.padding = '5px';

	if (map == "bing") {
		controlDiv.style.zIndex = 1;
	}

	var width = parseInt(options.background.size);
	var height = parseInt(options.background.size);
	controlDiv.style.width = 1 * width +'px';
	controlDiv.style.height = 1 * width + 'px';

	var bgshape = mapitoCustomPanBgShape(options);

	controlDiv.appendChild(bgshape);

	// Set CSS for the control interior
	var panTop = document.createElement('div');
	var btnTop = document.createElement('div');

	var btnsize = parseInt(options.buttons.size);

	if (options.buttons.shape == "triangle") {
		panTop.style.width = '0';
		panTop.style.height = '0';
		panTop.style.borderLeft = btnsize - btnsize/4 + "px solid transparent";
		panTop.style.borderRight = btnsize - btnsize/4 + "px solid transparent";
		panTop.style.borderBottom = btnsize  + "px solid " + options.buttons.color;
		btnTop.style.webkitTransform = "translateX(-50%)";
		btnTop.style.MozTransform = "translateX(-50%)";
		btnTop.style.msTransform = "translateX(-50%)";
		btnTop.style.OTransform = "translateX(-50%)";
		btnTop.style.transform = "translateX(-50%)";
		btnTop.style.padding = (0.07 * parseInt(options.background.size)) + "px";
	} else {
		panTop.style.width = 0.9 * parseInt(options.buttons.size) + 'px';
		panTop.style.height = 0.9 * parseInt(options.buttons.size) + 'px';
		panTop.style.borderLeft = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		panTop.style.borderBottom = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		btnTop.style.padding = (0.1 * parseInt(options.background.size)) + "px";
		btnTop.style.webkitTransform = "translateX(-50%) rotate(135deg)";
		btnTop.style.MozTransform = "translateX(-50%) rotate(135deg)";
		btnTop.style.msTransform = "translateX(-50%) rotate(135deg)";
		btnTop.style.OTransform = "translateX(-50%) rotate(135deg)";
		btnTop.style.transform = "translateX(-50%) rotate(135deg)";
	}
	btnTop.style.left = '50%';
	btnTop.style.position = 'absolute';
	btnTop.style.cursor = "pointer";
	btnTop.appendChild(panTop);
	bgshape.appendChild(btnTop);

	// Setup the click event listeners

	map.addListener(btnTop, 'click', function() {
		map.panBy(0, -map.getHeight() * 0.2);
	});

	// Set CSS for the control interior
	var panBottom = document.createElement('div');
	var btnBottom = document.createElement('div');

	if (options.buttons.shape == "triangle") {
		panBottom.style.width = '0';
		panBottom.style.height = '0';
		panBottom.style.borderLeft = btnsize - btnsize/4 + "px solid transparent";
		panBottom.style.borderRight = btnsize - btnsize/4 + "px solid transparent";
		panBottom.style.borderTop = btnsize + "px solid " + options.buttons.color;
		btnBottom.style.padding = (0.07 * parseInt(options.background.size)) + "px";

		btnBottom.style.webkitTransform = "translateX(-50%)";
		btnBottom.style.MozTransform = "translateX(-50%)";
		btnBottom.style.msTransform = "translateX(-50%)";
		btnBottom.style.OTransform = "translateX(-50%)";
		btnBottom.style.transform = "translateX(-50%)";
	} else {
		panBottom.style.width = 0.9 * parseInt(options.buttons.size) + 'px';
		panBottom.style.height = 0.9 * parseInt(options.buttons.size) + 'px';
		panBottom.style.borderLeft = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		panBottom.style.borderBottom = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		btnBottom.style.padding = (0.1 * parseInt(options.background.size)) + "px";
		btnBottom.style.webkitTransform = "translateX(-50%) rotate(-45deg)";
		btnBottom.style.MozTransform = "translateX(-50%) rotate(-45deg)";
		btnBottom.style.msTransform = "translateX(-50%) rotate(-45deg)";
		btnBottom.style.OTransform = "translateX(-50%) rotate(-45deg)";
		btnBottom.style.transform = "translateX(-50%) rotate(-45deg)";
	}
	btnBottom.style.bottom = "0px";
	btnBottom.style.left = '50%';
	btnBottom.style.position = 'absolute';
	btnBottom.style.cursor = "pointer";
	btnBottom.appendChild(panBottom);
	bgshape.appendChild(btnBottom);

	// Setup the click event listeners
	map.addListener(btnBottom, 'click', function() {
		map.panBy(0, map.getHeight() * 0.2);
	});

	// Set CSS for the control interior
	var panLeft = document.createElement('div');
	var btnLeft = document.createElement('div');

	if (options.buttons.shape == "triangle") {
		panLeft.style.width = '0';
		panLeft.style.height = '0';
		panLeft.style.borderTop = btnsize - btnsize/4 + "px solid transparent";
		panLeft.style.borderBottom = btnsize - btnsize/4 + "px solid transparent";
		panLeft.style.borderRight = btnsize + "px solid " + options.buttons.color;
		btnLeft.style.padding = (0.07 * parseInt(options.background.size)) + "px";

		btnLeft.style.webkitTransform = "translateY(-50%)";
		btnLeft.style.MozTransform = "translateY(-50%)";
		btnLeft.style.msTransform = "translateY(-50%)";
		btnLeft.style.OTransform = "translateY(-50%)";
		btnLeft.style.transform = "translateY(-50%)";
	} else {
		panLeft.style.width = 0.9 * parseInt(options.buttons.size) + 'px';
		panLeft.style.height = 0.9 * parseInt(options.buttons.size) + 'px';
		panLeft.style.borderLeft = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		panLeft.style.borderBottom = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		btnLeft.style.padding = (0.1 * parseInt(options.background.size)) + "px";

		btnLeft.style.webkitTransform = "translateY(-50%) rotate(45deg)";
		btnLeft.style.MozTransform = "translateY(-50%) rotate(45deg)";
		btnLeft.style.msTransform = "translateY(-50%) rotate(45deg)";
		btnLeft.style.OTransform = "translateY(-50%) rotate(45deg)";
		btnLeft.style.transform = "translateY(-50%) rotate(45deg)";
	}

	btnLeft.style.position = 'absolute';
	btnLeft.style.top = '50%';
	btnLeft.style.cursor = "pointer";
	btnLeft.appendChild(panLeft);
	bgshape.appendChild(btnLeft);

	// Setup the click event listeners
	map.addListener(btnLeft, 'click', function() {
		map.panBy(-map.getWidth() * 0.2, 0);
	});

	// Set CSS for the control interior
	var panRight = document.createElement('div');
	var btnRight = document.createElement('div');

	if (options.buttons.shape == "triangle") {
		panRight.style.width = '0';
		panRight.style.height = '0';
		panRight.style.borderTop = btnsize - btnsize/4 + "px solid transparent";
		panRight.style.borderBottom = btnsize - btnsize/4 + "px solid transparent";
		panRight.style.borderLeft = btnsize + "px solid " + options.buttons.color;

		btnRight.style.webkitTransform = "translateY(-50%)";
		btnRight.style.MozTransform = "translateY(-50%)";
		btnRight.style.msTransform = "translateY(-50%)";
		btnRight.style.OTransform = "translateY(-50%)";
		btnRight.style.transform = "translateY(-50%)";
		btnRight.style.padding = (0.07 * parseInt(options.background.size)) + "px";
	} else {
		panRight.style.width = 0.9 * parseInt(options.buttons.size) + 'px';
		panRight.style.height = 0.9 * parseInt(options.buttons.size) + 'px';
		panRight.style.borderLeft = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		panRight.style.borderBottom = (0.3 * parseInt(options.buttons.size)) + "px solid " + options.buttons.color;
		btnRight.style.padding = (0.1 * parseInt(options.background.size)) + "px";
		btnRight.style.transform = "translateY(-50%) rotate(225deg)";
		btnRight.style.webkitTransform = "translateY(-50%) rotate(225deg)";
		btnRight.style.MozTransform = "translateY(-50%) rotate(225deg)";
		btnRight.style.msTransform = "translateY(-50%) rotate(225deg)";
		btnRight.style.OTransform = "translateY(-50%) rotate(225deg)";
	}
	btnRight.style.right = "0px";
	btnRight.style.position = 'absolute';
	btnRight.style.top = '50%';
	btnRight.style.cursor = "pointer";
	btnRight.appendChild(panRight);
	bgshape.appendChild(btnRight);

	// Setup the click event listeners
	map.addListener(btnRight, 'click', function() {
		map.panBy(map.getWidth() * 0.2, 0);
	});

	return controlDiv;
}


function CustomPan(map, options) {
	this._map = map;
	this._options = options;
	/* {
	 * 	position: String,
	 * 	background: {
	 * 		shape: String,
	 * 		color: String
	 * 	},
	 * border : {
	 * 		width: Number,
	 * 		color: String
	 * }
	 * 	buttons: {
	 * 		shape: String,
	 * 		color: String,
	 * 		size: Number
	 * 	}
	 * }
	 */
	this._obj = map.pushControl(customPanControl(this._map, this._options), this._options.position);

}

CustomPan.prototype = {

		setOptions : function (options) {
			for (x in options) {
				this._options[x] = options[x];
			}
			this._map.removeControl(this._obj);
			this._obj = this._map.pushControl(customPanControl(this._map, this._options), this._options.position);

		},

		getObj : function () {
			return this._obj;
		},

		remove : function () {
			this._map.removeControl(this._obj);
		}
}


/// CUSTOM ZOOM
//Custom control background shape

function mapitoCustomZoomBgShape(map, options) {
	var shapediv = document.createElement('DIV');
	var shape = options.background.layout;
	var borderWidth = options.border.width;
	var borderColor = options.border.color;


	shapediv.style.width = "100%";
	shapediv.style.height = "100%";
	shapediv.style.position = 'relative';
	shapediv.style.color = options.buttons.color;

	var zoombox;

	zoombox = document.createElement('div');
	zoombox.style.backgroundColor = options.background.color;
	zoombox.style.color = options.buttons.color;
	zoombox.style.width = "100%";
	zoombox.style.height = "100%";
	zoombox.style.borderRadius = "10%";
	zoombox.style.boxShadow = "0px 0px 3px #777";
	if (parseInt(options.border.width) > 0) {
		zoombox.style.borderColor = options.border.color;
		zoombox.style.borderWidth = options.border.width + 'px';
		zoombox.style.borderStyle = "solid";
	}
	shapediv.appendChild(zoombox);
	return zoombox;
}


//end bg pan control shapes


function customZoomControl(map, options) {

	var controlDiv = document.createElement('div');

	controlDiv.style.padding = '5px';


	if (map == "bing") {
		controlDiv.style.zIndex = 1;
	}

	var width = parseInt(options.background.length);
	var height = parseInt(options.background.length);

	if (options.background.layout == "vertical") {
		controlDiv.style.width = 0.5 * width +'px';
		controlDiv.style.height = 1 * width + 'px';
	} else {
		controlDiv.style.width = 1 * width +'px';
		controlDiv.style.height = 0.5 * width + 'px';
	}

	controlDiv.style.userSelect = "none";
	controlDiv.style.webkitUserSelect = "none";
	controlDiv.style.MozUserSelect = "none";

	var bgshape = mapitoCustomZoomBgShape(map, options);

	controlDiv.appendChild(bgshape);

	// Set CSS for the control interior
	var btnZoomIn = document.createElement('div')
	if (options.background.layout == "vertical") {
		btnZoomIn.style.width = "100%";
		btnZoomIn.style.height = "50%";
		btnZoomIn.style.borderBottom = 'thin solid ' + options.buttons.color;
	} else {
		btnZoomIn.style.width = "50%";
		btnZoomIn.style.height = "100%";
		btnZoomIn.style.display= "inline-block";
		btnZoomIn.style.borderRight = 'thin solid ' + options.buttons.color;
	}
	btnZoomIn.style.position = 'relative';
	var zoomIn = document.createElement('div');
	zoomIn.style.fontFamily = 'Arial,sans-serif';
	zoomIn.style.fontSize = options.buttons.size + 'px';
	zoomIn.style.position = 'absolute';
	zoomIn.style.left = '50%';
	zoomIn.style.top = '50%';
	zoomIn.innerHTML = '+';
	zoomIn.style.display = 'inline-block';
	zoomIn.style.textAlign = 'center';
	zoomIn.style.webkitTransform = "translate(-50%,-50%)";
	zoomIn.style.MozTransform = "translate(-50%,-50%)";
	zoomIn.style.msTransform = "translate(-50%,-50%)";
	zoomIn.style.OTransform = "translate(-50%,-50%)";
	zoomIn.style.transform = "translate(-50%,-50%)";
	zoomIn.style.cursor = "pointer";
	zoomIn.style.lineHeight = "100%";
	btnZoomIn.appendChild(zoomIn);
	bgshape.appendChild(btnZoomIn);

	map.addListener(btnZoomIn, 'click', function() {
		map.setZoom(map.getZoom() + 1);
	});

	// Set CSS for the control interior
	var btnZoomOut = document.createElement('div')
	if (options.background.layout == "vertical") {
		btnZoomOut.style.width = "100%";
		btnZoomOut.style.height = "50%";
		btnZoomOut.style.borderTop = 'thin solid ' + options.buttons.color;
	} else {
		btnZoomOut.style.width = "50%";
		btnZoomOut.style.height = "100%";
		btnZoomOut.style.borderLeft = 'thin solid ' + options.buttons.color;
		btnZoomOut.style.display= "inline-block";
	}
	btnZoomOut.style.position = 'relative';
	var zoomOut = document.createElement('div');
	zoomOut.style.fontFamily = 'Arial,sans-serif';
	zoomOut.style.fontSize = options.buttons.size + 'px';
	zoomOut.style.position = 'absolute';
	zoomOut.style.left = '50%';
	zoomOut.style.bottom = "50%";
	zoomOut.style.webkitTransform = "translate(-50%,50%)";
	zoomOut.style.MozTransform = "translate(-50%,50%)";
	zoomOut.style.msTransform = "translate(-50%,50%)";
	zoomOut.style.OTransform = "translate(-50%,50%)";
	zoomOut.style.transform = "translate(-50%,50%)";
	zoomOut.innerHTML = '&#8722;';
	zoomOut.style.cursor = "pointer";
	zoomOut.style.lineHeight = "100%";
	btnZoomOut.appendChild(zoomOut);
	bgshape.appendChild(btnZoomOut);

	map.addListener(btnZoomOut, 'click', function() {
		map.setZoom(map.getZoom() -1);
	});

	return controlDiv;
}


function CustomZoom(map, options) {
	this._map = map;
	this._options = options;
	/* {
	 * 	position: String,
	 * 	background: {
	 * 		size: String,
	 * 		length: Number,
	 * 		color: String
	 * 	},
	 * border : {
	 * 		width: Number,
	 * 		color: String
	 * }
	 * 	buttons: {
	 * 		color: String,
	 * 		size: Number
	 * 	}
	 * }
	 */
	this._obj = map.pushControl(customZoomControl(this._map, this._options), this._options.position);

}

CustomZoom.prototype = {

	setOptions : function (options) {
		for (x in options) {
			this._options[x] = options[x];
		}
		this._map.removeControl(this._obj);
		this._obj = this._map.pushControl(customZoomControl(this._map, this._options), this._options.position);

	},

	getObj : function () {
		return this._obj;
	},

	remove : function () {
		this._map.removeControl(this._obj);
	}
}

function MapitoMapLoaded(map_id, callback) {
	var interval = setInterval(function() {
	    if (mapitoMaps.hasOwnProperty(map_id)) {
			if (mapitoMaps[map_id].getMap() != null) {
				clearInterval(interval);
				callback();
			}
		}
	}, 300);
}

function isMobile() {
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
		return true;
	}
	return false;
}
