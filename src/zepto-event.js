;(function (nx, global) {
  var $ = nx.$;
  var document = global.document;
  var _zid = 1, undefined,
    slice = Array.prototype.slice,
    isFunction = nx.isFunction,
    isString = nx.isString,
    handlers = {},
    focusinSupported = 'onfocusin' in global,
    focus = {focus: 'focusin', blur: 'focusout'},
    hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'};

  var specialEvents = {
    click: 'MouseEvents',
    mousedown: 'MouseEvents',
    mousemove: 'MouseEvents',
    mouseup: 'MouseEvents'
  };

  /**
   * 产生唯一ID,这个ID会在附加在element上去
   * @param obj
   * @returns {number|*}
     */
  function zid(obj) {
    return obj._zid || (obj._zid = _zid++)
  }

  function findHandlers(element, event, fn, selector) {
    var matcher;
    event = parse(event);
    if (event.ns) {
      matcher = matcherFor(event.ns);
    }
    return (handlers[zid(element)] || []).filter(function (handler) {
      return handler
        && (!event.e || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }

  /**
   * 可以这咱形式去注册一个事件:
   * $(el).on('click')
   * $(el).on('click.ui')
   *
   * TODO:这段代码,为什么需要sort().join(' ')这段,严重不理解.
   * @param event
   * @returns {{e: *, ns: string}}
     */
  function parse(event) {
    var parts = ('' + event).split('.');
    return {
      e: parts[0],
      ns: parts.slice(1).sort().join(' ')
    };
  }

  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  /**
   * 根据eventName来判断,eventCapture的类型是true还是false
   * @param handler
   * @param captureSetting
   * @returns {*|boolean}
     */
  function eventCapture(handler, captureSetting) {
    //此方法，只针对存在事件代理的情况下才有意义
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) || !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type;
  }

  function add(element, events, fn, data, selector, delegator, capture) {
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function (event) {
      if (event == 'ready') {
        return $(document).ready(fn);
      }
      var handler = parse(event);
      handler.fn = fn;
      handler.sel = selector;

      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function (e) {
        /**
         * 这个relatedTarget只有在mouseover/out进入元素,或者离开元素时候,才会产生,其它时间为null
         * @type {EventTarget}
         */
        var related = e.relatedTarget;


        if (!related || (related !== this && !nx.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del = delegator;
      var callback = delegator || fn
      handler.proxy = function (e) {
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }

  function remove(element, events, fn, selector, capture) {
    var id = zid(element)
      ;
    (events || '').split(/\s/).forEach(function (event) {
      findHandlers(element, event, fn, selector).forEach(function (handler) {
        delete handlers[id][handler.i]
        if ('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = {add: add, remove: remove}

  $.proxy = function (fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function () {
        return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments)
      }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function (event, data, callback) {
    return this.on(event, data, callback)
  }
  $.fn.unbind = function (event, callback) {
    return this.off(event, callback)
  }
  $.fn.one = function (event, selector, data, callback) {
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function () {
      return true
    },
    returnFalse = function () {
      return false
    },
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
      preventDefault: 'isDefaultPrevented',
      stopImmediatePropagation: 'isImmediatePropagationStopped',
      stopPropagation: 'isPropagationStopped'
    }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function (name, predicate) {
        var sourceMethod = source[name]
        event[name] = function () {
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = {originalEvent: event}
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function (selector, event, callback) {
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function (selector, event, callback) {
    return this.off(event, selector, callback)
  }

  $.fn.live = function (event, callback) {
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function (event, callback) {
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function (event, selector, data, callback, one) {
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function (_, element) {
      if (one) autoRemove = function (e) {
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function (e) {
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function (event, selector, callback) {
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function (type, fn) {
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function () {
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function (event, args) {
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function () {
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function (event, args) {
    var e, result
    this.each(function (i, element) {
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function (i, handler) {
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

    // shortcut methods for `.bind(event, fn)` for each event type
  ;
  ('focusin focusout focus blur load resize scroll unload click dblclick ' +
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
  'change select keydown keypress keyup error').split(' ').forEach(function (event) {
    $.fn[event] = function (callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function (type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(nx, nx.GLOBAL)