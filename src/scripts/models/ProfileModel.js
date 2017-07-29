define(['parse'], function(Parse) {
	var Model = Parse.Object.extend("Profile", {
		
		requiredFields: ["firstname", "lastname", "about", "phone"],
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

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }
	});
	return Model;
});
