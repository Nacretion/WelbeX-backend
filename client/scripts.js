
const storageName = "userData"
let token = null
let userId = null
let username = null
let modalRegister = false
let modalLogIn = false
let modalCreate = false

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
    localStorage.removeItem(storageName)
    swapButtons(
        "logoutButton",
        "loginButton",
        "changeModal()",
        "Log in")
}


const createPost = async (domElement) => {

    const fileInput = document.getElementById("files")
    const title = document.getElementsByName("title")[0].value
    const content = document.getElementsByName("content")[0].value
    const userId = JSON.parse(localStorage.getItem(storageName)).userId

    if (title && content) {
        let data = new FormData()

        data.append('title', title);
        data.append('content', content);
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
                getPosts()
            })
    }
    //
    // if (title && content) {
    //     const promise = await fetch(
    //         "http://localhost:5000/api/post",
    //         {
    //             method: 'POST',
    //             body: JSON.stringify({title, content, userId}),
    //             headers: {'Content-Type': 'application/json'}
    //         })
    //         .then(response => response.json())
    //         .then(json => {
    //             getPosts()
    //         })
    // }
}


const getUsername = async () => {
    const id = JSON.parse(localStorage.getItem(storageName)).userId
    const promise = await fetch("http://localhost:5000/api/user/" + id)
        .then(response => response.json())
        .then(json => {
            username = json.username
        })
}

const getPosts = async () => {
    let posts = document.getElementsByClassName('post')

    while(posts[0]) {
        posts[0].parentNode.removeChild(posts[0]);
    }

    const promise = await fetch("http://localhost:5000/api/posts")
        .then(response => response.json())
        .then(json => json.map(post => {
            addPost(post.id, post.title, post.content)
        }))
}


const addPost = (id, title, content) => {

    const newPost = document.createElement("div")
    const newTitle = document.createElement("h2")
    const newContent = document.createElement("h4")

    newPost.className = "post"
    newPost.id = id
    newTitle.appendChild(document.createTextNode(title))
    newContent.appendChild(document.createTextNode(content))

    newPost.appendChild(newTitle)
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
    let id = JSON.parse(localStorage.getItem(storageName)).userId

    getUsername(id).then(() => addUsernameText(username))


    swapButtons(
        "loginButton",
        "logoutButton",
        "logout()",
        "Log out")
}

getPosts()