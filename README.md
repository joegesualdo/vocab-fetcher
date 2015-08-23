## Vocab Fetcher
> Fetch Vocabulary

## Install
```
$ npm install --save vocab-fetcher
```

## API

### .getShortDescription(word, callback(error, description))
```javascript
var vocabFetcher = require("vocab-fetcher");

vocabFetcher.getShortDescription("ambiguous", function(err, description){
  if(!err){
    console.log(description);
  } else {
    throw(err);
  }
});
```
### .getLongDescription(word, callback(error, description))
```javascript
var vocabFetcher = require("vocab-fetcher");

vocabFetcher.getLongDescription("ambiguous", function(err, description){
  if(!err){
    console.log(description);
  } else {
    throw(err);
  }
});
```

### .getDefs(options, callback(error, definitions))
```javascript
vocabFetcher.getDefs({
  word: "ambiguous"
}, function(err, defintions){
  if(err){
    throw(err);
  } else {
    for(var i = 0; i < definitions.length; i++){
      console.log(i + ") " + defintions[i]);
    }
  }
});
```

### .getSentences(options, callback(error, sentences))
```javascript
vocabFetcher.getSentences({
  word: "ambiguous",
  count: 5
}, function(err, sentences){
  if(err){
    throw(err);
  } else {
    for(var i = 0; i < sentences.length; i++){
      console.log(i + ") " +sentences[i]);
    }
  }
});
```



