import { Response } from "express";

//1.succcess interface
export interface ApiSuccess<T= any>{
    success: true;
    statusCode:number;
    message:string;
    data:T;
}

//2. error interface
export interface ApiError{
    success: false;
    statusCode:number;
    message:string;
    error?: any;
}

//1. success function 
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
}


//2. error function
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
): void {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
}