define([
'parse',
'views/BaseView',
'text!templates/ChatMessageCardTemplate.html'
], function(Parse, BaseView, ChatMessageCardTemplate) {
	var View = BaseView.extend({

		className: "card-chat-message",

		template: _.template(ChatMessageCardTemplate),

	});
	return View;
});