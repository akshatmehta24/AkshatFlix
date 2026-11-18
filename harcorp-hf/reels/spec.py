"""Three vertical reels. Each shot: (kind, vo_lines[(spk,text)], min_dur, params)."""

R1 = {
    'name': 'r1_stop_typing',
    'title': 'STOP TYPING CODE',
    'stage_top': 230,
    'shots': [
        ('slam', [('N', 'Stop typing code.')], 1.5, {'words': ['STOP', 'TYPING', 'CODE.'], 'accent': 2, 'keys': True}),
        ('slam', [('N', 'Seriously.')], 0.9, {'words': ['SERIOUSLY.'], 'accent': -1, 'small': True}),
        ('wave', [('N', 'Just say it.'), ('D', 'Add rate limiting to the login route.')], 0, {'tag': 'LISTENING'}),
        ('net', [('N', 'HARCODE reads your whole codebase,')], 1.6, {}),
        ('diff', [('N', 'writes the change,')], 1.3, {}),
        ('tests', [('N', 'and runs your tests.')], 1.4, {}),
        ('slam', [('N', 'Done.')], 1.2, {'words': ['DONE.'], 'accent': 0, 'sub': 'ZERO KEYSTROKES'}),
        ('logo', [('N', 'HARCODE. Talk to your terminal.')], 3.0, {}),
    ],
}

R2 = {
    'name': 'r2_it_listens',
    'title': 'YOUR TERMINAL CAN HEAR YOU',
    'stage_top': 230,
    'shots': [
        ('boot', [('N', 'Your terminal can hear you now.')], 2.0, {}),
        ('mark', [('N', 'Meet HARCODE.')], 1.5, {}),
        ('wave', [('D', 'Make the retry delay exponential.')], 0, {'tag': 'VOICE INPUT'}),
        ('diff', [('N', 'It turns your words into working code.')], 0, {'retry': True}),
        ('net', [('N', 'It knows every file, and every dependency.')], 0, {}),
        ('alert', [('N', 'And when a test breaks,')], 1.2, {'state': 'fail'}),
        ('alert', [('N', 'it fixes it.')], 1.2, {'state': 'fixed'}),
        ('logo', [('N', 'HARCODE, by Harcorp Industries.')], 3.0, {}),
    ],
}

R3 = {
    'name': 'r3_no_keyboard',
    'title': 'SHIP A FEATURE. NO KEYBOARD.',
    'stage_top': 430,
    'timer': True,
    'shots': [
        ('slam', [('N', 'Watch me ship a feature. No keyboard.')], 2.2, {'words': ['SHIP A', 'FEATURE.', 'NO KEYBOARD.'], 'accent': 2, 'keys': True}),
        ('wave', [('D', 'Add rate limiting to the login route.')], 0, {'tag': 'SAY IT', 'split': (0.0, 'SAID IT')}),
        ('net', [('N', "Two seconds. It's read the whole repo.")], 0, {'split': (2.0, 'READ REPO')}),
        ('diff', [('N', 'Five. The code is written.')], 0, {'split': (5.0, 'CODE WRITTEN')}),
        ('tests', [('N', 'Eight. Every test passes.')], 0, {'split': (8.0, 'TESTS PASS')}),
        ('slam', [('N', 'Nine. Shipped.')], 1.4, {'words': ['SHIPPED.'], 'accent': 0, 'split': (9.0, 'SHIPPED'), 'stop': True}),
        ('logo', [('N', 'HARCODE. Talk to your terminal.')], 3.0, {}),
    ],
}

REELS = [R1, R2, R3]
