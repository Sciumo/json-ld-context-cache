var fs = require('fs');
var jsonld = require('jsonld');
var logger = require('winston');
jsonldcache = require("../js/jsonldcache")( { contextDir: __dirname + "/../contexts", log :logger.info });
var ctxreg = jsonldcache.registry.contexts;
var list = ["person1", "personfoaf", "personfoaf"];
var ctx = [ctxreg.schema.uri, ctxreg.schema.uri, ctxreg.foaf.uri];

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
var options = {documentLoader:jsonldcache.documentLoader};
//jsonld.documentLoader=jsonldcache.documentLoader;
function testf( fname, ctx ){
  var jsonPerson;
  logger.info(`Parse JSON: ${fname}`);
  var person = fs.readFileSync( __dirname + `/${fname}.jsonld`, 'utf8');
  jsonPerson = JSON.parse(person);
  jsonld.expand(jsonPerson, options, logObj(`${fname} expand`) );
  jsonld.compact(jsonPerson, ctx, options, logObj(`${fname} ${ctx} compact`) );
}

for( var i = 0; i < list.length; i++ ){
  testf(list[i],ctx[i]);
}
