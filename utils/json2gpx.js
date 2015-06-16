// This util converts a MongoDB document which represents a GPS route to a GPX XML file

var xmlbuilder = require('xmlbuilder');

module.exports = function (route) {

	var xml = xmlbuilder.create('gpx').dec('1.0', 'UTF-8');

	xml.att('creator', "Mapito.org");
	xml.att('xmlns', "http://www.topografix.com/GPX/1/1");
	xml.att('xmlns:topografix', "http://www.topografix.com/GPX/Private/TopoGrafix/0/1");
	xml.att('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance");
	xml.att('xsi:schemaLocation', "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.topografix.com/GPX/Private/TopoGrafix/0/1 http://www.topografix.com/GPX/Private/TopoGrafix/0/1/topografix.xsd");
	xml.end({ pretty: true });

	var trk = xml.ele("trk");

	var trkseg = trk.ele("trkseg");

	for(var j=1;j<route.points.length;j++) {

		var trkpt = trkseg.ele('trkpt');

		trkpt.att('lat', route.points[j].lat.toFixed(6));
		trkpt.att('lon', route.points[j].lon.toFixed(6));

		var ele = trkpt.ele("ele", (route.points[j].ele || 0) );

		var time = trkpt.ele("time", route.points[j].time.toISOString());

	}

	var gpx = xml.end({ pretty: true, indent: '  ', newline: '\n' });

	return gpx;

}
