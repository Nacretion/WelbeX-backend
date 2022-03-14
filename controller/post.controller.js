
const db = require("../database")
const fs = require("fs")
const fsPromises = fs.promises

class  PostController {
    async createPost(request, result) {
        const {message, userId} = request.body
        const date = new Date()

        const files = request.files
        let newFiles = []
        if (message && userId) {
            const newPost = await db.query(
                "INSERT INTO post (date, message, user_id) values ($1, $2, $3) RETURNING *",
                [date, message, userId])
            if (files) {
                files.map(async file => {
                    const filePath = file.path
                    const postId = newPost.rows[0].id
                    const newFile = await db.query(
                        "INSERT INTO file (path, post_id) values ($1, $2) RETURNING *",
                        [filePath, postId])
                })

            }
            result.json(newPost.rows[0])
        } else {
            files.map(async file => {
                await fsPromises.rm(file.path)
            })
            result.status(400).json("request has empty fields")
        }
    }
    async getPosts(request, result){
        const posts = await db.query("SELECT * FROM post")
        let filePaths = []
        for (let i = 0; i < posts.rows.length; i++) {
            const files = await db.query("SELECT * FROM file WHERE post_id = $1", [posts.rows[i].id])
            if (files) {
                for (let i = 0; i < files.rows.length; i++) {
                    filePaths.push({
                        path: files.rows[i].path.replace('\\', "/"),
                        postId: files.rows[0].post_id})
                }
            }
        }

        result.json({posts: posts.rows, filePaths})
    }

    async getPostsByUser(request, result){
        const id = request.query.id
        console.log(id)
        let filePaths = []
        const posts = await db.query("SELECT * FROM post WHERE user_id = $1", [id])
        for (let i = 0; i < posts.rows.length; i++) {
            const files = await db.query("SELECT * FROM file WHERE post_id = $1", [posts.rows[i].id])
            if (files) {
                for (let i = 0; i < files.rows.length; i++) {
                    filePaths.push({
                        path: files.rows[i].path.replace('\\', "/"),
                        postId: files.rows[0].post_id})
                }
            }
        }
        result.json({posts: posts.rows, filePaths})
    }
}

module.exports = new PostController()