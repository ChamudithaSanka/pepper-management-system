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
  farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
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

// Modify the toJSON method to include farmer name
rawMaterialOrderSchema.method("toJSON", function () {
    const { _id, __v, ...object } = this.toObject();

    return {
        rmOrderId: object.rmOrderId,
        rawMaterialType: object.rawMaterialType,
        requestedQtyKg: object.requestedQtyKg,
        farmerName: object.farmerId ? object.farmerId.name : null, // Add farmer name
        deliveredQtyKg: object.deliveredQtyKg,
        status: object.status,
        deliveredAt: object.deliveredAt,
        createdAt: object.createdAt,
        updatedAt: object.updatedAt,
        id: _id
    };
});

// Add populate middleware to automatically populate farmer details
rawMaterialOrderSchema.pre('find', function() {
    this.populate('farmerId', 'name');
});

rawMaterialOrderSchema.pre('findOne', function() {
    this.populate('farmerId', 'name');
});

export default mongoose.model('RawMaterialOrder', rawMaterialOrderSchema);