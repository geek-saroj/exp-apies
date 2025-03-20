import { Request, Response } from "express";
// import User from "../models/User";
import multer from "multer";
// Controller to create a new user
const upload = multer();
export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    // const newUser = new User({ name, email });
    // await newUser.save();
    // res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Controller to get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    // const users = await User.find();
    // res.status(200).json(users);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getData = async (req: Request, res: Response) => {
  try {
    // Accessing the request data (body)
    const data = req.body;

    // Accessing request headers
    const headers = req.headers;

    console.log("Request Data:", data);
    // console.log("Request Headers:", headers);

    console.log("Uploaded Files:", req.files);

    // You can handle the data as needed here
    // For now, just send a response with the received data
    res.status(200).json({
      message: "Data received successfully",
      data: data, // you can send the data back in the response
      headers: headers, // optionally send the headers back
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
