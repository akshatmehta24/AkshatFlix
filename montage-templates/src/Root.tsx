import { Composition } from "remotion";
import { FPS } from "./shared";
import { T1_DURATION, Template1 } from "./t1/Template1";
import { T2_DURATION, Template2 } from "./t2/Template2";
import { T3_DURATION, Template3 } from "./t3/Template3";
import { T4_DURATION, Template4 } from "./t4/Template4";
import { T5_DURATION, Template5 } from "./t5/Template5";

const common = { fps: FPS, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Template1" component={Template1} durationInFrames={T1_DURATION} {...common} />
      <Composition id="Template2" component={Template2} durationInFrames={T2_DURATION} {...common} />
      <Composition id="Template3" component={Template3} durationInFrames={T3_DURATION} {...common} />
      <Composition id="Template4" component={Template4} durationInFrames={T4_DURATION} {...common} />
      <Composition id="Template5" component={Template5} durationInFrames={T5_DURATION} {...common} />
    </>
  );
};
