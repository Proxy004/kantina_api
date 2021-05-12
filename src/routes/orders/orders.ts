import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";

const router = express.Router();

router.post("/newOrder", (req: Request, res: Response) => {
  let today = new Date();

  let pricefromOrder: number = 0;
  let pricefromDb: number = 0;
  let idBenutzer: number = 0;

  let idBestellung: number;
  let idProdukt: number;

  req.body.product.forEach((element1) => {
    pricefromOrder += element1.preis * element1.quantity;
  });

  req.body.product.forEach((element) => {
    let str: string = req.body.time;
    let timeSplit = str.split(":");
    let stringToTime = new Date();
    stringToTime.setHours(parseInt(timeSplit[0]));
    stringToTime.setMinutes(parseInt(timeSplit[1]));
    stringToTime.setSeconds(0);
    stringToTime.setFullYear(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    database(
      `SELECT produkt_id,preis FROM produkte WHERE bezeichnung=?`,
      [element.bezeichnung],
      (err: MysqlError, result) => {
        if (err) {
          return res.status(406).json({ error: "An error occured" });
        } else {
          pricefromDb += parseFloat(result[0].preis);
          if (pricefromOrder === pricefromDb) {
            database(
              `SELECT benutzer_id
                FROM benutzer
                WHERE email =  ?`,
              [req.body.email],
              (err: MysqlError, result) => {
                idBenutzer = result[0].benutzer_id;
                if (err) {
                  console.log(err);
                  return res.status(406).json({
                    error: "An error occured while registering the order",
                  });
                } else if (result != null) {
                  database(
                    `INSERT INTO bestellung(bestellung_id, datum, abholzeit, gesamtpreis, fk_benutzer, fk_status) VALUES (?,?,?,?,?,?)`,
                    [null, today, stringToTime, pricefromOrder, idBenutzer, 1],
                    (err: MysqlError, result) => {
                      if (err) {
                        console.log(err);
                        return res.status(406).json({
                          error: "An error occured while registering the order",
                        });
                      } else {
                        idBestellung = result.insertId;
                        req.body.product.forEach((element) => {
                          database(
                            `SELECT produkt_id FROM produkte WHERE produkte.bezeichnung=? `,
                            [element.bezeichnung],
                            (err: MysqlError, result) => {
                              idProdukt = result[0].produkt_id;
                              if (err) {
                                console.log(err);
                                return res.status(406).json({
                                  error:
                                    "An error occured while registering the products",
                                });
                              } else {
                                database(
                                  `INSERT INTO bestellung_artikel(bestellung_artikel_id, menge, fk_bestellung, fk_produkte) VALUES (?,?,?,?)`,
                                  [
                                    null,
                                    element.quantity,
                                    idBestellung,
                                    idProdukt,
                                  ],
                                  (err: MysqlError) => {
                                    if (err) {
                                      console.log(err);
                                      return res.status(406).json({
                                        error:
                                          "An error occured while registering the products",
                                      });
                                    }
                                  }
                                );
                              }
                            }
                          );
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  });
});

export default router;
