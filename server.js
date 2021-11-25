let express = require("express");
let app = express();
let router = require("./router/main")(app);
let multer = require("multer");
const fs = require("fs");
const python = process.platform === "linux" ? "python3" : "python";
let textFilePath;
// const bodyParser = require("body-parser");

// dev
const dev = false;

// python script process
const path = require("path");
const spawn = require("child_process").spawn;

// filename converting
let uploadfile;

let _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const output = Date.now() + "-" + file.originalname;
    cb(null, output);
    spawn("python", [
      "./maskdetective/detect.py",
      "--project",
      "views/runs",
      "--name",
      "exp",
      "--exist-ok",
      "--source",
      "uploads/" + output,
      "--img-size",
      "320",
      "--conf",
      "0.4",
      "--weights",
      "./maskdetective/weights/best.pt",
      "--save-txt",
      "--conf",
      "0.8",
    ]);
    uploadfile = output;
  },
});

// upload
let upload = multer({ storage: _storage });

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// js path
app.use("/script", express.static(__dirname + "/script"));

// limit
app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    limit: "5mb",
    extended: true,
  })
);

// post request using uplaod
app.post("/upload", upload.single("upload-img"), function (req, res) {
  console.log(req.file);
  const filePath = path.join(__dirname, "./views/runs/exp/", uploadfile);
  // console.log(filePath);
  textFilePath = path.join(
    __dirname,
    "./views/runs/exp/labels",
    `${uploadfile.slice(0, -4)}.txt`
  );

  console.log(textFilePath);

  const startTime = new Date();
  const intervalId = setInterval(function () {
    // 일정 간격마다 request 보냄
    fs.readFile(filePath, (err, data) => {
      // if (err) throw err;
      if (data) {
        // 데이터가 생성되면 사용자에게 데이터 전송 -> 타이머 종료 -> 라벨 분석 -> wav
        // console.log(data);
        // res.send(`<img src="runs/exp/${uploadfile}"/>`);
        res.send(`<!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
              href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
              rel="stylesheet"
            />
            <script
              src="https://code.jquery.com/jquery-2.2.4.min.js"
              integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
              crossorigin="anonymous"
            ></script>
            <link rel="stylesheet" href="css/styles.css" type="text/css" />
        
            <title>Mask Detective</title>
          </head>
          <body>
            <div class="title">
              <h1><a href="./">Mask Detective</a></h1>
            </div>
        
            <div class="file-upload">
              <form action="./upload" method="post" enctype="multipart/form-data">
                <label for="file-selection-button" class="upload-label"
                  >Select File</label
                >
                <input
                  type="file"
                  name="upload-img"
                  accept="image/*"
                  id="file-selection-button"
                />
                <input type="submit" value="Upload" class="upload-button" />
              </form>
            </div>
        
            <img src="runs/exp/${uploadfile}" />
          </body>
        </html>
        `);

        console.log(`It took ${(new Date() - startTime) / 1000}s`);

        clearInterval(intervalId);
        const textFileContent = fs
          .readFileSync(textFilePath)
          .toString()
          .trim()
          .split("\n");

        console.log(textFileContent);
        for (let i = 0; i < textFileContent.length; i++) {
          // console.log(textFileContent[i].split(" ")[0]);
          if (textFileContent[i].split(" ")[0] === "1") {
            // play alarm.wav
          }
        }
      }
    });
  }, 500);
});

// post request using web-cam
app.post("/upload_c", function (req, res) {
  const startTime = Date.now();
  const dataURL = req.body.dataURL;
  const fileName = Date.now() + "-MD.png";
  const filePath = path.join(__dirname, "./views/runs/exp/", fileName);
  fs.writeFile(`uploads/${fileName}`, dataURL, "base64", function (err) {
    // console.log(err);
  });
  setTimeout(() => {
    spawn(python, [
      "./maskdetective/detect.py",
      "--project",
      "views/runs",
      "--name",
      "exp",
      "--exist-ok",
      "--source",
      "uploads/" + fileName,
      "--img-size",
      "320",
      "--conf",
      "0.4",
      "--weights",
      "./maskdetective/weights/best.pt",
      "--save-txt",
      "--conf",
      "0.8",
    ]);
    const intervalId = setInterval(function () {
      // send request every 500ms
      fs.readFile(filePath, (err, data) => {
        if (data) {
          res.send(`<!DOCTYPE html>
          <html lang="ko">
            <head>
              <meta charset="UTF-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="preconnect" href="https://fonts.gstatic.com" />
              <link
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
                rel="stylesheet"
              />
              <script
                src="https://code.jquery.com/jquery-2.2.4.min.js"
                integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
                crossorigin="anonymous"
              ></script>
              <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm" crossorigin="anonymous">
              <link rel="stylesheet" href="css/styles.css" type="text/css" />
          
              <title>Mask Detective</title>
              <style></style>
            </head>
            <body class="">
              <div class="title">
                <div id="loading" class=""></div>
                <a href="./"><h1></h1></a>
                <p></p>
              </div>
              <div class="image">
                <img src="./runs/exp/${fileName}" />
              </div>
              <input type="hidden" value="${fileName}" />
            </body>
            <script src="detectWaringMask.js"></script>
          </html>
          
          `);
          console.log(`It took ${(new Date() - startTime) / 1000}s`);

          clearInterval(intervalId);
        }
      });
    }, 500);
  }, 500);
});

// detect waring mask (ajax)
app.post("/detect", function (req, res) {
  const data = req.body.data;

  const filePath = path.join(
    __dirname,
    "./views/runs/exp/labels",
    `${data}txt`
  );

  let resData;
  let wearing = true;
  fs.stat(filePath, function (err, stat) {
    if (!dev) {
      if (err === null) {
        // file exists
        const label = fs.readFileSync(filePath).toString().trim().split("\n");

        for (let i = 0; i < label.length; i++) {
          if (label[i].split(" ")[0] === "1") {
            // someone doesn't wear a mask
            wearing = false;
            break;
          }
        }

        if (wearing) {
          resData = {
            data: "true",
          };
        } else {
          resData = {
            data: "false",
          };
        }
      } else {
        // file doesn't exist
        resData = {
          data: "error",
        };
      }
    } else {
      resData = {
        data: "error",
      };
    }

    res.send(resData);
  });
});

const port = 5000;
let server = app.listen(port, function () {
  console.log(`SERVER ON, port:${port}`);
  console.log(__dirname);
});

app.use(express.static("views"));
