var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3500;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrape", {
  useNewUrlParser: true
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles

  db.Article.find({}, function(err, data) {
    res.json(data);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  var id = req.params.id;
  db.Article.findById(id)
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  var id = req.params.id;
  db.Note.create(req.body)
    .then(function(dbNotes) {
      console.log(dbNotes);

      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNotes._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
