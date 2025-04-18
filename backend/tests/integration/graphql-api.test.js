const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import schema and model
const BalanceEntry = require('../../src/models/BalanceEntry');
const { typeDefs, resolvers } = require('../../src/schema');

let mongod;
let app;
let server;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connect mongoose to the in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Set up Express + ApolloServer
  app = express();
  server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  // Clear all data before each test
  await BalanceEntry.deleteMany({});
});

describe('GraphQL API Integration', () => {
  it('should respond to hello query', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({ query: '{ hello }' })
      .expect(200);

    expect(res.body.data.hello).toBe('Hello World from GraphQL!');
  });

  it('getBalanceEntries returns entries within date range', async () => {
    // Seed test data
    await BalanceEntry.create({
      datetime: new Date('2025-04-01T00:00:00Z'),
      values: { solar: 100 },
      labels: { solar: 'Solar' },
    });
    await BalanceEntry.create({
      datetime: new Date('2025-04-02T00:00:00Z'),
      values: { wind: 200 },
      labels: { wind: 'Wind' },
    });

    const query = `
      query($startDate: String!, $endDate: String!) {
        getBalanceEntries(startDate: $startDate, endDate: $endDate) {
          datetime
          values
          labels
        }
      }
    `;
    const variables = {
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2025-04-03T00:00:00Z',
    };

    const res = await request(app)
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    const entries = res.body.data.getBalanceEntries;
    expect(entries).toHaveLength(2);
    expect(entries[0].labels).toEqual({ solar: 'Solar' });
    expect(entries[1].labels).toEqual({ wind: 'Wind' });
  });
});
