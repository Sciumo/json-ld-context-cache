# jsdon-ld-context-cache
Caching json-ld context lookups for performance and network access control.

See [Context caching best practice](http://manu.sporny.org/2016/json-ld-context-caching/s) for details on why context caches are needed.

Essentially, by caching json-ld URL lookups, the time for applying json-ld normalization is vastly reduced.

The [context cache test suite](https://github.com/msporny/json-jsonld-basic-perftest) shows how this may be applied.

Replace the jsonld node module "documentLoader" function with a cache lookup.
Original cache example:

```javascript
var async = require('async');
var fs = require('fs');
var jsonld = require('jsonld');

var ctx = fs.readFileSync('../contexts/schema.org.jsonld', 'utf8');
var CONTEXTS = {'http://schema.org/': ctx};

jsonld.documentLoader = function(url, callback) {
  if(url in CONTEXTS) {
    return callback(
      null, {
        contextUrl: null, // this is for a context via a link header
        document: CONTEXTS[url], // this is the actual document that was loaded
        documentUrl: url // this is the actual context URL after redirects
      });
  } else {
    throw new Error('invalid context: ' + url);
  }
};
````

#using json-ld-context-cache

jsonld now supports a documentLoader options parameter.

```javascript
var logger = require('winston');
var jsonld = require('jsonld');
jsonldcache = require('json-ld-context-cache')( { contextDir: __dirname + '/node_modules/json-ld-context-cache/contexts', log :logger.info });
var options = {documentLoader:jsonldcache.documentLoader};

function logObj( msg ){
  return function(err,obj){
    if( err ) {
      logger.info( `${msg} Error ${err}`);
    }else{
      var res = JSON.stringify(obj,null,2);
      logger.info( `${msg} : ${res}` );
    }
  };
}

jsonld.expand(jsonObject, options, logObj(`${fname} expand`) );

```
