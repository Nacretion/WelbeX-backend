let modalRegister = false
let modalLogIn = false


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
const showModal = () => {
    event.stopPropagation();
    if (modalLogIn) {
        document.getElementById("log_in").classList.add("active")
        document.getElementById("register").classList.remove("active")
    } else {
        document.getElementById("log_in").classList.remove("active")
        document.getElementById("register").classList.add("active")
    }
}
const hideModal = () => {
    document.getElementById("log_in").classList.remove("active")
    document.getElementById("register").classList.remove("active")
}


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
                })
        }
    }
}

const login = async (domElement) => {
    const username = document.getElementsByName("username")[1].value
    const password = document.getElementsByName("password")[1].value
    console.log(JSON.stringify({username, password}))
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
                const newContent = document.createElement("h4")
                newContent.style = "color: red"
                newContent.appendChild(document.createTextNode(json))
                domElement.parentElement.appendChild(newContent)
            })
    }
}


const getPosts = async () => {
    const promise = await fetch("http://localhost:5000/api/posts")
        .then(response => response.json())
        .then(json => json.map(post => {
            const newPost = document.createElement("div")
            const newTitle = document.createElement("h2")
            const newContent = document.createElement("h4")

            newPost.className = "post"
            newPost.id = post.id
            newTitle.appendChild(document.createTextNode(post.title))
            newContent.appendChild(document.createTextNode(post.content))

            newPost.appendChild(newTitle)
            newPost.appendChild(document.createElement("hr"))
            newPost.appendChild(newContent)
            document.getElementById("main").appendChild(newPost)
        }))

}

getPosts()

//console.log(JSON.parse(promise))