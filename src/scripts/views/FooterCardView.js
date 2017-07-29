define([
'parse',
'models/NewsletterModel',
'models/FeedbackModel',
'views/BaseView',
'views/NewsletterCardView',
'views/FeedbackCardView',
'text!templates/FooterCardTemplate.html'
], function(Parse, NewsletterModel, FeedbackModel, BaseView, NewsletterCardView, FeedbackCardView, FooterCardTemplate){
	var View = BaseView.extend({

		className: "card-footer",

		template: _.template(FooterCardTemplate),

		events: { },

		render: function() {
			BaseView.prototype.render.call(this);

			this.card('newsletter').html(new NewsletterCardView({ parent: this, model: new NewsletterModel() }).render().el);
			this.card('feedback').html(new FeedbackCardView({ parent: this, model: new FeedbackModel() }).render().el);
			
			return this;
		}
	});
	return View;
});