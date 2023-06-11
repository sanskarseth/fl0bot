const express = require('express')
const { sequelize, Chat, User } = require('./models');
const app = express()
const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/users/', async (req, res) => {
  const user = req.body;
  try {
    const dbUser = await User.create(user);
    res.json(dbUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
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
    await sequelize.authenticate();
    sequelize.options.dialectOptions.ssl = false;
    await sequelize.sync({ force: true});
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})