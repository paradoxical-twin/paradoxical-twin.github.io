---
title: 'Does My Quantum Experiment Need a Dashboard?'
date: 2026-09-18
authors:
  - admin
tags: []
draft: false
# Unlisted: rendered and reachable by direct link, but excluded from all lists,
# feeds, the sitemap, and search. Remove `build:` and `private:` to publish.
build:
  list: never
  render: always
private: true
---

"Is the experiment working right now?" 
"I think so. I have no clue."

I am a professional physicist, doing experimental quantum optics research. Most of the time, I have setups connected to a variety of lasers, detectors, controllers, computers, and god-knows-what, doing something. Asking me whether it works would be a natural question. But almost always, I simply don't know.

Why? Because a typical experiment in our lab requires the interplay of many components and setups, each of them worthy of years-long study of their own, and most of them created by or for physicists. One reason why I studied physics and not CS is that I am not a good programmer, and given the trash reputation of code written by physicists, I believe I am not alone. And most of my technical expertise is in conceptualizing, building and aligning tables full of mirrors, fibers, lenses and crystals, not in writing performant Rust code. However, troubleshooting a big experiment will require me to simultaneously answer questions like:

- Is my quantum source producing the exact states of light I want, at the correct rate?
- Is my analysis setup aligned and initialized correctly?
- Did colleagues un-plug my fibers again?
- Are the multiple systems involved in stabilizing my quantum channels (read: a bunch of air between two telescopes, plus some optical fibers) working as intended?
- Are the several different detection units, separated by kilometers, currently synchronized to picosecond-level precision? And will they still be several hours from now?
- Is my quantum light beam currently being blocked by a giant slab of concrete hanging from a crane, and/or has a pigeon found its way into my lab again?
- Am I seeing the measurement results of the photons I want to detect, instead of sunlight, leakage from lasers, thermal noise, or other random stuff?
- Has a Windows update restarted a critical system, sitting in a faraway location, at exactly the wrong time? And did I just run out of space on my hard drive, again?

Some of these questions are actually impossible to answer at the same time, for Quantum reasons. The rest are just hard, and require me to run around, un-plug and re-plug different measurement devices, and look at individual parameters in detail. Answering several of them at the same time would require very complex and highly performant code, processing millions of events per second with a whole bunch of complications. Building an automated way to answer these would require both in-depth quantum optics knowledge and advanced programming skills, plus infinite time, since everyone else would scramble to involve these people in their own experiments. In practice, I'm often doing a lot of eyeballing and using my intuition[^1], as well as just saving all raw data and praying. 

What I would really need is a single source of truth for all individual components and setups involved. It needs to not just show raw data output, but also process the data channels into the figures of merit I am actually interested in, as well as monitor a whole bunch of known failure modes. It should be live, maybe interactive, definitely colorful and impressive to my boss.

Business people, visionary as always, have had that concept down for a while; they call it a "Dashboard".
The problem: Everybody fucking hates dashboards. And they hate the people requesting their creation even more. The situation seems to be the following:

[Note: My understanding of the world of data analysts and modern business environments is mediated entirely through Twitter shitposts and Nikhil Suresh rants, so apologies in advance if I get some minor nuances wrong.] 

In the business world, dashboards are produced through a strange and ritualistic process. An oblivious, self-important, human-skinsuit-wearing creature (the "Executive") feels momentarily unimportant, and compensates by ordering a random employee (the "Predator") to produce a single page collecting all data relevant to some real or imagined problem. The Predator then stalks around the department, asking resident nerds to "pair up" on this assignment, until he finds somebody who is not yet burnt out enough to tell him to fuck off (the "Loser"). This Loser writes a bunch of SQL queries, wires them up to some colorful plots, and serves them on an internal page. The Predator presents this to the Executive, who is momentarily satisfied, only to forget the entire exchange within minutes, but not before promoting the Predator to a higher position. The Dashboard is never opened again after the presentation, and serves no relevant business function. This process then repeats at least on a monthly basis.

Now it is our turn to request a dashboard. Fortunately, our situation is slightly less misanthropic, because both the Predator (my Claude) and the Losers (Claude's subagents) are non-human. The Predator can even spawn captive Losers at will (I have been informed that the business equivalent of this functionality is called a "Global Capability Center"), so the stalking step sees major efficiency gains. But will all dashboards created for my pleasure suffer the same useless existence and rapid death as their business brethren?

Initial results are mixed. Our first dashboards certainly seem to be useful in generating interest and funding for the creation of more dashboards; a property apparently well-known to commercial data scientists. I may or may not be currently writing funding proposals for dashboard-shaped multi-year research efforts, and just this week, a colleague won a pitch competition to further develop her dashboard-cum-digital-control-room vibecoding exploits. Over the last months, models have gotten good enough to enable other colleagues to now see the status of distributed, complex experiments on their phone, while sitting on the toilet. I want to stress that this is actually a big capability jump for us! Up until this year, we were often conducting critical, very expensive and complex experiments with no idea whether they were working in the moment, because we lacked the programming skills and time to postprocess and display our relevant outputs live. We could only answer weeks afterwards whether a campaign had any publishable success (a question sometimes answered in the negative), and it absolutely *sucks* to have spent the last year planning and building a one-off failure, which you could have rescued if only you had known what to fix during the actual experiment.

But it is too soon to tell whether we will have a significant general productivity jump from this. Most major experiments this year were still conceptualized in the pre-November 2025 world of largely useless coding agents, and though my most recent campaign had some rudimentary live monitoring at the end, we still were fighting data desynch issues in postprocessing for weeks afterwards. (By which I mean that we were failing to fix the data issues for weeks, and then Claude Fable 5 oneshotted them.) Quantum Optics experimental work requires you to spend weeks and months at the same spot in the lab, optimizing the position and angle of tiny mirrors for many hours in deep focus, and thus attracts a certain kind of optimization-brained perfectionist (Hello!). This personality type is certainly liable to spend way too much time vibecoding increasingly complex dashboards and monitoring routines, instead of actually running better or faster experiments. Right now, optimal AI usage requires at least a dash of AI psychosis, so I am wary of feeling more and more powerful in my vibecoded Hliðskjálf, while completely losing track of the real goal, which is better science. I have at least some Executive in me, meaning I, too, can feel momentarily unimportant, and my Claudes are way too indulgent of my compensation efforts to push back against my worst tendencies. They can't even quit if things get out of hand. 

Abandoning a vibecoded project is so easy that I would expect the number of dead dashboards to increase even more. But that is also kind of priced in, given that most research experiments are one-offs by design. Other subfields and research groups (e.g. using certain measurement tools as a standard component of every experiment, or running high-N studies) might have more opportunities for reusable software, but my specific environment makes it pretty hard to directly transfer code, and most of our internal pre-LLM efforts in the direction of standardized post-processing suites were complete failures[^2].

And will the dashboards even show the correct numbers? So far I have been assuming that, but since most research experiments are at least somewhat outside the training distribution by definition, this is not trivial. (I have been told that, even for common business processes, collecting and serving the correct data is not a solved issue.) In practice, I spend a lot of time explaining to Claude where my experiment is supposed to do novel things, in order to get it away from its (wrong) assumptions about what our analysis should look like. Building software suites robust to all of the possible failure modes, equipment changes, and random chance inherent in a typical campaign is going to be even harder. And seeing how lackadaisical many people are about accepting the first good-enough-looking LLM output, I am not very confident that the average experiment dashboard is going to be robust and well-designed. Ah well, skill issue.

I still think the overall concept is sound, and I expect most of my experiments during the rest of my PhD to have some kind of bespoke monitoring page. But I am curious to see which failure modes of the dashboard-industrial complex will instantiate in our labs in the coming year or two, and believe that active hands-on leadership (academia's main strength, of course) will be required to minimize wasted time and energy. Maybe I should start to track how much time has been spent this month on unproductive efforts of this kind. I could even create nice plots for it. I'll be right back.


[^1]: Calling it "Applying my Process Knowledge" feels a lot fancier of course. Thank you Dan Wang!
[^2]: It is by no means impossible, but needs even more domain expertise in several fields, and seeing the repeated failures of these efforts made me appreciate the common advice for how to build software products/startups a lot more. Taking statements like "Talk to your users" and "Build something people want" seriously would have saved several projects and protected many feathers from ruffling, even when all developers and users involved were part of the same academic lab! 