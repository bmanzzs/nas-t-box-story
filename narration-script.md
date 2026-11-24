# The NAS-T-BOX Story — narration script

Runtime 5:45 · 742 words · timestamps are where each line starts in the movie.

## THE FIND

**0:00**  So this whole thing started the way all my bad ideas start. YouTube.

**0:05**  Homelab tours. NAS builds. Dudes running local AI on old server cards.

**0:11**  I had four 4-terabyte drives collecting dust. So I open OfferUp. Literally the first thing I see: parting out old PC.

**0:19**  I said, I'll take all of it. He goes: two hundred sound good?

**0:24**  Bro. Deal of the century.

**0:27**  Check the specs. i9-9900K. Thirty-two gigs of RAM. One-terabyte NVMe. Three-sixty AIO. Eight-fifty gold power supply.

**0:35**  The RAM alone might cover what I paid.

**0:38**  Picked it up the next day. Buckled her in.

**0:44**  Okay, there was a catch. The case was missing literally every panel. Most of the screws were gone. The cooler was barely hanging on.

**0:53**  So: new case with real drive bays, clean cables, fresh BIOS, and every drive tested.

**1:01**  And... she's alive.

**1:06**  I named it NAS-T-BOX. NAS for storage. T for token generator. Box is a box. Yes, the pun's on purpose.


## THE BRAIN

**1:17**  Now it needed a brain. 3090s cost a gazillion dollars. A Tesla V100? Thirty-two gigs of VRAM for about eight hundred bucks. I pulled the trigger.

**1:27**  One problem. These cards have no fans. They're made for servers that sound like jet engines.

**1:34**  So I thought: what if I just print my own duct?


## THE DUCT

**1:41**  I had an Ender 3 from 2022 I'd given up on. I plugged it into the NAS.

**1:48**  Now Claude designs the part, slices it, and starts the print. I just say: bed clear.

**1:54**  We warmed up on a little case for the fan hub. Five versions. Measure, print, test, fix.

**2:01**  For the duct, rule one: don't guess. We printed test collars with the size stamped on them until one fit the card.

**2:09**  Then me, a steel ruler, and a lot of photos.

**2:13**  The first real one: a three-piece tunnel in black PETG. My phone said a hundred fifty-three hours left.

**2:20**  That was a bug. It was sixteen.

**2:23**  Halfway through, an update killed the print. Claude rebuilt the file. It finished.

**2:28**  It kinda fit. With way more duct tape than I wanted. But temps dropped right away.

**2:34**  So I marked up photos with a red pen. Too much curve. Cable bend's too sharp. Make it a straight shot.

**2:42**  Then it clicked. This is the intake. It only ever touches cool air. Why am I fighting PETG? Back to PLA.

**2:50**  After that it moved fast. V3: one piece, straight shot, snap pins instead of screws.

**2:56**  V5: I caught a wrong number.

**3:00**  V8: the dime test. Half a millimeter here, a third there.

**3:04**  V9: the fit is perfect. V10: sixteen-hour print. Go.

**3:09**  Every version got a thin test slice first. I'd circle the gaps, and the next one came back tighter.

**3:18**  And then this came off the bed. Look down the barrel. That's the heatsink.

**3:25**  Then I did something dumb. I bought a second V100. Nobody warned me how addicting these are.

**3:33**  So version eleven is a twin. Case adapter, two Arctic fans, a flow straightener, snap-in rails.

**3:39**  One funnel splits the air between both cards. No glue. No drilling.

**3:46**  Printed in black. Getting the power cable through was a fight. I used the old string trick.

**3:53**  Plus a sag bracket with a tiny screw jack.

**3:57**  While I was in there, I repasted the first card. The old paste was a dried-up dot in the middle.

**4:04**  Eight degrees cooler on the memory.

**4:07**  Same fifteen-minute stress test. Before: eighty-four degrees, stuck at one fifty-five watts.

**4:13**  After: sixty-six degrees at one eighty-five. Cooler, and seventeen percent faster.


## THE RESULT

**4:23**  So here she is.

**4:27**  Two Tesla V100s. Sixty-four gigs of VRAM. Twenty terabytes of storage. In a two-hundred-dollar OfferUp PC.

**4:35**  Eight-year-old CPU. Datacenter GPUs. Surveillance drives.

**4:40**  All in? About two grand.

**4:43**  Benchmarks. A twenty-seven-billion-parameter model: a hundred forty-three tokens a second across both cards.

**4:50**  That's faster than a lot of cloud models type. On GPUs from 2017.


## THE POINT

**4:59**  And it's not a toy. It backs up my photos the second I take them. It records my security cams, which are just old phones.

**5:09**  It backs up my PC every night. And it runs a private chatbot that can read its own temperatures.

**5:16**  One app I built shows all of it, from anywhere. Even a live 3D model of the PC.

**5:24**  What's next? A coding agent that runs fully local. Motion detection for the cams. The new printer's still in its box.

**5:32**  And maybe a third V100. I said maybe.

**5:39**  Not bad for the first thing I saw on OfferUp.
