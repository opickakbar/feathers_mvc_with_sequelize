const conn = require("../config/connection.js");
const Sequelize = require('sequelize');

const User = conn.sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: Sequelize.STRING,
    name: Sequelize.STRING,
    password: Sequelize.STRING
}, {
    underscored: true,
    timestamps: false,
    freezeTableName: true
});

module.exports = User;