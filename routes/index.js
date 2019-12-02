var API_KEY = "1234";

var express = require('express');
var router = express.Router();
const { poolPromise, sql } = require('../db');

/*
 * TEST API
 *
*/
router.get('/', function (req, res) {
    res.end("API RUNNING");
});

//============================================
// USER TABLE
// POST / GET
// GET /user
// POST /user
//============================================
router.get('/user', async(req, res, next) => {
    console.log(req.query);
    
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({success: false, message: "Wrong API key"}));
    } else {
        var fbid = req.query.fbid;
        if (fbid != null) {
            try {
                const pool = await poolPromise;
                const queryResult = await pool.request()
                    .input('fbid', sql.NVarChar, fbid)
                    .query('SELECT UserPhone,Name,Address,FBID FROM [User] where FBID=@fbid');
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({success: true, result: queryResult.recordset}));
                } else {
                    res.send(JSON.stringify({success: false, message: "Empty"}));
                }
            } catch (err) {
                res.status(500); // Internal Server Error
                res.send(JSON.stringify({success: false, message: err.message}));
            }
        } else {
            res.send(JSON.stringify({success: false, message: "Missing fbid in query"}));
        }
    }
});

router.post('/user', async(req, res, next) => {
    console.log(req.body);

    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({success: false, message: "Wrong API key"}));
    } else {
        var user_phone = req.body.userPhone;
        var user_name = req.body.userName;
        var user_address = req.body.userAddress;
        var fbid = req.body.fbid;

        if (fbid != null) {
            try {
                const pool = await poolPromise;
                const queryResult = await pool.request()
                    .input('userPhone', sql.NVarChar, user_phone)
                    .input('userName', sql.NVarChar, user_name)
                    .input('userAddress', sql.NVarChar, user_address)
                    .input('fbid', sql.NVarChar, fbid)
                    .query('IF EXISTS(SELECT * FROM [User] WHERE FBID=@fbid)'
                        + ' UPDATE [User] SET Name=@userName, Address=@userAddress WHERE FBID=@fbid'
                        + ' ELSE'
                        + ' INSERT INTO [User](FBID,UserPhone,Name,Address) OUTPUT Inserted.FBID,Inserted.UserPhone,Inserted.Name,Inserted.Address'
                        + ' VALUES(@fbid, @userPhone, @userName, @userAddress)'
                    );

                console.log(queryResult); // Debug to see

                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({success: true, message: "Success"}));
                }
            } catch (err) {
                res.status(500); // Internal Server Error
                res.send(JSON.stringify({success: false, message: err.message}));
            }
        } else {
            res.send(JSON.stringify({success: false, message: "Missing fbid in body of POST query"}));
        }
    }
});

//============================================
// RESTAURANT TABLE
// GET
// GET /restaurants
//============================================
router.get('/restaurants', async(req, res, next) => {
    console.log(req.query);

    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API key" }));
    } else {
        try {
            const pool = await poolPromise;
            const queryResult = await pool.request()
                .query('SELECT ID,Name,Address,Phone,Lat,Lng,UserOwner,Image,PaymentUrl FROM [Restaurant]');
            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({success: true, result: queryResult.recordset}));
            } else {
                res.send(JSON.stringify({success: false, message: "Empty"}));
            }
        } catch (err) {
            res.status(500); // Internal Server Error
            res.send(JSON.stringify({success: false, message: err.message}));
        }
    }
});

module.exports = router;
