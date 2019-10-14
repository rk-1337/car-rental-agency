const express = require('express');
const app = express();
const morgan = require('morgan');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const carRoutes = require('./api/routes/cars');
const bookingRoutes = require('./api/routes/bookings');
const customerRoutes = require('./api/routes/customers');

mongoose.connect('mongodb+srv://Admin:'+process.env.MONGO_ATLAS_PW+'@car-rental-agency-mavzs.mongodb.net/test?retryWrites=true&w=majority', {
	useNewUrlParser: true, 
	useUnifiedTopology: true
})
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

	if(req.method === "OTHERS") {
		res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
		return res.status(200).json({});
	}
	next();
});

app.use('/cars', carRoutes);
app.use('/bookings', bookingRoutes);
app.use('/customers', customerRoutes);

app.use((req, res, next) => {
	const error = new Error('Webpage not found');
	error.status = 404;
	next(error);
})

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		message: error.message
	});
})

module.exports = app;