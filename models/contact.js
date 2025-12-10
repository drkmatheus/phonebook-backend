require("dotenv").config();
const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(url)
  .then((result) => {
    console.log("conected successfully");
  })
  .catch((error) => {
    console.log("An error occurred: ", error.message);
  });

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  number: {
    type: String,
    required: [true, "Number is required and must have atlease 8 digits"],
    minLength: 8,
    validate: {
      validator: (v) => {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: "Please use the format: XXX-XXX-XXXX",
    },
  },
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Contact", contactSchema);
