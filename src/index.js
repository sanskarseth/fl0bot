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

app.post('/slack/action-endpoint', (req, res) => {
  const { challenge } = req.body;
  
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    // Handle other event types and trigger actions based on your requirements
    // Access the event data from the req.body object
    
    // Return a successful response
    res.status(200).json({ message: 'Event received' });
  }
});

const { App } = require('@slack/bolt');

const boltApp = new App({
  token: process.env[config.slack_client],
  signingSecret: process.env[config.slack_secret],
});


// Listen for mentions
boltApp.event('app_mention', async ({ event, say }) => {

  console.log("HIIIIIII")
  try {
    // Trigger your API call here
    const apiResponse = await makeAPICall();
    const replyMessage = apiResponse; // Customize the reply message as needed

    console.log(replyMessage)

    // Reply to the mention
    await say(replyMessage);
  } catch (error) {
    console.error('API call error:', error);
  }
});


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

(async () => {
  await boltApp.start();
  console.log('Bolt app is running');
})();

async function makeAPICall() {
  // Perform your API logic here
  // Return the result to be sent as a reply
  return 'API call result';
}
