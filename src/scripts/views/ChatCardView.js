define([
'parse',
'models/ChatMessageModel',
'views/BaseView',
'views/ChatMessageCardView',
'text!templates/ChatCardTemplate.html'
], function(Parse, ChatMessageModel, BaseView, ChatMessageCardView, ChatCardTemplate){
	var View = BaseView.extend({

		className: "card-chat",

		template: _.template(ChatCardTemplate),

		events: {
			'submit .form-chat': 'save',
			'scroll .panel-body': 'prev',
		},

		last: null,
		first: null,
		query: null,

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;
			
			var query = this.model.relation('chat').query();
			query.limit(20);
			query.descending('createdAt');
			query.include('profile');
			query.include('request');
			query.include('request.room');
			query.find(function(messages) {
				
				if( messages.length === 0 ) {
					self.find('.panel-body').html('<p class="text-center empty"><em>No messages yet, be the first and say Hi! ;-)</em></p>');
					return ;
				}

				self.first = messages[0].createdAt;
				_.each(messages.reverse(), function(message) {
					self.append(message);
				});
				self.scrollChat();

			}, function(error) {
				console.error("Error with query", query);
				console.error(error);
			});

			if( this.model.get('status') === 'pending' ) {
				setInterval(function() {
					self.display();
				}, 1000);
			}

			return this;
		},

		scrollChat: function() {
			this.find('.panel-body').animate({ scrollTop: this.find('.panel-body').height()}, 'slow');
		},

		display: function() {
			
			var self = this;

			var query = this.model.relation('chat').query();
			query.ascending('createdAt');
			query.include('profile');
			query.include('request');
			query.include('request.room');

			if( self.last ) {
				query.greaterThan('createdAt', self.last);
			}

			query.find(function(messages) {

				if( !messages ) {
					// When refreshing it makes an error, I guess
					// it's because of timer, so lets try this trick...
					return ;
				}

				if( self.last && self.find('.panel-body .empty') ) {
					self.find('.panel-body .empty').remove();
				}

				if( messages.length === 0 ) {
					return ;
				}

				_.each(messages, function(message) {
					self.append(message);
				});
				
				self.scrollChat();

				query.count().then(function(total) {
					if( total > 0 ) {
						self.display();
					}
				});
			}, function(error) {
				console.error("Error with query", query);
				console.error(error);
			});

		},

		prev: function() {
			var self = this;
			var query = this.model.relation('chat').query();
			query.descending('createdAt');
			query.include('profile');
			query.include('request');
			query.include('request.room');

			if( self.first ) {
				query.lessThan('createdAt', self.first);
			}

			query.find(function(messages) {
				_.each(messages, function(message) {
					self.prepend(message);
				});
				self.after
			}, function(error) {
				console.error("Error with query", query);
				console.error(error);
			});
		},

		next: function() {
			this.display();
		},

		append: function(model) {
			this.find('.panel-body').append(new ChatMessageCardView({ parent: this, model: model }).render().$el.fadeIn());
			this.last = model.createdAt;
		},

		prepend: function(model) {
			this.find('.panel-body').prepend(new ChatMessageCardView({ parent: this, model: model }).render().$el.hide().fadeIn());
			this.first = model.createdAt;
		},

		save: function(event) {
			this.stop(event);

			var self = this;

			if( this.loading(this.field('message')) ) {
				self.loading();
				return true;
			}

			this.cleanForm();

			new ChatMessageModel().save({
				profile: Parse.User.current().get('profile'),
				message: this.field('message').val(),
				request: this.model,
			}).then(function() {
				console.warn(this.className + ' Append chat message after sending');
				self.loading();
				self.field('message').val('');
			}, function(e) {
				self.handleErrors(e);
			})
			
		},

	});
	return View;
});