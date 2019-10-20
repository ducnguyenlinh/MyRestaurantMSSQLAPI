var API_KEY = "1234";

var express = require('express')
var router = express.Router();
const { poolPromise, sql } = require('../db')

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
//============================================
router.get('/user', async(req, res, next) => {
    console.log(req.query);
    
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API key" }));
    } else {
        var fbid = req.query.fbid;
        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('fbid', sql.NVarChar, fbid)
                    .query('SELECT userPhone,name,address,fbid FROM [User] where fbid=@fbid')
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
                }
            } catch (err) {
                res.status(500) // Internal Server Error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
        }
    }
})

router.post('/user', async(req, res, next) => {
    console.log(req.body)

    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "Wrong API key" }));
    } else {
        var user_phone = req.body.userPhone
        var user_name = req.body.userName
        var user_address = req.body.userAddress
        var fbid = req.body.fbid

        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('UserPhone', sql.NVarChar, user_phone)
                    .input('UserName', sql.NVarChar, user_name)
                    .input('UserAddress', sql.NVarChar, user_address)
                    .input('FBID', sql.NVarChar, fbid)
                    .query('IF EXISTS(SELECT * FROM [User] WHERE FBID=@FBID)'
                        + ' UPDATE [User] SET Name=@UserName, Address=@UserAddress WHERE FBID=@FBID'
                        + ' ELSE'
                        + ' INSERT INTO [User](FBID, UserPhone, Name, Address) OUTPUT Inserted.FBID, Inserted.UserPhone, Inserted.Name, Inserted.Address'
                        + ' VALUES(@FBID, @UserPhone, @UserName, @UserAddress)'
                );

                console.log(queryResult); // Debug to see
                
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "Success" }));
                }
            } catch (err) {
                res.status(500) // Internal Server Error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in body of POST query" }));
        }
    }
})

module.exports = router;
