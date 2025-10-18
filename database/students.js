module.exports = (sequelize, DataTypes) => {
    const Students = sequelize.define('Students', {
        id: {
            type: DataTypes.STRING(256),
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(256),
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'NORMAL',
        }
    }, {
        tableName: 'students',
        timestamps: false,
    });

    Students.associate = (models) => {
        Students.belongsToMany(models.Teachers, {
            through: 'TeacherStudents',
            foreignKey: 'studentId'
        });
    };

    return Students;
};