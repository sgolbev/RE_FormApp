//get form data and send data to email and sms alarm, clean Version of routerD.js
// works!
// because of TILL_URL to send SMS this runs only on heroku
//gives error when runs locally

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');
const favicon = require('express-favicon');
const SGmail = require('@sendgrid/mail');

var Myport = process.env.PORT || 3000


// use the following code to serve images, CSS files, and JavaScript files in a directory named public
// make sure  path to them  don`t have  have 'public' directory
//app.use(express.static('public'))

var bodyParser     =         require("body-parser");
const fs 		= require('fs');
// set Till sms message api
var request = require("request-json");
var url = require("url");

//var TILL_URL="https://platform.tillmobile.com/api/send?username=66febb3cb3bf4b13bf43e5a574ba11&api_key=f0e4aab4af00454bc107da9f237b05f5c1c5a0dc"

var TILL_URL = url.parse(process.env.TILL_URL);
var TILL_BASE = TILL_URL.protocol + "//" + TILL_URL.host;
var TILL_PATH = TILL_URL.pathname;

if(TILL_URL.query != null) {
  TILL_PATH += "?"+TILL_URL.query;
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Home page route.
console.log(__dirname);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(favicon(__dirname + 'public/favicon.png'));

router.get('/', function (req, res) {
  // read text file sync to get owner Address
    var owner= fs.readFileSync("owner.txt");
    owner = owner.toString().split('\n');
    //access first property of Object
    var owner_address= owner[Object.keys(owner)[0]];

  res.render('rentalform',{address:owner_address});
}) // end get


router.post('/application',function(req,res){

  var parameters;
var parameters_values=req.body;
console.log("parameters_values");

console.log(typeof(parameters_values)); //object req.bod
console.log('Next print')

// this will make print parameters_values to  json string in  line

var parameters1=JSON.stringify(req.body, null);
console.log("JSON.parameters1 ");

console.log(typeof(parameters1));

filePath = "renatalform.txt"
console.log(' made txt file');

fs.writeFile(filePath,"" , function(err, data) {
  if(err) {throw err};
});

//access first property of Object
//to use in email subject
var tenat_name= parameters_values[Object.keys(parameters_values)[0]];
var key;
var formdata="";
for ( key in parameters_values) {
   formdata=formdata+key+":"+parameters_values[key]+`\r`+`\n`+"\r"+"\n";

  console.log(key, parameters_values[key]); // if no parameter , print empty line

  // async append create wrong order of parameters in txt file,  so use sync

    fs.appendFileSync(filePath, key +":" +parameters_values[key]+"\r"+"\n");

};//  end for i

// read text file sync to get owner email
  var owner= fs.readFileSync("owner.txt");
  owner = owner.toString().split('\n');
  //access first property of Object
  var owner_email= owner[Object.keys(owner)[1]];
  var owner_phone= owner[Object.keys(owner)[2]];


handleSendEmail(res,req);

function handleSendEmail(req, res) {

  console.log("start SendMail");
    // Not the movie transporter!
    // Input Api key or add to environment config
    SGmail.setApiKey('YOUR_API_KEY')

    const msg = {
    //  to: 'youremail@gmail.com',
      to: owner_email,
      from: 'SENDGRID_USERNAME@heroku.com',
      subject:'Rental Application'+" "+tenat_name, // Subject line
      text:formdata

    //  html: '<strong>easy to do anywhere on your Tesla with crossbow</strong>',
    };
    SGmail.send(msg, function(error,res){
        if(error){
            console.log(error);

          //  res.json({yo: 'error'});
        }else{
            console.log('Message sent ' );
            console.log(res.statusCode);
             console.log(res.body);
              console.log(res.headers);
             }
        }); // end SGmail.send
}  // end handleSendEmail

//send txt message
    request.createClient(TILL_BASE).post(TILL_PATH, {
    "phone": ["11111111111",owner_phone],
      "text": tenat_name+""+" sent application"
    }, function(err, res, body) {
      return console.log(res.statusCode);
    });
res.end("End writing  into file");
}); //end post par
router.get('/admin', function (req, res) {
  // read text file  with address,email, phone sync
  var owner= fs.readFileSync("owner.txt");
  owner = owner.toString().split('\n');
  //access first property of Object
  var owner_address= owner[Object.keys(owner)[0]];
  var owner_email= owner[Object.keys(owner)[1]];
  var owner_phone= owner[Object.keys(owner)[2]];
//var myaddress="Chaucer";
res.render('admin',{address:owner_address,
email:owner_email,
phone:owner_phone
});

})


app.post('/admin', function(req, res) {
      var owner  = {
         address: req.body.address,
         email:req.body.email,
         phone: req.body.phone
      };
      console.log (owner);
      filePath = "owner.txt";
      console.log(' made txt file');
      fs.writeFile(filePath,"" , function(err, data) {
        if(err) {throw err};

      });
      // print parameters into column
      var i;
      for ( i in owner) {
        console.log(i);
        fs.appendFile(filePath, owner[i]+"\r"+"\n", function(err, data) {
          if(err) {throw err};
        }); // end append
      };//  end for

  res.json( {message: 'admin data updated, you can go back to the main page/refresh browser or close the app.'});

                }); //end admin post

// APPLY router to our app without this app.use line it will not work !!!
//https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
app.use('/', router);
app.listen(Myport,function(){
console.log('server running on port ' + Myport);

});
