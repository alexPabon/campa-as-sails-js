/**
 * @file throttle.js
 * @module policies/throttle
 * @description Policy for limit the number of requests per user
 *
 */

const jwt = require("jsonwebtoken");
const requestCountsLogin = {};

module.exports = function (req, res, proceed) {
  const {username, password} = req.allParams();
  const attempts = 10;
  const duration = 60000;

  if (!username || !password) {
    return res.status(422).json({error: 'Username or password not provided'});
  }

  const key = `${username}_${req.ip}_${req.route.path}`;

  if (!requestCountsLogin[key]) {
    requestCountsLogin[key] = {
      count: 1,
      failedAttempts: 1,
      flag: false,
      resetTime: Date.now() + duration,
    };
  } else {
    if (Date.now() > requestCountsLogin[key].resetTime) {
      requestCountsLogin[key].count = 1;
      requestCountsLogin[key].flag = false;
      requestCountsLogin[key].resetTime = Date.now() + duration;
    } else {
      requestCountsLogin[key].count++;
    }
  }

  if (requestCountsLogin[key].count > attempts) {

    /** lengthen waiting time */
    if(!requestCountsLogin[key].flag && requestCountsLogin[key].failedAttempts <= 5){
      requestCountsLogin[key].flag = true;
      requestCountsLogin[key].failedAttempts++;
    }else if(!requestCountsLogin[key].flag && requestCountsLogin[key].failedAttempts > 5 && requestCountsLogin[key].failedAttempts <= 30){
      requestCountsLogin[key].resetTime = Date.now() + (duration * 4);
      requestCountsLogin[key].flag = true;
      requestCountsLogin[key].failedAttempts++;
    }else if(!requestCountsLogin[key].flag && requestCountsLogin[key].failedAttempts > 30){
      requestCountsLogin[key].resetTime = Date.now() + (duration * 6);
      requestCountsLogin[key].flag = true;
      requestCountsLogin[key].failedAttempts++;
    }else if(requestCountsLogin[key].failedAttempts > 40){
      requestCountsLogin[key].resetTime = Date.now() + (duration * 10);
      requestCountsLogin[key].flag = true;
      requestCountsLogin[key].failedAttempts = 1;
    }

    const exp = Math.floor((requestCountsLogin[key].resetTime - Date.now())/1000);
    return res.status(429).json({error: `Too many requests. Try it after ${exp} sec.`});
  }

  proceed();

};
