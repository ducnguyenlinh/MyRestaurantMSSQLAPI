const sql = require('mssql');
var config = {
    user: 'sa',
    password: 'reallyStrongPwd123',
    server: 'localhost',
    database: 'MyRestaurant'
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool
    }).catch(err => console.log('Database connection failed ! Bad config: ', err));

module.exports = { sql, poolPromise };
