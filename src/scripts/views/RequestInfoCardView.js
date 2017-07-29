define([
'parse',
'views/BaseView',
'text!templates/RequestInfoCardTemplate.html'
], function(Parse, BaseView, RequestInfoCardTemplate) {
	var View = BaseView.extend({

		className: "card-request-info",

		template: _.template(RequestInfoCardTemplate),

		events: { },

	});
	return View;
});