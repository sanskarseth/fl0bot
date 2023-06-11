'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  Person.init({
    person_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
    time_created: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    time_updated: {
      type: DataTypes.DATE,
      onUpdate: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Person',
    tableName: 'persons',
    timestamps: false
  });

  return Person;
};
