import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import products from "./routes/products/products";
const app = express();

//routes

app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use("/products", products);

app.listen(process.env.PORT, () =>
  console.log(`Kantina API running on ${process.env.PORT}!`)
);
