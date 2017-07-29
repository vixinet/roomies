define([
'parse',
'views/FooterCardView',
], function(Parse, FooterCardView){
	var View = Parse.View.extend({

		el: document,

		events: {
			'globalError': 'displayError',
			'globalInfo': 'displayInfo',
			'globalMessage': 'displayMessage',
		},

		displayError: function(event, message) {
			this.displayMessage(event, { type: 'error', text: message });
		},

		displayInfo: function(event, message) {
			this.displayMessage(event, { type: 'info', text: message });
		},

		displayMessage: function(event, params) {
			if( $('.display-messages').length > 0) {
				$('<p>')
				.text(params.text)
				.addClass('alert')
				.addClass(params.type == 'error' ? 'alert-danger' : 'alert-info')
				.appendTo('.display-messages');
			} else {
				alert(params.type + "\n\n" + params.text);
			}
		},

		initialize: function(cb) {

			var self = this;
			
			if( window.dvpt ) {
				$('body').append('<div class="size visible-lg">LG</div><div class="size visible-md">MD</div><div class="size visible-sm">SM</div><div class="size visible-xs">XS</div>');
			}

			Parse.Config.get().then(function() {
				return Parse.FacebookUtils.init({
					appId      : Parse.Config.current().get('facebook_app_id'),
					cookie     : true,
					xfbml      : true,
					version    : 'v2.5',
				});
			}).then(function() {
				if( Parse.User.current() && Parse.User.current().get('profile') ) {
					return Parse.User.current().get('profile').fetch();
				}
			}).then(function(user) {
				self.$el.find('[card="footer"]').html(new FooterCardView({ parent: null }).render().el);
				cb()
			}, function(e) {
				if( e.code === 209) {
					Parse.User.logOut();
				}
			})
		},
	});
	return View;
});