define([
'parse',
'models/QuestionModel',
'views/BaseView',
'text!templates/QuestionCreateCardTemplate.html'
], function(Parse, QuestionModel, BaseView, QuestionCreateCardTemplate){
	var View = BaseView.extend({

		className: "card-question-create",

		template: _.template(QuestionCreateCardTemplate),

		events: {
			'click .again': 'again',
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);
			
			var self = this;

			if( this.loading('[type="submit"]', 'Sending...') ) {
				return true;
			}

			this.cleanForm();

			new QuestionModel().save({
				email: this.field('email').val(),
				profile: Parse.User.current() && Parse.User.current().get('profile') ? Parse.User.current().get('profile') : null,
				question: this.field('question').val(),
				room: this.model,
			}).then(function(feedback) {
				self.find('.ask').fadeOut(function() {
					self.find('.confirm').fadeIn();
					self.parent.renderQuestions();
				});
			}, function(e) {
				self.handleErrors(e);
			});
		},

		again: function(event) {
			this.stop(event);

			var self = this;

			this.cleanForm();

			self.find('.confirm').fadeOut(function() {
				self.field('question').val('');
				self.loading();
				self.find('.ask').fadeIn();
			});
		}

	});
	return View;
});