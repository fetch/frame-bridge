var FrameBridge = (function() {

  var defaults = {
    targetOrigin: '*'
  };

  var listening = false;

  var listeners = {};

  var objectKeys = Object.keys || function(obj) {
    var keys = [], prop;
    for(prop in obj) {
      if(obj.hasOwnProperty(prop)) keys.push(prop);
    }
    return keys;
  };

  var extendObj = function() {
    var objects = [].slice.call(arguments, 0);
    var i = 0, prop, obj, res = objects.shift();
    for(; i < objects.length ; ++i ) {
      obj = objects[i];
      for(prop in obj) {
        if(obj.hasOwnProperty(prop)) res[prop] = obj[prop];
      }
    }
    return res;
  };

  var debug = function() {
    if(!FrameBridge.debug) return;
    var args = [].slice.call(arguments);
    args.unshift('[FrameBridge window: "' + window.name + '" title: "' + window.document.title + '"]');
    console.log.apply(console, args);
  };

  var processEvent = function(event) {
    try {
      var data = JSON.parse(event.data);
      debug('processEvent', data.method, data.params);
      if(data.method && listeners[data.method]) {
        var i = 0, methodListeners = listeners[data.method];
        for(;i < methodListeners.length; ++i) {
          methodListeners[i].call(null, data.params);
        }
      }
    } catch(e) {
      ('console' in window) && console.warn(e);
    }
  };

  var startListening = function() {
    listening = true;
    debug('startListening');
    window.addEventListener('message', processEvent, false);
  };

  var stopListening = function() {
    listening = false;
    debug('stopListening');
    window.removeEventListener('message', processEvent);
  };

  var FrameBridge = function(options) {
    this.options = extendObj({}, defaults, options || {});
  };

  extendObj(FrameBridge.prototype, {

    trigger: function(method, params, options) {
      options = extendObj({}, this.options, options || {});
      try {
        var target = options.target || parent;
        if(!('postMessage' in target) && ('contentWindow' in target) ) target = target.contentWindow;
        if(target) target.postMessage(JSON.stringify({
          method: method,
          params: params
        }), this.options.targetOrigin);
      } catch(e) {
        ('console' in window) && console.warn(e);
      }
    },

    on: function(method, callback) {
      if(!listening) startListening();
      listeners[method] = listeners[method] || [];
      listeners[method].push(callback);
      return this;
    },

    off: function(method, callback) {
      if(listeners[method]) {
        if(callback) {
          var index = listeners[method].indexOf(callback);
          if(~index) {
            listeners[method].splice(index, 1);
          }
        }
        if(!callback || listeners[method].length === 0) {
          delete listeners[method];
        }
        if(objectKeys(listeners).length === 0) {
          stopListening();
        }
      }
      return this;
    }

  });

  return FrameBridge;

}());
