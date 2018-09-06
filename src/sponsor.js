const fs = require('fs-extra')
const zipFolder = require('zip-folder')

var check = (req,res, callback) => {
  if(req.session.login){
    if(req.session.type == 'sponsor'){
      callback() 
    }else if(req.session.type == 'member'){
      res.redirect('/member') 
    }
  }else{
    res.redirect('/') 
  }
}

exports.setup = (app, db) => {
  
  //sponsor PAGE
  app.get('/sponsor', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.session.user},(err, sponsor) => {
      res.render('sponsor', {sponsor: sponsor[0]})
    }) 
  }) 

  app.get('/sponsor/error/:error', (req,res,next) => {
    check(req,res,next)
  }, (req,res) => {
    db.Sponsor.find({username: req.session.user},(err, sponsor) => {
      res.render('sponsor', {sponsor: sponsor[0], err: req.params.error})
    }) 
  }) 
  
  //=====================POSITIONS========================
  
  //Show document
  app.post('/sponsor/show/:pos/:filename/:document', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var sponsorpath = './sponsors/' + req.session.user + '/'
    if(!fs.existsSync(sponsorpath)){
      console.log(req.session.user+ " sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(sponsorpath)
      console.log('made a temp fix')
    }
    var pospath = sponsorpath + req.params.pos + '/'
    if(!fs.existsSync(pospath)){
      console.log(req.params.pos + " position, of " + req.session.user +" sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(pospath)
      console.log('made a temp fix')
    }
    var userpath = pospath + req.params.filename + '/'
    if(!fs.existsSync(pospath)){
      console.log("user " + req.params.filename + " of " + req.params.pos + " position, of " + req.session.user +" sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(userpath)
      console.log('made a temp fix')
      res.redirect('/sponsor/#positions-tab')
    }else{
      var path = userpath + req.params.document
      res.download(path)
    }
  }) 
  
  //Download member
  app.post('/sponsor/download/user/:pos/:filename/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var sponsorpath = './sponsors/' + req.session.user + '/'
    if(!fs.existsSync(sponsorpath)){
      console.log(req.session.user+ " sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(sponsorpath)
      console.log('made a temp fix')
    }
    var pospath = sponsorpath + req.params.pos + '/'
    if(!fs.existsSync(pospath)){
      console.log(req.params.pos + " position, of " + req.session.user +" sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(pospath)
      console.log('made a temp fix')
    }
    var path = pospath + req.params.filename
    var zippath = './temp/' + req.params.filename + '.zip'
    zipFolder(path, zippath, function(err) {
      if(err) {
        console.log('oh no!', err);
      } else {
        res.download(zippath, () => {
          if(fs.existsSync(zippath)){
            fs.removeSync(zippath) 
          }
        })
      }
    });
  }) 
  
  //Download Position
  app.post('/sponsor/download/pos/:pos/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    var sponsorpath = './sponsors/' + req.session.user + '/'
    if(!fs.existsSync(sponsorpath)){
      console.log(req.session.user+ " sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
      fs.mkdirSync(sponsorpath)
      console.log('made a temp fix')
    }
    var path = sponsorpath +  req.params.pos
    var zippath = './temp/' + req.params.pos + '.zip'
    zipFolder(path, zippath, function(err) {
      if(err) {
        console.log('oh no!', err);
      } else {
        res.download(zippath, () => {
          if(fs.existsSync(zippath)){
            fs.removeSync(zippath)
          }
        })
      }
    });
  }) 
  
  //Add new Position
  app.post('/sponsor/add-position', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return 
      if(req.body.name.trim() && !sponsor[0].positions.some(position => position.name === req.body.name.trim())){
        var data = {
          name: req.body.name.trim(),
          description: req.body.description,
          requirements: req.body.requirements,
          link: req.body.link,
          users: []
        }
        var sponsorpath = './sponsors/' + req.session.user + '/'
        if(!fs.existsSync(sponsorpath)){
          console.log(req.session.user+ " sponsor path magically deleted SOMETHING HAS GONE TERRIBLY WRONG")
          fs.mkdirSync(sponsorpath)
          console.log('made a temp fix')
        }
        var path = sponsorpath +  req.body.name.trim() + '/'
        if(!fs.existsSync(path)){
          fs.mkdirSync(path) 
        }
        sponsor[0].positions.push(data) 
        sponsor[0].save((err, user) => {
          if (err) return 
          res.redirect('/sponsor/#positions-tab')
        }) 
      }else{
        res.redirect('/sponsor/error/Position name is blank or already exists')
      }
    }) 
  }) 
  
  //Remove Position
  app.post('/sponsor/remove-position/:name', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return   
      var path = './sponsors/' + req.session.user + '/' +  req.params.name + '/'
      if(fs.existsSync(path)){
        fs.removeSync(path) 
      }
      sponsor[0].positions = sponsor[0].positions.filter(position => position.name !== req.params.name) 
      sponsor[0].save((err, user) => {
        if (err) return   
        res.redirect('/sponsor/#positions-tab')
      }) 
    }) 
  }) 
  app.post('/sponsor/remove-position/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    res.redirect('/sponsor/#positions-tab')
  }) 
  
  //=======================================NEWS=================================
  
  // Add news
  app.post('/sponsor/add-news', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return  
      var news = {
        date: (new Date()).toString(),
        title: req.body.title,
        text: req.body.text,
        link: req.body.link
      }
      sponsor[0].news.push(news)
      sponsor[0].save((err, user) => {
        if (err) return   
        res.redirect('/sponsor/#news-tab')
      }) 
    }) 
  })


  //Remove News
  app.post('/sponsor/remove-news/:date', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return   
      sponsor[0].news = sponsor[0].news.filter(n => n.date !== req.params.date) 
      sponsor[0].save((err, user) => {
        if (err) return   
        res.redirect('/sponsor/#news-tab')
      }) 
    }) 
  }) 
  app.post('/sponsor/remove-news/', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    res.redirect('/sponsor/#news-tab')
  }) 
  
  //=====================================ACCOUNT=================================
  
  //Update info
  app.post('/sponsor/update-info', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return  
      sponsor[0].info.email = req.body.email
      sponsor[0].info.description = req.body.description
      sponsor[0].info.link = req.body.link
      sponsor[0].save((err, user) => {
        if (err) return   
        res.redirect('/sponsor/#info-tab')
      }) 
    }) 
  })
  
  
  
  //change Password
  app.post('/sponsor/change-password', (req,res,next) => {
    check(req,res,next)
  },(req,res) => {
    db.Sponsor.find({username: req.session.user} , (err, sponsor) => {
      if (err) return  
      if(req.body.new && sponsor[0].password === req.body.old && req.body.new === req.body.new2) {
        sponsor[0].password = req.body.new
        sponsor[0].save((err, user) => {
          if (err) return   
          res.redirect('/sponsor/#info-tab')       
        }) 
      }else{
        res.redirect('/sponsor/error/Error while trying to change password. Please try again.')
      }
    }) 
  }) 
}