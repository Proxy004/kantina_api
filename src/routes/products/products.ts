import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  database(
    "SELECT produkte.produkt_id, produkte.bezeichnung, produkte.beschreibung, produkte.preis, produkte.inhaltsstoffe, produkte.allergene," +
      "produkte.bildPfad, produkte.urlPfad, kategorie.kategorie FROM produkte JOIN kategorie ON produkte.fk_kategorie = kategorie.kategorie_id",
    null,
    (err: MysqlError, results) => {
      if (err) return res.status(500).json({ error: "Internal Server Error" });
      if (results.length === 0) res.status(404).json({ error: "Not Found" });
      return res.send(results);
    }
  );
});

export default router;
