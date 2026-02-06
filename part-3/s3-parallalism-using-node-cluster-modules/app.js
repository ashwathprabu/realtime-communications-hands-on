const express = require('express')

const router = express.Router()

const getUser = require('./routes/get_user')

router.use('/get-user', getUser)

module.exports = router
