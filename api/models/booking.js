
const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	customer: { type: String, required: true},
	carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true},
	issue_date: { type: Date, required: true},
	return_date: { type: Date, required: true}
});


module.exports = mongoose.model('Booking', bookingSchema);