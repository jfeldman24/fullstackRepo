const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

//chain the request types


//Dishes collection
dishRouter.route('/')
.get((req, res, next) => {
	Dishes.find({})
	.populate('comments.author')
	.then((dishes) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dishes)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.create(req.body)
	.then((dish) => {
		console.log(`Dish Created:\n ${dish}`);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/text');
	res.end('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.deleteMany({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

//Specific dish document
dishRouter.route('/:dishId')
.get((req, res, next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/text');
	res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.findByIdAndUpdate(req.params.dishId, {
		$set: req.body
	}, { new: true })
	.then((dish) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish)
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.findByIdAndRemove(req.params.dishId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

//Specific dish document comments sub-collection
dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		if(dish!=null) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish.comments);
		} else {
			err = new Error(`Dish ${req.params.dishId} not found`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if(dish!=null) {
			req.body.author = req.user._id;
			dish.comments.push(req.body);
			dish.save()
			.then((dish) => {
				Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					})
			}, (err) => next(err));
		} else {
			err = new Error(`Dish ${req.params.dishId} not found`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/text');
	res.end(`PUT operation not supported on /dishes/${req.param.dishId}/comments`);
})
//Task 2 says to allow admins to delete all comments, so I added it
//despite the contradiction with task 4
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	  .then((dish) => {
		  if(dish!=null) {
			  for (var i = (dish.comments.length-1); i >=0; i--) {
				  dish.comments.id(dish.comments[i]._id).remove();
			  }
			  dish.save()
			  .then((dish) => {
				  res.statusCode = 200;
				  res.setHeader('Content-Type', 'application/json');
				  res.json(dish);
			  }, (err) => next(err));
		  } else {
			  err = new Error(`Dish ${req.params.dishId} not found`);
			  err.status = 404;
			  return next(err);
		  }
	  }, (err) => next(err))
	  .catch((err) => next(err));
});

//Specific dish document specific comments sub-document
dishRouter.route('/:dishId/comments/:commentId')
	.get((req,res,next) => {
		Dishes.findById(req.params.dishId)
		.populate('comments.author')
		.then((dish) => {
			if(dish!=null && dish.comments.id(req.params.commentId)!=null) {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish.comments.id(req.params.commentId));
			} else if(dish==null){
				err = new Error(`Dish ${req.params.dishId} not found`);
				err.status = 404;
				return next(err);
			} else {
				err = new Error(`Comment ${req.params.commentId} not found`);
				err.status = 404;
				return next(err);
			}
		}, (err) => next(err))
		.catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type', 'application/text');
	res.end(`PUT operation not supported on /dishes/${req.param.dishId}/comments/${req.param.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if(dish!=null && dish.comments.id(req.params.commentId) != null) {
			if(req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
				if(req.body.rating) {
					dish.comments.id(req.params.commentId).rating = req.body.rating;
				}
				if(req.body.comment) {
					dish.comments.id(req.params.commentId).comment = req.body.comment;
				}
				dish.save()
				.then((dish) => {
					Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish)=> {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					})
				}, (err) => next(err));
			} else {
				err = new Error('You cannot edit a comment you did not create!')
				err.status = 403;
				return next(err);
			}
		} else if(dish==null){
			err = new Error(`Dish ${req.params.dishId} not found`);
			err.status = 404;
			return next(err);
		} else {
			err = new Error(`Comment ${req.params.commentId} not found`);
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	  .then((dish) => {
		  if(dish!=null && dish.comments.id(req.params.commentId) != null) {
			if(req.user._id.equals(dish.comments.id(req.params.commentId).author)) {
				dish.comments.id(req.params.commentId).remove();  
				dish.save()
				.then((dish) => {
					Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish)=> {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					})
				}, (err) => next(err));
			} else {
				err = new Error('You cannot delete a comment you did not create!')
				err.status = 403;
				return next(err);
			}
		} else if(dish==null){
			err = new Error(`Dish ${req.params.dishId} not found`);
			err.status = 404;
			return next(err);
		} else {
			err = new Error(`Comment ${req.params.commentId} not found`);
			err.status = 404;
			return next(err);
		}
	  }, (err) => next(err))
	  .catch((err) => next(err));
});

module.exports = dishRouter;

/* using optional parameters
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
*/