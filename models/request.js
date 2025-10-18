const Joi = require('joi');

const registerStudentsDto = Joi.object({
    teacher: Joi.string().email().required(),
    students: Joi.array().items(
        Joi.string().email().required()
    ).min(1).required()
});

const suspendStudentDto = Joi.object({
    student: Joi.string().email().required()
})

const notifyStudentsDto = Joi.object({
    teacher: Joi.string().email().required(),
    notification: Joi.string().required()
})

module.exports = { registerStudentsDto, suspendStudentDto, notifyStudentsDto };