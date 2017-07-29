define([
'parse',
'views/BaseView',
'text!templates/RequestCreateCardTemplate.html'
], function(Parse, BaseView, RequestCreateCardTemplate){
	var View = BaseView.extend({

		className: "card-request-create",

		template: _.template(RequestCreateCardTemplate),

		events: {
			'submit form': 'save',
			'blur [name="firstname"]': 'displayName',
			'blur [name="lastname"]': 'displayName',
		},

		save: function(event) {
			this.stop(event);
			
			var self = this;

			if( this.loading('[type="submit"]', 'Sending...') ) {
				return ;
			}

			this.cleanForm();

			this.model.save({
				profile: Parse.User.current().get('profile'),
				message: this.field('message').val(),
			}).then(function(request) {
				self.reload();
			}, function(e) {
				self.handleErrors(e);
			});
		},

		displayName: function() {

			this.capitalize(this.field('firstname, lastname'));
			
			var name = null;

			if( this.field('firstname').val() !== "" && this.field('lastname').val() !== "" ) {
				name = this.field('firstname').val() + ' ' + this.field('lastname').val().substring(0, 1) + '.';
				this.$el.find('.display-name').text(name);
			}

			return name;
		},

		dvptAutofill: function() {
			this.field('message').val(Math.random().toString(36));
		}
	});
	return View;
});