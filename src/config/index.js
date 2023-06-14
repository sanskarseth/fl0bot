module.exports = {
  "local": {
    "use_env_variable": "DATABASE_URL",
    "openai_api_key": "OPENAI_API_KEY",
    "bot_system" : "BOT_SYSTEM",
    "slack_webhook" : "SLACK_WEBHOOK",
    synchronize: true
  },
  "development": {
    "use_env_variable": "DATABASE_URL",
    "openai_api_key": "OPENAI_API_KEY",
    "bot_system" : "BOT_SYSTEM",
    "slack_webhook" : "SLACK_WEBHOOK",
    synchronize: true
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "openai_api_key": "OPENAI_API_KEY",
    "bot_system" : "BOT_SYSTEM",
    "slack_webhook" : "SLACK_WEBHOOK",
    synchronize: true
  }
}
