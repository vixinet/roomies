define([
'parse',
'views/BaseView',
'text!templates/NotFoundTemplate.html'
], function(Parse, BaseView, NotFoundTemplate) {
	var View = BaseView.extend({

		className: "view-not-found",

		template: _.template(NotFoundTemplate),

	});
	return View;
});