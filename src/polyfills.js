// Just the polyfills we need; not the entire monster that is babel-polyfill

export function polyfill() {
    // Array polyfills
    if (!Array.from) {
        Array.prototype.from = function(object) {
            return [].slice.call(object);
        };
    }
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
            var k, currentElement,
                O = Object(this),
                len = parseInt(O.length, 10) || 0,
                n = parseInt(arguments[1], 10) || 0;
            if (len === 0) { return false; }
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0; }
            }
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    // String polyfills
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
};

