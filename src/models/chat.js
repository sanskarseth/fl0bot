'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  Chat.init({
    chat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'user_id'
      }
    },
    role: {
      type: DataTypes.STRING
    },
    content: {
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
    modelName: 'Chat',
    tableName: 'chats',
    timestamps: false
  });

  return Chat;
};
