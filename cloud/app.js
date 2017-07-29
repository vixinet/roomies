var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');

var app = express();

app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(parseExpressHttpsRedirect());
app.use(express.bodyParser());

app.locals._ = require('underscore');

var promise = function(req, room) {
	var p = new Parse.Promise();
	Parse.Config.get().then(function(config) {
		p.resolve({
			base_url: config.get('base_url').substr(0, config.get('base_url').length - 2) + req.url,
			title: 'Roomies Finland',
			imgs: {
				fb: [
					config.get('base_url') + 'resources/media/facebook-1.jpg',
					config.get('base_url') + 'resources/media/facebook-2.jpg',
					config.get('base_url') + 'resources/media/facebook-3.jpg',
					config.get('base_url') + 'resources/media/facebook-4.jpg',
				],
				twitter: config.get('base_url') + 'resources/media/twitter.jpg',
				global:  config.get('base_url') + 'resources/media/global.jpg'
			},
			social: {
				title: 'Find the best Roomie for your flat in Finland',
				description: "Roomies.fi helps you to find the perfect room to rent or the perfect Roomie for your shared flat. It's free, simple and fast.",
				facebook_app_id: config.get('facebook_app_id'),
				twitter_account: config.get('twitter_account')
			}
		}, room);
	});
	return p;
};

var numberNth = function(d){
	if( d === 11 || d === 12 || d === 13 ) return 'th';
	switch (d % 10) {
		case 1:  return d+"st";
		case 2:  return d+"nd";
		case 3:  return d+"rd";
		default: return d+"th";
    }
};

app.get('/', function(req, res) {
	promise(req).then(function(data) {
		res.render('canvas', data);	
	})
});

app.get('/not-found', function(req, res) {
	promise(req).then(function(data) {
		data.title = 'Oops... page not found';
		res.render('canvas', data);	
	})
});

app.get('/privacy', function(req, res) {
	promise(req).then(function(data) {
		data.title = 'Privacy Policy';
		res.render('canvas', data);	
	})
});

app.get('/account', function(req, res) {
	promise(req).then(function(data) {
		data.title = 'My Account';
		res.render('canvas', data);	
	})
});

app.get('/rooms', function(req, res) {
	promise(req).then(function(data) {
		data.title = 'Rooms';
		res.render('canvas', data);	
	})
});

app.get('/room/create', function(req, res) {
	promise(req).then(function(data) {
		data.title = 'List My Room';
		res.render('canvas', data);	
	})
});

app.get('/room/:room/:x?', function(req, res) {

	new Parse.Query(Parse.Object.extend('Room')).get(req.params.room).then(function(room) {
		return promise(req, room);
	}).then(function(data, room) {
		data.title = 'Room in ' + Parse.Config.current().get('CST_CITIES')[room.get('city')].name + ', ' + room.get('surface') + ' m2';
		data.social.title = 'Room ' + room.get('surface') + ' m2 on the ' + numberNth(room.get('floor')) + ' floor in ' + Parse.Config.current().get('CST_CITIES')[room.get('city')].name + ' for ' + room.get('rent') + '€ per month';
		data.social.description = room.get('description');

		room.relation('files').query().find().then(function(pictures) {
			
			if( pictures.length > 0 ) {	
				
				data.imgs.twitter = pictures[0].get('file').url();
				data.imgs.global = pictures[0].get('file').url();
				
				data.imgs.fb = [];
				
				app.locals._.each(pictures, function(picture) {
					data.imgs.fb.push(picture.get('file').url());
				})				

			}

			res.render('canvas', data);
		});

	}, function(e) {
		console.log('**** NOT FOUND *******');
		res.redirect('/not-found');
	});
});

app.get('*', function(req, res) {
	promise(req).then(function(data) {
		data.title += '.';
		res.render('canvas', data);	
	})
});

app.listen();