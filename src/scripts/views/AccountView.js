define([
'parse',
'views/BaseView',
'views/AccountRoomCardView',
'views/AccountRequestCardView',
'text!templates/AccountTemplate.html'
], function(Parse, BaseView, AccountRoomCardView, AccountRequestCardView, AccountTemplate) {
	var View = BaseView.extend({

		className: "view-account",

		template: _.template(AccountTemplate),

		render: function() {
			BaseView.prototype.render.call(this);
					
			this.renderRequests();
			this.renderRooms();

			return this;
		},

		renderRequests: function() {
			var self = this;

			var query = Parse.User.current().get('profile').relation('requests').query();
			query.include('room');

			self.card('requests').html('<div class="loader"><img src="/resources/loader-gray.gif" /></div>');

			query.find().then(function(requests) {

				if( requests.length === 0 ) {
					self.card('requests').html('<p class="text-center">You don\'t have any request at the moment.</p><p class="text-center">You can <a href="/rooms" class="btn btn-primary btn-sm">Browse Rooms</a> to find your perfect room.</p>');
					return ;
				}

				self.card('requests').html('');

				_.each(requests, function(request, index) {
					self.card('requests').append(new AccountRequestCardView({ parent: self, model: request }).render().el);

				});
			});
		},

		renderRooms: function() {
			var self = this;

			var query = Parse.User.current().get('profile').relation('rooms').query();

			self.card('rooms').html('<div class="loader"><img src="/resources/loader-white.gif" /></div>');

			query.find().then(function(rooms) {
				
				if( rooms.length === 0 ) {
					self.card('rooms').html('<p class="text-center">You don\'t have any rooms at the moment.</p><p class="text-center">You can <a href="/room/create" class="btn btn-primary btn-sm">List My Room</a> on the website.</p>');
					return ;
				}

				self.card('rooms').html('');

				_.each(rooms, function(room, index) {
					self.card('rooms').append(new AccountRoomCardView({ parent: self, model: room }).render().el);

				});
			});
		},
	});
	return View;
});