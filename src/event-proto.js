(function (nx, global) {

  var undefined;
  var $ = nx.$;
  var EventUtil = nx.EventUtil;
  var EventCore = nx.EventCore;
  var emptyArray = [],
    slice = emptyArray.slice;
  var focus = {focus: 'focusin', blur: 'focusout'};

  var EventProto = nx.declare('nx.EventProto', {
    statics: {
      on: function (event, selector, data, callback, one) {
        var autoRemove, delegator, $this = this;
        if (event && !nx.isString(event)) {
          nx.each(event, function (type, fn) {
            $this.on(type, selector, data, fn, one)
          });
          return $this;
        }

        if (!nx.isString(selector) && !nx.isFunction(callback) && callback !== false)
          callback = data, data = selector, selector = undefined;
        if (callback === undefined || data === false)
          callback = data, data = undefined;

        if (callback === false) callback = nx.returnFalse;

        return $this.each(function (_, element) {
          if (one) autoRemove = function (e) {
            EventCore.remove(element, e.type, callback);
            return callback.apply(this, arguments);
          };

          if (selector) delegator = function (e) {
            var evt, match = $(e.target).closest(selector, element).get(0);
            if (match && match !== element) {
              evt = nx.mix(EventUtil.createProxy(e), {currentTarget: match, liveFired: element});
              return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
            }
          };

          EventCore.add(element, event, callback, data, selector, delegator || autoRemove)
        })
      },
      off: function (event, selector, callback) {
        var $this = this;
        if (event && !nx.isString(event)) {
          $.each(event, function (type, fn) {
            $this.off(type, selector, fn)
          });
          return $this;
        }

        if (!nx.isString(selector) && !nx.isFunction(callback) && callback !== false)
          callback = selector, selector = undefined;

        if (callback === false) callback = nx.returnFalse;

        return $this.each(function () {
          EventCore.remove(this, event, callback, selector);
        })
      },
      fire: function (event, args) {
        event = (nx.isString(event) || nx.isPlainObject(event)) ? $.Event(event) : EventUtil.compatible(event);
        event._args = args;
        return this.each(function () {
          // handle focus(), blur() by calling them directly
          if (event.type in focus && typeof this[event.type] == "function") this[event.type]();
          // items in the collection might not be DOM elements
          else if ('dispatchEvent' in this) this.dispatchEvent(event);
          else $(this).fireHandler(event, args)
        })
      },
      fireHandler: function (event, args) {
        var e, result;
        this.each(function (i, element) {
          e = EventUtil.createProxy(nx.isString(event) ? nx.Event(event) : event);
          e._args = args;
          e.target = element;
          nx.each(EventUtil.findHandlers(element, event.type || event), function (i, handler) {
            result = handler.proxy(e);
            if (e.isImmediatePropagationStopped()) return false;
          })
        });
        return result;
      }
    }
  });


  nx.mix(
    nx.$.fn,
    EventProto.__statics__
  );

}(nx, nx.GLOBAL));
