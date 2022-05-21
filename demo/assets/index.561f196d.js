var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const p$1 = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p$1();
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function normalizeStyle(value) {
  if (isArray$2(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value)) {
    return value;
  } else if (isObject$9(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray$2(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$9(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray$2(val) || isObject$9(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer$1, 2) : String(val);
};
const replacer$1 = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer$1(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries2, [key, val2]) => {
        entries2[`${key} =>`] = val2;
        return entries2;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$9(val) && !isArray$2(val) && !isPlainObject$2(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn$b = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$2 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol$3 = (val) => typeof val === "symbol";
const isObject$9 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject$9(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$2 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_2, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.active = true;
    this.effects = [];
    this.cleanups = [];
    if (!detached && activeEffectScope) {
      this.parent = activeEffectScope;
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
    }
  }
  run(fn) {
    if (this.active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  on() {
    activeEffectScope = this;
  }
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this.active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.active = false;
    }
  }
}
function recordEffectScope(effect, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect);
  }
}
const createDep = (effects) => {
  const dep = new Set(effects);
  dep.w = 0;
  dep.n = 0;
  return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].w |= trackOpBit;
    }
  }
};
const finalizeDepMarkers = (effect) => {
  const { deps } = effect;
  if (deps.length) {
    let ptr = 0;
    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];
      if (wasTracked(dep) && !newTracked(dep)) {
        dep.delete(effect);
      } else {
        deps[ptr++] = dep;
      }
      dep.w &= ~trackOpBit;
      dep.n &= ~trackOpBit;
    }
    deps.length = ptr;
  }
};
const targetMap = /* @__PURE__ */ new WeakMap();
let effectTrackDepth = 0;
let trackOpBit = 1;
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    recordEffectScope(this, scope);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      trackOpBit = 1 << ++effectTrackDepth;
      if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this);
      } else {
        cleanupEffect(this);
      }
      return this.fn();
    } finally {
      if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this);
      }
      trackOpBit = 1 << --effectTrackDepth;
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = void 0;
      if (this.deferStop) {
        this.stop();
      }
    }
  }
  stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep, debuggerEventExtraInfo) {
  let shouldTrack2 = false;
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack2 = !wasTracked(dep);
    }
  } else {
    shouldTrack2 = !dep.has(activeEffect);
  }
  if (shouldTrack2) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$2(target)) {
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || key2 >= newValue) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$2(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$2(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  if (deps.length === 1) {
    if (deps[0]) {
      {
        triggerEffects(deps[0]);
      }
    }
  } else {
    const effects = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    {
      triggerEffects(createDep(effects));
    }
  }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
  const effects = isArray$2(dep) ? dep : [...dep];
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect);
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect);
    }
  }
}
function triggerEffect(effect, debuggerEventExtraInfo) {
  if (effect !== activeEffect || effect.allowRecurse) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol$3));
const get$3 = /* @__PURE__ */ createGetter();
const shallowGet = /* @__PURE__ */ createGetter(false, true);
const readonlyGet = /* @__PURE__ */ createGetter(true);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      const res = toRaw(this)[key].apply(this, args);
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function createGetter(isReadonly2 = false, shallow = false) {
  return function get3(target, key, receiver) {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
      return target;
    }
    const targetIsArray = isArray$2(target);
    if (!isReadonly2 && targetIsArray && hasOwn$b(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver);
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol$3(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$9(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  };
}
const set$1 = /* @__PURE__ */ createSetter();
const shallowSet = /* @__PURE__ */ createSetter(true);
function createSetter(shallow = false) {
  return function set3(target, key, value, receiver) {
    let oldValue = target[key];
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false;
    }
    if (!shallow && !isReadonly(value)) {
      if (!isShallow(value)) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
      }
      if (!isArray$2(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArray$2(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn$b(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  };
}
function deleteProperty(target, key) {
  const hadKey = hasOwn$b(target, key);
  target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function has$1(target, key) {
  const result = Reflect.has(target, key);
  if (!isSymbol$3(key) || !builtInSymbols.has(key)) {
    track(target, "has", key);
  }
  return result;
}
function ownKeys$2(target) {
  track(target, "iterate", isArray$2(target) ? "length" : ITERATE_KEY);
  return Reflect.ownKeys(target);
}
const mutableHandlers = {
  get: get$3,
  set: set$1,
  deleteProperty,
  has: has$1,
  ownKeys: ownKeys$2
};
const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    return true;
  },
  deleteProperty(target, key) {
    return true;
  }
};
const shallowReactiveHandlers = /* @__PURE__ */ extend({}, mutableHandlers, {
  get: shallowGet,
  set: shallowSet
});
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1$1(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has3 } = getProto(rawTarget);
  const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has3.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has3.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (key !== rawKey) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has3, get: get3 } = getProto(target);
  let hadKey = has3.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has3.call(target, key);
  }
  const oldValue = get3.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has3, get: get3 } = getProto(target);
  let hadKey = has3.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has3.call(target, key);
  }
  get3 ? get3.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach2(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return {
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1$1,
    add,
    set: set$1$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1$1,
    add,
    set: set$1$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
    shallowInstrumentations2[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn$b(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$9(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject$9(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$9(value) ? readonly(value) : value;
function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    {
      trackEffects(ref2.dep || (ref2.dep = createDep()));
    }
  }
}
function triggerRefValue(ref2, newVal) {
  ref2 = toRaw(ref2);
  if (ref2.dep) {
    {
      triggerEffects(ref2.dep);
    }
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    newVal = this.__v_isShallow ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this.__v_isShallow ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this._dirty = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    trackRefValue(self2);
    if (self2._dirty || !self2._cacheable) {
      self2._dirty = false;
      self2._value = self2.effect.run();
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function callWithErrorHandling(fn, instance, type, args) {
  let res;
  try {
    res = args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
  return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values3 = [];
  for (let i = 0; i < fn.length; i++) {
    values3.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values3;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(appErrorHandler, null, 10, [err, exposedInstance, errorInfo]);
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPreFlushCbs = [];
let activePreFlushCbs = null;
let preFlushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
let currentPreFlushParentJob = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id2) {
  let start2 = flushIndex + 1;
  let end = queue.length;
  while (start2 < end) {
    const middle = start2 + end >>> 1;
    const middleJobId = getId(queue[middle]);
    middleJobId < id2 ? start2 = middle + 1 : end = middle;
  }
  return start2;
}
function queueJob(job) {
  if ((!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) && job !== currentPreFlushParentJob) {
    if (job.id == null) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job);
    }
    queueFlush();
  }
}
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function invalidateJob(job) {
  const i = queue.indexOf(job);
  if (i > flushIndex) {
    queue.splice(i, 1);
  }
}
function queueCb(cb, activeQueue, pendingQueue, index) {
  if (!isArray$2(cb)) {
    if (!activeQueue || !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
      pendingQueue.push(cb);
    }
  } else {
    pendingQueue.push(...cb);
  }
  queueFlush();
}
function queuePreFlushCb(cb) {
  queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
}
function queuePostFlushCb(cb) {
  queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
}
function flushPreFlushCbs(seen, parentJob = null) {
  if (pendingPreFlushCbs.length) {
    currentPreFlushParentJob = parentJob;
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
    pendingPreFlushCbs.length = 0;
    for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
      activePreFlushCbs[preFlushIndex]();
    }
    activePreFlushCbs = null;
    preFlushIndex = 0;
    currentPreFlushParentJob = null;
    flushPreFlushCbs(seen, parentJob);
  }
}
function flushPostFlushCbs(seen) {
  flushPreFlushCbs();
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? Infinity : job.id;
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  flushPreFlushCbs(seen);
  queue.sort((a, b) => getId(a) - getId(b));
  const check2 = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPreFlushCbs.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
function emit$1(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
    if (trim) {
      args = rawArgs.map((a) => a.trim());
    }
    if (number) {
      args = rawArgs.map(toNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(handler, instance, 6, args);
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    cache.set(comp, null);
    return null;
  }
  if (isArray$2(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  cache.set(comp, normalized);
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn$b(options, key[0].toLowerCase() + key.slice(1)) || hasOwn$b(options, hyphenate(key)) || hasOwn$b(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    const res = fn(...args);
    setCurrentRenderingInstance(prevInstance);
    if (renderFnWithContext._d) {
      setBlockTracking(1);
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data: data2, setupState, ctx, inheritAttrs } = instance;
  let result;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data2, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false)
        ;
      result = normalizeVNode(render2.length > 1 ? render2(props, false ? {
        get attrs() {
          markAttrsAccessed();
          return attrs;
        },
        slots,
        emit
      } : { attrs, slots, emit }) : render2(props, null));
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys4 = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys4.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys4.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        }
        root = cloneVNode(root, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root.transition = vnode.transition;
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && parent.subTree === vnode) {
    (vnode = parent.vnode).el = el;
    parent = parent.parent;
  }
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$2(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance) {
    const provides = instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance.proxy) : defaultValue;
    } else
      ;
  }
}
function watchPostEffect(effect, options) {
  return doWatch(effect, null, { flush: "post" });
}
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  const instance = currentInstance;
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isArray$2(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return traverse(s);
      } else if (isFunction(s)) {
        return callWithErrorHandling(s, instance, 2);
      } else
        ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, instance, 3, [onCleanup]);
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
    };
  };
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    return NOOP;
  }
  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect.active) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    scheduler = () => queuePreFlushCb(job);
  }
  const effect = new ReactiveEffect(getter, scheduler);
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
  } else {
    effect.run();
  }
  return () => {
    effect.stop();
    if (instance && instance.scope) {
      remove(instance.scope.effects, effect);
    }
  };
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const cur = currentInstance;
  setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  if (cur) {
    setCurrentInstance(cur);
  } else {
    unsetCurrentInstance();
  }
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, seen) {
  if (!isObject$9(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray$2(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, seen);
    });
  } else if (isPlainObject$2(value)) {
    for (const key in value) {
      traverse(value[key], seen);
    }
  }
  return value;
}
function defineComponent(options) {
  return isFunction(options) ? { setup: options, name: options.name } : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(type, hook, keepAliveRoot, true);
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      unsetCurrentInstance();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, hook, target);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
function withDirectives(vnode, directives) {
  const internalInstance = currentRenderingInstance;
  if (internalInstance === null) {
    return vnode;
  }
  const instance = getExposeProxy(internalInstance) || internalInstance.proxy;
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (isFunction(dir)) {
      dir = {
        mounted: dir,
        updated: dir
      };
    }
    if (dir.deep) {
      traverse(value);
    }
    bindings.push({
      dir,
      instance,
      value,
      oldValue: void 0,
      arg,
      modifiers
    });
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(Component);
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray$2(source) || isString(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    }
  } else if (isObject$9(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
    } else {
      const keys4 = Object.keys(source);
      ret = new Array(keys4.length);
      for (let i = 0, l = keys4.length; i < l; i++) {
        const key = keys4[i];
        ret[i] = renderItem(source[key], key, i, cached && cached[i]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
  $: (i) => i,
  $el: (i) => i.vnode.el,
  $data: (i) => i.data,
  $props: (i) => i.props,
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots,
  $refs: (i) => i.refs,
  $parent: (i) => getPublicInstance(i.parent),
  $root: (i) => getPublicInstance(i.root),
  $emit: (i) => i.emit,
  $options: (i) => resolveMergedOptions(i),
  $forceUpdate: (i) => i.f || (i.f = () => queueJob(i.update)),
  $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
  $watch: (i) => instanceWatch.bind(i)
});
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data: data2, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data2[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (setupState !== EMPTY_OBJ && hasOwn$b(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data2 !== EMPTY_OBJ && hasOwn$b(data2, key)) {
        accessCache[key] = 2;
        return data2[key];
      } else if ((normalizedProps = instance.propsOptions[0]) && hasOwn$b(normalizedProps, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn$b(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn$b(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (globalProperties = appContext.config.globalProperties, hasOwn$b(globalProperties, key)) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data: data2, setupState, ctx } = instance;
    if (setupState !== EMPTY_OBJ && hasOwn$b(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data2 !== EMPTY_OBJ && hasOwn$b(data2, key)) {
      data2[key] = value;
      return true;
    } else if (hasOwn$b(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({ _: { data: data2, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
    let normalizedProps;
    return !!accessCache[key] || data2 !== EMPTY_OBJ && hasOwn$b(data2, key) || setupState !== EMPTY_OBJ && hasOwn$b(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn$b(normalizedProps, key) || hasOwn$b(ctx, key) || hasOwn$b(publicPropertiesMap, key) || hasOwn$b(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn$b(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    expose,
    inheritAttrs,
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data2 = dataOptions.call(publicThis, publicThis);
    if (!isObject$9(data2))
      ;
    else {
      instance.data = reactive(data2);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get3 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set3 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get3,
        set: set3
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$2(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$2(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
  if (isArray$2(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$9(opt)) {
      if ("default" in opt) {
        injected = inject(opt.from || key, opt.default, true);
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      if (unwrapRef) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx[key] = injected;
      }
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(isArray$2(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$9(raw)) {
    if (isArray$2(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base2 = instance.type;
  const { mixins, extends: extendsOptions } = base2;
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
  const cached = cache.get(base2);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base2;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
    }
    mergeOptions(resolved, base2, optionMergeStrategies);
  }
  cache.set(base2, resolved);
  return resolved;
}
function mergeOptions(to, from2, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from2;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach((m) => mergeOptions(to, m, strats, true));
  }
  for (const key in from2) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from2[key]) : from2[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeObjectOptions,
  emits: mergeObjectOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from2) {
  if (!from2) {
    return to;
  }
  if (!to) {
    return from2;
  }
  return function mergedDataFn() {
    return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from2) ? from2.call(this, this) : from2);
  };
}
function mergeInject(to, from2) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from2));
}
function normalizeInject(raw) {
  if (isArray$2(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from2) {
  return to ? [...new Set([].concat(to, from2))] : from2;
}
function mergeObjectOptions(to, from2) {
  return to ? extend(extend(/* @__PURE__ */ Object.create(null), to), from2) : from2;
}
function mergeWatchOptions(to, from2) {
  if (!to)
    return from2;
  if (!from2)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from2) {
    merged[key] = mergeAsArray(to[key], from2[key]);
  }
  return merged;
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn$b(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || !hasOwn$b(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn$b(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn$b(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn$b(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn$b(castValues, key));
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn$b(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(null, props);
          unsetCurrentInstance();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[0]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys4] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys4)
        needCastKeys.push(...keys4);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    cache.set(comp, EMPTY_ARR);
    return EMPTY_ARR;
  }
  if (isArray$2(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$2(opt) || isFunction(opt) ? { type: opt } : opt;
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[0] = booleanIndex > -1;
          prop[1] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn$b(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  cache.set(comp, res);
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$") {
    return true;
  }
  return false;
}
function getType(ctor) {
  const match2 = ctor && ctor.toString().match(/^\s*function (\w+)/);
  return match2 ? match2[1] : ctor === null ? "null" : "";
}
function isSameType(a, b) {
  return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray$2(expectedTypes)) {
    return expectedTypes.findIndex((t) => isSameType(t, type));
  } else if (isFunction(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$2(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key))
      continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(children, instance.slots = {});
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
        delete slots[key];
      }
    }
  }
};
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$3 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = Object.assign({}, rootComponent);
    }
    if (rootProps != null && !isObject$9(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new Set();
    let isMounted = false;
    const app = context.app = {
      _uid: uid$3++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version: version$1,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else
          ;
        return app;
      },
      mixin(mixin2) {
        {
          if (!context.mixins.includes(mixin2)) {
            context.mixins.push(mixin2);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, isSVG) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, isSVG);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      }
    };
    return app;
  };
}
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$2(rawRef)) {
    rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray$2(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn$b(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction(ref2)) {
    callWithErrorHandling(ref2, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? refs[ref2] : ref2.value;
          if (isUnmount) {
            isArray$2(existing) && remove(existing, refValue);
          } else {
            if (!isArray$2(existing)) {
              if (_isString) {
                refs[ref2] = [refValue];
                if (hasOwn$b(setupState, ref2)) {
                  setupState[ref2] = refs[ref2];
                }
              } else {
                ref2.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref2.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref2] = value;
          if (hasOwn$b(setupState, ref2)) {
            setupState[ref2] = value;
          }
        } else if (isRef(ref2)) {
          ref2.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG);
        }
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & 1) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 6) {
          processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (shapeFlag & 64) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else if (shapeFlag & 128) {
          type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
        } else
          ;
    }
    if (ref2 != null && parentComponent) {
      setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, isSVG) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next3;
    while (el && el !== anchor) {
      next3 = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next3;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next3;
    while (el && el !== anchor) {
      next3 = hostNextSibling(el);
      hostRemove(el);
      el = next3;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    isSVG = isSVG || n2.type === "svg";
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode;
    if (vnode.el && hostCloneNode !== void 0 && patchFlag === -1) {
      el = vnode.el = hostCloneNode(vnode.el);
    } else {
      el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== "foreignObject", slotScopeIds, optimized);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start2 = 0) => {
    for (let i = start2; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    const areChildrenSVG = isSVG && n2.type !== "foreignObject";
    if (dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
    } else if (!optimized) {
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, isSVG);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, isSVG);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next3 = newProps[key];
            if (next3 !== prev || key === "value") {
              hostPatchProp(el, key, prev, next3, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : fallbackContainer;
      patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next3 = newProps[key];
        const prev = oldProps[key];
        if (next3 !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next3, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
          }
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
        if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
          traverseStaticChildren(n1, n2, true);
        }
      } else {
        patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
      } else {
        mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
      return;
    }
    setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(() => !instance.isUnmounted && hydrateSubTree());
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next: next3, bu, u, parent, vnode } = instance;
        let originNext = next3;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next3) {
          next3.el = vnode.el;
          updateComponentPreRender(instance, next3, optimized);
        } else {
          next3 = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next3.props && next3.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next3, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, isSVG);
        next3.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next3.props && next3.props.onVnodeUpdated) {
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next3, vnode), parentSuspense);
        }
      }
    };
    const effect = instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update), instance.scope);
    const update = instance.update = () => effect.run();
    update.id = instance.uid;
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(void 0, instance.update);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove3 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove3();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove3, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
    if (ref2 != null) {
      setRef(ref2, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
      } else if (dynamicChildren && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next3;
    while (cur !== end) {
      next3 = hostNextSibling(cur);
      hostRemove(cur);
      cur = next3;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update) {
      update.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start2 = 0) => {
    for (let i = start2; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  const render = (vnode, container, isSVG) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(container._vnode || null, vnode, container, null, null, null, isSVG);
    }
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate, hydrateNode] = createHydrationFns(internals);
  }
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  };
}
function toggleRecurse({ effect, update }, allowed) {
  effect.allowRecurse = update.allowRecurse = allowed;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$2(ch1) && isArray$2(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
const isTeleport = (type) => type.__isTeleport;
const Fragment = Symbol(void 0);
const Text = Symbol(void 0);
const Comment = Symbol(void 0);
const Static = Symbol(void 0);
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref: ref2, ref_key, ref_for }) => {
  return ref2 != null ? isString(ref2) || isRef(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true);
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$9(style)) {
      if (isProxy(style) && !isArray$2(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$9(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref2, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray$2(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition: vnode.transition,
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor
  };
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$2(child)) {
    return createVNode(Fragment, null, child.slice());
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$2(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$2(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid$1$1 = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid$1$1++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(true),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    emit: null,
    emitted: null,
    propsDefaults: EMPTY_OBJ,
    inheritAttrs: type.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit$1.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
  currentInstance = instance;
  instance.scope.on();
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  currentInstance = null;
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isInSSRComponentSetup = isSSR;
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isInSSRComponentSetup = false;
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
    resetTracking();
    unsetCurrentInstance();
    if (isPromise(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$9(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template = Component.template;
      if (template) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(extend({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile(template, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    setCurrentInstance(instance);
    pauseTracking();
    applyOptions(instance);
    resetTracking();
    unsetCurrentInstance();
  }
}
function createAttrsProxy(instance) {
  return new Proxy(instance.attrs, {
    get(target, key) {
      track(instance, "get", "$attrs");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  let attrs;
  {
    return {
      get attrs() {
        return attrs || (attrs = createAttrsProxy(instance));
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      }
    }));
  }
}
function getComponentName(Component) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
const version$1 = "3.2.34";
const svgNS = "http://www.w3.org/2000/svg";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, isSVG, is, props) => {
    const el = isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is ? { is } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id2) {
    el.setAttribute(id2, "");
  },
  cloneNode(el) {
    const cloned = el.cloneNode(true);
    if (`_value` in el) {
      cloned._value = el._value;
    }
    return cloned;
  },
  insertStaticContent(content, parent, anchor, isSVG, start2, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start2 && (start2 === end || start2.nextSibling)) {
      while (true) {
        parent.insertBefore(start2.cloneNode(true), anchor);
        if (start2 === end || !(start2 = start2.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
      const template = templateContainer.content;
      if (isSVG) {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      before ? before.nextSibling : parent.firstChild,
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
function patchClass(el, value, isSVG) {
  const transitionClasses = el._vtc;
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
function patchStyle(el, prev, next3) {
  const style = el.style;
  const isCssString = isString(next3);
  if (next3 && !isCssString) {
    for (const key in next3) {
      setStyle(style, key, next3[key]);
    }
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next3[key] == null) {
          setStyle(style, key, "");
        }
      }
    }
  } else {
    const currentDisplay = style.display;
    if (isCssString) {
      if (prev !== next3) {
        style.cssText = next3;
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
    if ("_vod" in el) {
      style.display = currentDisplay;
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$2(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean = isSpecialBooleanAttr(key);
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  if (key === "value" && el.tagName !== "PROGRESS" && !el.tagName.includes("-")) {
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue || el.tagName === "OPTION") {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
const [_getNow, skipTimestampCheck] = /* @__PURE__ */ (() => {
  let _getNow2 = Date.now;
  let skipTimestampCheck2 = false;
  if (typeof window !== "undefined") {
    if (Date.now() > document.createEvent("Event").timeStamp) {
      _getNow2 = () => performance.now();
    }
    const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i);
    skipTimestampCheck2 = !!(ffMatch && Number(ffMatch[1]) <= 53);
  }
  return [_getNow2, skipTimestampCheck2];
})();
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const reset$1 = () => {
  cachedNow = 0;
};
const getNow = () => cachedNow || (p.then(reset$1), cachedNow = _getNow());
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  return [hyphenate(name.slice(2)), options];
}
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    const timeStamp = e.timeStamp || _getNow();
    if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
      callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$2(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else {
    return value;
  }
}
const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && nativeOnRE.test(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (nativeOnRE.test(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function useCssVars(getter) {
  const instance = getCurrentInstance();
  if (!instance) {
    return;
  }
  const setVars = () => setVarsOnVNode(instance.subTree, getter(instance.proxy));
  watchPostEffect(setVars);
  onMounted(() => {
    const ob = new MutationObserver(setVars);
    ob.observe(instance.subTree.el.parentNode, { childList: true });
    onUnmounted(() => ob.disconnect());
  });
}
function setVarsOnVNode(vnode, vars) {
  if (vnode.shapeFlag & 128) {
    const suspense = vnode.suspense;
    vnode = suspense.activeBranch;
    if (suspense.pendingBranch && !suspense.isHydrating) {
      suspense.effects.push(() => {
        setVarsOnVNode(suspense.activeBranch, vars);
      });
    }
  }
  while (vnode.component) {
    vnode = vnode.component.subTree;
  }
  if (vnode.shapeFlag & 1 && vnode.el) {
    setVarsOnNode(vnode.el, vars);
  } else if (vnode.type === Fragment) {
    vnode.children.forEach((c) => setVarsOnVNode(c, vars));
  } else if (vnode.type === Static) {
    let { el, anchor } = vnode;
    while (el) {
      setVarsOnNode(el, vars);
      if (el === anchor)
        break;
      el = el.nextSibling;
    }
  }
}
function setVarsOnNode(el, vars) {
  if (el.nodeType === 1) {
    const style = el.style;
    for (const key in vars) {
      style.setProperty(`--${key}`, vars[key]);
    }
  }
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray$2(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing)
        return;
      let domValue = el.value;
      if (trim) {
        domValue = domValue.trim();
      }
      if (castToNumber) {
        domValue = toNumber(domValue);
      }
      el._assign(domValue);
    });
    if (trim) {
      addEventListener(el, "change", () => {
        el.value = el.value.trim();
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
    el._assign = getModelAssigner(vnode);
    if (el.composing)
      return;
    if (document.activeElement === el && el.type !== "range") {
      if (lazy) {
        return;
      }
      if (trim && el.value.trim() === value) {
        return;
      }
      if ((number || el.type === "number") && toNumber(el.value) === value) {
        return;
      }
    }
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
  }
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, container instanceof SVGElement);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = defineComponent({
  name: "contexts-component",
  components: {},
  props: {
    contexts: { type: Array, required: true, default: () => [] }
  },
  emits: ["addContext"],
  setup() {
    const addVal = ref("");
    return { addVal };
  }
});
const _hoisted_1$2 = { class: "contexts" };
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$2, [
    createBaseVNode("div", null, [
      withDirectives(createBaseVNode("input", {
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.addVal = $event)
      }, null, 512), [
        [vModelText, _ctx.addVal]
      ]),
      createBaseVNode("button", {
        type: "button",
        onClick: _cache[1] || (_cache[1] = ($event) => {
          _ctx.$emit("addContext", _ctx.addVal);
          _ctx.addVal = "";
        })
      }, "Add Context")
    ]),
    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.contexts, (context) => {
      return openBlock(), createElementBlock("div", { key: context }, toDisplayString(context), 1);
    }), 128))
  ]);
}
var contexts = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2]]);
class Condition {
  constructor(text) {
    this.text = text;
  }
  eval(context) {
    return true;
  }
  equals(condition) {
    if (this === condition)
      return true;
    return this.text === condition.text;
  }
  export() {
    return this.text;
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var a = Object.defineProperty({}, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var utils = {};
var multisplice$1 = {};
Object.defineProperty(multisplice$1, "__esModule", {
  value: true
});
multisplice$1.MULTISPLICE_ITEM = void 0;
multisplice$1.multisplice = multisplice;
function multisplice(array, indexes, count = 1, item, {
  insert: insert2 = MULTISPLICE_ITEM.SINGLE
} = {}) {
  if (typeof indexes === "number")
    indexes = [indexes];
  const arr = array;
  const insertItems = item !== void 0;
  const multipleItems = insertItems && Array.isArray(item) && (insert2 === MULTISPLICE_ITEM.MATCH_INDEX || insert2 === MULTISPLICE_ITEM.MATCH_INDEX_LOOSE);
  if (multipleItems && insert2 === MULTISPLICE_ITEM.MATCH_INDEX && item.length !== indexes.length) {
    throw new Error(`To be able to match inserts by index, you must pass the same amount of items as indexes. You passed ${indexes.length} indexes and ${item.length} items.`);
  }
  let totalInserted = 0;
  let removed = [];
  for (let i = 0; i < indexes.length; i++) {
    const insertCount = insertItems ? totalInserted : 0;
    const deleteCount = i * count;
    const pos = indexes[i] - deleteCount + insertCount;
    const insertion = insertItems ? multipleItems ? item[i] : item : void 0;
    const doInsert = insertItems && (insert2 !== MULTISPLICE_ITEM.MATCH_INDEX_LOOSE || i < item.length);
    const rangeEnd = indexes[i + 1] && pos + count - 1;
    const nextPos = indexes[i + 1] && indexes[i + 1] + insertCount;
    if (rangeEnd >= nextPos) {
      throw new Error(`Deleting ${count} elements at a time from position ${pos} would overlap with next calculated index: ${indexes[i + 1]}.
Current state of array = ${arr.join(",")}`);
    }
    if (doInsert)
      totalInserted++;
    if (pos >= arr.length && count > 0) {
      throw new Error(`Position ${pos}  to delete at is greater than array length.`);
    }
    const deleted = doInsert ? arr.splice(pos, count, insertion) : arr.splice(pos, count);
    removed = removed.concat(deleted);
  }
  return {
    removed,
    array: arr
  };
}
let MULTISPLICE_ITEM;
multisplice$1.MULTISPLICE_ITEM = MULTISPLICE_ITEM;
(function(MULTISPLICE_ITEM2) {
  MULTISPLICE_ITEM2["SINGLE"] = "SINGLE";
  MULTISPLICE_ITEM2["MATCH_INDEX"] = "MATCH_INDEX";
  MULTISPLICE_ITEM2["MATCH_INDEX_LOOSE"] = "MATCH_INDEX_LOOSE";
})(MULTISPLICE_ITEM || (multisplice$1.MULTISPLICE_ITEM = MULTISPLICE_ITEM = {}));
var assertInStrRange$1 = {};
Object.defineProperty(assertInStrRange$1, "__esModule", {
  value: true
});
assertInStrRange$1.assertInStrRange = assertInStrRange;
function assertInStrRange(cursor, str) {
  if (Math.abs(cursor) <= str.length)
    return true;
  throw new Error(`Position ${cursor} is outside the string "${str}"'s range (${str.length}).`);
}
var browserSaveFile$1 = {};
var check = function(it) {
  return it && it.Math == Math && it;
};
var global$C = check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || check(typeof self == "object" && self) || check(typeof commonjsGlobal == "object" && commonjsGlobal) || function() {
  return this;
}() || Function("return this")();
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};
var isCallable$j = function(argument) {
  return typeof argument == "function";
};
var isCallable$i = isCallable$j;
var isObject$8 = function(it) {
  return typeof it == "object" ? it !== null : isCallable$i(it);
};
var global$B = global$C;
var isObject$7 = isObject$8;
var document$1 = global$B.document;
var EXISTS$1 = isObject$7(document$1) && isObject$7(document$1.createElement);
var documentCreateElement$2 = function(it) {
  return EXISTS$1 ? document$1.createElement(it) : {};
};
var documentCreateElement$1 = documentCreateElement$2;
var classList = documentCreateElement$1("span").classList;
var DOMTokenListPrototype$1 = classList && classList.constructor && classList.constructor.prototype;
var domTokenListPrototype = DOMTokenListPrototype$1 === Object.prototype ? void 0 : DOMTokenListPrototype$1;
var fails$j = function(exec2) {
  try {
    return !!exec2();
  } catch (error) {
    return true;
  }
};
var fails$i = fails$j;
var functionBindNative = !fails$i(function() {
  var test2 = function() {
  }.bind();
  return typeof test2 != "function" || test2.hasOwnProperty("prototype");
});
var NATIVE_BIND$3 = functionBindNative;
var FunctionPrototype$2 = Function.prototype;
var bind$4 = FunctionPrototype$2.bind;
var call$e = FunctionPrototype$2.call;
var uncurryThis$l = NATIVE_BIND$3 && bind$4.bind(call$e, call$e);
var functionUncurryThis = NATIVE_BIND$3 ? function(fn) {
  return fn && uncurryThis$l(fn);
} : function(fn) {
  return fn && function() {
    return call$e.apply(fn, arguments);
  };
};
var uncurryThis$k = functionUncurryThis;
var toString$6 = uncurryThis$k({}.toString);
var stringSlice$6 = uncurryThis$k("".slice);
var classofRaw$1 = function(it) {
  return stringSlice$6(toString$6(it), 8, -1);
};
var global$A = global$C;
var uncurryThis$j = functionUncurryThis;
var fails$h = fails$j;
var classof$6 = classofRaw$1;
var Object$5 = global$A.Object;
var split$3 = uncurryThis$j("".split);
var indexedObject = fails$h(function() {
  return !Object$5("z").propertyIsEnumerable(0);
}) ? function(it) {
  return classof$6(it) == "String" ? split$3(it, "") : Object$5(it);
} : Object$5;
var global$z = global$C;
var TypeError$e = global$z.TypeError;
var requireObjectCoercible$4 = function(it) {
  if (it == void 0)
    throw TypeError$e("Can't call method on " + it);
  return it;
};
var IndexedObject$1 = indexedObject;
var requireObjectCoercible$3 = requireObjectCoercible$4;
var toIndexedObject$5 = function(it) {
  return IndexedObject$1(requireObjectCoercible$3(it));
};
var shared$4 = { exports: {} };
var isPure = false;
var global$y = global$C;
var defineProperty$5 = Object.defineProperty;
var setGlobal$3 = function(key, value) {
  try {
    defineProperty$5(global$y, key, { value, configurable: true, writable: true });
  } catch (error) {
    global$y[key] = value;
  }
  return value;
};
var global$x = global$C;
var setGlobal$2 = setGlobal$3;
var SHARED = "__core-js_shared__";
var store$3 = global$x[SHARED] || setGlobal$2(SHARED, {});
var sharedStore = store$3;
var store$2 = sharedStore;
(shared$4.exports = function(key, value) {
  return store$2[key] || (store$2[key] = value !== void 0 ? value : {});
})("versions", []).push({
  version: "3.22.5",
  mode: "global",
  copyright: "\xA9 2014-2022 Denis Pushkarev (zloirock.ru)",
  license: "https://github.com/zloirock/core-js/blob/v3.22.5/LICENSE",
  source: "https://github.com/zloirock/core-js"
});
var global$w = global$C;
var requireObjectCoercible$2 = requireObjectCoercible$4;
var Object$4 = global$w.Object;
var toObject$5 = function(argument) {
  return Object$4(requireObjectCoercible$2(argument));
};
var uncurryThis$i = functionUncurryThis;
var toObject$4 = toObject$5;
var hasOwnProperty = uncurryThis$i({}.hasOwnProperty);
var hasOwnProperty_1 = Object.hasOwn || function hasOwn2(it, key) {
  return hasOwnProperty(toObject$4(it), key);
};
var uncurryThis$h = functionUncurryThis;
var id = 0;
var postfix = Math.random();
var toString$5 = uncurryThis$h(1 .toString);
var uid$2 = function(key) {
  return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString$5(++id + postfix, 36);
};
var global$v = global$C;
var isCallable$h = isCallable$j;
var aFunction = function(argument) {
  return isCallable$h(argument) ? argument : void 0;
};
var getBuiltIn$5 = function(namespace, method) {
  return arguments.length < 2 ? aFunction(global$v[namespace]) : global$v[namespace] && global$v[namespace][method];
};
var getBuiltIn$4 = getBuiltIn$5;
var engineUserAgent = getBuiltIn$4("navigator", "userAgent") || "";
var global$u = global$C;
var userAgent = engineUserAgent;
var process$1 = global$u.process;
var Deno = global$u.Deno;
var versions = process$1 && process$1.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;
if (v8) {
  match = v8.split(".");
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match)
      version = +match[1];
  }
}
var engineV8Version = version;
var V8_VERSION = engineV8Version;
var fails$g = fails$j;
var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$g(function() {
  var symbol = Symbol();
  return !String(symbol) || !(Object(symbol) instanceof Symbol) || !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});
var NATIVE_SYMBOL$1 = nativeSymbol;
var useSymbolAsUid = NATIVE_SYMBOL$1 && !Symbol.sham && typeof Symbol.iterator == "symbol";
var global$t = global$C;
var shared$3 = shared$4.exports;
var hasOwn$a = hasOwnProperty_1;
var uid$1 = uid$2;
var NATIVE_SYMBOL = nativeSymbol;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;
var WellKnownSymbolsStore = shared$3("wks");
var Symbol$1 = global$t.Symbol;
var symbolFor = Symbol$1 && Symbol$1["for"];
var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;
var wellKnownSymbol$e = function(name) {
  if (!hasOwn$a(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == "string")) {
    var description = "Symbol." + name;
    if (NATIVE_SYMBOL && hasOwn$a(Symbol$1, name)) {
      WellKnownSymbolsStore[name] = Symbol$1[name];
    } else if (USE_SYMBOL_AS_UID$1 && symbolFor) {
      WellKnownSymbolsStore[name] = symbolFor(description);
    } else {
      WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
    }
  }
  return WellKnownSymbolsStore[name];
};
var global$s = global$C;
var isObject$6 = isObject$8;
var String$4 = global$s.String;
var TypeError$d = global$s.TypeError;
var anObject$c = function(argument) {
  if (isObject$6(argument))
    return argument;
  throw TypeError$d(String$4(argument) + " is not an object");
};
var objectDefineProperties = {};
var fails$f = fails$j;
var descriptors = !fails$f(function() {
  return Object.defineProperty({}, 1, { get: function() {
    return 7;
  } })[1] != 7;
});
var DESCRIPTORS$b = descriptors;
var fails$e = fails$j;
var v8PrototypeDefineBug = DESCRIPTORS$b && fails$e(function() {
  return Object.defineProperty(function() {
  }, "prototype", {
    value: 42,
    writable: false
  }).prototype != 42;
});
var objectDefineProperty = {};
var DESCRIPTORS$a = descriptors;
var fails$d = fails$j;
var createElement = documentCreateElement$2;
var ie8DomDefine = !DESCRIPTORS$a && !fails$d(function() {
  return Object.defineProperty(createElement("div"), "a", {
    get: function() {
      return 7;
    }
  }).a != 7;
});
var NATIVE_BIND$2 = functionBindNative;
var call$d = Function.prototype.call;
var functionCall = NATIVE_BIND$2 ? call$d.bind(call$d) : function() {
  return call$d.apply(call$d, arguments);
};
var uncurryThis$g = functionUncurryThis;
var objectIsPrototypeOf = uncurryThis$g({}.isPrototypeOf);
var global$r = global$C;
var getBuiltIn$3 = getBuiltIn$5;
var isCallable$g = isCallable$j;
var isPrototypeOf$1 = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID = useSymbolAsUid;
var Object$3 = global$r.Object;
var isSymbol$2 = USE_SYMBOL_AS_UID ? function(it) {
  return typeof it == "symbol";
} : function(it) {
  var $Symbol = getBuiltIn$3("Symbol");
  return isCallable$g($Symbol) && isPrototypeOf$1($Symbol.prototype, Object$3(it));
};
var global$q = global$C;
var String$3 = global$q.String;
var tryToString$2 = function(argument) {
  try {
    return String$3(argument);
  } catch (error) {
    return "Object";
  }
};
var global$p = global$C;
var isCallable$f = isCallable$j;
var tryToString$1 = tryToString$2;
var TypeError$c = global$p.TypeError;
var aCallable$3 = function(argument) {
  if (isCallable$f(argument))
    return argument;
  throw TypeError$c(tryToString$1(argument) + " is not a function");
};
var aCallable$2 = aCallable$3;
var getMethod$4 = function(V, P) {
  var func = V[P];
  return func == null ? void 0 : aCallable$2(func);
};
var global$o = global$C;
var call$c = functionCall;
var isCallable$e = isCallable$j;
var isObject$5 = isObject$8;
var TypeError$b = global$o.TypeError;
var ordinaryToPrimitive$1 = function(input, pref) {
  var fn, val;
  if (pref === "string" && isCallable$e(fn = input.toString) && !isObject$5(val = call$c(fn, input)))
    return val;
  if (isCallable$e(fn = input.valueOf) && !isObject$5(val = call$c(fn, input)))
    return val;
  if (pref !== "string" && isCallable$e(fn = input.toString) && !isObject$5(val = call$c(fn, input)))
    return val;
  throw TypeError$b("Can't convert object to primitive value");
};
var global$n = global$C;
var call$b = functionCall;
var isObject$4 = isObject$8;
var isSymbol$1 = isSymbol$2;
var getMethod$3 = getMethod$4;
var ordinaryToPrimitive = ordinaryToPrimitive$1;
var wellKnownSymbol$d = wellKnownSymbol$e;
var TypeError$a = global$n.TypeError;
var TO_PRIMITIVE = wellKnownSymbol$d("toPrimitive");
var toPrimitive$1 = function(input, pref) {
  if (!isObject$4(input) || isSymbol$1(input))
    return input;
  var exoticToPrim = getMethod$3(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === void 0)
      pref = "default";
    result = call$b(exoticToPrim, input, pref);
    if (!isObject$4(result) || isSymbol$1(result))
      return result;
    throw TypeError$a("Can't convert object to primitive value");
  }
  if (pref === void 0)
    pref = "number";
  return ordinaryToPrimitive(input, pref);
};
var toPrimitive = toPrimitive$1;
var isSymbol = isSymbol$2;
var toPropertyKey$3 = function(argument) {
  var key = toPrimitive(argument, "string");
  return isSymbol(key) ? key : key + "";
};
var global$m = global$C;
var DESCRIPTORS$9 = descriptors;
var IE8_DOM_DEFINE$1 = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$b = anObject$c;
var toPropertyKey$2 = toPropertyKey$3;
var TypeError$9 = global$m.TypeError;
var $defineProperty = Object.defineProperty;
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = "enumerable";
var CONFIGURABLE$1 = "configurable";
var WRITABLE = "writable";
objectDefineProperty.f = DESCRIPTORS$9 ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty2(O, P, Attributes) {
  anObject$b(O);
  P = toPropertyKey$2(P);
  anObject$b(Attributes);
  if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  }
  return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty3(O, P, Attributes) {
  anObject$b(O);
  P = toPropertyKey$2(P);
  anObject$b(Attributes);
  if (IE8_DOM_DEFINE$1)
    try {
      return $defineProperty(O, P, Attributes);
    } catch (error) {
    }
  if ("get" in Attributes || "set" in Attributes)
    throw TypeError$9("Accessors not supported");
  if ("value" in Attributes)
    O[P] = Attributes.value;
  return O;
};
var ceil = Math.ceil;
var floor$4 = Math.floor;
var toIntegerOrInfinity$4 = function(argument) {
  var number = +argument;
  return number !== number || number === 0 ? 0 : (number > 0 ? floor$4 : ceil)(number);
};
var toIntegerOrInfinity$3 = toIntegerOrInfinity$4;
var max$2 = Math.max;
var min$2 = Math.min;
var toAbsoluteIndex$2 = function(index, length) {
  var integer = toIntegerOrInfinity$3(index);
  return integer < 0 ? max$2(integer + length, 0) : min$2(integer, length);
};
var toIntegerOrInfinity$2 = toIntegerOrInfinity$4;
var min$1 = Math.min;
var toLength$2 = function(argument) {
  return argument > 0 ? min$1(toIntegerOrInfinity$2(argument), 9007199254740991) : 0;
};
var toLength$1 = toLength$2;
var lengthOfArrayLike$3 = function(obj) {
  return toLength$1(obj.length);
};
var toIndexedObject$4 = toIndexedObject$5;
var toAbsoluteIndex$1 = toAbsoluteIndex$2;
var lengthOfArrayLike$2 = lengthOfArrayLike$3;
var createMethod$1 = function(IS_INCLUDES) {
  return function($this, el, fromIndex) {
    var O = toIndexedObject$4($this);
    var length = lengthOfArrayLike$2(O);
    var index = toAbsoluteIndex$1(fromIndex, length);
    var value;
    if (IS_INCLUDES && el != el)
      while (length > index) {
        value = O[index++];
        if (value != value)
          return true;
      }
    else
      for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el)
          return IS_INCLUDES || index || 0;
      }
    return !IS_INCLUDES && -1;
  };
};
var arrayIncludes = {
  includes: createMethod$1(true),
  indexOf: createMethod$1(false)
};
var hiddenKeys$4 = {};
var uncurryThis$f = functionUncurryThis;
var hasOwn$9 = hasOwnProperty_1;
var toIndexedObject$3 = toIndexedObject$5;
var indexOf$1 = arrayIncludes.indexOf;
var hiddenKeys$3 = hiddenKeys$4;
var push$4 = uncurryThis$f([].push);
var objectKeysInternal = function(object, names) {
  var O = toIndexedObject$3(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O)
    !hasOwn$9(hiddenKeys$3, key) && hasOwn$9(O, key) && push$4(result, key);
  while (names.length > i)
    if (hasOwn$9(O, key = names[i++])) {
      ~indexOf$1(result, key) || push$4(result, key);
    }
  return result;
};
var enumBugKeys$3 = [
  "constructor",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf"
];
var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;
var objectKeys$2 = Object.keys || function keys2(O) {
  return internalObjectKeys$1(O, enumBugKeys$2);
};
var DESCRIPTORS$8 = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule$4 = objectDefineProperty;
var anObject$a = anObject$c;
var toIndexedObject$2 = toIndexedObject$5;
var objectKeys$1 = objectKeys$2;
objectDefineProperties.f = DESCRIPTORS$8 && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$a(O);
  var props = toIndexedObject$2(Properties);
  var keys4 = objectKeys$1(Properties);
  var length = keys4.length;
  var index = 0;
  var key;
  while (length > index)
    definePropertyModule$4.f(O, key = keys4[index++], props[key]);
  return O;
};
var getBuiltIn$2 = getBuiltIn$5;
var html$1 = getBuiltIn$2("document", "documentElement");
var shared$2 = shared$4.exports;
var uid = uid$2;
var keys$2 = shared$2("keys");
var sharedKey$3 = function(key) {
  return keys$2[key] || (keys$2[key] = uid(key));
};
var anObject$9 = anObject$c;
var definePropertiesModule = objectDefineProperties;
var enumBugKeys$1 = enumBugKeys$3;
var hiddenKeys$2 = hiddenKeys$4;
var html = html$1;
var documentCreateElement = documentCreateElement$2;
var sharedKey$2 = sharedKey$3;
var GT = ">";
var LT = "<";
var PROTOTYPE = "prototype";
var SCRIPT = "script";
var IE_PROTO$1 = sharedKey$2("IE_PROTO");
var EmptyConstructor = function() {
};
var scriptTag = function(content) {
  return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
};
var NullProtoObjectViaActiveX = function(activeXDocument2) {
  activeXDocument2.write(scriptTag(""));
  activeXDocument2.close();
  var temp = activeXDocument2.parentWindow.Object;
  activeXDocument2 = null;
  return temp;
};
var NullProtoObjectViaIFrame = function() {
  var iframe = documentCreateElement("iframe");
  var JS = "java" + SCRIPT + ":";
  var iframeDocument;
  iframe.style.display = "none";
  html.appendChild(iframe);
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag("document.F=Object"));
  iframeDocument.close();
  return iframeDocument.F;
};
var activeXDocument;
var NullProtoObject = function() {
  try {
    activeXDocument = new ActiveXObject("htmlfile");
  } catch (error) {
  }
  NullProtoObject = typeof document != "undefined" ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument);
  var length = enumBugKeys$1.length;
  while (length--)
    delete NullProtoObject[PROTOTYPE][enumBugKeys$1[length]];
  return NullProtoObject();
};
hiddenKeys$2[IE_PROTO$1] = true;
var objectCreate = Object.create || function create2(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject$9(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    result[IE_PROTO$1] = O;
  } else
    result = NullProtoObject();
  return Properties === void 0 ? result : definePropertiesModule.f(result, Properties);
};
var wellKnownSymbol$c = wellKnownSymbol$e;
var create$3 = objectCreate;
var definePropertyModule$3 = objectDefineProperty;
var UNSCOPABLES = wellKnownSymbol$c("unscopables");
var ArrayPrototype$1 = Array.prototype;
if (ArrayPrototype$1[UNSCOPABLES] == void 0) {
  definePropertyModule$3.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$3(null)
  });
}
var addToUnscopables$3 = function(key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};
var iterators = {};
var uncurryThis$e = functionUncurryThis;
var isCallable$d = isCallable$j;
var store$1 = sharedStore;
var functionToString = uncurryThis$e(Function.toString);
if (!isCallable$d(store$1.inspectSource)) {
  store$1.inspectSource = function(it) {
    return functionToString(it);
  };
}
var inspectSource$3 = store$1.inspectSource;
var global$l = global$C;
var isCallable$c = isCallable$j;
var inspectSource$2 = inspectSource$3;
var WeakMap$2 = global$l.WeakMap;
var nativeWeakMap = isCallable$c(WeakMap$2) && /native code/.test(inspectSource$2(WeakMap$2));
var createPropertyDescriptor$5 = function(bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value
  };
};
var DESCRIPTORS$7 = descriptors;
var definePropertyModule$2 = objectDefineProperty;
var createPropertyDescriptor$4 = createPropertyDescriptor$5;
var createNonEnumerableProperty$6 = DESCRIPTORS$7 ? function(object, key, value) {
  return definePropertyModule$2.f(object, key, createPropertyDescriptor$4(1, value));
} : function(object, key, value) {
  object[key] = value;
  return object;
};
var NATIVE_WEAK_MAP = nativeWeakMap;
var global$k = global$C;
var uncurryThis$d = functionUncurryThis;
var isObject$3 = isObject$8;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$6;
var hasOwn$8 = hasOwnProperty_1;
var shared$1 = sharedStore;
var sharedKey$1 = sharedKey$3;
var hiddenKeys$1 = hiddenKeys$4;
var OBJECT_ALREADY_INITIALIZED = "Object already initialized";
var TypeError$8 = global$k.TypeError;
var WeakMap$1 = global$k.WeakMap;
var set, get$2, has;
var enforce = function(it) {
  return has(it) ? get$2(it) : set(it, {});
};
var getterFor = function(TYPE) {
  return function(it) {
    var state;
    if (!isObject$3(it) || (state = get$2(it)).type !== TYPE) {
      throw TypeError$8("Incompatible receiver, " + TYPE + " required");
    }
    return state;
  };
};
if (NATIVE_WEAK_MAP || shared$1.state) {
  var store = shared$1.state || (shared$1.state = new WeakMap$1());
  var wmget = uncurryThis$d(store.get);
  var wmhas = uncurryThis$d(store.has);
  var wmset = uncurryThis$d(store.set);
  set = function(it, metadata) {
    if (wmhas(store, it))
      throw new TypeError$8(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset(store, it, metadata);
    return metadata;
  };
  get$2 = function(it) {
    return wmget(store, it) || {};
  };
  has = function(it) {
    return wmhas(store, it);
  };
} else {
  var STATE = sharedKey$1("state");
  hiddenKeys$1[STATE] = true;
  set = function(it, metadata) {
    if (hasOwn$8(it, STATE))
      throw new TypeError$8(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$5(it, STATE, metadata);
    return metadata;
  };
  get$2 = function(it) {
    return hasOwn$8(it, STATE) ? it[STATE] : {};
  };
  has = function(it) {
    return hasOwn$8(it, STATE);
  };
}
var internalState = {
  set,
  get: get$2,
  has,
  enforce,
  getterFor
};
var objectGetOwnPropertyDescriptor = {};
var objectPropertyIsEnumerable = {};
var $propertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;
var NASHORN_BUG = getOwnPropertyDescriptor$2 && !$propertyIsEnumerable.call({ 1: 2 }, 1);
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$2(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;
var DESCRIPTORS$6 = descriptors;
var call$a = functionCall;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var createPropertyDescriptor$3 = createPropertyDescriptor$5;
var toIndexedObject$1 = toIndexedObject$5;
var toPropertyKey$1 = toPropertyKey$3;
var hasOwn$7 = hasOwnProperty_1;
var IE8_DOM_DEFINE = ie8DomDefine;
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$6 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor2(O, P) {
  O = toIndexedObject$1(O);
  P = toPropertyKey$1(P);
  if (IE8_DOM_DEFINE)
    try {
      return $getOwnPropertyDescriptor(O, P);
    } catch (error) {
    }
  if (hasOwn$7(O, P))
    return createPropertyDescriptor$3(!call$a(propertyIsEnumerableModule$1.f, O, P), O[P]);
};
var makeBuiltIn$3 = { exports: {} };
var DESCRIPTORS$5 = descriptors;
var hasOwn$6 = hasOwnProperty_1;
var FunctionPrototype$1 = Function.prototype;
var getDescriptor = DESCRIPTORS$5 && Object.getOwnPropertyDescriptor;
var EXISTS = hasOwn$6(FunctionPrototype$1, "name");
var PROPER = EXISTS && function something() {
}.name === "something";
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$5 || DESCRIPTORS$5 && getDescriptor(FunctionPrototype$1, "name").configurable);
var functionName = {
  EXISTS,
  PROPER,
  CONFIGURABLE
};
var fails$c = fails$j;
var isCallable$b = isCallable$j;
var hasOwn$5 = hasOwnProperty_1;
var DESCRIPTORS$4 = descriptors;
var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
var inspectSource$1 = inspectSource$3;
var InternalStateModule$4 = internalState;
var enforceInternalState = InternalStateModule$4.enforce;
var getInternalState$3 = InternalStateModule$4.get;
var defineProperty$4 = Object.defineProperty;
var CONFIGURABLE_LENGTH = DESCRIPTORS$4 && !fails$c(function() {
  return defineProperty$4(function() {
  }, "length", { value: 8 }).length !== 8;
});
var TEMPLATE = String(String).split("String");
var makeBuiltIn$2 = makeBuiltIn$3.exports = function(value, name, options) {
  if (String(name).slice(0, 7) === "Symbol(") {
    name = "[" + String(name).replace(/^Symbol\(([^)]*)\)/, "$1") + "]";
  }
  if (options && options.getter)
    name = "get " + name;
  if (options && options.setter)
    name = "set " + name;
  if (!hasOwn$5(value, "name") || CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name) {
    defineProperty$4(value, "name", { value: name, configurable: true });
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$5(options, "arity") && value.length !== options.arity) {
    defineProperty$4(value, "length", { value: options.arity });
  }
  if (options && hasOwn$5(options, "constructor") && options.constructor) {
    if (DESCRIPTORS$4)
      try {
        defineProperty$4(value, "prototype", { writable: false });
      } catch (error) {
      }
  } else
    value.prototype = void 0;
  var state = enforceInternalState(value);
  if (!hasOwn$5(state, "source")) {
    state.source = TEMPLATE.join(typeof name == "string" ? name : "");
  }
  return value;
};
Function.prototype.toString = makeBuiltIn$2(function toString2() {
  return isCallable$b(this) && getInternalState$3(this).source || inspectSource$1(this);
}, "toString");
var global$j = global$C;
var isCallable$a = isCallable$j;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$6;
var makeBuiltIn$1 = makeBuiltIn$3.exports;
var setGlobal$1 = setGlobal$3;
var defineBuiltIn$7 = function(O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var name = options && options.name !== void 0 ? options.name : key;
  if (isCallable$a(value))
    makeBuiltIn$1(value, name, options);
  if (O === global$j) {
    if (simple)
      O[key] = value;
    else
      setGlobal$1(key, value);
    return O;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple)
    O[key] = value;
  else
    createNonEnumerableProperty$4(O, key, value);
  return O;
};
var objectGetOwnPropertyNames = {};
var internalObjectKeys = objectKeysInternal;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys = enumBugKeys.concat("length", "prototype");
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};
var objectGetOwnPropertySymbols = {};
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
var getBuiltIn$1 = getBuiltIn$5;
var uncurryThis$c = functionUncurryThis;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var anObject$8 = anObject$c;
var concat$2 = uncurryThis$c([].concat);
var ownKeys$1 = getBuiltIn$1("Reflect", "ownKeys") || function ownKeys2(it) {
  var keys4 = getOwnPropertyNamesModule.f(anObject$8(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
  return getOwnPropertySymbols ? concat$2(keys4, getOwnPropertySymbols(it)) : keys4;
};
var hasOwn$4 = hasOwnProperty_1;
var ownKeys = ownKeys$1;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var definePropertyModule$1 = objectDefineProperty;
var copyConstructorProperties$1 = function(target, source, exceptions) {
  var keys4 = ownKeys(source);
  var defineProperty4 = definePropertyModule$1.f;
  var getOwnPropertyDescriptor3 = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys4.length; i++) {
    var key = keys4[i];
    if (!hasOwn$4(target, key) && !(exceptions && hasOwn$4(exceptions, key))) {
      defineProperty4(target, key, getOwnPropertyDescriptor3(source, key));
    }
  }
};
var fails$b = fails$j;
var isCallable$9 = isCallable$j;
var replacement = /#|\.prototype\./;
var isForced$1 = function(feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true : value == NATIVE ? false : isCallable$9(detection) ? fails$b(detection) : !!detection;
};
var normalize = isForced$1.normalize = function(string) {
  return String(string).replace(replacement, ".").toLowerCase();
};
var data = isForced$1.data = {};
var NATIVE = isForced$1.NATIVE = "N";
var POLYFILL = isForced$1.POLYFILL = "P";
var isForced_1 = isForced$1;
var global$i = global$C;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$6;
var defineBuiltIn$6 = defineBuiltIn$7;
var setGlobal = setGlobal$3;
var copyConstructorProperties = copyConstructorProperties$1;
var isForced = isForced_1;
var _export = function(options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$i;
  } else if (STATIC) {
    target = global$i[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global$i[TARGET] || {}).prototype;
  }
  if (target)
    for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(target, key);
        targetProperty = descriptor && descriptor.value;
      } else
        targetProperty = target[key];
      FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
      if (!FORCED && targetProperty !== void 0) {
        if (typeof sourceProperty == typeof targetProperty)
          continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      if (options.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty$3(sourceProperty, "sham", true);
      }
      defineBuiltIn$6(target, key, sourceProperty, options);
    }
};
var fails$a = fails$j;
var correctPrototypeGetter = !fails$a(function() {
  function F() {
  }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});
var global$h = global$C;
var hasOwn$3 = hasOwnProperty_1;
var isCallable$8 = isCallable$j;
var toObject$3 = toObject$5;
var sharedKey = sharedKey$3;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;
var IE_PROTO = sharedKey("IE_PROTO");
var Object$2 = global$h.Object;
var ObjectPrototype = Object$2.prototype;
var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object$2.getPrototypeOf : function(O) {
  var object = toObject$3(O);
  if (hasOwn$3(object, IE_PROTO))
    return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$8(constructor) && object instanceof constructor) {
    return constructor.prototype;
  }
  return object instanceof Object$2 ? ObjectPrototype : null;
};
var fails$9 = fails$j;
var isCallable$7 = isCallable$j;
var getPrototypeOf$1 = objectGetPrototypeOf;
var defineBuiltIn$5 = defineBuiltIn$7;
var wellKnownSymbol$b = wellKnownSymbol$e;
var ITERATOR$6 = wellKnownSymbol$b("iterator");
var BUGGY_SAFARI_ITERATORS$1 = false;
var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;
if ([].keys) {
  arrayIterator = [].keys();
  if (!("next" in arrayIterator))
    BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype)
      IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
  }
}
var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == void 0 || fails$9(function() {
  var test2 = {};
  return IteratorPrototype$2[ITERATOR$6].call(test2) !== test2;
});
if (NEW_ITERATOR_PROTOTYPE)
  IteratorPrototype$2 = {};
if (!isCallable$7(IteratorPrototype$2[ITERATOR$6])) {
  defineBuiltIn$5(IteratorPrototype$2, ITERATOR$6, function() {
    return this;
  });
}
var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$2,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};
var defineProperty$3 = objectDefineProperty.f;
var hasOwn$2 = hasOwnProperty_1;
var wellKnownSymbol$a = wellKnownSymbol$e;
var TO_STRING_TAG$3 = wellKnownSymbol$a("toStringTag");
var setToStringTag$4 = function(target, TAG, STATIC) {
  if (target && !STATIC)
    target = target.prototype;
  if (target && !hasOwn$2(target, TO_STRING_TAG$3)) {
    defineProperty$3(target, TO_STRING_TAG$3, { configurable: true, value: TAG });
  }
};
var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var create$2 = objectCreate;
var createPropertyDescriptor$2 = createPropertyDescriptor$5;
var setToStringTag$3 = setToStringTag$4;
var Iterators$4 = iterators;
var returnThis$1 = function() {
  return this;
};
var createIteratorConstructor$2 = function(IteratorConstructor, NAME, next3, ENUMERABLE_NEXT) {
  var TO_STRING_TAG2 = NAME + " Iterator";
  IteratorConstructor.prototype = create$2(IteratorPrototype$1, { next: createPropertyDescriptor$2(+!ENUMERABLE_NEXT, next3) });
  setToStringTag$3(IteratorConstructor, TO_STRING_TAG2, false);
  Iterators$4[TO_STRING_TAG2] = returnThis$1;
  return IteratorConstructor;
};
var global$g = global$C;
var isCallable$6 = isCallable$j;
var String$2 = global$g.String;
var TypeError$7 = global$g.TypeError;
var aPossiblePrototype$1 = function(argument) {
  if (typeof argument == "object" || isCallable$6(argument))
    return argument;
  throw TypeError$7("Can't set " + String$2(argument) + " as a prototype");
};
var uncurryThis$b = functionUncurryThis;
var anObject$7 = anObject$c;
var aPossiblePrototype = aPossiblePrototype$1;
var objectSetPrototypeOf = Object.setPrototypeOf || ("__proto__" in {} ? function() {
  var CORRECT_SETTER = false;
  var test2 = {};
  var setter;
  try {
    setter = uncurryThis$b(Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set);
    setter(test2, []);
    CORRECT_SETTER = test2 instanceof Array;
  } catch (error) {
  }
  return function setPrototypeOf2(O, proto) {
    anObject$7(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER)
      setter(O, proto);
    else
      O.__proto__ = proto;
    return O;
  };
}() : void 0);
var $$4 = _export;
var call$9 = functionCall;
var FunctionName = functionName;
var isCallable$5 = isCallable$j;
var createIteratorConstructor$1 = createIteratorConstructor$2;
var getPrototypeOf = objectGetPrototypeOf;
var setPrototypeOf = objectSetPrototypeOf;
var setToStringTag$2 = setToStringTag$4;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$6;
var defineBuiltIn$4 = defineBuiltIn$7;
var wellKnownSymbol$9 = wellKnownSymbol$e;
var Iterators$3 = iterators;
var IteratorsCore = iteratorsCore;
var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$5 = wellKnownSymbol$9("iterator");
var KEYS = "keys";
var VALUES = "values";
var ENTRIES = "entries";
var returnThis = function() {
  return this;
};
var defineIterator$2 = function(Iterable, NAME, IteratorConstructor, next3, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$1(IteratorConstructor, NAME, next3);
  var getIterationMethod = function(KIND) {
    if (KIND === DEFAULT && defaultIterator)
      return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype)
      return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS:
        return function keys4() {
          return new IteratorConstructor(this, KIND);
        };
      case VALUES:
        return function values3() {
          return new IteratorConstructor(this, KIND);
        };
      case ENTRIES:
        return function entries2() {
          return new IteratorConstructor(this, KIND);
        };
    }
    return function() {
      return new IteratorConstructor(this);
    };
  };
  var TO_STRING_TAG2 = NAME + " Iterator";
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$5] || IterablePrototype["@@iterator"] || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == "Array" ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable$5(CurrentIteratorPrototype[ITERATOR$5])) {
          defineBuiltIn$4(CurrentIteratorPrototype, ITERATOR$5, returnThis);
        }
      }
      setToStringTag$2(CurrentIteratorPrototype, TO_STRING_TAG2, true);
    }
  }
  if (PROPER_FUNCTION_NAME && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty$2(IterablePrototype, "name", VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values3() {
        return call$9(nativeIterator, this);
      };
    }
  }
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED)
      for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          defineBuiltIn$4(IterablePrototype, KEY, methods[KEY]);
        }
      }
    else
      $$4({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }
  if (IterablePrototype[ITERATOR$5] !== defaultIterator) {
    defineBuiltIn$4(IterablePrototype, ITERATOR$5, defaultIterator, { name: DEFAULT });
  }
  Iterators$3[NAME] = defaultIterator;
  return methods;
};
var toIndexedObject = toIndexedObject$5;
var addToUnscopables$2 = addToUnscopables$3;
var Iterators$2 = iterators;
var InternalStateModule$3 = internalState;
var defineProperty$2 = objectDefineProperty.f;
var defineIterator$1 = defineIterator$2;
var DESCRIPTORS$3 = descriptors;
var ARRAY_ITERATOR = "Array Iterator";
var setInternalState$3 = InternalStateModule$3.set;
var getInternalState$2 = InternalStateModule$3.getterFor(ARRAY_ITERATOR);
var es_array_iterator = defineIterator$1(Array, "Array", function(iterated, kind) {
  setInternalState$3(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated),
    index: 0,
    kind
  });
}, function() {
  var state = getInternalState$2(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = void 0;
    return { value: void 0, done: true };
  }
  if (kind == "keys")
    return { value: index, done: false };
  if (kind == "values")
    return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, "values");
var values = Iterators$2.Arguments = Iterators$2.Array;
addToUnscopables$2("keys");
addToUnscopables$2("values");
addToUnscopables$2("entries");
if (DESCRIPTORS$3 && values.name !== "values")
  try {
    defineProperty$2(values, "name", { value: "values" });
  } catch (error) {
  }
var global$f = global$C;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$6;
var wellKnownSymbol$8 = wellKnownSymbol$e;
var ITERATOR$4 = wellKnownSymbol$8("iterator");
var TO_STRING_TAG$2 = wellKnownSymbol$8("toStringTag");
var ArrayValues = ArrayIteratorMethods.values;
var handlePrototype = function(CollectionPrototype, COLLECTION_NAME2) {
  if (CollectionPrototype) {
    if (CollectionPrototype[ITERATOR$4] !== ArrayValues)
      try {
        createNonEnumerableProperty$1(CollectionPrototype, ITERATOR$4, ArrayValues);
      } catch (error) {
        CollectionPrototype[ITERATOR$4] = ArrayValues;
      }
    if (!CollectionPrototype[TO_STRING_TAG$2]) {
      createNonEnumerableProperty$1(CollectionPrototype, TO_STRING_TAG$2, COLLECTION_NAME2);
    }
    if (DOMIterables[COLLECTION_NAME2])
      for (var METHOD_NAME in ArrayIteratorMethods) {
        if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME])
          try {
            createNonEnumerableProperty$1(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
          } catch (error) {
            CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
          }
      }
  }
};
for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(global$f[COLLECTION_NAME] && global$f[COLLECTION_NAME].prototype, COLLECTION_NAME);
}
handlePrototype(DOMTokenListPrototype, "DOMTokenList");
var wellKnownSymbol$7 = wellKnownSymbol$e;
var TO_STRING_TAG$1 = wellKnownSymbol$7("toStringTag");
var test = {};
test[TO_STRING_TAG$1] = "z";
var toStringTagSupport = String(test) === "[object z]";
var global$e = global$C;
var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var isCallable$4 = isCallable$j;
var classofRaw = classofRaw$1;
var wellKnownSymbol$6 = wellKnownSymbol$e;
var TO_STRING_TAG = wellKnownSymbol$6("toStringTag");
var Object$1 = global$e.Object;
var CORRECT_ARGUMENTS = classofRaw(function() {
  return arguments;
}()) == "Arguments";
var tryGet = function(it, key) {
  try {
    return it[key];
  } catch (error) {
  }
};
var classof$5 = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
  var O, tag, result;
  return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = Object$1(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) == "Object" && isCallable$4(O.callee) ? "Arguments" : result;
};
var global$d = global$C;
var classof$4 = classof$5;
var String$1 = global$d.String;
var toString$4 = function(argument) {
  if (classof$4(argument) === "Symbol")
    throw TypeError("Cannot convert a Symbol value to a string");
  return String$1(argument);
};
var uncurryThis$a = functionUncurryThis;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$4;
var toString$3 = toString$4;
var requireObjectCoercible$1 = requireObjectCoercible$4;
var charAt$6 = uncurryThis$a("".charAt);
var charCodeAt$1 = uncurryThis$a("".charCodeAt);
var stringSlice$5 = uncurryThis$a("".slice);
var createMethod = function(CONVERT_TO_STRING) {
  return function($this, pos) {
    var S = toString$3(requireObjectCoercible$1($this));
    var position = toIntegerOrInfinity$1(pos);
    var size2 = S.length;
    var first, second;
    if (position < 0 || position >= size2)
      return CONVERT_TO_STRING ? "" : void 0;
    first = charCodeAt$1(S, position);
    return first < 55296 || first > 56319 || position + 1 === size2 || (second = charCodeAt$1(S, position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? charAt$6(S, position) : first : CONVERT_TO_STRING ? stringSlice$5(S, position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
  };
};
var stringMultibyte = {
  codeAt: createMethod(false),
  charAt: createMethod(true)
};
var charAt$5 = stringMultibyte.charAt;
var toString$2 = toString$4;
var InternalStateModule$2 = internalState;
var defineIterator = defineIterator$2;
var STRING_ITERATOR = "String Iterator";
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState$1 = InternalStateModule$2.getterFor(STRING_ITERATOR);
defineIterator(String, "String", function(iterated) {
  setInternalState$2(this, {
    type: STRING_ITERATOR,
    string: toString$2(iterated),
    index: 0
  });
}, function next() {
  var state = getInternalState$1(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length)
    return { value: void 0, done: true };
  point = charAt$5(string, index);
  state.index += point.length;
  return { value: point, done: false };
});
var fails$8 = fails$j;
var wellKnownSymbol$5 = wellKnownSymbol$e;
var IS_PURE = isPure;
var ITERATOR$3 = wellKnownSymbol$5("iterator");
var nativeUrl = !fails$8(function() {
  var url = new URL("b?a=1&b=2&c=3", "http://a");
  var searchParams = url.searchParams;
  var result = "";
  url.pathname = "c%20d";
  searchParams.forEach(function(value, key) {
    searchParams["delete"]("b");
    result += key + value;
  });
  return IS_PURE && !url.toJSON || !searchParams.sort || url.href !== "http://a/c%20d?a=1&c=3" || searchParams.get("c") !== "3" || String(new URLSearchParams("?a=1")) !== "a=1" || !searchParams[ITERATOR$3] || new URL("https://a@b").username !== "a" || new URLSearchParams(new URLSearchParams("a=b")).get("a") !== "b" || new URL("http://\u0442\u0435\u0441\u0442").host !== "xn--e1aybc" || new URL("http://a#\u0431").hash !== "#%D0%B1" || result !== "a1c3" || new URL("http://x", void 0).host !== "x";
});
var uncurryThis$9 = functionUncurryThis;
var aCallable$1 = aCallable$3;
var NATIVE_BIND$1 = functionBindNative;
var bind$3 = uncurryThis$9(uncurryThis$9.bind);
var functionBindContext = function(fn, that) {
  aCallable$1(fn);
  return that === void 0 ? fn : NATIVE_BIND$1 ? bind$3(fn, that) : function() {
    return fn.apply(that, arguments);
  };
};
var makeBuiltIn = makeBuiltIn$3.exports;
var defineProperty$1 = objectDefineProperty;
var defineBuiltInAccessor$1 = function(target, name, descriptor) {
  if (descriptor.get)
    makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set)
    makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty$1.f(target, name, descriptor);
};
var global$c = global$C;
var isPrototypeOf = objectIsPrototypeOf;
var TypeError$6 = global$c.TypeError;
var anInstance$2 = function(it, Prototype) {
  if (isPrototypeOf(Prototype, it))
    return it;
  throw TypeError$6("Incorrect invocation");
};
var DESCRIPTORS$2 = descriptors;
var uncurryThis$8 = functionUncurryThis;
var call$8 = functionCall;
var fails$7 = fails$j;
var objectKeys = objectKeys$2;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$2 = toObject$5;
var IndexedObject = indexedObject;
var $assign = Object.assign;
var defineProperty = Object.defineProperty;
var concat$1 = uncurryThis$8([].concat);
var objectAssign = !$assign || fails$7(function() {
  if (DESCRIPTORS$2 && $assign({ b: 1 }, $assign(defineProperty({}, "a", {
    enumerable: true,
    get: function() {
      defineProperty(this, "b", {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1)
    return true;
  var A = {};
  var B = {};
  var symbol = Symbol();
  var alphabet = "abcdefghijklmnopqrst";
  A[symbol] = 7;
  alphabet.split("").forEach(function(chr) {
    B[chr] = chr;
  });
  return $assign({}, A)[symbol] != 7 || objectKeys($assign({}, B)).join("") != alphabet;
}) ? function assign2(target, source) {
  var T = toObject$2(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable2 = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys4 = getOwnPropertySymbols ? concat$1(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys4.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys4[j++];
      if (!DESCRIPTORS$2 || call$8(propertyIsEnumerable2, S, key))
        T[key] = S[key];
    }
  }
  return T;
} : $assign;
var call$7 = functionCall;
var anObject$6 = anObject$c;
var getMethod$2 = getMethod$4;
var iteratorClose$1 = function(iterator, kind, value) {
  var innerResult, innerError;
  anObject$6(iterator);
  try {
    innerResult = getMethod$2(iterator, "return");
    if (!innerResult) {
      if (kind === "throw")
        throw value;
      return value;
    }
    innerResult = call$7(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === "throw")
    throw value;
  if (innerError)
    throw innerResult;
  anObject$6(innerResult);
  return value;
};
var anObject$5 = anObject$c;
var iteratorClose = iteratorClose$1;
var callWithSafeIterationClosing$1 = function(iterator, fn, value, ENTRIES2) {
  try {
    return ENTRIES2 ? fn(anObject$5(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, "throw", error);
  }
};
var wellKnownSymbol$4 = wellKnownSymbol$e;
var Iterators$1 = iterators;
var ITERATOR$2 = wellKnownSymbol$4("iterator");
var ArrayPrototype = Array.prototype;
var isArrayIteratorMethod$1 = function(it) {
  return it !== void 0 && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$2] === it);
};
var uncurryThis$7 = functionUncurryThis;
var fails$6 = fails$j;
var isCallable$3 = isCallable$j;
var classof$3 = classof$5;
var getBuiltIn = getBuiltIn$5;
var inspectSource = inspectSource$3;
var noop = function() {
};
var empty = [];
var construct = getBuiltIn("Reflect", "construct");
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$3 = uncurryThis$7(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);
var isConstructorModern = function isConstructor2(argument) {
  if (!isCallable$3(argument))
    return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};
var isConstructorLegacy = function isConstructor3(argument) {
  if (!isCallable$3(argument))
    return false;
  switch (classof$3(argument)) {
    case "AsyncFunction":
    case "GeneratorFunction":
    case "AsyncGeneratorFunction":
      return false;
  }
  try {
    return INCORRECT_TO_STRING || !!exec$3(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};
isConstructorLegacy.sham = true;
var isConstructor$1 = !construct || fails$6(function() {
  var called;
  return isConstructorModern(isConstructorModern.call) || !isConstructorModern(Object) || !isConstructorModern(function() {
    called = true;
  }) || called;
}) ? isConstructorLegacy : isConstructorModern;
var toPropertyKey = toPropertyKey$3;
var definePropertyModule = objectDefineProperty;
var createPropertyDescriptor$1 = createPropertyDescriptor$5;
var createProperty$2 = function(object, key, value) {
  var propertyKey = toPropertyKey(key);
  if (propertyKey in object)
    definePropertyModule.f(object, propertyKey, createPropertyDescriptor$1(0, value));
  else
    object[propertyKey] = value;
};
var classof$2 = classof$5;
var getMethod$1 = getMethod$4;
var Iterators = iterators;
var wellKnownSymbol$3 = wellKnownSymbol$e;
var ITERATOR$1 = wellKnownSymbol$3("iterator");
var getIteratorMethod$3 = function(it) {
  if (it != void 0)
    return getMethod$1(it, ITERATOR$1) || getMethod$1(it, "@@iterator") || Iterators[classof$2(it)];
};
var global$b = global$C;
var call$6 = functionCall;
var aCallable = aCallable$3;
var anObject$4 = anObject$c;
var tryToString = tryToString$2;
var getIteratorMethod$2 = getIteratorMethod$3;
var TypeError$5 = global$b.TypeError;
var getIterator$2 = function(argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$2(argument) : usingIterator;
  if (aCallable(iteratorMethod))
    return anObject$4(call$6(iteratorMethod, argument));
  throw TypeError$5(tryToString(argument) + " is not iterable");
};
var global$a = global$C;
var bind$2 = functionBindContext;
var call$5 = functionCall;
var toObject$1 = toObject$5;
var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
var isArrayIteratorMethod = isArrayIteratorMethod$1;
var isConstructor = isConstructor$1;
var lengthOfArrayLike$1 = lengthOfArrayLike$3;
var createProperty$1 = createProperty$2;
var getIterator$1 = getIterator$2;
var getIteratorMethod$1 = getIteratorMethod$3;
var Array$2 = global$a.Array;
var arrayFrom$1 = function from(arrayLike) {
  var O = toObject$1(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : void 0;
  var mapping = mapfn !== void 0;
  if (mapping)
    mapfn = bind$2(mapfn, argumentsLength > 2 ? arguments[2] : void 0);
  var iteratorMethod = getIteratorMethod$1(O);
  var index = 0;
  var length, result, step, iterator, next3, value;
  if (iteratorMethod && !(this == Array$2 && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator$1(O, iteratorMethod);
    next3 = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (; !(step = call$5(next3, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$1(result, index, value);
    }
  } else {
    length = lengthOfArrayLike$1(O);
    result = IS_CONSTRUCTOR ? new this(length) : Array$2(length);
    for (; length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$1(result, index, value);
    }
  }
  result.length = index;
  return result;
};
var global$9 = global$C;
var toAbsoluteIndex = toAbsoluteIndex$2;
var lengthOfArrayLike = lengthOfArrayLike$3;
var createProperty = createProperty$2;
var Array$1 = global$9.Array;
var max$1 = Math.max;
var arraySliceSimple = function(O, start2, end) {
  var length = lengthOfArrayLike(O);
  var k = toAbsoluteIndex(start2, length);
  var fin = toAbsoluteIndex(end === void 0 ? length : end, length);
  var result = Array$1(max$1(fin - k, 0));
  for (var n = 0; k < fin; k++, n++)
    createProperty(result, n, O[k]);
  result.length = n;
  return result;
};
var global$8 = global$C;
var uncurryThis$6 = functionUncurryThis;
var maxInt = 2147483647;
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128;
var delimiter = "-";
var regexNonASCII = /[^\0-\u007E]/;
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g;
var OVERFLOW_ERROR = "Overflow: input needs wider integers to process";
var baseMinusTMin = base - tMin;
var RangeError = global$8.RangeError;
var exec$2 = uncurryThis$6(regexSeparators.exec);
var floor$3 = Math.floor;
var fromCharCode = String.fromCharCode;
var charCodeAt = uncurryThis$6("".charCodeAt);
var join$2 = uncurryThis$6([].join);
var push$3 = uncurryThis$6([].push);
var replace$4 = uncurryThis$6("".replace);
var split$2 = uncurryThis$6("".split);
var toLowerCase$1 = uncurryThis$6("".toLowerCase);
var ucs2decode = function(string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = charCodeAt(string, counter++);
    if (value >= 55296 && value <= 56319 && counter < length) {
      var extra = charCodeAt(string, counter++);
      if ((extra & 64512) == 56320) {
        push$3(output, ((value & 1023) << 10) + (extra & 1023) + 65536);
      } else {
        push$3(output, value);
        counter--;
      }
    } else {
      push$3(output, value);
    }
  }
  return output;
};
var digitToBasic = function(digit) {
  return digit + 22 + 75 * (digit < 26);
};
var adapt = function(delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor$3(delta / damp) : delta >> 1;
  delta += floor$3(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor$3(delta / baseMinusTMin);
    k += base;
  }
  return floor$3(k + (baseMinusTMin + 1) * delta / (delta + skew));
};
var encode = function(input) {
  var output = [];
  input = ucs2decode(input);
  var inputLength = input.length;
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 128) {
      push$3(output, fromCharCode(currentValue));
    }
  }
  var basicLength = output.length;
  var handledCPCount = basicLength;
  if (basicLength) {
    push$3(output, delimiter);
  }
  while (handledCPCount < inputLength) {
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor$3((maxInt - delta) / handledCPCountPlusOne)) {
      throw RangeError(OVERFLOW_ERROR);
    }
    delta += (m - n) * handledCPCountPlusOne;
    n = m;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        var q = delta;
        var k = base;
        while (true) {
          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t)
            break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          push$3(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor$3(qMinusT / baseMinusT);
          k += base;
        }
        push$3(output, fromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        handledCPCount++;
      }
    }
    delta++;
    n++;
  }
  return join$2(output, "");
};
var stringPunycodeToAscii = function(input) {
  var encoded = [];
  var labels = split$2(replace$4(toLowerCase$1(input), regexSeparators, "."), ".");
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    push$3(encoded, exec$2(regexNonASCII, label) ? "xn--" + encode(label) : label);
  }
  return join$2(encoded, ".");
};
var global$7 = global$C;
var TypeError$4 = global$7.TypeError;
var validateArgumentsLength$2 = function(passed, required) {
  if (passed < required)
    throw TypeError$4("Not enough arguments");
  return passed;
};
var defineBuiltIn$3 = defineBuiltIn$7;
var defineBuiltIns$1 = function(target, src, options) {
  for (var key in src)
    defineBuiltIn$3(target, key, src[key], options);
  return target;
};
var arraySlice$1 = arraySliceSimple;
var floor$2 = Math.floor;
var mergeSort = function(array, comparefn) {
  var length = array.length;
  var middle = floor$2(length / 2);
  return length < 8 ? insertionSort(array, comparefn) : merge$3(array, mergeSort(arraySlice$1(array, 0, middle), comparefn), mergeSort(arraySlice$1(array, middle), comparefn), comparefn);
};
var insertionSort = function(array, comparefn) {
  var length = array.length;
  var i = 1;
  var element, j;
  while (i < length) {
    j = i;
    element = array[i];
    while (j && comparefn(array[j - 1], element) > 0) {
      array[j] = array[--j];
    }
    if (j !== i++)
      array[j] = element;
  }
  return array;
};
var merge$3 = function(array, left, right, comparefn) {
  var llength = left.length;
  var rlength = right.length;
  var lindex = 0;
  var rindex = 0;
  while (lindex < llength || rindex < rlength) {
    array[lindex + rindex] = lindex < llength && rindex < rlength ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++] : lindex < llength ? left[lindex++] : right[rindex++];
  }
  return array;
};
var arraySort$1 = mergeSort;
var $$3 = _export;
var global$6 = global$C;
var call$4 = functionCall;
var uncurryThis$5 = functionUncurryThis;
var DESCRIPTORS$1 = descriptors;
var USE_NATIVE_URL$1 = nativeUrl;
var defineBuiltIn$2 = defineBuiltIn$7;
var defineBuiltIns = defineBuiltIns$1;
var setToStringTag$1 = setToStringTag$4;
var createIteratorConstructor = createIteratorConstructor$2;
var InternalStateModule$1 = internalState;
var anInstance$1 = anInstance$2;
var isCallable$2 = isCallable$j;
var hasOwn$1 = hasOwnProperty_1;
var bind$1 = functionBindContext;
var classof$1 = classof$5;
var anObject$3 = anObject$c;
var isObject$2 = isObject$8;
var $toString$1 = toString$4;
var create$1 = objectCreate;
var createPropertyDescriptor = createPropertyDescriptor$5;
var getIterator = getIterator$2;
var getIteratorMethod = getIteratorMethod$3;
var validateArgumentsLength$1 = validateArgumentsLength$2;
var wellKnownSymbol$2 = wellKnownSymbol$e;
var arraySort = arraySort$1;
var ITERATOR = wellKnownSymbol$2("iterator");
var URL_SEARCH_PARAMS = "URLSearchParams";
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + "Iterator";
var setInternalState$1 = InternalStateModule$1.set;
var getInternalParamsState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS_ITERATOR);
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var safeGetBuiltIn = function(name) {
  if (!DESCRIPTORS$1)
    return global$6[name];
  var descriptor = getOwnPropertyDescriptor(global$6, name);
  return descriptor && descriptor.value;
};
var nativeFetch = safeGetBuiltIn("fetch");
var NativeRequest = safeGetBuiltIn("Request");
var Headers = safeGetBuiltIn("Headers");
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var HeadersPrototype = Headers && Headers.prototype;
var RegExp$1 = global$6.RegExp;
var TypeError$3 = global$6.TypeError;
var decodeURIComponent = global$6.decodeURIComponent;
var encodeURIComponent$1 = global$6.encodeURIComponent;
var charAt$4 = uncurryThis$5("".charAt);
var join$1 = uncurryThis$5([].join);
var push$2 = uncurryThis$5([].push);
var replace$3 = uncurryThis$5("".replace);
var shift$1 = uncurryThis$5([].shift);
var splice = uncurryThis$5([].splice);
var split$1 = uncurryThis$5("".split);
var stringSlice$4 = uncurryThis$5("".slice);
var plus = /\+/g;
var sequences = Array(4);
var percentSequence = function(bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp$1("((?:%[\\da-f]{2}){" + bytes + "})", "gi"));
};
var percentDecode = function(sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};
var deserialize = function(it) {
  var result = replace$3(it, plus, " ");
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = replace$3(result, percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};
var find = /[!'()~]|%20/g;
var replacements = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "~": "%7E",
  "%20": "+"
};
var replacer = function(match2) {
  return replacements[match2];
};
var serialize = function(it) {
  return replace$3(encodeURIComponent$1(it), find, replacer);
};
var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState$1(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind
  });
}, "Iterator", function next2() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === "keys" ? entry.key : kind === "values" ? entry.value : [entry.key, entry.value];
  }
  return step;
}, true);
var URLSearchParamsState = function(init) {
  this.entries = [];
  this.url = null;
  if (init !== void 0) {
    if (isObject$2(init))
      this.parseObject(init);
    else
      this.parseQuery(typeof init == "string" ? charAt$4(init, 0) === "?" ? stringSlice$4(init, 1) : init : $toString$1(init));
  }
};
URLSearchParamsState.prototype = {
  type: URL_SEARCH_PARAMS,
  bindURL: function(url) {
    this.url = url;
    this.update();
  },
  parseObject: function(object) {
    var iteratorMethod = getIteratorMethod(object);
    var iterator, next3, step, entryIterator, entryNext, first, second;
    if (iteratorMethod) {
      iterator = getIterator(object, iteratorMethod);
      next3 = iterator.next;
      while (!(step = call$4(next3, iterator)).done) {
        entryIterator = getIterator(anObject$3(step.value));
        entryNext = entryIterator.next;
        if ((first = call$4(entryNext, entryIterator)).done || (second = call$4(entryNext, entryIterator)).done || !call$4(entryNext, entryIterator).done)
          throw TypeError$3("Expected sequence with length 2");
        push$2(this.entries, { key: $toString$1(first.value), value: $toString$1(second.value) });
      }
    } else
      for (var key in object)
        if (hasOwn$1(object, key)) {
          push$2(this.entries, { key, value: $toString$1(object[key]) });
        }
  },
  parseQuery: function(query) {
    if (query) {
      var attributes = split$1(query, "&");
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split$1(attribute, "=");
          push$2(this.entries, {
            key: deserialize(shift$1(entry)),
            value: deserialize(join$1(entry, "="))
          });
        }
      }
    }
  },
  serialize: function() {
    var entries2 = this.entries;
    var result = [];
    var index = 0;
    var entry;
    while (index < entries2.length) {
      entry = entries2[index++];
      push$2(result, serialize(entry.key) + "=" + serialize(entry.value));
    }
    return join$1(result, "&");
  },
  update: function() {
    this.entries.length = 0;
    this.parseQuery(this.url.query);
  },
  updateURL: function() {
    if (this.url)
      this.url.update();
  }
};
var URLSearchParamsConstructor = function URLSearchParams2() {
  anInstance$1(this, URLSearchParamsPrototype);
  var init = arguments.length > 0 ? arguments[0] : void 0;
  setInternalState$1(this, new URLSearchParamsState(init));
};
var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
defineBuiltIns(URLSearchParamsPrototype, {
  append: function append(name, value) {
    validateArgumentsLength$1(arguments.length, 2);
    var state = getInternalParamsState(this);
    push$2(state.entries, { key: $toString$1(name), value: $toString$1(value) });
    state.updateURL();
  },
  "delete": function(name) {
    validateArgumentsLength$1(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries2 = state.entries;
    var key = $toString$1(name);
    var index = 0;
    while (index < entries2.length) {
      if (entries2[index].key === key)
        splice(entries2, index, 1);
      else
        index++;
    }
    state.updateURL();
  },
  get: function get2(name) {
    validateArgumentsLength$1(arguments.length, 1);
    var entries2 = getInternalParamsState(this).entries;
    var key = $toString$1(name);
    var index = 0;
    for (; index < entries2.length; index++) {
      if (entries2[index].key === key)
        return entries2[index].value;
    }
    return null;
  },
  getAll: function getAll(name) {
    validateArgumentsLength$1(arguments.length, 1);
    var entries2 = getInternalParamsState(this).entries;
    var key = $toString$1(name);
    var result = [];
    var index = 0;
    for (; index < entries2.length; index++) {
      if (entries2[index].key === key)
        push$2(result, entries2[index].value);
    }
    return result;
  },
  has: function has2(name) {
    validateArgumentsLength$1(arguments.length, 1);
    var entries2 = getInternalParamsState(this).entries;
    var key = $toString$1(name);
    var index = 0;
    while (index < entries2.length) {
      if (entries2[index++].key === key)
        return true;
    }
    return false;
  },
  set: function set2(name, value) {
    validateArgumentsLength$1(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries2 = state.entries;
    var found = false;
    var key = $toString$1(name);
    var val = $toString$1(value);
    var index = 0;
    var entry;
    for (; index < entries2.length; index++) {
      entry = entries2[index];
      if (entry.key === key) {
        if (found)
          splice(entries2, index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found)
      push$2(entries2, { key, value: val });
    state.updateURL();
  },
  sort: function sort() {
    var state = getInternalParamsState(this);
    arraySort(state.entries, function(a, b) {
      return a.key > b.key ? 1 : -1;
    });
    state.updateURL();
  },
  forEach: function forEach(callback) {
    var entries2 = getInternalParamsState(this).entries;
    var boundFunction = bind$1(callback, arguments.length > 1 ? arguments[1] : void 0);
    var index = 0;
    var entry;
    while (index < entries2.length) {
      entry = entries2[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  keys: function keys3() {
    return new URLSearchParamsIterator(this, "keys");
  },
  values: function values2() {
    return new URLSearchParamsIterator(this, "values");
  },
  entries: function entries() {
    return new URLSearchParamsIterator(this, "entries");
  }
}, { enumerable: true });
defineBuiltIn$2(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries, { name: "entries" });
defineBuiltIn$2(URLSearchParamsPrototype, "toString", function toString3() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });
setToStringTag$1(URLSearchParamsConstructor, URL_SEARCH_PARAMS);
$$3({ global: true, constructor: true, forced: !USE_NATIVE_URL$1 }, {
  URLSearchParams: URLSearchParamsConstructor
});
if (!USE_NATIVE_URL$1 && isCallable$2(Headers)) {
  var headersHas = uncurryThis$5(HeadersPrototype.has);
  var headersSet = uncurryThis$5(HeadersPrototype.set);
  var wrapRequestOptions = function(init) {
    if (isObject$2(init)) {
      var body = init.body;
      var headers;
      if (classof$1(body) === URL_SEARCH_PARAMS) {
        headers = init.headers ? new Headers(init.headers) : new Headers();
        if (!headersHas(headers, "content-type")) {
          headersSet(headers, "content-type", "application/x-www-form-urlencoded;charset=UTF-8");
        }
        return create$1(init, {
          body: createPropertyDescriptor(0, $toString$1(body)),
          headers: createPropertyDescriptor(0, headers)
        });
      }
    }
    return init;
  };
  if (isCallable$2(nativeFetch)) {
    $$3({ global: true, enumerable: true, noTargetGet: true, forced: true }, {
      fetch: function fetch2(input) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }
  if (isCallable$2(NativeRequest)) {
    var RequestConstructor = function Request(input) {
      anInstance$1(this, RequestPrototype);
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };
    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;
    $$3({ global: true, constructor: true, noTargetGet: true, forced: true }, {
      Request: RequestConstructor
    });
  }
}
var web_urlSearchParams_constructor = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};
var $$2 = _export;
var DESCRIPTORS = descriptors;
var USE_NATIVE_URL = nativeUrl;
var global$5 = global$C;
var bind = functionBindContext;
var uncurryThis$4 = functionUncurryThis;
var defineBuiltIn$1 = defineBuiltIn$7;
var defineBuiltInAccessor = defineBuiltInAccessor$1;
var anInstance = anInstance$2;
var hasOwn = hasOwnProperty_1;
var assign = objectAssign;
var arrayFrom = arrayFrom$1;
var arraySlice = arraySliceSimple;
var codeAt = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var $toString = toString$4;
var setToStringTag = setToStringTag$4;
var validateArgumentsLength = validateArgumentsLength$2;
var URLSearchParamsModule = web_urlSearchParams_constructor;
var InternalStateModule = internalState;
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor("URL");
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var NativeURL = global$5.URL;
var TypeError$2 = global$5.TypeError;
var parseInt$1 = global$5.parseInt;
var floor$1 = Math.floor;
var pow = Math.pow;
var charAt$3 = uncurryThis$4("".charAt);
var exec$1 = uncurryThis$4(/./.exec);
var join = uncurryThis$4([].join);
var numberToString = uncurryThis$4(1 .toString);
var pop = uncurryThis$4([].pop);
var push$1 = uncurryThis$4([].push);
var replace$2 = uncurryThis$4("".replace);
var shift = uncurryThis$4([].shift);
var split = uncurryThis$4("".split);
var stringSlice$3 = uncurryThis$4("".slice);
var toLowerCase = uncurryThis$4("".toLowerCase);
var unshift = uncurryThis$4([].unshift);
var INVALID_AUTHORITY = "Invalid authority";
var INVALID_SCHEME = "Invalid scheme";
var INVALID_HOST = "Invalid host";
var INVALID_PORT = "Invalid port";
var ALPHA = /[a-z]/i;
var ALPHANUMERIC = /[\d+-.a-z]/i;
var DIGIT = /\d/;
var HEX_START = /^0x/i;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\da-f]+$/i;
var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g;
var TAB_AND_NEW_LINE = /[\t\n\r]/g;
var EOF;
var parseIPv4 = function(input) {
  var parts = split(input, ".");
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == "") {
    parts.length--;
  }
  partsLength = parts.length;
  if (partsLength > 4)
    return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == "")
      return input;
    radix = 10;
    if (part.length > 1 && charAt$3(part, 0) == "0") {
      radix = exec$1(HEX_START, part) ? 16 : 8;
      part = stringSlice$3(part, radix == 8 ? 1 : 2);
    }
    if (part === "") {
      number = 0;
    } else {
      if (!exec$1(radix == 10 ? DEC : radix == 8 ? OCT : HEX, part))
        return input;
      number = parseInt$1(part, radix);
    }
    push$1(numbers, number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength))
        return null;
    } else if (number > 255)
      return null;
  }
  ipv4 = pop(numbers);
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};
var parseIPv6 = function(input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;
  var chr = function() {
    return charAt$3(input, pointer);
  };
  if (chr() == ":") {
    if (charAt$3(input, 1) != ":")
      return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (chr()) {
    if (pieceIndex == 8)
      return;
    if (chr() == ":") {
      if (compress !== null)
        return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && exec$1(HEX, chr())) {
      value = value * 16 + parseInt$1(chr(), 16);
      pointer++;
      length++;
    }
    if (chr() == ".") {
      if (length == 0)
        return;
      pointer -= length;
      if (pieceIndex > 6)
        return;
      numbersSeen = 0;
      while (chr()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (chr() == "." && numbersSeen < 4)
            pointer++;
          else
            return;
        }
        if (!exec$1(DIGIT, chr()))
          return;
        while (exec$1(DIGIT, chr())) {
          number = parseInt$1(chr(), 10);
          if (ipv4Piece === null)
            ipv4Piece = number;
          else if (ipv4Piece == 0)
            return;
          else
            ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255)
            return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4)
          pieceIndex++;
      }
      if (numbersSeen != 4)
        return;
      break;
    } else if (chr() == ":") {
      pointer++;
      if (!chr())
        return;
    } else if (chr())
      return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8)
    return;
  return address;
};
var findLongestZeroSequence = function(ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null)
        currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};
var serializeHost = function(host) {
  var result, index, compress, ignore0;
  if (typeof host == "number") {
    result = [];
    for (index = 0; index < 4; index++) {
      unshift(result, host % 256);
      host = floor$1(host / 256);
    }
    return join(result, ".");
  } else if (typeof host == "object") {
    result = "";
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0)
        continue;
      if (ignore0)
        ignore0 = false;
      if (compress === index) {
        result += index ? ":" : "::";
        ignore0 = true;
      } else {
        result += numberToString(host[index], 16);
        if (index < 7)
          result += ":";
      }
    }
    return "[" + result + "]";
  }
  return host;
};
var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
  " ": 1,
  '"': 1,
  "<": 1,
  ">": 1,
  "`": 1
});
var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
  "#": 1,
  "?": 1,
  "{": 1,
  "}": 1
});
var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
  "/": 1,
  ":": 1,
  ";": 1,
  "=": 1,
  "@": 1,
  "[": 1,
  "\\": 1,
  "]": 1,
  "^": 1,
  "|": 1
});
var percentEncode = function(chr, set3) {
  var code = codeAt(chr, 0);
  return code > 32 && code < 127 && !hasOwn(set3, chr) ? chr : encodeURIComponent(chr);
};
var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
var isWindowsDriveLetter = function(string, normalized) {
  var second;
  return string.length == 2 && exec$1(ALPHA, charAt$3(string, 0)) && ((second = charAt$3(string, 1)) == ":" || !normalized && second == "|");
};
var startsWithWindowsDriveLetter = function(string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(stringSlice$3(string, 0, 2)) && (string.length == 2 || ((third = charAt$3(string, 2)) === "/" || third === "\\" || third === "?" || third === "#"));
};
var isSingleDot = function(segment) {
  return segment === "." || toLowerCase(segment) === "%2e";
};
var isDoubleDot = function(segment) {
  segment = toLowerCase(segment);
  return segment === ".." || segment === "%2e." || segment === ".%2e" || segment === "%2e%2e";
};
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};
var URLState = function(url, isBase, base2) {
  var urlString = $toString(url);
  var baseState, failure, searchParams;
  if (isBase) {
    failure = this.parse(urlString);
    if (failure)
      throw TypeError$2(failure);
    this.searchParams = null;
  } else {
    if (base2 !== void 0)
      baseState = new URLState(base2, true);
    failure = this.parse(urlString, null, baseState);
    if (failure)
      throw TypeError$2(failure);
    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
    searchParams.bindURL(this);
    this.searchParams = searchParams;
  }
};
URLState.prototype = {
  type: "URL",
  parse: function(input, stateOverride, base2) {
    var url = this;
    var state = stateOverride || SCHEME_START;
    var pointer = 0;
    var buffer = "";
    var seenAt = false;
    var seenBracket = false;
    var seenPasswordToken = false;
    var codePoints, chr, bufferCodePoints, failure;
    input = $toString(input);
    if (!stateOverride) {
      url.scheme = "";
      url.username = "";
      url.password = "";
      url.host = null;
      url.port = null;
      url.path = [];
      url.query = null;
      url.fragment = null;
      url.cannotBeABaseURL = false;
      input = replace$2(input, LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, "");
    }
    input = replace$2(input, TAB_AND_NEW_LINE, "");
    codePoints = arrayFrom(input);
    while (pointer <= codePoints.length) {
      chr = codePoints[pointer];
      switch (state) {
        case SCHEME_START:
          if (chr && exec$1(ALPHA, chr)) {
            buffer += toLowerCase(chr);
            state = SCHEME;
          } else if (!stateOverride) {
            state = NO_SCHEME;
            continue;
          } else
            return INVALID_SCHEME;
          break;
        case SCHEME:
          if (chr && (exec$1(ALPHANUMERIC, chr) || chr == "+" || chr == "-" || chr == ".")) {
            buffer += toLowerCase(chr);
          } else if (chr == ":") {
            if (stateOverride && (url.isSpecial() != hasOwn(specialSchemes, buffer) || buffer == "file" && (url.includesCredentials() || url.port !== null) || url.scheme == "file" && !url.host))
              return;
            url.scheme = buffer;
            if (stateOverride) {
              if (url.isSpecial() && specialSchemes[url.scheme] == url.port)
                url.port = null;
              return;
            }
            buffer = "";
            if (url.scheme == "file") {
              state = FILE;
            } else if (url.isSpecial() && base2 && base2.scheme == url.scheme) {
              state = SPECIAL_RELATIVE_OR_AUTHORITY;
            } else if (url.isSpecial()) {
              state = SPECIAL_AUTHORITY_SLASHES;
            } else if (codePoints[pointer + 1] == "/") {
              state = PATH_OR_AUTHORITY;
              pointer++;
            } else {
              url.cannotBeABaseURL = true;
              push$1(url.path, "");
              state = CANNOT_BE_A_BASE_URL_PATH;
            }
          } else if (!stateOverride) {
            buffer = "";
            state = NO_SCHEME;
            pointer = 0;
            continue;
          } else
            return INVALID_SCHEME;
          break;
        case NO_SCHEME:
          if (!base2 || base2.cannotBeABaseURL && chr != "#")
            return INVALID_SCHEME;
          if (base2.cannotBeABaseURL && chr == "#") {
            url.scheme = base2.scheme;
            url.path = arraySlice(base2.path);
            url.query = base2.query;
            url.fragment = "";
            url.cannotBeABaseURL = true;
            state = FRAGMENT;
            break;
          }
          state = base2.scheme == "file" ? FILE : RELATIVE;
          continue;
        case SPECIAL_RELATIVE_OR_AUTHORITY:
          if (chr == "/" && codePoints[pointer + 1] == "/") {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
            pointer++;
          } else {
            state = RELATIVE;
            continue;
          }
          break;
        case PATH_OR_AUTHORITY:
          if (chr == "/") {
            state = AUTHORITY;
            break;
          } else {
            state = PATH;
            continue;
          }
        case RELATIVE:
          url.scheme = base2.scheme;
          if (chr == EOF) {
            url.username = base2.username;
            url.password = base2.password;
            url.host = base2.host;
            url.port = base2.port;
            url.path = arraySlice(base2.path);
            url.query = base2.query;
          } else if (chr == "/" || chr == "\\" && url.isSpecial()) {
            state = RELATIVE_SLASH;
          } else if (chr == "?") {
            url.username = base2.username;
            url.password = base2.password;
            url.host = base2.host;
            url.port = base2.port;
            url.path = arraySlice(base2.path);
            url.query = "";
            state = QUERY;
          } else if (chr == "#") {
            url.username = base2.username;
            url.password = base2.password;
            url.host = base2.host;
            url.port = base2.port;
            url.path = arraySlice(base2.path);
            url.query = base2.query;
            url.fragment = "";
            state = FRAGMENT;
          } else {
            url.username = base2.username;
            url.password = base2.password;
            url.host = base2.host;
            url.port = base2.port;
            url.path = arraySlice(base2.path);
            url.path.length--;
            state = PATH;
            continue;
          }
          break;
        case RELATIVE_SLASH:
          if (url.isSpecial() && (chr == "/" || chr == "\\")) {
            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          } else if (chr == "/") {
            state = AUTHORITY;
          } else {
            url.username = base2.username;
            url.password = base2.password;
            url.host = base2.host;
            url.port = base2.port;
            state = PATH;
            continue;
          }
          break;
        case SPECIAL_AUTHORITY_SLASHES:
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          if (chr != "/" || charAt$3(buffer, pointer + 1) != "/")
            continue;
          pointer++;
          break;
        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
          if (chr != "/" && chr != "\\") {
            state = AUTHORITY;
            continue;
          }
          break;
        case AUTHORITY:
          if (chr == "@") {
            if (seenAt)
              buffer = "%40" + buffer;
            seenAt = true;
            bufferCodePoints = arrayFrom(buffer);
            for (var i = 0; i < bufferCodePoints.length; i++) {
              var codePoint = bufferCodePoints[i];
              if (codePoint == ":" && !seenPasswordToken) {
                seenPasswordToken = true;
                continue;
              }
              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
              if (seenPasswordToken)
                url.password += encodedCodePoints;
              else
                url.username += encodedCodePoints;
            }
            buffer = "";
          } else if (chr == EOF || chr == "/" || chr == "?" || chr == "#" || chr == "\\" && url.isSpecial()) {
            if (seenAt && buffer == "")
              return INVALID_AUTHORITY;
            pointer -= arrayFrom(buffer).length + 1;
            buffer = "";
            state = HOST;
          } else
            buffer += chr;
          break;
        case HOST:
        case HOSTNAME:
          if (stateOverride && url.scheme == "file") {
            state = FILE_HOST;
            continue;
          } else if (chr == ":" && !seenBracket) {
            if (buffer == "")
              return INVALID_HOST;
            failure = url.parseHost(buffer);
            if (failure)
              return failure;
            buffer = "";
            state = PORT;
            if (stateOverride == HOSTNAME)
              return;
          } else if (chr == EOF || chr == "/" || chr == "?" || chr == "#" || chr == "\\" && url.isSpecial()) {
            if (url.isSpecial() && buffer == "")
              return INVALID_HOST;
            if (stateOverride && buffer == "" && (url.includesCredentials() || url.port !== null))
              return;
            failure = url.parseHost(buffer);
            if (failure)
              return failure;
            buffer = "";
            state = PATH_START;
            if (stateOverride)
              return;
            continue;
          } else {
            if (chr == "[")
              seenBracket = true;
            else if (chr == "]")
              seenBracket = false;
            buffer += chr;
          }
          break;
        case PORT:
          if (exec$1(DIGIT, chr)) {
            buffer += chr;
          } else if (chr == EOF || chr == "/" || chr == "?" || chr == "#" || chr == "\\" && url.isSpecial() || stateOverride) {
            if (buffer != "") {
              var port = parseInt$1(buffer, 10);
              if (port > 65535)
                return INVALID_PORT;
              url.port = url.isSpecial() && port === specialSchemes[url.scheme] ? null : port;
              buffer = "";
            }
            if (stateOverride)
              return;
            state = PATH_START;
            continue;
          } else
            return INVALID_PORT;
          break;
        case FILE:
          url.scheme = "file";
          if (chr == "/" || chr == "\\")
            state = FILE_SLASH;
          else if (base2 && base2.scheme == "file") {
            if (chr == EOF) {
              url.host = base2.host;
              url.path = arraySlice(base2.path);
              url.query = base2.query;
            } else if (chr == "?") {
              url.host = base2.host;
              url.path = arraySlice(base2.path);
              url.query = "";
              state = QUERY;
            } else if (chr == "#") {
              url.host = base2.host;
              url.path = arraySlice(base2.path);
              url.query = base2.query;
              url.fragment = "";
              state = FRAGMENT;
            } else {
              if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ""))) {
                url.host = base2.host;
                url.path = arraySlice(base2.path);
                url.shortenPath();
              }
              state = PATH;
              continue;
            }
          } else {
            state = PATH;
            continue;
          }
          break;
        case FILE_SLASH:
          if (chr == "/" || chr == "\\") {
            state = FILE_HOST;
            break;
          }
          if (base2 && base2.scheme == "file" && !startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ""))) {
            if (isWindowsDriveLetter(base2.path[0], true))
              push$1(url.path, base2.path[0]);
            else
              url.host = base2.host;
          }
          state = PATH;
          continue;
        case FILE_HOST:
          if (chr == EOF || chr == "/" || chr == "\\" || chr == "?" || chr == "#") {
            if (!stateOverride && isWindowsDriveLetter(buffer)) {
              state = PATH;
            } else if (buffer == "") {
              url.host = "";
              if (stateOverride)
                return;
              state = PATH_START;
            } else {
              failure = url.parseHost(buffer);
              if (failure)
                return failure;
              if (url.host == "localhost")
                url.host = "";
              if (stateOverride)
                return;
              buffer = "";
              state = PATH_START;
            }
            continue;
          } else
            buffer += chr;
          break;
        case PATH_START:
          if (url.isSpecial()) {
            state = PATH;
            if (chr != "/" && chr != "\\")
              continue;
          } else if (!stateOverride && chr == "?") {
            url.query = "";
            state = QUERY;
          } else if (!stateOverride && chr == "#") {
            url.fragment = "";
            state = FRAGMENT;
          } else if (chr != EOF) {
            state = PATH;
            if (chr != "/")
              continue;
          }
          break;
        case PATH:
          if (chr == EOF || chr == "/" || chr == "\\" && url.isSpecial() || !stateOverride && (chr == "?" || chr == "#")) {
            if (isDoubleDot(buffer)) {
              url.shortenPath();
              if (chr != "/" && !(chr == "\\" && url.isSpecial())) {
                push$1(url.path, "");
              }
            } else if (isSingleDot(buffer)) {
              if (chr != "/" && !(chr == "\\" && url.isSpecial())) {
                push$1(url.path, "");
              }
            } else {
              if (url.scheme == "file" && !url.path.length && isWindowsDriveLetter(buffer)) {
                if (url.host)
                  url.host = "";
                buffer = charAt$3(buffer, 0) + ":";
              }
              push$1(url.path, buffer);
            }
            buffer = "";
            if (url.scheme == "file" && (chr == EOF || chr == "?" || chr == "#")) {
              while (url.path.length > 1 && url.path[0] === "") {
                shift(url.path);
              }
            }
            if (chr == "?") {
              url.query = "";
              state = QUERY;
            } else if (chr == "#") {
              url.fragment = "";
              state = FRAGMENT;
            }
          } else {
            buffer += percentEncode(chr, pathPercentEncodeSet);
          }
          break;
        case CANNOT_BE_A_BASE_URL_PATH:
          if (chr == "?") {
            url.query = "";
            state = QUERY;
          } else if (chr == "#") {
            url.fragment = "";
            state = FRAGMENT;
          } else if (chr != EOF) {
            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
          }
          break;
        case QUERY:
          if (!stateOverride && chr == "#") {
            url.fragment = "";
            state = FRAGMENT;
          } else if (chr != EOF) {
            if (chr == "'" && url.isSpecial())
              url.query += "%27";
            else if (chr == "#")
              url.query += "%23";
            else
              url.query += percentEncode(chr, C0ControlPercentEncodeSet);
          }
          break;
        case FRAGMENT:
          if (chr != EOF)
            url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
          break;
      }
      pointer++;
    }
  },
  parseHost: function(input) {
    var result, codePoints, index;
    if (charAt$3(input, 0) == "[") {
      if (charAt$3(input, input.length - 1) != "]")
        return INVALID_HOST;
      result = parseIPv6(stringSlice$3(input, 1, -1));
      if (!result)
        return INVALID_HOST;
      this.host = result;
    } else if (!this.isSpecial()) {
      if (exec$1(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input))
        return INVALID_HOST;
      result = "";
      codePoints = arrayFrom(input);
      for (index = 0; index < codePoints.length; index++) {
        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
      }
      this.host = result;
    } else {
      input = toASCII(input);
      if (exec$1(FORBIDDEN_HOST_CODE_POINT, input))
        return INVALID_HOST;
      result = parseIPv4(input);
      if (result === null)
        return INVALID_HOST;
      this.host = result;
    }
  },
  cannotHaveUsernamePasswordPort: function() {
    return !this.host || this.cannotBeABaseURL || this.scheme == "file";
  },
  includesCredentials: function() {
    return this.username != "" || this.password != "";
  },
  isSpecial: function() {
    return hasOwn(specialSchemes, this.scheme);
  },
  shortenPath: function() {
    var path = this.path;
    var pathSize = path.length;
    if (pathSize && (this.scheme != "file" || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
      path.length--;
    }
  },
  serialize: function() {
    var url = this;
    var scheme = url.scheme;
    var username = url.username;
    var password = url.password;
    var host = url.host;
    var port = url.port;
    var path = url.path;
    var query = url.query;
    var fragment = url.fragment;
    var output = scheme + ":";
    if (host !== null) {
      output += "//";
      if (url.includesCredentials()) {
        output += username + (password ? ":" + password : "") + "@";
      }
      output += serializeHost(host);
      if (port !== null)
        output += ":" + port;
    } else if (scheme == "file")
      output += "//";
    output += url.cannotBeABaseURL ? path[0] : path.length ? "/" + join(path, "/") : "";
    if (query !== null)
      output += "?" + query;
    if (fragment !== null)
      output += "#" + fragment;
    return output;
  },
  setHref: function(href) {
    var failure = this.parse(href);
    if (failure)
      throw TypeError$2(failure);
    this.searchParams.update();
  },
  getOrigin: function() {
    var scheme = this.scheme;
    var port = this.port;
    if (scheme == "blob")
      try {
        return new URLConstructor(scheme.path[0]).origin;
      } catch (error) {
        return "null";
      }
    if (scheme == "file" || !this.isSpecial())
      return "null";
    return scheme + "://" + serializeHost(this.host) + (port !== null ? ":" + port : "");
  },
  getProtocol: function() {
    return this.scheme + ":";
  },
  setProtocol: function(protocol) {
    this.parse($toString(protocol) + ":", SCHEME_START);
  },
  getUsername: function() {
    return this.username;
  },
  setUsername: function(username) {
    var codePoints = arrayFrom($toString(username));
    if (this.cannotHaveUsernamePasswordPort())
      return;
    this.username = "";
    for (var i = 0; i < codePoints.length; i++) {
      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  getPassword: function() {
    return this.password;
  },
  setPassword: function(password) {
    var codePoints = arrayFrom($toString(password));
    if (this.cannotHaveUsernamePasswordPort())
      return;
    this.password = "";
    for (var i = 0; i < codePoints.length; i++) {
      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
    }
  },
  getHost: function() {
    var host = this.host;
    var port = this.port;
    return host === null ? "" : port === null ? serializeHost(host) : serializeHost(host) + ":" + port;
  },
  setHost: function(host) {
    if (this.cannotBeABaseURL)
      return;
    this.parse(host, HOST);
  },
  getHostname: function() {
    var host = this.host;
    return host === null ? "" : serializeHost(host);
  },
  setHostname: function(hostname) {
    if (this.cannotBeABaseURL)
      return;
    this.parse(hostname, HOSTNAME);
  },
  getPort: function() {
    var port = this.port;
    return port === null ? "" : $toString(port);
  },
  setPort: function(port) {
    if (this.cannotHaveUsernamePasswordPort())
      return;
    port = $toString(port);
    if (port == "")
      this.port = null;
    else
      this.parse(port, PORT);
  },
  getPathname: function() {
    var path = this.path;
    return this.cannotBeABaseURL ? path[0] : path.length ? "/" + join(path, "/") : "";
  },
  setPathname: function(pathname) {
    if (this.cannotBeABaseURL)
      return;
    this.path = [];
    this.parse(pathname, PATH_START);
  },
  getSearch: function() {
    var query = this.query;
    return query ? "?" + query : "";
  },
  setSearch: function(search) {
    search = $toString(search);
    if (search == "") {
      this.query = null;
    } else {
      if (charAt$3(search, 0) == "?")
        search = stringSlice$3(search, 1);
      this.query = "";
      this.parse(search, QUERY);
    }
    this.searchParams.update();
  },
  getSearchParams: function() {
    return this.searchParams.facade;
  },
  getHash: function() {
    var fragment = this.fragment;
    return fragment ? "#" + fragment : "";
  },
  setHash: function(hash) {
    hash = $toString(hash);
    if (hash == "") {
      this.fragment = null;
      return;
    }
    if (charAt$3(hash, 0) == "#")
      hash = stringSlice$3(hash, 1);
    this.fragment = "";
    this.parse(hash, FRAGMENT);
  },
  update: function() {
    this.query = this.searchParams.serialize() || null;
  }
};
var URLConstructor = function URL2(url) {
  var that = anInstance(this, URLPrototype);
  var base2 = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : void 0;
  var state = setInternalState(that, new URLState(url, false, base2));
  if (!DESCRIPTORS) {
    that.href = state.serialize();
    that.origin = state.getOrigin();
    that.protocol = state.getProtocol();
    that.username = state.getUsername();
    that.password = state.getPassword();
    that.host = state.getHost();
    that.hostname = state.getHostname();
    that.port = state.getPort();
    that.pathname = state.getPathname();
    that.search = state.getSearch();
    that.searchParams = state.getSearchParams();
    that.hash = state.getHash();
  }
};
var URLPrototype = URLConstructor.prototype;
var accessorDescriptor = function(getter, setter) {
  return {
    get: function() {
      return getInternalURLState(this)[getter]();
    },
    set: setter && function(value) {
      return getInternalURLState(this)[setter](value);
    },
    configurable: true,
    enumerable: true
  };
};
if (DESCRIPTORS) {
  defineBuiltInAccessor(URLPrototype, "href", accessorDescriptor("serialize", "setHref"));
  defineBuiltInAccessor(URLPrototype, "origin", accessorDescriptor("getOrigin"));
  defineBuiltInAccessor(URLPrototype, "protocol", accessorDescriptor("getProtocol", "setProtocol"));
  defineBuiltInAccessor(URLPrototype, "username", accessorDescriptor("getUsername", "setUsername"));
  defineBuiltInAccessor(URLPrototype, "password", accessorDescriptor("getPassword", "setPassword"));
  defineBuiltInAccessor(URLPrototype, "host", accessorDescriptor("getHost", "setHost"));
  defineBuiltInAccessor(URLPrototype, "hostname", accessorDescriptor("getHostname", "setHostname"));
  defineBuiltInAccessor(URLPrototype, "port", accessorDescriptor("getPort", "setPort"));
  defineBuiltInAccessor(URLPrototype, "pathname", accessorDescriptor("getPathname", "setPathname"));
  defineBuiltInAccessor(URLPrototype, "search", accessorDescriptor("getSearch", "setSearch"));
  defineBuiltInAccessor(URLPrototype, "searchParams", accessorDescriptor("getSearchParams"));
  defineBuiltInAccessor(URLPrototype, "hash", accessorDescriptor("getHash", "setHash"));
}
defineBuiltIn$1(URLPrototype, "toJSON", function toJSON() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });
defineBuiltIn$1(URLPrototype, "toString", function toString4() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });
if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  if (nativeCreateObjectURL)
    defineBuiltIn$1(URLConstructor, "createObjectURL", bind(nativeCreateObjectURL, NativeURL));
  if (nativeRevokeObjectURL)
    defineBuiltIn$1(URLConstructor, "revokeObjectURL", bind(nativeRevokeObjectURL, NativeURL));
}
setToStringTag(URLConstructor, "URL");
$$2({ global: true, constructor: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
  URL: URLConstructor
});
Object.defineProperty(browserSaveFile$1, "__esModule", {
  value: true
});
browserSaveFile$1.browserSaveFile = browserSaveFile;
function browserSaveFile(name, contents, {
  type = "text/plain",
  lastModified
} = {}) {
  const url = window.URL.createObjectURL(new File([contents], name, {
    type,
    lastModified
  }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
var castType$1 = {};
Object.defineProperty(castType$1, "__esModule", {
  value: true
});
castType$1.castType = castType;
function castType(_value) {
}
var crop$1 = {};
var evalTemplateString$1 = {};
Object.defineProperty(evalTemplateString$1, "__esModule", {
  value: true
});
evalTemplateString$1.evalTemplateString = evalTemplateString;
function evalTemplateString(template, substitutions) {
  let res = "";
  for (let i = 0; i < template.length; i++) {
    const str = template[i];
    res += str + (i < substitutions.length ? substitutions[i] : "");
  }
  return res;
}
var stripIndent$1 = {};
var NATIVE_BIND = functionBindNative;
var FunctionPrototype = Function.prototype;
var apply$1 = FunctionPrototype.apply;
var call$3 = FunctionPrototype.call;
var functionApply = typeof Reflect == "object" && Reflect.apply || (NATIVE_BIND ? call$3.bind(apply$1) : function() {
  return call$3.apply(apply$1, arguments);
});
var anObject$2 = anObject$c;
var regexpFlags$1 = function() {
  var that = anObject$2(this);
  var result = "";
  if (that.hasIndices)
    result += "d";
  if (that.global)
    result += "g";
  if (that.ignoreCase)
    result += "i";
  if (that.multiline)
    result += "m";
  if (that.dotAll)
    result += "s";
  if (that.unicode)
    result += "u";
  if (that.sticky)
    result += "y";
  return result;
};
var fails$5 = fails$j;
var global$4 = global$C;
var $RegExp$2 = global$4.RegExp;
var UNSUPPORTED_Y$1 = fails$5(function() {
  var re = $RegExp$2("a", "y");
  re.lastIndex = 2;
  return re.exec("abcd") != null;
});
var MISSED_STICKY = UNSUPPORTED_Y$1 || fails$5(function() {
  return !$RegExp$2("a", "y").sticky;
});
var BROKEN_CARET = UNSUPPORTED_Y$1 || fails$5(function() {
  var re = $RegExp$2("^r", "gy");
  re.lastIndex = 2;
  return re.exec("str") != null;
});
var regexpStickyHelpers = {
  BROKEN_CARET,
  MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y$1
};
var fails$4 = fails$j;
var global$3 = global$C;
var $RegExp$1 = global$3.RegExp;
var regexpUnsupportedDotAll = fails$4(function() {
  var re = $RegExp$1(".", "s");
  return !(re.dotAll && re.exec("\n") && re.flags === "s");
});
var fails$3 = fails$j;
var global$2 = global$C;
var $RegExp = global$2.RegExp;
var regexpUnsupportedNcg = fails$3(function() {
  var re = $RegExp("(?<a>b)", "g");
  return re.exec("b").groups.a !== "b" || "b".replace(re, "$<a>c") !== "bc";
});
var call$2 = functionCall;
var uncurryThis$3 = functionUncurryThis;
var toString$1 = toString$4;
var regexpFlags = regexpFlags$1;
var stickyHelpers = regexpStickyHelpers;
var shared = shared$4.exports;
var create = objectCreate;
var getInternalState = internalState.get;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;
var nativeReplace = shared("native-string-replace", String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$2 = uncurryThis$3("".charAt);
var indexOf = uncurryThis$3("".indexOf);
var replace$1 = uncurryThis$3("".replace);
var stringSlice$2 = uncurryThis$3("".slice);
var UPDATES_LAST_INDEX_WRONG = function() {
  var re1 = /a/;
  var re2 = /b*/g;
  call$2(nativeExec, re1, "a");
  call$2(nativeExec, re2, "a");
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
}();
var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;
var NPCG_INCLUDED = /()??/.exec("")[1] !== void 0;
var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;
if (PATCH) {
  patchedExec = function exec2(string) {
    var re = this;
    var state = getInternalState(re);
    var str = toString$1(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match2, i, object, group;
    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call$2(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }
    var groups = state.groups;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = call$2(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;
    if (sticky) {
      flags = replace$1(flags, "y", "");
      if (indexOf(flags, "g") === -1) {
        flags += "g";
      }
      strCopy = stringSlice$2(str, re.lastIndex);
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$2(str, re.lastIndex - 1) !== "\n")) {
        source = "(?: " + source + ")";
        strCopy = " " + strCopy;
        charsAdded++;
      }
      reCopy = new RegExp("^(?:" + source + ")", flags);
    }
    if (NPCG_INCLUDED) {
      reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
    }
    if (UPDATES_LAST_INDEX_WRONG)
      lastIndex = re.lastIndex;
    match2 = call$2(nativeExec, sticky ? reCopy : re, strCopy);
    if (sticky) {
      if (match2) {
        match2.input = stringSlice$2(match2.input, charsAdded);
        match2[0] = stringSlice$2(match2[0], charsAdded);
        match2.index = re.lastIndex;
        re.lastIndex += match2[0].length;
      } else
        re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match2) {
      re.lastIndex = re.global ? match2.index + match2[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match2 && match2.length > 1) {
      call$2(nativeReplace, match2[0], reCopy, function() {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === void 0)
            match2[i] = void 0;
        }
      });
    }
    if (match2 && groups) {
      match2.groups = object = create(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match2[group[1]];
      }
    }
    return match2;
  };
}
var regexpExec$2 = patchedExec;
var $$1 = _export;
var exec = regexpExec$2;
$$1({ target: "RegExp", proto: true, forced: /./.exec !== exec }, {
  exec
});
var uncurryThis$2 = functionUncurryThis;
var defineBuiltIn = defineBuiltIn$7;
var regexpExec$1 = regexpExec$2;
var fails$2 = fails$j;
var wellKnownSymbol$1 = wellKnownSymbol$e;
var createNonEnumerableProperty = createNonEnumerableProperty$6;
var SPECIES = wellKnownSymbol$1("species");
var RegExpPrototype = RegExp.prototype;
var fixRegexpWellKnownSymbolLogic = function(KEY, exec2, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$1(KEY);
  var DELEGATES_TO_SYMBOL = !fails$2(function() {
    var O = {};
    O[SYMBOL] = function() {
      return 7;
    };
    return ""[KEY](O) != 7;
  });
  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$2(function() {
    var execCalled = false;
    var re = /a/;
    if (KEY === "split") {
      re = {};
      re.constructor = {};
      re.constructor[SPECIES] = function() {
        return re;
      };
      re.flags = "";
      re[SYMBOL] = /./[SYMBOL];
    }
    re.exec = function() {
      execCalled = true;
      return null;
    };
    re[SYMBOL]("");
    return !execCalled;
  });
  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || FORCED) {
    var uncurriedNativeRegExpMethod = uncurryThis$2(/./[SYMBOL]);
    var methods = exec2(SYMBOL, ""[KEY], function(nativeMethod, regexp, str, arg2, forceStringMethod) {
      var uncurriedNativeMethod = uncurryThis$2(nativeMethod);
      var $exec = regexp.exec;
      if ($exec === regexpExec$1 || $exec === RegExpPrototype.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
        }
        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
      }
      return { done: false };
    });
    defineBuiltIn(String.prototype, KEY, methods[0]);
    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
  }
  if (SHAM)
    createNonEnumerableProperty(RegExpPrototype[SYMBOL], "sham", true);
};
var charAt$1 = stringMultibyte.charAt;
var advanceStringIndex$1 = function(S, index, unicode) {
  return index + (unicode ? charAt$1(S, index).length : 1);
};
var uncurryThis$1 = functionUncurryThis;
var toObject = toObject$5;
var floor = Math.floor;
var charAt = uncurryThis$1("".charAt);
var replace = uncurryThis$1("".replace);
var stringSlice$1 = uncurryThis$1("".slice);
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;
var getSubstitution$1 = function(matched, str, position, captures, namedCaptures, replacement2) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== void 0) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace(replacement2, symbols, function(match2, ch) {
    var capture;
    switch (charAt(ch, 0)) {
      case "$":
        return "$";
      case "&":
        return matched;
      case "`":
        return stringSlice$1(str, 0, position);
      case "'":
        return stringSlice$1(str, tailPos);
      case "<":
        capture = namedCaptures[stringSlice$1(ch, 1, -1)];
        break;
      default:
        var n = +ch;
        if (n === 0)
          return match2;
        if (n > m) {
          var f = floor(n / 10);
          if (f === 0)
            return match2;
          if (f <= m)
            return captures[f - 1] === void 0 ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
          return match2;
        }
        capture = captures[n - 1];
    }
    return capture === void 0 ? "" : capture;
  });
};
var global$1 = global$C;
var call$1 = functionCall;
var anObject$1 = anObject$c;
var isCallable$1 = isCallable$j;
var classof = classofRaw$1;
var regexpExec = regexpExec$2;
var TypeError$1 = global$1.TypeError;
var regexpExecAbstract = function(R, S) {
  var exec2 = R.exec;
  if (isCallable$1(exec2)) {
    var result = call$1(exec2, R, S);
    if (result !== null)
      anObject$1(result);
    return result;
  }
  if (classof(R) === "RegExp")
    return call$1(regexpExec, R, S);
  throw TypeError$1("RegExp#exec called on incompatible receiver");
};
var apply = functionApply;
var call = functionCall;
var uncurryThis = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var fails$1 = fails$j;
var anObject = anObject$c;
var isCallable = isCallable$j;
var toIntegerOrInfinity = toIntegerOrInfinity$4;
var toLength = toLength$2;
var toString = toString$4;
var requireObjectCoercible = requireObjectCoercible$4;
var advanceStringIndex = advanceStringIndex$1;
var getMethod = getMethod$4;
var getSubstitution = getSubstitution$1;
var regExpExec = regexpExecAbstract;
var wellKnownSymbol = wellKnownSymbol$e;
var REPLACE = wellKnownSymbol("replace");
var max = Math.max;
var min = Math.min;
var concat = uncurryThis([].concat);
var push = uncurryThis([].push);
var stringIndexOf = uncurryThis("".indexOf);
var stringSlice = uncurryThis("".slice);
var maybeToString = function(it) {
  return it === void 0 ? it : String(it);
};
var REPLACE_KEEPS_$0 = function() {
  return "a".replace(/./, "$0") === "$0";
}();
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function() {
  if (/./[REPLACE]) {
    return /./[REPLACE]("a", "$0") === "";
  }
  return false;
}();
var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$1(function() {
  var re = /./;
  re.exec = function() {
    var result = [];
    result.groups = { a: "7" };
    return result;
  };
  return "".replace(re, "$<a>") !== "7";
});
fixRegExpWellKnownSymbolLogic("replace", function(_2, nativeReplace2, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? "$" : "$0";
  return [
    function replace2(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer2 = searchValue == void 0 ? void 0 : getMethod(searchValue, REPLACE);
      return replacer2 ? call(replacer2, searchValue, O, replaceValue) : call(nativeReplace2, toString(O), searchValue, replaceValue);
    },
    function(string, replaceValue) {
      var rx = anObject(this);
      var S = toString(string);
      if (typeof replaceValue == "string" && stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 && stringIndexOf(replaceValue, "$<") === -1) {
        var res = maybeCallNative(nativeReplace2, rx, S, replaceValue);
        if (res.done)
          return res.value;
      }
      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace)
        replaceValue = toString(replaceValue);
      var global2 = rx.global;
      if (global2) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null)
          break;
        push(results, result);
        if (!global2)
          break;
        var matchStr = toString(result[0]);
        if (matchStr === "")
          rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = "";
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = toString(result[0]);
        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        for (var j = 1; j < result.length; j++)
          push(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat([matched], captures, position, S);
          if (namedCaptures !== void 0)
            push(replacerArgs, namedCaptures);
          var replacement2 = toString(apply(replaceValue, void 0, replacerArgs));
        } else {
          replacement2 = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement2;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + stringSlice(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
var isDefined$1 = {};
Object.defineProperty(isDefined$1, "__esModule", {
  value: true
});
isDefined$1.isDefined = isDefined;
function isDefined(value) {
  return value !== void 0;
}
Object.defineProperty(stripIndent$1, "__esModule", {
  value: true
});
stripIndent$1.stripIndent = stripIndent;
var _isDefined = isDefined$1;
function stripIndent(str, {
  tabs = true,
  count = void 0
} = {}) {
  let min2 = count;
  if (!(0, _isDefined.isDefined)(min2)) {
    const unknownAmountOfTabs = tabs ? /^[\t]*(?=[^\t])/gm : /^[ ]*(?=[^ ])/gm;
    const indent2 = str.match(unknownAmountOfTabs);
    if (indent2 === null)
      return str;
    min2 = indent2.reduce((prev, curr) => Math.min(prev, curr.length), Infinity);
  }
  const limit = min2 === Infinity ? "" : min2;
  const knownAmountOfTabs = new RegExp(`^${tabs ? "\\t" : " "}{0,${limit}}`, "gm");
  return str.replace(knownAmountOfTabs, "");
}
var trimLines$1 = {};
Object.defineProperty(trimLines$1, "__esModule", {
  value: true
});
trimLines$1.trimLines = trimLines;
function trimLines(str) {
  return str.replace(/(^\n*?(?=[^\n]|$))([\s\S]*?)(\n*?\s*?$)/, "$2");
}
Object.defineProperty(crop$1, "__esModule", {
  value: true
});
crop$1.crop = crop;
var _evalTemplateString = evalTemplateString$1;
var _stripIndent = stripIndent$1;
var _trimLines = trimLines$1;
function crop(template, ...substitutions) {
  return (0, _stripIndent.stripIndent)((0, _trimLines.trimLines)((0, _evalTemplateString.evalTemplateString)(template, substitutions)));
}
var debounce$2 = {};
var getQueueKey$1 = {};
Object.defineProperty(getQueueKey$1, "__esModule", {
  value: true
});
getQueueKey$1.getQueueKey = getQueueKey;
var _utils$2 = utils;
function getQueueKey(type, index, args) {
  switch (type) {
    case "function":
      return index(args);
    case "number":
      return args[index];
    case "undefined":
      return "";
    default:
      (0, _utils$2.unreachable)();
  }
}
Object.defineProperty(debounce$2, "__esModule", {
  value: true
});
debounce$2.debounce = debounce$1;
debounce$2.debounceError = void 0;
var _getQueueKey = getQueueKey$1;
var _$3 = utils;
function debounce$1(callback, wait = 0, {
  queue: queue2 = false,
  index = queue2 ? 0 : void 0,
  leading = false,
  trailing = true,
  promisify = false
} = {}) {
  var _arguments$;
  const isThrottle = (_arguments$ = arguments[3]) !== null && _arguments$ !== void 0 ? _arguments$ : false;
  let queues = {};
  if (typeof queue2 === "object")
    queues = queue2;
  const type = queue2 ? typeof index : "undefined";
  let debounced;
  if (promisify) {
    debounced = function async(...args) {
      var _queues$key4;
      (0, _$3.castType)(callback);
      const key = (0, _getQueueKey.getQueueKey)(type, index, args);
      const timerFunc = () => {
        var _queues$key, _queues$key2;
        if (trailing && (_queues$key = queues[key]) !== null && _queues$key !== void 0 && _queues$key._args && (_queues$key2 = queues[key]) !== null && _queues$key2 !== void 0 && _queues$key2.resolve) {
          var _queues$key3;
          (_queues$key3 = queues[key]) === null || _queues$key3 === void 0 ? void 0 : _queues$key3.resolve();
          return;
        }
        delete queues[key];
      };
      queues[key] = queues[key] || {};
      if (((_queues$key4 = queues[key]) === null || _queues$key4 === void 0 ? void 0 : _queues$key4.timeout) !== void 0 || !leading) {
        var _queues$key5;
        queues[key]._args = args;
        if (isThrottle) {
          var _queues$key$timeout;
          queues[key].timeout = (_queues$key$timeout = queues[key].timeout) !== null && _queues$key$timeout !== void 0 ? _queues$key$timeout : setTimeout(timerFunc, wait);
        } else if ((_queues$key5 = queues[key]) !== null && _queues$key5 !== void 0 && _queues$key5.timeout) {
          var _queues$key6;
          if ((_queues$key6 = queues[key]) !== null && _queues$key6 !== void 0 && _queues$key6.reject) {
            var _queues$key7, _queues$key8, _queues$key9;
            (_queues$key7 = queues[key]) === null || _queues$key7 === void 0 ? void 0 : _queues$key7.reject();
            (_queues$key8 = queues[key]) === null || _queues$key8 === void 0 ? true : delete _queues$key8.resolve;
            (_queues$key9 = queues[key]) === null || _queues$key9 === void 0 ? true : delete _queues$key9.reject;
          }
          clearTimeout(queues[key].timeout);
        }
      }
      if (!isThrottle) {
        queues[key].timeout = setTimeout(timerFunc, wait);
      }
      return new Promise((resolve2, reject) => {
        var _queues$key10;
        if (((_queues$key10 = queues[key]) === null || _queues$key10 === void 0 ? void 0 : _queues$key10.timeout) === void 0 && leading) {
          var _queues$key11, _queues$key12;
          queues[key].resolve();
          (_queues$key11 = queues[key]) === null || _queues$key11 === void 0 ? true : delete _queues$key11.resolve;
          (_queues$key12 = queues[key]) === null || _queues$key12 === void 0 ? true : delete _queues$key12.reject;
          if (isThrottle) {
            queues[key].timeout = setTimeout(timerFunc, wait);
          }
        }
        queues[key].resolve = resolve2;
        queues[key].reject = reject;
      }).then(async () => {
        const args2 = queues[key]._args;
        delete queues[key];
        return callback(...args2);
      }).catch(async () => callback(debounceError));
    };
  } else {
    debounced = function(...args) {
      var _queues$key14;
      (0, _$3.castType)(callback);
      const context = this;
      const key = (0, _getQueueKey.getQueueKey)(type, index, args);
      const timerFunc = () => {
        var _queues$key13;
        if (trailing && (_queues$key13 = queues[key]) !== null && _queues$key13 !== void 0 && _queues$key13._args) {
          callback.apply(queues[key]._context, queues[key]._args);
        }
        delete queues[key];
      };
      queues[key] = queues[key] || {};
      if (((_queues$key14 = queues[key]) === null || _queues$key14 === void 0 ? void 0 : _queues$key14.timeout) === void 0 && leading) {
        callback.apply(context, args);
        if (isThrottle) {
          queues[key].timeout = setTimeout(timerFunc, wait);
        }
      } else {
        var _queues$key15;
        queues[key]._context = context;
        queues[key]._args = args;
        if (isThrottle) {
          var _queues$key$timeout2;
          queues[key].timeout = (_queues$key$timeout2 = queues[key].timeout) !== null && _queues$key$timeout2 !== void 0 ? _queues$key$timeout2 : setTimeout(timerFunc, wait);
        } else if ((_queues$key15 = queues[key]) !== null && _queues$key15 !== void 0 && _queues$key15.timeout) {
          clearTimeout(queues[key].timeout);
        }
      }
      if (!isThrottle)
        queues[key].timeout = setTimeout(timerFunc, wait);
    };
  }
  const cancel = (key = "") => {
    if (queues[key].timeout)
      clearTimeout(queues[key].timeout);
    delete queues[key];
  };
  const flush = (key = "") => {
    var _queues$key16;
    if (trailing && (_queues$key16 = queues[key]) !== null && _queues$key16 !== void 0 && _queues$key16._args) {
      var _queues$key17;
      (0, _$3.castType)(callback);
      callback.apply((_queues$key17 = queues[key]) === null || _queues$key17 === void 0 ? void 0 : _queues$key17._context, queues[key]._args);
    }
    cancel(key);
  };
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
const debounceError = Object.freeze(new Error("Debounced"));
debounce$2.debounceError = debounceError;
var dedupe$1 = {};
Object.defineProperty(dedupe$1, "__esModule", {
  value: true
});
dedupe$1.dedupe = dedupe;
function dedupe(array, {
  mutate = false
} = {}) {
  if (!mutate) {
    return [...new Set(array)];
  } else {
    const seen = /* @__PURE__ */ new Set();
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (seen.has(value)) {
        array.splice(i, 1);
        i--;
      } else {
        seen.add(value);
      }
    }
    return array;
  }
}
var defer$1 = {};
Object.defineProperty(defer$1, "__esModule", {
  value: true
});
defer$1.defer = defer;
function defer(func) {
  const promise = async () => new Promise((resolve2, reject) => {
    promise.resolve = resolve2;
    promise.reject = reject;
  }).then((res) => func(res));
  return promise;
}
var delay$1 = {};
Object.defineProperty(delay$1, "__esModule", {
  value: true
});
delay$1.delay = delay;
async function delay(time = 1e3) {
  return new Promise((resolve2) => {
    setTimeout(resolve2, time);
  });
}
var Result_Err = {};
var Result$1 = {};
Object.defineProperty(Result$1, "__esModule", {
  value: true
});
Result$1.Result = void 0;
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
class ResultBase {
  unwrap() {
    const self2 = this;
    if (self2.isOk) {
      return self2.value;
    } else {
      throw self2.error;
    }
  }
}
class OkResultImpl extends ResultBase {
  constructor(val) {
    super();
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "isOk", true);
    _defineProperty(this, "isError", false);
    this.value = val;
    if (val instanceof Error) {
      throw new Error("Attempted to construct Ok from Error.");
    }
  }
}
class ErrResultImpl extends ResultBase {
  constructor(val) {
    super();
    _defineProperty(this, "error", void 0);
    _defineProperty(this, "isOk", false);
    _defineProperty(this, "isError", true);
    this.error = val;
  }
}
let Result;
Result$1.Result = Result;
(function(_Result2) {
  function Ok2(val = void 0) {
    return new OkResultImpl(val);
  }
  _Result2.Ok = Ok2;
  function Err2(typeOrVal) {
    if (typeOrVal === void 0) {
      return new ErrResultImpl(new Error());
    }
    return new ErrResultImpl(typeOrVal instanceof Error ? typeOrVal : new Error(typeOrVal));
  }
  _Result2.Err = Err2;
})(Result || (Result$1.Result = Result = {}));
Object.defineProperty(Result_Err, "__esModule", {
  value: true
});
Result_Err.Err = void 0;
var _Result$1 = Result$1;
const Err = _Result$1.Result.Err;
Result_Err.Err = Err;
var escapeRegex$1 = {};
Object.defineProperty(escapeRegex$1, "__esModule", {
  value: true
});
escapeRegex$1.escapeRegex = escapeRegex;
function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}
var findDuplicates$1 = {};
var $ = _export;
var $includes = arrayIncludes.includes;
var fails = fails$j;
var addToUnscopables$1 = addToUnscopables$3;
var BROKEN_ON_SPARSE = fails(function() {
  return !Array(1).includes();
});
$({ target: "Array", proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : void 0);
  }
});
addToUnscopables$1("includes");
Object.defineProperty(findDuplicates$1, "__esModule", {
  value: true
});
findDuplicates$1.findDuplicates = findDuplicates;
function findDuplicates(arr, {
  equals
} = {}) {
  const found = [];
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    let inArray;
    let inFound;
    if (equals) {
      inArray = arr.findIndex((other, j) => j > i && equals(val, other, found)) !== -1;
      inFound = found.findIndex((other) => equals(val, other, found)) !== -1;
    } else {
      inArray = arr.includes(val, i + 1);
      inFound = found.includes(val);
    }
    if (inArray && !inFound)
      found.push(val);
  }
  return found;
}
var get$1 = {};
Object.defineProperty(get$1, "__esModule", {
  value: true
});
get$1.get = get;
function get(obj, keys4) {
  let curr = obj;
  for (const key of keys4) {
    if (curr[key] !== void 0) {
      curr = curr[key];
    } else
      return void 0;
  }
  return keys4.length > 0 ? curr : void 0;
}
var indent$1 = {};
Object.defineProperty(indent$1, "__esModule", {
  value: true
});
indent$1.indent = indent;
function indent(str, count = 0, {
  first = false
} = {}) {
  const regex = first ? /(^|\n)/g : /\n/g;
  const tabs = "	".repeat(count);
  const replacement2 = first ? `$1${tabs}` : `
${tabs}`;
  return str.replace(regex, replacement2);
}
var insert$1 = {};
Object.defineProperty(insert$1, "__esModule", {
  value: true
});
insert$1.insert = insert;
function insert(str, intoStr, range) {
  range = typeof range === "number" ? [range, range] : range;
  const origRange = [...range];
  if (range[0] < 0) {
    let newStart = intoStr.length + range[0];
    if (newStart < 0)
      newStart = 0;
    range[0] = newStart;
  }
  if (range[1] < 0) {
    let newEnd = intoStr.length + range[1];
    if (newEnd < 0)
      newEnd = 0;
    range[1] = newEnd;
  }
  if (range[0] > range[1]) {
    const start2 = `${origRange[0]}${origRange[0] < 0 ? ` (normalized to ${range[0]})` : ""}`;
    const end = `${origRange[1]}${origRange[1] < 0 ? ` (normalized to ${range[1]})` : ""}`;
    const error = new Error(`Range start ${start2} cannot come after range end ${end}`);
    error.range = origRange;
    throw error;
  }
  return intoStr.slice(0, range[0]) + str + intoStr.slice(range[1], intoStr.length);
}
var inspect$1 = {};
var __viteBrowserExternal = {};
var __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
var require$$0 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
Object.defineProperty(inspect$1, "__esModule", {
  value: true
});
inspect$1.inspect = inspect;
var _util = _interopRequireDefault$1(require$$0);
function _interopRequireDefault$1(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function inspect(obj, depth = 10) {
  const breakLength = process.stdout.columns + 9;
  console.log(_util.default.inspect(obj, {
    depth,
    colors: true,
    breakLength
  }));
}
var isArray$1 = {};
Object.defineProperty(isArray$1, "__esModule", {
  value: true
});
isArray$1.isArray = isArray;
function isArray(value) {
  return Array.isArray(value);
}
var isBlank$1 = {};
Object.defineProperty(isBlank$1, "__esModule", {
  value: true
});
isBlank$1.isBlank = isBlank;
function isBlank(value) {
  return value.length === 0;
}
var isDebouncedResult$1 = {};
Object.defineProperty(isDebouncedResult$1, "__esModule", {
  value: true
});
isDebouncedResult$1.isDebouncedResult = isDebouncedResult;
var _debounce = debounce$2;
function isDebouncedResult(result) {
  return result === _debounce.debounceError;
}
var isEmpty$1 = {};
Object.defineProperty(isEmpty$1, "__esModule", {
  value: true
});
isEmpty$1.isEmpty = isEmpty;
function isEmpty(value) {
  return value.length === 0;
}
var isObject$1 = {};
Object.defineProperty(isObject$1, "__esModule", {
  value: true
});
isObject$1.isObject = isObject;
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var isPlainObject$1 = {};
Object.defineProperty(isPlainObject$1, "__esModule", {
  value: true
});
isPlainObject$1.isPlainObject = isPlainObject;
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}
var isPrimitive$1 = {};
Object.defineProperty(isPrimitive$1, "__esModule", {
  value: true
});
isPrimitive$1.isPrimitive = isPrimitive;
function isPrimitive(value) {
  return typeof value !== "object" || value === null || value === void 0;
}
var isWhitespace$1 = {};
Object.defineProperty(isWhitespace$1, "__esModule", {
  value: true
});
isWhitespace$1.isWhitespace = isWhitespace;
function isWhitespace(value) {
  return value.trim().length === 0;
}
var merge$2 = {};
var pretty$1 = {};
var walk$1 = {};
var retypes = {};
var keys$1 = {};
Object.defineProperty(keys$1, "__esModule", {
  value: true
});
keys$1.keys = void 0;
const keys = Object.keys;
keys$1.keys = keys;
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "keys", {
    enumerable: true,
    get: function() {
      return _keys.keys;
    }
  });
  var _keys = keys$1;
})(retypes);
Object.defineProperty(walk$1, "__esModule", {
  value: true
});
walk$1.walk = walk;
var _retypes$4 = retypes;
function walk(obj, walker, {
  save = false,
  before = false,
  after = false
} = {}) {
  const isRecursiveCall = arguments[3] || false;
  const opts = {
    save,
    before,
    after
  };
  if (isRecursiveCall && before)
    obj = walker(obj);
  let res;
  if (Array.isArray(obj)) {
    const items = [];
    for (const item of obj) {
      res = typeof item === "object" && item !== null ? walk(item, walker, opts, true) : walker(item);
      if (save && res !== void 0)
        items.push(res);
    }
    res = save ? items : void 0;
  } else if (obj !== null) {
    const items = {};
    for (const key of (0, _retypes$4.keys)(obj)) {
      const item = obj[key];
      res = typeof item === "object" && item !== null ? walk(item, walker, opts, true) : walker(item);
      if (save && res !== void 0)
        items[key] = res;
    }
    res = save ? items : void 0;
  } else if (obj === null) {
    res = walker(obj);
    res = save ? res : void 0;
  }
  if (isRecursiveCall && after)
    return walker(res);
  return res;
}
Object.defineProperty(pretty$1, "__esModule", {
  value: true
});
pretty$1.pretty = pretty;
var _walk = walk$1;
function pretty(obj, {
  oneline = false,
  stringify = false
} = {}) {
  let objClone = obj;
  if (stringify) {
    if (stringify === true) {
      stringify = (val) => typeof val === "function" || typeof val === "symbol" ? val.toString() : val;
    }
    objClone = (0, _walk.walk)(obj, stringify, {
      save: true,
      after: true
    });
  }
  return oneline ? JSON.stringify(objClone, null, "|").replace(/\n\|*/g, " ") : JSON.stringify(objClone, null, "	");
}
var pushIfNotIn$1 = {};
Object.defineProperty(pushIfNotIn$1, "__esModule", {
  value: true
});
pushIfNotIn$1.pushIfNotIn = pushIfNotIn;
function pushIfNotIn(mutated, ...entries2) {
  for (const value of entries2) {
    if (!mutated.includes(value))
      mutated.push(value);
  }
  return mutated;
}
Object.defineProperty(merge$2, "__esModule", {
  value: true
});
merge$2.merge = merge$1;
var _crop = crop$1;
var _indent = indent$1;
var _isArray = isArray$1;
var _isObject = isObject$1;
var _isPlainObject$1 = isPlainObject$1;
var _isPrimitive = isPrimitive$1;
var _pretty = pretty$1;
var _pushIfNotIn$2 = pushIfNotIn$1;
var _retypes$3 = retypes;
let _$2 = (t) => t, _t, _t2, _t3, _t4;
function merge$1(base2, ...others) {
  if (base2 === void 0) {
    base2 = (0, _isArray.isArray)(others[0]) ? [] : {};
  }
  for (const other of others) {
    if ((0, _isArray.isArray)(base2)) {
      if (!(0, _isArray.isArray)(other)) {
        throw new Error((0, _crop.crop)(_t || (_t = _$2`
					Cannot merge object over array.
					Array:
						${0}
					Object:
						${0}
				`), (0, _indent.indent)((0, _pretty.pretty)(base2), 6), (0, _indent.indent)((0, _pretty.pretty)(other), 6)));
      }
      const overrideArr = other === base2 ? [...other] : other;
      for (const item of overrideArr)
        base2.push(item);
    } else if ((0, _isObject.isObject)(base2)) {
      const obj = base2;
      if (!(0, _isObject.isObject)(other)) {
        throw new Error((0, _crop.crop)(_t2 || (_t2 = _$2`
					Cannot merge array over object.
					Object:
						${0}
					Array:
						${0}
				`), (0, _indent.indent)((0, _pretty.pretty)(base2), 6), (0, _indent.indent)((0, _pretty.pretty)(other), 6)));
      }
      if (!(0, _isPlainObject$1.isPlainObject)(base2) || !(0, _isPlainObject$1.isPlainObject)(other)) {
        throw new Error((0, _crop.crop)(_t3 || (_t3 = _$2`
					Merge was not designed to handle merging of non-plain objects (i.e. class Instances).
					${0}
					${0}
				`), !(0, _isPlainObject$1.isPlainObject)(base2) ? `The following base does not seem to be a plain object:
						(${base2.constructor.name}) ${(0, _indent.indent)((0, _pretty.pretty)(base2), 6)}` : "", !(0, _isPlainObject$1.isPlainObject)(other) ? (0, _crop.crop)(_t4 || (_t4 = _$2`The following override does not seem to be a plain object:
						(${0}) ${0}`), other.constructor.name, (0, _indent.indent)((0, _pretty.pretty)(other), 6)) : ""));
      }
      const keys4 = (0, _pushIfNotIn$2.pushIfNotIn)((0, _retypes$3.keys)(obj), ...(0, _retypes$3.keys)(other));
      for (const prop of keys4) {
        const baseVal = obj[prop];
        const otherVal = other[prop];
        if (baseVal === void 0) {
          if ((0, _isPrimitive.isPrimitive)(otherVal)) {
            obj[prop] = otherVal;
          } else {
            obj[prop] = merge$1(void 0, otherVal);
          }
        } else if ((0, _isObject.isObject)(otherVal)) {
          if ((0, _isObject.isObject)(baseVal)) {
            obj[prop] = merge$1(baseVal, otherVal);
          } else {
            obj[prop] = merge$1(void 0, otherVal);
          }
        } else if ((0, _isArray.isArray)(otherVal)) {
          if ((0, _isArray.isArray)(baseVal)) {
            obj[prop] = merge$1(baseVal, otherVal);
          } else {
            obj[prop] = merge$1(void 0, otherVal);
          }
        } else if (otherVal !== void 0) {
          if ((0, _isPrimitive.isPrimitive)(otherVal)) {
            obj[prop] = otherVal;
          } else {
            obj[prop] = merge$1(void 0, otherVal);
          }
        }
      }
    }
  }
  return base2;
}
var mixin$1 = {};
Object.defineProperty(mixin$1, "__esModule", {
  value: true
});
mixin$1.mixin = mixin;
var _retypes$2 = retypes;
function mixin(base2, mixins) {
  const constructors = [];
  mixins.forEach((mixinCtor) => {
    const methods = Object.getOwnPropertyDescriptors(mixinCtor.prototype);
    (0, _retypes$2.keys)(methods).forEach((key) => {
      const method = methods[key];
      if (!["constructor", "_constructor"].includes(key.toString()) && base2.prototype[key] === void 0) {
        Object.defineProperty(base2.prototype, key, method);
      } else if (key === "_constructor") {
        constructors.push(method.value);
      }
    });
  });
  if (constructors.length > 0) {
    if (Object.getOwnPropertyDescriptor(base2, "_mixin")) {
      throw new Error("Mixin base cannot have a method named `_mixin`.");
    }
    Object.defineProperty(base2.prototype, "_mixin", {
      value(...args) {
        for (const constructor of constructors) {
          constructor.call(this, ...args);
        }
      },
      writable: false,
      configurable: false,
      enumerable: false
    });
  }
}
var occurrences$1 = {};
Object.defineProperty(occurrences$1, "__esModule", {
  value: true
});
occurrences$1.occurrences = occurrences;
function occurrences(input, substring, {
  overlapping = false
} = {}) {
  let count = 0;
  let next3 = 0;
  let match2 = input.indexOf(substring, 0);
  while (match2 !== -1) {
    next3 = overlapping ? match2 + 1 : match2 + substring.length;
    match2 = input.indexOf(substring, next3);
    count++;
  }
  return count;
}
var Result_Ok = {};
Object.defineProperty(Result_Ok, "__esModule", {
  value: true
});
Result_Ok.Ok = void 0;
var _Result = Result$1;
const Ok = _Result.Result.Ok;
Result_Ok.Ok = Ok;
var omit$1 = {};
Object.defineProperty(omit$1, "__esModule", {
  value: true
});
omit$1.omit = omit;
function omit(obj, keys4, ignoreUndefined = false) {
  const copy = {};
  for (const key of keys4) {
    if (ignoreUndefined) {
      if (obj[key]) {
        copy[key] = obj[key];
      }
    } else {
      copy[key] = obj[key];
    }
  }
  return copy;
}
var override$1 = {};
Object.defineProperty(override$1, "__esModule", {
  value: true
});
override$1.override = override;
var _isPlainObject = isPlainObject$1;
var _pushIfNotIn$1 = pushIfNotIn$1;
var _retypes$1 = retypes;
function override(base2, ...overrides) {
  for (const other of overrides) {
    const obj = base2;
    const keys4 = (0, _pushIfNotIn$1.pushIfNotIn)((0, _retypes$1.keys)(obj), ...(0, _retypes$1.keys)(other));
    for (const prop of keys4) {
      const baseVal = obj[prop];
      const otherVal = other[prop];
      if (baseVal === void 0) {
        obj[prop] = otherVal;
      } else if ((0, _isPlainObject.isPlainObject)(otherVal) && (0, _isPlainObject.isPlainObject)(baseVal)) {
        obj[prop] = override(baseVal, otherVal);
      } else if (otherVal !== void 0) {
        obj[prop] = otherVal;
      }
    }
  }
  return base2;
}
var pick$1 = {};
Object.defineProperty(pick$1, "__esModule", {
  value: true
});
pick$1.pick = pick;
function pick(obj, keys4) {
  const copy = {};
  for (const key of keys4) {
    copy[key] = obj[key];
  }
  return copy;
}
var readable$1 = {};
Object.defineProperty(readable$1, "__esModule", {
  value: true
});
readable$1.readable = readable;
var _retypes = retypes;
var _$1 = utils;
function readable(arr, {
  conjunction = "and",
  stringify
} = {}) {
  const stringifier = (el) => defaultStringify(stringify ? stringify(el) : el);
  if (arr.length <= 1) {
    return arr.map(stringifier).join("");
  } else {
    const beginning = arr.slice(0, arr.length - 1).map(stringifier).join(", ");
    const end = stringifier(arr[arr.length - 1]);
    const oxfordComma = arr.length === 2 ? "" : ",";
    return `${beginning}${oxfordComma} ${conjunction} ${end}`;
  }
}
function defaultStringify(val) {
  if (Array.isArray(val))
    return (0, _$1.isEmpty)(val) ? "[]" : "[...]";
  if (typeof val === "object" && val !== null) {
    var _val$constructor;
    if (((_val$constructor = val.constructor) === null || _val$constructor === void 0 ? void 0 : _val$constructor.name) !== "Object")
      return `${val.constructor.name} instance`;
    return (0, _$1.isEmpty)((0, _retypes.keys)(val)) ? "{}" : "{...}";
  }
  if (typeof val === "function")
    return val.name === "" ? "anonymous function" : `${val.name} function`;
  return val !== null && val !== void 0 && val.toString ? val.toString() : val;
}
var run$1 = {};
Object.defineProperty(run$1, "__esModule", {
  value: true
});
run$1.run = run;
var _child_process = require$$0;
async function run(command, cwd) {
  const parts = command.split(" ");
  const child = (0, _child_process.spawn)(parts[0], [...parts.slice(1)], {
    cwd,
    shell: true
  });
  let data2 = "";
  for await (const chunk of child.stdout) {
    data2 += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    error += chunk;
  }
  const code = await new Promise((resolve2) => {
    child.on("close", resolve2);
  });
  if (code !== 0) {
    const err = new Error(`${code}, ${error}`);
    err.code = code;
    throw err;
  }
  return data2;
}
var setReadOnly$1 = {};
Object.defineProperty(setReadOnly$1, "__esModule", {
  value: true
});
setReadOnly$1.setReadOnly = setReadOnly;
function setReadOnly(self2, key, value) {
  self2[key] = value;
}
var snippet$1 = {};
Object.defineProperty(snippet$1, "__esModule", {
  value: true
});
snippet$1.snippet = snippet;
function snippet(text, {
  lines: maxLine = 5,
  chars: maxChars = 300,
  ellipses = true
} = {}) {
  if (text === "" || text.trim() === "") {
    return "";
  }
  text = text.trim().replace(/(\r?\n)+/gm, "\n");
  const untilMaxLines = text.split(/\r?\n/gm).slice(0, maxLine).join("\n").trimEnd();
  if (untilMaxLines.length <= maxChars)
    return untilMaxLines;
  let iFirstWord = untilMaxLines.indexOf(" ");
  iFirstWord = iFirstWord > 0 ? iFirstWord : untilMaxLines.indexOf("\n");
  iFirstWord = iFirstWord > 0 ? iFirstWord : untilMaxLines.length;
  let untilMaxChars = untilMaxLines.slice(0, maxChars);
  if (untilMaxChars.length >= iFirstWord) {
    const nextChar = untilMaxLines.charAt(maxChars);
    if (["", "\n"].includes(nextChar) || untilMaxChars.endsWith(".") || !ellipses && nextChar === " ") {
      return untilMaxChars.trimEnd();
    }
  } else {
    untilMaxChars = untilMaxLines.slice(0, iFirstWord);
    const nextChar = untilMaxLines.charAt(iFirstWord);
    return untilMaxChars + (ellipses && [" ", "\n"].includes(nextChar) ? "..." : "");
  }
  let prevSpace = untilMaxChars.lastIndexOf(" ");
  prevSpace = prevSpace > 0 ? prevSpace : untilMaxChars.lastIndexOf("\n");
  let minusWord = untilMaxChars.slice(0, prevSpace).trimEnd();
  while (prevSpace > 0 && minusWord.length + (!ellipses || minusWord.endsWith(".") || minusWord.endsWith("\n") ? 0 : 3) > maxChars) {
    prevSpace = minusWord.lastIndexOf(" ");
    prevSpace = prevSpace > 0 ? prevSpace : minusWord.lastIndexOf("\n");
    if (prevSpace === -1)
      break;
    minusWord = minusWord.slice(0, prevSpace).trimEnd();
  }
  const nextChar2 = untilMaxChars.charAt(prevSpace);
  return `${minusWord.trimEnd()}${!ellipses || minusWord.endsWith(".") || nextChar2 === "\n" ? "" : "..."}`;
}
var throttle$2 = {};
Object.defineProperty(throttle$2, "__esModule", {
  value: true
});
throttle$2.throttle = throttle$1;
var _ = utils;
function throttle$1(callback, wait = 0, {
  queue: queue2 = false,
  index = queue2 ? 0 : void 0,
  leading = true,
  trailing = true
} = {}) {
  return (0, _.debounce)(callback, wait, {
    queue: queue2,
    index,
    leading,
    trailing
  }, true);
}
var union$1 = {};
var addToUnscopables = addToUnscopables$3;
addToUnscopables("flat");
Object.defineProperty(union$1, "__esModule", {
  value: true
});
union$1.union = union;
var _pushIfNotIn = pushIfNotIn$1;
function union(...arrays) {
  return (0, _pushIfNotIn.pushIfNotIn)([], ...arrays.flat());
}
var unreachable$1 = {};
Object.defineProperty(unreachable$1, "__esModule", {
  value: true
});
unreachable$1.unreachable = unreachable;
function unreachable(message = `This error should never happen, please file a bug report.`) {
  throw new Error(message);
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "Err", {
    enumerable: true,
    get: function() {
      return _Result2.Err;
    }
  });
  Object.defineProperty(exports, "MULTISPLICE_ITEM", {
    enumerable: true,
    get: function() {
      return _multisplice.MULTISPLICE_ITEM;
    }
  });
  Object.defineProperty(exports, "Ok", {
    enumerable: true,
    get: function() {
      return _Result22.Ok;
    }
  });
  Object.defineProperty(exports, "Result", {
    enumerable: true,
    get: function() {
      return _Result3.Result;
    }
  });
  Object.defineProperty(exports, "assertInStrRange", {
    enumerable: true,
    get: function() {
      return _assertInStrRange.assertInStrRange;
    }
  });
  Object.defineProperty(exports, "browserSaveFile", {
    enumerable: true,
    get: function() {
      return _browserSaveFile.browserSaveFile;
    }
  });
  Object.defineProperty(exports, "castType", {
    enumerable: true,
    get: function() {
      return _castType.castType;
    }
  });
  Object.defineProperty(exports, "crop", {
    enumerable: true,
    get: function() {
      return _crop2.crop;
    }
  });
  Object.defineProperty(exports, "debounce", {
    enumerable: true,
    get: function() {
      return _debounce2.debounce;
    }
  });
  Object.defineProperty(exports, "dedupe", {
    enumerable: true,
    get: function() {
      return _dedupe.dedupe;
    }
  });
  Object.defineProperty(exports, "defer", {
    enumerable: true,
    get: function() {
      return _defer.defer;
    }
  });
  Object.defineProperty(exports, "delay", {
    enumerable: true,
    get: function() {
      return _delay.delay;
    }
  });
  Object.defineProperty(exports, "escapeRegex", {
    enumerable: true,
    get: function() {
      return _escapeRegex.escapeRegex;
    }
  });
  Object.defineProperty(exports, "evalTemplateString", {
    enumerable: true,
    get: function() {
      return _evalTemplateString2.evalTemplateString;
    }
  });
  Object.defineProperty(exports, "findDuplicates", {
    enumerable: true,
    get: function() {
      return _findDuplicates.findDuplicates;
    }
  });
  Object.defineProperty(exports, "get", {
    enumerable: true,
    get: function() {
      return _get.get;
    }
  });
  Object.defineProperty(exports, "indent", {
    enumerable: true,
    get: function() {
      return _indent2.indent;
    }
  });
  Object.defineProperty(exports, "insert", {
    enumerable: true,
    get: function() {
      return _insert.insert;
    }
  });
  Object.defineProperty(exports, "inspect", {
    enumerable: true,
    get: function() {
      return _inspect.inspect;
    }
  });
  Object.defineProperty(exports, "isArray", {
    enumerable: true,
    get: function() {
      return _isArray2.isArray;
    }
  });
  Object.defineProperty(exports, "isBlank", {
    enumerable: true,
    get: function() {
      return _isBlank.isBlank;
    }
  });
  Object.defineProperty(exports, "isDebouncedResult", {
    enumerable: true,
    get: function() {
      return _isDebouncedResult.isDebouncedResult;
    }
  });
  Object.defineProperty(exports, "isDefined", {
    enumerable: true,
    get: function() {
      return _isDefined2.isDefined;
    }
  });
  Object.defineProperty(exports, "isEmpty", {
    enumerable: true,
    get: function() {
      return _isEmpty.isEmpty;
    }
  });
  Object.defineProperty(exports, "isObject", {
    enumerable: true,
    get: function() {
      return _isObject2.isObject;
    }
  });
  Object.defineProperty(exports, "isPlainObject", {
    enumerable: true,
    get: function() {
      return _isPlainObject2.isPlainObject;
    }
  });
  Object.defineProperty(exports, "isPrimitive", {
    enumerable: true,
    get: function() {
      return _isPrimitive2.isPrimitive;
    }
  });
  Object.defineProperty(exports, "isWhitespace", {
    enumerable: true,
    get: function() {
      return _isWhitespace.isWhitespace;
    }
  });
  Object.defineProperty(exports, "merge", {
    enumerable: true,
    get: function() {
      return _merge.merge;
    }
  });
  Object.defineProperty(exports, "mixin", {
    enumerable: true,
    get: function() {
      return _mixin.mixin;
    }
  });
  Object.defineProperty(exports, "multisplice", {
    enumerable: true,
    get: function() {
      return _multisplice.multisplice;
    }
  });
  Object.defineProperty(exports, "occurrences", {
    enumerable: true,
    get: function() {
      return _occurrences.occurrences;
    }
  });
  Object.defineProperty(exports, "omit", {
    enumerable: true,
    get: function() {
      return _omit.omit;
    }
  });
  Object.defineProperty(exports, "override", {
    enumerable: true,
    get: function() {
      return _override.override;
    }
  });
  Object.defineProperty(exports, "pick", {
    enumerable: true,
    get: function() {
      return _pick.pick;
    }
  });
  Object.defineProperty(exports, "pretty", {
    enumerable: true,
    get: function() {
      return _pretty2.pretty;
    }
  });
  Object.defineProperty(exports, "pushIfNotIn", {
    enumerable: true,
    get: function() {
      return _pushIfNotIn2.pushIfNotIn;
    }
  });
  Object.defineProperty(exports, "readable", {
    enumerable: true,
    get: function() {
      return _readable.readable;
    }
  });
  Object.defineProperty(exports, "run", {
    enumerable: true,
    get: function() {
      return _run.run;
    }
  });
  Object.defineProperty(exports, "setReadOnly", {
    enumerable: true,
    get: function() {
      return _setReadOnly.setReadOnly;
    }
  });
  Object.defineProperty(exports, "snippet", {
    enumerable: true,
    get: function() {
      return _snippet.snippet;
    }
  });
  Object.defineProperty(exports, "stripIndent", {
    enumerable: true,
    get: function() {
      return _stripIndent2.stripIndent;
    }
  });
  Object.defineProperty(exports, "throttle", {
    enumerable: true,
    get: function() {
      return _throttle.throttle;
    }
  });
  Object.defineProperty(exports, "trimLines", {
    enumerable: true,
    get: function() {
      return _trimLines2.trimLines;
    }
  });
  Object.defineProperty(exports, "union", {
    enumerable: true,
    get: function() {
      return _union.union;
    }
  });
  Object.defineProperty(exports, "unreachable", {
    enumerable: true,
    get: function() {
      return _unreachable.unreachable;
    }
  });
  Object.defineProperty(exports, "walk", {
    enumerable: true,
    get: function() {
      return _walk2.walk;
    }
  });
  var _multisplice = multisplice$1;
  var _assertInStrRange = assertInStrRange$1;
  var _browserSaveFile = browserSaveFile$1;
  var _castType = castType$1;
  var _crop2 = crop$1;
  var _debounce2 = debounce$2;
  var _dedupe = dedupe$1;
  var _defer = defer$1;
  var _delay = delay$1;
  var _Result2 = Result_Err;
  var _escapeRegex = escapeRegex$1;
  var _evalTemplateString2 = evalTemplateString$1;
  var _findDuplicates = findDuplicates$1;
  var _get = get$1;
  var _indent2 = indent$1;
  var _insert = insert$1;
  var _inspect = inspect$1;
  var _isArray2 = isArray$1;
  var _isBlank = isBlank$1;
  var _isDebouncedResult = isDebouncedResult$1;
  var _isDefined2 = isDefined$1;
  var _isEmpty = isEmpty$1;
  var _isObject2 = isObject$1;
  var _isPlainObject2 = isPlainObject$1;
  var _isPrimitive2 = isPrimitive$1;
  var _isWhitespace = isWhitespace$1;
  var _merge = merge$2;
  var _mixin = mixin$1;
  var _occurrences = occurrences$1;
  var _Result22 = Result_Ok;
  var _omit = omit$1;
  var _override = override$1;
  var _pick = pick$1;
  var _pretty2 = pretty$1;
  var _pushIfNotIn2 = pushIfNotIn$1;
  var _readable = readable$1;
  var _Result3 = Result$1;
  var _run = run$1;
  var _setReadOnly = setReadOnly$1;
  var _snippet = snippet$1;
  var _stripIndent2 = stripIndent$1;
  var _throttle = throttle$2;
  var _trimLines2 = trimLines$1;
  var _union = union$1;
  var _unreachable = unreachable$1;
  var _walk2 = walk$1;
})(utils);
function calculateAndSetPositionAndWidth(row) {
  var _a, _b, _c;
  let x = 0;
  for (const key of row) {
    key.opts = (_a = key.opts) != null ? _a : {};
    key.opts = (_b = key.opts) != null ? _b : {};
    if (key.opts.x)
      x = key.opts.x;
    key.opts.x = x;
    if ((_c = key.opts) == null ? void 0 : _c.width) {
      x += key.opts.width;
    } else {
      key.opts.width = 1;
      x++;
    }
  }
  return row;
}
var dist = {};
var colors = {};
Object.defineProperty(colors, "__esModule", {
  value: true
});
colors.yellow = colors.white = colors.reset = colors.red = colors.magenta = colors.green = colors.cyan = colors.blue = colors.black = void 0;
const black = "\x1B[30m";
colors.black = black;
const red = "\x1B[31m";
colors.red = red;
const green = "\x1B[32m";
colors.green = green;
const yellow = "\x1B[33m";
colors.yellow = yellow;
const blue = "\x1B[34m";
colors.blue = blue;
const magenta = "\x1B[35m";
colors.magenta = magenta;
const cyan = "\x1B[36m";
colors.cyan = cyan;
const white = "\x1B[37m";
colors.white = white;
const reset = "\x1B[0m";
colors.reset = reset;
var testing = {};
var catchError$1 = {};
Object.defineProperty(catchError$1, "__esModule", {
  value: true
});
catchError$1.catchError = catchError;
function catchError(func) {
  try {
    func();
  } catch (e) {
    return e;
  }
  throw new Error("Expected Function to Throw");
}
var expectType$1 = {};
Object.defineProperty(expectType$1, "__esModule", {
  value: true
});
expectType$1.expectType = expectType;
function expectType(_expected) {
}
var inspectError$1 = {};
Object.defineProperty(inspectError$1, "__esModule", {
  value: true
});
inspectError$1.inspectError = inspectError;
function inspectError(func, inspect2 = false) {
  return () => {
    try {
      func();
    } catch (e) {
      if (inspect2 || {}.INSPECT_ERRORS !== void 0) {
        console.warn(e.message);
      }
      throw e;
    }
  };
}
var partialDeepEqual$1 = {};
Object.defineProperty(partialDeepEqual$1, "__esModule", {
  value: true
});
partialDeepEqual$1.partialDeepEqual = partialDeepEqual;
var _utils$1 = utils;
function partialDeepEqual(_chai, utils2) {
  const Assertion = _chai.Assertion;
  Assertion.addChainableMethod("partial", function() {
  }, function() {
    _chai.util.flag(this, "partial", true);
  });
  Assertion.overwriteMethod("equal", function(_super) {
    return function(other, message, prettyLogObjects = false) {
      if (utils2.flag(this, "partial")) {
        var _message;
        if (!utils2.flag(this, "deep"))
          throw new Error("Can only do deep partial comparisons.");
        const obj = this._obj;
        const merged = merge(obj, other);
        const res = compare(obj, other);
        new Assertion(typeof obj).to.equal("object", "Value received needs to be an object.");
        new Assertion(typeof merged).to.equal("object", "Value to compare to / expect needs to be an object.");
        message = ((_message = message) !== null && _message !== void 0 ? _message : "") + (message !== void 0 ? ": " : "");
        this.assert(res, prettyLogObjects ? `${message}Expected
${(0, _utils$1.pretty)(obj)}
to partially deep equal
${(0, _utils$1.pretty)(other)}.` : `${message}Expected objects to be partially equal.`, prettyLogObjects ? `${message}Expected
${(0, _utils$1.pretty)(obj)}
to NOT partially deep equal
${(0, _utils$1.pretty)(other)}.` : `${message}Expected objects to NOT be partially equal.`, merged, obj);
      } else {
        _super.apply(this, arguments);
      }
    };
  });
}
function compare(obj, required) {
  if (obj === required)
    return;
  const objKeys = Object.keys(obj);
  for (const key of Object.keys(required)) {
    if (!objKeys.includes(key))
      return false;
    const requiredVal = required[key];
    const val = obj[key];
    if (typeof val === "object" && typeof requiredVal === "object") {
      const res = compare(val, requiredVal);
      if (res === false)
        return res;
    } else if (val !== requiredVal)
      return false;
  }
  return true;
}
function merge(obj, required) {
  const clone = (0, _utils$1.isArray)(required) ? [...required] : __spreadValues({}, required);
  const requiredKeys = Object.keys(required);
  const keys4 = Object.keys(obj);
  for (const key of keys4) {
    if (typeof obj[key] === "object" && typeof clone[key] === "object") {
      if (obj[key] !== clone[key]) {
        clone[key] = merge(obj[key], clone[key]);
      }
    } else if (!requiredKeys.includes(key)) {
      clone[key] = obj[key];
    }
  }
  return clone;
}
var testName$1 = {};
Object.defineProperty(testName$1, "__esModule", {
  value: true
});
testName$1.testName = testName;
var _path = _interopRequireDefault(require$$0);
var _utils = utils;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function testName({
  nest = true,
  __filename
} = {}, sep = _path.default.sep) {
  var _Error$stack, _Error$stack$split$fi, _Error$stack$split$fi2;
  sep = _path.default.sep === "\\" ? "\\\\" : "/";
  const regex = `${(0, _utils.escapeRegex)(_path.default.resolve(process.cwd()))}${sep}(test|tests)${sep}`;
  const regexp = new RegExp(regex, "i");
  const filename = __filename !== null && __filename !== void 0 ? __filename : (_Error$stack = new Error().stack) === null || _Error$stack === void 0 ? void 0 : (_Error$stack$split$fi = _Error$stack.split("\n").find((line) => line.match(regexp) !== null)) === null || _Error$stack$split$fi === void 0 ? void 0 : (_Error$stack$split$fi2 = _Error$stack$split$fi.match(/\((.*?)\)/)) === null || _Error$stack$split$fi2 === void 0 ? void 0 : _Error$stack$split$fi2[1];
  if (filename === void 0)
    throw new Error("Could not find test file path.");
  const filepath = filename.replace(/(\\|\/)/g, _path.default.sep);
  const name = nest ? _path.default.relative(process.cwd(), filepath).match(/(?:test|tests)(?:\/|\\)(.*?(?:\/|\\)?.*?)\./)[1] : filepath.match(/.*(?:\/|\\)(.*?)\./)[1];
  return name;
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "catchError", {
    enumerable: true,
    get: function() {
      return _catchError.catchError;
    }
  });
  Object.defineProperty(exports, "expectType", {
    enumerable: true,
    get: function() {
      return _expectType.expectType;
    }
  });
  Object.defineProperty(exports, "inspectError", {
    enumerable: true,
    get: function() {
      return _inspectError.inspectError;
    }
  });
  Object.defineProperty(exports, "partialDeepEqual", {
    enumerable: true,
    get: function() {
      return _partialDeepEqual.partialDeepEqual;
    }
  });
  Object.defineProperty(exports, "testName", {
    enumerable: true,
    get: function() {
      return _testName.testName;
    }
  });
  var _catchError = catchError$1;
  var _expectType = expectType$1;
  var _inspectError = inspectError$1;
  var _partialDeepEqual = partialDeepEqual$1;
  var _testName = testName$1;
})(testing);
var types = {};
var AddParameters = {};
Object.defineProperty(AddParameters, "__esModule", {
  value: true
});
var AnyClass = {};
Object.defineProperty(AnyClass, "__esModule", {
  value: true
});
var AnyFunction = {};
Object.defineProperty(AnyFunction, "__esModule", {
  value: true
});
var AnyPromise = {};
Object.defineProperty(AnyPromise, "__esModule", {
  value: true
});
var AnyTimer = {};
Object.defineProperty(AnyTimer, "__esModule", {
  value: true
});
var debounce = {};
Object.defineProperty(debounce, "__esModule", {
  value: true
});
var DeepPartial = {};
Object.defineProperty(DeepPartial, "__esModule", {
  value: true
});
var DeepRequired = {};
Object.defineProperty(DeepRequired, "__esModule", {
  value: true
});
var EmptyArray = {};
Object.defineProperty(EmptyArray, "__esModule", {
  value: true
});
var ErrorW = {};
Object.defineProperty(ErrorW, "__esModule", {
  value: true
});
var ExpandClassRecord = {};
Object.defineProperty(ExpandClassRecord, "__esModule", {
  value: true
});
var ExpandRecord = {};
Object.defineProperty(ExpandRecord, "__esModule", {
  value: true
});
var IsAssignable = {};
Object.defineProperty(IsAssignable, "__esModule", {
  value: true
});
var IsEmptyArray = {};
Object.defineProperty(IsEmptyArray, "__esModule", {
  value: true
});
var IsEqual = {};
Object.defineProperty(IsEqual, "__esModule", {
  value: true
});
var Keys$1 = {};
Object.defineProperty(Keys$1, "__esModule", {
  value: true
});
var MakeOptional = {};
Object.defineProperty(MakeOptional, "__esModule", {
  value: true
});
var MakePrimitive = {};
Object.defineProperty(MakePrimitive, "__esModule", {
  value: true
});
var MakeRequired = {};
Object.defineProperty(MakeRequired, "__esModule", {
  value: true
});
var Mixin = {};
Object.defineProperty(Mixin, "__esModule", {
  value: true
});
var Mutable = {};
Object.defineProperty(Mutable, "__esModule", {
  value: true
});
var NonEmptyArray = {};
Object.defineProperty(NonEmptyArray, "__esModule", {
  value: true
});
var OrToAnd = {};
Object.defineProperty(OrToAnd, "__esModule", {
  value: true
});
var RecordFromArray = {};
Object.defineProperty(RecordFromArray, "__esModule", {
  value: true
});
var throttle = {};
Object.defineProperty(throttle, "__esModule", {
  value: true
});
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _AddParameters = AddParameters;
  Object.keys(_AddParameters).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _AddParameters[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _AddParameters[key];
      }
    });
  });
  var _AnyClass = AnyClass;
  Object.keys(_AnyClass).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _AnyClass[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _AnyClass[key];
      }
    });
  });
  var _AnyFunction = AnyFunction;
  Object.keys(_AnyFunction).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _AnyFunction[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _AnyFunction[key];
      }
    });
  });
  var _AnyPromise = AnyPromise;
  Object.keys(_AnyPromise).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _AnyPromise[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _AnyPromise[key];
      }
    });
  });
  var _AnyTimer = AnyTimer;
  Object.keys(_AnyTimer).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _AnyTimer[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _AnyTimer[key];
      }
    });
  });
  var _debounce2 = debounce;
  Object.keys(_debounce2).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _debounce2[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _debounce2[key];
      }
    });
  });
  var _DeepPartial = DeepPartial;
  Object.keys(_DeepPartial).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _DeepPartial[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _DeepPartial[key];
      }
    });
  });
  var _DeepRequired = DeepRequired;
  Object.keys(_DeepRequired).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _DeepRequired[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _DeepRequired[key];
      }
    });
  });
  var _EmptyArray = EmptyArray;
  Object.keys(_EmptyArray).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _EmptyArray[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _EmptyArray[key];
      }
    });
  });
  var _ErrorW = ErrorW;
  Object.keys(_ErrorW).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _ErrorW[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _ErrorW[key];
      }
    });
  });
  var _ExpandClassRecord = ExpandClassRecord;
  Object.keys(_ExpandClassRecord).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _ExpandClassRecord[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _ExpandClassRecord[key];
      }
    });
  });
  var _ExpandRecord = ExpandRecord;
  Object.keys(_ExpandRecord).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _ExpandRecord[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _ExpandRecord[key];
      }
    });
  });
  var _IsAssignable = IsAssignable;
  Object.keys(_IsAssignable).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _IsAssignable[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _IsAssignable[key];
      }
    });
  });
  var _IsEmptyArray = IsEmptyArray;
  Object.keys(_IsEmptyArray).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _IsEmptyArray[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _IsEmptyArray[key];
      }
    });
  });
  var _IsEqual = IsEqual;
  Object.keys(_IsEqual).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _IsEqual[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _IsEqual[key];
      }
    });
  });
  var _Keys = Keys$1;
  Object.keys(_Keys).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _Keys[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _Keys[key];
      }
    });
  });
  var _MakeOptional = MakeOptional;
  Object.keys(_MakeOptional).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _MakeOptional[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _MakeOptional[key];
      }
    });
  });
  var _MakePrimitive = MakePrimitive;
  Object.keys(_MakePrimitive).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _MakePrimitive[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _MakePrimitive[key];
      }
    });
  });
  var _MakeRequired = MakeRequired;
  Object.keys(_MakeRequired).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _MakeRequired[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _MakeRequired[key];
      }
    });
  });
  var _Mixin = Mixin;
  Object.keys(_Mixin).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _Mixin[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _Mixin[key];
      }
    });
  });
  var _Mutable = Mutable;
  Object.keys(_Mutable).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _Mutable[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _Mutable[key];
      }
    });
  });
  var _NonEmptyArray = NonEmptyArray;
  Object.keys(_NonEmptyArray).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _NonEmptyArray[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _NonEmptyArray[key];
      }
    });
  });
  var _OrToAnd = OrToAnd;
  Object.keys(_OrToAnd).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _OrToAnd[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _OrToAnd[key];
      }
    });
  });
  var _RecordFromArray = RecordFromArray;
  Object.keys(_RecordFromArray).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _RecordFromArray[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _RecordFromArray[key];
      }
    });
  });
  var _throttle = throttle;
  Object.keys(_throttle).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (key in exports && exports[key] === _throttle[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _throttle[key];
      }
    });
  });
})(types);
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _exportNames = {
    colors: true,
    retypes: true,
    testing: true,
    types: true,
    utils: true
  };
  exports.utils = exports.types = exports.testing = exports.retypes = exports.colors = void 0;
  var _colors = _interopRequireWildcard(colors);
  exports.colors = _colors;
  var _retypes2 = _interopRequireWildcard(retypes);
  exports.retypes = _retypes2;
  Object.keys(_retypes2).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key))
      return;
    if (key in exports && exports[key] === _retypes2[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _retypes2[key];
      }
    });
  });
  var _testing = _interopRequireWildcard(testing);
  exports.testing = _testing;
  Object.keys(_testing).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key))
      return;
    if (key in exports && exports[key] === _testing[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _testing[key];
      }
    });
  });
  var _types = _interopRequireWildcard(types);
  exports.types = _types;
  Object.keys(_types).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key))
      return;
    if (key in exports && exports[key] === _types[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _types[key];
      }
    });
  });
  var _utils2 = _interopRequireWildcard(utils);
  exports.utils = _utils2;
  Object.keys(_utils2).forEach(function(key) {
    if (key === "default" || key === "__esModule")
      return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key))
      return;
    if (key in exports && exports[key] === _utils2[key])
      return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function() {
        return _utils2[key];
      }
    });
  });
  function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function")
      return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(dist);
var ERROR = /* @__PURE__ */ ((ERROR2) => {
  ERROR2["CHORD_W_ONLY_MODIFIERS"] = "CHORD_W_ONLY_MODIFIERS";
  ERROR2["CHORD_W_MULTIPLE_NORMAL_KEYS"] = "CHORD_W_MULTIPLE_NORMAL_KEYS";
  ERROR2["CHORD_W_MULTIPLE_WHEEL_KEYS"] = "CHORD_W_MULTIPLE_WHEEL_KEYS";
  ERROR2["CHORD_W_DUPLICATE_KEY"] = "CHORD_W_DUPLICATE_KEY";
  ERROR2["IMPOSSIBLE_TOGGLE_SEQUENCE"] = "IMPOSSIBLE_TOGGLE_SEQUENCE";
  ERROR2["INVALID_KEY_OPTIONS"] = "INVALID_KEY_OPTIONS";
  ERROR2["MISSING"] = "MISSING";
  ERROR2["INVALID_VARIANT"] = "VARIANT_EXISTS_AS_KEY";
  ERROR2["DUPLICATE_KEY"] = "DUPLICATE_KEY";
  ERROR2["DUPLICATE_COMMAND"] = "DUPLICATE_COMMAND";
  ERROR2["DUPLICATE_SHORTCUT"] = "DUPLICATE_SHORTCUT";
  ERROR2["KEYS_CANNOT_ADD_TOGGLE"] = "KEYS_CANNOT_ADD_TOGGLE";
  ERROR2["INVALID_SWAP_CHORDS"] = "INCORRECT_SWAP_PARAMS";
  ERROR2["MULTIPLE_MATCHING_SHORTCUTS"] = "MULTIPLE_MATCHING_SHORTCUTS";
  ERROR2["INCORRECT_TOGGLE_STATE"] = "INCORRECT_TOGGLE_STATE";
  ERROR2["NO_MATCHING_SHORTCUT"] = "NO_MATCHING_SHORTCUT";
  ERROR2["UNKNOWN_KEYS_IN_SHORTCUTS"] = "UNKNOWN_KEYS_IN_SHORTCUTS";
  ERROR2["UNKNOWN_COMMANDS_IN_SHORTCUTS"] = "UNKNOWN_COMMANDS_IN_SHORTCUTS";
  ERROR2["UNKNOWN_KEYS_IN_SHORTCUT"] = "UNKNOWN_KEYS_IN_SHORTCUT";
  ERROR2["UNKNOWN_COMMAND_IN_SHORTCUT"] = "UNKNOWN_COMMANDS_IN_SHORTCUT";
  ERROR2["KEY_IN_USE"] = "KEYS_IN_USE";
  ERROR2["COMMAND_IN_USE"] = "COMMANDS_IN_USE";
  ERROR2["UNKNOWN_KEY_EVENT"] = "UNKNOWN_KEY_EVENT";
  ERROR2["RECORDING"] = "RECORDING";
  ERROR2["IMPORT_COMMAND"] = "IMPORT_KEY";
  ERROR2["IMPORT_SHORTCUT_COMMAND"] = "IMPORT_SHORTCUT_COMMAND";
  ERROR2["IMPORT_SHORTCUT_KEY"] = "IMPORT_SHORTCUT_KEY";
  return ERROR2;
})(ERROR || {});
var TYPE_ERROR = /* @__PURE__ */ ((TYPE_ERROR2) => {
  TYPE_ERROR2["ILLEGAL_OPERATION"] = "ILLEGAL_OPERATION";
  TYPE_ERROR2["HOOK_DOES_NOT_EXIST"] = "HOOK_DOES_NOT_EXIST";
  TYPE_ERROR2["FILTER_DOES_NOT_EXIST"] = "FILTER_DOES_NOT_EXIST";
  return TYPE_ERROR2;
})(TYPE_ERROR || {});
var KEY_SORT_POS = /* @__PURE__ */ ((KEY_SORT_POS2) => {
  KEY_SORT_POS2[KEY_SORT_POS2["mod"] = 0] = "mod";
  KEY_SORT_POS2[KEY_SORT_POS2["modmouse"] = 1] = "modmouse";
  KEY_SORT_POS2[KEY_SORT_POS2["modwheel"] = 2] = "modwheel";
  KEY_SORT_POS2[KEY_SORT_POS2["modtoggle"] = 3] = "modtoggle";
  KEY_SORT_POS2[KEY_SORT_POS2["modtogglemouse"] = 4] = "modtogglemouse";
  KEY_SORT_POS2[KEY_SORT_POS2["modtogglewheel"] = 5] = "modtogglewheel";
  KEY_SORT_POS2[KEY_SORT_POS2["normal"] = 6] = "normal";
  KEY_SORT_POS2[KEY_SORT_POS2["mouse"] = 7] = "mouse";
  KEY_SORT_POS2[KEY_SORT_POS2["wheel"] = 8] = "wheel";
  KEY_SORT_POS2[KEY_SORT_POS2["toggle"] = 9] = "toggle";
  KEY_SORT_POS2[KEY_SORT_POS2["togglemouse"] = 10] = "togglemouse";
  KEY_SORT_POS2[KEY_SORT_POS2["togglewheel"] = 11] = "togglewheel";
  return KEY_SORT_POS2;
})(KEY_SORT_POS || {});
function checkShortcutCommands(shortcut, commands, s, realShortcut) {
  const unknownCommand = shortcut.command ? commands.query((known) => known === shortcut.command, false) === void 0 ? shortcut.command : void 0 : void 0;
  if (unknownCommand) {
    return dist.Err(new KnownError(ERROR.UNKNOWN_COMMAND_IN_SHORTCUT, dist.crop`
			${s.stringify(shortcut.chain)} contains unknown command: ${unknownCommand.name}
		`, { shortcut: realShortcut ? realShortcut : shortcut, command: unknownCommand }));
  }
  return dist.Ok();
}
function checkShortcutKeys(shortcut, keys4, s, realShortcut) {
  const unknownKeys = shortcut.chain.flat().map((key) => keys4.query((known) => known === key, false) === void 0 ? key : void 0).filter((key) => key !== void 0);
  if (unknownKeys.length > 0) {
    return dist.Err(new KnownError(ERROR.UNKNOWN_KEYS_IN_SHORTCUT, dist.crop`
		${s.stringify(shortcut.chain)}${shortcut.command ? ` (Command: ${shortcut.command.name})` : ""} contains unknown keys: ${s.stringifyKeys(unknownKeys)}
		`, { shortcut: realShortcut ? realShortcut : shortcut, keys: unknownKeys }));
  }
  return dist.Ok(true);
}
function checkManagerShortcuts(shortcuts, keys4, commands, s) {
  if (keys4) {
    const keyErrors = [];
    for (const shortcut of shortcuts.entries) {
      const res = checkShortcutKeys(shortcut, keys4, s);
      if (res.isError) {
        keyErrors.push({ shortcut, err: res.error });
      }
    }
    if (keyErrors.length > 0) {
      return dist.Err(new KnownError(ERROR.UNKNOWN_KEYS_IN_SHORTCUTS, dist.crop`
			Some shortcuts contain unknown keys.

			${dist.indent(keyErrors.map(({ err }) => err.message).join("\n"), 3)}

			`, { entries: keyErrors.map(({ shortcut, err }) => ({ shortcut, keys: err.info.keys })) }));
    }
  }
  if (commands) {
    const commandErrors = [];
    for (const shortcut of shortcuts.entries) {
      const res = checkShortcutCommands(shortcut, commands, s);
      if (res.isError) {
        commandErrors.push({ shortcut, err: res.error });
      }
    }
    if (commandErrors.length > 0) {
      return dist.Err(new KnownError(ERROR.UNKNOWN_COMMANDS_IN_SHORTCUTS, dist.crop`
			Some shortcuts contain unknown commands.

			${dist.indent(commandErrors.map(({ err }) => err.message).join("\n"), 3)}

			`, { entries: commandErrors.map(({ shortcut, err }) => ({ shortcut, command: err.info.command })) }));
    }
  }
  return dist.Ok(true);
}
class KnownError extends Error {
  constructor(code, str, info) {
    super(str);
    this.code = code;
    this.info = info;
  }
}
function containsPossibleToggleChords(self2, chain, stringifier) {
  const prevToggles = [];
  let num = 0;
  let impossible;
  for (const chord of chain) {
    const toggles = chord.filter((key) => key.is.toggle);
    let found = false;
    for (let k = 0; k < toggles.length; k++) {
      const curr = toggles[k];
      const prevWithSameRoots = prevToggles.map(([prev, j]) => (prev.root || prev) === (curr.root || curr) ? [prev, j] : void 0).filter((key) => key !== void 0);
      prevWithSameRoots.push([curr, num + k]);
      let canBeOn = true;
      let canBeOff = true;
      for (const [key, j] of prevWithSameRoots) {
        if (key.root === void 0) {
          const couldOn = canBeOn;
          const couldOff = canBeOff;
          canBeOn = couldOff;
          canBeOff = couldOn;
          continue;
        }
        const isOff = key.root.off === key;
        const isOn2 = key.root.on === key;
        if (isOn2 && !canBeOn || isOff && !canBeOff) {
          impossible = { key, pos: j };
          break;
        }
        canBeOn = isOff;
        canBeOff = isOn2;
      }
      if (impossible) {
        found = true;
        break;
      }
      if (curr.is.toggle) {
        prevToggles.push([curr, num + k]);
      }
      num += chord.length;
    }
    if (found)
      break;
  }
  if (impossible) {
    const prettyShortcut = stringifier.stringify(chain);
    const { pos, key } = impossible;
    return dist.Err(new KnownError(ERROR.IMPOSSIBLE_TOGGLE_SEQUENCE, dist.crop`
			Chain "${prettyShortcut}" is impossible.
			This chain has a toggle key state "${stringifier.stringify(key)}" at key #${pos + 1} that would be impossible to trigger.
		`, { self: self2, chain, key, i: pos }));
  }
  return dist.Ok(true);
}
function createInstance(type, key, entry) {
  const arg = entry[key];
  const opts = entry.opts;
  return new type(arg, opts);
}
const defaultManagerCallback = (error, manager) => {
  console.log(error);
  manager.clearChain();
};
function equalsKeys(keys4, base2, length) {
  if (length === void 0 && base2.length !== keys4.length || length !== void 0 && (keys4.length < length || base2.length < length))
    return false;
  return keys4.slice(0, length != null ? length : keys4.length).find((thisChord, c) => {
    const otherChord = base2[c];
    if (!otherChord || otherChord.length !== thisChord.length)
      return true;
    return thisChord.find((thisKey, i) => {
      const shortcutKey = otherChord[i];
      if (!shortcutKey)
        return true;
      return !thisKey.equals(shortcutKey);
    }) !== void 0;
  }) === void 0;
}
function isWheelKey(key) {
  return [
    "WheelUp",
    "WheelDown",
    "WheelUpOn",
    "WheelDownOn",
    "WheelUpOff",
    "WheelDownOff"
  ].includes(key.id);
}
function isModifierKey(key) {
  return key.is.modifier !== false;
}
function isMouseKey(key) {
  return [
    "0",
    "1",
    "2",
    "3",
    "4",
    "0On",
    "1On",
    "2On",
    "3On",
    "4On",
    "0Off",
    "1Off",
    "2Off",
    "3Off",
    "4Off"
  ].includes(key.id);
}
function isToggleKey(key) {
  return key.is.toggle !== false;
}
function isNormalKey(key) {
  return !isWheelKey(key) && !isMouseKey(key) && !key.is.modifier && !isToggleKey(key);
}
function isToggleRootKey(key) {
  return key.is.toggle !== false && key.root === void 0;
}
function isToggleStateKey(key) {
  return key.is.toggle !== false && key.root !== void 0;
}
function isTriggerKey(key) {
  return !isModifierKey(key) && !isToggleStateKey(key);
}
function isValidChain(self2, chain, stringifier, sorter) {
  const val = [];
  for (let i = 0; i < chain.length; i++) {
    const chord = chain[i];
    const res2 = isValidChord(self2, chain, chord, i, stringifier);
    if (res2.isError)
      return res2;
    val.push(sorter.sort([...chord]));
  }
  const res = containsPossibleToggleChords(self2, chain, stringifier);
  if (res.isError)
    return res;
  return dist.Ok(true);
}
function isValidChord(self2, chain, chord, i, stringifier) {
  const prettyChord = stringifier.stringifyChord(chord);
  const prettyShortut = stringifier.stringifyChain(chain);
  const repeated = utils.findDuplicates(chord, { equals: (key, other) => {
    var _a, _b;
    if (key === other || key.id === other.id) {
      return true;
    }
    if (key.is.toggle && other.is.toggle) {
      const keyBase = (_a = key.root) != null ? _a : key;
      const otherBase = (_b = other.root) != null ? _b : other;
      if (keyBase === otherBase) {
        return true;
      }
    }
    if (isWheelKey(key) && isWheelKey(other))
      return false;
    return false;
  } });
  if (repeated.length > 0) {
    const prettyRepeated = stringifier.stringifyKeys(repeated);
    return dist.Err(new KnownError(ERROR.CHORD_W_DUPLICATE_KEY, utils.crop`
			Chord "${prettyChord}" in chain "${prettyShortut}" contains duplicate or incompatible keys:
				${utils.indent(prettyRepeated, 4)}
			Chords cannot contain duplicate keys. This includes more than one of the same toggle, regardless of the state.
		`, { self: self2, chord, i, keys: repeated }));
  }
  const onlyModifiers = chord.filter((key) => key.is.modifier);
  const containsOnlyModifiers = onlyModifiers.length === chord.length;
  if (i < chain.length - 1 && containsOnlyModifiers) {
    return dist.Err(new KnownError(ERROR.CHORD_W_ONLY_MODIFIERS, utils.crop`
			Chain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" cannot contain only modifiers if it is followed by another chord.
			A chord can only consist of only modifiers if it's the last chord in a chain.
		`, { self: self2, chord, i, keys: onlyModifiers }));
  }
  const normalKeys = chord.filter(isNormalKey);
  const prettyNormalKeys = stringifier.stringifyKeys(normalKeys);
  if (normalKeys.length > 1) {
    return dist.Err(new KnownError(ERROR.CHORD_W_MULTIPLE_NORMAL_KEYS, utils.crop`
			CHain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple normal (non-modifier/mouse/wheel/toggle) keys: ${prettyNormalKeys}
			Chords can only contain one.
		`, { self: self2, chord, i, keys: normalKeys }));
  }
  const wheelKeys = chord.filter((key) => isWheelKey(key));
  const prettyWheelKeys = stringifier.stringifyKeys(wheelKeys);
  if (wheelKeys.length > 1) {
    return dist.Err(new KnownError(ERROR.CHORD_W_MULTIPLE_WHEEL_KEYS, utils.crop`
			Chain "${prettyShortut}" is impossible.
			Chord #${i + 1} "${prettyChord}" contains multiple wheel keys: ${prettyWheelKeys}
			Chords can only contain one.
		`, { self: self2, chord, i, keys: wheelKeys }));
  }
  return dist.Ok(true);
}
function keyOrder(key, dictOrEnum) {
  let type = [
    isModifierKey(key) ? "mod" : "",
    isToggleKey(key) ? "toggle" : "",
    isMouseKey(key) ? "mouse" : "",
    isWheelKey(key) ? "wheel" : ""
  ].join("");
  if (type === "") {
    type = "normal";
  }
  return dictOrEnum[type];
}
function mapKeys(chainOrChord, func = (key) => key == null ? void 0 : key.id) {
  if (chainOrChord.length === 0)
    return [];
  return dist.isArray(chainOrChord[0]) ? chainOrChord.map((chord) => chord.map((key) => func(key))) : chainOrChord.map((key) => func(key));
}
class Hookable {
  constructor(keys4) {
    this.hooks = {};
    for (const key of keys4)
      this.hooks[key] = [];
  }
  addHook(type, hook) {
    if (typeof hook !== "function") {
      throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "Hook is not a function.", void 0);
    }
    this.hooks[type].push(hook);
  }
  removeHook(type, hook) {
    if (typeof hook !== "function") {
      throw new KnownError(TYPE_ERROR.ILLEGAL_OPERATION, "Hook is not a function.", void 0);
    }
    const index = this.hooks[type].indexOf(hook);
    if (index === -1) {
      const prettyHooks = utils.indent(utils.pretty(this.hooks[type]), 4);
      throw new KnownError(TYPE_ERROR.HOOK_DOES_NOT_EXIST, utils.crop`
			Could not find hook ${hook.toString()} in hooks list:
				${prettyHooks}
			`, {
        hook,
        hooks: this.hooks[type]
      });
    }
    this.hooks[type].splice(index, 1);
  }
}
class HookableBase extends Hookable {
  constructor() {
    super(["allows", "set"]);
  }
  _set(key, value) {
    this[key] = value;
  }
  _allows(_key, _value) {
    return utils.Result.Ok(true);
  }
  allows(key, value) {
    const self2 = this;
    for (const hook of this.hooks.allows) {
      const response = hook(key, value, self2[key], self2);
      if (response.isError)
        return response;
    }
    if (self2._allows)
      return self2._allows(key, value);
    return utils.Result.Ok(true);
  }
  set(key, value) {
    const self2 = this;
    const oldValue = self2[key];
    self2._set(key, value);
    for (const hook of this.hooks.set) {
      hook(key, value, oldValue, self2);
    }
  }
  safeSet(key, value) {
    const res = this.allows(key, value);
    if (res.isError)
      return res;
    else
      this.set(key, value);
    return utils.Ok(true);
  }
}
class HookableCollection extends Hookable {
  constructor() {
    super(["add", "remove", "allowsAdd", "allowsRemove", "set"]);
  }
  _add(_entry) {
    utils.unreachable("Should be implemented by extending class.");
  }
  _remove(_entry) {
    utils.unreachable("Should be implemented by extending class.");
  }
  _allows(type, entry) {
    switch (type) {
      case "add":
        return HookableCollection._canAddToDict(this, this.entries, entry);
      case "remove":
        return HookableCollection._canRemoveFromDict(this, this.entries, entry);
    }
  }
  _set(key, value) {
    this[key] = value;
  }
  set(key, value) {
    const self2 = this;
    const oldValue = self2[key];
    self2._set(key, value);
    for (const hook of this.hooks.set) {
      hook(key, value, oldValue, self2);
    }
  }
  allows(type, entry) {
    const self2 = this;
    for (const hook of this.hooks[`allows${type.charAt(0).toUpperCase()}${type.slice(1)}`]) {
      const response = type === "add" ? hook(self2, type, entry) : hook(self2, self2.entries, entry);
      if (response.isError)
        return response;
    }
    return self2._allows(type, entry);
  }
  add(entry) {
    const self2 = this;
    self2._add(entry);
    for (const hook of this.hooks.add) {
      hook(self2, this.entries, entry);
    }
  }
  static _canAddToDict(self2, entries2, entry) {
    let existing;
    let existingIdentifier = "";
    if (self2 instanceof Keys) {
      if (isToggleKey(entry) && !isToggleRootKey(entry)) {
        return dist.Err(new KnownError(ERROR.KEYS_CANNOT_ADD_TOGGLE, `Toggle keys are automatically added to the key set when the root key is added, on/off instances cannot be added individually.`, { entry }));
      }
      existingIdentifier = entry.id;
      existing = entries2[entry.id];
    } else if (self2 instanceof Commands) {
      existingIdentifier = entry.name;
      existing = entries2[entry.name];
    } else if (self2 instanceof Shortcuts) {
      existingIdentifier = JSON.stringify(mapKeys(entry.chain));
      existing = entries2.find((item) => entry.equals(item));
    }
    if (existing) {
      const type = self2 instanceof Keys ? "key" : self2 instanceof Commands ? "command" : "shortcut";
      const text = utils.crop`
			${type} ${existingIdentifier} is already registered.
			Existing ${type}:
			${utils.indent(utils.pretty(existing), 3)}
			New ${type}:
			${utils.indent(utils.pretty(entry), 3)}
			`;
      const error = existing instanceof Key ? new KnownError(ERROR.DUPLICATE_KEY, text, { existing, self: self2 }) : existing instanceof Command ? new KnownError(ERROR.DUPLICATE_COMMAND, text, { existing, self: self2 }) : existing instanceof Shortcut ? new KnownError(ERROR.DUPLICATE_SHORTCUT, text, { existing, self: self2 }) : utils.unreachable();
      return dist.Err(error);
    }
    return dist.Ok(true);
  }
  remove(entry) {
    const self2 = this;
    self2._remove(entry);
    for (const hook of this.hooks.remove) {
      hook(self2, this.entries, entry);
    }
  }
  static _canRemoveFromDict(self2, entries2, entry) {
    let existing;
    if (this instanceof Keys) {
      existing = entries2[entry.id];
    } else if (this instanceof Commands) {
      existing = entries2[entry.name];
    } else if (this instanceof Shortcuts) {
      existing = entries2.find((item) => entry.equals(item));
    }
    if (existing === void 0) {
      return dist.Err(new KnownError(ERROR.MISSING, utils.crop`
			${entry.constructor.name} does not exist in this collection.

			${utils.indent(utils.pretty(entry), 3)}
			`, { entry, collection: self2 }));
    }
    return dist.Ok(true);
  }
  create(_rawEntry) {
    utils.unreachable("Should be implemented by extending class.");
  }
}
class Command extends HookableBase {
  constructor(name, opts = {}) {
    super();
    this.condition = new Condition("");
    this.description = "";
    this.name = name;
    if (opts.execute)
      this.execute = opts.execute;
    if (opts.description)
      this.description = opts.description;
    if (opts.condition)
      this.condition = opts.condition;
  }
  equals(command) {
    if (command === void 0)
      return false;
    return this === command || this.name === command.name && this.execute === command.execute && this.condition.equals(command.condition) && this.description === command.description;
  }
  get opts() {
    return { description: this.description, execute: this.execute, condition: this.condition };
  }
  static create(entry) {
    return createInstance(Command, "name", entry);
  }
  export() {
    return {
      name: this.name,
      description: this.description,
      condition: this.condition.export()
    };
  }
}
class Commands extends HookableCollection {
  constructor(commands) {
    super();
    this._basePrototype = Command;
    this.entries = {};
    for (const rawEntry of commands) {
      const entry = this.create(rawEntry);
      if (this.allows("add", entry).unwrap())
        this.add(entry);
    }
  }
  _add(rawEntry) {
    const entry = this.create(rawEntry);
    entry.addHook("allows", (type, value, old) => {
      if (type === "name") {
        const existing = this.entries[value];
        if (existing !== void 0 && existing !== rawEntry) {
          return dist.Err(new KnownError(ERROR.DUPLICATE_COMMAND, dist.crop`
						Command name "${old}" cannot be changed to "${value}" because it would create a duplicate command in a "Commands" instance that this command was added to.
					`, { existing, self: this }));
        }
      }
      return dist.Ok(true);
    });
    entry.addHook("set", (type, value, old) => {
      if (type === "name") {
        const existing = this.entries[old];
        delete this.entries[old];
        this.entries[value] = existing;
      }
    });
    const entries2 = this.entries;
    entries2[rawEntry.name] = rawEntry;
  }
  _remove(entry) {
    const entries2 = this.entries;
    delete entries2[entry.name];
  }
  get(name) {
    return this.entries[name];
  }
  query(filter, all = true) {
    return all ? Object.values(this.entries).filter(filter) : Object.values(this.entries).find(filter);
  }
  export() {
    const commands = {};
    for (const id2 of Object.keys(this.entries)) {
      commands[id2] = this.entries[id2].export();
    }
    return commands;
  }
  create(rawEntry) {
    if (rawEntry instanceof Command)
      return rawEntry;
    return this._basePrototype.create(rawEntry);
  }
  safeRemoveAll() {
    let res;
    for (const command of Object.values(this.entries)) {
      res = this.allows("remove", command);
      if (res.isError)
        return res;
    }
    for (const command of Object.values(this.entries)) {
      this.remove(command);
    }
    return dist.Ok(true);
  }
}
function fastIsEqual(obj, other) {
  const keys1 = Object.keys(obj);
  const keys22 = Object.keys(other);
  if (keys1.length !== keys22.length)
    return false;
  for (const key of keys1) {
    const val1 = obj[key];
    const val2 = other[key];
    if (typeof val1 === "object" && typeof val2 === "object") {
      if (!fastIsEqual(val1, val2))
        return false;
    }
    if (val1 !== val2)
      return false;
  }
  return true;
}
class Context {
  constructor(context) {
    this.value = context;
  }
  equals(context) {
    return fastIsEqual(this.value, context.value);
  }
  eval(condition) {
    return condition.eval(this);
  }
  export() {
    return { value: this.value };
  }
}
class KeysStringifier {
  constructor(opts = {}) {
    if (opts.key)
      this._key = opts.key;
    if (opts.keys)
      this._keys = opts.keys;
    if (opts.chord)
      this._chord = opts.chord;
    if (opts.chain)
      this._shortcut = opts.chain;
  }
  stringify(keyChordOrShorcut) {
    if (keyChordOrShorcut instanceof Key)
      return this.stringifyKey(keyChordOrShorcut);
    if (Array.isArray(keyChordOrShorcut)) {
      if (keyChordOrShorcut.length === 0)
        return this.stringifyChord([]);
      if (Array.isArray(keyChordOrShorcut[0]))
        return this.stringifyChain(keyChordOrShorcut);
      return this.stringifyChord(keyChordOrShorcut);
    }
    dist.unreachable();
  }
  stringifyKey(key) {
    if (this._key)
      return this._key(key);
    return key.label;
  }
  stringifyChord(keys4) {
    const stringified = keys4.map((key) => this.stringifyKey(key));
    if (this._chord)
      return this._chord(stringified);
    return stringified.join("+");
  }
  stringifyChain(shortcut) {
    const stringified = shortcut.map((chord) => this.stringifyChord(chord));
    if (this._shortcut)
      return this._shortcut(stringified);
    return stringified.join(" ");
  }
  stringifyKeys(chord) {
    const stringified = chord.map((key) => this.stringifyKey(key));
    if (this._keys)
      return this._keys(stringified);
    return stringified.join(", ");
  }
}
const defaultStringifier = new KeysStringifier();
const BYPASS_TOGGLE_CREATION = Symbol("BYPASS_TOGGLE_CREATION");
class Key extends HookableBase {
  constructor(id2, opts = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    super();
    this.pressed = false;
    this.width = 1;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.render = true;
    this.stringifier = defaultStringifier;
    dist.setReadOnly(this, "id", id2);
    if (opts.variants) {
      this.safeSet("variants", opts.variants).unwrap();
    }
    this.label = (_a = opts.label) != null ? _a : this.id;
    this.classes = (_b = opts.classes) != null ? _b : [];
    this.x = (_c = opts.x) != null ? _c : this.x;
    this.y = (_d = opts.y) != null ? _d : this.y;
    this.width = (_e = opts.width) != null ? _e : this.width;
    this.height = (_f = opts.height) != null ? _f : this.height;
    if (opts.stringifier)
      this.stringifier = opts.stringifier;
    this.is = {
      toggle: false,
      modifier: false
    };
    if (((_g = opts.is) == null ? void 0 : _g.modifier) === true) {
      dist.setReadOnly(this.is, "modifier", "native");
    } else if ((_h = opts.is) == null ? void 0 : _h.modifier) {
      dist.setReadOnly(this.is, "modifier", opts.is.modifier);
    }
    if ((_i = opts.is) == null ? void 0 : _i.toggle) {
      dist.setReadOnly(this.is, "toggle", opts.is.toggle === true ? "native" : opts.is.toggle);
      if (arguments[2] !== BYPASS_TOGGLE_CREATION) {
        this._keyCreateToggle(opts);
      }
    }
    Object.freeze(this.is);
  }
  _allows(key, value) {
    if (key === "variants") {
      if (value.includes(this.id)) {
        return utils.Err(new KnownError(ERROR.INVALID_VARIANT, `Attempted to set the variants of key ${this.stringifier.stringify(this)} to: [${value.join(", ")}], but one of the variants is the key id itself.`, { variants: value, id: this.id }));
      }
    }
    return utils.Ok(true);
  }
  _keyCreateToggle(opts = {}) {
    this.on = new Key(`${this.id}On`, __spreadProps(__spreadValues({}, opts), { render: false }), BYPASS_TOGGLE_CREATION);
    this.off = new Key(`${this.id}Off`, __spreadProps(__spreadValues({}, opts), { render: false }), BYPASS_TOGGLE_CREATION);
    if (this.label) {
      const val = this.label;
      if (this.on.allows("label", `${val} (On)`).isOk)
        this.on.set("label", `${val} (On)`);
      if (this.off.allows("label", `${val} (Off)`).isOk)
        this.off.set("label", `${val} (Off)`);
    }
    this.on.root = this;
    this.off.root = this;
    this.addHook("set", (prop, val) => {
      if (prop === "label") {
        utils.castType(val);
        if (this.on.allows("label", `${val} (On)`).isOk)
          this.on.set("label", `${val} (On)`);
        if (this.off.allows("label", `${val} (Off)`).isOk)
          this.off.set("label", `${val} (Off)`);
      }
    });
  }
  equals(key) {
    return this === key || this.id === key.id;
  }
  get opts() {
    return { is: this.is, variants: this.variants, x: this.x, y: this.y, width: this.width, height: this.height, stringifier: this.stringifier, label: this.label, render: this.render, classes: this.classes };
  }
  static create(entry) {
    return createInstance(Key, "id", entry);
  }
  export() {
    const opts = __spreadValues({}, this.opts);
    delete opts.stringifier;
    opts.is = __spreadValues({}, opts.is);
    return __spreadValues({
      id: this.id
    }, opts);
  }
}
class Keys extends HookableCollection {
  constructor(keys4, opts) {
    var _a;
    super();
    this._basePrototype = Key;
    this.stringifier = defaultStringifier;
    this._manageLayout = true;
    this.layout = { rows: 0, columns: 0 };
    this._boundKeyManageLayoutHook = this._keyManageLayoutHook.bind(this);
    this.entries = {};
    if (opts == null ? void 0 : opts.stringifier)
      this.stringifier = opts.stringifier;
    this.manageLayout = (_a = opts == null ? void 0 : opts.manageLayout) != null ? _a : true;
    for (const rawEntry of keys4) {
      const entry = this.create(rawEntry);
      if (this.allows("add", entry).unwrap())
        this.add(entry);
    }
  }
  set manageLayout(val) {
    this._manageLayout = val;
    if (val)
      this.recalculateLayout();
  }
  get manageLayout() {
    return this._manageLayout;
  }
  _add(rawEntry) {
    const entry = this.create(rawEntry);
    const entries2 = this.entries;
    entries2[entry.id] = entry;
    if (isToggleKey(entry)) {
      entries2[entry.on.id] = entry.on;
      entries2[entry.off.id] = entry.off;
    }
    entry.addHook("set", this._boundKeyManageLayoutHook);
    if (this.manageLayout)
      this.recalculateLayout();
  }
  _remove(entry) {
    const entries2 = this.entries;
    delete entries2[entry.id];
    if (isToggleKey(entry)) {
      delete entries2[entry.on.id];
      delete entries2[entry.on.id];
    }
    entry.removeHook("set", this._boundKeyManageLayoutHook);
    if (this.manageLayout)
      this.recalculateLayout();
  }
  recalculateLayout() {
    let rows = 0;
    let columns = 0;
    for (const key of Object.values(this.entries)) {
      if (key.render) {
        const xLimit = key.x + key.width;
        columns = xLimit > columns ? xLimit : columns;
        const yLimit = key.y + key.height;
        rows = yLimit > rows ? yLimit : rows;
      }
    }
    this.set("layout", { rows, columns });
  }
  _keyManageLayoutHook(prop, _value, _old, _self) {
    if (this.manageLayout && ["x", "y", "width", "height", "render"].includes(prop)) {
      this.recalculateLayout();
    }
    return dist.Ok(true);
  }
  get(id2) {
    return this.entries[id2];
  }
  query(filter, all = true) {
    return all ? Object.values(this.entries).filter(filter) : Object.values(this.entries).find(filter);
  }
  create(rawEntry) {
    var _a, _b;
    if (rawEntry instanceof Key) {
      rawEntry.stringifier = this.stringifier;
      return rawEntry;
    }
    return this._basePrototype.create(__spreadProps(__spreadValues({}, rawEntry), {
      opts: __spreadProps(__spreadValues({}, rawEntry.opts), {
        stringifier: (_b = this.stringifier) != null ? _b : (_a = rawEntry.opts) == null ? void 0 : _a.stringifier
      })
    }));
  }
  export() {
    const keys4 = {};
    for (const id2 of Object.keys(this.entries)) {
      keys4[id2] = this.entries[id2].export();
    }
    return keys4;
  }
  safeRemoveAll() {
    let res;
    for (const key of Object.values(this.entries)) {
      res = this.allows("remove", key);
      if (res.isError)
        return res;
    }
    for (const command of Object.values(this.entries)) {
      this.remove(command);
    }
    return dist.Ok(true);
  }
}
const sDefaultSort = Symbol("defaultSort");
class KeysSorter {
  constructor(opts = {}) {
    this.order = KEY_SORT_POS;
    if (opts.order)
      this.order = opts.order;
  }
  [sDefaultSort](a, b, order) {
    if (keyOrder(a, order) < keyOrder(b, order))
      return -1;
    if (keyOrder(b, order) < keyOrder(a, order))
      return 1;
    return a.id.localeCompare(b.id);
  }
  sort(keys4) {
    return keys4.sort((a, b) => this[sDefaultSort](a, b, this.order));
  }
}
const defaultSorter = new KeysSorter();
const defaultLabelFilter = () => true;
class Manager extends HookableBase {
  constructor(keys4, commands, shortcuts, context, cb, {
    stringifier,
    sorter,
    autoReleaseDelay = 500,
    labelStrategy = true,
    labelFilter
  } = {}) {
    super();
    this.chain = [];
    this.cb = defaultManagerCallback;
    this.labelStrategy = "both";
    this._selfKeyboardMap = /* @__PURE__ */ new Map();
    this._timers = /* @__PURE__ */ new Map();
    this.labelFilter = defaultLabelFilter;
    this.isAwaitingKeyup = false;
    this.isRecording = false;
    this._nextIsChord = false;
    this._bypassChainSet = false;
    this._untrigger = false;
    this._nativeToggleKeys = [];
    this._nativeModifierKeys = [];
    this._boundKeydown = this._keydown.bind(this);
    this._boundKeyup = this._keyup.bind(this);
    this._boundMousedown = this._mousedown.bind(this);
    this._boundMouseup = this._mouseup.bind(this);
    this._boundWheel = this._wheel.bind(this);
    this._boundKeysAddHook = this._keysAddHook.bind(this);
    this._boundKeysRemoveHook = this._keysRemoveHook.bind(this);
    this._boundKeysAllowsRemoveHook = this._keysAllowsRemoveHook.bind(this);
    this._boundCommandsAllowsRemoveHook = this._commandsAllowsRemoveHook.bind(this);
    this._boundShortcutAddHook = this._shortcutAddHook.bind(this);
    this._boundShortcutRemoveHook = this._shortcutRemoveHook.bind(this);
    this._boundShortcutAllowsHook = this._shortcutAllowsHook.bind(this);
    if (cb)
      this.cb = cb;
    this.context = context;
    this.stringifier = stringifier != null ? stringifier : defaultStringifier;
    this.sorter = sorter != null ? sorter : defaultSorter;
    this.autoReleaseDelay = autoReleaseDelay;
    if (labelFilter)
      this.labelFilter = labelFilter;
    this.set("labelStrategy", labelStrategy);
    this.safeSet("replace", { shortcuts, keys: keys4, commands }).unwrap();
  }
  get _labelWNavigator() {
    return [true, "both", "navigator"].includes(this.labelStrategy);
  }
  get _labelWPress() {
    return [true, "both", "press"].includes(this.labelStrategy);
  }
  async _labelStrategyStatus() {
    if (this._labelWNavigator) {
      if (typeof navigator !== "undefined") {
        dist.castType(navigator);
        if (navigator == null ? void 0 : navigator.keyboard) {
          const map = await navigator.keyboard.getLayoutMap();
          this.keyboardMap = map;
          for (const key of Object.values(this.keys.entries)) {
            this._keyboardMapLabel(map, key);
          }
        }
      }
    }
  }
  _keyboardMapLabel(map, key) {
    var _a;
    if (this._labelWNavigator && map && this.keys.entries[key.id] === key) {
      const codes = [key.id, ...(_a = key.variants) != null ? _a : []];
      for (const code of codes) {
        const label = map.get(code);
        if (label) {
          if (this.labelFilter({ key: label }, key)) {
            key.set("label", label);
            this._selfKeyboardMap.set(key, true);
          }
        }
      }
    }
  }
  _checkLabel(e, prop, keys4) {
    if (this._labelWPress) {
      for (const key of keys4) {
        if (!this._selfKeyboardMap.has(key)) {
          if (this.labelFilter(e, key)) {
            switch (prop) {
              case "deltaY":
                key.set("label", e.deltaY < 0 ? "Wheel Up" : "Wheel Down");
                return;
              case "button":
                key.set("label", `Button ${e.button}`);
                return;
              case "key":
                key.set("label", e.key);
                return;
              default:
                dist.unreachable();
            }
          }
        }
      }
    }
  }
  pressedKeys() {
    return this.keys.query((key) => key.pressed, true);
  }
  pressedNonModifierKeys() {
    return this.keys.query((key) => key.pressed && isTriggerKey(key), true);
  }
  pressedModifierKeys() {
    return this.keys.query((key) => key.pressed && isModifierKey(key), true);
  }
  lastChord() {
    const lastChord = this.chain[this.chain.length - 1];
    return lastChord ? [...lastChord] : void 0;
  }
  attach(el) {
    el.addEventListener("keydown", this._boundKeydown);
    el.addEventListener("keyup", this._boundKeyup);
    el.addEventListener("wheel", this._boundWheel);
    el.addEventListener("mousedown", this._boundMousedown);
    el.addEventListener("mouseup", this._boundMouseup);
  }
  detach(el) {
    el.removeEventListener("keydown", this._boundKeydown);
    el.removeEventListener("keyup", this._boundKeyup);
    el.removeEventListener("wheel", this._boundWheel);
    el.removeEventListener("mousedown", this._boundMousedown);
    el.removeEventListener("mouseup", this._boundMouseup);
  }
  startRecording() {
    this.clearChain();
    dist.setReadOnly(this, "isRecording", true);
  }
  stopRecording() {
    this.clearChain();
    dist.setReadOnly(this, "isRecording", false);
  }
  inChain() {
    if (this.isAwaitingKeyup)
      return false;
    const shortcuts = this.shortcuts.query((shortcut) => shortcut.enabled && shortcut.command && shortcut.command.execute && this.chain.length < shortcut.chain.length && shortcut.equalsKeys(this.chain, this.chain.length) && shortcut.condition.eval(this.context) && (shortcut.command === void 0 || shortcut.command.condition.eval(this.context)));
    if (!shortcuts)
      return false;
    return shortcuts.length > 0;
  }
  static cloneChain(chain) {
    const clone = [];
    for (const chord of chain) {
      const cloneChord = [];
      for (const key of chord)
        cloneChord.push(key);
      clone.push(cloneChord);
    }
    return clone;
  }
  clearChain() {
    this.set("chain", []);
  }
  smartClearChain() {
    if (this.chain.length > 1)
      this.clearChain();
  }
  forceClear({ ignoreNative = false } = {}) {
    this.clearChain();
    this._nextIsChord = true;
    this._untrigger = false;
    dist.setReadOnly(this, "isAwaitingKeyup", false);
    for (const [key] of this._timers.entries()) {
      this._clearKeyTimer(key);
    }
    for (const key of Object.values(this.keys.entries)) {
      if ((key.is.modifier === "native" || key.is.toggle === "native") && ignoreNative)
        return;
      key.set("pressed", false);
      if (isToggleRootKey(key)) {
        key.on.set("pressed", false);
        key.off.set("pressed", false);
      }
    }
  }
  _setChain(chain) {
    this._bypassChainSet = true;
    this.set("chain", chain);
    this._bypassChainSet = false;
  }
  _checkUntrigger(e) {
    var _a, _b;
    if (this._untrigger) {
      const untrigger = this._untrigger;
      this._untrigger = false;
      (_b = (_a = untrigger.command).execute) == null ? void 0 : _b.call(_a, { isKeydown: false, command: untrigger.command, shortcut: untrigger, manager: this, event: e });
    }
  }
  _checkTrigger(e) {
    var _a, _b, _c;
    this._checkUntrigger(e);
    const res = this._getTriggerableShortcut();
    if (res.isError) {
      if (res.error.code !== ERROR.RECORDING) {
        this.cb(res.error, this, e);
      }
    } else if (res.value) {
      this._untrigger = res.value;
      (_b = (_a = res.value.command).execute) == null ? void 0 : _b.call(_a, { isKeydown: true, command: res.value.command, shortcut: res.value, manager: this, event: e });
    }
    if ((_c = this.lastChord()) == null ? void 0 : _c.find((key) => isTriggerKey(key))) {
      if (this.inChain() || this.isRecording) {
        this._nextIsChord = true;
        dist.setReadOnly(this, "isAwaitingKeyup", true);
      } else if (!this.isRecording && (res.isOk && !res.value) && this.chain.length > 1) {
        const error = new KnownError(ERROR.NO_MATCHING_SHORTCUT, "A chord containing a non-modifier key was pressed while in a chord chain, but no shortcut found to trigger.", { chain: this.chain });
        this.cb(error, this, e);
      }
    }
  }
  _getTriggerableShortcut() {
    if (this.isRecording)
      return dist.Err(new KnownError(ERROR.RECORDING, "", void 0));
    const shortcuts = this.shortcuts.query((shortcut) => shortcut.triggerableBy(this.chain, this.context));
    if (shortcuts.length === 0)
      return dist.Ok(false);
    if (shortcuts.length > 1) {
      return dist.Err(new KnownError(ERROR.MULTIPLE_MATCHING_SHORTCUTS, dist.crop`Multiple commands are assigned to the key combination ${this.stringifier.stringify(this.chain)}:
			${dist.indent(shortcuts.map((shortcut) => shortcut.command.name).join("\n"), 4)}
			`, { shortcuts }));
    } else {
      return dist.Ok(shortcuts[0]);
    }
  }
  _addToChain(keys4, e) {
    var _a;
    if (keys4.length === 0)
      return;
    if (this.isAwaitingKeyup)
      return;
    if (this._nextIsChord) {
      this._setChain([...this.chain, []]);
      this._nextIsChord = false;
    }
    const length = this.chain.length - 1;
    const lastChord = (_a = this.chain[length]) != null ? _a : [];
    for (const key of keys4) {
      if (!lastChord.includes(key) && !this.isAwaitingKeyup) {
        lastChord.push(key);
        this._setChain([...this.chain.slice(0, length), this.sorter.sort(lastChord)]);
        this._checkTrigger(e);
      }
    }
  }
  _removeFromChain(keys4, e) {
    var _a;
    if (keys4.length === 0)
      return;
    if (this.isAwaitingKeyup) {
      this._checkUntrigger(e);
      if (this.pressedNonModifierKeys().length === 0) {
        dist.setReadOnly(this, "isAwaitingKeyup", false);
      }
    } else {
      if (this._nextIsChord)
        return;
      const lastChord = (_a = this.lastChord()) != null ? _a : [];
      for (const key of keys4) {
        const i = lastChord.indexOf(key);
        if (i > -1) {
          lastChord.splice(i, 1);
          this._setChain([...this.chain.slice(0, this.chain.length - 1), ...lastChord.length > 0 ? [lastChord] : []]);
        }
      }
      this._checkTrigger(e);
    }
  }
  _setEmulatedToggleState(key, value) {
    key.on.set("pressed", value);
    key.off.set("pressed", !value);
  }
  _setKeyTimer(key) {
    this._timers.set(key, setTimeout(() => {
      key.set("pressed", false);
      this._removeFromChain([key], void 0);
    }, this.autoReleaseDelay));
  }
  _clearKeyTimer(key) {
    const timer = this._timers.get(key);
    clearTimeout(timer);
    this._timers.delete(key);
  }
  _setKeyState(keys4, state) {
    for (const key of keys4) {
      if (key.pressed === state) {
        this._clearKeyTimer(key);
        this._setKeyTimer(key);
        continue;
      }
      key.set("pressed", state);
      this._clearKeyTimer(key);
      if (state) {
        if (key.is.toggle === "emulated") {
          if (key.on.pressed && key.off.pressed) {
            throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key });
          }
          if (!key.on.pressed && !key.off.pressed) {
            this._setEmulatedToggleState(key, true);
          } else if (key.on.pressed) {
            this._setEmulatedToggleState(key, false);
          } else if (key.off.pressed) {
            this._setEmulatedToggleState(key, true);
          }
        }
        this._setKeyTimer(key);
      }
    }
  }
  _getModifierState(key, e) {
    var _a;
    for (const code of [key.id, ...(_a = key.variants) != null ? _a : []]) {
      if (e.getModifierState(code))
        return true;
    }
    return false;
  }
  _checkSpecialKeys(e, keys4) {
    for (const key of this._nativeToggleKeys) {
      if (key.on.pressed && key.off.pressed) {
        throw new KnownError(ERROR.INCORRECT_TOGGLE_STATE, `Key ${key.stringifier.stringify(key)} is a toggle key whose on and off versions are both pressed, which is not a valid state.`, { key });
      }
      if (this._getModifierState(key, e)) {
        if (!key.on.pressed) {
          key.on.set("pressed", true);
          key.off.set("pressed", false);
        }
      } else {
        if (key.on.pressed) {
          key.on.set("pressed", false);
          key.off.set("pressed", true);
        }
      }
    }
    const added = [];
    const removed = [];
    for (const key of this._nativeModifierKeys) {
      if (this._getModifierState(key, e)) {
        if (!key.pressed) {
          key.set("pressed", true);
          this._clearKeyTimer(key);
          this._setKeyTimer(key);
          added.push(key);
        }
      } else {
        if (key.pressed) {
          key.set("pressed", false);
          this._clearKeyTimer(key);
          this._setKeyTimer(key);
          removed.push(key);
        }
      }
    }
    if (added.length > 0) {
      this._addToChain(added, e);
      const indexes = keys4.map((key) => added.indexOf(key)).filter((i) => i > -1);
      dist.multisplice(keys4, indexes);
    }
    if (removed.length > 0) {
      this._removeFromChain(removed, e);
      const indexes = keys4.map((key) => added.indexOf(key)).filter((i) => i > -1);
      dist.multisplice(keys4, indexes);
    }
  }
  _unknownKey(e) {
    this.cb(new KnownError(ERROR.UNKNOWN_KEY_EVENT, `An unknown key (code: ${e.code} key:${e.key}) was pressed.`, { e }), this);
  }
  _keydown(e) {
    var _a;
    const keys4 = this.keys.query((key) => {
      var _a2;
      return key.id === e.code || ((_a2 = key.variants) == null ? void 0 : _a2.includes(e.code));
    });
    (_a = this.eventListener) == null ? void 0 : _a.call(this, { event: e, keys: keys4, isKeydown: true });
    if (keys4.length === 0) {
      this._unknownKey(e);
      return;
    }
    this._setKeyState(keys4, true);
    this._checkSpecialKeys(e, keys4);
    this._checkLabel(e, "key", keys4);
    this._addToChain(keys4, e);
  }
  _keyup(e) {
    var _a;
    const keys4 = this.keys.query((key) => {
      var _a2;
      return key.id === e.code || ((_a2 = key.variants) == null ? void 0 : _a2.includes(e.code));
    });
    (_a = this.eventListener) == null ? void 0 : _a.call(this, { event: e, keys: keys4, isKeydown: false });
    if (keys4.length === 0) {
      this._unknownKey(e);
      return;
    }
    this._setKeyState(keys4, false);
    this._checkSpecialKeys(e, keys4);
    this._checkLabel(e, "key", keys4);
    this._removeFromChain(keys4, e);
  }
  _wheel(e) {
    var _a;
    const dir = e.deltaY < 0 ? "Up" : "Down";
    const code = `Wheel${dir}`;
    const keys4 = this.keys.query((key) => {
      var _a2;
      return (key.id === code || ((_a2 = key.variants) == null ? void 0 : _a2.includes(code))) && !key.pressed;
    });
    (_a = this.eventListener) == null ? void 0 : _a.call(this, { event: e, keys: keys4, isKeydown: true });
    this._setKeyState(keys4, true);
    this._checkSpecialKeys(e, keys4);
    this._checkLabel(e, "deltaY", keys4);
    this._addToChain(keys4, e);
    this._setKeyState(keys4, false);
    this._removeFromChain(keys4, e);
  }
  _mousedown(e) {
    var _a;
    const button = e.button.toString();
    const keys4 = this.keys.query((key) => {
      var _a2;
      return (key.id === button || ((_a2 = key.variants) == null ? void 0 : _a2.includes(button))) && !key.pressed;
    });
    (_a = this.eventListener) == null ? void 0 : _a.call(this, { event: e, keys: keys4, isKeydown: true });
    this._setKeyState(keys4, true);
    this._checkSpecialKeys(e, keys4);
    this._checkLabel(e, "button", keys4);
    this._addToChain(keys4, e);
  }
  _mouseup(e) {
    var _a;
    const button = e.button.toString();
    const keys4 = this.keys.query((key) => {
      var _a2;
      return (key.id === button || ((_a2 = key.variants) == null ? void 0 : _a2.includes(button))) && key.pressed;
    });
    (_a = this.eventListener) == null ? void 0 : _a.call(this, { event: e, keys: keys4, isKeydown: false });
    this._setKeyState(keys4, false);
    this._checkSpecialKeys(e, keys4);
    this._checkLabel(e, "button", keys4);
    this._removeFromChain(keys4, e);
  }
  _keysAddHook(_self, _entries, entry) {
    if (entry.is.toggle === "native" && isToggleRootKey(entry) && !this._nativeToggleKeys.includes(entry)) {
      this._nativeToggleKeys.push(entry);
    }
    if (entry.is.modifier === "native" && !this._nativeModifierKeys.includes(entry)) {
      this._nativeModifierKeys.push(entry);
    }
    if ([true, "both", "navigator"].includes(this.labelStrategy)) {
      this._labelPromise.then(() => {
        if (this.keyboardMap)
          this._keyboardMapLabel(this.keyboardMap, entry);
      });
    }
  }
  _keysRemoveHook(_self, _entries, entry) {
    const i = this._nativeToggleKeys.indexOf(entry);
    if (i > -1) {
      this._nativeToggleKeys.splice(i);
    }
    const i2 = this._nativeModifierKeys.indexOf(entry);
    if (i2 > -1) {
      this._nativeToggleKeys.splice(i);
    }
    this._selfKeyboardMap.delete(entry);
  }
  _keysAllowsRemoveHook(_self, _entries, entry) {
    const found = this.shortcuts.query((shortcut) => shortcut.containsKey(entry));
    if (found.length > 0) {
      return dist.Err(new KnownError(ERROR.KEY_IN_USE, dist.crop`
				Cannot remove key ${entry.id}, it is in used by the following shortcuts:

				${dist.indent(found.map((shortcut) => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }));
    }
    return dist.Ok(true);
  }
  _commandsAllowsRemoveHook(_self, _entries, entry) {
    const found = this.shortcuts.query((shortcut) => shortcut.command === entry);
    if (found.length > 0) {
      return dist.Err(new KnownError(ERROR.COMMAND_IN_USE, dist.crop`
				Cannot remove command ${entry.name}, it is in used by the following shortcuts:

				${dist.indent(found.map((shortcut) => this.stringifier.stringify(shortcut.chain)).join("\n"), 4)}
				`, { entries: found }));
    }
    return dist.Ok(true);
  }
  _shortcutAddHook(_self, _entries, shortcut) {
    shortcut.addHook("allows", this._boundShortcutAllowsHook);
  }
  _shortcutRemoveHook(_self, _entries, shortcut) {
    shortcut.removeHook("allows", this._boundShortcutAllowsHook);
    if (this._nextIsChord && !this.inChain()) {
      this._nextIsChord = false;
      this.clearChain();
    }
  }
  _shortcutAllowsHook(prop, value, _old, self2) {
    if (prop === "chain") {
      return checkShortcutKeys({ chain: value, command: self2.command }, this.keys, this.stringifier, self2);
    }
    if (prop === "command") {
      return checkShortcutCommands({ chain: self2.chain, command: value }, this.commands, this.stringifier, self2);
    }
    return dist.Ok(true);
  }
  _set(key, value) {
    switch (key) {
      case "chain": {
        const isEmpty2 = value.length === 0;
        if (!this._bypassChainSet) {
          if (this.pressedNonModifierKeys().length > 0) {
            dist.setReadOnly(this, "isAwaitingKeyup", true);
          }
          this._checkUntrigger();
        }
        dist.setReadOnly(this, "chain", Manager.cloneChain(value));
        if (!this._bypassChainSet) {
          if (!isEmpty2) {
            this._nextIsChord = this.inChain();
            this._checkTrigger();
            this._checkUntrigger();
          } else {
            this._nextIsChord = true;
          }
        }
        break;
      }
      case "labelStrategy": {
        const deleteNav = value === false || value === "pressed";
        dist.setReadOnly(this, "labelStrategy", value);
        if (deleteNav) {
          this.keyboardMap = void 0;
          this._selfKeyboardMap = /* @__PURE__ */ new Map();
        }
        this._labelPromise = this._labelStrategyStatus();
        break;
      }
      case "replace":
        dist.castType(value);
        if (value.shortcuts) {
          if (this.shortcuts) {
            this.shortcuts.removeHook("add", this._boundShortcutAddHook);
            this.shortcuts.removeHook("remove", this._boundShortcutRemoveHook);
            for (const entry of this.shortcuts.entries)
              entry.removeHook("allows", this._boundShortcutAllowsHook);
          }
          dist.setReadOnly(this, "shortcuts", value.shortcuts);
          this.shortcuts.stringifier = this.stringifier;
          this.shortcuts.stringifier = this.stringifier;
          this.shortcuts.sorter = this.sorter;
          this.shortcuts.addHook("add", this._boundShortcutAddHook);
          this.shortcuts.addHook("remove", this._boundShortcutRemoveHook);
          for (const entry of this.shortcuts.entries)
            entry.addHook("allows", this._boundShortcutAllowsHook);
        }
        if (value.keys) {
          if (this.keys) {
            this.keys.removeHook("add", this._boundKeysAddHook);
            this.keys.removeHook("remove", this._boundKeysRemoveHook);
            this.keys.removeHook("allowsRemove", this._boundKeysAllowsRemoveHook);
          }
          dist.setReadOnly(this, "keys", value.keys);
          this.keys.stringifier = this.stringifier;
          this._nativeToggleKeys = this.keys.query((k) => k.is.toggle === "native" && isToggleRootKey(k), true);
          this._nativeModifierKeys = this.keys.query((k) => k.is.modifier === "native", true);
          this.keys.addHook("add", this._boundKeysAddHook);
          this.keys.addHook("remove", this._boundKeysRemoveHook);
          this.keys.addHook("allowsRemove", this._boundKeysAllowsRemoveHook);
          for (const key2 of this._selfKeyboardMap.keys()) {
            if (this.keys.entries[key2.id] !== key2) {
              this._selfKeyboardMap.delete(key2);
            }
          }
        }
        if (value.commands) {
          if (this.commands) {
            this.commands.removeHook("allowsRemove", this._boundCommandsAllowsRemoveHook);
          }
          dist.setReadOnly(this, "commands", value.commands);
          this.commands.addHook("allowsRemove", this._boundCommandsAllowsRemoveHook);
        }
        break;
      default:
        this[key] = value;
        break;
    }
  }
  _allows(key, value) {
    var _a, _b, _c;
    switch (key) {
      case "chain":
        dist.castType(value);
        if (value.length === 1 && value[0].length === 0)
          return dist.Ok(true);
        return isValidChain(this, value, this.stringifier, this.sorter);
      case "replace":
        dist.castType(value);
        return checkManagerShortcuts((_a = value.shortcuts) != null ? _a : this.shortcuts, (_b = value.keys) != null ? _b : this.keys, (_c = value.commands) != null ? _c : this.commands, this.stringifier);
      case "shortcuts":
        return checkManagerShortcuts(value, this.keys, this.commands, this.stringifier);
      case "keys":
        return checkManagerShortcuts(this.shortcuts, value, void 0, this.stringifier);
      case "commands":
        return checkManagerShortcuts(this.shortcuts, void 0, value, this.stringifier);
      default:
        return dist.Ok(true);
    }
  }
  export() {
    return {
      shortcuts: this.shortcuts.export(),
      commands: this.commands.export(),
      keys: this.keys.export()
    };
  }
  import(input, parseCondition = (condition) => new Condition(condition), {
    fallbackToManagerKeys = false,
    fallbackToManagerCommands = false
  } = {}) {
    var _a, _b;
    const generated = { keys: {}, commands: {}, shortcuts: [] };
    if (input.keys) {
      for (const _key of Object.values(input.keys)) {
        const key = this.keys.create({ id: _key.id, opts: __spreadValues({}, _key) });
        generated.keys[key.id] = key;
      }
    }
    if (input.commands) {
      for (const _command of Object.values(input.commands)) {
        const rawEntry = __spreadProps(__spreadValues({}, _command), { opts: __spreadProps(__spreadValues({}, _command), { condition: void 0 }) });
        if (_command.condition) {
          rawEntry.opts.condition = parseCondition(_command.condition);
        }
        const command = this.commands.create(rawEntry);
        generated.commands[command.name] = command;
      }
    }
    if (input.shortcuts) {
      for (const _shortcut of input.shortcuts) {
        for (const chord of _shortcut.chain) {
          for (const id2 of chord) {
            const key = (_a = generated.keys[id2]) != null ? _a : fallbackToManagerKeys ? this.keys.get(id2) : void 0;
            if (key === void 0) {
              return dist.Result.Err(new KnownError(ERROR.IMPORT_SHORTCUT_KEY, `Unknown key ${id2} for shortcut ${dist.pretty(_shortcut.chain, { oneline: true })}`, { id: id2, shortcut: _shortcut }));
            }
          }
        }
        const rawEntry = {
          chain: mapKeys(_shortcut.chain, (id2) => this.keys.get(id2)),
          opts: __spreadProps(__spreadValues({}, _shortcut), {
            command: void 0,
            condition: void 0
          })
        };
        if (_shortcut.command) {
          const found = (_b = generated.commands[_shortcut.command]) != null ? _b : fallbackToManagerCommands ? this.commands.get(_shortcut.command) : void 0;
          if (!found) {
            dist.Result.Err(new KnownError(ERROR.IMPORT_SHORTCUT_COMMAND, `Unknown command ${_shortcut.command} for shortcut ${dist.pretty(_shortcut.chain, { oneline: true })}`, { command: _shortcut.command, shortcut: _shortcut }));
          } else {
            rawEntry.opts.command = found;
          }
        }
        if (_shortcut.condition) {
          rawEntry.opts.condition = parseCondition(_shortcut.condition);
        }
        const shortcut = this.shortcuts.create(rawEntry);
        generated.shortcuts.push(shortcut);
      }
    }
    return dist.Ok({
      keys: Object.values(generated.keys),
      commands: Object.values(generated.commands),
      shortcuts: generated.shortcuts
    });
  }
}
function chainContainsKey(chain, key) {
  return chain.flat().find((existing) => existing === key) !== void 0;
}
class Shortcut extends HookableBase {
  constructor(chain, opts = {}) {
    super();
    this.chain = [];
    this.stringifier = defaultStringifier;
    this.sorter = defaultSorter;
    this.condition = new Condition("");
    this.enabled = true;
    this.forceUnequal = false;
    if (opts.stringifier)
      this.stringifier = opts.stringifier;
    if (opts.enabled)
      this.enabled = opts.enabled;
    if (opts.sorter)
      this.sorter = opts.sorter;
    if (opts.command)
      this.command = opts.command;
    if (opts.condition)
      this.condition = opts.condition;
    this.safeSet("chain", chain).unwrap();
  }
  equals(shortcut) {
    var _a, _b;
    if (this.forceUnequal)
      return false;
    return this === shortcut || this.equalsKeys(shortcut.chain) && this.condition.equals(shortcut.condition) && (((_a = this.command) == null ? void 0 : _a.equals(shortcut.command)) || ((_b = shortcut.command) == null ? void 0 : _b.equals(this.command)) || this.command === shortcut.command);
  }
  equalsKeys(keys4, length) {
    return equalsKeys(this.chain, keys4, length);
  }
  containsKey(key) {
    return chainContainsKey(this.chain, key);
  }
  get opts() {
    return { command: this.command, sorter: this.sorter, enabled: this.enabled, condition: this.condition, stringifier: this.stringifier };
  }
  _set(key, value) {
    switch (key) {
      case "chain":
        dist.setReadOnly(this, "chain", value.map((chord) => this.sorter.sort([...chord])));
        break;
      default: {
        this[key] = value;
      }
    }
  }
  _allows(key, value) {
    switch (key) {
      case "chain":
        return this._hookAllowsKeys(value);
      default:
        return dist.Ok(true);
    }
  }
  _hookAllowsKeys(value) {
    return isValidChain(this, value, this.stringifier, this.sorter);
  }
  triggerableBy(chain, context) {
    return this.enabled && this.command !== void 0 && this.equalsKeys(chain) && this.condition.eval(context) && (this.command === void 0 || this.command.condition.eval(context));
  }
  static create(entry) {
    return createInstance(Shortcut, "chain", entry);
  }
  export() {
    var _a;
    return {
      chain: mapKeys(this.chain),
      command: (_a = this.command) == null ? void 0 : _a.export().name,
      condition: this.condition.export(),
      enabled: this.enabled
    };
  }
}
class Shortcuts extends HookableCollection {
  constructor(shortcuts, opts = {}) {
    super();
    this._basePrototype = Shortcut;
    this.stringifier = defaultStringifier;
    this.sorter = defaultSorter;
    if (opts.stringifier)
      this.stringifier = opts.stringifier;
    if (opts.sorter)
      this.sorter = opts.sorter;
    this.entries = [];
    this._boundAllowsHook = this._allowsHook.bind(this);
    for (const rawEntry of shortcuts) {
      const properEntry = this.create(rawEntry);
      if (this.allows("add", properEntry).unwrap())
        this.add(properEntry);
    }
  }
  _add(rawEntry) {
    const entry = this.create(rawEntry);
    entry.addHook("allows", this._boundAllowsHook);
    const entries2 = this.entries;
    entries2.push(entry);
  }
  _allowsHook(key, value, _old, instance) {
    const proxy = Proxy.revocable(instance, {
      get(target, prop, receiver) {
        if (prop === key) {
          return value;
        }
        return Reflect.get(target, prop, receiver);
      }
    });
    const existing = this.query((entry) => entry.equals(proxy.proxy) && entry !== instance, false);
    proxy.revoke();
    if (existing !== void 0) {
      return dist.Err(new KnownError(ERROR.DUPLICATE_SHORTCUT, dist.crop`There is already an existing instance in this collection that would conflict when changing the "${key}" prop of this instance to ${value}.
			Existing:
			${dist.indent(dist.pretty(existing), 4)}

			Instance:
			${dist.indent(dist.pretty(instance), 4)}

			Change:
			${dist.indent(dist.pretty({ key, value }), 4)}

			`, { existing, self: instance }));
    }
    return dist.Ok(true);
  }
  _remove(shortcut) {
    shortcut.removeHook("allows", this._boundAllowsHook);
    const i = this.entries.indexOf(shortcut);
    if (i > -1) {
      this.entries.splice(i, 1);
    }
  }
  query(filter, all = true) {
    return all ? this.entries.filter(filter) : this.entries.find(filter);
  }
  swapChords(chordsA, chordsB, { check: check2 = true } = {}, filter) {
    var _a, _b;
    const res = this._assertCorrectSwapParameters(chordsA, chordsB);
    if (res.isError) {
      return res;
    }
    if (check2) {
      const res2 = this.canSwapChords(chordsA, chordsB, filter);
      if (res2.isError) {
        return res2;
      }
    }
    let shortcutsA = (_a = this.query((shortcut) => shortcut.equalsKeys(chordsA, chordsA.length))) != null ? _a : [];
    let shortcutsB = (_b = this.query((shortcut) => shortcut.equalsKeys(chordsB, chordsB.length))) != null ? _b : [];
    if (filter) {
      shortcutsA = shortcutsA.filter(filter);
      shortcutsB = shortcutsB.filter(filter);
    }
    this._setForceUnequal(shortcutsA, true);
    for (const shortcutB of shortcutsB) {
      shortcutB.set("chain", [...chordsA, ...shortcutB.chain.slice(chordsA.length, shortcutB.chain.length)]);
    }
    this._setForceUnequal(shortcutsA, false);
    this._setForceUnequal(shortcutsB, true);
    for (const shortcutA of shortcutsA) {
      shortcutA.set("chain", [...chordsB, ...shortcutA.chain.slice(chordsB.length, shortcutA.chain.length)]);
    }
    this._setForceUnequal(shortcutsB, false);
    return dist.Ok(true);
  }
  _assertCorrectSwapParameters(chordsA, chordsB) {
    const canA = this._assertChordsNotEmpty(chordsA);
    if (canA.isError) {
      return canA;
    }
    const canB = this._assertChordsNotEmpty(chordsB);
    if (canB.isError) {
      return canB;
    }
    if (equalsKeys(chordsA, chordsB, chordsB.length) || equalsKeys(chordsB, chordsA, chordsA.length)) {
      return dist.Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, dist.crop`
			The chords to swap cannot share starting chords.
			Chords:
			${dist.indent(dist.pretty(chordsA.map((keys4) => keys4.map((key) => this.stringifier.stringify(key))), { oneline: true }), 4)}
			${dist.indent(dist.pretty(chordsB.map((keys4) => keys4.map((key) => this.stringifier.stringify(key))), { oneline: true }), 4)}
			`, { chordsA, chordsB }));
    }
    return dist.Ok(true);
  }
  _assertChordsNotEmpty(chord) {
    let found;
    if (chord.length === 0 || chord.find((keys4) => keys4.length === 0)) {
      found = chord;
    }
    if (found) {
      return dist.Err(new KnownError(ERROR.INVALID_SWAP_CHORDS, `Cannot swap with empty chord, but ${dist.pretty(chord.map((keys4) => keys4.map((key) => this.stringifier.stringify(key))), { oneline: true })} contains an empty chord.`, { chord }));
    }
    return dist.Ok(true);
  }
  _setForceUnequal(shortcuts, value) {
    for (const shortcut of shortcuts) {
      shortcut.forceUnequal = value;
    }
  }
  canSwapChords(chainA, chainB, filter) {
    var _a, _b;
    const e = this._assertCorrectSwapParameters(chainA, chainB);
    if (e.isError) {
      return e;
    }
    let shortcutsA = (_a = this.query((shortcut) => shortcut.equalsKeys(chainA, chainA.length))) != null ? _a : [];
    let shortcutsB = (_b = this.query((shortcut) => shortcut.equalsKeys(chainB, chainB.length))) != null ? _b : [];
    if (filter) {
      shortcutsA = shortcutsA.filter(filter);
      shortcutsB = shortcutsB.filter(filter);
    }
    let can = dist.Ok(true);
    for (const shortcutA of shortcutsA) {
      shortcutA.forceUnequal = true;
    }
    for (const shortcutB of shortcutsB) {
      const res = shortcutB.allows("chain", [...chainA.filter((chord) => chord.length > 0), ...shortcutB.chain.slice(chainA.length, shortcutB.chain.length)]);
      if (res.isError) {
        can = res;
        break;
      }
    }
    for (const shortcutA of shortcutsA) {
      shortcutA.forceUnequal = false;
    }
    if (can.isOk) {
      for (const shortcutB of shortcutsB) {
        shortcutB.forceUnequal = true;
      }
      for (const shortcutA of shortcutsA) {
        const res = shortcutA.allows("chain", [...chainB.filter((chord) => chord.length > 0), ...shortcutA.chain.slice(chainB.length, shortcutA.chain.length)]);
        if (res.isError) {
          can = res;
          break;
        }
      }
      for (const shortcutB of shortcutsB) {
        shortcutB.forceUnequal = false;
      }
    }
    return can;
  }
  export() {
    return this.entries.map((shortcut) => shortcut.export());
  }
  create(rawEntry) {
    var _a, _b, _c, _d;
    if (rawEntry instanceof Shortcut) {
      rawEntry.sorter = this.sorter;
      rawEntry.stringifier = this.stringifier;
      return rawEntry;
    }
    return this._basePrototype.create(__spreadProps(__spreadValues({}, rawEntry), {
      opts: __spreadProps(__spreadValues({}, rawEntry.opts), {
        sorter: (_b = this.sorter) != null ? _b : (_a = rawEntry.opts) == null ? void 0 : _a.sorter,
        stringifier: (_d = this.stringifier) != null ? _d : (_c = rawEntry.opts) == null ? void 0 : _c.stringifier
      })
    }));
  }
  safeRemoveAll() {
    var _a;
    const res = (_a = this.entries.map((shortcut) => this.allows("remove", shortcut)).find((res2) => res2.isError)) != null ? _a : dist.Ok(true);
    if (res.isError)
      return res;
    else {
      for (const shortcut of this.entries) {
        this.remove(shortcut);
      }
    }
    return dist.Ok(true);
  }
}
const start = 0;
const mediaKey = { height: 0.5, width: 4 / 3 };
function createLayout(type = "ansi", {
  numpad = true,
  mediaKeys = true,
  fn = true,
  navigation = true,
  arrowKeys = true
} = {}) {
  return [
    ...calculateAndSetPositionAndWidth([
      { id: "Escape", opts: { label: "Esc" } },
      ...fn ? [
        { id: "F1", opts: { x: 2 } },
        { id: "F2" },
        { id: "F3" },
        { id: "F4" },
        { id: "F5", opts: { x: 6.5 } },
        { id: "F6" },
        { id: "F7" },
        { id: "F8" },
        { id: "F9", opts: { x: 11 } },
        { id: "F10" },
        { id: "F11" },
        { id: "F12" }
      ] : []
    ]).map((key) => {
      key.opts.y = start + 0;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      { id: "Backquote", opts: { label: "`" } },
      { id: "Digit1", opts: { label: "1" } },
      { id: "Digit2", opts: { label: "2" } },
      { id: "Digit3", opts: { label: "3" } },
      { id: "Digit4", opts: { label: "4" } },
      { id: "Digit5", opts: { label: "5" } },
      { id: "Digit6", opts: { label: "6" } },
      { id: "Digit7", opts: { label: "7" } },
      { id: "Digit8", opts: { label: "8" } },
      { id: "Digit9", opts: { label: "9" } },
      { id: "Digit0", opts: { label: "0" } },
      { id: "Minus", opts: { label: "-" } },
      { id: "Equal", opts: { label: "=" } },
      { id: "Backspace", opts: { width: 2 } }
    ]).map((key) => {
      key.opts.y = start + 2;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      { id: "Tab", opts: { width: 1.5 } },
      { id: "KeyQ", opts: { label: "q" } },
      { id: "KeyW", opts: { label: "w" } },
      { id: "KeyE", opts: { label: "e" } },
      { id: "KeyR", opts: { label: "r" } },
      { id: "KeyT", opts: { label: "t" } },
      { id: "KeyY", opts: { label: "y" } },
      { id: "KeyU", opts: { label: "u" } },
      { id: "KeyI", opts: { label: "i" } },
      { id: "KeyO", opts: { label: "o" } },
      { id: "KeyP", opts: { label: "p" } },
      { id: "BracketLeft", opts: { label: "[" } },
      { id: "BracketRight", opts: { label: "]" } },
      type === "ansi" ? { id: "Backslash", opts: { label: "\\", width: 1.5 } } : type === "iso" ? { id: "Enter", opts: { width: 1.5, height: 2, classes: ["iso-enter"] } } : {}
    ]).map((key) => {
      key.opts.y = start + 3;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      { id: "CapsLock", opts: { width: 1.75, is: { toggle: true } } },
      { id: "KeyA", opts: { label: "a" } },
      { id: "KeyS", opts: { label: "s" } },
      { id: "KeyD", opts: { label: "d" } },
      { id: "KeyF", opts: { label: "f" } },
      { id: "KeyG", opts: { label: "g" } },
      { id: "KeyH", opts: { label: "h" } },
      { id: "KeyJ", opts: { label: "j" } },
      { id: "KeyK", opts: { label: "k" } },
      { id: "KeyL", opts: { label: "l" } },
      { id: "Semicolon", opts: { label: ";" } },
      { id: "Quote", opts: { label: "'" } },
      type === "ansi" ? { id: "Enter", opts: { width: 2.25 } } : type === "iso" ? { id: "Backslash", opts: { label: "#", width: 1 } } : {}
    ]).map((key) => {
      key.opts.y = start + 4;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      ...type === "ansi" ? [
        { id: "VirtualShiftLeft", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.25 } }
      ] : type === "iso" ? [
        { id: "VirtualShiftLeft", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 1.25 } },
        { id: "IntlBackslash", opts: { label: "\\", width: 1 } }
      ] : [],
      { id: "KeyZ", opts: { label: "z" } },
      { id: "KeyX", opts: { label: "x" } },
      { id: "KeyC", opts: { label: "c" } },
      { id: "KeyV", opts: { label: "v" } },
      { id: "KeyB", opts: { label: "b" } },
      { id: "KeyN", opts: { label: "n" } },
      { id: "KeyM", opts: { label: "m" } },
      { id: "Comma", opts: { label: "," } },
      { id: "Period", opts: { label: "." } },
      { id: "Slash", opts: { label: "/" } },
      { id: "VirtualShiftRight", opts: { is: { modifier: true }, label: "Shift", variants: ["ShiftLeft", "ShiftRight", "Shift"], width: 2.75 } }
    ]).map((key) => {
      key.opts.y = start + 5;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      { id: "VirtualControlLeft", opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } },
      { id: "VirtualMetaLeft", opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
      { id: "VirtualAltLeft", opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
      { id: "Space", opts: { label: "", width: 6.25 } },
      { id: "VirtualAltRight", opts: { is: { modifier: true }, label: "Alt", variants: ["AltLeft", "AltRight", "Alt"], width: 1.25 } },
      { id: "VirtualMetaRight", opts: { is: { modifier: true }, label: "Meta", variants: ["MetaLeft", "MetaRight", "Meta"], width: 1.25 } },
      { id: "ContextMenu", opts: { label: "Menu", width: 1.25 } },
      { id: "VirtualControlRight", opts: { is: { modifier: true }, label: "Ctrl", variants: ["ControlLeft", "ControlRight", "Control"], width: 1.25 } }
    ]).map((key) => {
      key.opts.y = start + 6;
      return key;
    }),
    ...calculateAndSetPositionAndWidth([
      { id: "PrintScreen", opts: { label: "PrtScn", x: 15.5 } },
      { id: "ScrollLock", opts: { label: "Scroll\nLock", is: { toggle: true } } },
      { id: "Pause", opts: { label: "Pause\nBreak" } }
    ]).map((key) => {
      key.opts.y = start;
      return key;
    }),
    ...navigation ? [
      ...calculateAndSetPositionAndWidth([
        { id: "Insert", opts: { x: 15.5 } },
        { id: "Home" },
        { id: "PageUp", opts: { label: "Pg\nUp" } }
      ]).map((key) => {
        key.opts.y = start + 2;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "Delete", opts: { x: 15.5 } },
        { id: "End" },
        { id: "PageDown", opts: { label: "Pg\nDown" } }
      ]).map((key) => {
        key.opts.y = start + 3;
        return key;
      }),
      { id: "ArrowUp", opts: { label: "\u25B2", x: 16.5, y: start + 5, classes: ["center-label"] } }
    ] : [],
    ...arrowKeys ? [
      ...calculateAndSetPositionAndWidth([
        { id: "ArrowLeft", opts: { label: "\u25C4", x: 15.5, classes: ["center-label"] } },
        { id: "ArrowDown", opts: { label: "\u25BC", classes: ["center-label"] } },
        { id: "ArrowRight", opts: { label: "\u25BA", classes: ["center-label"] } }
      ]).map((key) => {
        key.opts.y = start + 6;
        return key;
      })
    ] : [],
    ...mediaKeys ? [
      ...calculateAndSetPositionAndWidth([
        { id: "AudioVolumeMute", opts: __spreadProps(__spreadValues({ label: "\u{1F507}", x: 19 }, mediaKey), { classes: ["center-label"] }) },
        { id: "AudioVolumeDown", opts: __spreadProps(__spreadValues({ label: "\u{1F509}" }, mediaKey), { classes: ["center-label"] }) },
        { id: "AudioVolumeUp", opts: __spreadProps(__spreadValues({ label: "\u{1F50A}" }, mediaKey), { classes: ["center-label"] }) }
      ]).map((key) => {
        key.opts.y = start;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "MediaTrackPrevious", opts: __spreadProps(__spreadValues({ label: "\u23EE\uFE0F", x: 19 }, mediaKey), { classes: ["center-label"] }) },
        { id: "MediaTrackPause", opts: __spreadProps(__spreadValues({ label: "\u23EF\uFE0F" }, mediaKey), { classes: ["center-label"] }) },
        { id: "MediaTrackNext", opts: __spreadProps(__spreadValues({ label: "\u23ED\uFE0F" }, mediaKey), { classes: ["center-label"] }) }
      ]).map((key) => {
        key.opts.y = start + 0.5;
        return key;
      })
    ] : [],
    ...numpad ? [
      ...calculateAndSetPositionAndWidth([
        { id: "NumLock", opts: { label: "Num\nLock", x: 19, is: { toggle: true } } },
        { id: "NumpadDivide", opts: { label: "/" } },
        { id: "NumpadMultiply", opts: { label: "*" } },
        { id: "NumpadSubtract", opts: { label: "-" } }
      ]).map((key) => {
        key.opts.y = start + 2;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "Numpad7", opts: { label: "7", x: 19 } },
        { id: "Numpad8", opts: { label: "8" } },
        { id: "Numpad9", opts: { label: "9" } },
        { id: "NumpadAdd", opts: { label: "+", height: 2 } }
      ]).map((key) => {
        key.opts.y = start + 3;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "Numpad4", opts: { label: "4", x: 19 } },
        { id: "Numpad5", opts: { label: "5" } },
        { id: "Numpad6", opts: { label: "6" } }
      ]).map((key) => {
        key.opts.y = start + 4;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "Numpad1", opts: { label: "1", x: 19 } },
        { id: "Numpad2", opts: { label: "2" } },
        { id: "Numpad3", opts: { label: "3" } },
        { id: "NumpadEnter", opts: { label: "+", height: 2 } }
      ]).map((key) => {
        key.opts.y = start + 5;
        return key;
      }),
      ...calculateAndSetPositionAndWidth([
        { id: "Numpad0", opts: { label: "0", x: 19, width: 2 } },
        { id: "NumpadDecimal", opts: { label: "." } }
      ]).map((key) => {
        key.opts.y = start + 6;
        return key;
      })
    ] : []
  ];
}
var Keyboard_vue_vue_type_style_index_0_scoped_true_lang = "";
const __default__ = defineComponent({
  name: "keyboard-component",
  components: {},
  setup() {
    const layout = [...createLayout("iso")].map((raw) => reactive(Key.create(raw)));
    const m = reactive({
      chain: [],
      rows: 0,
      columns: 0
    });
    const manager = new Manager(new Keys(layout), new Commands([]), new Shortcuts([]), new Context({}), void 0, {
      labelStrategy: true,
      labelFilter: (e, key) => {
        if ((e == null ? void 0 : e.key.length) === 1) {
          key.set("label", e.key.toUpperCase());
          return false;
        }
        if (["ScrollLock", "NumLock", "Pause", "PageDown", "PageUp", "PrintScreen", "ContextMenu"].includes(e.key)) {
          return false;
        }
        return true;
      }
    });
    manager.addHook("set", (prop) => {
      if (prop === "chain") {
        m.chain = manager.chain;
      }
    });
    manager.keys.addHook("set", (prop, val) => {
      if (prop === "layout") {
        utils.castType(val);
        m.rows = val.rows;
        m.columns = val.columns;
      }
    });
    manager.keys.recalculateLayout();
    const k = manager.keys.entries;
    manager.commands.add(new Command("Test"));
    manager.shortcuts.add(new Shortcut([[k.KeyA]], { command: manager.commands.entries.Test }));
    const keyboard2 = ref(null);
    const recorder = ref(null);
    const width = ref(0);
    const keyW = computed(() => width.value / m.columns);
    const ratio = computed(() => m.columns / m.rows);
    const height = computed(() => width.value / ratio.value);
    const updateSize = () => {
      utils.castType(keyboard2);
      width.value = keyboard2.value.offsetWidth;
    };
    let observer;
    const eventListener = ({ event }) => {
      if (manager.isRecording && event.target === recorder.value || event.target !== recorder.value && !manager.isRecording && (m.chain.length > 1 || manager.pressedModifierKeys().length > 0 && manager.pressedNonModifierKeys().length > 0)) {
        event.preventDefault();
      }
    };
    onMounted(() => {
      utils.castType(keyboard2);
      observer = new ResizeObserver(updateSize);
      observer.observe(keyboard2.value);
      manager.attach(document);
      manager.eventListener = eventListener;
    });
    onUnmounted(() => {
      observer.disconnect();
      manager.eventListener = void 0;
      manager.detach(document);
    });
    return { keyboard: keyboard2, l: layout, width, height, keyW };
  }
});
const __injectCSSVars__ = () => {
  useCssVars((_ctx) => ({
    "5bca4cae": _ctx.keyW
  }));
};
const __setup__ = __default__.setup;
__default__.setup = __setup__ ? (props, ctx) => {
  __injectCSSVars__();
  return __setup__(props, ctx);
} : __injectCSSVars__;
const _sfc_main$1 = __default__;
const _hoisted_1$1 = { class: "keyboard-width" };
const _hoisted_2 = ["title"];
const _hoisted_3 = { class: "label" };
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: "keyboard",
    style: normalizeStyle(`height:${_ctx.height}px; width:100%;`),
    ref: "keyboard"
  }, [
    createBaseVNode("div", _hoisted_1$1, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.l, (key) => {
        return openBlock(), createElementBlock("div", {
          key,
          class: normalizeClass(["key-container", ...key.classes, key.pressed ? "pressed" : ""]),
          style: normalizeStyle(`
				width:${key.width * _ctx.keyW}px;
				height:${key.height * _ctx.keyW}px;
				top:${key.y * _ctx.keyW}px;
				left:${key.x * _ctx.keyW}px;
			`)
        }, [
          createBaseVNode("div", {
            class: "key",
            title: key.id
          }, [
            createBaseVNode("div", _hoisted_3, toDisplayString(key.label), 1)
          ], 8, _hoisted_2)
        ], 6);
      }), 128))
    ])
  ], 4);
}
var keyboard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-007abe5c"]]);
var App_vue_vue_type_style_index_0_lang = "";
const _sfc_main = defineComponent({
  name: "app",
  components: {
    keyboard,
    contexts
  },
  setup() {
    return {
      contexts: ["context"]
    };
  }
});
const _hoisted_1 = { id: "root" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_contexts = resolveComponent("contexts");
  const _component_keyboard = resolveComponent("keyboard");
  return openBlock(), createElementBlock("div", _hoisted_1, [
    createVNode(_component_contexts, {
      contexts: _ctx.contexts,
      onAddContext: _cache[0] || (_cache[0] = ($event) => _ctx.contexts.push($event))
    }, null, 8, ["contexts"]),
    createVNode(_component_keyboard)
  ]);
}
var App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
createApp(App).mount("#app");
