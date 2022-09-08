var conn = require("./db");
const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
//using body parser to encode the data into json format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const accountSid = 'ACd3ba9fb9061a43f22deb015ba4f95370'; 
const authToken = '87c77e960027b9989cb77482cf9b47a3'; 
const twclient = require('twilio')(accountSid, authToken); 

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

//route to get invalid records if any
app.get("/validate", function(req, res){
  conn.connect(function(err){
    if(err) throw err;
    var sql = "SELECT * FROM my_db.responses WHERE monthly_income < monthly_savings";
    conn.query(sql, function(err, result){
      if(err) throw err;
      // render the validate html file that contains invalid records if any
      res.render(__dirname + "/validate", {invalid: result})
      console.log(result);
    })

  })
})

app.post("/", (req, res, next) => {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var feedback = req.body.feedback;
  var monthly_income = req.body.monthly_income;
  console.log(monthly_income)
  var monthly_savings = req.body.monthly_savings;


  conn.connect(function (error, res) {
    if (error) throw error;

    var sql =
      "INSERT INTO my_db.responses(name, email, phone, feedback, monthly_income, monthly_savings ) VALUES('" +
      name +
      "','" +
      email +
      "','" +
      phone +
      "','" +
      feedback +
      "', '" +
      monthly_income +
      "', '" +
      monthly_savings +
      "');";

    let data = conn.query(sql, (err, ress) => {
      if (err) throw err;
      console.log(ress);
      return ress;
    });

    console.log(data);
    // next();
  });


  twclient.messages 
  .create({ 
     body: "hi " + name + " here are your details" + email + " monthly income :" + monthly_income + " monthly savings:  " + monthly_savings + " the feedback you entered: " + feedback,  
     messagingServiceSid: 'MG7dd69e9a8656c07885693cabb0beb0b3',      
     to: phone 
   }) 
  .then(message => console.log(message.sid)) 
  .done();

  res.sendFile(__dirname + "/thanks.html");

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

conn.connect(function (error) {
  if (error) throw error;

  console.log("connected to db");
  conn.query(`SELECT * FROM my_db.responses;`, function (err, res) {
    if (err) throw err;
    console.log(res);
  });
});
