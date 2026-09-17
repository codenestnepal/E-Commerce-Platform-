const express = require('express');

const router = express.Router();

// TODO: add ensureAuthenticated middleware when auth middleware module is ready
router.get('/', (req, res) => {
   res.status(200).json([
    {
        name: "mobile",
        price: 15000
    },
    {
        name: "tv",
        price: 90000
    }
   ]);
});


module.exports = router;