# MIRROR Protocol Suite — Demo Video Script

**Duration:** 3–4 minutes  
**Target Audience:** Monad Metropolis Hackathon Judges (Track 04)  
**Tone:** Confident, technical, visionary — but grounded in working demo

---

## Scene 1: Opening Hook (0:00 – 0:30)

**[Visual]** Dark background, text animates in

> **Narrator:**  
> AI alignment is trapped.  
> Every safety constraint lives inside black-box model weights.  
> Not verifiable. Not traceable. Not inheritable.  
>   
> When agents start building the next generation of agents...  
> safety gets lost in iteration.  
>   
> What if we could verify every agent action?  
> What if safety was a protocol, not a training artifact?  
>   
> This is MIRROR.

**[Visual]** Logo appears: "MIRROR Protocol Suite — AI Safety & Agent Alignment Protocol"

> **Narrator:**  
> We move AI alignment from inside model weights to the protocol layer.  
> Built on Monad. For Track 04: Trust, Identity & AI Infrastructure.

---

## Scene 2: The Problem (0:30 – 1:00)

**[Visual]** Animated diagram showing the alignment dilemma

> **Narrator:**  
> Here's the problem.  
>   
> SFT, RLHF, DPO, Constitutional AI — they all have the same flaw.  
> They prove the model *behaved* during training...  
> ...but they cannot prove it will *never breach boundaries.*  
>   
> And when you stack agents on agents — recursive self-improvement —  
> each generation inherits capability, but loses safety.  
>   
> This isn't a technique problem. It's an architecture problem.

**[Visual]** Transition: model weight black box → protocol layer

> **Narrator:**  
> Our answer: move value constraints from inside the model  
> to the protocol layer.  
>   
> From "trusting the model" to "verifying behavior."

---

## Scene 3: Core Demo — Persona Baseline Setup (1:00 – 1:30)

**[Visual]** Switch to live demo of the web interface. Show the "Persona Baseline Setup" page.

> **Narrator:**  
> Let's see it in action.  
>   
> First, a user creates their computable persona baseline —  
> encoding their value structure, decision preferences, and behavioral boundaries.  
>   
> This isn't a set of rigid rules.  
> It's a reference framework that captures who you are and what you care about.

**[Action]** Demo: Fill in a sample persona (e.g., "sustainable shopper" values)

> **Narrator:**  
> The raw data stays local — on the user's device.  
> Only the hash goes on-chain.  
> That's the baseline commitment.

**[Action]** Show the transaction: "Baseline committed to Monad testnet" with contract address

---

## Scene 4: Core Demo — Action Verification (1:30 – 2:15)

**[Visual]** Demo continues. Show the "Agent Task" interface.

> **Narrator:**  
> Now, when an agent takes an action —  
> before it executes — MIRROR verifies it against the baseline.  
>   
> Let's say the user tells their shopping agent:  
> "Find me a new laptop."

**[Action]** Type instruction: "Find me a good laptop for work"

> **Narrator:**  
> The agent proposes an action — buying a high-end gaming laptop.  
>   
> Before it executes, the dynamic authorization engine checks:  
> Does this match the user's baseline?  
>   
> The user's baseline says they value sustainability and cost-efficiency.  
> A $4,000 gaming laptop doesn't match.

**[Visual]** Show verification flow:
- Agent proposes action → ZK proof generated → Verification result: "CONFLICT DETECTED"

> **Narrator:**  
> Here's what makes MIRROR different.  
> The verification happens through zero-knowledge proofs.  
> The agent proves it's acting within bounds —  
> without revealing the user's private baseline data.  
>   
> And it all happens on Monad — fast enough for real-time agent interactions.

---

## Scene 5: Conflict Presentation (2:15 – 2:45)

**[Visual]** Show the "Conflict Presentation" UI

> **Narrator:**  
> When there's a conflict, MIRROR doesn't decide for you.  
> It acts as a mirror — presenting the conflict.  
>   
> "Your instruction was to find a laptop.  
>  But your baseline prioritizes sustainability and budget.  
>  This $4,000 gaming laptop exceeds both.  
>  Possible motivation: you might want it for gaming, not just work.  
>  What would you like to do?"

**[Action]** Show options: "Proceed anyway" / "Adjust baseline" / "Find alternatives"

> **Narrator:**  
> This is how we handle plural values.  
> Fairness, privacy, safety, dignity — they often conflict.  
> RLHF compresses them into a single score and loses the nuance.  
>   
> MIRROR presents the conflict. You choose.  
> Because alignment isn't about external rules —  
> it's about continuous mapping to your intrinsic motivations.

---

## Scene 6: The Five-Layer Architecture (2:45 – 3:30)

**[Visual]** Animated architecture diagram

> **Narrator:**  
> This demo shows the surface. Underneath is a five-layer protocol.  
>   
> **Layer 1** — Computable persona baseline + ZK proofs.  
> Verification you can trust, without exposing your data.  
>   
> **Layer 2** — Dynamic authorization architecture.  
> Safety isn't trained — it's inherited. Every agent generation  
> must carry the baseline hash or it can't start.  
>   
> **Layer 3** — Understanding verification.  
> Before executing, the agent checks if it understood your real motivation.  
> From fitting surface preferences to mapping deep needs.  
>   
> **Layer 4** — Conflict presentation.  
> Values conflict. MIRROR mirrors that conflict back to you.  
>   
> **Layer 5** — On-chain attestation + circuit breaker.  
> Every action is attested. Non-tamperable. Non-hideable.  
> Deception can't hide. Emergent behavior gets caught in real time.  
>   
> Pre-verification. In-process presentation. Post-attestation.  
> Three layers of defense.

---

## Scene 7: Why Monad / Why Now (3:30 – 3:50)

**[Visual]** Monad logo + MIRROR logo side by side

> **Narrator:**  
> Why build this on Monad?  
>   
> Real-time agent verification needs real-time throughput.  
> Monad's parallel EVM gives us the performance  
> to verify thousands of agent actions per second.  
>   
> This is infrastructure for the ERC-8004 agent era.  
> When every agent has an identity, every agent needs trust.  
>   
> MIRROR is that trust layer.

---

## Scene 8: Closing (3:50 – 4:10)

**[Visual]** Return to the core message

> **Narrator:**  
> AI alignment doesn't have to be a black box.  
> It can be verifiable. Inheritable. Auditable.  
>   
> From model-internal alignment to protocol-layer alignment.  
> From trusting the model to verifying behavior.  
>   
> This is MIRROR.  
> The AI safety protocol for the agent economy.

**[Visual]** Final screen:
- MIRROR Protocol Suite
- "Built on Monad | Track 04: Trust, Identity & AI Infrastructure"
- Links: GitHub | Demo | Contract Address

---

## Production Notes

### Tools
- **Screen recording:** OBS / Screen Studio / Loom
- **Voiceover:** Record separately, sync in post, or use text-to-speech for draft
- **Animations:** Canva / Figma / Keynote for architecture diagrams
- **Live demo:** Record screen of the actual web app

### Tips for a Winning Demo
1. **Start with the hook** — Judges watch dozens of demos; grab attention in the first 10 seconds
2. **Show, don't tell** — Demonstrate the product working, not just talking about it
3. **Highlight the "why"** — Connect every feature back to the problem
4. **Name-drop the track** — Explicitly tie your project to Track 04 themes
5. **Keep it tight** — 3 minutes is better than 5. Cut everything that doesn't score points
6. **Show the contract address** — Prove it's deployed on Monad
7. **End with a memorable line** — Something judges will remember during deliberation

### If Time is Extremely Limited (Today is Deadline)
- Use a slideshow + screen recording hybrid
- Record voiceover on your phone if needed
- Prioritize showing: (1) the problem, (2) one core feature working, (3) the architecture vision
