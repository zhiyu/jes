var jes = module.exports = {}

jes.compile = function (tpl, options) {
    var lines  = [];
    
    var splits = tpl.match(/<%[-*|=*]*|%>/g);
    lines.push("var s = [];");
    lines.push("function escape(str){return str.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');}");
    
    for(var i in options){
    	if(typeof options[i] == 'function'){
            lines.push("var " + i + "=" + options[i] + ";");
    	}else{
    		lines.push("var " + i + "=" + JSON.stringify(options[i]) + ";");
    	}
    }
    
    for(var i = 0; i < splits.length; i++){
    	var line = '';
    	var split     = splits[i];

    	var splitNext = null;
    	if(i < splits.length - 1){
    		splitNext = splits[i+1]
    	}

    	var idx = tpl.indexOf(split);
        var idxNext = idx;
        if(splitNext != null){
            idxNext = tpl.indexOf(splitNext);
        } 
        
		line = JSON.stringify(tpl.slice(0, idx));
		lines.push("s.push("+line+");");
        
        if(split == "<%"){
            line = tpl.slice(idx + split.length, idxNext);
            lines.push(line);
        }else if(split == "<%-"){
            line = tpl.slice(idx + split.length, idxNext);
            lines.push("s.push(("+line+"));");
        }else if(split == "<%="){
            line = tpl.slice(idx + split.length, idxNext);
            lines.push("s.push(escape(("+line+")));");
        }

        i++;
        tpl = tpl.slice(idxNext+splitNext.length, tpl.length);
    }

	line = JSON.stringify(tpl);
    lines.push("s.push("+line+");");
    lines.push("return s.join('');");
    var str = new Function(lines.join(''))();    
    return str;
}

jes.render = function(file, options){
	var fs = require('fs');
    var s = fs.readFileSync(file, 'utf8');
    if(s){
    	return this.compile(s, options);
    }else{
    	return null;
    }
}

