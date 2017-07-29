define([
'parse',
'models/UserModel',
'views/BaseView',
'text!templates/SignUpCardTemplate.html'
], function(Parse, UserModel, BaseView, SignUpCardTemplate) {
	var View = BaseView.extend({

		className: "card-sign-up",

		template: _.template(SignUpCardTemplate),

		events: {
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);

			var self = this;
			
			if( this.loading('[type="submit"]', 'Creating Account ...') ) {
				return true;
			}

			this.cleanForm();

			console.table({
				email: this.field('email').val(),
				password: this.field('password').val(),
				confirmation: this.field('confirmation').val(),
			});
			
			new UserModel().localSignUp({
				email: this.field('email').val(),
				password: this.field('password').val(),
				confirmation: this.field('confirmation').val(),
			}).then(function(user) {
				self.reload();
			}, function(e) {
				self.handleErrors(e);
			});
		}
	});
	return View;
});