import { Router } from 'express';
import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';

const router = Router();

/**
 * Validate and sanitise an incoming feedback payload.
 * courseDuration is optional — the model supplies a default when omitted.
 */
function validatePayload(body) {
  const courseName = typeof body.courseName === 'string' ? body.courseName.trim() : '';
  const courseDuration =
    typeof body.courseDuration === 'string' && body.courseDuration.trim()
      ? body.courseDuration.trim()
      : 'Not specified';
  const comments = typeof body.comments === 'string' ? body.comments.trim() : '';
  const rating = Number(body.rating);

  const errors = [];
  if (courseName.length < 2 || courseName.length > 100)
    errors.push('Course name must be 2–100 characters.');
  if (courseDuration.length > 60)
    errors.push('Course duration cannot exceed 60 characters.');
  if (comments.length < 5 || comments.length > 1000)
    errors.push('Comments must be 5–1000 characters.');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.push('Rating must be a whole number from 1 to 5.');

  return { errors, data: { courseName, courseDuration, comments, rating } };
}

/** Attach a display-friendly courseId to a plain feedback object. */
function withCourseId(item) {
  return { ...item, courseId: `CRS-${String(item._id).slice(-6).toUpperCase()}` };
}

// GET /api/feedback  — list all feedback, newest first
router.get('/', async (_req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json(feedback.map(withCourseId));
  } catch (error) { next(error); }
});

// GET /api/feedback/:id  — read one entry
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid feedback ID.' });
    const item = await Feedback.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Feedback not found.' });
    res.json(withCourseId(item));
  } catch (error) { next(error); }
});

// POST /api/feedback  — create
router.post('/', async (req, res, next) => {
  try {
    const { errors, data } = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });
    const created = await Feedback.create(data);
    res.status(201).json(withCourseId(created.toObject()));
  } catch (error) { next(error); }
});

// PUT /api/feedback/:id  — update ONE record, no side-effects on others
router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid feedback ID.' });
    const { errors, data } = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Feedback not found.' });
    res.json(withCourseId(updated.toObject()));
  } catch (error) { next(error); }
});

// DELETE /api/feedback/:id  — remove ONE record
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid feedback ID.' });
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Feedback not found.' });
    res.json({ message: 'Feedback deleted successfully.' });
  } catch (error) { next(error); }
});

export default router;
