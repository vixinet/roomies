
require.config({
	
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery: 			'../vendor/jquery/dist/jquery.min',
		underscore: 		'../vendor/underscore/underscore-min',
		parse: 				'../vendor/parse/parse.min',
		text: 				'../vendor/requirejs-text/text',
		async:				'../vendor/requirejs-plugins/src/async',
		goog:				'../vendor/requirejs-plugins/src/goog',
		json:				'../vendor/requirejs-plugins/src/json',
		propertyParser:		'../vendor/requirejs-plugins/src/propertyParser',
		bootstrap: 			'../vendor/bootstrap/dist/js/bootstrap.min',
		datepicker: 		'../vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.min',
		slider: 			'../vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
		Swiper: 			'../vendor/swiper/dist/js/swiper.jquery.umd.min',
		facebook: 			'//connect.facebook.net/en_US/sdk',
		twitter: 			'//platform.twitter.com/widgets',
	},
	shim: {
		goog: {
			// deps: ["async", "propertyParser"]
		},
		jquery: {
			exports: "$"
		},
		underscore: {
			exports: "_"
		},
		parse: {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		},
		bootstrap: {
			deps: ["jquery"]
		},
		datepicker: {
			deps: ["jquery", "bootstrap"],
			exports: 'datepicker'
		},
		slider: {
			deps: ["jquery", "bootstrap"],
			exports: 'slider'
		},
		Swiper: {
			deps: ["jquery", "bootstrap"],
			exports: 'Swiper'
		},
		facebook: {
			exports: 'FB'
		},
		twitter: {
			exports: 'twttr'
		},
	},
});

require(['parse', 'router', 'views/AppView', 'datepicker', 'slider', 'facebook', 'twitter'], function(Parse, AppRouter, AppView) {
	
	$.fn.datepicker.defaults.format = "dd/mm/yyyy";
	$.fn.datepicker.defaults.weekStart = 1;

	Parse.initialize("WEyqooufzSqdPi0HptgY2W4kG30ESFgCpOXH06vY", "qjwfIV2xzwnUTlZzNENEOy4jsKpy4opMFguCBCiP");

	new AppView(function() {
		new AppRouter();
		Parse.history.start({ 
			pushState: window.pushState 
		});
	});

});