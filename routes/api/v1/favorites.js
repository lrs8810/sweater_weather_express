var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");

const environment = process.env.NODE_ENV || 'development'
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);

router.get('/', (request, response) => {
  const apiKey = request.body.api_key

  // 1. validate user has sent an API key with request
  if (!apiKey) {
    return response.status(401).json({ error: `Unauthorized access` })
  }

  // 2. Look up API key in the database
  database('users')
    .where('api_key', apiKey).first()
    .then(user => {
      if (!user) {
        response.status(401).json({ error: `Unauthorized access` })
      } else {
        database('favorites').where('user_id', user.id).select()
          .then(favorite => {
            let favArray = favorite
            // favArray.map()
          })
      }
    }).catch(error => {
      response.status(500).json({ error: `Couldn't add ${location} to favorites.` })
    })

});

router.post('/', (request, response) => {
  const apiKey = request.body.api_key
  const location = request.body.location

  // 1. validate user has sent an API key and location with request
  if (!apiKey) {
    return response.status(401).json({ error: `Unauthorized access` })
  }

  if (!location) {
    return response.status(400).json({ error: `Please provide a location` })
  }

  // 2. fetch lat/long
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_API_KEY}&address=${location}`)
    .then(response => response.json())
    .then(result => {
      let coords = result.results[0].geometry.location

  // 3. look up user in database by API key
      database('users')
        .where('api_key', apiKey).first()
        .then(user => {
          if (!user) {
            response.status(401).json({ error: `Unauthorized access` })
          } else {
  // 4. Add favorite location to database
            database('favorites').insert({
              location: location,
              user_id: user.id,
              lat: coords.lat,
              lng: coords.lng},
              'id')
              .then(favorite => {
                response
                .status(201)
                .json({ message: `${location} has been added to your favorites`})
              })
            }
          })
        })
        .catch(error => {
          response
          .status(500)
          .json({ error: `Could not add ${location} to favorites.` })
        })
});

module.exports = router;
