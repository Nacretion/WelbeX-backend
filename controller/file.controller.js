const db = require("../database")
const fs = require("fs")
const fsPromises = fs.promises

const imageTypes = [
    "JPG", "JPEG", "PNG", "ICO", "GIF", "TIFF", "WebP", "SVG", "CDR", "AI", "RAW"
]
const videoTypes = [
    "3g2", "3gp", "avi", "bin", "dat", "drv", "f4v", "flv", "gtp", "h264", "m4v", "mkv", "mod", "moov",
    "mov", "mp4", "mpeg", "mpg", "mts", "rm", "rmvb", "vid", "webm", "wm", "wmv"
]

class  FileController {
    async getFile(request, result) {
        const path = "uploads" + "\\" + request.params.path
        const file = await db.query(
            "SELECT * FROM file WHERE path = $1",
            [path])
        if (file.rows[0]) {
            const path = file.rows[0].path
            const ext = path.split('.').pop()
            const stat = fs.statSync(path)
            const fileSize = stat.size
            const range = request.headers.range
            if (range) {
                const parts = range.replace(/bytes=/, "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
                const chunkSize = (end-start) + 1
                const file = fs.createReadStream(path, {start, end})
                const head = {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': imageTypes.includes(ext) ? 'image/' + ext : 'video/' + ext
                }
                result.writeHead(206, head)
                file.pipe(result)
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': imageTypes.includes(ext) ? 'image/' + ext : 'video/' + ext
                }
                result.writeHead(200, head)
                fs.createReadStream(path).pipe(result)
            }

            // fs.access(path, fs.constants.R_OK, (err) => {
            //     // если произошла ошибка - отправляем статусный код 404
            //     if (err) {
            //         result.statusCode = 404
            //         result.end('Resourse not found!')
            //     } else {
            //         fs.createReadStream(path).pipe(result)
            //     }
            // })
        } else result.status(404).json('Resourse not found!')
        //

    }
}

module.exports = new FileController()