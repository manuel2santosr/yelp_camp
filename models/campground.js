const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const CampgroundSchema = new Schema({
    title:       String,
    price:       Number,
    description: String,
    location:    String,
    image:       String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// TODO: Need middleware for deleteMany used when seeding db

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    console.log('DELETEEEEEEE')
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)