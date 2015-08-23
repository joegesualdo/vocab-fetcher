var request = require("request");
var cheerio = require("cheerio");

function url(word){
  return "http://app.vocabulary.com/app/1.0/dictionary/search?word="+word+"&tz=America%2FNew_York&tzo=-300&appver=1.0.0" 
}

function getShortDescription(word, callback){
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

function getLongDescription(word, callback){
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

var vocabFetcher = {
  getShortDescription: getShortDescription,
  getLongDef: getLongDescription,
  getDefs: getDefs
}

// module.exports = vocabFetcher
vocabFetcher.getDefs({word: "ambiguous"}, function(err, definitions){
  if(err){
    throw(err);
  } else {
    console.log(typeof sentences);
    // sentences.each(function(i, sentence){
    //   console.log(sentence);
    // })
  }
});
