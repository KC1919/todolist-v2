// //jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connecting to the database
mongoose.connect("mongodb+srv://admin-kunal:kunal123@cluster0.yvrz8.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = { //creating a schema for items
  name: String
}
const Item = mongoose.model("Item", itemSchema); //making table of item type schema


const listSchema = { //created a schema for list
  name: String, //having a name
  items: [itemSchema] //and an array of list items
};

const List = mongoose.model("list", listSchema); //making the table of with list schema


//<----------------- GET REQUESTS ----------------------------->

app.get("/", function(req, res) {

  List.findOne({
    name: "Today"
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: "Today",
          items: [itemSchema]
        });
        list.save();
        // res.redirect("/");
        res.render("list", {
          listTitle: "Today",
          newListItems: []
        });
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundList.items
        });
      }
    }

  });
});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  if (List.findOne({
      name: customListName
    }, function(err, foundList) {

      if (!err) {
        if (!foundList) {
          //create  new list
          const list = new List({
            name: customListName,
            items: [itemSchema]
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          });
        }
      } else
        console.log(err);

    }));
});

//-------------------------------------------------------------------------------


// <-------Post Requests --------->

app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;

  const prod = new Item({
    name: item
  });

    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(prod);
        foundList.save();
        res.redirect("/"+(listName=="Today"?"":listName));
      }
    });
});
//-------------------------------------------------------------------------------------


//<------------------Deleting items from the list------------------------>

app.post("/delete", function(req, res) {

  let listName = req.body.delList;
  let delId = req.body.checkbox;

    mongoose.set('useFindAndModify', false);
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delId}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+listName);
      }
    });
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
