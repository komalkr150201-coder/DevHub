
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        type: {
            type: String,
            enum: [
                "collaboration_request",
                "request_accepted",
                "request_rejected",
                "project_invitation",
                "system"
            ],
            required: true
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        link: {
            type: String,
            default: "/app/requests"
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model(
    "Notification",
    notificationSchema
);
