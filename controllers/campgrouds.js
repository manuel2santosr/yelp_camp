const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')
mbxToken = process.env.MAPBOX_TOKEN
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoder = mbxGeocoding({ accessToken: mbxToken })

const index = async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}

const renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

const createCampground = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const newCamp = new Campground(req.body.campground)
    newCamp.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    newCamp.geometry = geodata.body.features[0].geometry
    newCamp.author = req.user._id
    await newCamp.save()
    req.flash('success', 'Successfully created campground')
    res.redirect(`campgrounds/${newCamp._id}`)
}

const showCampground = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (!camp) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}

const renderEditForm = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if (!camp) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })
}

const updateCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    camp.images.push(...images)
    await camp.save()

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

const deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds/')
}

module.exports.index = index
module.exports.renderNewForm = renderNewForm
module.exports.createCampground = createCampground
module.exports.showCampground = showCampground
module.exports.renderEditForm = renderEditForm
module.exports.updateCampground = updateCampground
module.exports.deleteCampground = deleteCampground
