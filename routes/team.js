const express = require('express');
const router = express.Router();
const aaSqlite = require("../db_as");
const { v4: uuidv4 } = require('uuid');

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
        let name = req.body.name;
        let db = await aaSqlite.open(db_url);

        await aaSqlite.push(db, `insert into team ("id" ,"name") values (?,?);COMMIT;`, [uuidv4(),name]);

        let data = await aaSqlite.all(db,`select sum(amount) as amount , name from team left join "transaction" using ("id") group by id order by amount desc;`, []);
        await aaSqlite.close(db);
        req.io.emit('update-event', data);

        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ success: false, err: err });
        next(err);
    }
});

router.get("/", async (req, res, next) => {
    let db_url = process.env.DB_URL || "data.db";
    try {

        let authheader = req.cookies.JWT;
        decodingJWT(authheader);
        let db = await aaSqlite.open(db_url);

        let teams = await aaSqlite.all(db, `select * from team;`);

        await aaSqlite.close(db);
        res.send({ success: true, teams: teams });
    } catch (err) {
        res.status(500).send({ success: false, err: err });
        next(err);
    }
});

module.exports = router;
