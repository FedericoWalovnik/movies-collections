const express = require('express');
const router = express.Router();

//@route    GET api/collections
//@desc     Test route
//@acces    Public
router.get('/', (req, res) => {
  res.send('collections Router');
});

module.exports = router;
