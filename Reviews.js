var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
var ReviewSchema = new Schema({
    movieId: { type: Schema.Types.ObjectID, ref: 'MovieSchema' },
    username: String,
    review: String,
    rating: { type: Number, min: 0, max: 5 }
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema);