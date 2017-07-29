define([
'parse',
'views/BaseView',
'views/SignInCardView',
'views/SignUpCardView',
'text!templates/RoomPictureCardTemplate.html'
], function(Parse, BaseView, SignInCardView, SignUpCardView, RoomPictureCardTemplate) {
	var View = BaseView.extend({

		className: "card-room-picture swiper-slide",

		template: _.template(RoomPictureCardTemplate),
		
	});
	return View;
});