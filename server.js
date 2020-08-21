'use strict'

//List of Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

//Global Vars
const PORT = process.env.PORT || 3003;
const app = express();
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAILS_API_KEY = process.env.TRAILS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

//Configure and start server
app.use(cors());
const client = new pg.Client(DATABASE_URL);
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening to port: ${PORT}`));
  });

//Constructor functions

function Location(locationObject){

  this.search_query = locationObject[0].icon;
  this.formatted_query = locationObject[0].display_name;
  this.latitude = locationObject[0].lat;
  this.longitude = locationObject[0].lon;
}

function Weather(weatherObject){
  // console.log(weatherObject);
  this.forecast = weatherObject.weather.description;
  this.time = weatherObject.valid_date;
}

function Trail(trailObject){
  this.name = trailObject.name;
  this.location = trailObject.location;
  this.length = trailObject.length;
  this.star_votes = trailObject.star_votes;
  this.stars = trailObject.stars;
  this.summary = trailObject.summary;
  this.conditions = trailObject.conditions;
  this.condition_date = trailObject.condtion_date;
  this.condition_time = trailObject.condition_time;
}

function Movie(movieObject){
  this.title = movieObject.title;
  this.overview = movieObject.overview;
  this.average_votes = movieObject.vote_average;
  this.total_votes = movieObject.vote_count;
  // this.image_url = movieObject.poster_path;
  // image doesn't render...front end issue, perhaps.
  this.popularity = movieObject.popularity;
  this.released_on = movieObject.release_date;
}

function Yelp(yelpObject){

}

//routes
app.get('/location', sendLocation);
app.get('/weather', sendWeatherData);
app.get('/trails', sendTrailData);
app.get('/movies', sendMovieData);
app.get('/yelp', sendYelpData);

//Locations
function sendLocation(request, response){
  const searchEntry = request.query.city;
  const searchUrl = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchEntry}&format=json`;


  client.query('SELECT * FROM table_locations WHERE search_query=$1;', [searchEntry])
    .then(resultFromPG => {
      if (resultFromPG.rowCount === 1) {
        console.log('found in database');
        response.send(resultFromPG.rows[0]);
      } else {
        superagent.get(searchUrl)
          .then(locationSearchReturn => {
            console.log('not found in database')
            const resultArray = locationSearchReturn.body;
            const constructLocation = new Location(resultArray);
            const locationsArry = [searchEntry, constructLocation.formatted_query, constructLocation.latitude, constructLocation.longitude];

            const savedLocation = 'INSERT INTO table_locations (search_query, formatted_query, latitude,longitude) VALUES ($1, $2, $3, $4);'
            client.query(savedLocation, locationsArry);
            response.send(constructLocation);
          }).catch(error => {
            console.log(error);
            response.status(500).send(error.message);
          })
      }
    }
    )}


//Weather

function sendWeatherData(request, response){
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const weatherSearchUrl = `https://api.weatherbit.io/v2.0/forecast/daily?&days=8&lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`;

  superagent.get(weatherSearchUrl)
    .then(weatherReturn => {
      const returningWeather = weatherReturn.body.data;
      const weatherArray = returningWeather.map(index => new Weather(index));
      response.send(weatherArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}

//Trails

function sendTrailData(request, response){
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const trailsSearchUrl = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${TRAILS_API_KEY}`;

  superagent.get(trailsSearchUrl)
    .then(trailReturn => {
      const returningTrails = trailReturn.body.trails;
      const trailArray = returningTrails.map(index => new Trail(index));
      response.send(trailArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}

//movies

function sendMovieData(request, response){
  console.log(request.query.search_query);
  const searchEntry = request.query.search_query;
  const movieSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${searchEntry}&page=1&include_adult=false`
  console.log(movieSearchUrl);
  superagent.get(movieSearchUrl)
    .then(movieReturn => {
      console.log(movieReturn.body.results[0]);
      const returningMovie = movieReturn.body.results;
      const movieArray = returningMovie.map(index => new Movie(index));
      response.send(movieArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}

//yelp

function sendYelpData(request, response){
  console.log(request.query.search_query);
  const searchEntry = request.query.search_query;
  const yelpSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${searchEntry}&page=1&include_adult=false`
  console.log(yelpSearchUrl);
  superagent.get(yelpSearchUrl)
    .then(yelpReturn => {
      console.log(yelpReturn.body.results[0]);
      const returningYelp = yelpReturn.body.results;
      const yelpArray = returningYelp.map(index => new Yelp(index));
      response.send(yelpArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}