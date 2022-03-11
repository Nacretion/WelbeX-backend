
const db = require("../database")

class UserController {
    async createUser(request, result) {
        const {name, surname} = request.body
        const newUser =
            await db.query(
                "INSERT INTO person (name, surname) values ($1, $2) RETURNING *", [name, surname])
        result.json(newUser.rows[0])
    }
    async getUsers(request, result) {
        const users = await db.query('SELECT * FROM person')
        result.json(users.rows)
    }
    async getUser(request, result) {
        const id = request.params.id
        const user = await db.query("SELECT * FROM person where id = $1", [id])
        result.json(user.rows[0])
    }
    async updateUser(request, result) {
        const {id, name, surname} = request.body
        const user = await db.query(
            "UPDATE person set name = $1, surname = $2 WHERE id = $3 RETURNING *",
            [name, surname, id])
        result.json(user.rows[0])
    }
    async deleteUser(request, result) {
        const id = request.params.id
        const user = await db.query("DELETE FROM person where id = $1", [id])
        result.json(user.rows[0])
    }
}

module.exports = new UserController()