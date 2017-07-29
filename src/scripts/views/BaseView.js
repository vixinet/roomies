define([
'parse',
], function(Parse) {
	var BaseView = Parse.View.extend({

		className: "view-base",

		events: {},

		subViews: null,
		timersToKill: null,
		tempBinaries: {},
		binaryFields: {},
		templateData: null,
		lastLinkLoaded: null,

		__ANIMATION_ENDS__: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

		initialize: function(data) {

			this.subViews = [];
			this.timersToKill = [];
			tempBinaries = {};
			binaryFields = {};

			_.extend(this.events, {
				'click .btn-upload': 'clickUpload',
				'change [type="file"]': 'uploadFile',
				'blur input[type="text"], textarea': 'trim',
				'click a[href]:not(.for-spy)': 'link',
			});

			this.delegateEvents();

			if( this.className.indexOf('card-') === 0 ) {

				if( typeof data === typeof undefined ) {
					console.warn('Warning: ' + 'Initialisation of card "' + this.className + '" without "data" param.');
				} else if ( typeof data.parent === typeof undefined ) {
					console.warn('Warning: ' + 'Initialisation of card "' + this.className + '" without "parent" id in "data" param.');
				} else if( data.parent ) {
					this.parent = data.parent;
					if( this.parent.subViews ) {
						// Sometimes parent isn't a BaseView base View
						this.parent.subViews.push(this);	
					}
				}
			}

		},

		link: function(event) {

			var e = $(event.currentTarget);

			if( !e.attr('data-external') ) {

				this.stop(event);

				if( this.lastLinkLoaded === e.attr('href') ) {
					this.reload();
				} else {
					Parse.history.navigate(e.attr('href'), true);
				}
				
				this.lastLinkLoaded = e.attr('href');
			}
		},

		render: function() {
			
			var self = this;

			if( window.dvpt ) console.info("--> Render " + this.className );

			var data = { 
				self: this,
				Parse: Parse
			};

			if( this.templateData ) _.extend(data, this.templateData);
			if( this.model )        _.extend(data, this.model._toFullJSON());

			
			this.$el.on('click', '[scroll-to]', function(event) {
				if( window.dvpt ) console.info('click [scroll-to] ' + $(event.currentTarget).attr('scroll-to') );
				self.scrollTo($(event.currentTarget).attr('scroll-to'));
			});

			this.$el.html(this.template(data));

			this.find('[data-toggle="tooltip"]').tooltip();

			var social = this.$el.find('.social');
			if( social ) {
				FB.XFBML.parse(social[0]);
				twttr.widgets.load(social[0]);
			}

			return this;
		},

		dvptAutofill: function() {
			// To be overwrited in the class
		},

		afterRenderInsertedToDom: function() {
			// To be overwrited in the class

			var self = this;
			
			if( window.dvpt ) {
				this.dvptAutofill();
			}

			var navbar = self.find('.navbar.menu');
			if( navbar.length > 0 ) {
				var next = navbar.next();
				navbar.affix({
					offset: {
						top: navbar.position().top
					}
				})
				.on('click', 'a.for-spy', function(event) {
					// self.stop(event);
					self.scrollTo($(event.currentTarget).attr('href'));
				})
				.on('affixed.bs.affix', function(event) {
					next.css({ paddingTop : '+=' + navbar.height() });
				})
				.on('affixed-top.bs.affix', function(event) {
					next.css({ paddingTop : '-=' + navbar.height() });
				})

				$('body').scrollspy({ 
					target: '.navbar.menu',
					offset: navbar.height() + 2
				});
			}
		},

		teardown: function() {

			_.each(this.subViews.reverse(), function(v) {
				v.teardown();
			});

			_.each(this.timersToKill, function(t) { 
				clearInterval(t);
			});

			if( this.model ) {
				// this.model.off(null, null, this);
			}

			if( window.dvpt) console.info('<-- Tear Down ' + this.className);

			this.remove();

			return this;
		},

		// ******************************************************************************************
		// Date and time format
		// ******************************************************************************************

		dateIsoToWeekDayShort: function(n) {
			var a = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
			return a[n];
		},

		dateIsoToWeekDay: function(n) {
			var a = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			return a[n];
		},

		dateIsoToMonthShort: function(n) {
			var a = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			return a[n];
		},

		dateIsoToMonth: function(n) {
			var a = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return a[n];
		},

		_formatDateFullEn: function(d) {
			var d = new Date(this.isUndefined(d.iso) ? d : d.iso);
			return this.dateIsoToMonth(d.getMonth()) + ' ' + this.numberNth(d.getDate()) + ' ' + d.getFullYear();
		},

		formatDateFullEn: function(d) {
			var d = new Date(this.isUndefined(d.iso) ? d : d.iso);
			return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
		},

		numberNth: function(d){
			if( d === 11 || d === 12 || d === 13 ) return 'th';
			switch (d % 10) {
				case 1:  return d+"st";
				case 2:  return d+"nd";
				case 3:  return d+"rd";
				default: return d+"th";
		    }
		},

		dateFromField: function(field) {
			return this.isNull(this.field(field)) || this.field(field).val() === "" ? undefined : new Date(this.field(field).val());
		},

		// ******************************************************************************************
		// Censoring
		// ******************************************************************************************

		censorEmailFronString: function(str) {
			var pattern = /[^@\s]*@[^@\s]*\.[^@\s]*/g;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);
		},

		censorLinksFronString: function(str) {
			var pattern = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);
		},

		censorPhoneNumbersFronString: function(str) {
			var pattern = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);
		},

		censorAll: function(str) {
			return  this.censorPhoneNumbersFronString(this.censorLinksFronString(this.censorEmailFronString(str)));
		},

		censorField: function(event) {
			$(event.currentTarget).val( this.censorAll($(event.currentTarget).val()));	
		},

		// ******************************************************************************************
		// Data Check & Assertion
		// ******************************************************************************************

		isEmailValid: function(email) {
			var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		return emailPattern.test(email);
		},

		isNull: function(variable) {
			return this.isUndefined(variable) || variable === null;
		},


		isUndefined: function(variable) {
			return typeof variable === typeof undefined;
		},

		parseUndefined: function(field) {
			return !this.isUndefined(field) ? field : '';
		},

		// ******************************************************************************************
		// Error / Info Management
		// ******************************************************************************************

		_error: function(message) {
			$(document).trigger('globalError', message);
		},

		_info: function(message) {
			$(document).trigger('globalInfo', message);
		},

		handleErrors: function(error, triggerGlobalWhenFieldError) {
			var self = this;

			if( window.dvpt ) console.error("handleErrors: ", error);

			if( error.type && error.type == 'model-validation' ) {
				_.map(error.fields, function(message, field) { 
					self.fieldError(field, message);
				});

				if( triggerGlobalWhenFieldError ) {
					self._error('One or more fields contains errors.');
				}
			} else {
				self._error(error);
			}
			self.loading();
		},

		fieldError: function(name, message) {

			var field = this.field(name);

			if( field.attr('delegate-error') ) {
				field = this.find('[for="'+field.attr('name')+'"]:not(label)')
			}

			field.closest('.form-group').addClass("has-error");

			if( message ) {
				var show = function() { $(this).popover('show'); };
				var hide = function() { $(this).popover('hide'); };

				if( field.hasClass('field-error-flag') ) {
					field.data('bs.popover').options.content = message;
				} else {
					field.addClass('field-error-flag').popover({ 
						container: 'body',
						content: message,
						trigger: 'manual',
						placement: 'top'
					});	
					field.focus(show).blur(hide).hover(show, hide);
				}
			}
		},

		cleanForm: function() {
			this.find('.btn.field-error-flag').removeClass('field-error-flag');
			this.find('.display-messages').html('');
			this.find('.field-error-auto').remove();
			this.find('.has-error').removeClass('has-error has-feedback');
			this.find('.field-error-flag').popover('hide').unbind('focus mouseenter mouseleave hover blur');
		},

		// ******************************************************************************************
		// Helpers
		// ******************************************************************************************

		reload: function() {
			Parse.history.loadUrl(Parse.history.fragment);
		},
		
		config: function(str) {
			return Parse.Config.current().get(str);
		},

		displayName: function(event) {

			this.capitalize(this.field('firstname, lastname'));

			var name = null;

			if( this.field('firstname').val() !== "" && this.field('lastname').val() !== "" ) {
				name = this.field('firstname').val() + ' ' + this.field('lastname').val().substring(0, 1) + '.';
				this.$el.find('.display-name').text(name);
			}

			return name;
		},

		loadImage: function(url, cb) {
			var sprite = new Image();
			sprite.onload = cb(sprite);
			sprite.src = url;
		},
		
		getCityName: function(key) {
			return Parse.Config.current().get('CST_CITIES')[key].name;
		},

		getDistrictName: function(keyCity, keyDistrict) {
			return Parse.Config.current().get('CST_CITIES')[keyCity].districts[keyDistrict].name;
		},

		capitalize: function(o) {

			var _capitalize = function(text) {
				var split = text.split(' ');

				for (var i = 0, len = split.length; i < len; i++) {
					split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
				}

				return  split.join(' ');
			};

			if( typeof o === "string" ) {
				return _capitalize(o);
			} else {
				$.each(o, function () {
					this.value = _capitalize(this.value);
				});
			}
		},

		find: function(o) {
			return this.$el.find(o);
		},

		nl2br: function(s) {
			return s.replace(/\n/g, "<br>");
		},

		trim: function(event) {
			$(event.currentTarget).val($(event.currentTarget).val().trim());
		},

		scrollTo: function(aid) {
			var delta = this.find('.navbar.menu').length > 0 ? this.find('.navbar.menu').height() : 0;
			$('html, body').animate({ scrollTop: $(aid).offset().top - delta }, 'slow');
		},

		stop: function(event) {
			event.preventDefault();
			event.stopPropagation();
		},

		field: function(names) {
			var str = "";
			_.each(names.split(','), function(item) {
				str += (str != "" ? str += ', ' : '') + '[name="' + item.trim() + '"]';
			})
			return this.find(str);
		},

		card: function(names) {
			var str = "";
			_.each(names.split(','), function(item) {
				str += (str != "" ? str += ', ' : '') + '[card="' + item.trim() + '"]';
			})
			return this.find(str);
		},
			
		loading: function( e, text ) {
			if( e ) {

				e = typeof e === 'string' ? this.find(e) : e;
				
				if( e.prop('loading') ) {
					return true;
				} else {
					e.each(function(i, item) {

						var item = $(item);
						
						item.attr('loading', true);
						item.attr('disabled', true);

						if( typeof text === "string" ) {
							switch( item.prop("tagName").toLowerCase() ) {
								case 'input' : 
									item.attr('data-text', item.attr('value')).attr('value', text);
								break;
								case 'button' :
									item.attr('data-text', item.text()).text(text);
								break;
								default :
									// When implementing new case, don't forget the switch after
									console.warn('ToDo: ' + 'Implement loading for ' + e.prop("tagName").toLowerCase());
								break;
							}
						}
					});

					return false;
				}

			} else {
				
				this.find('[loading]').each(function(i, item) {
					
					var item = $(item);
					
					if( item.attr('data-text') ) {
						switch( item.prop("tagName").toLowerCase() ) {
							case 'input' : 
								item.attr('value', item.attr('data-text'));
							break;
							case 'button' :
								item.text(item.attr('data-text'));
							break;
						}
					}
					
					item.removeAttr('disabled');
					item.removeAttr('loading');
					item.removeAttr('data-text');
				});

			}
			
		},

		isLoading: function( e ) {
			w = typeof w === 'string' ? this.find(w) : w;
			return w.prop('disabled');
		},

		getRandomNumber: function(min, max) {
			return Math.round(Math.random() * (max - min) + min);
		},

		splitURLParams: function(string){
			var array = {};
			var pair;
			var re_space = function(s){
				return decodeURIComponent(s.replace(/\+/g, " "));
			};
			while (pair = /([^&=]+)=?([^&]*)/g.exec(string)) {
				array[re_space(pair[1])] = re_space(pair[2]);
			}
			return array;
		},

		scorePassword: function(pass) {
			var score = 0;
			if (!pass) return score;
			var letters = new Object();
			for (var i=0; i<pass.length; i++) {
				letters[pass[i]] = (letters[pass[i]] || 0) + 1;
				score += 5.0 / letters[pass[i]];
			}
			var variations = {
				digits: /\d/.test(pass),
				lower: /[a-z]/.test(pass),
				upper: /[A-Z]/.test(pass),
				nonWords: /\W/.test(pass),
			}
			var variationCount = 0;
			for (var check in variations) {
				variationCount += (variations[check] == true) ? 1 : 0;
			}
			score += (variationCount - 1) * 10;
			return parseInt(score);
		},

		clickUpload: function(event) {
			this.find('[name="'+$(event.currentTarget).attr('for')+'"]').click();
		},

		uploadFile: function(event) {

			var self = this;
			var field = $(event.currentTarget).attr('name');

			if( this.isUndefined(this.binaryFields[field]) ) {
				console.error('BaseView.uploadFile: Oops, binaryFields['+field+'] not defined!');
				return;
			}

			var params = this.binaryFields[field];

			if( this.isUndefined(params.contentTypes) ) {
				console.error('BaseView.uploadFile: Oops, binaryFields['+field+'].opts not defined for this field!');
				return;
			}

			this.cleanForm();
			this.loading('[type="submit"], button[for="'+field+'"], .btn[for="'+field+'"]', 'Uploading file...');

			
			if( event.target.files.length > 0 ) {

				var fileLocal = event.target.files[0];
				if( !_.contains(params.contentTypes, fileLocal.type) ) {
					this.fieldError(field, 'Bad format. Supported formats: ' + params.contentTypes.join(', ') + '.');
					this.loading();
					$(event.target).val('');
					return;
				}

				new Parse.File(field, fileLocal, fileLocal.type).save().then(function(fileRemote) {

					if( self.tempBinaries[field] ) {
						self.tempBinaries[field].push(fileRemote);
					} else {
						self.tempBinaries[field] = [fileRemote];
					}

					if( !self.isUndefined(params.cb) ) {
						params.cb(fileLocal, fileRemote, self);
					} else {
						self.loading();
					}
				}, function(error) {
					self.fieldError(field, 'An error occurred when we tried to upload your file.');
					self.loading();
					$(event.target).val('');
				});
			}
		},

		getFile: function(file) {
			return this.isUndefined(this.tempBinaries[file]) ? undefined : this.tempBinaries[file];
		}
	});
	return BaseView;
});