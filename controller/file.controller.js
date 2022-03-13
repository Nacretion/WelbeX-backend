const db = require("../database")
const fs = require("fs")
const fsPromises = fs.promises

class  FileController {
    async getFile(request, result) {
        const path = "uploads" + "\\" + request.params.path
        const file = await db.query(
            "SELECT * FROM file WHERE path = $1",
            [path])
        if (file.rows[0]) {
            fs.readFile(file.rows[0].path, function (error, data) {
                if (error) {
                    result.statusCode = 404
                    result.end('Resourse not found!')
                } else {
                    result.end(data)
                }
            })
        } else result.status(404).json('Resourse not found!')
        //

    }
}

module.exports = new FileController()