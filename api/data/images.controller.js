const AWS = require("aws-sdk");
const config = require("../../config");

const s3Client = new AWS.S3({ ...config.s3 });

const saveImage = (imageData, fileName) => {
  return s3Client
    .putObject({
      Body: imageData,
      Bucket: "sellProducts",
      Key: `images/${fileName}`,
    })
    .promise();
};

module.exports = {
  saveImage,
};
