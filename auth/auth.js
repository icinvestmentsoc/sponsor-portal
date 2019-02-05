'use strict'
const rp = require('request-promise')
const logger = require('../src/logger.js')
const bcrypt = require('bcryptjs');

exports.authSponsor = (user, pass, db, session, callback) => {
  db.Sponsor.find({
    username: user
  }, (err, result) => {
    if (err || !result[0]) {
      logger.error('Unable to find sponsor: ' + user)
      callback({
        member: false,
        err: 'Wrong username or password'
      })
    } else {
      bcrypt.compare(pass, result[0].password_hash, (err, checkpass) => {
        if (checkpass) {
          // VALID USER
          logger.info('sponsor ' + user + ' has successfully logged in')
          session.docsoc = false
          session.login = true
          session.type = 'sponsor'
          session.user = user
          callback(true)
        } else {
          logger.info('sponsor ' + user + ' has failed logging in')
          callback({
            member: false,
            err: 'Wrong username or password'
          })
        }
      })
    }
  })
}

exports.authUser = (user, pass, session, callback) => {
  var optionsAuth = {
    method: 'POST',
    uri: 'https://krb.docsoc.co.uk/',
    body: {
      "user": user,
      "pass": pass
    },
    json: true
  }
  var optionsMember = {
    method: 'GET',
    uri: 'https://eactivities.union.ic.ac.uk/API/CSP/247/reports/members',
    headers: {
      'x-api-key': 'shhhhh'
    },
    json: true
  }

  rp(optionsAuth).then(function (pBodyAuth) {
    if (pBodyAuth.auth) {
      rp(optionsMember).then(function (pBodyMember) {
        var memberData = pBodyMember.find(x => x.Login === user);
        if (typeof memberData !== 'undefined') {
          logger.info('User ' + user + ' successfully logged in')
          session.docsoc = false
          session.login = true
          session.type = 'member'
          session.data = memberData
          session.user = user
          callback(true)
        } else {
          logger.info('User ' + user + ' not ICIS member')
          callback({
            member: true,
            err: 'Not a ICIS Member'
          })
        }
      }).catch(function (err) {
        callback({
          member: true,
          err: 'Authentication server down. Try again later'
        })
      })
    } else {
      logger.info('User ' + user + ' failed logged in')
      callback({
        member: true,
        err: 'Wrong Username or Password'
      })
    }
  }).catch(function (err) {
    callback({
      member: true,
      err: 'Authentication server down. Try again later'
    })
  })
}