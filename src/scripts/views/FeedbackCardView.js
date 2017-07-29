define([
'parse',
'views/BaseView',
'text!templates/FeedbackCardTemplate.html'
], function(Parse, BaseView, FeedbackCardTemplate){
	var View = BaseView.extend({

		className: "card-feedback",

		template: _.template(FeedbackCardTemplate),

		events: {
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);
			
			var self = this;

			if( this.loading('[type="submit"]', 'Sending Feedback ...') ) {
				return true;
			}

			this.cleanForm();
			
			this.model.save({
				email: this.field('email').val(),
				profile: Parse.User.current() && Parse.User.current().get('profile') ? Parse.User.current().get('profile') : null,
				feedback: this.field('feedback').val(),
			}).then(function(feedback) {
				self.$el.find('form *').fadeOut(function() {
					var msg = $('<p class="info">Thank you for your Feedback. We are thrilled to read it!</p>').hide()
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