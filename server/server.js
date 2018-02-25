const path = require('path'); //nodejs 内置module
const express = require('express');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

let app = express();

app.use(express.static(publicPath));

app.listen(port, () => {
    console.log(`Server is up on ${port}`);
});
