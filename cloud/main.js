require('cloud/app.js');
var oauth = require('cloud/oauth.js');
var sha = require('cloud/sha1.js');

Parse.Cloud.define("sendEmail", function(request, response) {
	
	var sendgrid = require("sendgrid");
	var fs	   = require('fs');
	var _		= require("underscore");

	var data = request.params;

	var defaultTemplate = {
		templates: {
			settings: {
				enable: 1,
				template_id: "8ab4fd0f-cd7d-4322-bbb1-52f0bf0fa094"
			}
		}
	};

	Parse.Config.get().then(function(config) {

		// ToDo - put in config credentials
		sendgrid.initialize("daniel-costa-new", "");

		if( data.template ) {
			data.html = _.template(fs.readFileSync('cloud/templates/' + data.template + '.html.js', 'utf8'))();
			data.text = _.template(fs.readFileSync('cloud/templates/' + data.template + '.txt.js', 'utf8'))();
		}

		var email = sendgrid.Email({
			to:	  data.to	  || config.get('send_email_default_to'),
			from:	data.from	|| config.get('send_email_default_from'),
			subject: data.subject || config.get('send_email_default_subject'),
			text:	data.text	|| '',
			html:	data.html	|| '',
		});
		
		email.setFilters(data.filter || defaultTemplate);

		_.each(data.sub, function(value, key) {
			email.addSubstitution("%" + key + "%", value);
		});

		sendgrid.sendEmail(email).then(function(data) { 
			console.log("**** Sent ****");
			response.success();
		}, function(e) {
			console.log("**** Error in sendEmail ****");
			console.log(e);
			response.error();
		});
	});
});

Parse.Cloud.define("sendTweet", function(request, response) {
	
	var urlLink = 'https://api.twitter.com/1.1/statuses/update.json';

	var postSummary = request.params.status;
	var status = oauth.percentEncode(postSummary);
	var consumerSecret = "lsfAtIQGnvs0AJXQYlWoq54CPcHskpDZIiC70c2GI67KFRH9SK";
	var tokenSecret = "PRwpy9bKc2KYgk2AbHNtjfUmSOm2sffzPZ7UX6w7T7s3E";
	var oauth_consumer_key = "bpTkoNH2huRs9X92OVs6A2s0x";
	var oauth_token = "4835621835-lC4SjPyQVP3Ej2DJ7sxoI6sFdQuZTCFzSGmX8de";

	var nonce = oauth.nonce(32);
	var ts = Math.floor(new Date().getTime() / 1000);
	var timestamp = ts.toString();

	var accessor = {
		"consumerSecret": consumerSecret,
		"tokenSecret": tokenSecret
	};

	var params = {
		"status":postSummary,
		"oauth_version": "1.0",
		"oauth_consumer_key": oauth_consumer_key,
		"oauth_token": oauth_token,
		"oauth_timestamp": timestamp,
		"oauth_nonce": nonce,
		"oauth_signature_method": "HMAC-SHA1"
	};

	var message = {
		"method": "POST",
		"action": urlLink,
		"parameters": params
	};

	oauth.SignatureMethod.sign(message, accessor);
	var normPar = oauth.SignatureMethod.normalizeParameters(message.parameters);
	// console.log("Normalized Parameters: " + normPar);
	var baseString = oauth.SignatureMethod.getBaseString(message);
	// console.log("BaseString: " + baseString);
	var sig = oauth.getParameter(message.parameters, "oauth_signature") + "=";
	// console.log("Non-Encode Signature: " + sig);
	var encodedSig = oauth.percentEncode(sig); //finally you got oauth signature
	// console.log("Encoded Signature: " + encodedSig);

	Parse.Cloud.httpRequest({
		method: 'POST',
		url: urlLink,
		headers: {
			"Authorization": 'OAuth oauth_consumer_key="'+oauth_consumer_key+'", oauth_nonce=' + nonce + ', oauth_signature=' + encodedSig + ', oauth_signature_method="HMAC-SHA1", oauth_timestamp=' + timestamp + ',oauth_token="'+oauth_token+'", oauth_version="1.0"'
		},
		body: "status="+status
	}).then(function(httpResponse) {
		response.success(httpResponse.text);
	}, function(httpResponse) {
		response.error('Request failed with response ' + httpResponse.status + ' , ' + httpResponse);
	});

});

Parse.Cloud.define("shareLinkFacebook", function(request, response) {
	
	Parse.Cloud.httpRequest({
		method: 'POST',
		url: 'https://graph.facebook.com/v2.5/' + request.params.pageid + '/feed',
		params: {
			access_token: "CAANs7RkQLuoBACJ0YTQZAmQNMSXiJCR95gUlJn4F1SOLbmelZCJ9OZB0FjXjiIkHGoVRPmjZC5CzZAFRWkb4y2vLtY9cFI6WBWuAGWoQh14zwIgjPNnN5GCkZCUSPmhJWw7L065ZAMTSxq4cMqul53ah96xa7uZCIr7sFTNZBfIfzyHk9c5rognc1Ns3ktnbjU2SsJbmUTZAq21wZDZD"
		},
		body: {
			link: request.params.link
		}
	}).then(function(httpResponse) {
		response.success("");
	}, function(e) {
		console.log(e);
		response.error('Cloud - FB Share Error');
	});

});

Parse.Cloud.define("shareRoom", function(request, response) {
	
	var RoomModel = Parse.Object.extend('Room');
	
	Parse.Config.get().then(function(config) {
		var fb = Parse.Cloud.run('shareLinkFacebook', {
			link: config.get('base_url') + 'room/' + request.params.room,
			pageid: config.get('facebook_page_id')
		});

		var twitter = Parse.Cloud.run('sendTweet', {
			status: config.get('base_url') + 'room/' + request.params.room
		});

		return Parse.Promise.when([fb, twitter]);
	}).then(function() {
		response.success("");
	}, function(e) {
		console.log(e)
		response.error(e);
	})

});

Parse.Cloud.define("testSendEmail", function(request, response) {

	Parse.Config.get().then(function(config) {

		var object = {
			get: function(k) { return this[k]; },
			id: '123123',
			email: "danieljose@bluewin.ch",
			feedback: "Hey,\n\nHow are you doing with the app?\nis it good?\n\nDaniel",
			address: 'Lönnrotinkatu 32 D',
			city: 'helsinki',
			district: 'kamppi',
			title: 'new rew bla bla',
			rent: 500,
			title: 'test',
			description: 'this is a\nis it good?\n\n\nis it good?\n\n description',
			profile: {
				get: function(k) { return this[k]; },
				firstname: 'Daniel',
				user: {
					get: function(k) { return this[k]; },
					email: 'danieljose@bluewin.ch',
				},
			},
			room: {
				get: function(k) { return this[k]; },
				address: 'Lönnrotinkatu 32 D',
				city: 'helsinki',
				district: 'kamppi',
				title: 'new rew bla bla',
				description: 'this is a\nis it good?\n\n\nis it good?\n\n description',
				rent: 250,
				id: 'ABCDEF012',
				profile: {
					get: function(k) { return this[k]; },
					firstname: 'Daniel',
					lastname: 'Costa',
					phone: '+358 46 6203016',
					user: {
						get: function(k) { return this[k]; },
						email: 'danieljose@bluewin.ch',
					},
				},
			},
		} 

		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('email'),
		// 	subject: "New question regarding your room.",
		// 	template: 'email-question-answered',
		// 	sub: {
		// 		address: object.get('room').get('address'),
		// 		city: config.get('CST_CITIES')[object.get('room').get('city')].name,
		// 		linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/questions'
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('room').get('profile').get('user').get('email'),
		// 	subject: "The host answered your question.",
		// 	template: 'email-question-asked',
		// 	sub: {
		// 		firstname: object.get('room').get('profile').get('firstname'),
		// 		address: object.get('room').get('address'),
		// 		city: config.get('CST_CITIES')[object.get('room').get('city')].name,
		// 		linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/questions'
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('email'),
		// 	subject: "Your request got approved!",
		// 	template: 'email-request-approved',
		// 	sub: {
		// 		firstname: object.get('profile').get('firstname'),
		// 		host: object.get('room').get('profile').get('firstname') + ' ' + object.get('room').get('profile').get('lastname'),
		// 		phone: object.get('room').get('profile').get('phone'),
		// 		email: object.get('room').get('profile').get('user').get('email'),
		// 		address: object.get('room').get('address'),
		// 		city: object.get('room').get('city'),
		// 		linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests',
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('room').get('profile').get('user').get('email'),
		// 	subject: "You got a new request.",
		// 	template: 'email-request-pending',
		// 	sub: {
		// 		firstname: object.get('room').get('profile').get('firstname'),
		// 		address: object.get('room').get('address'),
		// 		city: config.get('CST_CITIES')[object.get('room').get('city')].name,
		// 		linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests'
		// 	}
		// });
	
		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('profile').get('user').get('email'),
		// 	subject: "Your request got rejected.",
		// 	template: 'email-request-denied',
		// 	sub: {
		// 		firstname: object.get('profile').get('firstname'),
		// 		address: object.get('room').get('address'),
		// 		city: config.get('CST_CITIES')[object.get('room').get('city')].name,
		// 		linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests',
		// 		linkrooms: config.get('base_url') + 'rooms'
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	to: object.get('email'),
		// 	subject: "Thank you for your feedback",
		// 	template: 'email-feedback-thanks',
		// 	sub: {
		// 		email: object.get('email'),
		// 		feedback: object.get('feedback'),
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	from: config.get('send_email_default_monitoring'),
		// 	subject: "New Feedback",
		// 	template: 'email-feedback',
		// 	sub: {
		// 		email: object.get('email'),
		// 		feedback: object.get('feedback'),
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	from: config.get('send_email_default_monitoring'),
		// 	subject: "New Room Published",
		// 	template: 'email-room-new',
		// 	sub: {
		// 		city: config.get('CST_CITIES')[object.get('city')].name,
		// 		district: object.get('district'),
		// 		address: object.get('address'),
		// 		rent: object.get('rent'),
		// 		title: object.get('title'),
		// 		description: object.get('description'),
		// 		linkroom: config.get('base_url') + 'room/' + object.id
		// 	}
		// });

		// Parse.Cloud.run('sendEmail', {
		// 	from: config.get('send_email_default_monitoring'),
		// 	subject: "New Newsletter Subscriber",
		// 	template: 'email-newsletter',
		// 	sub: {
		// 		email: object.get('email'),
		// 	}
		// });
	});
});

Parse.Cloud.beforeSave("Feedback", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
		object.set('email', null);
	}

	response.success();
});

Parse.Cloud.afterSave("Feedback", function(request) {

	var object = request.object;

	if( object.get('status') === 'creation' ) {
		
		Parse.Cloud.run('sendEmail', {
			from: "Roomies Monitoring <monitoring@roomies.fi>",
			subject: "New Feedback",
			template: 'email-feedback',
			sub: {
				email: object.get('email'),
				feedback: object.get('feedback'),
			}
		});

		Parse.Cloud.run('sendEmail', {
			to: object.get('email'),
			subject: "Thank you for your feedback",
			template: 'email-feedback-thanks',
			sub: {
				email: object.get('email'),
				feedback: object.get('feedback'),
			}
		});
		
		object.save({ status: 'pending' });
	}
	
});

Parse.Cloud.beforeSave("Newsletter", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
		object.set('emailsSent', 0);
	}

	response.success();
});

Parse.Cloud.afterSave("Newsletter", function(request) {

	var object = request.object;

	if( object.get('status') === 'creation' ) {

		Parse.Cloud.run('sendEmail', {
			from: "Roomies Monitoring <monitoring@roomies.fi>",
			subject: "New Newsletter Subscriber",
			template: 'email-newsletter',
			sub: {
				email: object.get('email'),
			}
		});

		object.save({ status: 'approved' });
	}
	
});

Parse.Cloud.beforeSave("Request", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
		object.set('note', null);
	}

	response.success();
});

Parse.Cloud.afterSave("Request", function(request) {
	
	// Status flow:
	// -----------------------
	// - Creation
	// -> pending
	// -> approve -> approved
	// -> deny -> denied
	// -> cancel -> cancelled

	var object = request.object;
	var RoomModel = Parse.Object.extend("Room");
	var RequestModel = Parse.Object.extend('Request');
	var room = object.get('room');
	var profile = object.get('profile');

	Parse.Config.get().then(function(config) {

		if( object.get('status') === 'creation' ) {
			room.relation('requests').add(object);
			profile.relation('requests').add(object);

			Parse.Promise.when(room.save(), profile.save()).then(function() {
				var query = new Parse.Query(RequestModel);
				query.include('room');
				query.include('room.profile');
				query.include('room.profile.user');
				query.get(object.id).then(function(object) {
					object.save({ status: 'pending' }).then(function() {
						Parse.Cloud.run('sendEmail', {
							to: object.get('room').get('profile').get('user').get('email'),
							subject: "You got a new request.",
							template: 'email-request-pending',
							sub: {
								firstname: object.get('room').get('profile').get('firstname'),
								address: object.get('room').get('address'),
								city: object.get('room').get('city'),
								linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests',
							}
						});
					});
				});
			})
		}

		if( object.get('status') === 'approve' ) {
			var query = new Parse.Query(RequestModel);
			query.include('profile');
			query.include('profile.user');
			query.include('room');
			query.include('room.profile');
			query.include('room.profile.user');
			query.get(object.id).then(function(object) {
				object.save({ status: 'approved' }).then(function() {
					Parse.Cloud.run('sendEmail', {
						to: object.get('profile').get('user').get('email'),
						subject: "Your request got approved.",
						template: 'email-request-approved',
						sub: {
							firstname: object.get('profile').get('firstname'),
							host: object.get('room').get('profile').get('firstname') + ' ' + object.get('room').get('profile').get('lastname'),
							phone: object.get('room').get('profile').get('phone'),
							email: object.get('room').get('profile').get('user').get('email'),
							address: object.get('room').get('address'),
							city: object.get('room').get('city'),
							linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests',
						}
					});
				});
			});

			new Parse.Query(RoomModel).get(room.id).then(function(room) {
				var query = room.relation('requests').query();
				query.equalTo('status', 'pending');
				query.each(function(model) {
					model.save({ status: 'deny' });
				}).then(function() {
					room.save({ 'status': 'rented' });
				});
			});
		}

		if( object.get('status') === 'deny' ) {
			var query = new Parse.Query(RequestModel);
			query.include('profile');
			query.include('profile.user');
			query.include('room');
			query.get(object.id).then(function(object) {
				object.save({ status: 'denied' }).then(function() {
					Parse.Cloud.run('sendEmail', {
						to: object.get('profile').get('user').get('email'),
						subject: "Your request got rejected.",
						template: 'email-request-denied',
						sub: {
							firstname: object.get('profile').get('firstname'),
							address: object.get('room').get('address'),
							city: object.get('room').get('city'),
							linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/requests',
							linkrooms: config.get('base_url') + 'rooms'
						}
					});
				});
			});
		}

	});
});

Parse.Cloud.beforeSave("Room", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
	}

	response.success();
});

Parse.Cloud.afterSave("Room", function(request) {

	var object = request.object;
	var profile = object.get('profile');

	Parse.Config.get().then(function(config) {

		if( object.get('status') === 'creation' ) {
			profile.relation('rooms').add(object);
			profile.save().then(function() {
				return Parse.Cloud.httpRequest({
					method: 'GET',
					url: 'https://maps.googleapis.com/maps/api/geocode/json',
					params: {
						key: "AIzaSyBo_D0b8eMcrHDf0JGqvGK_pYNZd6b6sE0",
						address: object.get('address') + ', ' + object.get('zipCode') + ' ' + config.get('CST_CITIES')[object.get('city')].name
					}
				});
			}).then(function(response) {
				return object.save({ 
					status: 'online',
					location: response.data.status !== "OK" ? null : new Parse.GeoPoint({ latitude: response.data.results[0].geometry.location.lat, longitude: response.data.results[0].geometry.location.lng })
				});
			}).then(function(object) {
				Parse.Cloud.run('sendEmail', {
					from: "Roomies Monitoring <monitoring@roomies.fi>",
					subject: "New Room Published",
					template: 'email-room-new',
					sub: {
						city: object.get('city'),
						district: object.get('district'),
						address: object.get('address'),
						rent: object.get('rent'),
						title: object.get('title'),
						description: object.get('description'),
						linkroom: config.get('base_url') + 'room/' + object.id
					}
				});
			}, function(error) {
				if( error.data && error.data.error ) {
					console.error(error.data.error);
				} else {
					console.error(error);
				}
			});
		} 

	});
});

Parse.Cloud.beforeSave("Question", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
		object.set('answer', null);
	}

	response.success();
});

Parse.Cloud.afterSave("Question", function(request) {

	var object = request.object;
	var QuestionModel = Parse.Object.extend("Question");
	var room = object.get('room');

	Parse.Config.get().then(function(config) {

		if( object.get('status') === 'creation' ) {
			room.relation('questions').add(object);
			room.save().then(function() {
				object.save({ status: 'pending' }).then(function() {
					var query = new Parse.Query(QuestionModel);
					query.include('room');
					query.include('room.profile');
					query.include('room.profile.user');
					query.get(object.id).then(function(object) {
						Parse.Cloud.run('sendEmail', {
							to: object.get('room').get('profile').get('user').get('email'),
							subject: "New question regarding your room.",
							template: 'email-question-asked',
							sub: {
								firstname: object.get('room').get('profile').get('firstname'),
								address: object.get('room').get('address'),
								city: object.get('room').get('city'),
								linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/questions'
							}
						});
					});
				})
			});
		}

		if( object.get('status') === 'answer' ) {
			room.relation('questions').add(object);
			room.save().then(function() {
				object.save({ status: 'answered' }).then(function() {
					var query = new Parse.Query(QuestionModel);
					query.include('room');
					query.get(object.id).then(function(object) {
						Parse.Cloud.run('sendEmail', {
							to: object.get('email'),
							subject: "The host answered your question.",
							template: 'email-question-answered',
							sub: {
								address: object.get('room').get('address'),
								city: object.get('room').get('city'),
								linkroom: config.get('base_url') + 'room/' + object.get('room').id + '/questions'
							}
						});
					});
				})
			});
		}
	
	});
});

Parse.Cloud.beforeSave("ChatMessage", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
	}

	response.success();
});

Parse.Cloud.afterSave("ChatMessage", function(request) {

	var object = request.object;
	var request = object.get('request');

	if( object.get('status') === 'creation' ) {
		request.relation('chat').add(object);
		request.save().then(function() {
			object.save({ status: 'online' });
		});
	}

});

Parse.Cloud.beforeSave("Profile", function(request, response) {

	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
	}

	response.success();
});

Parse.Cloud.afterSave("Profile", function(request) {

	var object = request.object;
	var user = object.get('user');

	if( object.get('status') === 'creation' ) {
		user.save({
			profile: object
		}).then(function() {
			object.save({ status: 'online' });
		});
	}

});

Parse.Cloud.afterSave("FileHolder", function(request) {

	var object = request.object;
	var room = object.get('room');

	var cb = function() {
		object.save({ status: 'online' });
	};

	if( object.get('status') === 'creation' ) {
		if( room ) {
			room.relation('files').add(object);
			room.save().then(cb);
		} else {
			cb();
		}
	}

});

Parse.Cloud.beforeSave("FileHolder", function(request, response) {

	var Image = require("parse-image");
	var object = request.object;

	if( !object.existed() ) {
		object.set('status', 'creation');
	}

	response.success();

	/*
	// We resize the picture only when it's in creation and a new room
	if( object.existed() || !object.get('room') ) {
		
		return
	}

	Parse.Config.get().then(function(config) {
		return Parse.Cloud.httpRequest({ url: object.get('file').url() })
	}).then(function(response) {
		return new Image().setData(response.buffer);
	}).then(function(image) {
		var initW = image.width();
		var initH = image.height();
		var maxW = Parse.Config.current().get('ROOM_MAX_WIDTH');
		var maxH = Parse.Config.current().get('ROOM_MAX_HEIGHT');
		var w = initW;
		var h = initH;

		if( w > maxW) {
			w = maxW;
			h = w * h / initW;
		}

		if( h > maxH ) {
			h = maxH;
			w = h * w / initH;
		}

		if( w === initW && h === initH ) {
			return ;
		}

		return image.scale({
			width: w,
			height: h
		}).then(function(image) {
			return image.setFormat('JPEG');
		}).then(function(image) {
			return image.data();
		}).then(function(buffer) {
			return new Parse.File('resized', { base64: buffer.toString('base64') }, 'image/jpeg').save();
		}).then(function(file) {
			object.set('file', file);
		});
	}).then(function(result) {
		response.success();
	}, function(e) {
		response.error(e);
	});
	*/
});