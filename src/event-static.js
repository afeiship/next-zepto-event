(function (nx, global) {

  var document = global.document;
  var EventUtil = nx.EventUtil;
  var DOMUtil = nx.DOMUtil;
  var specialEvents = {
    click: 'MouseEvent',
    mousedown: 'MouseEvent',
    mouseup: 'MouseEvent',
    mousemove: 'MouseEvent'
  };

  var EventStatic = nx.declare('nx.EventStatic', {
    statics: {
      Event: function (type, props) {
        var name;
        if (!DOMUtil.isString(type)) props = type, type = props.type;
        var event = document.createEvent(specialEvents[type] || 'Events'),
          bubbles = true;
        if (props) {
          for (name in props) {
            if ('bubbles' === name) {
              bubbles = !!props[name]
            } else {
              event[name] = props[name];
            }
          }
        }
        event.initEvent(type, bubbles, true);
        return EventUtil.compatible(event);
      }
    }
  });

  nx.mix(
    nx.$,
    EventStatic.__statics__
  );

}(nx, nx.GLOBAL));
