const { AppError, NotFoundError, ValidationError } = require('../util/appError');
const databaseService = require('./dbService');
const { registerStudentsDto, suspendStudentDto, notifyStudentsDto } = require('../models/request');
const { v4: uuidv4 } = require('uuid');
const { getRegisteredStudents, getMentionedStudents } = require('../models/response')
const logger = require('../util/logger');

const database = databaseService();

async function registerStudents(data) {
    let studentMail;
    try{
        const { error, value } = registerStudentsDto.validate(data);
        if (error) throw new ValidationError(error.message);

        const { teacher, students } = value;

        let teacherRecord = await database.getTeacherByEmail(teacher);
        if (!teacherRecord) {
            teacherRecord = await database.createTeacher({ id: uuidv4(), email: teacher });
            logger.info(`Created new teacher: ${teacher}`);
        }

        for (const studentEmail of students) {
            studentMail = studentEmail;
            let studentRecord = await database.getStudentByEmail(studentEmail);
            if (!studentRecord) {
                studentRecord = await database.createStudent({
                    id: uuidv4(),
                    email: studentEmail,
                    status: 'NORMAL'
                });
                logger.info(`Created new student: ${studentEmail}`);
            }

            logger.info('Available methods on teacherRecord:');
            logger.info(Object.getOwnPropertyNames(Object.getPrototypeOf(teacherRecord))
                .filter(name => name.includes('Student')));

            await teacherRecord.addStudents(studentRecord, {
                through: { id: uuidv4() }
            });
            logger.info(`Linked student ${studentEmail} to teacher ${teacher}`);
        }

        logger.info(`Successfully registered ${students.length} students for ${teacher}`);
    } catch (error) {
        console.error('========== ERROR DETAILS ==========');
        console.error('Student email:', studentMail);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('SQL:', error.sql);
        console.error('Parent error:', error.parent);
        console.error('Original error:', error.original);

        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Unexpected error on student registration.', { message: error.message, stack: error.stack });
        throw new AppError('Failed to register students.', 500, error.message);
    }
}

async function getCommonStudents(teacherList) {
    try{
        const teacherRecords = await database.getTeacherByEmails(teacherList);
        if (!teacherRecords.length) throw new NotFoundError('No teachers found');

        if (teacherRecords.length !== teacherList.length) {
            throw new NotFoundError('Some teachers not found');
        }

        const teacherStudents = teacherRecords.map(teacherRecord =>
            teacherRecord.Students.map(student => student.email)
        );

        const commonStudents = teacherStudents.reduce((common, currentTeacherStudents) => {
            return common.filter(email => currentTeacherStudents.includes(email));
        });

        return getRegisteredStudents(commonStudents);
    }catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Unexpected error on student retrieval.', { message: error.message, stack: error.stack });
        throw new AppError('Failed to retrieve students.', 500, error.message);
    }
}

async function suspendStudent(data) {
    try{
        const { error, value } = suspendStudentDto.validate(data);
        if (error) throw new ValidationError(error.message);

        const { student } = value;

        let studentRecord = await database.getStudentByEmail(student);
        if (!studentRecord) throw new NotFoundError('No student records found');

        await database.updateStudent(studentRecord.id, {status: 'SUSPENDED'});

        logger.info(`Successfully suspend ${studentRecord.email}`);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Unexpected error on student suspension.', { message: error.message, stack: error.stack });
        throw new AppError('Failed to suspend student.', 500, error.message);
    }
}

async function notifyStudents(data){
    try{
        const { error, value } = notifyStudentsDto.validate(data);
        if (error) throw new ValidationError(error.message);

        const { teacher, notification } = value;

        const emails = extractMentionedEmails(notification);

        let teacherRecord = await database.getTeacherByEmail(teacher);
        if (!teacherRecord) throw new NotFoundError('No teacher found');

        const activeStudents = teacherRecord.Students.filter(student => student.status !== 'SUSPENDED');

        const allEmails = [
            ...activeStudents.map(s => s.email),
            ...emails,
        ];

        logger.info(`Successfully retrieved list of students notification.`);

        return getMentionedStudents(allEmails);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Unexpected error on student notification retrieval.', { message: error.message, stack: error.stack });
        throw new AppError('Failed to retrieve notify students.', 500, error.message);
    }
}

function extractMentionedEmails(text) {
    return text
        .split(" ")
        .filter(word => word.startsWith("@"))
        .map(word => word.slice(1).trim());
}

module.exports = { registerStudents, getCommonStudents, suspendStudent, notifyStudents };
