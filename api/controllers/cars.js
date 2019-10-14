
const mongoose = require('mongoose');
const Car = require('../models/car');


exports.getCars = (req, res, next) => {
	Car.find()
		.select('-__v')
		.exec()
		.then(docs => {
			const response = {
				count: docs.length,
				cars: docs.map(doc => {
					return {
						_id: doc._id,
						vin: doc.vin,
						model: doc.model,
						capacity: doc.capacity,
						rent: doc.rent,
						booked: doc.booked,
						bookedBy: doc.bookedBy,
						addedBy: doc.addedBy,
						details: {
							type: 'GET',
							url: req.protocol+'://'+req.get('host')+'/cars/'+doc._id
						}
					}
				})
			};

			if(docs.length > 0) {
				res.status(200).json(response);
			} else {
				res.status(200).json({
					message: 'No entries found'
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
}


exports.getCarById = (req, res, next) => {
	const id = req.params.carId;
	Car.findById(id)
		.select('-__v')
		.exec()
		.then(car => {
			if(car) {
				res.status(200).json({
					message: "Car details with the given id",
					car: car,
					allCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			} else {
				res.status(404).json({
					message: 'Car with the given id was NOT found',
					allCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
}


exports.createCar = (req, res, next) => {

	Car.findOne({vin: req.body.vin})
		.exec()
		.then(car => {
			if(!car) {
				const car = new Car({
					_id: mongoose.Types.ObjectId(),
					vin: req.body.vin,
					model: req.body.model,
					capacity: req.body.capacity,
					rent: req.body.rent,
					addedBy: req.customerData.email
				});

				car.save()
					.then(result => {
						const response = {
							message: "Added new car",
							addedCar: {
								_id: result._id,
								vin: result.vin,
								model: result.model,
								capacity: result.capacity,
								rent: result.rent,
								addedBy: result.addedBy,
								allCars: {
									type: 'GET',
									url: req.protocol+'://'+req.get('host')+'/cars/'
								}
							}
						}
						res.status(201).json(response);
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							error: err
						});
					});

			} else {
				res.status(409).json({
					message: "Car VIN must be unique"
				});
			}
		})
		.catch(err => {
			error: err
		});
}

exports.editCar = async (req, res, next) => {
	
	const id = req.params.carId;
	const props = req.body;

	try{
		const car = await Car.findOne({_id: id}).exec();
		if(car) {

			if(req.customerData.email !== car.addedBy)
			{
				return res.status(401).json({
					message:"This customer doesnot own this car",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			}

			if(car.booked === true)
			{
				return res.status(401).json({
					message:"You cant edit this car since it is not available",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			}

			const result = await Car.updateOne({_id: id}, props).exec();
			if(result.nModified) {
				res.status(200).json({
					message: "Car is updated with the given data",
					result: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/' + id
					},
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			} else {
				res.status(404).json({
					message: "Car remains unmodified",
					result: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/' + id
					},
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}	
				})
			}

		}
		
		else {
			return res.status(400).json({
				message: "Car with given id was NOT found",
				otherCars: {
					type: 'GET',
					url: req.protocol+'://'+req.get('host')+'/cars/'
				}
			})
		}

	} catch(err) {
		res.status(500).json({
			error: err
		})
	}

}

exports.deleteCar = async (req, res, next) => {
	
	const id = req.params.carId;
	const car = await Car.findOne({_id: id}).exec();

		if(car) {
			
			if(req.customerData.email !== car.addedBy)
			{
				return res.status(401).json({
					message:"Current customer doesnot own this car",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				})
			}
			else if(car.booked === true)
			{
				return res.status(401).json({
					message:"You cant delete this car since it is not available",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				});
			}
			else {
				car.remove();
				return res.status(201).json({
					message: "Car has been removed successfully",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
				})
			}

		} else {
			res.status(404).json({
				message: "Car with given id was NOT found",
					otherCars: {
						type: 'GET',
						url: req.protocol+'://'+req.get('host')+'/cars/'
					}
			})
		}
	
}


exports.getCarByFilters = async (req, res, next) => {
	const issue_date = req.body.issue_date;
	const capacity = req.body.capacity;
	const rent = req.body.rent;


	const car = await Car.find({
		"capacity": {
			$lte: capacity
		},
		"rent": {
			$lte: rent
		},
		$or: [
			{
				"booked": false
			},
			{
				"booked": true,
				"bookedBy.return_date": {
					$lte: new Date(issue_date)
				}
			}
		]
	},{ __v: 0 });

	console.log(car);

	if(car) {
		res.status(200).json({
			count: car.length,
			result: car
		});
	} else {
		res.status(404).json({
			message: "No cars with given filters are present"
		})
	}

}