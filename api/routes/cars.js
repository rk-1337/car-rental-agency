const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')

// const Car = require('../models/car');

const CarsController = require('../controllers/cars')



router.get('/', CarsController.getCars);

router.get('/:carId', CarsController.getCarById);

router.post('/', checkAuth, CarsController.createCar);

router.patch('/:carId', checkAuth, CarsController.editCar);

router.delete('/:carId', checkAuth, CarsController.deleteCar);

router.post('/filters', CarsController.getCarByFilters);




module.exports = router;