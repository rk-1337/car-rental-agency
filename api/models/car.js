
const mongoose = require('mongoose');


const carSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	vin: { type: String, required: true, unique: true},
	model: { type: String, required: true},
	capacity: { type: Number, required: true},
	rent: { type: Number, required: true},
	booked: { type: Boolean, default: '0'},
	bookedBy: { type: Object, default: ''},
	addedBy: { type: String, ref: 'Customer', required: true},
});


module.exports = mongoose.model('Car', carSchema);