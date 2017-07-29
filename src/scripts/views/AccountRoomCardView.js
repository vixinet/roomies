define([
'parse',
'views/BaseView',
'text!templates/AccountRoomCardTemplate.html'
], function(Parse, BaseView, AccountRoomCardTemplate){
	var View = BaseView.extend({

		className: "card-account-room",

		template: _.template(AccountRoomCardTemplate),

		events: { },

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			this.model.relation('files').query().first().then(function(fh) {
				if( !self.isNull(fh) ) {
					self.find('img.room').attr('src', fh.get('file').url());
				}
			});

			this.model.relation('requests').query().count().then(function(total) {
				self.find('.requests').text(total + ' request' + (total != 1 ? 's' : '') );
			});

			this.model.relation('questions').query().count().then(function(total) {
				self.find('.questions').text(total + ' question' + (total != 1 ? 's' : '') );
			});

			return this;
		}
	});
	return View;
});