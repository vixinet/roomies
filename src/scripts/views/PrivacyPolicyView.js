define([
'parse',
'views/BaseView',
'text!templates/PrivacyPolicyTemplate.html'
], function(Parse, BaseView, PrivacyPolicyTemplate){
	var View = BaseView.extend({

		className: "view-privacy-policy",

		template: _.template(PrivacyPolicyTemplate),

	});
	return View;
});