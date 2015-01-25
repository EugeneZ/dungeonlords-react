module.exports = {
    getInitialData: function(key) {
        var retval = null;
        try {
            Array.prototype.slice.call(document.getElementsByTagName('script')).forEach(function(script){
                var searchAttr = script.attributes.getNamedItem('data-initial-data');
                if (searchAttr) {
                    var obj = JSON.parse(searchAttr.value);
                    if (obj && key in obj) {
                        retval = obj[key];
                    }
                }
            });
        } catch(e) {}

        return retval;
    }
};