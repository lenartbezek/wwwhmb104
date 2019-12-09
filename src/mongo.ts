import { Db, MongoClient } from "mongodb";

let connection: Promise<{
    client: MongoClient;
    db: Db;
}> | undefined;

export function connectToDb() {
    if (!connection) {
        connection = MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true })
            .then((client) => ({
                client,
                db: client.db("wwwhmb104"),
            }));
    }

    return connection;
}
