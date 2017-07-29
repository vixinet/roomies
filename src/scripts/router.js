define([
	'parse',
	'models/RoomModel',
	'models/RequestModel',
	'models/ProfileModel',
	'views/NotFoundView',
	'views/GuestView',
	'views/AccountView',
	'views/ProfileCreateView',
	'views/HomeView',
	'views/RoomCreateView',
	'views/RoomView',
	'views/RoomsView',
	'views/PrivacyPolicyView',
], function(Parse, RoomModel, RequestModel, ProfileModel, NotFoundView, GuestView, AccountView, ProfileCreateView, HomeView, RoomCreateView, RoomView, RoomsView, PrivacyPolicyView) {
	var Router = Parse.Router.extend({

		routes: {
			'sign-out': 'signOut',
			'account': 'showAccountView',
			'rooms': 'showRoomsView',
			'room/create': 'showRoomCreateView',
			'room/:room': 'showRoomView',
			'room/:room/:scroll': 'showRoomView',
			'not-found': 'showNotFoundView',
			'privacy': 'showPrivacyPolicyView',
			'*actions': 'showHomeView',
		},

		currentView: null,

		signOut: function() {
			Parse.User.logOut();
			this.showHomeView();
		},

		showHomeView: function() {
			this.render(new HomeView());
		},

		showAccountView: function() {
			this.handleGuests(function(self) {
				self.render(new AccountView({ model: Parse.User.current().get('profile') }));
			});
		},

		showRoomsView: function() {
			this.render(new RoomsView());
		},

		showRoomCreateView: function() {
			this.handleGuests(function(self) {
				self.render(new RoomCreateView({ model: new RoomModel() }));
			});
		},

		showRoomView: function(room, scroll) {
			var self = this;
			var data = {};
			var promises = [];
			
			if( typeof scroll !== typeof undefined ) {
				_.extend(data, { scroll: scroll });
			}

			var queryRoom = new Parse.Query(RoomModel);
			queryRoom.include('profile');
			queryRoom.get(room).then(function(room) {

				var promise = null;

				if( Parse.User.current() && Parse.User.current().get('profile') ) {
					var query = room.relation('requests').query();
					query.include('room');
					query.include('room.profile');
					query.include('room.profile.user');
					query.include('profile');
					query.include('profile.user');
					query.equalTo('profile', Parse.User.current().get('profile'));
					promise = query.find();
				} else {
					promise = new Parse.Promise();
					promise.resolve([undefined]);
				}

				promise.then(function(requests) {
					_.extend(data, { 
						model: room,
						request: requests[0]
					});
					self.render(new RoomView(data));
				}, function(e) {
					self.showNotFoundView()
				})
			}, function(e) {
				self.showNotFoundView()
			});
		},
		
		showNotFoundView: function() {
			this.render(new NotFoundView());
		},
		
		showPrivacyPolicyView: function() {
			this.render(new PrivacyPolicyView());
		},

		handleGuests: function(cb) {

			if( !Parse.User.current() ) {
				this.render(new GuestView());
				return;
			} 

			if( !Parse.User.current().get('profile') ) {
				this.render(new ProfileCreateView({ model: new ProfileModel() }));
				return;
			}

			cb(this);
		},

		render: function(view) {

			if( this.currentView != null ) {
				this.currentView.teardown();
			}
			
			$("#app").html( view.render().el );

			setTimeout(function() {
				view.afterRenderInsertedToDom();
			}, 0);

			$('body').animate({ scrollTop: 0 });

			this.currentView = view;
		}

	});
	return Router;
});
