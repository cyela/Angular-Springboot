"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var semver = require('semver');
var regex = {
  condition: /^([<=>]+)?/,
  majorVersion: /\d+/,
  minMax: /^>=([\d]+\.[\d]+\.[\d]+(?:-[\w.]+)?) <=?([\d]+\.[\d]+\.[\d]+)$/,
  version: /([\d]+\.[\d]+\.[\d]+(?:-[\w.]+)?)$/,
  whitespace: /\s+/,
  or: /\|\|/,
  x: /^x|X|\*$/
};
function createShorthand(range) {
  var match = regex.minMax.exec(range);
  if (!match) {
    return range;
  }
  var _match$slice = match.slice(1),
    _match$slice2 = _slicedToArray(_match$slice, 2),
    min = _match$slice2[0],
    max = _match$slice2[1];
  if (min === max) {
    // Exact range
    return min;
  }

  // Stable range with an inclusive max version
  if (range.includes('<=')) {
    return `${min} - ${max}`;
  }

  // Special handling for major version 0
  if (semver.major(min) === 0 && semver.major(max) === 0) {
    // ^0.0.5
    if (semver.minor(min) === 0 && semver.minor(max) === 0) {
      return `^${min}`;
    }

    // ~0.0.5
    if (semver.minor(min) === 0) {
      return `~${min}`;
    }

    // ^0.5.0
    return `^${min}`;
  }
  if (semver.major(min) !== semver.major(max)) {
    if (semver.major(min) === 0) {
      return '0';
    }
    return `^${min}`;
  }
  return `~${min}`;
}
function ensureCompatible(range) {
  var _parseRange = parseRange(range),
    prerelease = _parseRange.prerelease,
    version = _parseRange.version;
  for (var _len = arguments.length, bounds = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    bounds[_key - 1] = arguments[_key];
  }
  bounds.forEach(function (bound) {
    if (!bound) {
      return;
    }
    if (semver.satisfies(version, bound) && semver.intersects(range, bound)) {
      return;
    }
    if (prerelease) {
      if (parseRange(bound).prerelease) {
        // If both bounds are pre-release versions, either can satisfy the other
        if (semver.satisfies(parseRange(bound).version, range)) {
          return;
        }
      } else if (semver.satisfies(version, `${range} ${bound}`)) {
        // If only our version is a pre-release version, don't fail on 1.0.0-a <2.0.0
        return;
      }
    }
    throw new Error(`Range ${range} is not compatible with ${bound}`);
  });
}

/**
 * Transform every provided semver range string by creating arrays from logical-or operation members
 * and expanding all x-ranges
 * @example
 * expandRanges('1.* || 3.*', '* || 2.2.*')
 * should return [[['>=1.0.0', '<2.0.0'], ['>=3.0.0', '<4.0.0']], [['>=0.0.0'], ['>=2.2.0', '<2.3.0']]]
 */
function expandRanges() {
  for (var _len2 = arguments.length, ranges = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    ranges[_key2] = arguments[_key2];
  }
  return ranges.map(function (range) {
    var validRange = semver.validRange(range);
    return validRange.split(regex.or).map(function (part) {
      var simpleRanges = part.split(regex.whitespace).map(coerceRange);
      return distinct(simpleRanges);
    });
  });
}
function formatIntersection(_ref) {
  var _ref$lowerBound = _ref.lowerBound,
    lowerBound = _ref$lowerBound === void 0 ? '' : _ref$lowerBound,
    _ref$upperBound = _ref.upperBound,
    upperBound = _ref$upperBound === void 0 ? '' : _ref$upperBound;
  if (lowerBound === upperBound) {
    return lowerBound;
  }
  return `${lowerBound} ${upperBound}`.trim();
}
function updateBounds(_ref2, range) {
  var lowerBound = _ref2.lowerBound,
    upperBound = _ref2.upperBound;
  var _parseRange2 = parseRange(range),
    condition = _parseRange2.condition,
    prerelease = _parseRange2.prerelease;
  if (prerelease) {
    ensureCompatible(range, lowerBound, upperBound);
  }

  // Exact version number specified, must be compatible with both bounds
  if (condition === '=') {
    ensureCompatible(range, lowerBound, upperBound);
    lowerBound = '>=' + range;
    upperBound = '<=' + range;
  }

  // New lower bound must be less than existing upper bound
  if (condition.startsWith('>')) {
    ensureCompatible(range, upperBound);
    lowerBound = mergeBounds(range, lowerBound);
  }

  // And vice versa
  if (condition.startsWith('<')) {
    ensureCompatible(range, lowerBound);
    upperBound = mergeBounds(range, upperBound);
  }
  return {
    lowerBound,
    upperBound
  };
}
function intersect() {
  var rangeUnions = expandRanges.apply(void 0, arguments);
  var resultUnion = rangeUnions.reduce(function (boundsUnion, rangeUnion) {
    var error;
    var intermediateBounds = allPairs(boundsUnion, rangeUnion).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        bound = _ref4[0],
        ranges = _ref4[1];
      try {
        return ranges.reduce(updateBounds, bound);
      } catch (e) {
        var _error;
        (_error = error) !== null && _error !== void 0 ? _error : error = e;
        return null;
      }
    }).filter(Boolean);
    if (!intermediateBounds.length) {
      throw error;
    }
    return intermediateBounds;
  }, [{}]);
  return resultUnion.map(function (bound) {
    var range = formatIntersection(bound);
    return createShorthand(range);
  }).join(' || ');
}
function mergeBounds(range, bound) {
  if (!bound) {
    return range;
  }
  var _parseRange3 = parseRange(range),
    condition = _parseRange3.condition,
    version = _parseRange3.version;
  var boundingVersion = parseRange(bound).version;
  var comparator = condition.startsWith('<') ? semver.lt : semver.gt;
  var strict = condition === '<' || condition === '>';
  if (comparator(version, boundingVersion)) {
    return range;
  } else if (strict && semver.eq(version, boundingVersion)) {
    return range;
  } else {
    return bound;
  }
}
function coerceRange(range) {
  return regex.x.exec(range) ? '>=0.0.0' : range;
}
function parseRange(range) {
  var condition = regex.condition.exec(range)[1] || '=';
  var version = regex.version.exec(range)[1];
  var prerelease = semver.prerelease(version);
  return {
    condition,
    prerelease,
    version
  };
}
function distinct(a) {
  return _toConsumableArray(new Set(a));
}
function allPairs(arr1, arr2) {
  return arr1.reduce(function (acc, cur) {
    arr2.forEach(function (y) {
      return acc.push([cur, y]);
    });
    return acc;
  }, []);
}
module.exports.default = intersect;
module.exports.createShorthand = createShorthand;
module.exports.ensureCompatible = ensureCompatible;
module.exports.expandRanges = expandRanges;
module.exports.formatIntersection = formatIntersection;
module.exports.intersect = intersect;
module.exports.mergeBounds = mergeBounds;
module.exports.parseRange = parseRange;
module.exports.distinct = distinct;