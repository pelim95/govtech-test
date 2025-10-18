const {registerStudents, getCommonStudents, suspendStudent, notifyStudents} = require('../service/operationService');

async function registerStudentsReq(request, response, next) {
    try {
        await registerStudents(request.body);
        response.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function getCommonStudentsReq(request, response, next) {
    try {
        const teacherEmails= Array.isArray(request.query.teacher)
            ? request.query.teacher
            : [request.query.teacher];

        if (!teacherEmails[0]) {
            return response.status(400).json({ error: 'At least one teacher email is required.' });
        }

        const result = await getCommonStudents(teacherEmails);
        response.status(200).json(result).send();
    } catch (err) {
        next(err);
    }
}

async function suspendStudentReq(request, response, next) {
    try {
        await suspendStudent(request.body);
        response.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function notifyStudentsReq(request, response, next) {
    try {
        const result = await notifyStudents(request.body);
        response.status(200).json(result).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { registerStudentsReq, getCommonStudentsReq, suspendStudentReq, notifyStudentsReq };
