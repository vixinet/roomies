define(['parse'], function(Parse) {
	var Model = Parse.Object.extend("Room", {

		requiredFields: ["gender", "city", "district", "address", "zipCode", "title", "description"],
		requiredFieldsNumber: ["rent", "waterFee", "deposit", "surface", "floor"],

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

			if( typeof attributes.from === typeof undefined || attributes.from == null ) {
				_return.fields.from = "Oops, you missed one!";
			}

			if( typeof attributes.to === typeof undefined || attributes.to == null ) {
				_return.fields.to = "Oops, you missed one!";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		 }
	});
	return Model;
});
