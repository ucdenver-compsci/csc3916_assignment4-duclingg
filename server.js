/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

// API route to movies
router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find({
            title: { $exists: true, $ne: null },
            releaseDate: { $exists: true, $ne: null },
            genre: { $exists: true, $ne: null },
            actors: { $exists: true, $ne: null }
        }, (err, movies) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(movies);
            }
        });
    })
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors[0] || !req.body.actors[1] || !req.body.actors[2]) {
            return res.json({ success: false, message: 'Please include all information for title, year released, genre, and 3 actors.'});
        }

        Movie.findOne({ title: req.body.title }, (err, movie) => {
            if (movie) {
                return res.status(400).json({ success: false, message: "That movie already exists." });
            }

            var movie = new Movie({
                title : req.body.title,
                releaseDate : req.body.releaseDate,
                genre : req.body.genre,
                actors : req.body.actors
            });

            movie.save(function (err) {
                if (err) {
                    return res.status(403).json({ success: false, message: "Failed to create movie." });
                } else {
                    return res.status(200).send({success: true, message: "Successfully created movie."});
                }
            });
        });
    })
    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        if (!req.body.find_title || !req.body.update_title) {
            return res.json({ success: false, message: "Please provide a title to be updated as well as the new updated title."});
        } else {
            Movie.findOneAndUpdate( req.body.find_title, req.body.update_title, function (err, movie) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to update title passed in."});
                } else if (!movie) {
                    return res.status(400).json({success: false, message: "Unable to find title to update."});
                } else {
                    return res.status(200).json({success: true, message: "Successfully updated title."});
                }
            });
        }
    })
    .delete(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);

        if (!req.body.find_title) {
            return res.json({ success: false, message: "Please provide a title to delete." });
        } else {
            Movie.findOneAndDelete( req.body.find_title, function (err, movie) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to delete title passed in."});
                } else if (!movie) {
                    return res.status(400).json({success: false, message: "Unable to find title to delete."});
                } else {
                    return res.status(200).json({success: true, message: "Successfully deleted title."});
                }
            });
        }
    })
    .all(function(req, res) {
        return res.status(403).json({success: false, message: "This HTTP method is not supported. Only GET, POST, PUT, and DELETE are supported."});
});

var mongoose = require('mongoose');

// get movie with reviews
router.route('/movies/:movieid')
    .get(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.params);
        console.log(req.query.reviews);

        var id = req.params.movieid;

        var IncludeReview;
        IncludeReview = req.query.reviews;

        if (IncludeReview === "true") {
            IncludeReview = true;
        } else {
            IncludeReview = false;
        }

        Movie.findById(id, function (err, movie) {
            if (err) {
                res.json({message: "Error. Movie not found with that id."});
            } else {
                if (IncludeReview) {
                    Movie.aggregate([
                    {
                        $match: {'_id': mongoose.Types.ObjectId(req.params.movieid)}
                    },
                    {
                        $lookup: {
                            from: 'reviews',
                            localField: '_id',
                            foreignField: 'movieId',
                            as: 'movie_reviews'
                        }
                    },
                ], function(err, data) {
                    if(err) {
                        res.send(err);
                    } else{
                        res.json(data[0]);
                    }
                });
            } else {
                res.json(movie);
            }
        }
    })
});

// post review
router.post('/reviews', authJwtController.isAuthenticated, function(req, res) {
    if (!req.body.movieId || req.body.movieId.trim() === "") {
        return res.status(400).json({ success: false, message: "Movie ID is required." });
    }

    Movie.findById(req.body.movieId, function(err, movie) {
        if (err || !movie) {
            return res.status(404).json({ success: false, message: "Movie not found. Unable to create review." });
        }

        var review = new Review({
            movieId: req.body.movieId,
            username: req.body.username,
            review: req.body.review,
            rating: req.body.rating
        });

        review.save(function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: "Failed to create movie review.", error: err });
            }
            res.json({ success: true, message: "Review created!" });
        });
    });
});

// get review
router.get('/reviews', authJwtController.isAuthenticated, (req, res) => {
    const movieId = req.query.id;
    const includeReviews = req.query.reviews === 'true';
    console.log('Movie ID: ', movieId);

    if (includeReviews) {
        Movie.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(movieId) }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "movieId",
                    as: "movie_reviews"
                }
            }
        ]).exec(function (err, movie) {
            if (err || !movie || movie.length === 0) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            } else {
                res.status(200).json({ success: true, message: "Review queried.", movie: movie });
            }
        });
    } else {
        Review.find({}, function(err, reviews) {
            if (err) {
                return res.status(404).json({ success: false, message: "Error retrieving movie reviews." });
            }
            res.json(reviews);
        });
    }
});


router.all('/', function (req, res) {
    return res.status(403).json({ success: false, msg: 'This route is not supported.' });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


