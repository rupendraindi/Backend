// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Payment from '../Model/paymentModel.js';

// // Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
 

// // Create Order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount, currency } = req.body;

//     const options = {
//       amount: amount * 100, // amount in smallest unit (paise)
//       currency: currency || 'INR',
//     };

//     const order = await razorpay.orders.create(options);

//     // Save order details in the database
//     const payment = new Payment({
//       orderId: order.id,
//       amount: options.amount,
//       currency: options.currency,
//     });
//     await payment.save();

//     res.status(201).json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Verify Payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const body = razorpay_order_id + '|' + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest('hex');

//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (isAuthentic) {
//       const payment = await Payment.findOneAndUpdate(
//         { orderId: razorpay_order_id },
//         { paymentId: razorpay_payment_id, signature: razorpay_signature, status: 'paid' },
//         { new: true }
//       );

//       res.status(200).json({ success: true, payment });
//     } else {
//       res.status(400).json({ success: false, message: 'Invalid signature' });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Handle Webhook
// export const handleWebhook = async (req, res) => {
//   try {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers['x-razorpay-signature'];
//     const payload = JSON.stringify(req.body);

//     const expectedSignature = crypto
//       .createHmac('sha256', secret)
//       .update(payload)
//       .digest('hex');

//     if (signature === expectedSignature) {
//       const event = req.body;

//       // Handle the event (e.g., payment.captured)
//       if (event.event === 'payment.captured') {
//         await Payment.findOneAndUpdate(
//           { orderId: event.payload.payment.entity.order_id },
//           { paymentId: event.payload.payment.entity.id, status: 'paid' },
//           { new: true }
//         );
//       }

//       res.status(200).json({ success: true });
//     } else {
//       res.status(400).json({ success: false, message: 'Invalid webhook signature' });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };