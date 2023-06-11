'use strict';

const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chat = sequelize.define(
    'Chat',
    {
      chat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      person_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'persons', // Referencing the 'persons' table
          key: 'person_id', // Referencing the 'person_id' column
        },
      },
      role: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.STRING,
      },
      time_created: {
        type: DataTypes.DATE,
      },
      time_updated: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'chats', // Specify the table name explicitly if different from the model name
      timestamps: false, // Disable timestamps (createdAt, updatedAt)
    }
  );

  return Chat;
};
