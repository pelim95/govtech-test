module.exports = (sequelize, DataTypes) => {
    const TeacherStudents = sequelize.define('TeacherStudents', {
        id: {
            type: DataTypes.STRING(256),
            primaryKey: true,
        },
        teacherId: {
            type: DataTypes.STRING(256),
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        studentId: {
            type: DataTypes.STRING(256),
            allowNull: false,
            references: {
                model: 'students',
                key: 'id'
            }
        }
    }, {
        tableName: 'teacher_students',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['teacherId', 'studentId']
            }
        ]
    });

    return TeacherStudents;
};