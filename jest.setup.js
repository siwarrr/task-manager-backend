module.exports = async () => {
    const mongoose = require('mongoose');

    afterAll(async () => {
        await mongoose.connection.close();
    });
     
};
