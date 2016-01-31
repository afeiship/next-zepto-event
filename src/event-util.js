(function (nx, global) {

  var _zid = 1;
  var handlers = {};
  var focusinSupported = 'onfocusin' in window;
  var focus = {focus: 'focusin', blur: 'focusout'};
  var hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'};

  var EventUtil = nx.declare('nx.EventUtil', {
    statics: {
      zid: function (element) {
        return element._zid || (element._zid = _zid++);
      },
      parse: function (event) {
        var parts = ('' + event).split('.');
        return {
          e: parts[0],
          ns: parts.slice(1).sort().join(' ')
        };
      },
      findHandlers: function (element, event, fn, selector) {
        var matcher;
        event = parse(event);
        if (event.ns) {
          matcher = EventUtil.matcherFor(event.ns);
        }
        return (handlers[EventUtil.zid(element)] || []).filter(function (handler) {
          return handler
            && (!event.e || handler.e == event.e)
            && (!event.ns || matcher.test(handler.ns))
            && (!fn || EventUtil.zid(handler.fn) === EventUtil.zid(fn))
            && (!selector || handler.sel == selector);
        })
      },
      matcherFor: function (ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
      },
      eventCapture: function (handler, captureSetting) {
        return handler.del &&
          (!focusinSupported && (handler.e in focus)) || !!captureSetting
      },
      realEvent: function (type) {
        return hover[type] || (focusinSupported && focus[type]) || type
      },
      returnTrue: function () {
        return true;
      },
      returnFalse: function () {
        return false;
      }
    }
  });

}(nx, nx.GLOBAL));
