# React Matt Skill

A small React app built from the Vite starter, plus the shared UI components it
is being refactored onto. This glossary fixes the names those components own, so
later work does not reintroduce competing words for the same thing.

## Language

**Panel**:
A bordered container with a title, a body, and an optional footer, which can
optionally collapse. The page's two content areas are panels.
_Avoid_: Card, box, section, tile

**Toggle**:
The button a collapsible panel puts inside its title. It is what hides and
reveals the body, and it carries the panel's open state.
_Avoid_: Header button, disclosure, accordion header

**Button**:
A real `<button>` the user activates to perform an action. A link that merely
looks like one is not a Button: it is an anchor, and stays an anchor.
_Avoid_: CTA, action link
