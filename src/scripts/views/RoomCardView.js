define([
'parse',
'views/BaseView',
'text!templates/RoomCardTemplate.html'
], function(Parse, BaseView, RoomCardTemplate){
	var View = BaseView.extend({

		className: "card-room",

		template: _.template(RoomCardTemplate),

		events: { },

		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;
			this.model.relation('files').query().first().then(function(fh) {

				if( !self.isNull(fh) ) {
					self.find('img.room').attr('src', fh.get('file').url());
				}
			});

			return this;
		}
	});
	return View;
});