define([
'parse',
'views/BaseView',
'text!templates/RequestDecisionCardTemplate.html'
], function(Parse, BaseView,RequestDecisionCardTemplate) {
	var View = BaseView.extend({

		className: "card-request-decision",

		template: _.template(RequestDecisionCardTemplate),

		events: {
			'click .btn-approve': 'approve',
			'click .btn-deny': 'deny',
			'click .save': 'save',
		},

		approve: function() {
			this.stop(event);
			this.modal('approve');
		},

		deny: function() {
			this.stop(event);
			this.modal('deny');
		},

		modal: function(action) {

			this.find('.modal .action')
			.addClass( action === 'approve' ? 'text-success' : 'text-danger' )
			.attr('data-action', action)
			.text( action === 'approve' ? 'Approve' : 'Reject' );

			this.find('.modal').modal({
				show: true
			});
		},

		save: function(event) {
			this.stop(event);

			var self = this;
			var modal = $(event.currentTarget).closest('.modal');
			var action = modal.find('[data-action]').attr('data-action');

			modal.modal('hide');

			this.loading('.btn-approve', action === 'approve' ? 'Approving...' : '...');
			this.loading('.btn-deny',    action === 'approve' ? '...' : 'Rejecting...');

			this.model.save({
				status: action
			}).then(function(request) {
				self.parent.renderRequests();
			}, function(e) {
				self.handleErrors(e);
			})
		},

	});
	return View;
});