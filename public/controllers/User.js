const User = require("../models/User.js");
const Token = require("../models/Token.js");
const Validator = require('feathers-validator');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const moment = require("moment");

//Rules to login
const rules_login = {
    username: 'required',
    password : 'required'
};

//Rules to create & update
const rules =  {
    name: 'required',
    username: 'required',
    password: 'required',
};

module.exports = {
    async find(params){

        //Get all users data order by id descending
        let users = await User.findAll({
            order : [ ["id", "desc"] ]
        });

        //Return all users data
        return Promise.resolve({ data: users }); 
    },
    async get(id, params){

        //Get specific user data
        let user = await User.findById(id);

        //Check if user is not existed, return error message
        if(user === null) return Promise.resolve({ error : "data not found" });

        //Return user specific data
        return Promise.resolve({ data: user });
    },
    async create(data, params){
        
        let errors = new Validator(data, rules).errors();

        //If there's no error in validators
        if(Object.keys(errors).length == 0){
            
            //Username check from database
            let user_checked = await User.findAll({
                where: {
                    username: data.username
                }
            });
            
            //If already used, return error message
            if(user_checked) return Promise.resolve({ error : "Username has been used!" });
            
            //If not, create new user data
            //Hashed the password sent from client with bycript
            let hashed = await bcrypt.hash(data.password, 10);

            //Create new user data
            let new_user = await User.create({
                username: data.username,
                password: hashed,
                name: data.name
            });

            //Return new user data
            return Promise.resolve({ data: new_user });
        }
        //If there's an error(s)
        Object.keys(errors).forEach((err)=>{ errors[err] = errors[err].message; });
        return Promise.resolve({ "errors" : errors });
    },
    async update(id, data, params){
        
        //Get specific user data
        let user = await User.findOne({ where : {id : id} });
        
        //Check if user is not existed, return error message
        if(user === null) return Promise.resolve({ error : "data not found" });
        
        //Check the requests sent with validator
        let errors = new Validator(data, rules).errors();
        
        //If there's no error in validators
        if(Object.keys(errors).length == 0){

            //Hash the password sent from client with bycript
            let hashed = await bcrypt.hash(data.password, 10);

            //Set new user data
            user.username = data.username;
            user.name = data.name;
            user.password = hashed;

            //Save new user data to database
            let updated_user = await user.save();
            
            //Return new user data (updated)
            return Promise.resolve({ data : updated_user }); 
        }
        //If there's an error(s)
        Object.keys(errors).forEach((err)=>{ errors[err] = errors[err].message; });
        return Promise.resolve({ "errors" : errors });
    },
    async remove(id, params){

        //Get specific user to be deleted
        let user = await User.findById(id);

        //If user is not existed, return error message
        if(user === null) return Promise.resolve({ error : "data not found" });
        
        //Delete user data
        return user.destroy();
    },
    async login(req, res, next){

        //Check requests sent with validator
        let errors = new Validator(req.body, rules_login).errors();
        
        //If there's no error in validator
        if(Object.keys(errors).length == 0){

            //Get specific user
            let user = await User.findOne({
                where: { username: req.body.username }
            });

            //If username is not existed
            if(user == null) res.send({ error : { custom : "Username not found!" } });
            
            //If username exist, check username and password sent from client with password in database
            bcrypt.compare(req.body.password, user.password, async function(err, result) {
                
                //If password true
                if(result) {
                    //Set expired date
                    let expired_date = moment().utcOffset("+07:00").add(2, 'h').format("Y-MM-DD HH:mm:ss");
                    
                    //Insert new token data
                    let token = await Token.create({
                        user_id : user.id,
                        token : randomstring.generate(),
                        expired_date : expired_date
                    });

                    //Return token data
                    res.send({ token : token.token });
                }

                //If password false, return error message
                res.send({ error : { custom : "Wrong password!" } });
            });
        }

        //If there's error in validator, return error message
        Object.keys(errors).forEach((err)=>{ errors[err] = errors[err].message; });
        res.send({ error: errors });
    }
}