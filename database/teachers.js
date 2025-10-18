module.exports = (sequelize, DataTypes) => {
    const Teachers = sequelize.define('Teachers', {
        id: {
            type: DataTypes.STRING(256),
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(256),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'teachers',
        timestamps: false,
    });

    Teachers.associate = (models) => {
        Teachers.belongsToMany(models.Students, {
            through: 'TeacherStudents',
            foreignKey: 'teacherId'
        });
    };

    return Teachers;
};