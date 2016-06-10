# jsdon-ld-context-cache
Caching json-ld context lookups for performance and network access control.

See [http://manu.sporny.org/2016/json-ld-context-caching/](Context caching best practices) for details on why context caches are needed.

Essentially, by caching json-ld URL lookups, the time for applying json-ld normalization is vastly reduced.

The [https://github.com/msporny/json-jsonld-basic-perftest](context cache test suite) shows how this may be applied.

Replace the jsonld node module "documentLoader" function with a cache lookup.
This code needs to be adapted.

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
