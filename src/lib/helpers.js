const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // 10 es aceptada
    const hash = await bcrypt.hash(password,salt); // dato que retorna
    return hash;
};

helpers.matchPassword = async (password,savedPassword) => {
    try {
        return await bcrypt.compare(password,savedPassword);
    } catch(e) {
        console.log(e);
    }
}

module.exports = helpers;