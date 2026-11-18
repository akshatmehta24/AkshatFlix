import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Lockup, LK} from './Logo';
import {loadFonts} from './theme';
loadFonts();
export const Test: React.FC = () => (
  <AbsoluteFill style={{background:'#000'}}>
    <Img src={staticFile('ref_lockup.png')} style={{position:'absolute',left:LK.x,top:LK.y,width:LK.w,opacity:0.5,filter:'sepia(1) saturate(5) hue-rotate(-50deg)'}}/>
    <svg width={1920} height={1080} style={{position:'absolute'}}><g transform={`translate(${LK.x} ${LK.y}) scale(${LK.s})`} opacity={0.6}><Lockup id="t"/></g></svg>
  </AbsoluteFill>
);
