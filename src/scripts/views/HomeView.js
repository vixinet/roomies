define([
'parse',
'views/BaseView',
'text!templates/HomeTemplate.html',
], function(Parse, BaseView, HomeTemplate){
	var View = BaseView.extend({

		className: "view-home",

		template: _.template(HomeTemplate),

		render: function() {
			BaseView.prototype.render.call(this);

			// this.parseFile();

			return this;
		},

		parseFile: function() {
			var self = this;
			$.ajax({
				url: 'sample/helsinki-metropolitan-area.kml',
				dataType: 'xml',
				success: function(data) {

					var out = {};

					var latlng = function(s) {
						var o = [];
						_.each(s.trim().split(' '), function(x) {
							y = x.split(',');
							o.push({
								lng: parseFloat(y[0]),
								lat: parseFloat(y[1])
							});
						})
						return o;
					};

					$(data).find('Placemark').each(function() {
						var p = $(this);

						// KML id... we have nothing else for id districts
						var id = p.attr('id');
						
						// Municipality Code
						var mc = p.find('[name="kuntatunnus"]').text();

						// Municipality Name
						var mn = self.capitalize(p.find('[name="kuntanimi"]').text().toLowerCase());

						// International Code
						var ic = p.find('[name="aatunnus"]').text();

						// District name
						var dn = self.capitalize(p.find('[name="aa_nimi_fi"]').text().toLowerCase());

						// Coordinates
						var co = latlng(p.find('coordinates').text().trim());
						
						// Release date
						var rd = p.find('[name="julkaisupvm"]').text();

						if( !out[mc] ) {
							out[mc] = {
								key: mc,
								name: mn,
								districts: {},
								_districts: {}
							}
						}
						
						var d = { 
							key: ic, 
							name: dn, 
							coords: [co]
						};

						if( / [A-Z]$/.test(dn) ) {
							var sn = dn.substring(0, dn.length-2);

							if( !out[mc]._districts[sn] ) {
								out[mc]._districts[sn] = {
									name: sn,
									districts: []
								};
							}

							out[mc]._districts[sn].districts.push(d);

						} else {
							out[mc].districts[ic] = d;
						}
					});
					
					_.each(out, function(o, mc) {
						_.each(o._districts, function(s) {
							var ic = _.first(_.sortBy(s.districts, 'name')).key;
							var dn = s.name;
							
							out[mc].districts[ic] = { 
								key: ic, 
								name: dn, 
								coords: [],
								// sub: []
							}

							_.each(s.districts, function(x) {
								out[mc].districts[ic].coords.push(x.coords[0]);
								// out[mc].districts[ic].sub.push(x);
							});
						});

						out[mc] = _.omit(o, '_districts');
					});
					
					self.find('header').html($('<textarea cols="100" rows="10">').val(JSON.stringify(out)).select())
				},
				error: function(data){
					console.log('Error loading XML data');
				}
			});
		},

	});
	return View;
});