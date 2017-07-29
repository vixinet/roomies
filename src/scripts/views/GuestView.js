define([
'parse',
'views/BaseView',
'views/SignInCardView',
'views/SignUpCardView',
'views/ForgotPasswordCardView',
'text!templates/GuestTemplate.html'
], function(Parse, BaseView, SignInCardView, SignUpCardView, ForgotPasswordCardView, GuestTemplate) {
	var View = BaseView.extend({

		className: "view-guest",

		template: _.template(GuestTemplate),

		render: function() {
			BaseView.prototype.render.call(this);

			this.card('sign-in').html(new SignInCardView({ parent: this }).render().el);
			this.card('sign-up').html(new SignUpCardView({ parent: this }).render().el);
			this.card('forgot-password').html(new ForgotPasswordCardView({ parent: this }).render().el);

			return this;
		}
	});
	return View;
});