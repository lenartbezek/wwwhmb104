import { apm } from "./apm";

import * as express from "express";
import { connectToDb } from "./mongo";
import { schema } from "./schema";
import { buildServer } from "./server";

async function start() {

    const { db } = await connectToDb();

    const app = express();
    const server = buildServer(schema, { db });

    server.applyMiddleware({ app });

    app.get("/something", (req, res, next) => {
        throw new Error("Something happened.");
    });

    app.use(async (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        const id = await new Promise<string>((resolve, reject) => apm.captureError(error, (err, errId) => {
            if (err) {
                reject(err);
            } else {
                resolve(errId);
            }
        }));
        if (res.headersSent) {
            next(error);
        } else {
            res.status(500).send(`INTERNAL_SERVER_ERROR ${id}`);
        }
    });

    app.listen({ port: 8080 }, () => {
        // tslint:disable-next-line: no-console
        console.log(`Listening on port 8080 ...`);
    });
}

start()
    .catch((e) => {
        // tslint:disable-next-line: no-console
        console.error(e);
        process.exit(1);
    });
