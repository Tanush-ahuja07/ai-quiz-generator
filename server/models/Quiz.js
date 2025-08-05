import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
        questionText: {
                type: String,
                required: true,
        },
        options: {
                type: [String], // Exactly 4 options
                validate: {
                        validator: function (v) {
                                return Array.isArray(v) && v.length === 4;
                        },
                        message: "There must be exactly 4 options.",
                },
                required: true,
        },
        correctAnswerIndex: {
                type: Number,
                required: true,
                min: 0,
                max: 3, // Index for correct option (0 to 3)
        },
});

const quizSchema = new mongoose.Schema(
        {
                title: {
                        type: String,
                        required: true,
                },
                topic: {
                        type: String,
                },
                isAIgenerated: {
                        type: Boolean,
                        default: false,
                },
                questions: [questionSchema], // Array of questions
                roomCode: {
                        type: String,
                        unique: true,
                        required: true,
                },
                duration: {
                        type: Number,
                        required: true,
                },
                createdBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
        },
        { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
