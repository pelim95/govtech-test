/* istanbul ignore file */

function getRegisteredStudents(students = []) {
    return {students: students};
}

function getMentionedStudents(students = []) {
    const uniqueEmails = [...new Set(students.map(student => student.trim()))];
    return {
        recipients: uniqueEmails,
    };
}

module.exports = {getRegisteredStudents, getMentionedStudents};
