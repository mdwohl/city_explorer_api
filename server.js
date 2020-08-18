'use strict'

//List of Packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//Global Vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());

//Start server
app.listen(PORT, () => console.log(`listening to port: ${PORT}`));

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

//Locations
app.get('/location', (request, response) =>{
  const jsonObject = require('./data/location.json');
  const constructLocation = new Location(jsonObject);

  response.send(constructLocation);
});

//Weather
app.get('/weather', sendWeatherData); 
function sendWeatherData(request, response){
  const weatherObject = require('./data/weather.json');
  const weatherDataFromJson = weatherObject.data;
  const weatherArray = [];

  weatherDataFromJson.forEach(weatherObject =>{
    const constructWeather = new Weather(weatherObject);
    weatherArray.push(constructWeather);
  })

  response.send(weatherArray);
}

// app.get('/weather', sendWeatherData);

// function sendWeatherData(request, response){
//   const jsonWeatherObject = require('./data/weather.json');
//   const weatherArray = jsonWeatherObject.data.valid_date;
//   const newWeatherArr = [];

//   weatherArray.forEach(newWeatherObject => {
//     const newWeather = new Weather(newWeatherObject);
//     newWeatherArr.push(newWeather);

//   })




