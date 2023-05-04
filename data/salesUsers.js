import {Router} from 'express';
import {ObjectId} from 'mongodb';
import {salesUsers} from '../config/mongoCollections.js'
import { bookDemos } from '../config/mongoCollections.js';
import { solarSelection } from '../config/mongoCollections.js';
import { normalUsers } from '../config/mongoCollections.js';
import helpers from '../helpers.js'

import bcrypt from 'bcryptjs';

const saltRounds = 12;

const router = Router();



export const createUser = async (
    userType,
    firstName,
    middleName,
    lastName,
    emailAddress,
    phoneNumber,
    address,
    city,
    state,
    country,
    dob,
    password
  ) => {
  
    console.log("Create User function of signup is called!!");
    console.log({ userType: userType, firstName: firstName, middleName: middleName, lastName: lastName, emailAddress: emailAddress, phoneNumber: phoneNumber, address: address, city: city, state: state, country: country, dob: dob, password: password});
    
    //check if inputs are empty or not
  
  
  
    try {
  
      
      
   
      //checking if this valid email id is already a user or not in our db
      const usersCollection = await salesUsers();
      const user = await usersCollection.findOne({emailAddress});

  
      if(user){
        throw `The email address - ${emailAddress} that you used to register as Sales user, already exist! please recheck your email and try registering, or else try loggin in if you already have an account as a Sales user!`
      }
  
      //Used professor's lecture code for password hashing
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      //since everything went well and nothing blew up !!so i will push it to the db
  
      let salesUserData = {
        _id: new ObjectId(),
        firstName: firstName, 
        middleName: middleName, 
        lastName: lastName, 
        emailAddress: emailAddress,
        phoneNumber: phoneNumber, 
        address: address,
        city: city, 
        state: state, 
        country: country, 
        dob: dob,
        role: userType,
        password: hashedPassword
      }
  
      const insertInfo = await usersCollection.insertOne(salesUserData);
  
      if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw 'Could not add user';
      }
  
      
  
      return salesUserData._id.toString();
  
  
    } catch (error) {
      throw error;
    }
  
  
  };

  export default {createUser}