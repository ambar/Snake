/*
* 辅助类:向量操作
*/
;(function (host, undefined) {

function Vector(ary) {
	if (!(this instanceof Vector)) {
		return new Vector(ary);
	}
	this.el = ary || [0, 0];

	var vec = this;
	['x', 'y', 'z'].forEach(function (key, i) {
		Object.defineProperty(vec, key, {
			get: function () {
				return this.get(i)
			}
		})
	})
};

Vector.prototype = {
	get: function (i) {
		return this.el[i];
	},
	set: function (ary) {
		this.el = ary;
		return this;
	},
	add: function (vec) {
		var el = vec.el;
		return Vector(this.el.map(function (e, i) {
			return e + el[i];
		}));
	},
	map: function (fn) {
		return new Vector(this.el.map(fn))
	},
	mul: function (k) {
		return this.map(function (e) {
			return e * k;
		})
	},
	eq: function (vec) {
		var el = vec.el;
		return this.el.every(function (e, i) {
			return e === el[i];
		})
	},
	inspect: function () {
		return 'Vector[' + this.el.join(',') + ']'
	}
}

Vector.up = Vector([0, -1]);
Vector.down = Vector([0, 1]);
Vector.left = Vector([-1, 0]);
Vector.right = Vector([1, 0]);
Vector.zero = Vector([0, 0]);

// exports
(host.wo || (host.wo = {})).Vector = Vector;

})(this);