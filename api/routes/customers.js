const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken');

// const Customer = require('../models/customer');

const checkAuth = require('../middleware/check-auth')
const CustomerController = require('../controllers/customers')




router.get('/', CustomerController.getAllCustomers);

router.post('/signup', CustomerController.signUp);


router.post('/login', CustomerController.logIn);


router.delete('/:customerId', checkAuth, CustomerController.deleteCustomer);




module.exports = router;