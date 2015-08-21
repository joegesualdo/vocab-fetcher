## Vocab Fetcher
> Fetch Vocabulary

## Install
```
$ npm install --save vocab-fetcher
```

## Usage
```javascript
var vocabFetcher = require("vocab-fetcher");

vocabFetcher.getShortDef("ambiguous", function(err, def){
  if(!err){
    console.log(def);
  } else {
    throw(err);
  }
});
```

## API

### .getShortDef(word, callback(error, definition))

### .getLongDef(word, callback(error, definition))




