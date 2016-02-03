(function (nx, global) {

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
      /**
       * @param event   (用户定义的object)
       * @param source  (原始的事件对象event)
       * @returns {*}
       */
      compatible: function (event, source) {
        if (source || !event.isDefaultPrevented) {
          source || (source = event);

          nx.each(eventMethods, function (name, predicate) {
            var sourceMethod = source[name];
            event[name] = function () {
              this[predicate] = nx.returnTrue;
              return sourceMethod && sourceMethod.apply(source, arguments)
            };
            event[predicate] = nx.returnFalse;
          });

          if (
            source.defaultPrevented !== undefined ? source.defaultPrevented :
              (
                'returnValue' in source ?
                source.returnValue === false :
                source.getPreventDefault && source.getPreventDefault()
              )
          ) {
            event.isDefaultPrevented = nx.returnTrue;
          }
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
