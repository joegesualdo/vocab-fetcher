var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var Promise = require('bluebird');
var WrapChainablePromise = require('p-romise').WrapChainable;

var Word = function(word){
  this.name = word;
  this.vocabDotComUrl = url(word);
  this.vocabDotComSentenceURL = sentenceUrl(word);
  this.imageUrls = imageUrls(word)
}

var WordFetcher = function(){
  this.getWord = function(word){
    var self = this;
    return new Promise(function (resolve, reject) {
      self.getVocabDotComDOM(word).then(self.convertVocabDotComDomToJSON).then(self.addSentencesToWordObject).then(function(wordObj){
        resolve(wordObj)
      }).catch(function(e){
        reject(e)
      })
    })
  }
  this.url = url;
  this.sentenceUrl = sentenceUrl;
  this.imageUrls = imageUrls;
  this.getVocabDotComDOM = function(word){
    return new Promise(function (resolve, reject) {
      getVocabDotComDOM(word, function(err, body){
        if(!err){
          resolve(body)
        } else {
          reject(err)
        }
      })
    })
  }
  this.addSentencesToWordObject = function(wordObj){
    return new Promise(function (resolve, reject) {
      addSentencesToWordObject(wordObj, function(err, wordObj){
        if(!err){
          resolve(wordObj)
        } else {
          reject(err)
        }
      })
    })
  }
  this.getVocabDotComSentenceDOM = function(word){
    return new Promise(function (resolve, reject) {
      getVocabDotComSentenceDOM(word, function(err, body){
        if(!err){
          resolve(body)
        } else {
          reject(err)
        }
      })
    })
  }
  this.convertVocabDotComDomToJSON = function(body){
    return new Promise(function (resolve, reject) {
      convertVocabDotComDomToJSON(body, function(err, wordJSON){
        if(!err){
          resolve(wordJSON)
        } else {
          reject(err)
        }
      })
    })
  }
  this.convertVocabDotComSentenceDomToJSON = function(body){
    return new Promise(function (resolve, reject) {
      convertVocabDotComSentenceDomToJSON(body, function(err, wordJSON){
        if(!err){
          resolve(wordJSON)
        } else {
          reject(err)
        }
      })
    })
  }
  this.getShortDescription = function(word){
    return new Promise(function (resolve, reject) {
      getShortDescription(word, function(err, description){
        if(err){
          reject(err)
        } else {
          resolve(description)
        }
      })
    })
  }
  this.getLongtDescriptionPromise = function(word){
    return new Promise(function(resolve, reject){
      getLongDescription(word, function(err, description){
        if(err){
          reject(err)
        } else {
          resolve(description)
        }
      })
    })
  }
}

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

function addSentencesToWordObject(wordObj, callback){
  try {
    getVocabDotComSentenceDOM(wordObj.name, function(err, body){
      convertVocabDotComSentenceDomToJSON(body, function(err, json){
        wordObj.sentences = json
        callback(null, wordObj)
      })
    })
  } catch(e){
    callback(e)
  }
}
function getVocabDotComDOM(word, callback){
  request(url(word), function (error, response, body) {
    if (!error) {
      // var $ = cheerio.load(body)
      // var  def = $("p.short").text();
      callback(null, body);
    } else {
      callback(error);
    }
  });
}
function getVocabDotComSentenceDOM(word, callback){
  request(sentenceUrl(word), function (error, response, body) {
    if (!error) {
      callback(null, body);
    } else {
      callback(error);
    }
  });
}
function convertVocabDotComSentenceDomToJSON(body, callback){
  try {
    var sentenceCount = 5;
    bodyJSON = JSON.parse(body)
    var sentences = [];
    for(var i = 0; i < sentenceCount; i++){
      sentences.push(bodyJSON['result']['sentences'][i]['sentence'])
    }
    wordJSON = {}
    wordJSON.sentences = sentences;
    callback(null, wordJSON);
  } 
  catch(e) {
    callback(e);
  }
}

function convertVocabDotComDomToJSON(body, callback){
    // if (!error) {
    try{
      var $ = cheerio.load(body)
      var wordObj = new Word($("h1").text())

      wordObj.shortDescription = $("p.short").text();
      wordObj.longDescription = $("p.long").text();
      wordObj.definitions = $(".section.definition .sense").map(function(i, el){
        return $(el).find("h3.definition").text().replace( /\s\s+/g, ' ' )
      })
      callback(null, wordObj);
    } 
    catch(e) {
      callback(e)
    }
    // } else {
    //   callback(error);
    // }
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

// var vocabFetcher = {
//   getShortDescription: getShortDescription,
//   getLongDef: getLongDescription,
//   getDefs: getDefs,
//   getSentences: getSentences,
//   getImages: getImages
// }
//
// module.exports = vocabFetcher
//
// var hello = new Word("hello");
// hello.getShortDescriptionPromise().then(function(result){
//   console.log(result)
// })
// WrapChainablePromise(function(resolve, reject){
//   getShortDescription("ambiguous", function(err, description){
//     if(err){
//       reject(err);
//     } else {
//       resolve(description)
//     }
//   })
// }).then(function(val, resolve, reject){
//   getLongDescription("ambiguous", function(err, description){
//     if(err){
//       reject(err);
//     } else {
//       resolve(description)
//     }
//   })
// }, function(err){
//   console.log("There was an error getting short the description")
// }).then(function(val, resolve, reject){
// })

var wordFetcher = new WordFetcher();
//
// wordFetcher.getShortDescription("ambiguous").then(function(des){
//   console.log(des)
// })
// wordFetcher.getWord("ambiguous").then(function(wordObj){
//   console.log(wordObj)
// })


// wordFetcher.getVocabDotComDOM("ambiguous").then(wordFetcher.convertVocabDotComDomToJSON).then(wordFetcher.addSentencesToWordObject).then(function(wordObj){
//   console.log(wordObj)
// })
// .catch(function(e) {
//   console.log(e.message)
// });
// wordFetcher.getVocabDotComSentenceDOM("ambiguous").then(wordFetcher.convertVocabDotComSentenceDomToJSON).then(function(json){
//   console.log(json);
// })
// var wordObj = {name: "ambiguous"}
// addSentencesToWordObject(wordObj, function(err, wordObj){
//   console.log(wordObj)
// })
//
wordFetcher.getWord("ambiguous").then(function(word){
  console.log(word)
})
// var wordObj = new Word("ambiguous")
// console.log(wordObj)
