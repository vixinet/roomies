define([
'parse',
'views/BaseView',
'text!templates/AccountRequestCardTemplate.html'
], function(Parse, BaseView, AccountRequestCardTemplate){
	var View = BaseView.extend({

		className: "card-account-request",

		template: _.template(AccountRequestCardTemplate),

		events: { },

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			this.model.get('room').relation('files').query().first().then(function(fh) {
				if( !self.isNull(fh) ) {
					self.find('img.room').attr('src', fh.get('file').url());
				}
			});
			
			return this;
		}
	});
	return View;
});