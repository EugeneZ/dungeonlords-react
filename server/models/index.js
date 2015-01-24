var normalizedPath = require('path').join(__dirname, './');

require('fs').readdirSync(normalizedPath).forEach(function(file) {
    if (file === 'index') {
        return;
    }
    require('./' + file);
});