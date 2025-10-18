const express = require('express');
const createDbService = require('./service/dbService');
const operationRoutes = require('./routes/operationRoutes');
const {AppError} = require("./util/appError");
const logger = require("./util/logger");

const app = express();
const port = 3000;

app.use(express.json());

//! Initialize database
const database = createDbService();
database.init().then().catch(console.error);

//! Register routes
app.use('/api', operationRoutes);
app.use((req, res, next) => {
    next(new AppError('Route not found', 404));
});
app.use((err, req, res, next) => {
    if (err instanceof AppError) {
        logger.error(`${err.message} (status: ${err.statusCode})`);
        return res.status(err.statusCode).json({ error: err.message });
    }

    logger.error(`Unhandled exception: ${err.message}`, err);
    res.status(500).json({ error: 'Internal Server Error' });
});


//! Health check
app.get('/', (request, response) => {
    response.send('API is running');
});

app.listen(port, () => logger.info(`Server running at ${port}`));

module.exports = app;