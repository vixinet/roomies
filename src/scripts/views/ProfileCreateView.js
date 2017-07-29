define([
'parse',
'views/BaseView',
'text!templates/ProfileCreateTemplate.html'
], function(Parse, BaseView, ProfileCreateTemplate) {
	var View = BaseView.extend({

		className: "view-profile-create",

		template: _.template(ProfileCreateTemplate),

		events: {
			'blur [name="firstname"]': 'displayName',
			'blur [name="lastname"]': 'displayName',
			'submit form': 'save'
		},

		binaryFields: {
			profilePicture: {
				contentTypes: ['image/jpeg', 'image/png'],
				cb: function(fileLocal, fileRemote, self) {
					self.find('.host-picture').css({ backgroundImage: 'url('+fileRemote.url()+')'});
					self.loading();
				}
			}
		},

		render: function() {
			BaseView.prototype.render.call(this);
			
			return this;
		},

		save: function(event) {
			this.stop(event);

			var self = this;

			if( this.loading('[type="submit"]', 'Creating Profile...') ) {
				return ;
			}

			this.cleanForm();

			this.model.save({
				user: Parse.User.current(),
				firstname: this.field('firstname').val(),
				lastname: this.field('lastname').val(),
				displayName: this.displayName(),
				phone: this.field('phone').val(),
				about: this.field('about').val(),
				profilePicture: tempBinaries['profilePicture'] ? tempBinaries['profilePicture'][0] : null,
			}).then(function(profile) {
				return Parse.User.current().fetch();
			}).then(function(user) {
				return Parse.User.current().get('profile').fetch();
			}).then(function() {
				self.reload();
			}, function(e) {
				self.handleErrors(e);
			});
		},

		dvptAutofill: function() {
			this.field('firstname').val('Daniel');
			this.field('lastname').val('Costa');
			this.field('about').val('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
			this.field('phone').val('+358466203016');
		}
	});
	return View;
});