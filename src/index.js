const express = require('express')
const { sequelize, Chat, Person } = require('./models');
const e = require('express');
const app = express()
const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/persons/', async (req, res) => {
  console.log("REQ BODY", req.body)
  const person = req.body;
  try {
    console.log("Person", person)
    const dbUser = await Person.create(person);
    res.json(dbUser);
  } catch (error) {
    console.log("ERROR",error)
    res.status(500).json({ error: 'Failed to create Person' });
  }
});

app.post('/chats/', async (req, res) => {
  const chat = req.body;
  try {
    const dbChat = await Chat.create(chat);
    res.json(dbChat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
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