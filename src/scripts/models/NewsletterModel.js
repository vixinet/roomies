define(['parse'], function(Parse) {
	var Model = Parse.Object.extend("Newsletter", {

		requiredFields: ["email"],
		requiredFieldsNumber: [],

		validate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			_.each(this.requiredFields, function(field) {
				if( typeof attributes[field] === typeof undefined || attributes[field] === null || ( typeof attributes[field] === "string" && attributes[field].trim() === "" ) ) {
					_return.fields[field] = "Oops, you missed one!";
				}
			});

			_.each(this.requiredFieldsNumber, function(field) {
				if( isNaN(attributes[field]) || attributes[field] < 0 ) {
					_return.fields[field] = "Oops, this must be a positive number.";
				}
			});

			var email = function(email) {
				return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email);
			};

			if( !email(attributes.email) ) {
				_return.fields.email = "You need a valid email address.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }
	});
	return Model;
});