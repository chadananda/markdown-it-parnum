# markdown-it-parnum
A markdown-it plugin providing automatic paragraph numbering


### Logic:

* Every document is presumed to be numbered sequentially unless it contains sections
   * A section is defined by a header (h2, .section, or pnum="x")  
* Section numbering is automatic unless the header provides a prefix pattern with pnum="x"
   * For example: pnum="preface" or pnum="7" -- resulting in preface.1 or 7.1 etc
   * If the pnum is numeric, subsequent sections are automatically incremented
* A section can pause numbering with pnum="+" or resume with pnum="+"
* Subsequent sections restart minor numbering
   * If a section header contains a pnum prefix, it will be used   
   * Numbering is skipped for paragraphs of types not considered content
      * (noid, ed, editor, sit, sitalcent, sig, signature, date, note, ref, reference)
* Paragraph numering is added by inserting the the number as a "pnum" attribute of the "p" tag -- which you can parse out or display with CSS
