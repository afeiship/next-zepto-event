(function (nx, global) {

  var undefined;
  var ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/;
  var eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

  // 添加isDefaultPrevented方法，event.defaultPrevented返回一个布尔值,
  // 表明当前事件的默认动作是否被取消,也就是是否执行了 event.preventDefault()方法.
  /**
   * 原理就是这下面这一段:
   function fix(event) {
      if (!('defaultPrevented' in event)) {
          event.defaultPrevented = false //初始值false
          var prevent = event.preventDefault // 引用默认preventDefault
          event.preventDefault = function () { //重写preventDefault
              this.defaultPrevented = true
              prevent.call(this)
          }
      }
    }
   */
  var EventObject = nx.declare('nx.zepto.EventObject', {
    statics: {
      compatible: function (event, source) {
        if (source || !event.isDefaultPrevented) {
          if (!source) {
            source = event;
          }

          nx.each(eventMethods, function (name, predicate) {
            var sourceMethod = source[name];
            event[name] = function () {
              this[predicate] = nx.returnTrue;
              return sourceMethod && sourceMethod.apply(source, arguments)
            };
            event[predicate] = nx.returnFalse;
          });

          if (source.defaultPrevented !== undefined ? source.defaultPrevented :
              'returnValue' in source ? source.returnValue === false :
              source.getPreventDefault && source.getPreventDefault())
            event.isDefaultPrevented = nx.returnTrue;
        }

        return event;
      },
      createProxy: function (event) {
        var key, proxy = {
          originalEvent: event
        };
        for (key in event)
          if (!ignoreProperties.test(key) && event[key] !== undefined) {
            proxy[key] = event[key];
          }

        return EventObject.compatible(proxy, event);
      }
    }
  });

}(nx, nx.GLOBAL));
