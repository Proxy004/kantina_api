import * as express from "express";
import { Request, Response } from "express";
import searchInDatabase from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  searchInDatabase(
    `INSERT INTO `benutzer`(`benutzer_id`, `vorname`, `nachname`, `e-mail`, `mitarbeiter?`) VALUES ()",
    null,
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "Internal Server Error" });
      if (results.length === 0) res.status(404).json({ error: "Not Found" });
      return res.send(results);
    }
  );
});

export default router;
