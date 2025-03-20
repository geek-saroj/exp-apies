import * as Joi from "joi";
import { DataSource } from "typeorm";
import { AppDataSource } from "../db/datasource";

/**
 * Base controller class that handles error handling
 * it proxies all the methods of the class that extends it
 * english: it will catch all the errors thrown by the methods of the class that extends it
 */
export class Controller {
  dataSource: DataSource;

  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
    const handler = {
      get: (target: any, prop: any) => {
        if (prop === "handle") {
          return target[prop];
        }
        return async (req: any, res: any) => {
          try {
            req.route = prop;
            let data = await target[prop](req, res);
            //if response is not sent, send 200
            if (!res.headersSent) {
              res.status(data?.status ?? 200).send(data);
            }
          } catch (e) {
            console.log("Error in controller: " + this.constructor.name);
            console.log("Thrown by: " + prop);
            console.log(e);
            //@ts-ignore
            let errorObj: HttpError = e;
            if (e instanceof Joi.ValidationError) {
              errorObj = {
                status: 400,
                message: e.details[0].message,
              };
            } else if ((e as any)?.code === "23505") {
              const duplicateColumn = (e as any).detail.match(/\((.*?)\)/)[1];
              const entity = (e as any).table;
              errorObj = {
                status: 400,
                message: `${entity} with ${duplicateColumn} already exists`,
              };
            } else if (e instanceof Error) {
              errorObj = {
                status: 500,
                message: e.message,
              };
            } else if (!errorObj) {
              errorObj = {
                status: 500,
                message: "Internal server error",
              };
              return res.status(errorObj.status ?? 500).send(errorObj.message);
            }
            res.status(errorObj.status ?? 500).send(errorObj.message);
          }
        };
      },
    };
    return new Proxy(this, handler);
  }
}
