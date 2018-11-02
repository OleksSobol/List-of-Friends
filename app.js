var expressSanitizer  = require("express-sanitizer"),
    methodOverride    = require("method-override"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    express           = require("express"),
    app               = express();


// APP CONFIG
mongoose.connect("mongodb://localhost/friends",{useNewUrlParser:true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// MONGOOSE  CONFIG
var friendSchema = mongoose.Schema({
    image: {type: String, default: "http://www.whiteprivilege.info/gfx/users/default-05.png"},
    first_name: String,
    last_name: String,
    phone: Number,
    date_birth: Date,
    description: String
});
// CUSTOM METHODS
friendSchema.methods._calculateAge = function(birthday){
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
// MODEL CONFIG
var Friend = mongoose.model("Friend",friendSchema);

//EXAMPLE
// Friend.create({
//     first_name: "Curtis",
//     last_name:"Horton",
//     phone: 18023801466,
//     description: "Funny and serious dude!"
// });



// RESTFUL ROUTES
app.get("/", function(req, res){
    res.redirect("/friends");
});

// INDEX ROUTE
app.get("/friends", function(req, res){
    Friend.find({},function(err, friends){
        if(err){
            console.log(err);
        } else {
            res.render("index", {friends: friends});
        }
    });
});

// NEW ROUTE
app.get("/friends/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/friends", function(req, res){
    Friend.create(req.body.friend, function(err, friend){
        if(err){
            res.redirect("/friends/new");
        } else {
            console.log(friend);
            res.redirect("/friends");
        }
    });
});

// SHOW ROUTE
app.get("/friends/:id", function(req, res){
    Friend.findById(req.params.id, function(err, foundFriend){
        if(err){
            res.redirect("/friends");
            console.log(err);
        } else {
            res.render("show", {friend: foundFriend});
        }
    });
});

// EDIT ROUTE
app.get("/friends/:id/edit",function(req, res){
    Friend.findById(req.params.id, function(err, foundFriend){
        if(err){
            res.redirect("/friends")
        } else {
            res.render("edit", {friend: foundFriend});    
        }
    });
});

// UPDATE ROUTE
app.put("/friends/:id", function(req, res){
    Friend.findByIdAndUpdate(req.params.id,req.body.friend, function(err, updatedFriend){
        if(err){
            console.log(err);
        } else {
            res.redirect("/friends/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/friends/:id", function(req, res){
    Friend.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect("/friends");
        }
    })
});


// Handling non-existing routes
app.get('*',function(req, res){
    res.sendStatus(404);
});

// SERVER IS RUNNING
app.listen(3000, function(){
    console.log("Server has started on the port: " + this.address().port);
});
