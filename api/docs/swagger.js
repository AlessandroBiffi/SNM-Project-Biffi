const swaggerAutogen = require('swagger-autogen')();

const doc = {
  swagger: "2.0",
  info: {
    version: '1.0.0',
    title: 'APIs SNM',
    description: 'Documentazione APIs: SNM - Social Network for Music'
  },
  host: 'localhost:3100',
  basePath: '/', 
  schemes: ['http'],
  "tags": [
    {
      "name": "esplora",
      "description": "Endpoints per la sezione generale esplora"
    },
    {
      "name": "auth",
      "description": "Endpoints per la gestione delle autenticazioni"
    },
    {
      "name": "info",
      "description": "Endpoints per la gestione di informazioni personali"
    },
    {
      "name": "playlist",
      "description": "Endpoints per la gestione delle proprie playlist personali/importate"
    }
  ],

};

const outputFile = './swagger-output.json';
const routes = ['../../src/server.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc) //node swagger

// swaggerAutogen(outputFile, routes, doc).then(() => {  //cosicche node swagger oltre a generare le API fa partire anche il server
//   require('./server.js'); 
// })