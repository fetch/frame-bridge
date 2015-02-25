var FrameBridge = (function(){

  var defaults = {
    targetOrigin: '*'
  };

  var extendObj = function(){
    var objects = [].slice.call(arguments, 0);
    var i = 0, prop, obj, res = objects.shift();
    for(; i < objects.length ; ++i ){
      obj = objects[i];
      for(prop in obj){
        if(obj.hasOwnProperty(prop)) res[prop] = obj[prop];
      }
    }
    return res;
  };

  var processEvent = function(listeners, event){
    try {
      var data = JSON.parse(event.data);
      if(data.method && listeners[data.method]){
        var i = 0, methodListeners = listeners[data.method];
        for(;i < methodListeners.length; ++i){
          methodListeners[i].call(null, data.params);
        }
      }
    }catch(e) {
      ('console' in window) && console.warn(e);
    }
  };

  var FrameBridge = function(options){
    var _this = this;
    this.options = extendObj({}, defaults, options || {});
    window.addEventListener('message', function(event){
      processEvent(_this.listeners, event);
    }, false);
  };

  extendObj(FrameBridge.prototype, {

    listeners: {},

    trigger: function(method, params, options){
      options = extendObj({}, this.options, options || {});
      try {
        var target = options.target || parent;
        if(!('postMessage' in target) && ('contentWindow' in target) ) target = target.contentWindow;
        if(target) target.postMessage(JSON.stringify({
          method: method,
          params: params
        }), this.options.targetOrigin);
      }catch(e){
        ('console' in window) && console.warn(e);
      }
    },

    on: function(method, callback){
      this.listeners[method] = (this.listeners[method] || []);
      this.listeners[method].push(callback);
      return this;
    }

  });

  return FrameBridge;

}());
