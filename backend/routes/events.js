import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  const events = await Event.find();
  // Map _id to id for frontend compatibility
  const eventsWithId = events.map(event => ({ ...event.toObject(), id: event._id.toString() }));
  res.json(eventsWithId);
});

// Get event by ID
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Not found' });
  res.json({ ...event.toObject(), id: event._id.toString() });
});

// Create event
router.post('/', async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.status(201).json({ ...event.toObject(), id: event._id.toString() });
});

// Update event
router.put('/:id', async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ message: 'Not found' });
  res.json({ ...event.toObject(), id: event._id.toString() });
});

// Delete event
router.delete('/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router; 