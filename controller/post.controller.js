
const db = require("../database")
const fs = require("fs")
const fsPromises = fs.promises

class  PostController {
    async createPost(request, result) {
        const {title, content, userId} = request.body
        const files = request.files
        let newFiles = []
        if (title && content && userId) {
            const newPost = await db.query(
                "INSERT INTO post (title, content, user_id) values ($1, $2, $3) RETURNING *",
                [title, content, userId])
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
                    filePaths.push(files.rows[i].path.replace('\\', "/"))
                }
            }
        }

        console.log(filePaths)
        result.json({posts: posts.rows, filePaths})
    }

    async getPostsByUser(request, result){
        const id = request.query.id
        const posts = await db.query(
            "SELECT * FROM post WHERE user_id = $1",
            [id])
        result.json(posts.rows)
    }
}

module.exports = new PostController()