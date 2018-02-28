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
    token.attrs.forEach( (item,i) => { if (item==='pnum') delete(token.attrs[i]) }) 
    token.attrs.push( ['pnum', num] )
  }
  
  // checks if one array intersects with another array
  function intersects(items, list) { 
    var newlist = items.filter(item => list.includes(item)) 
    return newlist.length>0
  }

  function parnum(state) {
    var tokens = [] // output
    const excludes = ['noid','sig','signature','ed','editor','sit','sitalcent','ref',
      'reference','note','illustration'] 
      
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
      var token = state.tokens[i]      
      var attrs = token.attrs 
      var classes = []
      if (attrs) attrs.forEach( att => {if (att[0]==='class') classes=att[1].trim().split(' ')})    

      // check headers to see of they are sections
      if (token.type == 'heading_open') {   
        if (classes.includes('section') || token.tag==='h2') {
          var prefix = ''
          if (attrs) attrs.forEach( att => { if (att[0]==='pnum') prefix=att[1].trim() }) 
          //console.log('Section prefix:', prefix, attrs)         
          pnum.parnum = 1 // reset paragraph numbering regardless 
          if (prefix==='-') pnum.paused = true
            else if (prefix==='+') {
              pnum.paused = false
              prefix = ''
            }
            
          // if not paused, assign a paragraph number  
          if (!pnum.paused) {
            // for all non-numeric prefixes
            if (prefix.length && !Number.isInteger(prefix)) {
              console.log('assigned, non-numeric paragraph prefix: '+ prefix)
              pnum.prefix = prefix  
            } 
            
            // no prefix or numeric prefix
            else { 
              console.log('Numeric or auto prefix: ', prefix, pnum.section_num)
              if (Number.isInteger(prefix)) {
                pnum.section_num = parseInt(prefix)
                console.log('Captured a paragraph number. Pnum="'+prefix+'"')
              } else pnum.section_num++
              pnum.prefix = pnum.section_num
            }  
          }
        }  
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
      }  
    }  // end for every token 
  }

  md.core.ruler.push('paragraph_numbers', parnum);
};


