'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/index.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Synchronize models with the database
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false });
    console.log('Tables created (if not exist) and database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.syncDatabase = syncDatabase;

module.exports = db;
