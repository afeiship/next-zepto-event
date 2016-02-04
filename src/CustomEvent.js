(function (nx, global) {

  var document = global.document;
  var specialEvents = {
    click: 'MouseEvents',
    mousedown: 'MouseEvents',
    mouseup: 'MouseEvents',
    mousemove: 'MouseEvents'
  };

  nx.declare('nx.zepto.CustomEvent', {
    statics: {
      create: function (type, props) {
        if (!nx.isString(type)) {
          props = type;
          type = props.type;
        }
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true;
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
        event.initEvent(type, bubbles, true);
        return event;
      }
    }
  });

}(nx, nx.GLOBAL));
