var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var Promise = require('bluebird');

var Word = function(word){
  this.name = word;
  this.vocabDotComUrl = url(word);
  this.vocabDotComSentenceURL = sentenceUrl(word);
}


var WordFetcher = function(){
  this.getWord = function(word){
    var self = this;
    return new Promise(function (resolve, reject) {
      self.getVocabDotComDOM(word).then(self.convertVocabDotComDomToJSON).then(self.addSentencesToWordObject).then(self.addImagesToWordObject).then(self.addMnemonicToWordObject).then(function(wordObj){
        resolve(wordObj)
      }).catch(function(e){
        reject(e)
      })
    })
  }
  this.url = url;
  this.sentenceUrl = sentenceUrl;
  this.imageUrls = imageUrls;
  this.getVocabDotComDOM = getVocabDotComDomPromise
  this.convertVocabDotComDomToJSON = convertVocabDotComDomToJSONPromise
  this.addSentencesToWordObject = addSentencesToWordObjectPromise 
  this.addMnemonicToWordObject = addMnemonicToWordObjectPromise
  this.addImagesToWordObject = addImagesToWordObjectPromise
}

function url(word){
  return "http://app.vocabulary.com/app/1.0/dictionary/search?word="+word+"&tz=America%2FNew_York&tzo=-300&appver=1.0.0" 
}
function vocabularyDotComAudioUrl(id){
  return "http://s3.amazonaws.com/audio.vocabulary.com/1.0/us/" + id + ".mp3"
}
function mnemonicDictionaryUrl(word){
  return "http://www.mnemonicdictionary.com/?word=" + word 
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

function dictionaryDotComUrl(word){
  return "http://dictionary.reference.com/browse/" + word 
}

function addSentencesToWordObject(wordObj, callback){
  try {
    getVocabDotComSentenceDOM(wordObj.name, function(err, body){
      convertVocabDotComSentenceDomToJSON(body, function(err, json){
        if(json){
          wordObj.sentences = json["sentences"];
        } else {
          wordObj.sentences = [];
        }
        callback(null, wordObj)
      })
    })
  } catch(e){
    callback(e)
  }
}

function addImagesToWordObject(wordObj, callback){
  try {
    getImages(wordObj.name, function(err, images){
      if (!err){
        wordObj.images = images;
        callback(null, wordObj)
      } else {
        callback(e)
      }
    })
  } catch(e){
    callback(e)
  }
}
function addMnemonicToWordObject(wordObj, callback){
  try {
    getMnemonic(wordObj.name, function(err, mnemonic){
      if (!err){
        wordObj.mnemonic= mnemonic;
        callback(null, wordObj)
      } else {
        callback(e)
      }
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
    // var sentenceCount = 24;
    bodyJSON = JSON.parse(body)
    // var sentences = [];
    // for(var i = 0; i < sentenceCount; i++){
    //   sentences.push(bodyJSON['result']['sentences'][i]['sentence'])
    // }
    wordJSON = {}
    wordJSON.sentences = bodyJSON['result']['sentences'];
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

      // descriptions
      wordObj.shortDescription = $("p.short").text();
      wordObj.longDescription = $("p.long").text();

      //definitions
      var definitions = []
      // If page has "Primary Meaning" definitions, we should use
      //   these and not the general defintiions
      // Checks for "Primary Meaning" definitions
      if ($(".def.selected").length != 0){
        $(".definitions").find(".definitionNavigator").find("tr").each(function(i, el){
          // Add the word Form to the sentence
          var defLength = $(el).find(".posList").children().length
          for(var y = 0; y < defLength; y++){
            var defObj = {}
            defObj.partOfSpeech = $(el).find(".posList").children()[y].children[0].data
            defObj.definition = $(el).find(".def")[y].children[0].data
            definitions.push(defObj)
          }
        })
      } else {
        $(".section.definition .sense").each(function(i, el){
          var defObj = {}
          // Add the word Form to the sentence
          originalString = $(el).find("h3.definition").text().replace( /\s\s+/g, ' ' ).trim()
          defObj.partOfSpeech =  originalString.split(" ")[0]
          defObj.definition = originalString.split(' ').slice(1).join(' '); 
          definitions.push(defObj)
        })
      }
      wordObj.definitions = definitions

      // audio file
      var audioId = $(".dynamictext").children('a').data('audio')
      var audioUrl = vocabularyDotComAudioUrl(audioId)
      wordObj.audioUrl = audioUrl

      // word family
      var $sections = $(".sectionHeader")
      var el = $sections[$sections.length - 2]
      var family = $(el).next().attr('data')
      var jsonFamily = JSON.parse(family)
      wordObj.family= jsonFamily

      callback(null, wordObj);
    } 
    catch(e) {
      callback(e)
    }
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
      var definitions = []
      $(".section.definition .sense").each(function(i, el){
        definitions.push($(el).find("h3.definition").text().replace( /\s\s+/g, ' ' ))
      })
      callback(null, definitions);
    } else {
      callback(error);
    }
  }.bind(this, options));
}

function getAudioFromDictionaryDotCom(word, callback){
  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  request(dictionaryDotComUrl(word), function (word, error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var link = $(".audio-wrapper .speaker").attr('href')
      // var definitions = []
      // $(".section.definition .sense").each(function(i, el){
      //   definitions.push($(el).find("h3.definition").text().replace( /\s\s+/g, ' ' ))
      // })
      callback(null, link);
    } else {
      callback(error);
    }
  }.bind(this, word));
}

function getWordFamily(word, callback){
  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  request(url(word), function (word, error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var $sections = $(".sectionHeader")
      var el = $sections[$sections.length - 2]
      var family = $(el).next().attr('data')
      var jsonFamily = JSON.parse(family)
      callback(null, jsonFamily);
    } else {
      callback(error);
    }
  }.bind(this, word));
}

function getVocabularyDotComAudioUrl(word, callback){
  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }
  request(url(word), function (word, error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var audioId= $(".dynamictext").children('a').data('audio')
      var audioUrl = vocabularyDotComAudioUrl(audioId)
      callback(null, audioUrl);
    } else {
      callback(error);
    }
  }.bind(this, word));
}

// TODO: Change method to get the entire sentence object
// function getSentences(options, callback){
//   var options  = options || {};
//   var word = options["word"]
//   options["count"] = options["count"] || 10
//
//   if(typeof word == undefined){
//     throw(new Error("Please provide a word"));
//   }
//   request(sentenceUrl(word), function (options, error, response, body) {
//     if (!error) {
//       var jsonResponse= JSON.parse(body)
//       var sentences = [];
//       for(var i = 0; i < options["count"]; i++){
//         sentences.push(jsonResponse['result']['sentences'][i]['sentence'])
//       }
//       callback(null, sentences);
//     } else {
//       callback(error);
//     }
//   }.bind(this, options));
// }

function getImages(word, callback){
  if(typeof word == undefined){
    throw(new Error("Please provide a word"));
  }

  var potentialImageUrls = imageUrls(word);
  var successfulImageUrls = [];

  async.each(potentialImageUrls, function(url, callback){
    var potentialImageUrl = url;

    request(potentialImageUrl, function (word, potentialImageUrl, successfulImageUrls, error, response, body) {
      if (!error && response.statusCode == 200) {
        successfulImageUrls.push(potentialImageUrl);
        callback();
      } else {
        callback();
      }
    }.bind(this, word, potentialImageUrl, successfulImageUrls));
  }, function(err){
    if(!err){
      callback(null, successfulImageUrls)
    } else {
      callback(err, null)
    }
  })
}
function getMnemonic(word, callback){
  request(mnemonicDictionaryUrl(word), function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body)
      var  mnemonic = $(".icon-lightbulb").first().parent().text().trim();
      callback(null, mnemonic);
    } else {
      callback(error);
    }
  });
}

// Promise Functions ====================
function getVocabDotComDomPromise(word){
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
function addSentencesToWordObjectPromise(wordObj){
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
function addMnemonicToWordObjectPromise(wordObj){
  return new Promise(function (resolve, reject) {
    addMnemonicToWordObject(wordObj, function(err, wordObj){
      if(!err){
        resolve(wordObj)
      } else {
        reject(err)
      }
    })
  })
}
function addImagesToWordObjectPromise(wordObj){
  return new Promise(function (resolve, reject) {
    addImagesToWordObject(wordObj, function(err, wordObj){
      if(!err){
        resolve(wordObj)
      } else {
        reject(err)
      }
    })
  })
}
function getVocabDotComSentenceDOMPromise(word){
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
function convertVocabDotComDomToJSONPromise(body){
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

function convertVocabDotComSentenceDomToJSONPromise(body){
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

function getImagesPromise(word){
  return new Promise(function (resolve, reject) {
    getImages(word, function(err, images){
      if(err){
        reject(err)
      } else {
        resolve(images)
      }
    })
  })
}
function getMnemonicPromise(word){
  return new Promise(function (resolve, reject) {
    getMnemonic(word, function(err, mnemonic){
      if(err){
        reject(err)
      } else {
        resolve(images)
      }
    })
  })
}
function getShortDescriptionPromise(word){
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
// End Promise Functions ====================

module.exports = WordFetcher;


