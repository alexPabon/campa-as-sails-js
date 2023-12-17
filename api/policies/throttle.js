/**
 * @file throttle.js
 * @module policies/throttle
 * @description Policy for limit the number of requests per user
 *
 */

const jwt = require("jsonwebtoken");
const requestCounts = {};

module.exports = function (req, res, proceed) {
  const attempts = process.env.THROTTLE_ATTEMPTS || 60;
  let duration = process.env.THROTTLE_LOCKOUT_DURATION_MIN || 1;
  duration = duration * 60 * 1000;

  if (!req.userId) {
    return res.status(403).json({error: 'No Authorization was found'});
  }

  const key = `throttle:${req.userId}_${req.ip}_${req.route.path}`;

  if (!requestCounts[key]) {
    requestCounts[key] = {
      count: 1,
      flag: false,
      resetTime: Date.now() + duration,
    };
  } else {
    if (Date.now() > requestCounts[key].resetTime) {
      requestCounts[key].count = 1;
      requestCounts[key].flag = false;
      requestCounts[key].resetTime = Date.now() + duration;
    } else {
      requestCounts[key].count++;
    }
  }

  if (requestCounts[key].count > attempts) {

    if(!requestCounts[key].flag) {
      requestCounts[key].flag = true;
      requestCounts[key].resetTime = Date.now() + duration;
    }
    const exp = Math.floor((requestCounts[key].resetTime - Date.now())/1000);
    return res.status(429).json({error: `Too many requests. Try it after ${exp} sec. `});
  }

  proceed();

};
