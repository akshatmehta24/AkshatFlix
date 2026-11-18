import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './theme';
import {Test} from './Test';
import {LogoA} from './LogoA';
import {LogoB} from './LogoB';
import {Harcode, H} from './Harcode';
import {Reel, Sheet, REEL_LEN} from './Reel';
loadFonts();
export const Root: React.FC = () => (
  <>
    <Composition id="Test" component={Test} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="LogoA" component={LogoA} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="LogoB" component={LogoB} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="Reel" component={Reel} durationInFrames={REEL_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Harcode" component={Harcode} durationInFrames={H.len} fps={30} width={1920} height={1080} />
  </>
);
