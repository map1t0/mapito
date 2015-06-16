var R = 6.3710e+6;

function deg2rad(angle) {
  return angle * .017453292519943295; // (angle / 180) * Math.PI;
}

function getDistance(p1, p2){
	var dLat = deg2rad(parseFloat(p2.lat) - parseFloat(p1.lat)); //deg2rad below
	var dLon = deg2rad(parseFloat(p2.lon) - parseFloat(p1.lon));
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(parseFloat(p1.lat))) * Math.cos(deg2rad(parseFloat(p2.lat))) * Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; //Distance in m
	return d;
}

function findTimeDif(start_time, end_time){
	var endDate = new Date(end_time);
	var end = endDate.getTime() / 1000;

	var startDate = new Date(start_time);
	var start = startDate.getTime() / 1000;

	return end - start;
}

function averageSpeed(route) {
	var points = route.points;

	var distance = 0;

	for (var i=0;i<points.length-1;i++) {
		distance += getDistance(points[i], points[i+1])
	}

	var average = distance / (findTimeDif(points[0].time, points[points.length - 1].time));

	return average.toFixed(2);
}

function discardMaxSpeedPointsOfGpxFile(route){

	var i;

	var points = route.points;

	var size = route.points.length;
	var MAX_SPEED = 1.1 * averageSpeed(route);

	var discardPoints = new Array(size);

	for (i=0; i< size; i++) {
		discardPoints[i] = false;
	}

	for (i=0; i<size-1; i++){

		var point1 = points[i];
		var point2 = points[i + 1];

		var distance = getDistance(point1, point2);
		var timeDiff = findTimeDif(point1.time, point2.time);

		var div = distance/timeDiff;

		if (div > MAX_SPEED){

			discardPoints[i + 1] = true

			var firstPoint = i;
			var secondPoint = i + 2;

			if (typeof points[secondPoint] != "undefined") {

				var outOfBounds = false;

				while (div > MAX_SPEED && !outOfBounds){
					point1 = points[firstPoint];

					if (typeof points[secondPoint] != "undefined"){

						point2 = points[secondPoint];

						distance = getDistance(point1, point2);
						timeDiff = findTimeDif(point1.time, point2.time);
						div = distance / timeDiff;

						if (div > MAX_SPEED) {

							discardPoints[secondPoint] = true

							secondPoint += 1;
						}
					} else{
						outOfBounds = true;
					}
				}
			}
		}
	}

	if (discardPoints.length >= 1) {
		for (i=discardPoints.length-1; i>=0; i--){
			if (discardPoints[i])
				route.points.splice(i, 1);
		}
	}

	return route;
}


module.exports = discardMaxSpeedPointsOfGpxFile;
