const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require('cors');
app.use(cors());
app.use(express.json({ limit: "10mb" }));
let url = 'mongodb+srv://aakashdaryani50:BjfnRRtEz6lHeJKr@cluster0.vq2uhqc.mongodb.net/'
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
  

const signupSchema = new mongoose.Schema({
  First_Name: String,
  Last_Name: String,
  Email: String,
  Contact_No: String,
  Addresss: String,
  Password: String,
});
const user = mongoose.model("user", signupSchema);
const uploadImage = new mongoose.Schema({
 base64:String,
 type:String
});
const uploadImageModel = mongoose.model("uploadImageModel", uploadImage);
//To Upload Image in database
const uploadImageToDatabase = (body) =>{
  const obj = {
    base64:body.base64.toString("base64"),
    type:body.type
  }
  const data = new uploadImageModel(obj);
  return data.save()
    .then(() => {
       getUploadedImages();
    })
    .catch((error) => {
    });
}
const getUploadedImages = async() =>{
  try{
      const data = await uploadImageModel.find();
      return data;
  }
  catch(err){
  }
}
//For Sign up
const storeUser = (body) => {
  return user.findOne({ Email: body.Email })
    .then((foundUser) => {
      if (foundUser) {
        return { result: "User already exists" };
      } else {
        const obj = {
          First_Name: body.First_Name,
          Last_Name: body.Last_Name,
          Email: body.Email,
          Contact_No: body.Contact_No,
          Addresss: body.Addresss,
          Password: body.Password,
        };
        const data = new user(obj);
        return data.save()
          .then(() => {
            let body = `<h1>New User Login</h1><p>Name:-${data.First_Name} ${data.Last_Name}</p><p>Email :- ${data.Email}</p><p>Contact No :- ${data.Contact_No}</p><p>Address :- ${data.Addresss}</p>`
            sendMail('New User',body);
            return { result: "Success" };
          })
          .catch((error) => {
            return { result: "Error", Error: error };
          });
      }
    })
    .catch((error) => {
      return { result: "Error", Error: error };
    });
};
const checkUser = (body) => {
  return user.findOne({ Email: body.Email })
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.Password == body.Password) {
          return { result: "Success", response: "none" };
        }
        else {
          return { result: "Error", response: "Password Error" };
        }
      } else {
        return { result: "Error", response: "Username not found" };
      }
    })
    .catch((err) => {
      return { result: "Error", response: err };
    })
}

const sendMail = (sub, body) => {
  return new Promise((resolve, reject) => {
    let config = {
      service: 'gmail',
      auth: {
        user: 'aakashdaryani50@gmail.com',
        pass: 'uvszttrlwezacrbh'
      }
    }
    let transporter = nodemailer.createTransport(config);
    let message = {
      from: 'aakashdaryani50@gmail.com',
      to: 'avignatours@gmail.com',
      subject: sub,
      html: body
    }
    transporter.sendMail(message)
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
};

//For Login
app.post("/checkuser", (req, res) => {
  checkUser(req.body)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
})
//For Sign Up
app.post("/storeuser", (req, res) => {
  storeUser(req.body)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
//For Contact Us
app.post("/contactUs",(req,res)=>{
  let body = `<h1>Contact Us</h1><p>Name:-${req.body.Name}</p><p>Email:-${req.body.Email}</p><p>Contact No.:-${req.body.Phone}</p><p>Query:-${req.body.Query}</p>`
  let sub = 'Contact Us'
  sendMail(sub,body);
})
//For Booking Tickets
app.post("/bookTicketsFlight", (req, res) => {
  let body = `<h1>Book Air Tickets</h1><p>Type:${req.body.type}</p><p>Contact No:${req.body.phone}</p><p>From:${req.body.from}</p><p>To:${req.body.to}</p><p>Departure Date:${req.body.depadate}</p><p>Return Date:${req.body.retdate}</p><p>Adults:${req.body.adult}</p><p>Childrens:${req.body.child}</p><p>Infants:${req.body.infant}</p><p>Class:${req.body.class}</p>`;
  let sub = 'Book Air ticket';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
app.post("/bookCab", (req, res) => {
  let body = `<h1>Book Cab Tickets</h1><p>Type:${req.body.type}</p><p>Passanger:${req.body.passengers}</p><p>Contact No:${req.body.phone}</p><p>From:${req.body.from}</p><p>To:${req.body.to}</p><p> Date:${req.body.dateandtime}</p><p>Vchile Type:${req.body.vechileType}</p>`;
  let sub = 'Book Cab ticket';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
app.post("/bookHotel", (req, res) => {
  let body = `<h1>Book Hotel Tickets</h1><p>Type:${req.body.type}</p><p>Contact No:${req.body.phone}</p><p>city:${req.body.city}</p><p>email:${req.body.email}</p><p>Departure Date:${req.body.depadate}</p><p>Return Date:${req.body.retdate}</p><p>Adults:${req.body.adult}</p><p>Childrens:${req.body.child}</p><p>Infants:${req.body.infant}</p><p>Rooms:${req.body.rooms}</p>`;
  let sub = 'Book Hotel ticket';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
app.post("/submitPassportAssistance", (req, res) => {
  let body = `<h1>Passport Assistance</h1><p>Name:${req.body.fullName}</p><p>Passport Number:${req.body.passportNumber}</p><p>Contact No:${req.body.phoneNumber}</p><p>Email:${req.body.email}</p><p> Date:${req.body.dateOfBirth}</p>`;
  let sub = 'Passport Assistance';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
app.post("/submitVisaBook", (req, res) => {
  let body = `<h1>Visa Booking</h1><p>Name:${req.body.fullName}</p><p>Passport Number:${req.body.passportNumber}</p><p>Contact No:${req.body.phoneNumber}</p><p>Destination:${req.body.destination}</p><p> Date:${req.body.dateOfTravel}</p><p>Email:${req.body.email}</p>`;
  let sub = 'Visa Booking';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});
app.post("/submitTravelInsurance", (req, res) => {
  let body = `<h1>Travel Insurance</h1><p>Name:${req.body.fullName}</p><p>Passport Number:${req.body.passportNumber}</p><p>Contact No:${req.body.phoneNumber}</p><p>Destination:${req.body.destination}</p><p> Date:${req.body.dateOfTravel}</p><p>Email:${req.body.email}</p>`;
  let sub = 'Travel Insurance';
  sendMail(sub, body)
    .then(() => {
      res.send({ result: "Success" });
    })
    .catch((error) => {
      res.send({ result: "Error", Error: error });
    });
});

app.post("/uploadImage",(req,res)=>{
  uploadImageToDatabase(req.body);
})
app.get("/getImages", (req, res) => {
  getUploadedImages()
  .then((images) => {
    res.send(images);
  })
  .catch((error) => {
    res.status(500).send({ error: "Failed to get uploaded images" });
  });
});


app.listen(PORT, () => {
});
