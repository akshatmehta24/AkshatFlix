import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './theme';
import {Test} from './Test';
import {LogoA} from './LogoA';
import {LogoB} from './LogoB';
import {Harcode, H} from './Harcode';
import {Harcode2, H2} from './Harcode2';
import {Reel2, REEL2_LEN} from './Reel2';
import {Demo3, TL_DEMO} from './Demo3';
import {Reel3, TL_REEL} from './Reel3';
import {Concept, TL_CONCEPT} from './Concept';
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
    <Composition id="Harcode2" component={Harcode2} durationInFrames={H2.len} fps={30} width={1920} height={1080} />
    <Composition id="Reel2" component={Reel2} durationInFrames={REEL2_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Demo3" component={Demo3} durationInFrames={TL_DEMO.total} fps={30} width={1920} height={1080} />
    <Composition id="Reel3" component={Reel3} durationInFrames={TL_REEL.total} fps={30} width={1920} height={1080} />
    <Composition id="Concept" component={Concept} durationInFrames={TL_CONCEPT.total} fps={30} width={1920} height={1080} />
  </>
);
