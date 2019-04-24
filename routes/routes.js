var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

//Requiring models
var db = require("../models");

//Connecting to MongoDB

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/scraperHomework";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

mongoose.set("useCreateIndex", true);

module.exports = function(app) {
  app.get("/", function(req, res) {
    db.Post.find({}, function(error, data) {
      var hbsObject = {
        post: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    });
  });

  // scrape
  app.get("/scrape", function(req, res) {
    axios.get("https://medium.com/topic/technology").then(function(response) {
      // load response to cheerio
      var $ = cheerio.load(response.data);

      $("section section div div div section").each(function(i, element) {
        var result = {};

        var mediumUrl = $(element)
          .find("a")
          .attr("href");

        result.title = $(element)
          .find("h3")
          .text();
        result.summary = $(element)
          .find("p")
          .text();
        result.url = mediumUrl;

        db.Post.create(result)
          .then(function(newPost) {
            // View the added result in the console
            console.log(newPost);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });

      res.send("Scrape complete!");
    });
  });

  // Route for getting all Articles from the db
  app.get("/posts", function(req, res) {
    // Grab every document in the Articles collection
    db.Post.find({})
      .then(function(results) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(results);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // clear
  app.get("/clear", function(req, res) {
    db.Post.remove({}, function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("cleared");
      }
    });
    res.redirect("/");
  });

  // this is working // posts are saving
  app.post("/posts/saved/:id", function(req, res) {
    // Use the article id to find and update its saved boolean
    db.Post.findOneAndUpdate({ _id: req.params.id }, { saved: true })
      // Execute the above query
      .exec(function(err, data) {
        // Log any errors
        if (err) {
          console.log(err);
        } else {
          res.send(data);
        }
      });
  });

  app.get("/saved", function(req, res) {
    db.Post.find({ saved: true })
      .then(function(results) {
        // If we were able to successfully find Articles, send them back to the client
        var hbsObject = { post: results };
        res.render("saved", hbsObject);
        console.log(results);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get("/notes/:id", function(req, res) {
    db.Note.find({ _id: req.params.id }).then(function(results) {
      res.json(results);
      console.log(results);
    });
  });

  app.post("/notes/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(newNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Post.findOneAndUpdate(
          { _id: req.params.id },
          { note: newNote._id },
          { new: true }
        );
      })
      .then(function(dbPost) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbPost);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};
