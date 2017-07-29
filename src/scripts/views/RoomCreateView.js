define([
'parse',
'Swiper',
'models/FileHolderModel',
'views/BaseView',
'text!templates/RoomCreateTemplate.html'
], function(Parse, Swiper, FileHolderModel, BaseView, RoomCreateTemplate){
	var View = BaseView.extend({

		className: "view-room-create",

		template: _.template(RoomCreateTemplate),

		events: { 
			'change [name="city"]': 'changeCity',
			'submit form': 'save',
		},

		swiper: null,

		binaryFields: {
			photo: {
				contentTypes: ['image/jpeg'],
				cb: function(fileLocal, fileRemote, self) {
					self.addToSwiper(fileRemote, true);
					self.loading();
				}
			}
		},
		
		render: function() {
			BaseView.prototype.render.call(this);

			var self = this;

			this.field('city').html($('<option>').attr('value', '').text(''));
			_.each(Parse.Config.current().get('CST_CITIES'), function(object, key) {
				self.field('city').append($('<option>').attr('value', key).text(object.name));
			});

			this.field('from').on('changeDate', function(event) {
				self.field('from').datepicker('hide');
				self.field('to').focus();
			});

			this.field('to').datepicker({ autoclose: true });

			return this;
		},

		afterRenderInsertedToDom: function() {
			BaseView.prototype.afterRenderInsertedToDom.call(this);

			this.swiper = new Swiper(this.find('.swiper-container'), {
				pagination: this.find('.swiper-pagination'),
				slidesPerView: 'auto',
				centeredSlides: true,
				paginationClickable: true,
				spaceBetween: 15
			});
		},

		addToSwiper: function(file, slideToImage) {
			var self = this;

			self.loadImage(file.url(), function(img) {
				self.swiper.appendSlide($('<div class="swiper-slide"></div>').append(img))

				setTimeout(function() {
					self.swiper.init();
					if( slideToImage ) {
						self.swiper.slideTo(self.swiper.slides.length-1);
					}
				}, 1000)
			});	
		},

		changeCity: function(event) {
			var self = this;
			var data = Parse.Config.current().get('CST_CITIES')[$(event.currentTarget).val()];
			
			if(data) {
				this.field('district').html($('<option>').attr('value', '').text(''));
				_.each(data.districts, function(object, key) {
					self.field('district').append($('<option>').attr('value', key).text(object.name));
				});
				self.$el.find('[name="district"]').closest('.form-group').show();
			} else {
				self.$el.find('[name="district"]').closest('.form-group').hide();
			}
		},

		save: function(event) {
			this.stop(event);

			var self = this;

			if( self.isUndefined(self.tempBinaries.photo) || self.tempBinaries.photo.length === 0 ) {
				self.fieldError('photo', 'You need to add at least one picture for your room.');
				self._error('You need to add at least one picture for your room.');
				return ;
			}
			if( this.loading('[type="submit"]', 'Saving...') ) {
				return ;
			}

			this.cleanForm();

			this.model.save({
				city: this.field('city').val(),
				district: this.field('district').val(),
				address: this.field('address').val(),
				number: this.field('number').val() ? this.field('number').val() : null,
				zipCode: this.field('zipCode').val(),
				floor: parseInt(this.field('floor').val()),
				surface: parseFloat(this.field('surface').val()),
				from: this.field('from').datepicker('getDate'),
				to: this.field('to').datepicker('getDate'),
				rent: parseFloat(this.field('rent').val()),
				waterFee: parseFloat(this.field('waterFee').val()),
				deposit: parseFloat(this.field('deposit').val()),
				title: this.field('title').val(),
				description: this.field('description').val(),
				gender: this.field('gender').val(),
				profile: Parse.User.current().get('profile'),
				photos: self.fh,
				features: {
					apartment: {
						furnished: this.field('apartment.furnished').prop('checked'),
						balcony: this.field('apartment.balcony').prop('checked'),
						sauna: this.field('apartment.sauna').prop('checked'),
						dishwasher: this.field('apartment.dishwasher').prop('checked'),
						washing: this.field('apartment.washing').prop('checked'),
						dryer: this.field('apartment.dryer').prop('checked'),
						pets: this.field('apartment.pets').prop('checked')
					},
					building: {
						lift: this.field('building.lift').prop('checked'),
						storage: this.field('building.storage').prop('checked'),
						sauna: this.field('building.sauna').prop('checked'),
						washing: this.field('building.washing').prop('checked'),
						dryer: this.field('building.dryer').prop('checked'),
					},
				}
			}).then(function(room) {
				var promises = [];
				_.each(self.tempBinaries.photo, function(file) {
					promises.push(new FileHolderModel().save({ 
						file: file,
						room: room
					}));
				});
				
				Parse.Promise.when(promises).then(function() {
					Parse.Cloud.run('shareRoom', { room: room.id });
					Parse.history.navigate('room/' + room.id, true);
				});
			}, function(e) {
				self.handleErrors(e, true);
			});
		},

		dvptAutofill: function() {
			this.field('address').val('Lönnrotinkatu 32D');
			this.field('number').val('46');
			this.field('zipCode').val('00180');
			this.field('floor').val(2);
			this.field('rent').val(1465);
			this.field('waterFee').val(0);
			this.field('deposit').val(250);
			this.field('title').val("Random title");
			this.field('description').val("Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n'a pas fait que survivre cinq siècles, mais s'est aussi adapté à la bureautique informatique, sans que son contenu n'en soit modifié. Il a été popularisé dans les années 1960 grâce à la vente de feuilles Letraset contenant des passages du Lorem Ipsum, et, plus récemment, par son inclusion dans des applications de mise en page de texte, comme Aldus PageMaker.");
			this.field('surface').val(57);
			this.field('from').datepicker('setDate','01/09/1935');
			this.field('to').datepicker('setDate','18/09/2016');
			this.field('start').datepicker('setDate','20/01/2016');
			this.field('city').val('helsinki').change();
			this.field('district').val('kamppi');
		}
	});
	return View;
});