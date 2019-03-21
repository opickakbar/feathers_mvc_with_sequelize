const conn = require("../config/connection.js");
const Sequelize = require('sequelize');
const User = require("./User");

const Token = conn.sequelize.define('tokens', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: Sequelize.INTEGER,
    token: Sequelize.STRING,
    expired_date: Sequelize.STRING
}, {
    underscored: true,
    timestamps: false,
    freezeTableName: true
});

Token.belongsTo(User);

module.exports = Token;