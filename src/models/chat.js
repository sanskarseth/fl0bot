'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const Chat = sequelize.define(
    'Chat',
    {
      chat_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      person_id: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING(10000)
      },
      time_created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
      },
      time_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
      },
    },
    {
      tableName: 'chats', // Specify the table name explicitly if different from the model name
      timestamps: false, // Disable timestamps (createdAt, updatedAt)
      hooks: {
        beforeValidate: (chat, options) => {
          // Update the time_updated field to the current timestamp before saving the record
          chat.time_updated = new Date();
        },
      },
    }
  );

  return Chat;
};
