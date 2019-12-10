import { makeExecutableSchema, ValidationError } from "apollo-server-express";
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
