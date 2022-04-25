/*
  app.js -- This creates an Express webserver with login/register/logout authentication
*/

// *********************************************************** //
//  Loading packages to support the server
// *********************************************************** //
// First we load in all of the packages we need for the server...
const createError = require("http-errors"); // to handle the server errors
const express = require("express");
const path = require("path"); // to refer to local paths
const cookieParser = require("cookie-parser"); // to handle cookies
const session = require("express-session"); // to handle sessions using cookies
const debug = require("debug")("personalapp:server");
const layouts = require("express-ejs-layouts");
const axios = require("axios")

// *********************************************************** //
//  Loading models
// *********************************************************** //
const ToDoItem = require("./models/ToDoItem")
const Course = require('./models/Course')
const Schedule = require('./models/Schedule')

// *********************************************************** //
//  Loading JSON datasets
// *********************************************************** //
const games = require('./public/data/outwithoutindex.json')


// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require('mongoose');
// const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://johnny:1234@cluster0.lcwl3.mongodb.net/test'

mongoose.connect(mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// fix deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() { console.log("we are connected!!!") });





// *********************************************************** //
// Initializing the Express server 
// This code is run once when the app is started and it creates
// a server that respond to requests by sending responses
// *********************************************************** //
const app = express();

// Here we specify that we will be using EJS as our view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



// this allows us to use page layout for the views 
// so we don't have to repeat the headers and footers on every page ...
// the layout is in views/layout.ejs
app.use(layouts);

// Here we process the requests so they are easy to handle
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Here we specify that static files will be in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Here we enable session handling using cookies
app.use(
    session({
        secret: "zzbbyanana789sdfa8f9ds8f90ds87f8d9s789fds", // this ought to be hidden in process.env.SECRET
        resave: false,
        saveUninitialized: false
    })
);

// *********************************************************** //
//  Defining the routes the Express server will respond to
// *********************************************************** //


// here is the code which handles all /login /signin /logout routes
const auth = require('./routes/auth');
const { deflateSync } = require("zlib");
app.use(auth)

// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next()
    } else res.redirect('/login')
}

// specify that the server should render the views/index.ejs page for the root path
// and the index.ejs code will be wrapped in the views/layouts.ejs code which provides
// the headers and footers for all webpages generated by this app
app.get("/", (req, res, next) => {
    res.render("index");
});

app.get("/about", (req, res, next) => {
    res.render("about");
});




/* ************************
  Loading (or reloading) the data into a collection
   ************************ */
// this route loads in the courses into the Course collection
// or updates the courses if it is not a new collection

app.get('/upsertDB',
    async(req, res, next) => {
        for (game of games) {
            const { Name, Platform, Year_of_Release, Genre, Publisher, Critic_Score, Developer, Rating} = game;
            await Course.findOneAndUpdate({ Name, Platform, Year_of_Release, Genre, Publisher, Critic_Score, Developer, Rating}, game, { upsert: true })
        }
        const num = await Course.find({}).count();
        res.send("data uploaded: " + num)
    }
)


app.post('/courses/byPublisher',
    // show list of courses in a given subject
    async(req, res, next) => {
        const games = await Course.find({ Publisher: subject})

        res.locals.games = games
        res.render('courselist')
    }
)

app.get('/courses/show/:courseId',
    // show all info about a course given its courseid
    async(req, res, next) => {
        const { courseId } = req.params;
        const course = await Course.findOne({ _id: courseId })
        res.locals.course = course
        res.locals.strTimes = courses.strTimes
            //res.json(course)
        res.render('course')
    }
)

app.get('/courses/byInst/:email',
    // show a list of all courses taught by a given faculty
    async(req, res, next) => {
        const email = req.params.email + "@brandeis.edu";
        const courses = await Course.find({ instructor: email, independent_study: false })
            //res.json(courses)
        res.locals.courses = courses
        res.render('courselist')
    }
)

app.post('/E',
    async(req, res, next) => {
        const games = await Course.find({ Rating: E})
        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/T',
    async(req, res, next) => {
        const { T } = req.body;
        const games = await Course.find({Rating: T})

        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/M',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { subject } = req.body;
        const games = await Course.find({Rating: M})

        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/E10+',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { subject } = req.body;
        const games = await Course.find({Rating: E10})

        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/AO',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { subject } = req.body;
        const games = await Course.find({Rating: AO})

        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/K-A',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { subject } = req.body;
        const games = await Course.find({Rating: K-A})

        res.locals.games = games
        res.render('courselist')
    }
)
app.post('/RP',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { subject } = req.body;
        const games = await Course.find({Rating: "RP"})

        res.locals.games = games
        res.render('courselist')
    }
)

app.post('/courses/byInst',
    // show courses taught by a faculty send from a form
    async(req, res, next) => {
        const email = req.body.email + "@brandeis.edu";
        const courses =
            await Course
            .find({ instructor: email, independent_study: false })
            .sort({ term: 1, num: 1, section: 1 })
            //res.json(courses)
        res.locals.courses = courses
        res.locals.strTimes = courses.strTimes
        res.render('courselist')
    }
)

app.post('/courses/byKeyword',
    // show list of courses in a given subject
    async(req, res, next) => {
        const { keyword } = req.body;
        var regex = new RegExp(keyword, "gi")
        const courses = await Course.find({name: regex}, {independent_study: false }).sort({ term: 1, num: 1, section: 1 })
        res.locals.courses = courses
        res.locals.strTimes = courses.strTimes
            //res.json(courses)
        res.render('courselist')
    }
)

app.use(isLoggedIn)

app.get('/addCourse/:courseId',
    // add a course to the user's schedule
    async(req, res, next) => {
        try {
            const courseId = req.params.courseId
            const userId = res.locals.user._id
                // check to make sure it's not already loaded
            const lookup = await Schedule.find({ courseId, userId })
            if (lookup.length == 0) {
                const schedule = new Schedule({ courseId, userId })
                await schedule.save()
            }
            res.redirect('/schedule/show')
        } catch (e) {
            next(e)
        }
    })

app.get('/schedule/show',
    // show the current user's schedule
    async(req, res, next) => {
        try {
            const userId = res.locals.user._id;
            const courseIds =
                (await Schedule.find({ userId }))
                .sort(x => x.term)
                .map(x => x.courseId)
            res.locals.courses = await Course.find({ _id: { $in: courseIds } })
            res.render('schedule')
        } catch (e) {
            next(e)
        }
    }
)

app.get('/schedule/remove/:courseId',
    // remove a course from the user's schedule
    async(req, res, next) => {
        try {
            await Schedule.remove({
                userId: res.locals.user._id,
                courseId: req.params.courseId
            })
            res.redirect('/schedule/show')

        } catch (e) {
            next(e)
        }
    }
)


// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// this processes any errors generated by the previous routes
// notice that the function has four parameters which is how Express indicates it is an error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
});


// *********************************************************** //
//  Starting up the server!
// *********************************************************** //
//Here we set the port to use between 1024 and 65535  (2^16-1)
const port = "5000";
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(port);

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;