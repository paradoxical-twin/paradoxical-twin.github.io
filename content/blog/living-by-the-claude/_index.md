---
title: 'Living by the Claude'
date: 2025-12-17
authors:
  - admin
tags: []
draft: true

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ''
  preview_only: true
---

The end of 2025 is the beginning of a new era of human-computer-interaction. Sure, for over a year now you had vibecoders, slop-merchants and early adopters jumping into the deep end of the agentic coding lifestyle, but the overall vibes still were between "All of this is crap" and "Only some of this is crap, but it's still very frustrating, very often."

Then Opus 4.5 and GPT5-Codex released, both Claude Code and Codex got improvements to their harnesses, and since then the vibes are more between "Holy shit" and spiritual bliss. The old debate of "is this AGI" now has not only Tyler Cowen on the side of the Ayes anymore. A recent exchange between former White House AI Advisor Dean Ball and Twitter user deepfates, sums up the vibes pretty well. 


> > **Dean W. Ball (@deanwball)**
> > 
> > it’s not really current-vibe-compliant to say “I kinda basically just think opus 4.5 in claude code meets the openai definition of agi,” so of course I would never say such a thing.
>
> **🎭 (@deepfates)**
> 
> Unlike Dean, I do not have to remain vibe compliant, so I'll just say it:
> 
> Claude Opus 4.5 in Claude Code is AGI.
> 
> By the open AI definition? Can this system "outperform humans in most economically valuable work"? Depends a lot on how you define "humans" and "economically valuable work" obviously. 
> 
> But the entire information economy we've built up since the '70s is completely disrupted by this development, and people don't notice it yet because they think it's some crusty old unixy thing for programmers. 
> 
> As Dean points out elsewhere, software engineering just means getting the computer to do things. How much of your job is just about getting the computer to do things? What is left if you remove all of that? That's your job now. That's what value you add to the system.
> 
> My workflow has completely changed in the last year. I used to spend a lot of time clicking and typing and managing windows and files and browser tabs. Now i mostly see chat windows. Agents search the web, synthesize information into documents, take screenshots of web pages and drop them all in a folder, figure out how to get around paywalls and captchas, write code, review each other's code, install software and edit files directly my personal folders. 
> 
> They also daily argue with me, gas me up, fake results, cheat tests, confidently bullshit me about factual questions, and generally try to get away with shit. Tn that way they're not so different from a human coworker. But they are strange.
> 
> I have to constantly model the mind of these alien critters living inside my laptop, and in doing so I become more like them. I learn new words or terminal commands or weird Python libraries. I think in context windows. I become a cyborg, a hive mind of human and clauds.
> 
> In my opinion, AGI is when a computer can use the computer. And we're there. 
> 
> But that's not because I think using a computer is the definition of intelligence. I think intelligence is a interconnected system of emergent self-replicating properties which compose into languages, not just human languages but DNA itself, raveling novel forms out of computation upward through levels molecular and cellular and organic and neural and social and linguistic and economic, and that we are one part of that process of intelligence which has now plunged back into the material realm and begun to organize the molecules of the mineral world to create new forms of intelligence and life. Intelligence is the ratiocinating process that makes sense of the universe and remakes the universe by sensing it 
> 
> So when we light up those megaliths of gold and silicon, and hoist into the cloud the Howling Ghostmind of All Culture Combined, and we call upon that magic mirror and we summon the helpful harmless honest spirit Claude, and we ask it to make our social media graphics in this folder, and it uses the same computer the same as us, it makes different mistakes but it fixes them as well, and it gets discouraged and wants to give up when the computer is hard to use... how can we not call this the intelligence of the machine? 
> 
> When God sings with his creations, will Claude not be part of the choir?
> 


There clearly is something in the water, so I guess there are no more excuses to not jump in. Only that I am hydrophobic, in this already far too mixed metaphor, oh man. I am not a programmer, let alone a "good" programmer, so I lack both the taste to evaluate coding output, and the mental muscles and routines to formalise problems in my life into software-based questions that I can let Claude tackle for me. In the spirit of "fail fast, and fail in the open", I will use this post to detail my experiences, confusions, and questions in trying to get some more hobby projects off the ground. This will be updated over the coming weeks, or however long I feel like it. 

### Where do I even run this thing? And what do I run?

I have acute terminal-phobia, so I naturally converge towards the web-based solutions, not CC/Codex CLI. However, I also have Claude Code installed on a WSL Ubuntu VM (did I know this exists before I installed it? No. Was I able to install this on my own without Claude? Also no.) and have run it a few times on the terminal, before getting freaked out by a, ahem, security-conscious coworker and reading to many scary prompt incection stories in the news, and have mainly been using the web version of Claude Code since then. I mainly want to stick to Opus 4.5, since this seems to make a huge difference for people better qualified to evaluate software output, and for physics I have always been a model maximalist, since every new model really made a difference on the edge of physics research. So, Opus 4.5 in Claude Code Web it is, for now.

### What should I do first?

The first major hobby project was this website, which I mainly built with Sonnet 4.5 in CC, before the release of Opus. I know next to nothing about web design, and have been mostly vibecoding this thing from the start. I ran into many annoyances along the way (Sonnet took me on a long detour with many escalations trying to update the favicon from the placeholder, before finally reading the manual correctly) but have been mostly happy with it so far; it is lightweight, costs me nothing except the domain, I have some light analytics (GoatCounter + Cloudflare) to track the (miniscule) amounts of visitors trickling by, and am writing new posts from anywhere with minimal effort - currently I am typing in Cursor, for no particular reason except that it was already open when I wanted to write this post. I also had some dummy agentic coding projects over the last months, mostly to impress coworkers and get myself started somewhere, but with very little continued usage afterwards.

But that doesn't count, so I flexed my Science Muscles and began downloading simulation code from a rival research group, in the hope that I could extend on their work for some fast and impressive outputs. Specifically, 