const express = require('express')
const { sequelize, Chat, Person } = require('./models');
const e = require('express');

const process = require('process');
const config = require(__dirname + '/../config/index.js')[env];

const app = express()
app.use(express.json());

const { openai } = require('@openai/api');

const openaiInstance = new openai({
  apiKey: process.env[config.openai_api_key]
});


const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/persons/', async (req, res) => {
  console.log("REQ BODY", req.body)
  const person = req.body;
  try {
    const dbUser = await Person.create(person);
    res.json(dbUser);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to create Person' });
  }
});

app.post('/chats/', async (req, res) => {
  console.log("REQ BODY", req.body)
  const chat = req.body;
  try {
    const dbChat = await Chat.create(chat);
    res.json(dbChat);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

app.post('/chats/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { query } = req.body;

  try {
    const dbUser = await User.findByPk(user_id);

    if (!dbUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const chats = await Chat.findAll({ where: { user_id }, order: [['time_created', 'ASC']] });

    const chatsGpt = chats.map((item) => ({ role: item.role, content: item.content }));
    chatsGpt.push({ role: 'user', content: query.query });

    const response = await openaiInstance.ChatCompletion.create({
      model: 'gpt-3.5-turbo',
      messages: chatsGpt,
    });

    const dbChat1 = await Chat.create({ user_id, role: 'user', content: query.query });

    const dbChat = await Chat.create({
      user_id,
      role: 'assistant',
      content: response.choices[0].message.content,
    });

    res.json(response.choices[0].message.content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat' });
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
})