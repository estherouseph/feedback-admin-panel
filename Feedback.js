import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required.'],
    trim: true,
    minlength: [2, 'Course name must be at least 2 characters.'],
    maxlength: [100, 'Course name cannot exceed 100 characters.']
  },
  // courseDuration is stored but no longer required from the user.
  // It defaults to 'Not specified' when omitted so existing records stay valid.
  courseDuration: {
    type: String,
    trim: true,
    maxlength: [60, 'Course duration cannot exceed 60 characters.'],
    default: 'Not specified'
  },
  comments: {
    type: String,
    required: [true, 'Feedback comments are required.'],
    trim: true,
    minlength: [5, 'Comments must be at least 5 characters.'],
    maxlength: [1000, 'Comments cannot exceed 1000 characters.']
  },
  rating: {
    type: Number,
    required: [true, 'Please choose a rating.'],
    min: [1, 'Rating must be at least 1.'],
    max: [5, 'Rating cannot exceed 5.'],
    validate: { validator: Number.isInteger, message: 'Rating must be a whole number from 1 to 5.' }
  }
}, { timestamps: true });

feedbackSchema.index({ courseName: 1, createdAt: -1 });
export default mongoose.model('Feedback', feedbackSchema);
