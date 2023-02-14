let express = require('express');
let app = express();
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');
let indexRouter = require('./routes/index');
let teamRouter = require('./routes/team');
let transactionRouter = require('./routes/transaction');
const socketIO = require('socket.io');
const http = require('http');
let server = http.createServer(app);
let io = socketIO(server);
let aaSqlite = require("./db_as");
// Set up Global configuration access
dotenv.config();
let port = 3340;

server.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});

io.on( 'connection', async function( socket ) {
    console.log( 'a user has connected!' );
    let db_url = process.env.DB_URL || "data.db";
    try {
        
        let db = await aaSqlite.open(db_url);

        let data = await aaSqlite.all(db,`select punten, name from team order by punten;`, []);
        await aaSqlite.close(db);
        socket.emit('update-event', data);
        
    } catch (err) {
        console.log(err);
    }
    socket.on( 'disconnect', function() {
    console.log( 'user disconnected' );
    });
});

app.use((req, res, next) => {
    req.io = io;
    return next();
  });

dotenv.config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let db_url = process.env.DB_URL || "data.db";


const createTables = (newdb) => 
  newdb.exec(`
CREATE TABLE "team" ("id" varchar,"name" varchar,"punten" varchar);
`, ()  => { });


function createDatabase() {
    let newdb = new sqlite3.Database(db_url, (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
        createTables(newdb);
    });
    newdb.close();
}

const startDB = () => new sqlite3.Database(db_url, sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code === "SQLITE_CANTOPEN") {
        createDatabase();
        return;
    } else if (err) {
        console.log("Getting error " + err);
        exit(1);
    }
});

app.use('/', indexRouter);
app.use('/team', teamRouter);
app.use('/transaction', transactionRouter);
startDB();