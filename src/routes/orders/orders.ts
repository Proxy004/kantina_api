import * as express from "express";
import { Request, Response } from "express";
import database from "../../database/database";
import { MysqlError } from "mysql";
import * as bcrypt from "bcrypt";
import { token } from "morgan";
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

  req.body.product.forEach((element2) => {
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
      [element2.bezeichnung],
      (err: MysqlError, result) => {
        if (err) {
          return res.status(406).json({ error: "An error occured" });
        } else {
          pricefromDb += parseFloat(result[0].preis) * element2.quantity;
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
                        req.body.product.forEach((element3) => {
                          database(
                            `SELECT produkt_id FROM produkte WHERE produkte.bezeichnung=?`,
                            [element3.bezeichnung],
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
                                    element3.quantity,
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
            return res.sendStatus(200);
          }
        }
      }
    );
  });
});

router.get("/getOrders", (req: Request, res: Response) => {
  database(
    `SELECT bestellung.bestellung_id,bestellung.gesamtpreis, benutzer.vorname, benutzer.nachname, status.text, bestellung.abholzeit, bestellung.datum FROM benutzer JOIN bestellung ON benutzer.benutzer_id = bestellung.fk_benutzer JOIN status ON bestellung.fk_status = status.status_id WHERE status.text="Open" ORDER BY bestellung.abholzeit ASC
    `,
    [],
    (err: MysqlError, result) => {
      if (err) {
        console.log(err);
        return res.status(406).json({
          error: "An error occured while registering the order",
        });
      } else {
        res.send(result);
      }
    }
  );
});

router.get("/getProductsOfOrder/:orderId", (req: Request, res: Response) => {
  database(
    `SELECT bestellung_artikel.menge, produkte.bezeichnung, produkte.preis
    FROM bestellung_artikel JOIN produkte
    ON bestellung_artikel.fk_produkte = produkte.produkt_id
    WHERE bestellung_artikel.fk_bestellung = ?
    `,
    [req.params.orderId],
    (err: MysqlError, result) => {
      if (err) {
        console.log(err);
        return res.status(406).json({
          error: "An error occured while registering the order",
        });
      } else {
        res.send(result);
      }
    }
  );
});

router.post("/setOrderClosed/:orderId", (req: Request, res: Response) => {
  const hashString: string = req.body.token + req.body.loginDate.toString();

  database(
    `SELECT token FROM benutzer WHERE email=?
    `,
    [req.body.email],
    (err: MysqlError, result) => {
      if (err) {
        console.log(err);
        return res.status(406).json({
          error: "An error occured while closing the order",
        });
      } else {
        bcrypt.compare(hashString, result[0].token).then(function (result) {
          if (result) {
            database(
              `UPDATE bestellung SET fk_status=? WHERE bestellung_id=?
                `,
              [2, req.params.orderId],
              (err: MysqlError) => {
                if (err) {
                  console.log(err);
                  return res.status(406).json({
                    error: "An error occured closing the order",
                  });
                } else {
                  res.sendStatus(200);
                }
              }
            );
          } else {
            return res.status(406).json({
              error: "An error occured while closing the order",
            });
          }
        });
      }
    }
  );
});

export default router;
