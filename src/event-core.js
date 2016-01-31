(function (nx, global) {

  var undefined;
  var EventUtil = nx.EventUtil;
  var EventObject = nx.EventObject;
  var handlers = {};
  var $ = nx.$;
  var hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'};
  var EventCore = nx.declare('nx.EventCore', {
    statics: {
      add: function (element, events, fn, data, selector, delegator, capture) {
        var id = EventUtil.zid(element),
          set = (handlers[id] || (handlers[id] = []));
        events.split(/\s/).forEach(function (event) {
          if (event == 'ready') return nx.ready(fn);
          var handler = EventUtil.parse(event);
          handler.fn = fn;
          handler.sel = selector;
          // emulate mouseenter, mouseleave
          if (handler.e in hover) fn = function (e) {
            var related = e.relatedTarget;
            if (!related || (related !== this && !$.contains(this, related)))
              return handler.fn.apply(this, arguments);
          };
          handler.del = delegator;
          var callback = delegator || fn;
          handler.proxy = function (e) {
            e = EventObject.compatible(e);
            if (e.isImmediatePropagationStopped()) return;
            e.data = data;
            var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
            if (result === false) e.preventDefault(), e.stopPropagation();
            return result;
          };
          handler.i = set.length;
          set.push(handler);
          if ('addEventListener' in element)
            element.addEventListener(
              EventUtil.realEvent(handler.e),
              handler.proxy,
              EventUtil.eventCapture(handler, capture)
            );
        });
      },
      remove: function (element, events, fn, selector, capture) {
        var id = EventUtil.zid(element);
        (events || '').split(/\s/).forEach(function (event) {
          EventUtil.findHandlers(element, event, fn, selector).forEach(function (handler) {
            delete handlers[id][handler.i];
            if ('removeEventListener' in element)
              element.removeEventListener(
                EventUtil.realEvent(handler.e),
                handler.proxy,
                EventUtil.eventCapture(handler, capture)
              )
          });
        });
      }
    }
  });

}(nx, nx.GLOBAL));
