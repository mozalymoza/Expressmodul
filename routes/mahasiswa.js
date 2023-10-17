const express = require('express');
const router = express.Router();
const {body, validationResult } = require('express-validator');

const connection = require('../config/db');

const fs= require('fs')
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    destination: (req, file , cb)=> {
        cb(null, 'public/images')
    },
    filename: (req, file , cb)=> {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    //Mengecek jenis file yang diizinkan
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // ijinkan file
    }else {
        cb(new Error('Jenis file tidak diizinkan'), false);
    }
};
const upload= multer({storage: storage, fileFilter: fileFilter})

router.get('/', function (req, res){
    connection.query('select a.nama, b.nama_jurusan as jurusan'+
    ' from mahasiswa a left join jurusan b '+ 'on b.id_j=a.id_jurusan order by a.id_m desc', function(err, rows){
        if(err){
            return res.status(500).json({
                status:false,
                message: 'Server Failed',
            })
        }else{
            return res.status(200).json({
                status:true,
                message: 'Data Mahasiswa',
                data: rows
            })
        }
    })
});

router.post('/store', upload.fields([{ name: 'gambar', maxCount: 1 }, { name: 'swa_foto', maxCount: 1 }]) , [
    //validation
    body('nama').notEmpty(),
    body('nrp').notEmpty(),
    body('id_jurusan').notEmpty()
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.id_jurusan,
        gambar: req.files.gambar[0].filename, 
        swa_foto: req.files.swa_foto[0].filename 
        
    }
    connection.query('insert into mahasiswa set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else{
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})

router.get('/(:id)' , function (req, res){
    let id = req.params.id;
    connection.query(`select * from mahasiswa where id_m = ${id}` , function(err, rows){
        if (err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        
        }else{
            return res.status(201).json({
                status: true,
                message: 'Data Mahasiswa',
                data: rows[0]
            })
        }
    })
            
 })

 router.patch('/update/:id', upload.fields([{ name: 'gambar', maxCount: 1 }, { name: 'swa_foto', maxCount: 1 }])
 , [
     body('nama').notEmpty(),
     body('nrp').notEmpty(),
     body('id_jurusan').notEmpty()
 ], (req, res) => {
     const error = validationResult(req);
     if (!error.isEmpty()) {
         return res.status(422).json({
             error: error.array()
         });
     }
     let id = req.params.id;
     // Lakukan pengecekan apakah ada file yang diunggah
     let gambar = req.files['gambar'] ? req.files['gambar'][0].filename : null;
     let swa_foto = req.files['swa_foto'] ? req.files['swa_foto'][0].filename : null;
 
     connection.query(`select * from mahasiswa where id_m = ${id}`, function(err, rows) {
         if(err){
             return res.status(500).json({
                 status: false,
                 message: 'Server Error',
             })
         }
         if(rows.length ===0){
             return res.status(404).json({
                 status: false,
                 message: 'Not Found',
             })
         }
         const gambarLama = rows[0].gambar;
         const swa_fotoLama = rows[0].swa_foto;
 
         // hapus file lama jika ada
         if (gambarLama && gambar) {
             const pathGambar = path.join(__dirname, '../public/images', gambarLama);
             fs.unlinkSync(pathGambar)
         }
         if (swa_fotoLama && swa_foto) {
             const pathSwaFoto = path.join(__dirname, '../public/images', swa_fotoLama);
             fs.unlinkSync(pathSwaFoto)
         }
         
             let Data = {
                 nama: req.body.nama,
                 nrp: req.body.nrp,
                 id_jurusan: req.body.id_jurusan,
                 gambar: gambar,
                 swa_foto: swa_foto
             };
             connection.query(`UPDATE mahasiswa SET ? WHERE id_m = ${id}`, Data, function (err, rows) {
                 if (err) {
                     return res.status(500).json({
                         status: false,
                         message: 'Server Error',
                     });
                 } else {
                     return res.status(200).json({
                         status: true,
                         message: 'Update Mahasiswa succes..!'
                     })
                 }
             })
         })
     })


router.delete('/delete/(:id)', function(req, res){
    let id = req.params.id;
    connection.query(`select * from mahasiswa where id_m = ${id}`, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if(rows.length ===0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }
        const gambarLama = rows[0].gambar;
        const swa_fotoLama = rows[0].swa_foto;

        // hapus file lama jika ada
        if (gambarLama) {
            const pathFileLama = path.join(__dirname, '../public/images', gambarLama);
            fs.unlinkSync(pathFileLama)
        }
        if (swa_fotoLama) {
            const pathFileLama = path.join(__dirname, '../public/images', swa_fotoLama);
            fs.unlinkSync(pathFileLama)
        }

        
        connection.query(`delete from mahasiswa where id_m = ${id}`, function (err, rows) {
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                })
            }else{
                return res.status(200).json({
                    status: true,
                    message: 'Data has ben delete !',
                })
            }
        })

    })
    
})
module.exports = router;