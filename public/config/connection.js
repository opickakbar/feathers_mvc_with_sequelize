const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);

module.exports =  { 
    BASE_URL : process.env.BASE_URL,
    sequelize : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
        dialectOptions: {
            useUTC: true,
        },
        timezone: '+07:00',
    }),
    connect : function(){
        this.sequelize.authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
    }
}