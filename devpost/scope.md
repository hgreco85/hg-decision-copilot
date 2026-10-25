---
doc: scope
status: approved
---
# HG Decision Copilot

A browser tool where you paste a messy list of tasks and it shows which ones are duplicated across AI agents, what to do first, and what was abandoned — with a short reason for each.

## The Unique Kernel
Detecting and preventing duplicate tasks between AI agents. The learner chose this as the one part that must work: "Detectar y evitar tareas duplicadas entre agentes." A plain to-do prioritizer is generic; spotting that two agents are working on the same thing, and showing the concrete matching words, is what makes it this tool.

## Who It's For
First the learner himself, then teams that run multiple agents ("Primero para mí, luego para equipos que usen múltiples agentes."). Someone with many open tasks spread across several AI agents who wants to stop wasting time and resources on repeated work.

## The Core Loop
Paste a messy task dump → see duplicate groups, a prioritized list, and abandoned-task alerts, each with a brief explanation → act on it (drop a duplicate, pick the top task, resume something abandoned). Comes back whenever the task pile grows.

## Inspiration & Identity
"Diseño minimalista, profesional, claro, una sola pantalla, sin scroll horizontal, modo oscuro preferido."

## Why This Matters to the Learner
"aprovechar mejor el tiempo y los recursos, y concentrarnos en terminar lo que realmente aporta valor" — and to "crear una herramienta útil que pueda seguir usando."

## What "Working" Looks Like
In his words: "Pegar tareas desordenadas y obtener prioridades, duplicados y proyectos abandonados."
The "oh, that's cool" beat: two differently-worded tasks assigned to different agents get grouped as duplicates, with the overlapping words shown.

## The POC Boundary
- Now (kernel): duplicate detection across agents, with concrete matches as explanation.
- Now (thin secondary, confirmed): a simple prioritized list and simple abandoned-task alerts — "La priorización y la detección de tareas abandonadas son funciones secundarias y más simples."
- Input only by pasting text.

## Later
- Use with teams of multiple agents (after personal use).

## Explicitly Cut
- Complex integrations — learner cut ("Integraciones complejas").
- Execution automation (the tool does not run or stop agents) — learner cut ("automatización de ejecución").
- Paid services — learner cut ("servicios pagos"); also the hackathon budget is USD 0.

## Decision Record
Kernel vs. demo of all three — resolved by the learner (2026-10-25 15:09 ART): "El núcleo del MVP es detectar tareas duplicadas entre agentes, mostrando las palabras coincidentes y una explicación breve." Priority and abandoned alerts are secondary and simpler.
Also cut by learner: anything requiring internet, paid APIs or mandatory external dependencies ("funcionamiento 100% offline, sin APIs pagas, sin dependencias externas obligatorias").
