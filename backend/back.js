require("dotenv").config()
const fastify = require("fastify")()
const fastifyPostgres = require("fastify-postgres")
const fastifyCors = require("@fastify/cors")
const { Client } = require("pg")

fastify.register(fastifyCors, { origin: "http://localhost:3000" })
fastify.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
})

async function executeQuery(query, params) {
    const client = await fastify.pg.connect()
    try {
        return await client.query(query, params)
    } finally {
        client.release()
    }
}

async function createDatabaseIfNotExist() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        database: "postgres", // Connect to the default database
    })
    await client.connect()

    try {
        // Attempt to create the database, but catch the error if it already exists
        const createDatabaseQuery = `CREATE DATABASE authdb;`
        await client.query(createDatabaseQuery)
        console.log('Database created or already exists.')
    } catch (error) {
        if (error.code === '42P04') {
            // Error code '42P04' corresponds to 'database already exists'
            console.log('Database "authdb" already exists.')
        } else {
            console.error('Error creating database:', error)
        }
    } finally {
        await client.end()
    }
}

async function createTableIfNotExist() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
    `
    try {
        await executeQuery(query)
        console.log('Table created or already exists.')
    } catch (error) {
        console.error('Error creating table:', error)
    }
}

fastify.post("/signup", async (request, reply) => {
    try {
        const { email, password } = request.body;
        console.log('Signup attempt with email:', email);

        const query = "INSERT INTO users (email, password) VALUES ($1, $2)";
        await executeQuery(query, [email, password]);

        reply.send({ success: true });
    } catch (error) {
        console.error("Error during signup:", error);
        reply.status(500).send({ success: false, message: "Error during sign up" });
    }
})

fastify.post("/login", async (request, reply) => {
    try {
        const { email, password } = request.body;
        console.log('Login attempt with email:', email);
        
        const query = "SELECT * FROM users WHERE email=$1 AND password=$2";
        const { rows } = await executeQuery(query, [email, password])

        reply.send({ success: rows.length > 0 })
    } catch (error) {
        console.error("Error during login:", error);
        reply.status(500).send({ success: false, message: "Error during login" });
    }
})

fastify.listen({ port: 5000, host: "0.0.0.0" }, async (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    await createDatabaseIfNotExist()
    await createTableIfNotExist()

    console.log(`Listening on ${address}`)
})