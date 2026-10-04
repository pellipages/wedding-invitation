#!/usr/bin/env python3
"""Targeted text edits: Rukmini & Krishna card -> Harika & Prem.
Usage (from the wedding-invitation repo root):  python3 personalize_card.py card
Only touches card/index.html and card/js/*.js. Every edit is asserted, so a miss is reported."""
import re, sys, pathlib

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "card")
miss = []

def edit(rel, pairs, regex=False):
    p = root / rel
    s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if regex:
            s, n = re.subn(old, new, s, flags=re.S)
        else:
            n = s.count(old); s = s.replace(old, new)
        if n == 0:
            miss.append(f"{rel}: {old[:60]!r}")
    p.write_text(s, encoding="utf-8")

# ---------- index.html ----------
edit("index.html", [
    ("Rukmini &amp; Krishna", "Harika &amp; Prem"),
    ("Rukmini & Krishna", "Harika & Prem"),
    ("Rukmini and Krishna", "Harika and Prem"),
    ('aria-label="R & K Seal"', 'aria-label="H & P Seal"'),
    ("R <span>&amp;</span> K", "H <span>&amp;</span> P"),
    ("రుక్మిణి &amp; కృష్ణ", "హారిక &amp; ప్రేమ్"),
    ("Rukmini<br>&amp; Krishna", "Harika<br>&amp; Prem"),
    ("Rukmini, daughter of <i>[Parents]</i><br>", "<i>Harika Jillalla</i><br>"),
    ("Krishna, son of <i>[Parents]</i>", "&amp; <i>Prem Sai Reddy Chandra</i>"),
    ("<span>14 December</span>", "<span>18 November</span>"),
    ("R &amp; K · 2026", "H &amp; P · 2026"),
])

# ---------- names inside JS (calendar titles, share title, photo captions) ----------
for f in ("journey.js", "rsvp.js", "forms.js", "data.js"):
    edit(f"js/{f}", [("Rukmini & Krishna", "Harika & Prem")])
edit("js/journey.js", [("@rukmini-krishna", "@harika-prem")])

# ---------- js/data.js : venue, events, world env keys, photo captions ----------
edit("js/data.js", [("const V='[Venue Name]';", "const V='The Oasis Ranch, Dallas';")])

EVENTS_NEW = r"""const EVENTS=[
{k:'pellikuthuru',t:'పెళ్లికూతురు',n:'Pellikuthuru',cls:'w-vindu',fc:'#4B5E3A',when:'2026-11-16T10:00:00-06:00',date:'16 November 2026',time:'Morning',venue:V,desc:'Family blessings and turmeric to begin the bride\'s wedding days.',
 side:'R',aw:'78vw',art:'haldi-art-1.png',node:'kolam-lotus-node.svg',extras:[],hero:'haldi-art-1.png'},
{k:'haldi',t:'పసుపు',n:'Haldi',cls:'w-pasupu',fc:'#C98A16',when:'2026-11-16T18:00:00-06:00',date:'16 November 2026',time:'Evening',venue:V,desc:'Turmeric, flowers and laughter to bless the bride and groom.',
 side:'L',aw:'92vw',art:'haldi-art.png',node:'kolam-lotus-node.svg',extras:[],hero:'haldi-art.png'},
{k:'sangeeth',t:'సంగీత్',n:'Sangeeth',cls:'w-eng',fc:'#B45A3C',when:'2026-11-17T18:00:00-06:00',date:'17 November 2026',time:'6:00 PM',venue:V,desc:'An evening of music, dance and joy with family and friends.',
 side:'R',aw:'96vw',art:'engagement-art.png',node:'kolam-lotus-node.svg',extras:[],hero:'engagement-art.png'},
{k:'pelli',t:'పెళ్లి',n:'The Pelli',cls:'w-pelli',fc:'#6A1E2B',sevenBefore:1,when:'2026-11-18T18:01:00-06:00',date:'18 November 2026',time:'6:01 PM',venue:V,desc:'Seven steps, one promise. Join us beneath the mandapam.',
 side:'L',aw:'112vw',art:'jeelakarra-bellam-art.png',node:'sacred-knot.png',hero:'jeelakarra-bellam-art.png',
 extras:['wedding-celestial-header.png|w:40vw;r:4vw;t:-16vw;z:1|w:26vw;t:-10vw|w:min(18vw,320px);r:6vw;t:-1vw;z:1']}
];"""
edit("js/data.js", [(r"const EVENTS=\[.*?\n\];", lambda m: EVENTS_NEW)], regex=True)
edit("js/data.js", [
    (" eng:['temple-parrot.png", " sangeeth:['temple-parrot.png"),
    (" pasupu: ['banana-leaves-corner.png", " haldi: ['banana-leaves-corner.png"),
    ("cap:'Engagement'", "cap:'Sangeeth'"),
    ("cap:'Pasupu'", "cap:'Pellikuthuru'"),
    ("cap:'Turmeric days'", "cap:'Haldi'"),
])

print("All edits applied." if not miss else "NOT FOUND (already applied, or file differs):\n  " + "\n  ".join(miss))
