var jes = require('./jes');

var str = jes.compile("<div><%=hello%></div>",{hello:'world'});
console.log(str);