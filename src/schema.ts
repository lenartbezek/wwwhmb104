import { makeExecutableSchema, ValidationError } from "apollo-server-express";
import { GraphQLFieldResolver, GraphQLObjectType, GraphQLSchema } from "graphql";
import request = require("request-promise-native");
import { apm } from "./apm";
import { Context } from "./context";

const typeDefs = /* GraphQL */`

  type Post {
    title: String!
    content: String!
    postedBy: User!
  }

  type User {
    name: String!
    posts: [Post!]!
  }

  type Query {
    hello: String!

    users: [User!]
    posts: [Post!]

    # This query will throw an internal server error
    testInternalError: Boolean

    # This query will throw a validation error
    testValidationError: Boolean

    # This query will throw a GraphQL result error
    testTypeError: Int

    # This query uses an integer input
    testInputError(input: Int!): Int!
  }

  schema {
    query: Query
  }
`;

export const schema = makeExecutableSchema<Context>({
    typeDefs,
    resolvers: {
        Post: {
            postedBy: async (source, args, ctx, info) => {
                return ctx.db.collection("users").findOne({ _id: source.postedBy });
            },
        },
        User: {
            posts: async (source, args, ctx, info) => {
                return ctx.db.collection("posts").find({ user: source._id }).toArray();
            },
        },
        Query: {
            hello: () => request("http://localhost:8081/hello"),
            posts: async (source, args, ctx, info) => {
                return ctx.db.collection("posts").find().toArray();
            },
            users: async (source, args, ctx, info) => {
                return ctx.db.collection("users").find().toArray();
            },
            testInternalError: () => {
                throw new Error("This is very bad.");
            },
            testValidationError: () => {
                throw new ValidationError("Bad input or something.");
            },
            testTypeError: () => "obviously not an integer",
            testInputError: (source, args) => {
                return args.input + 1;
            },
        },
    },
});

function wrapSchema<TContext>(
    s: GraphQLSchema,
    wrapper: <TSource, TArgs>(resolver: GraphQLFieldResolver<TSource, TContext, TArgs>) =>
        GraphQLFieldResolver<TSource, TContext, TArgs>,
) {
    const types = s.getTypeMap();
    for (const type of Object.values(types)) {
        if (type.name.startsWith("__")) {
            continue;
        }

        if (type instanceof GraphQLObjectType) {
            const fields = type.getFields();

            for (const field of Object.values(fields)) {
                if (!field.resolve) {
                    continue;
                }
                field.resolve = wrapper(field.resolve);
            }
        }
    }
}

wrapSchema<Context>(schema, (resolve) => {
    return async (source, args, context, info) => {
        const name = `${info.parentType.name}.${info.fieldName}`;
        const span = apm.startSpan(name);
        span?.setType("graphql");
        try {
            const result = await resolve(source, args, context, info);
            return result;
        } finally {
            span?.end();
        }
    };
});
