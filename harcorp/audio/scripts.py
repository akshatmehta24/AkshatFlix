"""Narration scripts for the three narrated films. Each scene = one idea, one visual.
speaker: N = narrator, D = developer."""

DEMO = [
    ('title', [('N', 'This is HARCODE. A coding assistant you talk to.')], 3.8),
    ('voice', [('N', 'Just say what you need.'), ('D', 'Add rate limiting to the login route. Five attempts a minute.')], 0),
    ('files', [('N', 'HARCODE finds every file the change will touch.')], 0),
    ('read', [('N', 'It reads your codebase, and plans the change.')], 0),
    ('editor', [('N', 'Then it writes the code, and you review every edit.'), ('D', 'Looks good. Run the tests.')], 0),
    ('tests', [('N', 'It runs your tests, and shows you when they pass.')], 0),
    ('end', [('N', 'HARCODE. Talk to your terminal.')], 4.6),
]

REEL = [
    ('intro', [('N', 'Six interface components for HARCODE.')], 2.8),
    ('c1', [('N', 'One. The voice waveform, showing HARCODE listening as you speak.')], 0),
    ('c2', [('N', 'Two. The core, moving from idle, to listening, to thinking.')], 0),
    ('c3', [('N', 'Three. Voice to code. What you say becomes code in the terminal.')], 0),
    ('c4', [('N', 'Four. The codebase map. It lights up every file a change will touch.')], 0),
    ('c5', [('N', 'Five. The task pipeline, tracking every step from plan to tests.')], 0),
    ('c6', [('N', 'Six. Alerts. Red when a test fails. Resolved when HARCODE fixes it.')], 0),
    ('outro', [('N', 'The HARCODE interface kit, by Harcorp.')], 3.0),
]

CONCEPT = [
    ('cursor', [('N', 'For fifty years, we have talked to computers one keystroke at a time.')], 0),
    ('count', [('N', 'Millions of keystrokes. Every developer. Every year.')], 0),
    ('race', [('N', 'But the idea in your head always moves faster than your hands.')], 0),
    ('listen', [('N', 'So we asked a simple question. What if the terminal could listen?')], 0),
    ('meet', [('N', 'Meet HARCODE, from Harcorp Industries.')], 4.2),
    ('speak', [('N', 'Speak in plain words.'), ('D', 'Make the retry delay exponential, and cap it at thirty seconds.'), ('N', 'HARCODE turns it into working code, right where you are.')], 0),
    ('city', [('N', 'It sees your codebase like a city. Every file, every dependency, every path a change will take.')], 0),
    ('ship', [('N', 'It writes the change, runs your tests, and shows you exactly what it did.')], 0),
    ('alert', [('N', 'And when something breaks, it tells you. Then it fixes it.')], 0),
    ('less', [('N', 'Less typing. More building.')], 3.4),
    ('end', [('N', 'HARCODE. Talk to your terminal.')], 5.0),
]

FILMS = {'demo': DEMO, 'reel': REEL, 'concept': CONCEPT}
