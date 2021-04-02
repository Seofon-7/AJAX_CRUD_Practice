const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("View engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("成功連到芒果DB");
  })
  .catch((e) => {
    console.log("連線失敗");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is homepage;");
});

app.get("/students", async (req, res) => {
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch {
    res.send("發生錯誤");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params; // 找到是這個id的學生
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentPage.ejs", { data });
    } else {
      res.send("Can't find this student's ID.");
    }
  } catch (e) {
    res.send("發生錯誤");
    console.log(e);
  }
});

app.post("/students/insert", (req, res) => {
  //   console.log(req.body); 測試用
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student rejectd");
      console.log(e);
      res.render("reject.ejs");
    });
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.send("Cannot find student.");
    }
  } catch {
    res.send("Error!");
  }
});

// 更新資料，要npm install method override
app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  // findOneAndUpdate會回傳一個Query，詳細看findOneAndUpdate的文件

  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
      }
    );
    // 重新導向這個頁面
    res.redirect(`/students/${id}`);
  } catch {
    res.render("/reject.ejs");
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Delete Successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("請求遭拒絕");
});

app.listen(3000, () => {
  console.log("prot3000");
});
