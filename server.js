 // set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var moment = require('moment');
var jwt = require('express-jwt');
var jsonwebtoken = require('jsonwebtoken');
var secret = require('./config/secret');

// connect to mongoDB database
//var dbpath = 'ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/firstdatefail';
var dbpath = 'localhost:27017/firstdatefail'
var db = mongoose.connect('mongodb://' + dbpath, function(err) {
    if (err) {
         console.log("Error while connecting to db ["+dbpath+"]: " + err);
    }
});    

//var db = mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/firstdatefail');     // connect to mongoDB database


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
    sex: String, //'male','female'
    text : String,
    likes : Number,
    dislikes : Number,
    status: String, // 'approved', 'pending', 'rejected'
    added: Date
});


var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username : String,
    password : String
});

UserSchema.methods.comparePassword = function(password,callback){
    if (password == this.password){
        callback(true);
    } else {
        callback(false);
    }
    /*bcrypt.compare(password, this.password, function(err,isMatch){
        if (err) {
            return callback(err);
        }
        callback(isMatch());
    });*/
};

var User = mongoose.model('User',UserSchema);

// routes ======================================================================

// api ---------------------------------------------------------------------

// login
app.post('/api/login' , function (req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';

    console.log("Trying to login username " + username + " with password " + password);
    if (username == '' || password == ''){
        return res.send(401);
    }

    User.findOne({username:username}, function(err, user){
        if (err){
            console.log("Error is " + err);
            return res.send(401);
        }

        if (!user){
            console.log("User not found");
            return res.send(401);
        }

        console.log("User found " + user);

        user.comparePassword(password, function (isMatch){
            if (!isMatch) {
                console.log("Attempt failed to login with " + user.username);
                return res.send(401);
            } else {
                console.log("Logged user");
            }

            var token = jsonwebtoken.sign(user, secret.secretToken, { expiresInMinutes : 60});

            return res.json({token:token});
        });
    });
});

// get all fails
app.get('/api/fails/:status', function(req, res) {

    // use mongoose to get all fails in the database
    Fail.find({status:req.params.status},function(err, fails) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(fails); // return all fails in JSON format
    });
});

// get top 10 fails (most liked)
app.get('/api/fails/top/10', function(req, res) {
    console.log("Retreving top 10");
    // use mongoose to get all fails in the database
    Fail.find({status:'approved'}).sort({likes: 'desc'}).limit(10).exec(function(err, fails) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        console.log("Top 10 fails : " + JSON.stringify(fails));

        res.json(fails); // return all fails in JSON format
    });
});



// create fail and send back all fails after creation
app.post('/api/fails', function(req, res) {
    console.log("Sexo : " + req.body.sex);
    // create a fail, information comes from AJAX request from Angular

    var now = moment().format('YYYY-MM-DD HH:mm:ss');

    Fail.create({
        nickname: req.body.nickname,
        sex: req.body.sex, // TODO: default
        text : req.body.text,
        likes : 0,
        dislikes : 0,
        status: 'pending',
        added: now
    }, function(err, fail) {
        if (err)
            res.send(err);

        // get and return all the accepted fails after you create another
        
        Fail.find({status:'approved'},function(err, fails) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(fails); // return all fails in JSON format
        });
    });

});


// like and send back all fails after liking
app.post('/api/like/:id', function(req,res){
    Fail.findByIdAndUpdate(req.params.id,{$inc : {likes: 1}},function(err,fail){
        console.log("Variable increased : likes - Fail id : " + JSON.stringify(req.params.id));
        if (err){
            console.log("Error : " + err);
        }
        console.log("Fail found : " + JSON.stringify(fail));

        // get and return all the fails 
        Fail.find({status:'approved'},function(err, fails) {
            if (err)
                res.send(err)
            res.json(fails);
        });
    })
});

// dislike and send back all fails after disliking
app.post('/api/dislike/:id', function(req,res){
    Fail.findByIdAndUpdate(req.params.id,{$inc : {dislikes: 1}},function(err,fail){
        console.log("Variable increased : dislikes - Fail id : " + JSON.stringify(req.params.id));
        if (err){
            console.log("Error : " + err);
        }
        console.log("Fail found : " + JSON.stringify(fail));

        // get and return all the fails 
        Fail.find({status:'approved'},function(err, fails) {
            if (err)
                res.send(err)
            res.json(fails);
        });
    })
});

// approve  a fail and send back all pending fails
app.post('/api/approve/:id', jwt({secret: secret.secretToken}), function(req,res){
    Fail.findByIdAndUpdate(req.params.id,{$set : {status: 'approved'}},function(err,fail){
        console.log("This fail has been approved - Fail id : " + JSON.stringify(req.params.id));
        if (err){
            console.log("Error : " + err);
        }
        console.log("Fail found : " + JSON.stringify(fail));

        // use mongoose to get all pending fails in the database
        Fail.find({status:'pending'},function(err, fails) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(fails); // return all fails in JSON format
        });
    })
});

 // reject  a fail and send back all pending fails
app.post('/api/reject/:id', jwt({secret: secret.secretToken}),function(req,res){
    Fail.findByIdAndUpdate(req.params.id,{$set : {status: 'rejected'}},function(err,fail){
        console.log("This fail has been rejected - Fail id : " + JSON.stringify(req.params.id));
        if (err){
            console.log("Error : " + err);
        }
        console.log("Fail found : " + JSON.stringify(fail));

        // use mongoose to get all pending fails in the database
        Fail.find({status:'pending'},function(err, fails) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(fails); // return all fails in JSON format
        });
    })
});


// application -------------------------------------------------------------

/*app.get('/*', function(req,res){
    //res.sendfile('./public/index.html'); // 
    console.log("get *");
    res.location('/admin');
});

app.get('/', function(req, res) {
    //res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    res.location('/');
});*/



// listen (start app with node server.js) ======================================
app.listen(8070);
console.log("App listening on port 8070");