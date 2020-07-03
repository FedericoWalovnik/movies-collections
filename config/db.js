const moongose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await moongose.connect(db);

    console.log('Database connected...');
  } catch (error) {
    console.error(error.message);
    //exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
