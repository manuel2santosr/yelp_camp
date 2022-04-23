const Campground = require('../models/campground')
const Review = require('../models/review')

const createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review._id)
    await campground.save()
    await review.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`)
}

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findById(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}

module.exports = {
    createReview,
    deleteReview,
}