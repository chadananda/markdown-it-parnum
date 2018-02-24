
module.exports = function headerSections(md) {
  
  var _generatedUIDs = {};
  function generateUIDWithCollisionChecking() {
    while (true) {
      var uid = ("0000" + ((Math.random() * Math.pow(36, 4)) | 0).toString(36)).slice(-4);
      if (!_generatedUIDs.hasOwnProperty(uid)) {
        _generatedUIDs[uid] = true;
        return uid;
      }
    }
  }
  
  function addTokenID(token, prefix='') {   
    if (!token.attrs) token.attrs = []
    var token_has_id = false
    token.attrs.forEach(att => {if (att[0]==='id') token_has_id = true })
    if (!token_has_id) token.attrs.push( ['id', prefix+generateUIDWithCollisionChecking()] )  
  }

  function setTokenPnum(token, num) { 
    if (!token.attrs) token.attrs = []
    attrs.forEach( (item,i) => { if (item==='pnum') delete(token.attrs[i]) }) 
    token.attrs.push( ['pnum', num] )
  }

  function parnum(state) {
    var tokens = [] // output
    const excludes = ['noid','sig','signature','ed','editor','sit','sitalcent','ref',
      'reference','note','illustration']
    //var Token = state.Token
    //var sections = []
    //var nestedLevel = 0
    
    // function openSection(attrs) {
    //   var t = new Token('section_open', 'section', 1);
    //   t.block = true;
    //   t.attrs = attrs && attrs.map(function (attr) { return [attr[0], attr[1]] });  // copy
    //   return t;
    // }

    // function closeSection() {
    //   var t = new Token('section_close', 'section', -1);
    //   t.block = true;
    //   return t;
    // }

    // function closeSections(section) {
    //   while (last(sections) && section.header <= last(sections).header) {
    //     sections.pop();
    //     tokens.push(closeSection());
    //   }
    // }

    // function closeSectionsToCurrentNesting(nesting) {
    //   while (last(sections) && nesting < last(sections).nesting) {
    //     sections.pop();
    //     tokens.push(closeSection());
    //   }
    // }

    // function closeAllSections() {
    //   while (sections.pop()) {
    //     tokens.push(closeSection());
    //   }
    // }


    // Logic:
    // Every document is presumed to be numbered sequentially
    //  * A prefix pattern of numbering results when a pnum="pre" is provided
    //  * Subsequent section headers (h2 or .section) restarts minor numbering
    //  * If a section header contains a pnum prefix, it will be used 
    //  * If a section header does not contain a prefix, the last section number used will be incremented
    //  * Numbering is paused with pnum="-", resumed with pnum="+"
    //  * Numbering is skipped for paragraphs of types not considered content
    //     .sig.signature.sit.sitalcent.ed.editor.date.noid
    //     
    //   * Senario 1: 7v4v
    //     Each book is a "Section" with parts 1 & 2, with numbering x.x
    //   * Senario 2: HW
    //     Each part is a section with numbering a & p
    //   * Senario 3: GPB
    //     Each chapter is a section with most numbered 
    var pnum = {
      section_num: 0,
      prefix:      '', // 'x', '#', '-', or  
      paused:      false,
      parnum:      1      
    } 

    
    for (var i = 0, l = state.tokens.length; i < l; i++) { 
      var token = state.tokens[i];

      // record level of nesting
      // if (token.type.search('heading') !== 0) {
      //   nestedLevel += token.nesting;
      // }
      // if (last(sections) && nestedLevel < last(sections).nesting) {
      //   closeSectionsToCurrentNesting(nestedLevel);
      // }
      
      var attrs = token.attrs 
      var classes = []
      if (attrs) attrs.forEach( att => {if (att[0]==='class') classes=att[1].trim().split(' ')})    

      // check headers to see of they are sections
      if (token.type == 'heading_open') {
        // check if section header

        // section number increment 
        if (classes.includes('section') || token.tag==='h2') {
          var prefix = ''
          if (attrs) attrs.forEach( att => { if (att[0]==='pnum') prefix=att[1].trim() }) 
          //console.log('Section prefix:', prefix, attrs)         
          pnum.parnum = 1 // reset paragraph numbering regardless 
          if (prefix==='-') pnum.paused = true
          else if (prefix === '+') pnum.paused = false
          else if (prefix) {
            pnum.paused = false
            pnum.prefix = prefix
            if (Number.isInteger(prefix)) pnum.section_num = parseInt(prefix)
          } else if (!prefix && !pnum.paused) {
            pnum.section_num++
            pnum.prefix = pnum.section_num
          } 
          //state.tokens[i+1].content = state.tokens[i+1].content.replace(/\{\{secnum\}\}/g, prefix)
          //console.log('Section detected:', token, pnum, prefix, state.tokens[i+1])
        } 
        // if (['title','subtitle','author','copyright','copy','toc', 'notoc'].filter(ex => classes.includes(ex)).length) {
        //   i++; continue;
        // }   
        // var section = {
        //   header: headingLevel(token.tag),
        //   nesting: nestedLevel
        // };
        // if (last(sections) && section.header <= last(sections).header) {
        //   closeSections(section);
        // }
        // tokens.push(openSection(token.attrs));
        // if (token.attrIndex('id') !== -1) {
        //   // remove ID from token
        //   token.attrs.splice(token.attrIndex('id'), 1);
        // }
        // sections.push(section);
      }
      
      else if (token.type=='paragraph_open') {
        addTokenID(token, 'p')                
        if (!token.hidden && !pnum.paused && !intersects(classes, excludes) 
          && (state.tokens[i+1].content.trim().length>5)) {
          // remove token attr 'pnum'  
          if (attrs) attrs.forEach( (item,i) => { if (item==='pnum') delete(token.attrs[i]) })

          // calculate a new pnum
          var num = pnum.prefix ? pnum.prefix +'.'+ pnum.parnum : pnum.parnum
          if (pnum.prefix && pnum.parnum===1) num = pnum.prefix 
          setTokenPnum(token, num)
          pnum.parnum++   
        }   
        //if (state.tokens[i+1].content.trim().length<10) console.log('Empty Paragraph detected:', token, state.tokens[i+1].content) 
      } 

      //tokens.push(token);
    }  // end for every token
    // closeAllSections();

    //state.tokens = tokens;
  }

  md.core.ruler.push('paragraph_numbers', parnum);

};

// checks if one array intersects with another array
function intersects(items, list) { 
  var newlist = items.filter(item => list.includes(item))
  // if (newlist.length>0) console.log('Intersects:', newlist)
  return newlist.length>0
}



// function headingLevel(header) {
//   return parseInt(header.charAt(1));
// }

// function last(arr) {
//   return arr.slice(-1)[0];
// }
