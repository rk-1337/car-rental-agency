
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const Customer = require('../models/customer');


exports.getAllCustomers = (req, res, next) => {
	Customer.find({})
		.select('-__v')
		.exec()
		.then(customers => {
			if(customers) {
				res.status(200).json({
					count: customers.length,
					customers: customers,
					customerData: req.customerData
				});
			} else {
				res.status(200).json({
					message: "No customers are present"
				});
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		});
}


exports.signUp = (req, res, next) => {

	Customer.findOne({email: req.body.email})
		.exec()
		.then(customer => {
			if(customer) {
				return res.status(409).json({
					message: "Customer with provided email already exists"
				});
			} else {

				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if(err) {
						return res.status(500).json({
							error: err
						});
					} else {
						const customer = new Customer({
							_id: mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash,
							phoneNo: req.body.phoneNo,
							address: req.body.address
						});
						customer.save()
							.then(result => {
								res.status(201).json({
									message: "Customer has been created"
								})
							})
							.catch(err => {
								res.status(500).json({
									error: err
								})
							});
					}
				});

			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
}


exports.logIn = (req, res, next) => {
	Customer.findOne({email: req.body.email})
		.exec()
		.then(customer => {
			if(customer) {
				bcrypt.compare(req.body.password, customer.password, (err, result) => {
					if(err){
						return res.status(401).json({
							message: "Auth failed"
						});
					}
					if(result){
						const token = jwt.sign(
							{
								customerId: customer._id,
								email: customer.email
							}, process.env.JWT_KEY,{expiresIn: "1h"}
						);
						return res.status(200).json({
							message: "Auth successful",
							token: token
						});
					}
					res.status(401).json({
						message: "Auth failed"
					})
				});
			} else {
				res.status(401).json({
					message: "Auth failed"
				});
			}

				

		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		});
}


exports.deleteCustomer = (req, res, next) => {

	const id = req.params.customerId;

	if(id !== req.customerData.customerId)
	{
		return res.status(404).json({
			message: "Webpage not found"
		})
	}

	Customer.deleteOne({_id: id})
		.exec()
		.then(result => {
			if(result.deletedCount) {
				res.status(200).json({
					message: "Customer has been deleted"
				});
			} else {
				res.status(404).json({
					message: "Customer was NOT found with provided id"
				});
			}
		})
		.catch(err => {
			res.status(500).json({
				error: err
			})
		});
}