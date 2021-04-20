import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  database.result(
    "SELECT * FROM  produkte",
    null,
    (err: MysqlError, results) => {
      return res.send(results);
    }
  );
});

export default router;
