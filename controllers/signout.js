const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = require('./signin').redisClient


const signOutDeleteToken = (req, res) => {
    if(req.headers) {
      const { authorization } = req.headers;
      return redisClient.DEL(authorization);
    }
  }

  module.exports = {
    signOutDeleteToken: signOutDeleteToken
  }