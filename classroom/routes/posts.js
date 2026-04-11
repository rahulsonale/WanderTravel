const express = require("express");
const router = express.Router();
/*THis is for posts*/
//Index-users
router.get("/", (req, res) => {
  res.send("posts  page");
});

//POST
//Show
router.get("/:id", (req, res) => {
  res.send("get for show posts");
});

//show
router.post("/", (req, res) => {
  res.send("Post for posts");
});

//delete
router.delete("/:id", (req, res) => {
  res.send("Delete  for posts");
});

module.exports = router;
