import dotenv from "dotenv"
dotenv.config()  
import Razorpay from "razorpay"

let razorpayClient;

const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = process.env;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay configuration is missing.");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
};

const razorpay = {
  get orders() {
    return getRazorpayClient().orders;
  },
};

export default razorpay