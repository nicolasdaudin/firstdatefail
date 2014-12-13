 // set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var db = mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/firstdatefail');     // connect to mongoDB database

// configuration =================


app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model =================
var Fail = mongoose.model('Fail', {
    nickname: String,
    text : String,
    votes : Number
});

// routes ======================================================================

// api ---------------------------------------------------------------------
// get all fails
app.get('/api/fails', function(req, res) {

    // use mongoose to get all fails in the database
    Fail.find(function(err, fails) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(fails); // return all fails in JSON format
    });
});

// get top 10 fails
app.get('/api/fails/top10', function(req, res) {

    // use mongoose to get all fails in the database
    Fail.find({}).sort({votes: 'desc'}).limit(10).exec(function(err, fails) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        console.log("Top 10 fails : " + JSON.stringify(fails));

        res.json(fails); // return all fails in JSON format
    });
});

// create fail and send back all fails after creation
app.post('/api/fails', function(req, res) {

    // create a fail, information comes from AJAX request from Angular
    Fail.create({
        nickname: req.body.nickname,
        text : req.body.text,
        votes: 0
    }, function(err, fail) {
        if (err)
            res.send(err);

        // get and return all the fails after you create another
        Fail.find(function(err, fails) {
            if (err)
                res.send(err)
            res.json(fails);
        });
    });

});

// vote up and send back all fails after voting up
app.post('/api/voteup/:id', function(req,res){

    Fail.findByIdAndUpdate(req.params.id,{$inc : {votes: 1}},function(err,fail){
        console.log("Fail id : " + JSON.stringify(req.params.id));
        if (err){
            console.log("Error : " + err);
        }
        console.log("Fail found : " + JSON.stringify(fail));

        // get and return all the fails after you create another
        Fail.find(function(err, fails) {
            if (err)
                res.send(err)
            res.json(fails);
        });

    })


})

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// listen (start app with node server.js) ======================================
app.listen(8070);
console.log("App listening on port 8070");