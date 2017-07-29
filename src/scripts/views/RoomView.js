define([
'parse',
'Swiper',
'models/QuestionModel',
'models/RequestModel',
'views/BaseView',
'views/QuestionCardView',
'views/QuestionCreateCardView',
'views/RequestCardView',
'views/RequestCreateCardView',
'views/RequestsCardView',
'views/RoomPictureCardView',
'text!templates/RoomRentedTemplate.html',
'text!templates/RoomTemplate.html'
], function(Parse, Swiper, QuestionModel, RequestModel, BaseView, QuestionCardView, QuestionCreateCardView, RequestCardView, RequestCreateCardView, RequestsCardView, RoomPictureCardView, RoomRentedTemplate, RoomTemplate){
	var View = BaseView.extend({

		className: "view-room",

		template: _.template(RoomTemplate),

		events: {
			'click .room-links .btn': 'copy',
		},

		swiper: null,

		initialize: function(data) {
			BaseView.prototype.initialize.call(this);

			this.scroll  = this.isUndefined(data.scroll)  ? null  : data.scroll;
			this.request = this.isUndefined(data.request) ? null  : data.request;
			
			if ( this.model.get('status') !== "online" && !this.isAdmin() && !this.request ) {
				this.template = _.template(RoomRentedTemplate);
			}
		},

		render: function() {
			BaseView.prototype.render.call(this);
			
			var self = this;

			if( this.rented ) {
				return this ;	
			}

			if( this.model.get('status') === 'online' && ( !this.request || this.request.get('status') === 'pending' ) ) {
				this.card('question-create').html(new QuestionCreateCardView({ parent: this, model: this.model }).render().el);				
			}

			this.renderQuestions();

			if( this.isAdmin() ) {
				this.card('request').html(new RequestsCardView({ parent: this, model: this.model }).render().el);
			} else if ( this.request ) {
				self.card('request').html(new RequestCardView({ parent: this, model: this.request }).render().el);	
			} else if ( Parse.User.current() && Parse.User.current().get('profile') ) {
				this.card('request').html(new RequestCreateCardView({ parent: this, model: new RequestModel({ room: this.model, profile: Parse.User.current().get('profile') }) }).render().el);
			} else {
				this.card('request').html('<div class="text-center"><p class="lead">Oops...</p><p>Only registred users can send Roomie Requests.<p>Please <a href="/account" class="btn btn-primary">Sign In</a> first.</p></div>')
			}

			return this;
		},

		afterRenderInsertedToDom: function() {
			BaseView.prototype.afterRenderInsertedToDom.call(this);

			var self = this;

			this.model.relation('files').query().find().then(function(fhs) {
				var promises = [];

				_.each(fhs, function(fh) {
					self.find('.swiper-wrapper').append(new RoomPictureCardView({ parent: self, model: fh }).render().el);
				});

				// We load the Swiper when the images are loaded
				Parse.Promise.when(promises).then(function() {
					setTimeout(function() {
						// We wait a bit to let the images render themselves
						self.swiper = new Swiper(self.find('.swiper-container'), {
							pagination: self.find('.swiper-pagination'),
							slidesPerView: 'auto',
							centeredSlides: true,
							paginationClickable: true,
							spaceBetween: 15,
						});
					}, 100)
				})
			});

			if( this.scroll ) {
				this.scrollTo("#"+this.scroll);
			}
		},

		isAdmin: function() {
			return Parse.User.current() && Parse.User.current().get('profile') && this.model.get('profile').id === Parse.User.current().get('profile').id
		},

		renderQuestions: function() {

			var self = this;

			self.card('questions').html('<div class="loader"><img src="/resources/loader-gray.gif" /></div>');

			var query = this.model.relation('questions').query();
			query.ascending('createdAt');
			query.find().then(function(models) {

				if( models.length === 0 ) {
					var label = self.model.get('status') === 'online' && ( !self.request || self.request.get('status') === 'pending' ) ? 'No questions asked yet, be the first!' : 'No questions asked.';
					self.card('questions').html('<p class="lead">' + label + '</p>');
					return ;
				}

				self.card('questions').html('');
				var pending = 0;

				_.each(models, function(model) {
					
					if( self.isNull(model.get('answer')) ) {
						pending++;
					}

					self.card('questions').append(new QuestionCardView({ parent: self, model: model }).render().el);
				});

				if( self.isAdmin() && pending > 0 ) {
					self.find('.btn-questions .badge').text(pending);
				}

			}, function(error) {
				console.error("Error with query", query);
				console.error(error);
			});
		},

		copy: function(event) {
			this.stop(event);
			$(event.currentTarget).closest('.input-group').find('input').select();
		}
	
	});
	return View;
});