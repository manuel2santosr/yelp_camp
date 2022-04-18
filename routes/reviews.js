const express = require('express')
const router = express.Router({ mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMessage, 400)
    } else {
        next()
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review._id)
    await campground.save()
    await review.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId } })
    await Review.findById(reviewId)
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router