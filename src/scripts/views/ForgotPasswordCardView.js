define([
'parse',
'models/UserModel',
'views/BaseView',
'text!templates/ForgotPasswordCardTemplate.html'
], function(Parse, UserModel, BaseView, ForgotPasswordCardTemplate) {
	var View = BaseView.extend({

		className: "card-forgot-password",

		template: _.template(ForgotPasswordCardTemplate),

		events: {
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);

			var self = this;
			
			if( this.loading('[type="submit"]', 'Sending Email ...') ) {
				return true;
			}

			this.cleanForm();

			UserModel.forgotPassword({
				email: this.field('email').val(),
			}).then(function(user) {
				self._info("Email sent with the instructions to reset this account's password");
				self.loading();
			}, function(e) {
				self.handleErrors(e);
			});
		}
	});
	return View;
});