

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_abhishek:test1234@cluster0.jic3m.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema(
{
  name:String
});

const Item = mongoose.model("item",itemsSchema);

const listSchema = new mongoose.Schema(
{

  name: String,
  items: [itemsSchema]

});

const List = mongoose.model("list",listSchema);

const item1 = new Item (

{
  name:"Welcome to your todoList!"
}
);

const item2 = new Item (

{
  name: "Hit the + button to add a new item."
}

);

const item3 = new Item (

{
  name: "<-- Hit this to delete an item."
}

);

const defaultItems = [item1,item2,item3];




app.get("/", function(req, res) {

Item.find({},function(err,items)
{

  if(items.length===0)
  {
    Item.insertMany(defaultItems,function(err)
    {
      if(err)
      {
        console.log(err);
      }

      else
      {
        console.log("Inserted successfully");
      }
    });

    res.redirect("/");
  }


  else
  {
     res.render("list", {listTitle:"Today", newListItems: items});
  }



});



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;



  const item = new Item (
    {

      name:itemName

    });

    if(listName==="Today")
    {
      item.save();

      res.redirect("/");
    }

    else
    {
      List.findOne({name:listName},function(err,foundList)
      {

         foundList.items.push(item);

         foundList.save();

         res.redirect("/"+listName);
      });

    }



});

app.post("/delete",function(req,res)
{

  const checkedId = req.body.checkbox;

  const listName = req.body.listName;


  if(listName==="Today")
  {

    Item.findByIdAndRemove({_id:checkedId},function(err)
   {

     if(err)
     {
       console.log(err);
     }

     else
     {
       console.log("Deleted successfully");

       res.redirect("/");
     }

   });


  }

  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList)
    {

       if(!err)
       {
         res.redirect("/"+listName);
       }

    });
  }




});

app.get("/:customListName",function(req,res)
{

  const customListName = _.capitalize(req.params.customListName);



  List.findOne({name:customListName},function(err,foundList)
 {

    if(!err)
    {
      if(!foundList)
      {

          const list  = new List(
          {
            name: customListName,
            items: defaultItems
          });

          list.save();

          res.redirect("/"+customListName);

      }

      else
      {
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
      }
    }

    else
    {
      console.log(err);
    }

 });


});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
