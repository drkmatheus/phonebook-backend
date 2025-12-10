const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Contact = require("./models/contact");
const app = express();

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

morgan.token("body", (req, res) => {
  return req.body ? JSON.stringify(req.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (req, res, next) => {
  Contact.find({})
    .then((contacts) => {
      res.json(contacts);
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  Contact.countDocuments({}).then((count) => {
    res.send(`<p>Phonebook has ${count} registered contacts</p>
        <p>${new Date().toString()}</p>`);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Contact.findById(req.params.id)
    .then((contact) => {
      res.json(contact);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Contact.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number are missing" });
  }

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact
    .save()
    .then((savedContact) => {
      res.json(savedContact);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "name and number are required" });
  }

  Contact.findByIdAndUpdate(
    req.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  )
    .then((updatedContact) => {
      if (updatedContact) {
        res.json(updatedContact);
      } else {
        res.status(404).json({ error: "contact not found" });
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformated id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server listening on port: ${PORT}`);
});
