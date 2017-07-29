define([
'parse',
'views/BaseView',
'text!templates/NewsletterCardTemplate.html'
], function(Parse, BaseView, NewsletterCardTemplate){
	var View = BaseView.extend({

		className: "card-newsletter",

		template: _.template(NewsletterCardTemplate),

		events: {
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);
			
			var self = this;

			if( this.loading('[type="submit"]', 'Subscribing ...') ) {
				return true;
			}

			this.cleanForm();
			
			this.model.save({
				email: this.field('email').val(),
				profile: Parse.User.current() && Parse.User.current().get('profile') ? Parse.User.current().get('profile') : null,
			}).then(function(newsletter) {
				self.$el.find('.form-group, p:not(.lead)').fadeOut(function() {
					var msg = $('<p class="info">Thank you! Your address email was added to the Newsletter list!</p>').hide()
					self.$el.find('form').html(msg);
					msg.fadeIn();	
				});
			}, function(e) {
				self.handleErrors(e);
			});
		},
	});
	return View;
});