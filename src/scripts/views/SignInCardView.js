define([
'parse',
'models/UserModel',
'views/BaseView',
'text!templates/SignInCardTemplate.html'
], function(Parse, UserModel, BaseView, SignInCardTemplate) {
	var View = BaseView.extend({

		className: "card-sign-in",

		template: _.template(SignInCardTemplate),

		events: {
			'submit form': 'save',
			'click .facebook': 'facebook',
		},

		render: function() {
			BaseView.prototype.render.call(this);

			return this;
		},

		facebook: function(event) {
			this.stop(event);
			
			Parse.User.logOut();

			Parse.FacebookUtils.logIn("email,public_profile", {}).then(function(user) {
				var promise = new Parse.Promise();
				FB.api('/me', { fields: 'email' }, function(response) {
					if ( !response ) {
						promise.reject('Facebook Api Error');
					} else if( response.error ) {
						promise.reject(response.error);
					} else {
						promise.resolve(user, response)
					}
				});
				return promise;
			}).then(function(user, response) {
				if( response.email ) {
					return user.save({ email : response.email });
				} else {
					return user;
				}
			}).then(function(user) {
				if( user.get('email') ) {
					self.reload();
				} else {
					alert('email  needed');
				}
			} , function(user, e) {
				console.log(e)
			})
		},

		save: function(event) {
			this.stop(event);

			var self = this;
			
			if( this.loading('[type="submit"]', 'Signing In ...') ) {
				return true;
			}

			this.cleanForm();

			UserModel.localSignIn({
				email: this.field('email').val(),
				password: this.field('password').val(),
			}).then(function(user) {
				return Parse.User.current().get('profile').fetch();
			}).then(function(profile) {
				self.reload();
			}, function(e) {
				self.handleErrors(e);
			});
		}
	});
	return View;
});