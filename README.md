## Vocab Fetcher
> Fetch Vocabulary

## Install
```
$ npm install --save vocab-fetcher
```

## API
### .getWord(word)
```javascript
var VocabFetcher = require("vocab-fetcher")
var vocabFetcher = new VocabFetcher()

vocabFetcher.getWord("ambiguous")
.then(function(wordObj){
  console.log(wordObj)
})
```



