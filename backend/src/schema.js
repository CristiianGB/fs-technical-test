const { gql } = require('apollo-server-express');

// ----------- Type Definitions -----------
const typeDefs = gql`
  scalar JSON

  type BalanceEntry {
    datetime: String!
    values: JSON!
    labels: JSON!
  }

  type Query {
    getBalanceEntries(startDate: String!, endDate: String!): [BalanceEntry!]!
    countBalanceEntries(startDate: String!, endDate: String!): Int!  # Nuevo resolver
  }
`;

// ----------- Resolvers -----------
const BalanceEntry = require('./models/BalanceEntry');
const { GraphQLJSONObject } = require('graphql-type-json');

const resolvers = {
  JSON: GraphQLJSONObject,

  Query: {
    // Devuelve documentos ordenados por datetime
    getBalanceEntries: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return BalanceEntry.find({
        datetime: { $gte: start, $lte: end }
      }).sort({ datetime: 1 });
    },

    // Cuenta cuántos documentos hay en el rango
    countBalanceEntries: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return BalanceEntry.countDocuments({
        datetime: { $gte: start, $lte: end }
      });
    }
  }
};

module.exports = { typeDefs, resolvers };
