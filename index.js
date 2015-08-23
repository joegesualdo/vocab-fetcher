var request = require("request");
var cheerio = require("cheerio");
var async = require("async");

function url(word){
  return "http://app.vocabulary.com/app/1.0/dictionary/search?word="+word+"&tz=America%2FNew_York&tzo=-300&appver=1.0.0" 
}
function sentenceUrl(word){
  return "http://corpus.vocabulary.com/api/1.0/examples.json?query="+word+"&maxResults=24&startOffset=0&filter=3&tz=America%2FNew_York&tzo=-300&appver=1.0.0"
}
function imageUrls(word){
  var urls = [];
  urls.push("http://wordinfo.info/words/images/"+word+".jpg");
  for(var i = 1; i <= 10; i++){
    urls.push("http://wordinfo.info/words/images/"+word+"-"+i+".jpg");
  }
  return urls;
}

function getShortDescription(word, callback){
  request(url(word), function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  def = $("p.short").text();
      callback(null, def);
    } else {
      callback(error);
    }
  });
}

function getLongDescription(word, callback){
  request(url(word), function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  def = $("p.long").text();
      callback(null, def);
    } else {
      callback(error);
    }
  });
}

function getDefs(options, callback){
  var options  = options || {};
  var word = options["word"]
  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  request(url(word), function (options, error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  $definitionElements = $(".section.definition .sense");
      var definitions = $definitionElements.map(function(i, el){
        return $(el).find("h3.definition").text().replace( /\s\s+/g, ' ' )
      })
      callback(null, definitions);
    } else {
      callback(error);
    }
  }.bind(this, options));
}

function getSentences(options, callback){
  var options  = options || {};
  var word = options["word"]
  options["count"] = options["count"] || 10

  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  request(sentenceUrl(word), function (options, error, response, body) {
    if (!error) {
      var jsonResponse= JSON.parse(body)
      var sentences = [];
      for(var i = 0; i < options["count"]; i++){
        sentences.push(jsonResponse['result']['sentences'][i]['sentence'])
      }
      callback(null, sentences);
    } else {
      callback(error);
    }
  }.bind(this, options));
}
function getImages(options, callback){
  var options  = options || {};
  var word = options["word"]

  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  var potentialImageUrls = imageUrls(word);
  var successfulImageUrls = [];
  async.each(potentialImageUrls, function(url, callback){
    var potentialImageUrl = url;
    request(potentialImageUrl, function (options, potentialImageUrl, successfulImageUrls, error, response, body) {
      if (!error && response.statusCode == 200) {
        successfulImageUrls.push(potentialImageUrl);
        callback();
      } else {
        callback();
      }
    }.bind(this, options, potentialImageUrl, successfulImageUrls));
  }, function(err){
    if(!err){
      callback(null, successfulImageUrls)
    } else {
      callback(err, null)
    }
  })
}

var vocabFetcher = {
  getShortDescription: getShortDescription,
  getLongDef: getLongDescription,
  getDefs: getDefs,
  getSentences: getSentences,
  getImages: getImages
}

module.exports = vocabFetcher
