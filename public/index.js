require('dotenv').config();
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const cors = require('cors');
const moment = require("moment");
const Token = require("./models/Token.js");

const app = express(feathers());

app.configure(express.rest());
app.use(cors({credentials: true, origin: '*'}));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.errorHandler());

//Basic Auth
const TokenAuth = async (req, res, next) => {
    
    //Check if users sent token in headers or not
    if(req.headers.token == null) return res.sendStatus(401);
    
    //If yes, check the token sent whether it's valid or not (match with token in database)
    let token = await Token.findOne({
        where : { token : req.headers.token }
    });
    
    //If not matched, return error message
    if(token == null) return res.sendStatus(401);
    
    //If match, check if token has been expired or not
    let now = moment();
    
    let expired = moment(token.expired);
    
    //Check if the token has been expired or not. If yes, return error message
    if(now.diff(expired, "seconds") > 0) return res.sendStatus(401);
    
    //If not, extend the expired date of token
    token.expired = moment().utcOffset("+07:00").add(2, 'h').format("Y-MM-DD HH:mm:ss");
    
    //Save new token expired date
    await token.save();

    req.body.token = req.headers.token;
    
    //Return to next state/method
    return next();
}

//Call UserController
const UserController = require("./controllers/User.js");

//Same like Route Resources in Laravel
app.use('users', TokenAuth, UserController);

//Custom routing with method POST
app.post("/users/login", UserController.login);

//Index page will return Feathers Back-end Template
app.get("/", (req, res) => {
    res.send("Feathers Back-end Template");
});

const server = app.listen(process.env.APP_PORT);
server.on('listening', () => console.log('Feathers API started at port ' + process.env.APP_PORT));