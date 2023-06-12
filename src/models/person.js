'use strict';

const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Person = sequelize.define(
    'Person',
    {
      person_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Add other person attributes as needed
    },
    {
      tableName: 'persons', // Specify the table name explicitly if different from the model name
      timestamps: false, // Disable timestamps (createdAt, updatedAt)
    }
  );

  return Person;
};
