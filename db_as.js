const sqlite3 = require('sqlite3').verbose();

exports.open = function (DBSOURCE, enableFK) {
    if (enableFK) {
        return new Promise(function (resolve) {
            let db = new sqlite3.Database(DBSOURCE,
                (err) => {
                    if (err) reject("AA-SQLite3Open error: " + err.message);
                    else {
                        db.run("PRAGMA foreign_keys=ON");
                        // console.log("AA-SQLite3:", fk);
                        resolve(db);
                    }
                }
            );
        });
    }
    else {
        return new Promise(function (resolve) {
            let db = new sqlite3.Database(DBSOURCE,
                (err) => {
                    if (err) reject("AA-SQLite3Open error: " + err.message);
                    else {
                        db.run("PRAGMA foreign_keys=OFF");
                        resolve(db);
                    }
                }
            );
        });
    }

};

// any query: insert/delete/update
exports.run = function (db,query) {
    return new Promise(function (resolve, reject) {
        db.run(query,
            function (err) {
                if (err) reject(err.message);
                else resolve(true);
            });
    });
};

// first row read
exports.get = function (db,query, params) {
    return new Promise(function (resolve, reject) {
        db.get(query, params, function (err, row) {
            if (err) reject("Read error: " + err.message);
            else {
                resolve(row);
            }
        });
    });
};

exports.get_all = function (db,query, params) {
    return new Promise(function (resolve, reject) {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err.message);
            }
            else {
                returnValue = {
                    "message": "success",
                    "data": rows
                };
                resolve(returnValue);
            }
        });
    });//Return promise
};//get_all


exports.push = function (db,query, params) {
    return new Promise(function (resolve, reject) {
        if (params == undefined) params = [];
        db.all(query, params, function (err, rows) {
            if (err) reject({ message: "Failed", err: err });
            else {
                resolve(
                    {
                        message: "Succeeded"
                    });
            }
        });
    });
};

// set of rows read
exports.all = function (db, query, params) {
    return new Promise(function (resolve, reject) {
        if (params == undefined) params = [];
        db.all(query, params, function (err, rows) {
            if (err) reject("Read error: " + err.message);
            else {
                resolve(rows);
            }
        });
    });
};

// each row returned one by one 
exports.each = function (db,query, params, action) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.each(query, params, function (err, row) {
                if (err) reject("Read error: " + err.message);
                else {
                    if (row) {
                        action(row);
                    }
                }
            });
            db.get("", function (err, row) {
                resolve(true);
            });
        });
    });
}

exports.close = function (db) {
    return new Promise(function (resolve, reject) {
        db.close();
        resolve(true);
    });
};