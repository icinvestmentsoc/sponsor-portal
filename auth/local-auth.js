'use strict'
const fs = require('fs')
const logger = require('../src/logger.js')
const bcrypt = require('bcryptjs');

exports.authSponsor = (user, pass, db, session, callback) => {
  db.Sponsor.find({
    username: user
  }, (err, result) => {
    if (err || !result[0]) {
      logger.error('Unable to find sponsor: ' + err)
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

const authsamplepath = './auth/authsample.json'

exports.authUser = (user, pass, session, callback) => {
  var auth = fs.readFileSync(authsamplepath)
  var data = JSON.parse(auth).find(el => el.Login === 'test18')
  if (data) {
    // VALID USER
    logger.info('User test18 successfully logged in')
    // setup session
    session.docsoc = false
    session.login = true
    session.type = 'member'
    session.data = data
    session.user = 'test18'
    // make folder
    callback(true)
  } else {
    // NON DOCSOC USER
    logger.info('Not a member of DoCSoc')
    callback({
      member: true,
      err: 'Not a DoCSoc Member!'
    })
  }
}