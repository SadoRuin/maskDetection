var express = require('express')
var app = express()
var router = require('./router/main')(app)
var multer = require('multer')
const fs = require('fs')

// python script process 
const path = require('path')
const spawn = require('child_process').spawn

// filename converting
let uploadfile

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    const output = Date.now() + '-' + file.originalname
    cb(null, output)
    spawn('python', ['./maskdetective/detect.py', '--project', 'views/runs', '--name', 'exp', '--exist-ok', '--source', 'uploads/'+output, '--img-size', '320', '--conf', '0.4', '--weights', './maskdetective/weights/best.pt'])
    uploadfile = output
  }
})

// upload
var upload = multer({storage: _storage}) 

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

// 미들웨어인 upload.single이 콜백보다 먼저실행됨.
app.post('/upload', upload.single('upload-img'), function(req, res) { 
  console.log(req.file)
  const filePath = path.join(__dirname, "./views/runs/exp/", uploadfile)
  console.log(filePath)

  // 파일처리 때문에 9초 대기
  setTimeout( function() {
    fs.readFile(filePath, (err, data)=> {
      if (err) throw err
      console.log(data)
      res.end(data)
    })
  }, 9000)
})

var server = app.listen(3000, function() {
  console.log('SERVER ON')
  console.log(__dirname)
});

app.use(express.static('public'));
