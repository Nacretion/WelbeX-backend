const express = require("express")
const config = require("config")
const cors = require("cors")
const multer = require("multer")
const bodyParser= require('body-parser')

const userRouter = require("./routes/user.routes")
const postRouter = require("./routes/post.routes")
const fileRouter = require("./routes/file.routes")

const corsOptions = {origin: '*'}


const PORT = config.get("port") || 5000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.'
        const newFileName = file.fieldname + '-' + uniqueSuffix + file.originalname.split(".").pop()
        cb(null, newFileName)
    }
})

const upload = multer({storage: storage })
const app = express()

app.use(cors(corsOptions))

app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(upload.any())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use("/api", userRouter)
app.use("/api", postRouter)
app.use("/", fileRouter)

app.listen(PORT, () => console.log("started successfully on port", PORT))