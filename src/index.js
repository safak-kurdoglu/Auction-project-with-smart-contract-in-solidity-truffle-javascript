const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
var contract;


var donatedAmounts = [0,0,0];


app.post("/create-contract", (req, res) => {
    contract = new web3.eth.Contract(req.body.abi, req.body.contractAddress);
    res.send("contract created successfully.");
});  

app.post("/push-donor", (req, res) => {
    contract.methods.pushDonor(req.body.donor).send({from:req.body.ownerAdress});
    res.send("donor added successfully.");
});

app.post("/finish", (req, res) => {
    contract.methods.finishDonation().send({from:req.body.ownerAdress});
    res.send("Donation process finished successfully.");
});

app.get("/get-datas", (req, res) => {
    res.send({
        donatedAmounts : donatedAmounts
    }); 
});

app.post("/update-amounts", (req, res) => {
    donatedAmounts = req.body.donatedAmounts;
    res.send("Data updated successfully.");
});

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

