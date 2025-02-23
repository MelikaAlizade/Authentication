require("dotenv").config();
const fastify = require("fastify")();
const fastifyPostgres = require("fastify-postgres");
const fastifyCors = require("@fastify/cors");

fastify.register(fastifyCors, { origin: "http://localhost:3000" });
fastify.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
});

async function executeQuery(query, params = []) {
    const client = await fastify.pg.connect();
    try {
        return await client.query(query, params);
    } finally {
        client.release();
    }
}

async function createUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `;
    try {
        await executeQuery(createTableQuery);
        console.log("Users table is ready.");
    } catch (error) {
        console.error("Error creating users table:", error);
        process.exit(1);
    }
}

fastify.post("/signup", async (request, reply) => {
    try {
        const { email, password } = request.body;
        console.log("Signup attempt with email:", email);

        const query = "INSERT INTO users (email, password) VALUES ($1, $2)";
        await executeQuery(query, [email, password]);

        reply.send({ success: true });
    } catch (error) {
        console.error("Error during signup:", error);
        reply.status(500).send({ success: false, message: "Error during sign up" });
    }
});

fastify.post("/login", async (request, reply) => {
    try {
        const { email, password } = request.body;
        console.log("Login attempt with email:", email);

        const query = "SELECT * FROM users WHERE email=$1 AND password=$2";
        const { rows } = await executeQuery(query, [email, password]);

        reply.send({ success: rows.length > 0 });
    } catch (error) {
        console.error("Error during login:", error);
        reply.status(500).send({ success: false, message: "Error during login" });
    }
});

fastify.listen({ port: 5000, host: "0.0.0.0" }, async (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    await createUsersTable();
    console.log(`Listening on ${address}`);
});