//import express, express router as shown in lecture code

import {Router} from 'express';
const router = Router();
import bcrypt from 'bcryptjs';
import middlewareMethods from '../middleware.js';
import helpers from '../helpers.js';
import normalUsers from '../data/normalUsers.js';
import salesUsers from '../data/salesUsers.js'
import feedback from '../data/feedback.js';
import { ObjectId } from 'mongodb';
import { solarSelection } from '../config/mongoCollections.js';

import fs from 'fs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.session.user.emailAddress;
    const dir = `./public/img/${username}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });



//refered https://www.youtube.com/watch?v=TDe7DRYK8vU this youtube video for passing the middlewear [timestamp - 26:30 ish ]
router.route('/').get( async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.render('homepage',{title: 'Solar Application Team 6'});
});

router.route('/aboutus').get(async(req, res) => {
  return res.render('aboutus', {title: 'About Us | Solaris T6'})
});

router.route('/services').get(async(req, res) => {
  return res.render('services', {title: 'Services | Solaris T6'})
});

router.route('/contactus').get(async(req, res) => {
  return res.render('contactus', {title: 'Contact Us | Solaris T6'})
});

router
  .route('/bookdemo')
  .get(async(req, res) => {
    return res.render('bookdemo', {title: 'BookDemo | Solaris T6', titledesc: 'Book A Demo'})
})
  .post(async (req, res) => {
    console.log("Post method of bookDemo is called");

    //console.log(req.body);
    let name = req.body.nameInput;
    let emailAddress = req.body.emailAddressInput;
    let phoneNumber = req.body.phoneNumberInput;
    let address = req.body.addressInput;
    let scheduleDate = req.body.scheduledateInput;
    let scheduleTime = req.body.scheduleTimeInput;


    try {
      const bookDemoID = await normalUsers.bookDemo(name, emailAddress, phoneNumber, address, scheduleDate, scheduleTime);


      let successMsg = `<div id="success" class="success" > Booking Details Successfully Recorded! Your Boooking Ref ID is : ${bookDemoID.referenceID}</div>`
      
      return res.render('bookdemo', {title: 'BookDemo | Solaris T6', titledesc: 'Book A Demo', success: successMsg})
    } catch (error) {

      let errorMsg = `<div id="error" class="error" > ${error}</div>`;
      console.log("Error caugth");
      console.log(error);
      res.status(400).render('bookdemo',{title: 'BookDemo | Solaris T6', titledesc: 'Book A Demo', error: errorMsg});
      
    }
  });

  router
    .route('/feedbackform')
    .get(async(req, res) => {
      return res.render('feedbackform', {title: 'Feedback | Solaris T6'})
  })
  .post(async (req, res) => {
    console.log("Post route method of feedback form is called");
    console.log(req.body);
    let navigation = req.body.navigation;
    let findInfo = req.body.findInfo;
    let encounterIssues = req.body.encounterIssues;
    let bookingSatisfaction = req.body.bookingSatisfaction;
    let bookingExperience = req.body.bookingExperience;
    let websiteSatisfaction = req.body.websiteSatisfaction;
    let recommendation = req.body.recommendation;
    let suggestions = req.body.suggestions;

    

    try {
      
      const feedbackID = await feedback.createFeedback(navigation, findInfo, encounterIssues, bookingSatisfaction, bookingExperience, websiteSatisfaction, recommendation, suggestions);

      let successMsg = `<div id="success" class="success" > Feedback Details Successfully Recorded! Your Feedback Ref ID is : ${feedbackID.referenceID}</div>`

      return res.render('feedbackform', {title: 'Feedback | Solaris T6', success: successMsg})


    } catch (error) {
      let errorMsg = `<div id="error" class="error" > ${error}</div>`;
      console.log("Error caugth");
      console.log(error);
      res.status(400).render('feedbackform',{title: 'Feedback | Solaris T6', error: errorMsg});
    }


  })

  router.route('/Image').get( async (req, res) => {
    return res.render('imageupload',{title: 'Upload Image'});
  });

router
  .route('/signup')
  .get(async(req, res) => {
    const today = new Date();
    const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    let countryList = helpers.countryCalculator(helpers.countryCodes)
    return res.render('signup', {title: 'Signup | Solaris T6', countryCodes: helpers.countryCodes, countryList: countryList, defaultCountry: helpers.defaultCountry, maxDate: maxDate})
}).post(async (req,res) => {
  console.log("Post method of Signup route is called!");
  console.log("Req body: ", req.body);

  try {
    let userType = req.body.userTypeInput;
    let firstName = req.body.firstNameInput;
    let middleName = req.body.middleNameInput;
    let lastName = req.body.lastNameInput;
    let emailAddress = req.body.emailAddressInput;
    let phoneNumber = req.body.phoneNumberInput;
    let address = req.body.addressInput;
    let city = req.body.cityInput;
    let state = req.body.stateInput;
    let country = req.body.countryInput;
    let dob = req.body.dobInput;
    let password = req.body.passwordInput;
    let countryList = helpers.countryCalculator(helpers.countryCodes);
    const today = new Date();
    const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`


    if(userType.toLowerCase()==="normal user"){
      const userID = await normalUsers.createUser(userType, firstName, middleName, lastName, emailAddress, phoneNumber, address, city, state, country, dob, password);
      let successMsg = `<div id="success" class="success" > User Registered Successfully! Ref ID is : ${userID}</div>`
      return res.render('signup', {title: 'Signup | Solaris T6', countryCodes: helpers.countryCodes, countryList: countryList, defaultCountry: helpers.defaultCountry, maxDate: maxDate, success: successMsg} )
    }else if(userType.toLowerCase() === "sales"){
      const userID = await salesUsers.createUser(userType, firstName, middleName, lastName, emailAddress, phoneNumber, address, city, state, country, dob, password);
      let successMsg = `<div id="success" class="success" > Sales User Registered Successfully! Ref ID is : ${userID}</div>`
      return res.render('signup', {title: 'Signup | Solaris T6', countryCodes: helpers.countryCodes, countryList: countryList, defaultCountry: helpers.defaultCountry, maxDate: maxDate, success: successMsg} )
    }

    
  } catch (error) {
      let errorMsg = `<div id="error" class="error" > ${error}</div>`;
      console.log("Error caugth");
      console.log(error);
      res.status(400).render('signup',{title: 'Signup | Solaris T6', countryCodes: helpers.countryCodes, countryList: countryList, defaultCountry: helpers.defaultCountry, maxDate: maxDate, error: errorMsg});
  }

})


router
  .route('/login')
  .get(middlewareMethods.loginMiddleware, async (req, res) => {
    //code here for GET
    //console.log("GET Login Route is called");
    res.render('login', {title: 'login'})
  })
  .post(async (req, res) => {
    //code here for POST
    console.log("Post route login is Triggered");

    console.log(req.body);

    let userType = req.body.userTypeInput;
    let emailAddress = req.body.emailAddressInput;
    let password = req.body.passwordInput;

    try {
      

      if(userType==="normal user"){
        console.log("primary user checkUser method will be triggered");
        const loginUser = await normalUsers.checkUser(emailAddress, password);
        req.session.user = {
          _id: loginUser._id,
          firstName: loginUser.firstName,
          middleName: loginUser.middleName,
          lastName: loginUser.lastName,
          emailAddress: loginUser.emailAddress,
          phoneNumber: loginUser.phoneNumber, 
          address: loginUser.address,
          city: loginUser.city, 
          state: loginUser.state, 
          country: loginUser.country, 
          dob: loginUser.dob,
          role: loginUser.role,
          progress: loginUser.progress,
          installation: loginUser.installation,
          agreement: loginUser.agreement,
          inspected: loginUser.inspected,
          finished: loginUser.finished
          
        };


  
        //redirecting based on the loginUser.role

        let installation = req.session.user.installation
      let agreement = req.session.user.agreement

      console.log("installation -> ", installation);
    console.log("agreement ->", agreement);

      return res.render('normaldashboard', {title: 'User Dashboard', username: req.session.user.firstName, installation: installation, agreement: agreement});

        
        
      }else if(userType==="sales"){ 
        // console.log("sales user checkUser method will be triggered");
        console.log("Sales User route is hit!");
        const loginUser = await salesUsers.checkUser(emailAddress, password);
        req.session.user = {
          _id: loginUser._id,
          firstName: loginUser.firstName,
          middleName: loginUser.middleName,
          lastName: loginUser.lastName,
          emailAddress: loginUser.emailAddress,
          phoneNumber: loginUser.phoneNumber, 
          address: loginUser.address,
          city: loginUser.city, 
          state: loginUser.state, 
          country: loginUser.country, 
          dob: loginUser.dob,
          role: loginUser.role
          
        };

        return res.render('salesdashboard', {title: 'Sales Dashboard', username: req.session.user.firstName});

      }

      //const loginUser = await users.checkUser(emailAddress, password);

      

      

    } catch (error) {
      //console.log("Login Error Caught: ", error);
      return res.status(400).render('login', {title: 'login', error: `<div id="error" class="error" > ${error}</div>`})
      //res.status(400).json({error: error})
    }


    //console.log({email: emailAddress, password: password});

  });

router.route('/scoutuser').get(middlewareMethods.protectedMiddleware, async (req, res) => {
  //code here for GET
  //console.log("Protected route is hit");
  if(req.session.user.role.toLowerCase()==='primary user'){
    let htmlCode = `<p><a href="/primaryuser">Click here to Access primary user Route</a></p>`
    res.render('scoutuser', {title: 'scout user', firstName: req.session.user.firstName, currentTime: new Date().toUTCString(), role: req.session.user.role, primaryuser: htmlCode})
  }else{
    res.render('scoutuser', {title: 'scout user', firstName: req.session.user.firstName, currentTime: new Date().toUTCString(), role: req.session.user.role})
  }
});

router.route('/primaryuser').get(middlewareMethods.adminMiddleware, async (req, res) => {
  //code here for GET
  console.log("Primary user route is hit");
  
  res.render('primaryuser', {title: 'primary user', firstName: req.session.user.firstName, currentTime: new Date().toUTCString()})
});

router.route('/error').get(async (req, res) => {
  //code here for GET
  res.render('error', {title: 'error'})
});



router.route('/logout').get(middlewareMethods.logoutMiddleware, async (req, res) => {
  //code here for 
  let firstName = req.session.user.firstName;
  req.session.destroy();
  res.render('logout', {title: 'logout', firstName: firstName});
});

router.route('/solarSelection').post(async(req,res)=>{
  console.log("Solar selection route is called");
  console.log(req.body);
  console.log(req.session.user.emailAddress);
  const solarSelectionData = {
    _id: new ObjectId(),
    userID: req.session.user.emailAddress,
    selection: [{
      name: "solar-panel",
      price: 5000
    }, {
      name: "solar-water-heater",
      price: 2000
    }]
  }
  //solarSelectionData._id = new ObjectId(); // Generate ObjectId on the server-side
  //solarSelectionData.userID = req.session.user.emailAddress;

  

  try {
    const solarSelectionCollection = await solarSelection();
    const result = await solarSelectionCollection.insertOne(solarSelectionData);
    console.log("hmm");
    const updatedUser = await normalUsers.hasListing(req.session.user.emailAddress);
    console.log("OK");

    req.session.user = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      middleName: updatedUser.middleName,
      lastName: updatedUser.lastName,
      emailAddress: updatedUser.emailAddress,
      phoneNumber: updatedUser.phoneNumber, 
      address: updatedUser.address,
      city: updatedUser.city, 
      state: updatedUser.state, 
      country: updatedUser.country, 
      dob: updatedUser.dob,
      role: updatedUser.role,
      progress: updatedUser.progress,
      installation: updatedUser.installation,
      agreement: updatedUser.agreement,
      inspected: updatedUser.inspected,
      finished: updatedUser.finished
    };

    console.log("New Progress -> ", req.session.user.progress);
    console.log("Installation ->", req.session.user.installation);



    res.render('success', {title: 'Solar Selection Successful', success: `<div id="success" class="success" > Successfully Recorded Solar Pannel Selection!</div>`})
  } catch (err) {
    console.error('Error inserting solarSelectionData:', err);
    res.status(500).json({ message: 'Error inserting solarSelectionData' });
  } 
})

router.route('/installationprogress').get(async (req, res)=>{
  let progress = req.session.user.progress;
  res.render('installationprogress', {title: "Installation Progress Bar", progress: progress})
});

router.route('/agreement').get(async (req, res)=>{
  
  res.render('agreement', {title: "User Agreement"})
});

router.route('/recordagreement').get(async (req, res)=>{
  console.log("Hey .............wtf");
  const updatedUser = normalUsers.agreementSigned(req.session.user.emailAddress);
  req.session.user = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    middleName: updatedUser.middleName,
    lastName: updatedUser.lastName,
    emailAddress: updatedUser.emailAddress,
    phoneNumber: updatedUser.phoneNumber, 
    address: updatedUser.address,
    city: updatedUser.city, 
    state: updatedUser.state, 
    country: updatedUser.country, 
    dob: updatedUser.dob,
    role: updatedUser.role,
    progress: updatedUser.progress,
    installation: updatedUser.installation,
    agreement: updatedUser.agreement,
    inspected: updatedUser.inspected,
    finished: updatedUser.finished
  };

  console.log("updatedUser ->", updatedUser.agreement);
  console.log("session ->", req.session.agreement);

  res.render('success', {title: 'Solar User Agreement Signed Successful', success: `<div id="success" class="success" > Successfully Signed SolarisT6 Application Agreement!</div>`})

})

router.route('/normaldashboard').get(async (req, res)=>{
  //let progress = req.session.user.progress;
  let installation = req.session.user.installation
  let agreement = req.session.user.agreement

  console.log("installation -> ", installation);
    console.log("agreement ->", agreement);
  res.render('normaldashboard', {title: 'User Dashboard', username: req.session.user.firstName, installation: installation, agreement: agreement})
});

router.post('/upload', upload.single('image'), (req, res) => {
  res.status(200).send('Image uploaded and saved.');
});

router.route('/viewallbookings').get(async (req, res) => {
  console.log("View All Bookings route is hit!");

  try {
    const bookings = await salesUsers.viewAllBookings();
    console.log("All Bookings -> ", bookings);

    res.render('viewallbookings', {title: 'View All Bookings', bookings: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

router.route('/viewallcustomers').get(async (req, res) => {
  console.log("View All Customers route is hit!");

  try {
    const customers = await salesUsers.viewAllCustomers();
    console.log("All customers -> ", customers);

    res.render('viewallcustomers', {title: 'View All Customers', customers: customers });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

router.route('/salesdashboard').get(async (req, res)=>{
  return res.render('salesdashboard', {title: 'Sales Dashboard', username: req.session.user.firstName});
})

router.route('/customerdetail/:emailAddress').get(async (req, res) => {
  const customerEmail = req.params.emailAddress;
  
  // You can now use the bookingId to fetch booking details or perform other actions.
  // For example, if you have a function called getBookingDetails, you can call it like this:
  const customerDetail = await salesUsers.getBookingDetails(bookingId);

  return res.render('bookingdetails', { title: 'Booking Details', booking: bookingDetails });
});






export default router;
