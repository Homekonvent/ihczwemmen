const express = require('express');
const router = express.Router();
const aaSqlite = require("../db_as");

const decodingJWT = (token) => {
    if (token !== null || token !== undefined) {
        const base64String = token.split(".")[1];
        const decodedValue = JSON.parse(Buffer.from(base64String, "base64").toString("ascii"));
        return decodedValue;
    }
    return null;
}

router.post("/", async (req, res, next) => {
    let db_url = process.env.DB_URL || "data.db";
    try {
        
        let authheader = req.cookies.JWT;
        decodingJWT(authheader);

        let id = req.body.id;
        let amount = req.body.amount;

        let db = await aaSqlite.open(db_url);
        await aaSqlite.push(db, `insert into "transaction" ("id" ,"amount") values (?,?);`, [id, amount]);

        let data = await aaSqlite.all(db,`select sum(amount) as amount , name from team left join "transaction" using ("id") group by id order by amount desc;`, []);
        await aaSqlite.close(db);
        req.io.emit('update-event', data);

        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ success: false, err: err });
        next(err);
    }
});

module.exports = router;
