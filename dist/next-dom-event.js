!function(e,t){var n=1,r={},i="onfocusin"in window,a={focus:"focusin",blur:"focusout"},o={mouseenter:"mouseover",mouseleave:"mouseout"},u=e.declare("nx.EventUtil",{statics:{zid:function(e){return e._zid||(e._zid=n++)},parse:function(e){var t=(""+e).split(".");return{e:t[0],ns:t.slice(1).sort().join(" ")}},findHandlers:function(e,t,n,i){var a;return t=parse(t),t.ns&&(a=u.matcherFor(t.ns)),(r[u.zid(e)]||[]).filter(function(e){return e&&(!t.e||e.e==t.e)&&(!t.ns||a.test(e.ns))&&(!n||u.zid(e.fn)===u.zid(n))&&(!i||e.sel==i)})},matcherFor:function(e){return new RegExp("(?:^| )"+e.replace(" "," .* ?")+"(?: |$)")},eventCapture:function(e,t){return e.del&&!i&&e.e in a||!!t},realEvent:function(e){return o[e]||i&&a[e]||e},returnTrue:function(){return!0},returnFalse:function(){return!1}}})}(nx,nx.GLOBAL),function(e,t){var n,r=e.$,i=e.EventUtil,a=/^([A-Z]|returnValue$|layer[XY]$)/,o={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"},u=e.declare("nx.EventObject",{statics:{compatible:function(e,t){return(t||!e.isDefaultPrevented)&&(t||(t=e),r.each(o,function(n,r){var a=t[n];e[n]=function(){return this[r]=i.returnTrue,a&&a.apply(t,arguments)},e[r]=i.returnFalse}),(t.defaultPrevented!==n?t.defaultPrevented:"returnValue"in t?t.returnValue===!1:t.getPreventDefault&&t.getPreventDefault())&&(e.isDefaultPrevented=i.returnTrue)),e},createProxy:function(e){var t,r={originalEvent:e};for(t in e)a.test(t)||e[t]===n||(r[t]=e[t]);return u.compatible(r,e)}}})}(nx,nx.GLOBAL),function(e,t){var n,r=e.EventUtil,i=e.EventObject,a={},o=e.$,u={mouseenter:"mouseover",mouseleave:"mouseout"};e.declare("nx.EventCore",{statics:{add:function(t,s,c,f,v,l,d){var p=r.zid(t),m=a[p]||(a[p]=[]);s.split(/\s/).forEach(function(a){if("ready"==a)return e.ready(c);var s=r.parse(a);s.fn=c,s.sel=v,s.e in u&&(c=function(e){var t=e.relatedTarget;return!t||t!==this&&!o.contains(this,t)?s.fn.apply(this,arguments):void 0}),s.del=l;var p=l||c;s.proxy=function(e){if(e=i.compatible(e),!e.isImmediatePropagationStopped()){e.data=f;var r=p.apply(t,e._args==n?[e]:[e].concat(e._args));return r===!1&&(e.preventDefault(),e.stopPropagation()),r}},s.i=m.length,m.push(s),"addEventListener"in t&&t.addEventListener(r.realEvent(s.e),s.proxy,r.eventCapture(s,d))})},remove:function(e,t,n,i,o){var u=r.zid(e);(t||"").split(/\s/).forEach(function(t){r.findHandlers(e,t,n,i).forEach(function(t){delete a[u][t.i],"removeEventListener"in e&&e.removeEventListener(r.realEvent(t.e),t.proxy,r.eventCapture(t,o))})})}}})}(nx,nx.GLOBAL),function(e,t){var n=t.document,r=e.EventUtil,i=e.DOMUtil,a={click:"MouseEvent",mousedown:"MouseEvent",mouseup:"MouseEvent",mousemove:"MouseEvent"},o=e.declare("nx.EventStatic",{statics:{Event:function(e,t){var o;i.isString(e)||(t=e,e=t.type);var u=n.createEvent(a[e]||"Events"),s=!0;if(t)for(o in t)"bubbles"==o?s=!!t[o]:u[o]=t[o];return u.initEvent(e,s,!0),r.compatible(u)}}});e.mix(e.$,o.__statics__)}(nx,nx.GLOBAL),function(e,t){var n,r=e.$,i=e.EventUtil,a=e.DOMUtil,o=e.EventCore,u=[],s=u.slice,c=e.declare("nx.EventProto",{statics:{on:function(e,t,u,c,f){var v,l,d=this;return e&&!a.isString(e)?(r.each(e,function(e,n){d.on(e,t,u,n,f)}),d):(a.isString(t)||a.isFunction(c)||c===!1||(c=u,u=t,t=n),(c===n||u===!1)&&(c=u,u=n),c===!1&&(c=i.returnFalse),d.each(function(n,a){f&&(v=function(e){return o.remove(a,e.type,c),c.apply(this,arguments)}),t&&(l=function(e){var n,o=r(e.target).closest(t,a).get(0);return o&&o!==a?(n=r.extend(i.createProxy(e),{currentTarget:o,liveFired:a}),(v||c).apply(o,[n].concat(s.call(arguments,1)))):void 0}),o.add(a,e,c,u,t,l||v)}))},off:function(e,t,i){var u=this;return e&&!isString(e)?(r.each(e,function(e,n){u.off(e,t,n)}),u):(a.isString(t)||a.isFunction(i)||i===!1||(i=t,t=n),i===!1&&(i=a.returnFalse),u.each(function(){o.remove(this,e,i,t)}))},fire:function(e,t){return e=a.isString(e)||r.isPlainObject(e)?r.Event(e):i.compatible(e),e._args=t,this.each(function(){e.type in focus&&"function"==typeof this[e.type]?this[e.type]():"dispatchEvent"in this?this.dispatchEvent(e):r(this).fireHandler(e,t)})},fireHandler:function(e,t){var n,o;return this.each(function(u,s){n=i.createProxy(a.isString(e)?r.Event(e):e),n._args=t,n.target=s,r.each(i.findHandlers(s,e.type||e),function(e,t){return o=t.proxy(n),n.isImmediatePropagationStopped()?!1:void 0})}),o}}});e.mix(e.$.fn,c.__statics__)}(nx,nx.GLOBAL);