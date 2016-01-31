(function (nx, global) {

  var $ = nx.$;
  var undefined;
  var EventUtil = nx.EventUtil;
  var ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
      preventDefault: 'isDefaultPrevented',
      stopImmediatePropagation: 'isImmediatePropagationStopped',
      stopPropagation: 'isPropagationStopped'
    };


  var EventObject = nx.declare('nx.EventObject', {
    statics: {
      compatible: function (event, source) {
        if (source || !event.isDefaultPrevented) {
          source || (source = event);

          $.each(eventMethods, function (name, predicate) {
            var sourceMethod = source[name];
            event[name] = function () {
              this[predicate] = EventUtil.returnTrue;
              return sourceMethod && sourceMethod.apply(source, arguments)
            };
            event[predicate] = EventUtil.returnFalse
          });

          if (source.defaultPrevented !== undefined ? source.defaultPrevented :
              'returnValue' in source ? source.returnValue === false :
              source.getPreventDefault && source.getPreventDefault())
            event.isDefaultPrevented = EventUtil.returnTrue;
        }
        return event;
      },
      createProxy: function (event) {
        var key, proxy = {originalEvent: event};
        for (key in event)
          if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        return EventObject.compatible(proxy, event);
      }
    }
  });

}(nx, nx.GLOBAL));
