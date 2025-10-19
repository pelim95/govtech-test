const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'GovTech Test API',
        description: 'API for managing teachers and students',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./main.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./main.js');
});