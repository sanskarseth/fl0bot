const express = require('express')
const { sequelize, Chat } = require('./models');

const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/index.js')[env];

const axios = require('axios');

const app = express()
app.use(express.json());

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env[config.openai_api_key],
});
const openai = new OpenAIApi(configuration);

const port = process.env.PORT ?? 3000;

app.post('/slack/action-endpoint', async (req, res) => {
  const { challenge } = req.body;
  
  if (challenge) {
    res.status(200).send(challenge);
  } else {
      try {
        switch(req.body.event.type) {
          case 'app_mention':
            const response = handleAppMention(req.body)
            res.status(200).json({ message: 'Success' });
            break
          default:
            res.status(400).json({ message: 'Bad Request' });
            break
        }
      } catch (error) {
        console.error(`Error processing Slack event: ${error}`);
        res.status(500).json({ message: error });
      }
  }
});

async function handleAppMention({event}) {

  const mentionRegex = /<@[\w\d]+>/g; // Regex pattern to match the mention
  const msg = event.text.replace(mentionRegex, '');

  const person_id = event.user;
  const query = msg;

  try {
    const userExists = await Chat.findOne({ where: { person_id: person_id }, raw: true });

    if (!userExists) {
      const dbChat = await Chat.create({ person_id: person_id, role: 'system', content: process.env[config.bot_system] });
    }

    const chats = await Chat.findAll({ where: { person_id }, order: [['time_created', 'DESC']], limit: 5, raw: true });

    const chatsGpt = chats.map((item) => ({ role: item.role, content: item.content }));
    chatsGpt.push({ role: 'user', content: query });

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatsGpt,
    });

    await Chat.bulkCreate([
      { person_id, role: 'user', content: query },
      { person_id, role: 'assistant', content: response.data.choices[0].message.content }
    ]);
    await axios.post(process.env[config.slack_webhook], {text: response.data.choices[0].message.content});
    return response.data.choices[0].message.content
  } catch (error) {
    console.log("ERROR",error)
    return 'Failed to process chat';
  }
}

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  try {
    await sequelize.sync({ force: false });
    await sequelize.authenticate();
    sequelize.options.dialectOptions.ssl = false;
    await sequelize.sync({ force: true});
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
