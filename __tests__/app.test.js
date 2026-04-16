const request = require("supertest");
const app = require("../index"); // Import our app
const mongoose = require("mongoose");

// After all tests are done, close the mongoose connection to allow Jest to exit
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Booking App Routes", () => {
  
  test("GET /home should respond with 200 OK", async () => {
    const res = await request(app).get("/home");
    expect(res.statusCode).toBe(200);
  });

  test("GET /login should respond with 200 OK", async () => {
    const res = await request(app).get("/login");
    expect(res.statusCode).toBe(200);
  });

  test("GET /signup should respond with 200 OK", async () => {
    const res = await request(app).get("/signup");
    expect(res.statusCode).toBe(200);
  });

  test("GET /unknown-route should respond with 404", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.statusCode).toBe(404);
  });

});
