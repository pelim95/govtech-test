const express = require('express');
const router = express.Router();
const {
    registerStudentsReq,
    getCommonStudentsReq,
    suspendStudentReq,
    notifyStudentsReq
} = require('../controller/operationController');

router.post('/register', registerStudentsReq);
router.get('/commonstudents', getCommonStudentsReq);
router.post('/suspend', suspendStudentReq);
router.post('/retrievefornotifications', notifyStudentsReq);

module.exports = router;
