const express = require('express')
const { sequelize, Chat, Person } = require('./models');
const e = require('express');

const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/index.js')[env];

const app = express()
app.use(express.json());

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env[config.openai_api_key],
});

const openai = new OpenAIApi(configuration);

const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/persons/', async (req, res) => {
  const person = req.body;
  try {
    const dbUser = await Person.create(person);
    const dbChat = await Chat.create({ person_id: dbUser.person_id, role: 'system', content: process.env[config.bot_system] });

    res.json(dbUser);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to create Person' });
  }
});

app.get('/persons/', async (req, res) => {
  try {
    const persons = await Person.findAll({ raw: true });
    console.log(persons);
    return res.json(persons)
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to get persons' });
  }
});

app.post('/chats/', async (req, res) => {
  const chat = req.body;
  try {
    const dbChat = await Chat.create(chat);
    res.json(dbChat);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

app.get('/chats/', async (req, res) => {
  try {
    const chats = await Chat.findAll({raw: true});
    return res.json(chats)
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

app.post('/chats/:person_id', async (req, res) => {
  const { person_id } = req.params;
  const { query } = req.body;

  // console.log("TOKENNN", process.env[config.openai_api_key])

  try {
    const dbUser = await Person.findOne({ where: { person_id: person_id }, raw: true });

    if (!dbUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const chats = await Chat.findAll({ where: { person_id }, order: [['time_created', 'DESC']], limit: 5, raw: true });

    const chatsGpt = chats.map((item) => ({ role: item.role, content: item.content }));
    chatsGpt.push({ role: 'user', content: query });

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatsGpt,
    });

    console.log("USER", query)
    console.log("OPENAI RES", response.data.choices[0].message.content)

    const dbChat1 = await Chat.create({ person_id, role: 'user', content: query });

    const dbChat = await Chat.create({
      person_id,
      role: 'assistant',
      content: response.data.choices[0].message.content,
    });

    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

const { App } = require('@slack/bolt');

const slackBotApp = new App({
  token: process.env[config.slack_client],
  signingSecret: process.env[config.slack_secret],
});


// slackBotApp.event('message', async ({ event }) => {
//   try {
//     // Handle the Slack event here
//     console.log('Received a message:', event.text);
//   } catch (error) {
//     console.error('Error handling Slack event:', error);
//   }
// });

// app.post('/slack/events', (req, res) => {
//   const { challenge } = req.body;

//   if (challenge) {
//     // Respond to the challenge request
//     res.send({ challenge });
//   } else {
//     // Return a success response
//     res.sendStatus(200);
//   }
// });


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
})

(async () => {
  try {
    await slackBotApp.start();
    console.log('Slack bot is running');
  } catch (error) {
    console.error('Error starting Slack bot:', error);
  }
})();
