const { format } = require('timeago.js')
const Handlebars = require('express-handlebars');

// var hbs = Handlebars.create({
//     // Specify helpers which are only registered on this instance.
//     helpers: {
//         ifCond: function (v1, v2, options) {
//             if (v1 === v2) {
//                 return options.fn(this);
//             }
//             return options.inverse(this);
//         },
//     }
// });

//  const handlebars = Handlebars.registerHelper('isdefined', function (value) {
//     return value !== undefined;
// });

const helpers = {};

helpers.timeago = (timestamp) => {

    return format(timestamp);
}

module.exports = helpers;