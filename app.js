var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request'); 
var fs = require('fs');

// var dotenv = require('dotenv');
var dotenv = require('dotenv');
dotenv.load();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'))

app.set('views', './views');
app.set('view engine', 'pug');


//Main page
app.get('/', function(req,res) {
	res.render('home')
})

app.get('/blog', function(req,res) {
	res.render('blog')
})

var auth_token = process.env.AUTH_TOKEN;
var api_key = process.env.UA_KEY;

var options = {
	method: 'GET',
	uri: 'https://mapmyride.api.ua.com/v7.1/route/',
	headers: {
		'Content_Type': 'application/json', 
		'Referer': 'https://www.mapmyride.com/routes', 
		'Origin': 'https://www.mapmyride.com',
		'Api-Key': api_key, 
		'Authorization': auth_token
	},
	qs: {
		search_radius: '',
		minimum_distance:'5000',
		maximum_distance:'3218688',
		order_by:'date_created',
		activity_type:'11',
		close_to_location:'52.21115700000001,5.96992309999996',
		limit:'20'
	}, 
	json: true
} 


app.get('/routes', function(req,res) {
	var startingpoints = [];

	request(options, function(error, response, body) {
		console.log(response.statusCode);
		console.log(body.total_count);
		console.log(JSON.stringify(body, null, 2));

		if(response.statusCode === 200) {
			for(var i = 0 ; i < body._embedded.routes.length; i ++) {
				startingpoints.push({coordinates: body._embedded.routes[i].starting_location.coordinates,
					name: body._embedded.routes[i].name,
					link: "http://www.mapmyride.com" + body._embedded.routes[i]._links.self[0].href + "?datatype=json",
					distance: (body._embedded.routes[i].distance / 1000).toFixed(0),
				});
				console.log("Coordinates" + JSON.stringify(startingpoints, null, 2));
			};
		} else {
			if (err) {
				throw err;
			};
		};
		res.render('routes', {startingpoints: startingpoints});
	});
});

app.get('/specificroute', function(req,res) {
	res.render('specifiroute')
})

//Listen to the server
const server = app.listen(8080, () => {
    console.log(`server has started ${server.address().port}`)
})

