define([
'parse',
'models/ChatMessageModel',
'views/BaseView',
'views/ChatCardView',
'views/RequestRoomieCardView',
'views/RequestInfoCardView',
'text!templates/RequestCardTemplate.html'
], function(Parse, ChatMessageModel, BaseView, ChatCardView, RequestRoomieCardView, RequestInfoCardView, RequestCardTemplate){
	var View = BaseView.extend({

		className: "card-request",

		template: _.template(RequestCardTemplate),

		events: { },

		render: function() {
			BaseView.prototype.render.call(this);

			this.card('roomie').html(new RequestRoomieCardView({ parent: this.parent, model: this.model }).render().el);
			this.card('chat').html(new ChatCardView({ parent: this.parent, model: this.model }).render().el);
			this.card('info').html(new RequestInfoCardView({ parent: this.parent, model: this.model }).render().el);

			return this;
		},

	});
	return View;
});
