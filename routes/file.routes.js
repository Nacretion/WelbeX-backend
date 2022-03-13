const Router = require("express")
const router = new Router()
const fileController = require("../controller/file.controller")

router.get('/uploads/:path', fileController.getFile)


module.exports = router