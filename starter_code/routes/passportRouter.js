const express = require("express");
const passport = require("passport");
const {ensureLoggedIn, ensureLoggedOut} = require("connect-ensure-login");


const authRoutes = express.Router();

// User model
const User = require("../models/user");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


authRoutes.get("/signup", (req, res, next) => {
  res.render("passport/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("passport/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("passport/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("passport/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  })
  .catch(error => {
    next(error)
  })
});

authRoutes.get("/login", (req, res, next) => {
  res.render("passport/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

authRoutes.get("/private-page", ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

authRoutes.get("/profile", ensureLoggedIn(), (req, res) => {
  res.render("profile", {
    username: req.user.username,
    createdAt: req.user.created_at
  });
});

authRoutes.get("/passport/facebook", passport.authenticate("facebook",  { scope: ['email']}));
authRoutes.get("/passport/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/private-page",
  failureRedirect: "/"
}));

module.exports = authRoutes;