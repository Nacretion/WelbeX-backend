const Pool = require('pg').Pool

const pool = new Pool({
    user: "hnfbdhrrbowwxm",
    password: "b753b63ee9bd56f9268c1544a63185704585461684d9844cce1544910a903cc7",
    host: "ec2-52-208-185-143.eu-west-1.compute.amazonaws.com",
    port: "5432",
    database: "d6a8iter1ebnsk"
})

module.exports = pool