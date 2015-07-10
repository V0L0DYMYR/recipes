#!/bin/env node

/*
 _raw: '{"id":"771860742905820",
 "first_name":"Vincent","gender":"male",
 "last_name":"Gog",
 "link":"https:\\/\\/www.facebook.com\\/app_scoped_user_id\\/771860742905820\\/",
 "locale":"en_US","
 middle_name":"Van",
 "name":"Vincent Van Gog",
 "timezone":2,
 "updated_time":"2014-12-07T08:20:39+0000",
 "verified":true}',

 */

var model = require("./model.js");
var http = require('http');
var https = require('https');
var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var multer = require('multer');
var gm = require('gm');
var Img = require('./img.js');
var api = require('./api.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

var img = new Img(fs, path, gm);

app.configure(function () {
  app.use(multer({
    dest: img.getImgDir(),
    limits: {
      fileSize: 4000000
    },
    onFileUploadComplete: function (file, req, res) {
      img.convertAll(file.path);
    }
  }));

  app.use(express.logger('dev'));
  app.use(cookieParser());
  app.use(bodyParser({uploadDir: '../uploads'}));


  /*app.use(session({ secret: 'keyboard cat', key: 'sid'}));
  app.use(passport.initialize());
  app.use(passport.session());*/
});
var clientDir = path.resolve(__dirname, 'client');
app.use(express.static(clientDir));
model.defineModel();
var host = model.config;

var FB = host.oauth.facebook;

passport.use(new FacebookStrategy({
    clientID: FB.facebook_api_key,
    clientSecret: FB.facebook_api_secret,
    callbackURL: FB.callback_url
  },
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {

      model.User.findOne({ oauthId: profile.id }, function (err, user) {
        console.log('auth: '+ err + '  ' + user);
        if (err) {
          console.log(err);
        } else if (user) {
          done(null, user);
        } else {
          var user = new model.User({
            oauthId: profile.id,
            name: profile.displayName,
            created: Date.now()
          });
          console.log(profile);
          user.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });

        }
      });

    });
  }
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id)
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  model.User.findById(id, function(err, user){
    if(!err) done(null, user);
    else done(err, null)
  });
});

app.get('/api/recipes', function (req, res) {
  model.Recipe.find(function (err, recipes) {
    if (err) {
      console.log('error:mongoose:find:' + err);
    } else {
      var recipes = recipes.map(function (item) {
        return {
          id: item._id,
          name: item.name,
          body: item.body,
          img: item.img,
          date: item.date
        };
      });
      res.json({ recipes: recipes });
    }
  });
});

app.get('/api/user/current', function(req, res) {
  /*var userId = req.session.passport.user;
  model.User.findById(userId, function(err, user){
    if (!err) {
      res.json(user);
    } else {
      res.status(500);
      res.json(err);
    }
  });*/
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(500);
  res.json('Not Authenticated!');
}
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });


app.get('/api/img/:size/:imgFileName', function (req, res) {
  var imgPath = img.getImgDir() + '/' + req.param('size');
  res.sendfile(path.resolve(imgPath, req.param('imgFileName')));
});

app.delete('/api/recipe/:recipeId', function (req, res) {
  var recipeId = req.param('recipeId');
  model.Recipe.where({_id: recipeId }).find(function (err, recipes) {
    if (err) {
      res.status(500);
    } else {
      var recipe = recipes[0];

      var sImg = img.getSmallImgDirWith(recipe.img);
      img.rm(sImg);

      var mImg = img.getMediumImgDirWith(recipe.img);
      img.rm(mImg);

      recipe.remove(function (err) {
        if (err) console.log(err);
      });
    }
    res.end();
  });
});

app.get('/api/recipe/:recipeId', function (req, res) {
  var id = req.param('recipeId');
  model.Recipe.where({ _id: id }).find(function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.json(data[0]);
    }
  });
});

app.post('/api/recipe', function (req, res) {
  var server_filename = req.files.photo.name;
  var entity = req.body;
  entity.img = server_filename;
  var recipe = new model.Recipe(entity);
  model.save(recipe);

  res.end();
});

app.get('*', function (req, res) {
  res.sendfile(clientDir + '/index.html');
});

model.connectToMongo(host.mongo.uri);

var server = app.listen(host.http.port, host.http.ip, function () {
  console.log('Started at http://%s:%s', server.address().address, server.address().port);
});

