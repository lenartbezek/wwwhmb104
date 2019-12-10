
import * as express from "express";
import { connectToDb } from "./mongo";
import { schema } from "./schema";
import { buildServer } from "./server";

async function start() {

    const { db } = await connectToDb();

    const app = express();
    const server = buildServer(schema, { db });

    server.applyMiddleware({ app });

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
