
const db = require("../database")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")

class UserController {
    async createUser(request, result) {
        try {
            const {username, password} = request.body
            const candidate = await db.query("SELECT * FROM person where username = $1", [username.toLowerCase()])
            if (!candidate.rows[0]) {
                const hashedPassword = await bcrypt.hash(password, 12)
                const newUser = await db.query(
                        "INSERT INTO person (username, password) values ($1, $2) RETURNING *",
                        [username.toLowerCase(), hashedPassword])
                result.json(newUser.rows[0])
            } else result.json("That user already exists")
        } catch (e) {
            result.json(e.message)
        }
    }
    async loginUser(request, result) {
        try {
            const {username, password} = request.body
            const candidate = await db.query("SELECT * FROM person where username = $1", [username.toLowerCase()])
            if (candidate) {
                const id = candidate.rows[0].id

                const isMatch = await bcrypt.compare(password, candidate.rows[0].password)


                if (!isMatch) {
                    return result.status(400).json({message: "incorrect password"})
                }

                const token = jwt.sign(
                    {userID: id},
                    config.get("jwtSecret"),
                    {expiresIn: "1h"}
                )
                result.json({token, id})
            } else result.json("That user not exists")
        } catch (e) {
            result.json("server " + e.message)
        }
    }

    async getUsers(request, result) {
        try {
            const users = await db.query('SELECT * FROM person')
            result.json(users.rows)
        } catch (e) {
            result.json(e.message)
        }
    }

    async getUser(request, result) {
        try {
            const id = request.params.id
            const user = await db.query("SELECT * FROM person where id = $1", [id])
            result.json(user.rows[0])
        } catch (e) {
            result.json(e.message)
        }
    }
    async updateUser(request, result) {
        try {
            const {id, username, password} = request.body
            const user = await db.query(
                "UPDATE person set username = $1, password = $2 WHERE id = $3 RETURNING *",
                [username, password, id])
            result.json(user.rows[0])
        } catch (e) {
            result.json(e.message)
        }
    }
    async deleteUser(request, result) {
        try {
            const id = request.params.id
            const user = await db.query("DELETE FROM person where id = $1", [id])
            result.json(user.rows[0])
        } catch (e) {
            result.json(e.message)
        }
    }
}

module.exports = new UserController()