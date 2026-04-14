---
title: 'Quantum Phantom - the strange case of Quantum Secure Direct Communication'
date: 2025-12-20
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

# Quantum Phantom \- the strange case of Quantum Secure Direct Communication

The United Nations designated the year 2025 as the [“International Year of Quantum Science and Technology”](https://quantum2025.org/), alongside being the "International Year of Peace and Trust[^1]", "International Year of Glacier Preservation", and probably the "International Year of Shrubbery and Swamp Creatures" or whatever. As an aspiring quantum scientist myself, this of course was cool and led to a few nice events and initiatives. But anybody working in a topic somewhere on the first half of the [Gartner Cycle](https://en.wikipedia.org/wiki/Gartner_hype_cycle) can tell you, being in a hyped field has the downside of being exposed to… well, a lot of hype. And it is no secret that the last years of quantum science research have, next to amazing breakthrough results, produced a lot of nonsense, ranging from useless efforts\[TODO\], over [infuriatingly misleading PR stunts](https://www.quantamagazine.org/wormhole-experiment-called-into-question-20230323/), to [criminal fraud investigations](https://www.prnewswire.com/news-releases/shareholder-alert-pomerantz-law-firm-investigates-claims-on-behalf-of-investors-of-quantum-computing-inc---qubt-302356689.html). And in 2025, we have had Microsoft announcing maybe the second fake Majorana qubit discovery in a row, a gigantic lawsuit against Quantum Computing Inc., D-Wave[^2] doing D-Wave things, and so much more. And given that paper retractions, stock devaluations and criminal investigations usually take some time, I am sure the fallout of the year is just starting. 

But what worries me most is the long-term damage done by wasting huge amounts of resources and talent on projects that never really aimed to solve a problem to begin with. To me, the best example of this seems to be Quantum Secure Direct Communication, or QSDC for short.  
   
To understand the weird situation of QSDC, let me briefly introduce its more famous cousin, Quantum Key Distribution (QKD), in its entanglement-based version. If you are familiar with the basics, feel free to skip over the next three paragraphs.  
   
Suppose you have two communication parties, which we will call Austfonna and Brüggen, and an outside attacker, named Eyjafjallajökull[^3].   
Austfonna and Brüggen want to share messages without anyone being able to read them. In the real world, we expect any determined attacker to be able to listen to our messages while they are being transmitted, so we have to encrypt them if we want to keep their content private. Classically, you can do this by hiding your message behind a variety of computationally hard math problems, which get easier if you have part of the solution (so-called Asymmetric Cryptography, and most of your communication runs on a particular variant of it).  
   
The problem is that some of these hard math problems are not going to be hard for Quantum Computers[^4]. So we need a different approach \- and what is more poetic than fighting fire with fire? To fight Quantum with Quantum[^5], we use to our advantage the fact that quantum information cannot be copied. If Austfonna and Brüggen share an entangled state[^6], and measure it in particular ways, they can use the fact that their results always will be identical[^7] to generate a string of bits that should also be completely identical. But it will only be identical if they are really sharing full entanglement. Fortunately, and unlike the San Francisco tech scene, entanglement is monogamous, meaning that nobody else can be entangled with Austfonna if they share maximum entanglement with Brüggen, and thus nobody can do better in predicting their joint measurement results than purely guessing bits at random. However, if Eyjafjallajökull now starts trying to measure, manipulate or copy our entangled photons (in order to try to gain information on what one party might later measure), this will irrevocably change the quantum state, meaning that the two bitstrings are no longer identical, and Austfonna and Brüggen will totally and completely shut down the key generation process until they can figure out what is going on. If they are satisfied with the correlation between their measured bitstrings, they now have a secret key \- and they can know how secret it is by checking how identical their measurement results (or a subset of them) are, regardless of how sneaky Eyjafjallajökull has been. 

The only problem in this picture is that most entangled photons never make it to Brüggen, but get lost on the way - optical fibers are nice and cheap, but fundamentally lossy. And since we cannot copy or amplify our photons, there is nothing we can really do about that, except for sending tons and tons of photons, and keeping our communication distances short (typically, a few hundred of kilometers in fiber at most). With the few photons that make it through, we generate a cryptographic key that we can then use to securely encrypt a vastly larger size of actual text; a 128 bit key gives you security for tens of Gigabits in current implementations!  
   
All in all, you can imagine a Quantum Key Distribution system something like this:  

\[Plot: large pipe for classical channel, small leaky pipe for quantum channel\]  
   
So, to recap: QKD deals with the problem of forcing individual photons to go over long distances without being lost, in order to use quantum mechanics to provide "guaranteed" secrecy for cryptographic keys. Since the key generation rates are very low, we try to do as little of this transmission as possible, and bootstrap the resulting small amount of quantumly secure information to encrypt our large amount of real data, which we still send over our already established, beautifully high-capacity classical links. 
   
Now please try to imagine, with this picture in mind: What could be the absolutely very last thing you would want to do?  
   
\[picture: large pipe almost blocked off, everything forced in small leaky pipe\]  
   
Oh no. Let's try to make sense of this.  
   
QSDC was initially proposed in 2000 by two researchers from Tsinghua University, China. As the name helpfully points out, you use quantum information to directly send a quantum message, instead of generating a key that you use to encrypt a message on your classical channels. However, you **still need** the authenticated classical channel from earlier, in order to detect the presence of an eavesdropper somewhere in your channel. Basically, you don't rely on quantum randomness, but the Fact that TODO
   
Why would you want to use this over other quantum protocols? Five main reasons come to mind:  
 

1. Mathematically unconditional security (if you already have generated a perfectly secure key\!) can only be guaranteed in key-based protocols by exclusively using one-time pads, i.e. having a completely random bitstring of exactly the length of your message, and doing the XOR operation on your two bitstrings. Compared to this approach, QSDC does not really present a downside, since also one photon \= one bit. But also, nobody really wants to do that! Since generating secure key is expensive, and adversarial computing power is (realistically) limited, essentially all secret communication protocols instead use keys in vastly smaller size than the data they encrypt with it. But in their introductory paragraphs, proponents of QSDC often vaguely gesture towards the need for absolute, unconditional security (well, something the larger QKD community is also sometimes guilty of…), without really justifying why we would actually want that. And compared to creating one-time pads via QKD, QSDC is indeed the more efficient way, by a factor of TODO.  
2. Actually I lied, in QSDC one transmitted photon does not only carry one bit of information, but two\! You can achieve this effect using entangled states, and it is usually known under the name of “dense coding”. This is great because we always want our communication to have higher bandwidth, but sadly, determining the transmission rate of your quantum protocol is not as easy as taking the classical transmission rate and multiplying it by two. The technical constraints on your setup (detection equipment, source emission, multiplexing, etc.) are vastly higher in the quantum case, and remember that you lose almost all your photons in any link that goes out of your immediate neighbourhood. So in practice, a quantum communication system will have much lower bandwidth than a classical system in the same infrastructure, dense coding or not.   
3. Someone might claim that they are paranoid that someone steals their key. In QKD you have to generate and store the key (which might take a long time, especially if satellites are involved) before you actually send your message, during which somebody might steal it or have time to compute parts of it. But that seems like a pretty fake problem, given that every single device communicating with key-based cryptography (e.g. every relevant computer in the world) currently has to store keys, and there are no good reasons why that would become a major vulnerability (people that have direct access to your key storage probably have also enough access to do things like… reading your monitor).
4. You might argue that the protocol is not very useful, but that the developmental steps to improve QSDC implementations are exactly the steps that you would need anyways in order to get a functioning quantum network \- relays, very low errors in transmission and detection, and so on. If, right now, we don't have any large industry-relevant quantum network anyways, does it really matter which protocols the demos run? Might the fact that QSDC is so crappy be even a benefit, forcing scientists to work extra hard to get it to work, and improving the overall quantum communication infrastructure? I mean, I would not try to argue this point in front of a funding committee, but GPT 5.2-Thinking did propose this (quite original) thought when discussing a late draft, so here it goes.
5. Just look at it\! It is so much cooler\! Doesn’t it just feel way more futuristic to transmit *quantum* data via *quantum* information on the *quantum* channel, rather than with crusty, boring old lasers in the classical network, only enhanced by some short, vaguely quantum key? This might sound like a joke, but one the first bullet points in lists of the “benefits” of QSDC usually are some variation of this point. A lot of ink is spilled on how it is “unique”, or somehow more quantum. You can decide yourself whether this is relevant, useful, or worth caring about.

   
For me, the main problem remains that you are limiting yourself to extremely small data transmission rates compared to QKD, with no real benefit\! In “normal” QKD, you can take a given amount of data, and then use a vastly smaller amount of quantum key to encrypt it. In QSDC, the few photons that make it through the channel are the exact limit of your transmission capacity. And since you don’t know which of the original photons make it through your channel, you usually have to waste even more of them on redundantly encoding your information, further shrinking your data rate\! And I am completely ignoring some additional aspects (handshake protocols, security testing, pre-shared entanglement) that further reduce expected data rates \- believe me, it doesn’t look pretty. 

At this point, you would expect to see some killer argument that QSDC solves specific problems that QKD can not tackle. And I looked for them for a long time, but am still looking\! QSDC research papers instead include fascinating sentences like: “QSDC is eminently suitable for a wide variety of quantum cryptographic tasks, which require a direct transport of deterministic information over the quantum channel.” ([https://arxiv.org/pdf/2311.13974](https://arxiv.org/pdf/2311.13974)).   
I mean, yes. It is true that QSDC would be suited for all cryptographic tasks that really require direct, deterministic transmission over the quantum channel \- it’s just the case that, to my best knowledge, there are none\!  
   
So, what gives? I don't know for sure, but there are some hints. Quantum infrastructure is currently being built up all over the world, and we would expect the relevant protocols and technological building blocks to be reproduced and cited everywhere, maybe with some bias towards the "home country" of the discovery. And if we look at the citations by country of typical high-impact papers in the field, this is exactly what we see[^8]:

TODO images
   
Notably, China is significantly ahead in terms of absolute number of citations and publications, but there is a strong international community, mainly in Europe and the United States, actively publishing and engaging with the research, both for papers originating from China (Fig. 1) or the West (Fig. 2). This also pretty much describes the experience of myself, e.g. when looking for new papers on a given topic. The original QSDC paper has more than TODO citations (that is more than TODO, TODO or TODO). So, QSDC papers are probably also the real deal everywhere, right?  
   
TODO image
   
Oof. The scale of this discrepancy was extremely surprising to me, even after expecting the general kind of effect. Again, it is quite normal for countries to have an unusually strong focus on certain research topics, especially ones discovered “at home”, but we are talking about two orders of magnitude here, inside a fast-growing, national security-relevant and internationally distributed research field. The mismatch is even stronger once we take into account that a lot of the "international" citations are in review papers, or introductory paragraphs where people just hint at many different kinds of existing quantum protocols to make their work seem relevant to a wider field. As far as I can tell, almost nobody outside of China is actually working on this stuff.   
   
So why are Chinese researchers publishing thousands(\!) of QSDC papers, without anybody abroad seeming to care? Are the mathematical fundamentals of cryptography somehow different inside the Great Firewall? 

I don’t really know. I can only do the unsatisfying job of waving my hand in the general direction of articles discussing the extremely hierarchical nature of the Chinese academic system (TODO), the lock-in effect of certain academic and intellectual lineages (TODO), and TODO. The first author of the original QSDC paper is Long Gui-Lu (龙桂鲁), an *extremely* successful and influential academic, and one of the highest-ranking physicists in Tsinghua University, one of Chinas two leading scientific institutions. The most plausible story to me just seems to be an intellectual bubble and hierarchical pressure that funnels young researchers into this direction, when they could be working on more useful directions. I simply can not believe that so many groups and individual researchers in this one country have some amazing technical reasons for pursuing this approach, which they just never manage to write down in a convincing fashion.
   
Zooming back out, the story of QSDC is probably not unique. A lot of the work currently being done within the quantum field (mine included\!) is of uncertain relevance for the future; both the role and scale of Quantum Computing and Quantum Communication in our future information society is still pretty open. And within each field, some approaches will pan out, some will not, and that is the way any technological development goes. But research funding, scientific attention and instutional focus are limited resources in China, too. And I'm not sure they are going to the correct target here.

Will we see many quantum experiments of questionable value in the coming years? Probably. Should this be reason for concern? A bit, but not too much. Doing novel stuff, even if there are good reasons for why it will probably not replace existing state of the art, is surely part of the mission of academic research, and since Europe is currently trying hard to even catch up with China in terms of quantum communication implementation, I'm sure some waste over there does not cost our professors and bureaucrats much sleep. So you are still free to fondly remember the International Year of Quantum Science and Technology. I am, however, way more concerned since I found out that the UN ominously declared 2029 the "International Year of Asteroid Awareness and Planetary Defense" (what do they know?). Regardless of technical merit, I doubt any quantum communication protocol can help with that.


[^1]:  the celebrations, naturally, took place in the famously repressive and corrupt country of Turkmenistan

[^2]:  D-Wave is essentially the Donald Trump of Quantum Computing companies.

[^3]:  Normally, people in quantum communication call these Alice, Bob and Eve, which I admit roll a bit better off the tongue. But after all, 2025 also was the International Year of Glacier Preservation, so let's give them glacier names\!

[^4]:  specifically, the RSA algorithm can be broken via variants of Shor's algorithm for prime number factorization \- as soon as we have a [few-million-qubit](https://www.quantamagazine.org/thirty-years-later-a-speed-boost-for-quantum-factoring-20231017/) quantum computer, aaany day now

[^5]:  You could also use different math problems, for which you don’t yet have a known quantum protocol that breaks it. That would be called “Post-Quantum Cryptography” and is already happening in parallel. 

[^6]:  What is entanglement, you ask? I have of course written a marvelous explanation of entanglement that explains it perfectly to every audience regardless of previous knowledge, which the margin of this blog post sadly is too small to contain.

[^7]:  or always opposite, depends on the state and the measurement

[^8]:  The exact numbers differ by website, and how you add countries, since there are often multiple tags of the same country (especially for China), sometimes on the same paper. On the other hand, a lot of Chinese citations are likely undercounted in my analysis, since they only appear in Chinese-language journals not indexed by Web of Science. Think of these numbers as orders of magnitude, not precise values. 
