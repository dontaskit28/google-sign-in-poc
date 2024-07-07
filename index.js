import express from "express";
import session from "express-session";
const app = express();
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

app.use(
  session({ secret: "mysecret", resave: false, saveUninitialized: true })
);
app.use(passport.authenticate("session"));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2/redirect/google",
    },
    function (accessToken, refreshToken, profile, done) {
      var result = {
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      return done(null, result);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    accessType: "offline",
  })
);

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    res.redirect(
      `https://google.com/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
