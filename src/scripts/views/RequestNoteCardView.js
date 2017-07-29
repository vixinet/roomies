define([
'parse',
'views/BaseView',
'text!templates/RequestNoteCardTemplate.html'
], function(Parse, BaseView, RequestNoteCardTemplate) {
	var View = BaseView.extend({

		className: "card-request-note",

		template: _.template(RequestNoteCardTemplate),
		
		events: {
			'submit .form-note': 'save',
		},

		save: function(event) {
			this.stop(event);

			var self = this;
			
			if( this.loading('[type="submit"]', 'Saving...') ) {
				return true;
			}

			this.cleanForm();

			this.model.save({
				note: this.field('note').val()
			}).then(function(request) {
				self.parent.renderRequests();
			}, function(e) {
				self.handleErrors(e);
			});
		}
	});
	return View;
});