var Entity = Class.extend({
	init : function(x,y,width,height) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.vx = this.vy = 0;
		this.alive = true;
	},
	update : function(delta) {		
		this.x += this.vx;
		this.y += this.vy;
		this.emit('update',delta);
	},
	draw : function(ctx) {
		
	}
});
Object.extend(Entity.prototype,EventEmitter);

var Ball = Entity.extend({
	init : function(x,y,rad,color) {
		this._super(x,y);
		this.rad = rad || 20;
		this.color = color || 'lime';
	},
	draw : function(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.rad,0,Math.PI*2,1);
		ctx.fill();
	}
});

var GameText = Entity.extend({
	init : function(x,y,text,size,color) {
		isNaN(size) && (size = 12);
		this.text = text || '';
		this.font = size + 'px Tahoma';
		this.align = 'center';
		this.color = color || 'white';
		this._super(x,y,size,size);
	},
	draw : function(ctx) {
		ctx.font = this.font;
		ctx.textAlign = this.align;
		ctx.fillStyle = this.color;
		ctx.fillText(this.text,this.x,this.y);
	}
});

