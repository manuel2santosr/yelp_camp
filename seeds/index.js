const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++) {
        const randomSeed = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            author: "625cecc6edfb70f5318771b6",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomSeed].city}, ${cities[randomSeed].state}`,
            geometry: { type : "Point", coordinates : [ -87.6244, 41.8756 ] },
            images: [
                {
                  url: 'https://res.cloudinary.com/dw3te2cwp/image/upload/v1650758544/yelp_camp/ndtnio8orebepidxktdt.jpg',
                  filename: 'yelp_camp/ndtnio8orebepidxktdt',
                },
                {
                  url: 'https://res.cloudinary.com/dw3te2cwp/image/upload/v1650758544/yelp_camp/mhget6mslsl9ybw1gam5.jpg',
                  filename: 'yelp_camp/mhget6mslsl9ybw1gam5',
                }
            ],
            price: Math.floor(Math.random() * 20) + 10,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti nisi natus praesentium necessitatibus? Repellat, nam autem? Qui voluptatum saepe unde voluptate, consequuntur quibusdam minima, quisquam autem enim obcaecati dolores. Maxime.'
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})