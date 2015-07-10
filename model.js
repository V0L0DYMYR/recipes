var mongoose = require("mongoose");

module.exports = {
  save: function (entity, callback) {
    entity.date = new Date();
    entity.save(function (err) {
      if (err) {
        console.log('error:mongoose:' + err);
      }
    });
  },
  defineModel: function () {
    var recipeSchema = new mongoose.Schema({
      name: String,
      body: String,
      img: String,
      date: Date
    });

    module.exports.Recipe = mongoose.model('Recipes', recipeSchema);

    var userSchema = new mongoose.Schema({
      oauthId: Number,
      name: String,
      created: Date
    });

    module.exports.User = mongoose.model('Users', userSchema);
  },
  connectToMongo: function () {
    var mongoUri = this.config.mongo.uri;

    mongoose.connect(mongoUri, function (err, res) {
      if (err) {
        console.log('ERROR connecting to: ' + mongoUri + '. ' + err);
      } else {
        console.log('Succeeded connected to: ' + mongoUri);
      }
    });
  },

  config: {
    http: {
      ip: process.env.OPENSHIFT_NODEJS_IP
          || process.env.IP
          || "127.0.0.1",
      port: process.env.OPENSHIFT_NODEJS_PORT
          || process.env.PORT
          || 8080
    },
    mongo: {
      ip: process.env.OPENSHIFT_MONGODB_DB_HOST || "localhost",
      port: process.env.OPENSHIFT_MONGODB_DB_PORT || 27017,
      user: process.env.OPENSHIFT_MONGODB_DB_USERNAME || "admin",
      db: "recipes",
      password: process.env.OPENSHIFT_MONGODB_DB_PASSWORD,
      uri: process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_GEAR_NAME
      || "mongodb://127.0.0.1:27017/recipes"
    },
    oauth: {
      facebook: {
        facebook_api_key: '342936619228200',
        facebook_api_secret: '60a087d0a96fbdf28ab9a459437f435f',
        callback_url: 'http://recipes-nizhyn.rhcloud.com/auth/facebook/callback',
        use_database: false,
        host: 'recipes-nizhyn.rhcloud.com',
        username: 'admin',
        password: '',
        database: 'recipes'
      }
    }
  }
}

