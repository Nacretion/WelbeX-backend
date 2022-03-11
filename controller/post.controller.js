
const db = require("../database")

class  PostController {
    async createPost(request, result) {
        const {title, content, userId} = request.body
        const newPost = await db.query(
            "INSERT INTO post (title, content, user_id) values ($1, $2, $3) RETURNING *",
            [title, content, userId])
        result.json(newPost.rows[0])
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