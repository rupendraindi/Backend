// // Razorpay Schema
// import mongoose from 'mongoose';

// const PaymentSchema = new mongoose.Schema({
//   orderId: {
//     type: String,
//     required: true,
//   },
//   paymentId: {
//     type: String,
//     required: false,
//   },
//   signature: {
//     type: String,
//     required: false,
//   },
//   amount: {
//     type: Number,
//     required: true,
//   },
//   currency: {
//     type: String,
//     required: true,
//     default: 'INR',
//   },
//   status: {
//     type: String,
//     enum: ['created', 'paid', 'failed'],
//     default: 'created',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Payment = mongoose.model('Payment', PaymentSchema);
// export default Payment;