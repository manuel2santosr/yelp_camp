const path = require('path')
const methodOverride = require('method-override')
const express = require('express')
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const { campgroundSchema, reviewSchema } = require('./schemas')
const review = require('./models/review')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMessage, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMessage, 400)
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    res.redirect(`campgrounds/${newCamp._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/show', { camp })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds/')
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review._id)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId } })
    await Review.findById(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    res.status(status).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on Port 3000')
})