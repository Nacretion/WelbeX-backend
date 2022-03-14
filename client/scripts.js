
const storageName = "userData"
const serverUrl = "http://localhost:5000/"
let token = null
let userId = null
let username = null
let modalRegister = false
let modalLogIn = false
let modalCreate = false

const imageTypes = [
    "JPG", "JPEG", "PNG", "ICO", "GIF", "TIFF", "WebP", "SVG", "CDR", "AI", "RAW"
]
const videoTypes = [
    "3g2", "3gp", "avi", "bin", "dat", "drv", "f4v", "flv", "gtp", "h264", "m4v", "mkv", "mod", "moov",
    "mov", "mp4", "mpeg", "mpg", "mts", "rm", "rmvb", "vid", "webm", "wm", "wmv"
]




// password length between 6 and 16
// english letters, numbers, _ and - chars
const isUsernameValid = (username) => {
    return /^[a-z0-9_-]{6,16}$/ig.test(username)
}

// more than 8 chars
// at least one number
// at least one special character
const isPasswordValid = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/g.test(password)
}


const register = async (domElement) => {
    const username = document.getElementsByName("username")[0].value
    const password = document.getElementsByName("password")[0].value
    const re_password = document.getElementsByName("re_password")[0].value

    if (username && password && re_password) {
        if (isUsernameValid && isPasswordValid && password === re_password) {
            const promise = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: 'POST',
                    body: JSON.stringify({username, password}),
                    headers: {'Content-Type': 'application/json'}
                })
                .then(response => response.json())
                .then(json => {
                    const newContent = document.createElement("h4")
                    newContent.style = "color: red"
                    newContent.appendChild(document.createTextNode(json))
                    domElement.parentElement.appendChild(newContent)
                    fetchLogin(username, password)
                })
        }

    }
}

const fetchLogin = async (Username, Password) => {
    let username = Username
    let password = Password

    if (!username && !password) {
        username = document.getElementsByName("username")[1].value
        password = document.getElementsByName("password")[1].value
    }
    if (username && password) {
        const promise = await fetch(
            "http://localhost:5000/api/login",
            {
                method: 'POST',
                body: JSON.stringify({username, password}),
                headers: {'Content-Type': 'application/json'}
            })
            .then(response => response.json())
            .then(json => {
                if (json.token) {
                    login(json.token, json.id)
                }
            })
    }
}

const login = (jwtToken, id) => {
    token = jwtToken
    userId = id

    localStorage.setItem(storageName, JSON.stringify({
        token: jwtToken,
        userId: id
    }))


    getUsername(id).then(() => addUsernameText(username))
    document.getElementById("createButton").style = ""

    swapButtons(
        "loginButton",
        "logoutButton",
        "logout()",
        "Log out")
    hideModal()
}

const logout = () => {
    token = null
    userId = null

    removeUsernameText()
    document.getElementById("createButton").style = "display: none"

    localStorage.removeItem(storageName)
    swapButtons(
        "logoutButton",
        "loginButton",
        "changeModal()",
        "Log in")
}


const createPost = async (domElement) => {

    const fileInput = document.getElementById("files")
    const message = document.getElementsByName("content")[0].value
    const userId = JSON.parse(localStorage.getItem(storageName)).userId

    if (message) {
        let data = new FormData()

        data.append('message', message);
        data.append('userId', userId);

        // Добавляем файлы из инпута к данным
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i]

            data.append('file', file)

        }

        // Отправляем файлы на сервер
        let promise = await fetch("http://localhost:5000/api/post", {
            method: "POST",
            body: data
        })
            .then(response => response.json())
            .then(json => {
                getPosts(userId)
            })
    }
}


const getUsername = async () => {
    const promise = await fetch("http://localhost:5000/api/user/" + userId)
        .then(response => response.json())
        .then(json => {
            username = json.username
        })
}

const getPosts = async (id) => {
    let posts = document.getElementsByClassName('post')
    const url = userId ? "http://localhost:5000/api/post?id=" + userId : "http://localhost:5000/api/posts"
    while(posts[0]) {
        posts[0].parentNode.removeChild(posts[0]);
    }
    const promise = await fetch(url)
        .then(response => response.json())
        .then(json => {
            return {posts: json.posts, filePaths: json.filePaths}

        })
        .then(fields => {
            fields.posts.map(post => {
                console.log(post.user_id)
                getUsername(post.user_id).then(() => addPost(post.id, post.date, post.message, username))
            })
            fields.filePaths.map(filePaths => {
                const url = serverUrl + filePaths.path
                const id = filePaths.postId
                const type = url.split(".").pop().toUpperCase()

                if (imageTypes.includes(type)) {
                    console.log(type, "image")
                    const image = document.createElement("img")
                    image.className = "postImage"
                    image.src = url
                    document.getElementById(id).appendChild(image)
                }
                else if (videoTypes.includes(type.toLowerCase())) {
                    console.log(type, "video")
                    const video = document.createElement("video")
                    const source = document.createElement("source")
                        // <source
                        //     src="video/duel.mp4"
                        //     type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                        // />
                    video.className = "postVideo"
                    video.controls = true
                    source.type = 'video/mp4'
                    source.src = url

                    video.appendChild(source)
                    document.getElementById(id).appendChild(video)
                }
            })
        })
}

//

const addPost = async (id, date, message, username) => {
    const tempDate = new Date(date).toLocaleDateString("ru-RU")

    const newPost = document.createElement("div")
    const newContent = document.createElement("h2")
    const newDate = document.createElement("h4")

    const correctDate = username + " " + tempDate + " " + new Date(date).toLocaleTimeString("ru-RU")

    newPost.className = "post"
    newPost.id = id
    newDate.appendChild(document.createTextNode(correctDate))
    newContent.appendChild(document.createTextNode(message))

    newPost.appendChild(newDate)
    newPost.appendChild(document.createElement("hr"))
    newPost.appendChild(newContent)
    document.getElementById("main").appendChild(newPost)
}

const addUsernameText = (username) => {

    const p = document.createElement("p")
    p.appendChild(document.createTextNode(username))
    p.className = "username";
    p.id = "usernameText";
    document.getElementById("header").prepend(p)
}

const removeUsernameText = () => {
    document.getElementById("usernameText").remove()
}

const swapButtons = (firstButton, secButton, onClick, innerText) => {

    document.getElementById(firstButton).remove()

    const button = document.createElement("button")
    button.id = secButton
    button.name = "authButton"
    button.setAttribute("onclick", onClick)
    button.innerText = innerText
    document.getElementById("header").appendChild(button)
}

const changeModal = (modal) => {
    if (!modal) {
        modalLogIn = true;
        return showModal()
    }
    if (modal === "reg") {
        modalLogIn = false;
        modalRegister = true;
    } else {
        modalRegister = false;
        modalLogIn = true;
    }
    showModal()
}

const showCreateModal = () => {
    modalCreate = true
    showModal()
}

const showModal = () => {
    event.stopPropagation();
    if (modalLogIn) {
        document.getElementById("log_in").classList.add("active")
        document.getElementById("register").classList.remove("active")
    }
    else if (modalRegister) {
        document.getElementById("log_in").classList.remove("active")
        document.getElementById("register").classList.add("active")
    } else {
        document.getElementById("postCreate").classList.add("active")
    }
}

const hideModal = () => {
    document.getElementById("log_in").classList.remove("active")
    document.getElementById("register").classList.remove("active")
    document.getElementById("postCreate").classList.remove("active")
}



if (localStorage.getItem(storageName)) {
    userId = JSON.parse(localStorage.getItem(storageName)).userId

    getUsername(userId).then(() => addUsernameText(username))


    swapButtons(
        "loginButton",
        "logoutButton",
        "logout()",
        "Log out")
} else {
    document.getElementById("createButton").style = "display: none"
}

getPosts()