define([
'parse',
'json!jsons/gmaps.styles.json',
'models/RoomModel',
'views/BaseView',
'views/RoomCardView',
'text!templates/RoomsTemplate.html',
'goog',
], function(Parse, GMapsStyles, RoomModel, BaseView, RoomCardView, RoomsTemplate) {
	var View = BaseView.extend({

		className: "view-rooms",

		template: _.template(RoomsTemplate),
		
		events: {
			'change [name="city"]': 'renderRooms',
			'change [name="gender"]': 'renderRooms',
			'slideStop [name="rent"]': 'renderRooms',
			'slideStop [name="surface"]': 'renderRooms',
			'click .more': 'renderNextRooms',
		},

		gmap: null,
		gmarkers: {},
		timeouts: [],
		query: null,
		displayed: 0,
		itemsPerPage: 12,

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			this.field('rent').slider({
				range: true,
				min: 0,
				max: 1500,
				step: 10,
				value: [0, 1500],
				tooltip_split: true,
				tooltip_position: 'top',
			});

			this.field('surface').slider({
				range: true,
				min: 0,
				max: 60,
				value: [0, 60],
				tooltip_split: true,
				tooltip_position: 'top',
			});

			_.each(Parse.Config.current().get('CST_CITIES'), function(object, key) {
				self.find('.cities').append($('<div class="checkbox"><label><input type="checkbox" value="'+key+'" name="city"> '+object.name+'</label></div>'))
			});
			self.field('city').prop('checked', true)

			require(["goog!maps,3,other_params:key=" + Parse.Config.current().get("google_api_browser_key")], function() {
				
				var styledMap = new google.maps.StyledMapType(GMapsStyles, {name: "Roomies Map"});

				self.gmap = new google.maps.Map(self.find('.map')[0], {
					center: new google.maps.LatLng(60.192059, 24.945831),
					zoom: 11,
					mapTypeControlOptions: {
						mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
					}
				});

				self.gmap.mapTypes.set('map_style', styledMap);
  				self.gmap.setMapTypeId('map_style');

				self.renderRooms();
			});

			return this;
		},

		renderRooms: function() {
			var self = this;

			self.displayed = 0;

			self.query = new Parse.Query(RoomModel);
			self.query.equalTo('status', 'online');
			self.query.limit(self.itemsPerPage);

			self.query.greaterThanOrEqualTo('rent', self.field('rent').slider('getValue')[0]);
			self.query.lessThanOrEqualTo('rent', self.field('rent').slider('getValue')[1]);

			self.query.greaterThanOrEqualTo('surface', self.field('surface').slider('getValue')[0]);
			self.query.lessThanOrEqualTo('surface', self.field('surface').slider('getValue')[1]);

			var cities = [];
			_.each(self.find('[name="city"]:checked'), function(item) {
				cities.push($(item).val());
			});

			var genders = [];
			_.each(self.find('[name="gender"]:checked'), function(item) {
				genders.push($(item).val());
			});

			self.query.containedIn('city', cities);
			self.query.containedIn('gender', genders);
			
			self.card('rooms').html('<div class="loader"><img src="/resources/loader-white.gif" /></div>');

			self.parseQueryRooms(true);
		},

		renderNextRooms: function(event) {
			var self = this;
			var parent = $(event.currentTarget).closest('div');

			parent.html('<img src="/resources/loader-white.gif" />');

			self.query.skip(self.displayed);
			self.parseQueryRooms(false, function() {
				parent.remove();
			})
		},

		parseQueryRooms: function(reset, cb) {
			var self = this;

			return Parse.Promise.when(self.query.find(), self.query.count()).then(function(rooms, total) {

				self.displayed += rooms.length;

				if( reset ) {
					_.each(self.gmarkers, function(marker) {
						marker.setMap(null);
					});	

					_.each(self.timeouts, function(timeout) {
						clearTimeout(timeout);
					});

					if( rooms.length === 0 ) {
						self.card('rooms').html('<div class="text-center"><p class="lead">Ooops...</p><p>No room matching your search criteria was found.</p></div>');
						return ;
					}

					self.card('rooms').html('');
				} 

				// var bounds = new google.maps.LatLngBounds();

				_.each(rooms, function(room, index) {

					var card = new RoomCardView({ parent: self, model: room }).render().el;
					var location = new google.maps.LatLng({ lat: room.get('location').latitude, lng: room.get('location').longitude });
					
					// bounds.extend(location);

					self.card('rooms').append($('<div class="col-sm-12 col-md-8 col-lg-8">').append(card));

					var timeout = setTimeout(function() {
						var marker = new google.maps.Marker({
							map: self.gmap,
							position: location,
							animation: google.maps.Animation.DROP,
							icon: 'resources/icon-pin.png'
						})

						marker.addListener('click', function() {
							new google.maps.InfoWindow({
								content: card,
								maxWidth: 250
							}).open(self.gmap, marker);
						});

						self.gmarkers[room.id] = marker;
						self.timeouts.slice(_.indexOf(self.timeouts, timeout), 1);
					}, index * 200);

					self.timeouts.push(timeout);
				});

				// var boundsUnion = new google.maps.LatLngBounds();
				// boundsUnion.union(bounds);
				// self.gmap.fitBounds(boundsUnion);

				if( total > self.displayed ) {
					self.card('rooms').append('<div class="col-xs-24 text-center"><button class="more btn btn-primary">Show more rooms</button></div>')
				}

				if( cb ) {
					cb();
				}
			});
		},

		afterRenderInsertedToDom: function() {
			BaseView.prototype.afterRenderInsertedToDom.call(this);	
		}

	});
	return View;
});