import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import products from "./routes/products/products";
import users from "./routes/users/users";
import orders from "./routes/orders/orders";
const app = express();

//routes
process.setMaxListeners(0);
app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use("/products", products);
app.use("/user", users);
app.use("/orders", orders);

app.listen(process.env.PORT, () =>
  console.log(`Kantina API running on ${process.env.PORT}!`)
);
