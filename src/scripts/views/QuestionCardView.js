define([
'parse',
'views/BaseView',
'text!templates/QuestionCardTemplate.html'
], function(Parse, BaseView, QuestionCardTemplate){
	var View = BaseView.extend({

		className: "card-question",

		template: _.template(QuestionCardTemplate),

		events: {
			'submit form': 'save'
		},

		save: function(event) {
			this.stop(event);
			
			var self = this;

			if( this.loading('[type="submit"]', 'Answering ...') ) {
				return true;
			}

			this.cleanForm();

			if( this.field('answer').val() === "" ) {
				this.fieldError('answer', 'Oops... you missed one.');
				this.loading();
				return;
			}

			this.model.save({
				status: 'answer',
				answer: this.field('answer').val()
			}).then(function(feedback) {
				self.render();
			}, function(e) {
				self.handleErrors(e);
			});
		}

	});
	return View;
});