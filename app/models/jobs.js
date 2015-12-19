//Setup the shema for the jobs
var mongoose  = require('mongoose');
//var Schema = mongoose.Schema;

var JobSchema   = new mongoose.Schema({
      title:String,
      company:String,
      localisation: String,
      contract: String,
      category:String,
      description:String,
      date:Date,
      tags:[String]
});

module.exports = mongoose.model('Job', JobSchema);
