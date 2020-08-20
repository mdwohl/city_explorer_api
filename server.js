'use strict'

//List of Packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const { response, request } = require('express');

//Global Vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAILS_API_KEY = process.env.TRAILS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

//Start server
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening to port: ${PORT}`));
  });

//Constructor functions

function Location(jsonObject){

  this.search_query = jsonObject[0].icon;
  this.formatted_query = jsonObject[0].display_name;
  this.latitude = jsonObject[0].lat;
  this.longitude = jsonObject[0].lon;
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

//Locations
app.get('/location', sendLocation)
function sendLocation(request, response){
  const searchEntry = request.query.city;
  const searchUrl = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${searchEntry}&format=json`;

  superagent.get(searchUrl)
    .then(locationSearchReturn => {
      const resultArray = locationSearchReturn.body;
      const constructLocation = new Location(resultArray)
      response.send(constructLocation)
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })

}


//Weather
app.get('/weather', sendWeatherData);
function sendWeatherData(request, response){
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const weatherSearchUrl = `https://api.weatherbit.io/v2.0/forecast/daily?&days=8&lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`;

  superagent.get(weatherSearchUrl)
    .then(weatherReturn => {
      const returningWeather = weatherReturn.body.data;
      console.log(returningWeather);
      const weatherArray = returningWeather.map(index => new Weather(index));
      response.send(weatherArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}

//Trails
app.get('/trails', sendTrailData);
function sendTrailData(request, response){
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  const trailsSearchUrl = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${TRAILS_API_KEY}`;

  superagent.get(trailsSearchUrl)
    .then(trailReturn => {
      const returningTrails = trailReturn.body.trails;
      // console.log(returningTrails);
      const trailArray = returningTrails.map(index => new Trail(index));
      response.send(trailArray);
    }).catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    })
}

//Location check function
function checkIfLocationExists(){
  if('/location' === DATABASE_URL){
    response.client.send(location);
  } else if ('/location' !== DATABASE_URL){
    app.get('/location', sendLocation)
  }
}
checkIfLocationExists();
