// routes/testRoute.js
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Transcoder Service is Running 🚀')
})

module.exports = router
