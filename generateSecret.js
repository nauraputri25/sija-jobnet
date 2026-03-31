const bcrypt = require("bcryptjs");

const secret = "comneta@50@35";

bcrypt.hash(secret, 10).then(hash => {
    console.log("HASH SECRET KEY:");
    console.log(hash);
});