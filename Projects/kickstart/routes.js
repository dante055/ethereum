const routes = require('next-routes')();
// require statement invokes a function which will be call immidiately is () is places

routes
  .add('/campaigns/new', '/campaigns/new')
  .add('/campaigns/:address', '/campaigns/show') // wildcard anything  is represented by colen(:)
  .add('/campaigns/:address/requests', '/campaigns/requests/index')
  .add('/campaigns/:address/requests/new', '/campaigns/requests/new');

// '/campaigns/:address' routes override the next routing system so again give the '/campaigns/new' routing here

module.exports = routes;
// contains diff helpers that allow us to do automatic navigation
