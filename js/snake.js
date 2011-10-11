/*
* 所有游戏逻辑
*/
;(function(host,undefined) {
// host = this;

var stage = wo.stage;
var input = wo.input, rand = wo.rand, V = wo.Vector, Color = wo.Color;
var pressed = input.letterFromKeyCode;

var win = host, doc = host.document, $ = wo.$query

var w,h;

// 网络单位长度，画布缩放比例
var unit = 40, scale = 1, fps = 10;
// var unit = 20, scale = 1;
var speed = unit, $score, score;
var snake = null, bean = null, grid = null, game_started, debug = false, penetrable = true;


var unit_in_px = function(pixel) {
	return Math.ceil( pixel / unit ) - 1
};
var rand_pos = function() {
	return V([rand(max_unit_x),rand(max_unit_y)])
}

var max_unit_x,max_unit_y;

var game_init = function (canvas,width,height,scale) {
	w = width||480, h = height||320;
	
	stage.fps = fps;
	stage.init(canvas,w,h,scale)

	max_unit_x = unit_in_px(w);
	max_unit_y = unit_in_px(h);
	$score = $('#snake-score')
	
	grid = new Grid();
	game_play();

	win.addEventListener('keydown',function(e) {
		// e.preventDefault();
		switch( pressed(e.keyCode) ){
			case 'r' : {
				game_restart();
				break;
			}
			case 'p' : {
				stage.running = !stage.running
				break;
			}
			case 'c' : {
				SnakeGame.background = Color.random(48);
				// SnakeGame.background = 'rgb('+rand(48)+','+rand(48)+','+rand(48)+')';
				break;
			}
			case 'd' : {
				SnakeGame.debug = !SnakeGame.debug;
				break;
			}
			case 'w' : {
				SnakeGame.penetrable = !SnakeGame.penetrable;
				break;
			}
		}
	},false);
}

var Snake = Entity.extend({
	head_color : 'sienna',
	tail_color_odd : Color.parse(0xf9f5ea),
	tail_color_even : Color.parse(0x8c524d),
	tail_len_default : 3,
	/*
	* x,y 为单位坐标
	*/
	init : function(x,y) {
		var snake = this;

		// 添加一个 head
		this.parts = [V([x,y])];
		this.direction = V.zero;

		this.tail_len_default.times(function() {
			snake.addTail()
		})

		Object.defineProperties(this,{
			x : { get : function() { return this.head.x } },
			y : { get : function() { return this.head.y } },
			head : { get : function() { return this.parts.first() } },
			tails : { get : function() { return this.parts.slice(1) } }
		})
	},
	addTail : function() {
		this.parts.push(this.parts.last().add(V.zero))
		return this;
	},
	update : function() {

		var direction;
		if( input.isKeyPressed('left') ){
			// if( this.direction.eq(V.right) ) return;
			direction = V.left;
		}
		if( input.isKeyPressed('right') ){
			direction = V.right;
		}
		if( input.isKeyPressed('up') ){
			direction = V.up;
		}
		if( input.isKeyPressed('down') ){
			direction = V.down;
		}

		var moved = this.move(direction);
		if( !moved ) return;

		// 触墙，穿透
		if( this.collideWithWall() ){
			// console.log('collideWithWall');
			if(penetrable){
				// todo : 减分?
			}else{
				this.kill();
				return;
			}
		}
		// 吃到自己尾巴
		if( this.collideWithTail() ){
			// console.log('collideWithTail');
			this.kill();
			return;
		}
		if( this.collideWithVector(bean.position) ){
			stage.remove(bean);
			this.addTail();
			Bean.spawn(Color.random());
			this.emit('score');
		}
		// this._super()
	},
	forEachPart : function(fn,tailsonly) {
		var parts = this.parts, len = parts.length, i = tailsonly ? 1 : 0;
		while(i < len){
			if( fn(parts[i],i++) === false ) break;
		}
	},
	move : function(direction) {
		if( !direction ){
			// 内部调用
			direction = this.direction;
		}
		// 禁止后退
		if( direction.eq(V.zero) || direction.mul(-1).eq(this.direction) ){
			return false;
		}

		var parts = this.parts, head = parts.first();
		parts.pop();
		parts.unshift(head.add(direction));
		
		// this.parts = [this.parts[0].add(direction)].concat( this.parts.slice(0,this.parts.length-1) );

		this.direction = direction;
		
		return true;
	},
	collideWithTail : function() {
		var collided = false, head = this.head;
		this.forEachPart(function(tail) {
			if(tail.eq(head)){
				collided = true;
				return false
			}
		},true);
		return collided;
	},
	collideWithVector : function(vec) {
		var collided = false, head = this.head;
		this.forEachPart(function(p) {
			if(vec.eq(head)){
				collided = true;
				return true;
			}
		})
		return collided;
	},
	collideWithWall : function() {
		var collided = false, reset;
		this.forEachPart(function(p) {
			// -> 上下左右
			if(p.y < 0){
				reset = [p.x,max_unit_y];
			}else if(p.y > max_unit_y){
				reset = [p.x,-1];
			}else if(p.x < 0){
				reset = [max_unit_x,p.y];
			}else if(p.x > max_unit_x){
				reset = [-1,p.y];
			}
			if(reset){
				collided = true;
				// 穿墙后重置位置
				if( penetrable ){
					p.set(reset);
				}
				return false;
			}
		});
		return collided;
	},
	kill : function() {
		this.parts.pop();
		stage.fps = fps * 2;
		
		if(!this.parts.length){
			stage.remove(this);
			stage.fps = fps;
			game_restart();
		}else{
			this.update = this.kill.bind(this);
		}
	},
	// 单位坐标
	drawPart : function(ctx,x,y,color) {
		/*ctx.lineWidth = 1;
		ctx.fillStyle = color+'';
		ctx.fillRect(x*unit,y*unit,unit,unit);*/
		var ball = {x:x,y:y,color:color,rad:unit/2}
		Bean.prototype.draw.call(ball,ctx);
	},
	drawHead : function(ctx) {
		var head = this.head;
		this.drawPart(ctx,head.x,head.y,this.head_color)
	},
	drawTail : function(ctx) {
		var self = this, head = self.head;
		this.tails.forEach(function(tail,i) {
			if( !tail.eq(head) ) // 尾巴不要画在头上 =_=
				self.drawPart(ctx,tail.x,tail.y,i & 1 ? self.tail_color_even : self.tail_color_odd )
		})
	},
	draw : function(ctx) {
		this.drawHead(ctx);
		this.drawTail(ctx);
	}
});

// background grid lines
var Grid = Entity.extend({
	init: function () {

	},
	draw: function (ctx) {
		ctx.beginPath();

		ctx.lineWidth = 1
		ctx.strokeStyle = '#eee';

		var text = function (text, x, y, color) {
			ctx.font = '10px Tahoma';
			ctx.textAlign = 'center';
			ctx.fillStyle = color || '#ccc';
			ctx.fillText(text, x, y);
		}
		var row = h / unit, col = w / unit, half = unit / 2;

		row.times(function (y) {
			var end = unit * y
			col.times(function (x) {
				var begin = unit * x
				// 横轴
				ctx.moveTo(0, end)
				ctx.lineTo(w, end)
				// 纵轴
				ctx.moveTo(begin, 0)
				ctx.lineTo(begin, h)
				// debug 标记
				text(x+','+y,begin+half,end+half)
			})
		})

		ctx.stroke()
		ctx.closePath();
	}
});

var Bean = Entity.extend({
	init : function(x,y,rad,color) {
		this._super(x,y);
		this.rad = rad || 20;
		this.color = color || Color.random();
	},
	draw : function(ctx) {
		var pi = Math.PI, r = this.rad, x = this.x, y = this.y;
		var x = (this.x+1)*unit-unit/2, y = (this.y+1)*unit-unit/2
		ctx.save();
		ctx.translate(x,y);

		var radgrad = ctx.createRadialGradient(0,0,0,0,0,r);

		var transparent = 'transparent';
		var color = this.color;

		(3).times(function(i) {
			color.a = .1+i*.07;
			radgrad.addColorStop(.65+i*.1, color);
		});

		(7).times(function(i) {
			color.a = .5+i*.05;
			radgrad.addColorStop(.93+i*.01, color);
		})
		
		ctx.beginPath();
		ctx.fillStyle = radgrad;
		ctx.arc(0,0,r,0,pi*2,1);
		ctx.fill();

		// 高亮，反光部位
		var reflect_r = r/7;
		ctx.fillStyle = 'rgba(255,255,255,.8)';
		ctx.beginPath();		
		ctx.translate(-r/2,-r/2);
		ctx.rotate(-pi/4);
		ctx.scale(1,1/2);
		ctx.arc(0,0,reflect_r,0,pi*2,1);
		ctx.fill();

		ctx.translate(-x,-y);
		ctx.restore();
	}
});
// 随便生成
Bean.spawn = function(color) {
	var half = unit / 2, pos;
	
	while( snake.collideWithVector( pos = rand_pos() ) ){ }

	bean = new Bean(pos.x,pos.y,half-2,color);
	bean.position = pos;

	stage.add(bean);
}

var game_play = function() {
	if(game_started) return;
	game_started = true;
	
	state_reset();

	snake = new Snake(rand(max_unit_x-3,3),rand(max_unit_y-3,3));
	snake.on('score',function() {
		score += 1;
		$score.text(score*10);
	})
	stage.add(snake);

	var v = V([9,5]);
	// stage.add( new Bean( v.x,v.y,unit*4 ) )
	Bean.spawn(Color.random());
	
	if(debug){
		stage.add(grid);
	}
	
}

var game_restart = function() {
	stage.reset().run();		
	game_play();	
}
var state_reset = function() {
	game_started = false;
	$score.text(score = 0);
}

var game_destroy = function() {
	stage.reset()
}

var SnakeGame = Object.create({},{
	unit	: {
		get : function() { return unit },
		set : function(value) { return unit = value }
	},
	score : {
		get : function() { return score; }
	},
	debug : {
		get : function() { return debug },
		set : function(value) {
			if(!!value !== debug){
				debug = value
				grid && stage[debug?'add':'remove'](grid);
			}
		}
	},
	penetrable : {
		get : function() { return penetrable },
		set : function(value) { return penetrable = !!value },
	},
	background : {
		get : function() { return stage.canvas.style.backgroundColor },
		set : function(value) { 
			return stage.canvas.style.backgroundColor = value;
		}
	},
	init : {
		value : game_init
	},
	play : {
		value : game_play
	},
	restart : {
		value : game_restart
	}
})

// exports
host.SnakeGame = SnakeGame;

})(this);