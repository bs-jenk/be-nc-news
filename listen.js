const app = require("./app");

const { PORT = 8080 } = process.env;
app.listen(PORT, (err) => {
    if (err) {
        console.log(err, "listener error!");
    } else {
        console.log(`listening on ${PORT}...`);
    }
});
