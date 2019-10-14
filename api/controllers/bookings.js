
const mongoose = require('mongoose');

const Booking = require('../models/booking');
const Car = require('../models/car');


exports.getAllBookings = (req, res, next) => {
	Booking.find({customer: req.customerData.email})
		.select('-__v')
		.populate('carId', '-__v')
		.exec()
		.then(result => {
			res.status(200).json({
				count: result.length,
				bookings: result
			})
		})
		.catch(err => {
			error: err
		});
}


exports.bookingCar = (req, res, next) => {
	
	Car.findById(req.body.carId)
		.exec()
		.then(car => {
			if(!car){
				return res.status(404).json({
					message: "Car with given id was not found",
					allCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				})
			}
			else if(car.addedBy === req.customerData.email)
			{
				return res.status(409).json({
					message: "You are trying to book ur own car."
				})
			}
			else if(car.booked) {

				if(new Date(req.body.issue_date) >= car.bookedBy.return_date)
				{
					
					const b = new Booking({
						_id: mongoose.Types.ObjectId(),
						customer: req.customerData.email,
						carId: req.body.carId,
						issue_date: req.body.issue_date,
						return_date: req.body.return_date
					}).save()
						.then(data => {

							car.bookedBy = data;
							car.save();

							res.status(201).json({
								message: "Car was available and has been booked",
								data: data
							});
						})
						.catch(err => {
							res.status(500).json({
								error: err
							})
						});
				} 
				else {
					return res.status(409).json({
						message: "Car is already booked and not available",
						car: car
					});
				}
			} else {

				const b = new Booking({
					_id: mongoose.Types.ObjectId(),
					customer: req.customerData.email,
					carId: req.body.carId,
					issue_date: req.body.issue_date,
					return_date: req.body.return_date
				}).save()
					.then(data => {

						car.booked = true;
						car.bookedBy = data;
						car.save();

						res.status(201).json({
							message: "Car has been booked",
							data: data
						});
					})
					.catch(err => {
						res.status(500).json({
							error: err
						})
					});
			}
		
		})
		.catch(err => {
			res.status(500).json({
				message: "4",
				error: err
			})
		});
		
}


exports.getBookingById = (req, res, next) => {
	Booking.findById(req.params.bookId)
		.select('-__v')
		.populate('carId', '-__v')
		.exec()
		.then(booking => {
			if(booking) {
				if(booking.customer !== req.customerData.email)
				{
					return res.status(401).json({
						message: "No access to this data"
					});
				}
				response = {
					message: "Booking details with given id was found",
					result: booking,
					allBookings: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/bookings/'
					}
				}
				res.status(200).json(response);
			} else {
				res.status(404).json({
					message: "Booking details with given id was NOT found",
					allBookings: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/bookings/'
					}
				})
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		});
}


exports.deleteBooking = (req, res, next) => {

	const id = req.params.bookId;

	const bookingInfo = Booking.findOne({_id: id, customer: req.customerData.email})
		.exec()
		.then(booking => {
			if(!booking)
			{
				res.status(401).json({
					message: "Booking details with the given id was NOT found"
				});
			}
			else {

				Car.findOne({_id: booking.carId})
					.exec()
					.then(car => {
						if(car.bookedBy._id == id)
						{
							car.booked = false;
							car.bookedBy = '';
							car.save();
						}
						booking.remove();

						return res.status(201).json({
							message: "Booking details has been successfully removed"
						})
					})
					.catch(err => {
						res.status(500).json({
							error: err
						})
					});

				// const id = booking.carId
				// Booking.deleteOne(booking)
				// 	.exec()
				// 	.then(result => {
				// 		if(result) {

				// 			Car.UpdateOne({_id: id}, {
				// 				booked: false,
				// 				bookedBy: ''
				// 			});

				// 			res.status(200).json({
				// 				message: "Booking details with given id was removed",
				// 				allBookings: {
				// 					type: 'GET',
				// 					url: req.protocol+'://'+req.get('host')+'/bookings/'
				// 				}
				// 			});
				// 		} else {
				// 			res.status(404).json({
				// 				message: "Booking details with given id was NOT found",
				// 				allBookings: {
				// 					type: 'GET',
				// 					url: req.protocol+'://'+req.get('host')+'/bookings/'
				// 				}
				// 			});
				// 		}
						
				// 	})
				// 	.catch(err => {
				// 		res.status(500).json({
				// 			message: "inside",
				// 			error: err
				// 		})
				// 	});
			}
		})
		.catch(err => {
			res.status(500).json({
				message: "outside",
				error: err
			})
		});

	// const bookingInfo = Booking.findOne({_id: id}).exec();
	// if(!bookingInfo.length)
	// {
	// 	return res.status(401).json({
	// 		message: "No access to this data",
	// 		bookingInfo: bookingInfo,
	// 		id: id
	// 	});
	// }

	
}