/*
 * node.js only json-ld document cache hack until caching supported by json-ld
 */
module.exports = function( options ){
  var fs = require('fs');
  var path = require('path');
  var options = options || {};
  var jsonldcache = {};
  var log = jsonldcache.log = options.log || console.log;
  var nextLoader = jsonldcache.nextLoader = options.nextLoader;
  var contextDir = jsonldcache.contextDir = options.contextDir || "./contexts";
  var contextFile = options.contextFile || "registry.json";
  contextFile = jsonldcache.contextFile = path.join( contextDir, contextFile );
  log(`jsonldcache loading registry ${contextFile}`);
  var registry = jsonldcache.registry = require(contextFile);
  var registryUri = jsonldcache.registryUri = {};
  var contextsCache = jsonldcache.contextxCache = {};
  var canRead = function( filename ){
      try{
        fs.accessSync(filename,fs.R_OK)
        return true;
      }catch(e){
        return false;
      }
  }
  Object.keys(registry.contexts).forEach(function(key){
    var entry = registry.contexts[key];
    if( !("file" in entry) ){
      entry.file = key + ".jsonld";
    }
    if( !(entry.uri in registryUri) ){
      var file = path.join(contextDir, entry.file);
      if( canRead(file) ){
        registryUri[entry.uri] = {
          "file": file,
          "id": key
        };
        log(`jsonldcache entry: ${key} ${file}`);
      }else{
        log(`jsonldcache unable to read: ${key} ${file}` );
      }
    }
  });
  var readContext = function( url ){
    if( url in registryUri ){
      var entry = registryUri[url];
      var ctx = fs.readFileSync(entry.file, 'utf8');
      log(`jsonldcache loaded ${url} ${entry.file}`)
      contextsCache[url] = ctx;
    }else{
      if( nextLoader ){
        return nextLoader(url,callback);
      }else{
        throw new Error('jsonldcache Missing context: ' + url);
      }
    }
  }
  jsonldcache.documentLoader = function( url, callback ){
    var ctx;
    if( url in contextsCache ){
      log(`jsonldcache hit ${url}`)
      ctx = contextsCache[url];
    }else{
      ctx = readContext(url);
    }
    return callback(
      null, {
        contextUrl: null, // this is for a context via a link header
        document: contextsCache[url], // this is the actual document that was loaded
        documentUrl: url // this is the actual context URL after redirects
      });
  };
  return jsonldcache;
}
