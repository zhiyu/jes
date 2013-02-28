var path = require('path')

var jes = module.exports = {}

jes.compile = function (tpl, options, file) {
    var splits = tpl.match(/<%[-*|=*]*|%>/g);
    if(splits == null){
        return tpl;
    }

    var lines  = [];
    lines.push("var s = [];with(options){");
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
            if(line.indexOf('include') != -1){
                jes.renderFile(path.dirname(file)+"/"+line.trim().slice(8)+".ejs", options, function(err, data){
                    if(err){
                        lines.push("s.push("+JSON.stringify(err.toString())+");");
                    }else{
                        lines.push("s.push("+JSON.stringify(data)+");");   
                    }
                });
            }else{
                lines.push(line);
            }
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
    lines.push("return s.join('');}"); 
    var str = new Function('options, escape', lines.join(''))(options, jes.escape);  
    return str;
}

jes.renderFile = function(file, options, cb){
    var fs = require('fs');
    try{
        var s = fs.readFileSync(file, 'utf8');
        cb(null, jes.compile(s, options, file));
    }catch(e){
        cb(e);
    }
}

jes.escape = function(str){
    return str.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
