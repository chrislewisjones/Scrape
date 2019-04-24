$(document).ready(function() {
  $("#home-btn").on("click", function() {
    console.log("clicked");
    $.ajax({
      method: "GET",
      url: "/"
    }).done(function(data) {
      window.location = "/";
    });
  });

  // scrape
  $("#scrape-btn").on("click", function() {
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(data) {
      console.log(data);
      if (!data) {
        console.log("error scraping");
      } else {
        window.location = "/";
      }
    });
  });

  $("#clear-button").on("click", function() {
    $.ajax({
      method: "GET",
      url: "/clear"
    }).done(function(data) {
      console.log("CLEAR");
      window.location = "/";
    });
  });

  $("#view-saved-button").on("click", function() {
    $.ajax({
      method: "GET",
      url: "/saved"
    }).done(function(data) {
      window.location = "/saved";
    });
  });

  $(".btn-save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/posts/saved/" + thisId
    }).done(function(data) {
      window.location = "/";
    });
  });

  $(".view-notes").on("click", function() {
    var thisId = $(this).attr("data-id");
    $(this).data("id", thisId);
    var appendTo = $(this);
    var note;
    $.ajax({
      method: "GET",
      url: "/notes/" + thisId
    }).then(function(data) {
      note = data[0].body;
      console.log("clicked");
      $(appendTo).after("<p><strong>Note: </strong>" + note + "</p>");
    });

    $(this).hide();
  });

  $(".submit-note").on("click", function() {
    var note = {
      body: $("#submitted-note").val()
    };
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/notes/" + thisId,
      data: note
    }).then(function(data) {
      console.log(data);
      location.reload();
    });
  });
});
