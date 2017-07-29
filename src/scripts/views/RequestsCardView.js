define([
'parse',
'models/ChatMessageModel',
'views/BaseView',
'views/ChatCardView',
'views/RequestNoteCardView',
'views/RequestInfoCardView',
'views/RequestDecisionCardView',
'text!templates/RequestsCardTemplate.html'
], function(Parse, ChatMessageModel, BaseView, ChatCardView, RequestNoteCardView, RequestInfoCardView, RequestDecisionCardView, RequestsCardTemplate){
	var View = BaseView.extend({

		className: "card-requests",

		template: _.template(RequestsCardTemplate),

		events: {
			'click .requests-list a': 'load'
		},

		requests: {},

		current: {
			model: null,
			views: {}
		}, 

		dataId: function(event) {
			return $(event.currentTarget).closest('[data-id]').attr('data-id');
		},

		render: function() {
			BaseView.prototype.render.call(this);

			this.renderRequests();

			return this;
		},

		renderRequests: function() {

			var self = this;

			self.card('note').html('<div class="loader"><img src="/resources/loader-white.gif" /></div>');
			
			var query = this.model.relation("requests").query();
			query.descending('createdAt');
			query.include('profile');
			query.include('profile.user');
			query.find().then(function(models) {

				self.find('.requests-list').html('');
				self.requests = {};

				if( models.length === 0 ) {
					self.card('note').html('<div class="text-center"><p class="lead">Almost there...</p><p>No roomies requests at the moment. But don\'t worry, as soons as you have one you will be right away notified by email.</p></div>');
					return ;
				}

				var pending = 0;

				models = _.sortBy(models, function(model) {
					switch( model.get('status') ) {
						case "approved" : return 1; break;
						case "pending" : return 2; break;
						case "denied" : return 3; break;
						default : return 4; break;
					}
				});

				_.each(models, function(model) {

					var badge = "";

					switch( model.get('status') ) {
						case "pending" : pending++; badge = '<span class="label label-warning pull-right">Pending</span>'; break;
						case "denied" : badge = '<span class="label label-danger pull-right">Rejected</span>'; break;
						case "approved" : badge = '<span class="label label-success pull-right">Approved</span>'; break;
					}

					self.requests[model.id] = model;
					
					self.find('.requests-list').append('<li data-id="' + model.id + '"><a href="">' + model.get('profile').get('displayName') + badge + '</a></li>');
				});

				if( pending ) {
					// Not clean but working
					self.parent.find('.btn-requests .badge').text(pending);
				}

				if( self.current.model ) {
					self.find('.requests-list li[data-id="' + self.current.model.id + '"] a').click();
				} else {
					self.find('.requests-list a').first().click();
				}
				
			});
		},

		load: function(event) {
			this.stop(event);

			var self = this;

			$('.requests-list .active').removeClass('active');
			$(event.currentTarget).closest('li').addClass('active');

			self.current.model = self.requests[self.dataId(event)];

			this.loadCard('chat', ChatCardView);
			this.loadCard('info', RequestInfoCardView);
			this.loadCard('note', RequestNoteCardView);
			this.loadCard('decision', RequestDecisionCardView);
		},

		loadCard: function(card, view) {

			var self = this;

			this.card(card).fadeOut(function() {

				if( self.current.views[card] ) {
					self.current.views[card].teardown();
				}

				self.current.views[card] = new view({ parent: self, model: self.current.model });

				self.card(card).html(self.current.views[card].render().el).fadeIn();
			});
		}
	});
	return View;
});