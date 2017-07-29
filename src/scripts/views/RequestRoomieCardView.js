define([
'parse',
'views/BaseView',
'text!templates/RequestRoomieCardTemplate.html'
], function(Parse, BaseView, RequestRoomieCardTemplate) {
	var View = BaseView.extend({

		className: "card-request-roomie",

		template: _.template(RequestRoomieCardTemplate),

		events: { },

	});
	return View;
});