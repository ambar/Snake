/*
* @by ambar
* @version 1.0
*/

var fs = require('fs');
var uglify = require('uglify-js');

var open = fs.readFileSync;

var config = JSON.parse( open('config.json') );
var comment = config.comment && open(config.comment).toString().replace(/%date%/g,new Date().toJSON());

var uglify_option = config.uglify_option || {};
var at_end = config.semicolon_at_end ? ';' : '';
var inputs = config.input;
var cr = '\n';

if( !inputs || !inputs.length ){
	console.log('no input files!');
	return;
}
// 转化
var results = inputs
	.map(function(f) {
		var code = open(f).toString();
		var output = cr+'// '+f+cr+ uglify( code, uglify_option );
		console.log('uglify... <<< ',f,'\t',output.length+'/',code.length,'\t=',output.length/code.length);
		return output;
	})
	.reduce(function(a,b) {
		return a +at_end+ b;
	},comment);

// 写入
console.log('writing file >>>',config.output,results.length,'bytes');
fs.writeFile(config.output,results,function(err) {
	if (err) throw err;
	console.log('all done!');
})