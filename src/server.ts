import { ApolloServer, ValidationError } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { Db } from "mongodb";
import { apm } from "./apm";
import { Context } from "./context";

export function buildServer(schema: GraphQLSchema, dependencies: {
    db: Db,
}) {

    return new ApolloServer({
        context: ({ req, res }) => new Context(req, res, dependencies),
        schema,
        playground: true,
        debug: false,
        formatError: (error) => {
            if (
                error instanceof ValidationError ||
                error.originalError instanceof ValidationError
            ) {
                return error;
            }
            apm.captureError(error.originalError ?? error, {
                labels: {
                    path: error.path?.join("."),
                },
            });
            return error;
        },
    });
}
