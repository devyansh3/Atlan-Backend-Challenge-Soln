const express = require('express')
//import named export of google
const {google} = require("googleapis")
const app = express()
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
const port = 3000

require("dotenv").config();

const accountSid = 'ACd3ba9fb9061a43f22deb015ba4f95370'; 
const authToken = '87c77e960027b9989cb77482cf9b47a3'; 
const twclient = require('twilio')(accountSid, authToken); 




//loading the form page as home page 
app.get("/", (req, res) => {
    //render the form on get request
    res.render("index");
})

app.post('/', async (req, res) => {

    //getting the user input from the form
    const {name,email, phone, feedback} = req.body;

    //logic to interact google api

    //create an auth object
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets" //url to google sheets api
    })

//create client instance for auth
    const client = await auth.getClient(); //google makes request to oauth and gives a client object back


    //instence of google sheets api
    const googleSheets = google.sheets({
        version: "v4",
        auth: "client"
    })

    const spreadsheetId = "1yoDMppyUdWKNIFCB91I7AEwVVwBtY8-r7PcAlLqAAe0";

    //get meta data about the spreadsheet

    const metadata = await googleSheets.spreadsheets.get({
        auth: auth,
        spreadsheetId: spreadsheetId

    })

    //read the data from the spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        //passing the range (sheetname) to be retrived
        range: "Sheet1"
    })

    //write rows , send form data to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        //specifying which columns to write to in the spreasheet
        range: "Sheet1",
        //send the data as the user enters it
        valueInputOption: "USER_ENTERED",
        resource: {
            //values is an array as we can send multiple rows at once, handles the case of parallel post request of form data
            values: [
                [name, email, phone, feedback]
            ]
        }
    })

    //function to send confirmation sms to user after filling the form and sending the data to google sheets
    // const sendSms = await fast2sms.sendMessage({
    //     authorization: process.env.API_KEY,
    //     message: feedback,
    //     numbers: [phone]
    // })

    // console.log(sendSms)

    // twilioClient.messages.create({
    //     body: "hello from node",
    //     to: '+919815083150',
    //     from : process.env.senderNo
    // })
    // .then((message) => console.log(message.sid))

    twclient.messages 
      .create({ 
         body: feedback,  
         messagingServiceSid: 'MG7dd69e9a8656c07885693cabb0beb0b3',      
         to: phone 
       }) 
      .then(message => console.log(message.sid)) 
      .done();


    res.send('<h1>successfully sent data to google sheets!</h1><a target="blank" href="https://docs.google.com/spreadsheets/d/1yoDMppyUdWKNIFCB91I7AEwVVwBtY8-r7PcAlLqAAe0/edit#gid=0">go to sheets</a> <a href="http://localhost:3000/">submit another response</a>')
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})