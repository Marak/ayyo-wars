const express = require('express');
const path = require('path');
const util = require('util');
let viewCreate = util.promisify(view.create);

(async function listenServer ({ root }) {

  const app = express();
  const server = require('http').Server(app);

  app.use(express.static(path.resolve(root + '/../public'), { extensions:['html'] }));

  app.use(function(req, res, next){
    req.resource = {
      params: {}
    };
    next();
  });

  server.listen(3000, function () {
    console.log(`Listening on ${server.address().port}`);
  });

})({ root: __dirname })