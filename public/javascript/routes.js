function getRandomColor() {
    var letters = '0123456789AB'.split(''); // not CDEF
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 12)]; //*16
    }
    return color;
}

var markers = {};
var map;
var routeColors = {};

$(document).ready(function() {
	$("#navbar-routes").addClass("active");
	
	$('.modal-dialog').draggable({
        handle: ".modal-header, .modal-footer"
    });

	var mapData = JSON.parse($("#map-data").val());
    var routes = JSON.parse($("#routes-data").val());

	loadMapitoApi(mapData.service, function () {

		map = new Mapito(mapData.service);

        map.initialize("mapito-map", {
            zoom: 14
        });
		map.setAccurateCenter("ip-based");

		var center_map = false;

        for (var i=0;i<routes.length;i++) {

        	var r = routes[i];
        	var coords = routes[i].points;

        	if (typeof r.points[0] != "undefined") {
                markers[r._id] = new MapitoMarker(
         			{
                         lat: r.points[0].lat,
                         lon: r.points[0].lon
                    },
         			map,
    	 		    {icon: "../images/rt_start_flag.png"}
    	 		);
                if (!center_map) {
                	map.setCenter(r.points[0].lat,r.points[0].lon)
                	center_map = true;
                }
        	}

            if (typeof r.points[r.points.length -1] != "undefined") {
                var marker = new MapitoMarker(
                    {lat: r.points[r.points.length -1].lat, lon: r.points[r.points.length -1].lon},
                    map,
                    { icon: "../images/rt_stop_flag.png"}
                );
            }

            var rcolor = getRandomColor();
        	var line = new MapitoLine(coords, map, {strokeColor: rcolor, strokeWeight: 8});
            $("#" + r._id).css({'background-color' : rcolor});
			routeColors[r._id] = rcolor;

        }
	});

    $("#smooth").click(function (event) {
        event.preventDefault();
        $("#smooth-download").attr("href", "/smoothing?format=gpx&routeId=" + $('input[name="route_id"]:checked').val());

        $.getJSON( "/smoothing?format=json&routeId=" + $('input[name="route_id"]:checked').val(), function( data ) {
            loadMapitoApi(mapData.service, function () {
			
				var routeId = $('input[name="route_id"]:checked').val();
				
                var modalMap = new Mapito(mapData.service);

                modalMap.initialize("modal-map", {
                    zoom: 16
                });

                if (typeof data.points[0] != "undefined") {
                var dmarker2 = new MapitoMarker(
                    {
                         lat: data.points[0].lat,
                         lon: data.points[0].lon
                    },
                    modalMap,
                    {icon: "../images/rt_start_flag.png"}
                );

                    modalMap.setCenter(data.points[0].lat, data.points[0].lon)
            	}

                if (typeof data.points[data.points.length -1] != "undefined") {
                    var dmarker2 = new MapitoMarker(
                        {lat: data.points[data.points.length -1].lat, lon: data.points[data.points.length -1].lon},
                        modalMap,
                        { icon: "../images/rt_stop_flag.png"}
                	);
            	}

                var modalLine = new MapitoLine(data.points, modalMap, {strokeColor: routeColors[routeId], strokeWeight: 8});
            });

            $("#smoothModal").modal('show');

        });
    });

    $("input[type=radio]").click(function (event) {
        var marker_center = markers[$(this).val()].getCenter();
        map.setCenter(marker_center.lat, marker_center.lon);
    })

});

function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = '#' + parts.join('');
}
