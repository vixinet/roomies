define(['parse'], function(Parse) {
	var Model = Parse.User.extend({

		requiredSignUpFields: ["email", "password", "confirmation"],

		localSignUp: function(o) {
			
			var v = this.signUpValidate(o);
			var p = new Parse.Promise()
			
			if( v ) {
				p.reject(v);
			} else {
				// ToDo : Implement all possibilities
				// http://parse.com/docs/dotnet/api/html/T_Parse_ParseException_ErrorCode.htm
				new Parse.User().signUp(_.extend(_.omit(o, 'confirmation'), { username: o.email })).then(function(user) {
					p.resolve(user);
				}, function(e) {
					if( e.code === 202 ) {
						p.reject({ 
							fields: {
								email: 'Oops, this email is already taken.'
							},
							type: 'model-validation'
						})
					} else {
						p.reject(e);
					}
				});
			}

			return p;
		},

		signUpValidate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			console.table(attributes);

			_.each(this.requiredSignUpFields, function(field) {
				if( typeof attributes[field] === typeof undefined || attributes[field] === null || ( typeof attributes[field] === "string" && attributes[field].trim() === "" ) ) {
					_return.fields[field] = "Oops, you missed one!";
				}
			});

			var email = function(email) {
				return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email);
			};

			if( !email(attributes.email) ) {
				_return.fields.email = "Oops, this email address seems to be invalid.";
			}

			if( attributes.password.length < 6 ) {
				_return.fields.password = "Oops, this passowrd is must be at least 6 characters long.";
			}

			if( attributes.password != attributes.confirmation ) {
				_return.fields.confirmation = "Oops, this confirmation is different than your passowrd.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		},

	}, {

		requiredSignInFields: ["email", "password"],

		requiredForgotPasswordFields: ["email"],

		localSignIn: function(o) {
			
			var v = Model.signInValidate(o);
			var p = new Parse.Promise();
			
			if( v ) {
				p.reject(v);
			} else {
				Parse.User.logIn(o.email, o.password).then(function(user) {
					p.resolve(user);
				}, function(e) {
					if( e.code === 101 ) {
						p.reject({ 
							fields: {
								email: 'Oops, invalid login parameters.',
								password: 'Oops, invalid login parameters.'
							},
							type: 'model-validation'
						})
					} else {
						p.reject(e);
					}
				});
			}

			return p;
		},

		forgotPassword: function(o) {
			
			var v = Model.forgotPasswordValidate(o);
			var p = new Parse.Promise();
			
			if( v ) {
				p.reject(v);
			} else {
				Parse.User.requestPasswordReset(o.email).then(function() {
					p.resolve();
				}, function(e) {
					if( e.code === 205 ) {
						p.reject({ 
							fields: {
								email: 'Ooops... No users found with this password.'
							},
							type: 'model-validation'
						})
					} else {
						p.reject(e);
					}
				});
			}

			return p;
		},

		signInValidate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			_.each(this.requiredSignInFields, function(field) {
				if( typeof attributes[field] === typeof undefined || attributes[field] === null || ( typeof attributes[field] === "string" && attributes[field].trim() === "" ) ) {
					_return.fields[field] = "Oops, you missed one!";
				}
			});

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		},

		forgotPasswordValidate: function(attributes) {

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			_.each(this.requiredForgotPasswordFields, function(field) {
				if( typeof attributes[field] === typeof undefined || attributes[field] === null || ( typeof attributes[field] === "string" && attributes[field].trim() === "" ) ) {
					_return.fields[field] = "Oops, you missed one!";
				}
			});

			var email = function(email) {
				return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email);
			};

			if( !email(attributes.email) ) {
				_return.fields.email = "Oops, this email address seems to be invalid.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		},
	});
	return Model;
});