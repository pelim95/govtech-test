const {describe, test, expect, beforeEach} = require('@jest/globals');
const {ValidationError, AppError, NotFoundError} = require('../../util/appError');

const teachersData = require('../fixtures/teachers.json');
const studentsData = require('../fixtures/students.json');
const scenarios = require('../fixtures/testScenarios.json');

const mockDatabase = {
    getTeacherByEmail: jest.fn(),
    createTeacher: jest.fn(),
    createStudent: jest.fn(),
    getStudentByEmail: jest.fn(),
    getTeacherByEmails: jest.fn(),
    getStudentByEmails: jest.fn(),
    updateStudent: jest.fn()
};

jest.mock('../../service/dbService', () => {
    return jest.fn(() => mockDatabase);
});

jest.mock('../../util/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-1234')
}));

const databaseService = require('../../service/dbService');
const logger = require('../../util/logger');
const {v4: uuidv4} = require('uuid');
const {registerStudents, getCommonStudents, suspendStudent, notifyStudents} = require('../../service/operationService');

describe('registerStudents', () => {
    const mockDatabase = databaseService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('register with existing teacher', async () => {
        // Arrange
        const mockTeacher = {
            ...teachersData.existingTeacher,
            addStudents: jest.fn().mockResolvedValue(true)
        };

        mockDatabase.getTeacherByEmail.mockResolvedValue(mockTeacher);
        mockDatabase.getStudentByEmail.mockResolvedValue(null);
        mockDatabase.createStudent.mockResolvedValue({id: 'student-123', email: 'student1@example.com'});

        // Act
        await registerStudents(scenarios.registerStudents.validRequest);

        // Assert
        expect(mockDatabase.getTeacherByEmail).toHaveBeenCalledWith(
            scenarios.registerStudents.validRequest.teacher
        );
        expect(mockDatabase.createTeacher).not.toHaveBeenCalled();
        expect(mockDatabase.getStudentByEmail).toHaveBeenCalledTimes(2);
        expect(mockDatabase.createStudent).toHaveBeenCalledTimes(2);
        expect(mockTeacher.addStudents).toHaveBeenCalledTimes(2);
    });

    test('register with new teacher', async () => {
        // Arrange
        const mockTeacher = {
            ...teachersData.newTeacher,
            addStudents: jest.fn().mockResolvedValue(true)
        };

        mockDatabase.getTeacherByEmail.mockResolvedValue(null);
        mockDatabase.createTeacher.mockResolvedValue(mockTeacher);
        mockDatabase.createStudent.mockResolvedValue({id: 'student-123', email: 'student1@example.com'});

        const requestData = {
            teacher: teachersData.newTeacher.email,
            students: studentsData.studentList
        };

        // Act
        await registerStudents(requestData);

        // Assert
        expect(mockDatabase.createTeacher).toHaveBeenCalledTimes(1);
    });

    test('invalid data', async () => {
        // Act & Assert
        await expect(registerStudents(scenarios.registerStudents.invalidRequest))
            .rejects.toThrow(ValidationError);
    });

    test('missing field', async () => {
        // Act & Assert
        await expect(suspendStudent(scenarios.registerStudents.missingField))
            .rejects.toThrow(ValidationError);
    });

    test('unexpected error', async () => {
        // Arrange
        mockDatabase.getTeacherByEmail.mockRejectedValue(new Error('DB connection failed'));

        // Act & Assert
        await expect(registerStudents(scenarios.registerStudents.validRequest))
            .rejects.toThrow(AppError);

        expect(mockDatabase.getTeacherByEmail).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalled();
    });
});

describe('getCommonStudents', () => {
    const mockDatabase = databaseService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('get students with single teacher', async () => {
        // Arrange
        mockDatabase.getTeacherByEmails.mockResolvedValue([
            teachersData.teacherWithStudents
        ]);

        // Act
        const result = await getCommonStudents(scenarios.getCommonStudents.singleTeacher);

        // Assert
        expect(mockDatabase.getTeacherByEmails).toHaveBeenCalledWith(
            scenarios.getCommonStudents.singleTeacher
        );
        expect(result).toEqual({
            students: ['student1@example.com', 'student2@example.com']
        });
    });

    test('get common students with multiple teacher', async () => {
        // Arrange
        mockDatabase.getTeacherByEmails.mockResolvedValue([
            teachersData.teacherWithStudents,
            teachersData.teacherWithStudents2
        ]);

        // Act
        const result = await getCommonStudents(scenarios.getCommonStudents.multipleTeachers);

        // Assert
        expect(result).toEqual({
            students: ['student2@example.com']
        });
    });

    test('teacher not found', async () => {
        // Arrange
        mockDatabase.getTeacherByEmails.mockResolvedValue([]);

        // Act & Assert
        await expect(getCommonStudents(scenarios.getCommonStudents.nonExistentTeacher))
            .rejects.toThrow(NotFoundError);
    });

    test('no students under teacher', async () => {
        // Arrange
        mockDatabase.getTeacherByEmails.mockResolvedValue([
            teachersData.teacherWithNoStudents
        ]);

        // Act
        const result = await getCommonStudents([teachersData.teacherWithNoStudents.email]);

        // Assert
        expect(result).toEqual({students: []});
    });
});

describe('suspendStudent', () => {
    const mockDatabase = databaseService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('suspend existing student', async () => {
        // Arrange
        mockDatabase.getStudentByEmail.mockResolvedValue(studentsData.normalStudent);
        mockDatabase.updateStudent.mockResolvedValue(undefined);

        // Act
        await suspendStudent(scenarios.suspendStudent.validRequest);

        // Assert
        expect(mockDatabase.getStudentByEmail).toHaveBeenCalledWith(
            scenarios.suspendStudent.validRequest.student
        );
        expect(mockDatabase.updateStudent).toHaveBeenCalledWith(
            studentsData.normalStudent.id,
            {status: 'SUSPENDED'}
        );
    });

    test('student not found', async () => {
        // Arrange
        mockDatabase.getStudentByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(suspendStudent(scenarios.suspendStudent.validRequest))
            .rejects.toThrow(NotFoundError);
        expect(mockDatabase.updateStudent).not.toHaveBeenCalled();
    });

    test('invalid request', async () => {
        // Act & Assert
        await expect(suspendStudent(scenarios.suspendStudent.invalidRequest))
            .rejects.toThrow(ValidationError);
    });

    test('missing field', async () => {
        // Act & Assert
        await expect(suspendStudent(scenarios.suspendStudent.missingField))
            .rejects.toThrow(ValidationError);
    });

    test('unexpected error', async () => {
        // Arrange
        mockDatabase.getStudentByEmail.mockResolvedValue(studentsData.normalStudent);
        mockDatabase.updateStudent.mockRejectedValue(new Error('DB update failed'));

        // Act & Assert
        await expect(suspendStudent(scenarios.suspendStudent.validRequest))
            .rejects.toThrow(AppError);
        expect(logger.error).toHaveBeenCalled();
    });
});

const extractMentionedEmails = jest.fn();

describe('notifyStudents', () => {
    const mockDatabase = databaseService();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('get notification list', async () => {
        // Arrange
        const mentionedEmails = ['student1@example.com', 'student2@example.com'];
        extractMentionedEmails.mockReturnValue(mentionedEmails);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue(
            studentsData.mentionedStudents
        );

        // Act
        const result = await notifyStudents(scenarios.notifyStudent.validNotification);

        // Assert
        expect(mockDatabase.getTeacherByEmail).toHaveBeenCalledWith(
            scenarios.notifyStudent.validNotification.teacher
        );
        expect(result).toEqual({
            recipients: expect.arrayContaining([
                'active1@example.com',
                'active2@example.com',
                'student1@example.com',
                'student2@example.com'
            ])
        });
        expect(result.recipients).not.toContain('suspended1@example.com');
    });

    test('get notification list except suspended from students', async () => {
        // Arrange
        const mentionedEmails = [];
        extractMentionedEmails.mockReturnValue(mentionedEmails);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue([]);

        const data = {
            teacher: 'teacher@example.com',
            notification: 'Hello everyone!'
        };

        // Act
        const result = await notifyStudents(data);

        // Assert
        expect(result.recipients).toEqual(
            expect.arrayContaining(['active1@example.com', 'active2@example.com'])
        );
        expect(result.recipients).not.toContain('suspended1@example.com');
    });

    test('get notification list except suspended from mentioned', async () => {
        // Arrange
        const mentionedEmails = ['student1@example.com', 'suspended@example.com'];
        extractMentionedEmails.mockReturnValue(mentionedEmails);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue(
            studentsData.mixedStatusStudents
        );

        const data = {
            teacher: 'teacher@example.com',
            notification: 'Hello @student1@example.com @suspended@example.com'
        };

        // Act
        const result = await notifyStudents(data);

        // Assert
        expect(result.recipients).toContain('student1@example.com');
        expect(result.recipients).not.toContain('suspended@example.com');
    });

    test('get notification list with no mentions', async () => {
        // Arrange
        extractMentionedEmails.mockReturnValue([]);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue([]);

        // Act
        const result = await notifyStudents(scenarios.notifyStudent.notificationWithNoMentions);

        // Assert
        expect(result).toEqual({
            recipients: expect.arrayContaining(['active1@example.com', 'active2@example.com'])
        });
    });

    test('get notification list for all suspended', async () => {
        // Arrange
        extractMentionedEmails.mockReturnValue([]);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithNoActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue([]);

        const data = {
            teacher: 'teacher2@example.com',
            notification: 'Hello everyone!'
        };

        // Act
        const result = await notifyStudents(data);

        // Assert
        expect(result.recipients).toEqual([]);
    });

    test('teacher not found', async () => {
        // Arrange
        mockDatabase.getTeacherByEmail.mockResolvedValue(null);

        // Act & Assert
        await expect(notifyStudents(scenarios.notifyStudent.validNotification))
            .rejects.toThrow(NotFoundError);
        await expect(notifyStudents(scenarios.notifyStudent.validNotification))
            .rejects.toThrow('No teacher found');
    });

    test('students not found', async () => {
        // Arrange
        const mentionedEmails = ['nonexistent@example.com'];
        extractMentionedEmails.mockReturnValue(mentionedEmails);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue(null);

        // Act & Assert
        await expect(notifyStudents(scenarios.notifyStudent.validNotification))
            .rejects.toThrow(NotFoundError);
        await expect(notifyStudents(scenarios.notifyStudent.validNotification))
            .rejects.toThrow('No student records found');
    });

    test('invalid request', async () => {
        // Act & Assert
        await expect(notifyStudents(scenarios.notifyStudent.invalidNotification))
            .rejects.toThrow(ValidationError);
    });

    test('missing teacher', async () => {
        // Act & Assert
        await expect(notifyStudents(scenarios.notifyStudent.missingTeacher))
            .rejects.toThrow(ValidationError);
    });

    test('duplicates email', async () => {
        // Arrange
        const mentionedEmails = ['active1@example.com'];
        extractMentionedEmails.mockReturnValue(mentionedEmails);

        mockDatabase.getTeacherByEmail.mockResolvedValue(
            teachersData.teacherWithActiveStudents
        );
        mockDatabase.getStudentByEmails.mockResolvedValue([
            {id: 'student-1', email: 'active1@example.com', status: 'NORMAL'}
        ]);

        const data = {
            teacher: 'teacher@example.com',
            notification: 'Hello @active1@example.com'
        };

        // Act
        const result = await notifyStudents(data);

        // Assert
        const emailCount = result.recipients.filter(e => e === 'active1@example.com').length;
        expect(emailCount).toBe(1);
    });

    test('unexpected error', async () => {
        // Arrange
        mockDatabase.getTeacherByEmail.mockRejectedValue(
            new Error('DB connection failed')
        );

        // Act & Assert
        await expect(notifyStudents(scenarios.notifyStudent.validNotification))
            .rejects.toThrow(AppError);
        expect(logger.error).toHaveBeenCalled();
    });
});