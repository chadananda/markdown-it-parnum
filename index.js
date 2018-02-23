
module.exports = function headerSections(md) {

  function parnum(state) {
    var tokens = [] // output
    const excludes = ['noid','sig','signature','ed','editor','sit','sitalcent','ref',
      'reference','note','illustration'
    ]
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
      pattern:     'x',
      paused:      false,
      parnum:      0      
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
      
      var attrs = tokens.attrs 
      var classes = []
      if (attrs) attrs.forEach( att => {if (att[0]==='class') classes=att[1].trim().split(' ')})    

      // check headers to see of they are sections
      if (token.type == 'heading_open') {
        // check if section header
        var prefix = ''
        attrs.forEach( att => if (att[0]==='pnum') { parnum_prefix=att[1].trim() })
        // section number increment 
        if (classes.includes('section') || token.tag==='h2' || prefix) {
          pnum.parnum = 1 // reset paragraph numbering regardless
          if (prefix==='-') pnum.paused = true
          else if (prefix === '+') pnum.paused = false
          else if (prefix) {
            pnum.paused = false
            pnum.prefix = prefix
          } else if (!prefix && !pnum.paused) {
            pnum.section_num++
            pnum.prefix = pnum.section_num
          } 
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
      
      if (token.type=='paragraph_open' && !pnum.paused) {
        
      }

      tokens.push(token);
    }  // end for every token
    // closeAllSections();

    state.tokens = tokens;
  }

  md.core.ruler.push('paragraph_numbers', parnum);

};

// function headingLevel(header) {
//   return parseInt(header.charAt(1));
// }

// function last(arr) {
//   return arr.slice(-1)[0];
// }
