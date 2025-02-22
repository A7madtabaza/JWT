// const express = require("express");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");

// const app = express();
// const PORT = 5000;
// const SECRET_KEY = "Ahmad";
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials:true
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// let users=[]

// app.post("/users", (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     return res.status(400).send("Name and email are required!");
//   }

//   const newUser = { id: Date.now().toString(), name, email };
//   users.push(newUser);
//   res.status(201).json(newUser);
// });

// app.listen(PORT,()=>{
//     console.log(`servar is running on http://localhost:${PORT}`)
// })

const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;
const SECRET_KEY = "Ahmad";

// CORS Setup
app.use(
  cors({
    origin: "http://localhost:5173/", // السماح بالطلبات من هذا النطاق
    credentials: true, // تمكين إرسال الكوكيز
  })
);

app.use(express.json());
app.use(cookieParser());

let users = []; // قاعدة بيانات وهمية للمستخدمين

// نقطة نهاية لإنشاء مستخدم جديد
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Name, email, and password are required!");
  }

  // تشفير كلمة المرور باستخدام bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
  };
  users.push(newUser); // إضافة المستخدم إلى قاعدة البيانات الوهمية
  res
    .status(201)
    .json({ id: newUser.id, name: newUser.name, email: newUser.email });
});

// نقطة نهاية لتسجيل الدخول وتوليد JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // البحث عن المستخدم بواسطة البريد الإلكتروني
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // مقارنة كلمة المرور المشفرة
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // توليد التوكن
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  // تعيين التوكن في الكوكيز
  res.cookie("token", token, { httpOnly: true, secure: false });

  res.json({ message: "Login successful", token });
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
