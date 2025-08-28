import mongoose from 'mongoose';

// --- Counter Schema & Model for auto-increment ---
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// --- Raw Material Order Schema ---
const rawMaterialOrderSchema = new mongoose.Schema({
  rmOrderId: {
    type: String,
    unique: true
  },
  rawMaterialType: {
    type: String,
    required: true,
    enum: ["Black Pepper", "Green Pepper"]
  },
  requestedQtyKg: {
    type: Number,
    required: true,
    min: 0
  },
  deliveredQtyKg: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Delivered"],
    default: "Pending"
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// --- Pre-save middleware to generate rmOrderId automatically ---
rawMaterialOrderSchema.pre('save', async function (next) {
  if (!this.rmOrderId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'rmOrderId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.rmOrderId = `RMO-${counter.seq.toString().padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// --- Ensure rmOrderId shows first in JSON output ---
rawMaterialOrderSchema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject();

  return {
    rmOrderId: object.rmOrderId,             // always first
    rawMaterialType: object.rawMaterialType,
    requestedQtyKg: object.requestedQtyKg,
    deliveredQtyKg: object.deliveredQtyKg,
    status: object.status,
    deliveredAt: object.deliveredAt,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    id: _id                                  // keep Mongo _id last
  };
});

export default mongoose.model('RawMaterialOrder', rawMaterialOrderSchema);
