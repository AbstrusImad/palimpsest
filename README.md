# PALIMPSEST

> One world, many hands. A shared mythology written by strangers and kept whole by an on-chain Loremaster.

*A palimpsest is a manuscript scraped clean and written over, the older text still bleeding through. This one is never scraped clean. Every hand that writes is judged against every hand that came before, and only what holds is kept.*

---

### The argument

Most worlds belong to one author. This one belongs to everyone and to no one. A scribe sets down a fragment of lore, a figure, a place, an age, an artifact, an event, and submits it to the canon. It is not stored because it was submitted. It is stored because it does not break the world.

The judge is not a moderator with a delete key. It is an Intelligent Contract on GenLayer whose ruling is settled by validator consensus, written into the chain, and impossible to quietly revise.

### On the keeping of canon

When an entry arrives, the Loremaster reads it against a digest of the established canon and against the specific entries it claims to reference. Then it rules:

- **Canonize.** The entry is coherent and contradicts nothing. It enters the canon and cross-links to what it touches.
- **Apocrypha.** The entry belongs to the world but contradicts standing lore. It is kept, named, and filed among the contested leaves, with the entry it broke against recorded.
- **Reject.** The entry is incoherent, empty of lore, or an attempt to seize the Loremaster's hand. It is struck from the record.

The model proposes; the chain disposes. Every validator re-runs the same judgment and they must agree on the ruling exactly and on the consistency score within a tolerance. The verdict is never decided by byte-identical text, never by `strict_eq` over a generative answer. Deterministic code does the rest: it admits the canon, files the apocrypha, refuses duplicate titles, and records the cross-links. The prompt persuades. The code enforces.

### The five kinds

A figure who acted. A place that held. An age that turned. An artifact that endured. An event that broke or made the rest. Each entry declares its kind, and the kinds are how the codex sorts itself into a library.

### The Loremaster's method, plainly

- `scribe(title, kind, body, refs)` is the one write that needs the world's agreement. It is where lore is weighed.
- `get_stats` counts the canon, the apocrypha, and every submission ever weighed.
- `get_entries` turns the pages of the library, twenty at a time.
- `get_entry` opens a single leaf in full, its body, its seal, its cross-links, the Loremaster's note.
- `get_chronicle` reads the record of judgement, newest first, canonizations and contradictions and the struck.

No deposit is ever asked. A scribe pays only the network's fee, mostly refunded after the ruling settles.

### On the making

PALIMPSEST is not one page that scrolls. It is a small illuminated site of many rooms, each its own route: the frontispiece, the Codex, a reading leaf, the Scriptorium where you scribe, the Canon Map that draws the cross-links as a living constellation, the Apocrypha, and the Chronicle. A static export bound from Next.js, lettered in IM Fell English and EB Garamond, illuminated with plates raised by a generative hand, and spoken to the chain through genlayer-js. There is no server. The contract is the only authority.

### For the scribe who would deploy it

```
genvm-lint lint contracts/contract.py
gltest tests/integration/ -v -s --network studionet   # prove the ruling under consensus
genlayer deploy --contract contracts/contract.py       # then bind it to Bradbury
cd frontend && npm run build                            # the illuminated leaves
```

Set the deployed address into `frontend/src/lib/contract.ts`, then publish `frontend/out` to any static host.

### Colophon

Composed for GenLayer Bradbury Testnet and lettered in IM Fell English with EB Garamond. The work is read at https://abstrusimad.github.io/palimpsest/ and its source kept at https://github.com/AbstrusImad/palimpsest. The Loremaster resides at the contract 0xBf42a47665B32180De8d8977f8A9439e919860B9, viewable on the Bradbury explorer, and was first impressed in transaction 0x72278c99cb6a063e8037b6a0e1183b84364825e3492217ffbffb6271a45cb405. Test GEN for the scribe's fee is drawn from the faucet at https://testnet-faucet.genlayer.foundation/. No emoji marks these pages, and no long dash.
