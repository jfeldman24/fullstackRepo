const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

//chain the request types
dishRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send all the dishes to you!');
})
.post((req,res,next) => {
    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    res.end('Deleting all the dishes!');
});

dishRouter.route('/:dishId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('Will send details of the dish: ' + req.params.dishId + ' to you!');
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
})
.put((req,res,next) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n');
    res.end('Will update the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Deleting dish: ' + req.params.dishId);
});

module.exports = dishRouter;

/*another way of routing

const express = require("express");
const bodyParser = require("body-parser");

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

// TASK 01: I put the dishId as an optional parameter
dishRouter
  .route("/:dishId?")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    // All the verbs above follows the same pattern
    // to reduce nesting.
    // 1. Test if the param dishId exists...
    // 2. Return the response.
    // As the res.end() ends the response process,
    // we don't need to write the else statement.
    if (req.params.dishId) {
      res.end(`Will send details of the dish: ${req.params.dishId} to you!`);
    }
    res.end("Will send all the dishes to you!");
  })
  .post((req, res, next) => {
    if (req.params.dishId) {
      res.statusCode = 403;
      res.end(`POST operation not suported on /dishes/${req.params.dishId}`);
    }
    res.end(
      `Will add the dish: ${req.body.name} with the details: ${
        req.body.description
      }`
    );
  })
  .put((req, res, next) => {
    if (req.params.dishId) {
      res.write(`Updating the dish: ${req.params.dishId}\n`);
      res.end(
        `Will update the dish: ${req.body.name} with the details: ${
          req.body.description
        }`
      );
    }
    res.statusCode = 403;
    res.end("PUT operation not suported on /dishes");
  })
  .delete((req, res, next) => {
    if (req.params.dishId) {
      res.end(`Deleting dish: ${req.params.dishId}`);
    }
    res.end("Deleting all dishes!");
  });

module.exports = dishRouter;
*/