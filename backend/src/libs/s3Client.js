/*
Purpose:
s3Client.js is a helper function that creates an Amazon Simple Service Solution (S3) client.
Inputs (replace in code):
- REGION
*/
// snippet-start:[GettingStarted.JavaScript.createclientv3]
import { S3Client } from "@aws-sdk/client-s3";
// Set the AWS Region.
const REGION = "us-east-1";
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });
export { s3Client };