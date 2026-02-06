const express = require('express')

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        return res.status(200).json({
            data: {
                name: 'John Doe',
                age: 30,
                city: 'New York',
            },
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: error.message })
    }
})

module.exports = router
