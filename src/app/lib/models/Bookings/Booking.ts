import mongoose, { Schema, model, models } from 'mongoose';

const bookingSchema = new Schema(
  {
    clientId: { type: mongoose.Types.ObjectId, required: true },
    courseTitle: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['provisional', 'confirmed'], default: 'provisional' },
  },
  { timestamps: true }
);

export const Booking = models.Booking || model('Booking', bookingSchema);
