const express = require('express')
const app = express()
const port = 3000

const cors = require('cors')
//membuat route baru dengan method get yang beserta isinya 
app.use(cors())


const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public/images')))


const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({ extended: false}));
app.use(bodyPs.json());


const mhsRouter = require('./routes/mahasiswa');
app.use('/api/mhs',mhsRouter);

const jurusanRouter = require('./routes/jurusan');
app.use('/api/jurusan',jurusanRouter);

app.listen(port,() => {
    console.log(`aplikasi berjalan di http::localhost:${port}`)
})