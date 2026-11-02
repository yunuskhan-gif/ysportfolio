import { Schema, model, models, type InferSchemaType } from "mongoose";

const OtpVerificationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically clear expired OTP records
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export function getOtpModel() {
  return models.OtpVerification || model("OtpVerification", OtpVerificationSchema, "otp_verifications");
}

