var map;
var panAndZoom;
var customPan, customZoom;
var options;

var modalMap;
var current;

var circle, circleForUpdate;
var marker, markerForUpdate;

var updateCircle = false;
var circles = {};

var updateMarker = false;
var markers = {};

var date = new Date();

var simpleId = 1000;

var startStop;

function isset(obj) {
	if (typeof obj != "undefined")
		return true;
	else
		return false;
}

$(document).ready(function() {

	// all map options
	options = JSON.parse($("#map-data").val());

	$("#navbar-ui").addClass("active");

	/* initialization */
	if(options.initial.method == "3") {
		$("#center-latitude").val(options.initial.center.lat);
		$("#center-longitude").val(options.initial.center.lon || "");
	}
	$("#center-zoom").val(options.initial.zoom);
	$("#method-geolocation").prop("checked", options.initial.method == "1");
	$("#method-ip").prop("checked", options.initial.method == "2");
	$("#method-static").prop("checked", options.initial.method == "3");
	if ($("#method-static").prop('checked')) {
		$("#center-lat-lon").show();
	}

	/* standard controls */
	$("#scroll-zoom-control").prop("checked", options.controls.standard.scroll_zoom);
	$("#dbclick-zoom-control").prop("checked", options.controls.standard.dbclick_zoom);
	$("#mouse-pan-control").prop("checked", options.controls.standard.mouse_pan);

	$("#standard-zoom-control").prop("checked", options.controls.standard.zoom.enabled);
	$("#standard-zoom-control-position").val(options.controls.standard.zoom.position);
	$("#standard-zoom-control-style").val(options.controls.standard.zoom.style);

	$("#standard-pan-control").prop("checked", options.controls.standard.pan.enabled);
	$("#standard-pan-control-position").val(options.controls.standard.pan.position);

	$("#map-type-control").prop("checked", options.controls.standard.map_type.enabled);
	$("#google-maptype-control-position").val(options.controls.standard.map_type.position);
	$("#google-maptype-control-style").val(options.controls.standard.map_type.style);


	// route tracking
	$("#start-control").prop("checked", options.controls.route_tracking.start_stop.enabled);
	$("#start-control-position").val(options.controls.route_tracking.start_stop.position);

	// custom pan control
	if(typeof options.controls.custom != "undefined" && typeof options.controls.custom.pan != "undefined" && options.controls.custom.pan.enabled) {
		$('input[name=custom_pan]', '#custom-pan-control-form').prop('checked', options.controls.custom.pan.enabled)
		$('#custom-pan-position').val(options.controls.custom.pan.position)
		$("input[name=bgshape][value=" + options.controls.custom.pan.background.shape + "]", '#custom-pan-control-form').prop('checked', true);
		$('input[name=bgcolor]', '#custom-pan-control-form').val(options.controls.custom.pan.background.color)
		$('input[name=bgsize]', '#custom-pan-control-form').val(options.controls.custom.pan.background.size)
		$('input[name=brdrwidth]', '#custom-pan-control-form').val(options.controls.custom.pan.border.width)
		$('input[name=brdrcolor]', '#custom-pan-control-form').val(options.controls.custom.pan.border.color)
		$("input[name=btnshape][value=" + options.controls.custom.pan.buttons.shape + "]", '#custom-pan-control-form').prop('checked', true);
		$('input[name=btncolor]', '#custom-pan-control-form').val(options.controls.custom.pan.buttons.color)
		$('input[name=btnsize]', '#custom-pan-control-form').val(options.controls.custom.pan.buttons.size)
	}

	// custom pan control
	if(typeof options.controls.custom != "undefined" && typeof options.controls.custom.zoom != "undefined" && options.controls.custom.zoom.enabled) {
		$('input[name=custom_zoom]', '#custom-zoom-control-form').prop('checked', options.controls.custom.zoom.enabled)
		$('#custom-zoom-position').val(options.controls.custom.zoom.position)
		$("input[name=bglayout][value=" + options.controls.custom.zoom.background.layout + "]", '#custom-zoom-control-form').prop('checked', true);
		$('input[name=bgcolor]', '#custom-zoom-control-form').val(options.controls.custom.zoom.background.color)
		$('input[name=bglength]', '#custom-zoom-control-form').val(options.controls.custom.zoom.background.length)
		$('input[name=brdrwidth]', '#custom-zoom-control-form').val(options.controls.custom.zoom.border.width)
		$('input[name=brdrcolor]', '#custom-zoom-control-form').val(options.controls.custom.zoom.border.color)
		$("input[name=btnshape][value=" + options.controls.custom.zoom.buttons.shape + "]", '#custom-zoom-control-form').prop('checked', true);
		$('input[name=btncolor]', '#custom-zoom-control-form').val(options.controls.custom.zoom.buttons.color)
		$('input[name=btnsize]', '#custom-zoom-control-form').val(options.controls.custom.zoom.buttons.size)
	}



	$('.modal-dialog').draggable({
        handle: ".modal-header, .modal-footer"
    });

	loadMapitoApi(options.service, function () {

		map = new Mapito(options.service);
		modalMap = new Mapito(options.service);

		var mapOptions = {
			zoom: parseInt(options.initial.zoom),
			scrollZoom: options.controls.standard.scroll_zoom,
			mousePan: options.controls.standard.mouse_pan,
			dbclickZoom: options.controls.standard.dbclick_zoom
		};

		if (options.controls.standard.pan.enabled) {
			mapOptions.panControl= true;
			mapOptions.panControlOptions = {
				position: options.controls.standard.pan.position
			}
		}
		if (options.controls.standard.zoom.enabled) {
			mapOptions.zoomControl =  true;
			mapOptions.zoomControlOptions = {
				style: options.controls.standard.zoom.style,
				position: options.controls.standard.zoom.position
			};
		}
		if (options.controls.standard.map_type.enabled) {
			mapOptions.mapTypeControl = true;
			mapOptions.mapTypeControlOptions = {
				style: options.controls.standard.map_type.style,
				position: options.controls.standard.map_type.position
			};
		}


		map.initialize("map-canvas", mapOptions);

		if (typeof options.controls.custom != "undefined" && typeof options.controls.custom.pan != "undefined" && options.controls.custom.pan.enabled) {
			customPan = new CustomPan(map, {
				position: options.controls.custom.pan.position,
				background : {
					shape: options.controls.custom.pan.background.shape,
					color: options.controls.custom.pan.background.color,
					size: options.controls.custom.pan.background.size
				},
				buttons : {
					shape: options.controls.custom.pan.buttons.shape,
					color: options.controls.custom.pan.buttons.color,
					size: options.controls.custom.pan.buttons.size
				},
				border : {
					color: options.controls.custom.pan.border.color,
					width: options.controls.custom.pan.border.width
				}
			});
		}

		if (typeof options.controls.custom != "undefined" && typeof options.controls.custom.zoom != "undefined" && options.controls.custom.zoom.enabled) {
			customZoom = new CustomZoom(map, {
				position: options.controls.custom.zoom.position,
				background : {
					layout: options.controls.custom.zoom.background.layout,
					color: options.controls.custom.zoom.background.color,
					length: options.controls.custom.zoom.background.length
				},
				buttons : {
					shape: options.controls.custom.zoom.buttons.shape,
					color: options.controls.custom.zoom.buttons.color,
					size: options.controls.custom.zoom.buttons.size
				},
				border : {
					color: options.controls.custom.zoom.border.color,
					width: options.controls.custom.zoom.border.width
				}
			});
		}

		if (options.initial.method == "1") {
			map.setAccurateCenter("ip-based")
			//map.setAccurateCenter("geolocation")
		} else if (options.initial.method == "2") {
			map.setAccurateCenter("ip-based")
		} else if (options.initial.method == "3") {
			map.setCenter(options.initial.center.lat, options.initial.center.lon)
		}

		if (options.controls.route_tracking.start_stop.enabled) {
			startStop = map.pushControl(startControl(), options.controls.route_tracking.start_stop.position);
		}

		$(".start-control").change(function() {
			map.removeControl(startStop)
			if ($('#start-control').is(':checked')) {
				startStop = map.pushControl(startControl(), $("#start-control-position option:selected").val())
			}
		});


		$("#scroll-zoom-control").change(function() {
			map.setOptions({scrollZoom: $('#scroll-zoom-control').is(':checked')});
		});

		$("#dbclick-zoom-control").change(function() {
			map.setOptions({dbclickZoom: $('#dbclick-zoom-control').is(':checked')});
		});

		$("#mouse-pan-control").change(function() {
			map.setOptions({mousePan: $('#mouse-pan-control').is(':checked')});
		});

		$(".standard-zoom-control").change(function() {
			map.setOptions({
				zoomControl: $('#standard-zoom-control').is(':checked'),
				zoomControlOptions : {
					style: $("#standard-zoom-control-style option:selected").val(),
					position: $("#standard-zoom-control-position option:selected").val()
				}
			});
		});

		$(".standard-pan-control").change(function() {
			map.setOptions({
				panControl: $('#standard-pan-control').is(':checked'),
				panControlOptions : {
					position: $("#standard-pan-control-position option:selected").val()
				}
			});
		});


		$(".standard-maptype-control").change(function() {
			map.setOptions({
				mapTypeControl: $('#map-type-control').is(':checked'),
				mapTypeControlOptions : {
					style: $("#standard-maptype-control-style option:selected").val(),
					position: $("#standard-maptype-control-position option:selected").val()
				}
			});

		});


		$("#center-zoom").change(function() {
			map.setZoom(parseInt($("#center-zoom").val()))
		})

		$(".center-inputs").change(function() {
			lat = parseFloat($("#center-latitude").val());
			lon = parseFloat($("#center-longitude").val());
			map.setCenter(lat, lon)
		})


		$("#method-geolocation").change(function() {
			map.setAccurateCenter("geolocation");
		});

		$("input[name='method']").change(function() {
			if ($("#method-static").prop('checked')) {
				$("#center-lat-lon").show();

				if ($("#center-latitude").val().trim() != "" && $("#center-longitude").val().trim() != "") {
					map.setCenter($("#center-latitude").val(), $("#center-longitude").val());
				} else {
					setCenterInputs(map.getCenter().lat, map.getCenter().lon);
				}

		    } else {
		    	$("#center-lat-lon").hide();
		    }

			if( $("#method-ip").prop("checked")) {
				map.setAccurateCenter("ip-based");
			}
		});

		//////////////////////////////////////
		//     draw circles and markers     //
		//////////////////////////////////////
		c = options.circles || 0;
		m = options.markers || 0;

		for (i=0;i<c.length;i++) {
			var newCircle = new MapitoCircle(c[i].position, map, c[i]);

			newCircle.id = c[i]._id;
			circles[c[i]._id] = newCircle;

			(function (i) {
				var temp = circles[c[i]._id]._obj;
				map.addListener(temp,"dblclick",function () {
					circleForUpdate = circles[c[i]._id];
					updateCircle = true;
					$("#circle-strokeColor").val(c[i].strokeColor);
					$("#circle-strokeOpacity").val(c[i].strokeOpacity);
					$("#circle-strokeWeight").val(c[i].strokeWeight);
					$("#circle-fillColor").val(c[i].fillColor);
					$("#circle-fillOpacity").val(c[i].fillOpacity);
					$("#circle-radius").val(c[i].radius);
					$("#action").val("update")
					$('#circleModal').modal('show');
					$("#delete-circle").show();
				});
			})(i);
		};


		for (i=0;i<m.length;i++) {
			var newMarker = new MapitoMarker(m[i].position, map, m[i]);

			newMarker.id = m[i]._id;
			markers[m[i]._id] = newMarker;

			(function (i) {
				var temp = markers[m[i]._id]._obj;
				map.addListener(temp,"dblclick",function () {
					markerForUpdate = markers[m[i]._id];
					updateMarker = true;
					if (newMarker.hasOwnProperty('icon'))
						$("#marker-icon-url").val(m[i].icon);
					$("#action").val("update")
					$('#markerModal').modal('show');
					$("#delete-marker").show();
				});
			})(i);
		};
		///////////////////////////////////////
		//    end draw circles and markers   //
		///////////////////////////////////////


		/*********************************
		 ************ DRAWING ************
		 *********************************/
		$("#add-circle").click(function () {
			$("#delete-circle").hide();
			updateCircle = false;
		});

		$("#add-marker").click(function () {
			$("#delete-marker").hide();
			updateMarker = false;
		});

		$('#circleModal').on("shown.bs.modal", function () {

			modalMap.initialize("modal-map", {zoom: 12, center : map.getCenter()});

			if (!updateCircle) {
				circle = new MapitoCircle(map.getCenter(), modalMap, {
					strokeColor: $("#circle-strokeColor").val(),
					strokeOpacity: $("#circle-strokeOpacity").val(),
					strokeWeight: $("#circle-strokeWeight").val(),
					fillColor: $("#circle-fillColor").val(),
					fillOpacity: $("#circle-fillOpacity").val(),
					radius: $("#circle-radius").val()
				});
				for (x in circles) {
					if ( circles[x] != null )
						var temp = new MapitoCircle(circles[x].getPosition(), modalMap, circles[x].getOptions());
				}
			} else {
				circle = new MapitoCircle(circleForUpdate.getCenter(), modalMap, circleForUpdate.getOptions());
				modalMap.setCenter(circle.getCenter().lat, circle.getCenter().lon)
				for (x in circles) {
					if (circles[x] != null && circles[x].id != circleForUpdate.id) {
						var temp = new MapitoCircle(circles[x].getPosition(), modalMap, circles[x].getOptions());
					}
				}
			}

			$("#circle-position").val(map.getCenter().lat + "," + map.getCenter().lon);
			circle.draggable(true);
			circle.editable(true);

			modalMap.addListener(circle.getObj(),'dragend',function () {
				$("#circle-position").val(circle.getCenter().lat + "," + circle.getCenter().lon);
				circle.setPosition({lat: circle.getCenter().lat, lon: circle.getCenter().lon});
			});
			modalMap.addListener(circle.getObj(),'radius_changed',function () {
				$("#circle-radius").val(parseInt(circle.getRadius()));
			});

		});

		$(".circle-settings").change(function () {
			circle.setOptions({
				strokeColor: $("#circle-strokeColor").val(),
				strokeOpacity: $("#circle-strokeOpacity").val(),
				strokeWeight: $("#circle-strokeWeight").val(),
				fillColor: $("#circle-fillColor").val(),
				fillOpacity: $("#circle-fillOpacity").val(),
				radius: $("#circle-radius").val()
			})
			var lat_regex = /^[0-9]+\.?[0-9]*/;
		    var lon_regex = /[0-9]+\.?[0-9]*$/;

		    var newCen = {lat: lat_regex.exec($("#circle-position").val()), lon: lon_regex.exec($("#circle-position").val())};

		    circle.setPosition(newCen);
		    modalMap.setCenter(newCen.lat, newCen.lon);
		})

		$("#delete-circle").click(function () {
			$("#delete-circle").hide();

			for (x in circles) {
				if (circles[x] != null && circles[x].id == circleForUpdate.id) {
					circles[x] = null;

				}
			}
			if (updateCircle) {
				circleForUpdate.remove();
			}
			circle.remove();
			updateCircle = false;
			saveCirclesinDB();
		});

		$("#save-circle").click(function() {
			if (!updateCircle) {
				var circlenew = new MapitoCircle(circle.getPosition(), map, {
					strokeColor: $("#circle-strokeColor").val(),
					strokeOpacity: $("#circle-strokeOpacity").val(),
					strokeWeight: $("#circle-strokeWeight").val(),
					fillColor: $("#circle-fillColor").val(),
					fillOpacity: $("#circle-fillOpacity").val(),
					radius: $("#circle-radius").val()
				});

				circlenew.id = getId();

				circles[circlenew.id] = circlenew;

				map.addListener(circlenew._obj,"dblclick",function () {
					circleForUpdate = circlenew;
					updateCircle = true;
					var options = circlenew.getOptions();
					$("#circle-strokeColor").val(options.strokeColor);
					$("#circle-strokeOpacity").val(options.strokeOpacity);
					$("#circle-strokeWeight").val(options.strokeWeight);
					$("#circle-fillColor").val(options.fillColor);
					$("#circle-fillOpacity").val(options.fillOpacity);
					$("#circle-radius").val(options.radius);
					$("#circle-radius").val(options.radius);
					$("#action").val("update")
					$('#circleModal').modal('show');
					$("#delete-circle").show();
				});
			} else {
				circleForUpdate.setOptions({strokeColor: $("#circle-strokeColor").val(),
					strokeOpacity: $("#circle-strokeOpacity").val(),
					strokeWeight: $("#circle-strokeWeight").val(),
					fillColor: $("#circle-fillColor").val(),
					fillOpacity: $("#circle-fillOpacity").val(),
					radius: $("#circle-radius").val()
				});
				circleForUpdate.setPosition(circle.getCenter());
				updateCircle = false;
				$("#delete-circle").hide();
			}
			saveCirclesinDB();
			circle.remove();
		});

		$('#markerModal').on("shown.bs.modal", function () {

			modalMap.initialize("marker-modal-map", {zoom: 12, center : map.getCenter()});

			if (!updateMarker) {
				marker = new MapitoMarker(map.getCenter(), modalMap, {});
				for (x in markers) {
					if(markers[x] != null) {
						var temp = new MapitoMarker(markers[x].getPosition(), modalMap, markers[x].getOptions());
					}
				}
			} else {
				marker = new MapitoMarker(markerForUpdate.getCenter(), modalMap, markerForUpdate.getOptions());
				modalMap.setCenter(marker.getCenter().lat, marker.getCenter().lon)
				for (x in markers) {
					if (markers[x] != null && markers[x].id != markerForUpdate.id) {
						var temp = new MapitoMarker(markers[x].getPosition(), modalMap, markers[x].getOptions());
					}
				}
			}

			$("#marker-position").val(map.getCenter().lat + "," + map.getCenter().lon);
			marker.draggable(true);

			modalMap.addListener(marker.getObj(),'dragend',function () {
				$("#marker-position").val(marker.getCenter().lat + "," + marker.getCenter().lon);
				marker.setPosition({lat: marker.getCenter().lat, lon: marker.getCenter().lon});
				$(".marker-settings").trigger( "change" );
			});

		});


		$("#save-marker").click(function () {

			if (!updateMarker) {
				var options = new Object();
				if ($("#marker-icon-url").val().trim() != '')
				options.icon = $("#marker-icon-url").val();

				var markernew = new MapitoMarker(marker.getPosition(), map, options);

				markernew.id = getId();

				markers[markernew.id] = markernew;

				map.addListener(markernew._obj,"dblclick",function () {
					markerForUpdate = markernew;
					updateMarker = true;
					var options = markernew.getOptions();
					$("#marker-icon-url").val(options.icon);
					$("#action").val("update")
					$('#markerModal').modal('show');
					$("#delete-marker").show();
				});
			} else {
				markerForUpdate.setOptions(marker.getOptions());
				markerForUpdate.setPosition(marker.getCenter());
				updateMarker = false;
			}

			saveMarkersInDB()
			marker.remove();
		});

		$("#delete-marker").click(function () {
			$("#delete-marker").hide();

			for (x in markers) {

				if (markers[x] != null && markers[x].id == markerForUpdate.id) {
					markers[x] = null;

				}
			}
			if (updateMarker) {
				markerForUpdate.remove();
			}
			marker.remove();
			updateMarker = false;
			saveMarkersInDB();
		});

		$(".marker-settings").on('change', function () {
			var options = new Object();

			if ($("#marker-icon-url").val() != '') {
				options.icon = $("#marker-icon-url").val();
			} else {
				delete options.icon;
			}

			marker.setOptions(options);

			var lat_regex = /^[0-9]+\.?[0-9]*/;
		    var lon_regex = /[0-9]+\.?[0-9]*$/;

		    var lati = lat_regex.exec($("#marker-position").val());
		    var long = lon_regex.exec($("#marker-position").val());

		    if ($.isNumeric(lati[0]) && $.isNumeric(long[0])) {
			    var newCen = {lat: lati[0], lon: long[0]};

			    marker.setPosition(newCen);
			    modalMap.setCenter(newCen.lat, newCen.lon);
			}
		});

	});


	$("#save-initialization").click(function(event) {

	    var $btn = $(this).button('loading');

		event.preventDefault();

		$.post( "/change_initialization", $("#map-initialization-form").serialize(), function( data ) {
			if (data.status == "ok") {
				savedMsg()
			} else {
				$("#errorMsg").show();
			}
			$btn.button('reset');
		}, "json");
	});

	$("#save-standard").click(function(event) {
		event.preventDefault();
		var $btn = $(this).button('loading');
		$.post( "/change_standard_controls", $("#standard-controls-form").serialize(), function( data ) {
			if (data.status == "ok") {
				savedMsg()
			} else {
				$("#errorMsg").show();
			}
			$btn.button('reset');
		}, "json");
	});

	$("#save-route-tracking").click(function(event) {

		$.post( "/change_tracking_control", $("#route-tracking-form").serialize(), function( data ) {
			if (data.status == "ok") {
				savedMsg();
			} else {
				$("#errorMsg").show();
			}

		}, "json");
	});

	$("#save-custom-pan").click(function(event) {
		$.post( "/change_custom_pan_control", $("#custom-pan-control-form").serialize(), function( data ) {
			if (data.status == "ok") {
				savedMsg();
			} else {
				$("#errorMsg").show();
			}

		}, "json");
	});

	$("#save-custom-zoom").click(function(event) {
		$.post( "/change_custom_zoom_control", $("#custom-zoom-control-form").serialize(), function( data ) {
			if (data.status == "ok") {
				savedMsg();
			} else {
				$("#errorMsg").show();
			}

		}, "json");
	});


	$("#custom-pan-control-form").change(function () {
		if (typeof customPan != "undefined") {
			customPan.remove();
		}

		if($('#custom-pan-enable').is(':checked')) {
			customPan = new CustomPan(map, {
				position: $("#custom-pan-position option:selected").val(),
				background : {
					shape: $('input[name=bgshape]:checked', '#custom-pan-control-form').val(),
					color: $('input[name=bgcolor]', '#custom-pan-control-form').val(),
					size: $('input[name=bgsize]', '#custom-pan-control-form').val()
				},
				buttons : {
					shape: $('input[name=btnshape]:checked', '#custom-pan-control-form').val(),
					color: $('input[name=btncolor]', '#custom-pan-control-form').val(),
					size: $('input[name=btnsize]', '#custom-pan-control-form').val()
				},
				border : {
					color: $('input[name=brdrcolor]', '#custom-pan-control-form').val(),
					width: $('input[name=brdrwidth]', '#custom-pan-control-form').val()
				}
			});
		} else {
			if (typeof customPan != "undefined") {
				customPan.remove();
			}
		}
	});


	$("#custom-zoom-control-form").change(function () {
		if (typeof customZoom != "undefined") {
			customZoom.remove();
		}

		if($('#custom-zoom-enable').is(':checked')) {
			customZoom = new CustomZoom(map, {
				position: $("#custom-zoom-position option:selected").val(),
				background : {
					length: $('input[name=bglength]', '#custom-zoom-control-form').val(),
					color: $('input[name=bgcolor]', '#custom-zoom-control-form').val(),
					layout: $('input[name=bglayout]:checked', '#custom-zoom-control-form').val()
				},
				buttons : {
					color: $('input[name=btncolor]', '#custom-zoom-control-form').val(),
					size: $('input[name=btnsize]', '#custom-zoom-control-form').val()
				},
				border : {
					color: $('input[name=brdrcolor]', '#custom-zoom-control-form').val(),
					width: $('input[name=brdrwidth]', '#custom-zoom-control-form').val()
				}
			});
		} else {
			customZoom.remove();
		}
	});

});

// Custom control background shape

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


function customPanControl(options) {

	var controlDiv = document.createElement('div');

	controlDiv.style.padding = '5px';

	if (map == "bing") {
		controlDiv.style.zIndex = 1;
	}

	var width = parseInt(options.background.size);
	var height = parseInt(options.background.size);
	controlDiv.style.width = 1.1 * width +'px';
	controlDiv.style.height = 1.1 * width + 'px';

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
		panTop.style.width = options.buttons.size + 'px';
		panTop.style.height = options.buttons.size + 'px';
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
		panBottom.style.width = options.buttons.size + 'px';
		panBottom.style.height = options.buttons.size + 'px';
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
		panLeft.style.width = options.buttons.size + 'px';
		panLeft.style.height = options.buttons.size + 'px';
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
		panRight.style.width = options.buttons.size + 'px';
		panRight.style.height = options.buttons.size + 'px';
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
	this._obj = map.pushControl(customPanControl(this._options), this._options.position);

}

CustomPan.prototype = {

		setOptions : function (options) {
			for (x in options) {
				this._options[x] = options[x];
			}
			this._map.removeControl(this._obj);
			this._obj = this._map.pushControl(customPanControl(this._options), this._options.position);

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

function mapitoCustomZoomBgShape(options) {
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


// end bg pan control shapes


function customZoomControl(options) {

	var controlDiv = document.createElement('div');

	controlDiv.style.padding = '5px';


	if (map == "bing") {
		controlDiv.style.zIndex = 1;
	}

	var width = parseInt(options.background.length);
	var height = parseInt(options.background.length);

	if (options.background.layout == "vertical") {
		controlDiv.style.width = 0.6 * width +'px';
		controlDiv.style.height = 1.1 * width + 'px';
	} else {
		controlDiv.style.width = 1.1 * width +'px';
		controlDiv.style.height = 0.6 * width + 'px';
	}

	controlDiv.style.userSelect = "none";
	controlDiv.style.webkitUserSelect = "none";
	controlDiv.style.MozUserSelect = "none";

	var bgshape = mapitoCustomZoomBgShape(options);

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
	this._obj = map.pushControl(customZoomControl(this._options), this._options.position);

}

CustomZoom.prototype = {

		setOptions : function (options) {
			for (x in options) {
				this._options[x] = options[x];
			}
			this._map.removeControl(this._obj);
			this._obj = this._map.pushControl(customZoomControl(this._options), this._options.position);

		},

		getObj : function () {
			return this._obj;
		},

		remove : function () {
			this._map.removeControl(this._obj);
		}
}


function getAndSetCenterInputs() {
	setCenterInputs(map.getCenter().lat, map.getCenter().lon);
}

function getAndSetZoomInput() {
	setZoomInput(map.getZoom());
}

function setCenterInputs(lat, lon) {
	 $("#center-latitude").val(lat);
	 $("#center-longitude").val(lon);
}

function setZoomInput(zoom) {
	 $("#center-zoom").val(parseInt(zoom));
}

var savedLoad;
function savedMsg() {
	clearTimeout(savedLoad)
	$("#savedMsg").show();
	savedLoad = setTimeout(function() {
		$("#savedMsg").hide('slow');
	}, 3000);
}

function getId() {
	simpleId += 1;
	return simpleId;
}


function saveMarkersInDB() {
	var markersToPost = [];
	for (x in markers) {
		if (markers[x] != null) {
			markersToPost.push({position : markers[x].getPosition(), icon : markers[x].getOptions().icon });
		}
	}
	$.post("/change_markers", { mapid : $("#map-id").val(), data : markersToPost });
}

function saveCirclesinDB() {
	var circlesToPost = [];
	for (x in circles) {
		if (circles[x] != null) {
			circlesToPost.push({
				position : circles[x].getPosition(),
				strokeColor: circles[x].getOptions().strokeColor,
				strokeOpacity: circles[x].getOptions().strokeOpacity,
				strokeWeight: circles[x].getOptions().strokeWeight,
				fillColor: circles[x].getOptions().fillColor,
				fillOpacity: circles[x].getOptions().fillOpacity,
				radius: circles[x].getOptions().radius
			});
		}
	}
	$.post("/change_circles", { mapid : $("#map-id").val(), data : circlesToPost });
}


/********************************
 ******* ROUTE TRACKING *********
 ********************************/

var tracking = false;
function startControl() {

	var controlDiv = document.createElement('div');

	// Set CSS for the control border
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#00FF00';
	controlUI.style.width='60px';
	controlUI.style.height='60px';
	controlUI.style.borderRadius = "50%";
	controlUI.style.cursor = 'pointer';
	controlUI.style.border = '2px solid #000';
	controlUI.style.boxShadow = "1px 2px 3px #606060 ";
	controlUI.style.textAlign = 'center';
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var start = document.createElement('span');
	start.style.fontFamily = 'Arial,sans-serif';
	start.style.fontSize = '22px';
	start.style.display = "inline-block"
	start.style.margin = "0 auto";
	start.style.position = "relative";
	start.style.top = parseInt(controlUI.style.height)/2 + "px";
	start.style.transform = "translateY(-50%)";
	start.style.webkitTransform = "translateY(-50%)";
	start.style.msTransform = "translateY(-50%)";
	start.innerHTML = '<b>Start</b>';
	controlUI.appendChild(start);

	map.addListener(controlUI, 'click', function () {
		if (tracking) {
			stopTracking();
			start.innerHTML = '<b>Start</b>';
			controlUI.style.backgroundColor = '#00FF00';
			tracking = false;
		} else {
			startTracking();
			start.innerHTML = '<b>Stop</b>';
			controlUI.style.backgroundColor = '#FF0000';
			tracking = true
		}
	})

	return controlDiv;

}

var path = [];

function startTracking() {

	$("#google-start-control").hide();
	$("#google-stop-control div").show();

	var geo_options = {
	  enableHighAccuracy: true,
	  timeout: 4000
	};
	var startTrue = true;
	if (navigator.geolocation) {

	     navigator.geolocation.getCurrentPosition(function (position) {
	         map.setCenter(position.coords.latitude, position.coords.longitude);
	         path.push({lat: position.coords.latitude, lon: position.coords.longitude})
	     });

	     watchID = navigator.geolocation.watchPosition(function (position) {

         	map.setCenter(position.coords.latitude, position.coords.longitude);
         	map.setZoom(16)
         	path.push({lat: position.coords.latitude, lon: position.coords.longitude})


         	if (startTrue) {
         		var marker = new MapitoMarker(
         			{lat: position.coords.latitude, lon: position.coords.longitude},
         			map,
		 		    { icon: "../images/rt_start_flag.png"}
		 		);
         		startTrue = false;
         	}

         	var pathLine = new MapitoLine(path, map, {strokeColor: '#FF0000', strokeWeight: 8});

	    }, function () {
	        alert('Error locating your device. Make sure that you have enabled GPS.');
	    },
	    geo_options);
	 }
}

function stopTracking(){
	navigator.geolocation.clearWatch(watchID);
	if (path.length > 0 ) {
		var marker = new MapitoMarker(
			{lat: path[path.length-1].lat, lon: path[path.length-1].lon},
			map,
		    { icon: "../images/rt_stop_flag.png"}
		);
	}
}
