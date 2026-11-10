// A visual speech envelope, with syllables, phrase emphasis and short natural rests.
export function speechEnvelope(time) {
 const phrase=time%7.6;
 const entrance=Math.min(1,phrase/.5),rest=phrase>5.9?Math.max(.10,1-(phrase-5.9)/.6):1;
 const syllables=.5+.5*Math.sin(time*9.2+Math.sin(time*2.3)*1.2);
 return .12+.88*entrance*rest*(.25+.75*syllables)*(.72+.28*Math.sin(time*1.7)**2);
}
