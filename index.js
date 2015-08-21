var request = require("request");
var cheerio = require("cheerio");

function url(word){
  return "http://app.vocabulary.com/app/1.0/dictionary/search?word="+word+"&tz=America%2FNew_York&tzo=-300&appver=1.0.0" 
}

function getShortDef(word, callback){
  request(url(), function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  def = $("p.short").text();
      callback(null, def);
    } else {
      callback(error);
    }
  });
}

function getLongDef(word, callback){
  request(url(), function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  def = $("p.long").text();
      callback(null, def);
    } else {
      callback(error);
    }
  });
}

var vocabFetcher = {
  getShortDef: getShortDef,
  getLongDef: getLongDef
}

module.exports = vocabFetcher
// vocabFetcher.getLongDef("hello", function(err, def){
//   if(err){
//     throw(err);
//   } else {
//     console.log(def)
//   }
// });
