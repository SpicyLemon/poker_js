//for storing all base objects
var TYPES = {
   //an easy way to memoize recursive functions.
   //example var fibonacci = TYPES.memoizer([0, 1], function(recur, n) {
   //   return recur(n - 1) + recur(n - 2);
   //});
   memoizer: function (memo, formula) {
      var recur = function (n) {
         var result = memo[n];
         if (typeof result !== 'number') {
            result = formula(recur, n);
            memo[n] = result;
         }
         return result;
      };
      return recur;
   },
   
   setting: function (spec) {
      var that = {},
          limiters, updaters;
      
      limiters = {
         reverse: function(mySpec) {
            if (mySpec.value > mySpec.max) {
               mySpec.d *= -1;
               mySpec.value = mySpec.max;
            }
            else if (mySpec.value < mySpec.min) {
               mySpec.d *= -1;
               mySpec.value = mySpec.min;
            }
         },
         reset: function(mySpec) {
            if (mySpec.value > mySpec.max) {
               mySpec.value = mySpec.min;
            }
            else if (mySpec.value < mySpec.min) {
               mySpec.value = mySpec.max;
            }
         },
         none: function(mySpec) {
         },
      };
      
      updaters = {
         none: function() {
         },
         'default': function(mySpec, n) {
            var i;
            for(i = 0; i < valueOrDefault(n, 1); i += 1) {
               mySpec.value += mySpec.d;
               mySpec.limiter(mySpec);
            }
         },
      };
      
      spec.min = valueOrDefault(spec.min, 0);
      spec.value = valueOrDefault(spec.value, spec.min);
      spec.max = valueOrDefault(spec.max, spec.value > spec.min ? spec.value - spec.min : spec.min);
      spec.d = valueOrDefault(spec.d, 0);
      
      spec.limiter = valueOrDefault(spec.limiter, limiters.reverse);      
      if (typeof(spec.limiter) === 'string' && typeof(limiters[spec.limiter]) === 'function') {
         spec.limiter = limiters[spec.limiter];
      }
      if (typeof(spec.limiter) !== 'function') {
         throw ("TYPES.setting: Invalid limiter" + (typeof(spec.limiter) === 'string' ? " '" + spec.limiter + "'. " : ". ") + "Valid options: '" + limiters.properties().join("', '") + "'. You can also define your own function(mySpec).");
      }
      
      spec.updater = valueOrDefault(spec.updater, updaters['default']);
      if (typeof(spec.updater) === 'string' && typeof(updaters[spec.updater]) === 'function') {
         spec.updater = updaters[spec.updater];
      }
      if (typeof(spec.updater) !== 'function') {
         throw ("TYPES.setting: Invalid updater" + (typeof(spec.updater) === 'string' ? " '" + spec.updater + "'. " : ". ") + "Valid options: '" + updaters.properties().join("', '") + "'. You can also define your own function(mySpec, n)");
      }
      
      that = addGetSet(that, spec, "value");
      that = addGetSet(that, spec, "min");
      that = addGetSet(that, spec, "max");
      that = addGetSet(that, spec, "d");      
      
      that.update = function(n) {
         spec.updater(spec, n);
      };
      
      return that;
   },
   
};

var addGetSet = function(that, spec, name) {
   nameCap = name.capitalize();
   that["get" + nameCap] = function() {
      return spec[name];
   };
   that["set" + nameCap] = function(newVal) {
      spec[name] = newVal;
   };
   return that;
};


/*****************************************************************************************************\
*            ^^^ TYPES                                                                                *
*                                                                             function vvv            *
\*****************************************************************************************************/


//create the "method" function to make prototype additions nicer
if (typeof Function.prototype.method !== 'function') {
   Function.prototype.method = function (name, func) {
      if (this.prototype[name]) {
         console.log("method '" + name + "' cannot be redefined.");
      }
      else {
         this.prototype[name] = func;
         return this;
      }
   };
}


//Add a curry method for creating functions based on other functions, with default values
Function.method('curry', function() {
   var slice = Array.prototype.slice,
       args = slice.apply(arguments), 
       that = this;
   return function () {
      //arguments isn't actually an array, and doesn't have concat.
      return that.apply(null, args.concat(slice.apply(arguments)));     
   };
});


/*****************************************************************************************************\
*            ^^^ function                                                                             *
*                                                                               object vvv            *
\*****************************************************************************************************/


//create a "create" function to create a new object from an existing one.
Object.method('create', function(o) {
   var F = function () {};
   F.prototype = o;
   return new F();
});


//create a "superior" method on all objects. It's similar to what "super" usually does.
Object.method('superior', function (name) {
   var that = this,
       method = that[name];
   return function () {
      return method.apply(that, arguments);
   };
});


Object.method('properties', function () {
   return getProperties(this);
});


/*****************************************************************************************************\
*            ^^^ object                                                                               *
*                                                                               string vvv            *
\*****************************************************************************************************/


String.method('capitalize', function() {
   return this.charAt(0).toUpperCase() + this.slice(1);
});


/*****************************************************************************************************\
*            ^^^ string                                                                               *
*                                                                               number vvv            *
\*****************************************************************************************************/


//add the integer method to numbers.
Number.method('integer', function() {
   return Math[this < 0 ? 'ceil' : 'floor'](this);
});


/*****************************************************************************************************\
*            ^^^ number                                                                               *
*                                                                                array vvv            *
\*****************************************************************************************************/


Array.method('contains', function(value) {
   return isIn(value, this);
});


/*****************************************************************************************************\
*            ^^^ array                                                                                *
*                                                                        handy methods vvv            *
\*****************************************************************************************************/


//get all the properties of an object.
var getProperties = function (obj) {
   var retval = [];
   for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
         retval.push(prop);
      }
   }
   return retval;
};


//a better way to sort.  Takes types into account.
var betterSort = function (a, b) {
   if (a === b) {
      return 0;
   }
   if (typeof a === typeof b) {
      return a < b ? -1 : 1;
   }
   return typeof a < typeof b ? -1 : 1;
};


//a nice easy way to sort objects.
//example: /* a is an array of objects */ a.sort(by('last', by('first')));
var by = function (name, minor) {
   return function (o, p) {
      if (typeof o === 'object' && typeof p === 'object' && o && p) {
         var retval = betterSort(o[name], p[name]);
         return typeof minor === 'function' && retval == 0 ? minor(o, p) : retval;
      }
      else {
         throw {
            name: 'Error',
            message: 'Expected an object when sorting by ' + name,
         };
      }
   };
};


//A good way to test if something's a number.
//isFinite will attempt to convert something to a number
//so we don't want to actually call it on a string or something.
//So this uses typeof to see if it's a number, then isFinite to 
// make sure it's not NaN or infinity.
var isNumber = function (value) {
   return typeof value === 'number' && isFinite(value);
};


//The best way to test if something is actually an array.
var isArray = function(value) {
   return value 
       && typeof value === 'object' 
       && typeof value.length === 'number'
       && !value.propertyIsEnumerable('length');
};


//same as perl's qw()
var qw = function(line) {
   return line.split(/\s+/);
};


//A way to initialize an array/matrix/whatever with a default value.
// dimensions can either be a single number (for an array) or an array of numbers.
// If it's an array of numbers, each number is a dimension.
// e.g. [3, 2] creates a 3 x 2 matrix (three rows, two columns)
//      [4, 8, 10] creates a 4 x 8 x 10 cube (four rows, eight columns, ten sheets)
var dim = function (dimensions, default_value) {
   var retval = [], i;
   if (!isArray(dimensions)) {
      dimensions = [ dimensions ];
   }
   for (i = 0; i < dimensions[0]; i += 1) {
      if (dimensions.length == 1) {
         retval[i] = default_value;
      }
      else {
         retval[i] = this.dim(dimensions.slice(1), default_value);
      }
   }
   return retval;
};


//Create an identity matrix of a given size.
var identity = function (size) {
   var retval = [].dim([size, size], 0), i;
   for(i = 0; i < size; i += 1) {
      retval[i][i] = 1;
   }
   return retval;
};


var valueOrDefault = function (value, defefaultValue) {
   return typeof value === 'undefined' ? defefaultValue : value;
};

var isIn = function(value, array) {
   var retval = false, el, i;
   for (i = 0; i < array.length; i += 1) {
      el = array[i];
      if (el === value) {
         retval = true;
         break;
      }
   }
   return retval;
};