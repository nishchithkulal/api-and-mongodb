//server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const mongoURI = 'mongodb+srv://admin:<password>@cluster0.2jtnyua.mongodb.net/patientDB?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Could not connect to MongoDB Atlas:', err));

// Member Schema
const memberSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
});

// Define the model only once
const Member = mongoose.model('members', memberSchema);

// API endpoint for member registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    console.log('Received data:', { name, phoneNumber });
    
    const newMember = new Member({ name, phoneNumber });
    const savedMember = await newMember.save();
    console.log('Saved to database:', savedMember);
    res.status(201).json({ message: 'Member registered successfully', member: savedMember });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering member' });
  }
});

// List members
app.get('/api/list', async (req, res) => {
  try {
    const members = await Member.find({});
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Error fetching members' });
  }
});

// Edit member (PUT /api/edit)
// Expects JSON body: { id, name, phoneNumber }
app.put('/api/edit', async (req, res) => {
  try {
    const { id, name, phoneNumber } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing member id' });

    const updated = await Member.findByIdAndUpdate(
      id,
      { name, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Member not found' });

    res.json({ message: 'Member updated', member: updated });
  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).json({ error: 'Error updating member' });
  }
});

// Remove member (DELETE /api/remove)
// Expects JSON body: { id }
app.delete('/api/remove', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing member id' });

    const removed = await Member.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Member not found' });

    console.log('Removed member:', removed);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({ error: 'Error removing member' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});