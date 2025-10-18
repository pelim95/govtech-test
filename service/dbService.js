const database = require('../database/client');
const logger = require('../util/logger');
const {DatabaseError} = require("../util/appError");
const {Op} = require("sequelize");

function databaseService() {
    const { sequelize, Students, Teachers } = database;

    async function init() {
        try {
            await sequelize.authenticate();
            logger.info('Connected to database.');
            await sequelize.sync();
        } catch (err) {
            logger.error('Database initialization error:', err);
            throw new DatabaseError('Database initialization failed.');
        }
    }

    return {
        init,

        async getAllStudents() {
            return await Students.findAll({ include: Teachers });
        },

        async getStudentByEmail(email) {
            return await Students.findOne({ where: { email }, include: Teachers });
        },

        async createStudent(data) {
            return Students.create(data);
        },

        async updateStudent(id, data) {
            const [updated] = await Students.update(data, { where: { id } });
            return { updated };
        },

        async getStudentByEmails(emails){
            return await Students.findAll({ where: { email: { [Op.in]: emails } }, include: Teachers });
        },

        async deleteStudent(id) {
            const deleted = await Students.destroy({ where: { id } });
            return { deleted };
        },

        async getAllTeachers() {
            return await Teachers.findAll({ include: Students });
        },

        async getTeacherByEmail(email) {
            return await Teachers.findOne({ where: { email } , include: Students });
        },

        async getTeacherByEmails(emails){
            return await Teachers.findAll({ where: { email: { [Op.in]: emails } }, include: Students });
        },

        async createTeacher(data) {
            return Teachers.create(data);
        },

        async updateTeacher(id, data) {
            const [updated] = await Teachers.update(data, { where: { id } });
            return { updated };
        },

        async deleteTeacher(id) {
            const deleted = await Teachers.destroy({ where: { id } });
            return { deleted };
        }
    };
}

module.exports = databaseService;