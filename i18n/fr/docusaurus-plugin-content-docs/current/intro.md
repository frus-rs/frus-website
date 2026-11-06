---
slug: /
title: Introduction
sidebar_label: Introduction
---

# Documentation de frus

frus est un framework d'interface multiplateforme écrit entièrement en Rust. Un seul code
tourne sur les ordinateurs (Windows, Linux, macOS), sur Android et dans le navigateur, dessiné
sur le GPU par frus lui-même. Le moteur de rendu, la mise en page, les widgets, les gestes, les
thèmes, les animations et l'accessibilité sont tous en Rust : pas de machine virtuelle
embarquée, pas de second langage pour la logique de l'application, pas de pont entre votre code
et les pixels.

:::warning[Pré-alpha]

Les crates sont sur [crates.io](https://crates.io/crates/frus), et chaque version peut casser
l'API. La [feuille de route](https://github.com/frus-rs/frus/blob/master/ROADMAP.md) (en
anglais) dit ce qui vient ensuite, et ce qui manque à ce jour.

:::

:::info[Traduction en cours]

Les pages de la documentation sont écrites en anglais dans le
[dépôt frus](https://github.com/frus-rs/frus). Celles qui ne sont pas encore traduites
s'affichent en anglais. Pour aider à les traduire, voyez
[l'issue sur la traduction](https://github.com/frus-rs/frus-website/issues/2).

:::

## Par où commencer

| Page | Ce qu'elle couvre |
| --- | --- |
| [Démarrer une application frus](getting-started.md) | Installer la commande `frus`, créer un projet, le lancer sur cet ordinateur, un téléphone et le navigateur |
| [Le guide](guide/README.md) | Un sujet par page : mise en page, style, saisie, listes, navigation, réseau, animation, tests, le système autour de la fenêtre |
| [Structurer une application](app-structure.md) | Où va chaque partie d'une application qui grandit |
| [La commande `frus`](tooling/cli.md) | `create`, `doctor`, `devices`, `run`, `build`, le rechargement à chaud, et les touches pendant l'exécution |
| [L'extension VS Code](tooling/vscode.md) | Un choix d'appareil, F5 avec le journal dans la console de débogage, rechargement à l'enregistrement, l'inspecteur dans la palette |
| [Architecture](internals/architecture.md) | Comment les crates s'assemblent, et où va chaque type de code |

## Plateformes

| Plateforme | État |
| --- | --- |
| Windows, Linux, macOS | Fonctionne : winit et wgpu, lecteurs d'écran via AccessKit, notifications, zone de notification, dialogues de fichiers, rechargement à chaud |
| Android | Fonctionne : activité native, Vulkan ou OpenGL ES, un vrai IME, encoches et barres système, notifications, rechargement à chaud |
| Web (wasm et WebGPU) | Fonctionnel : rendu, saisie, `fetch`, presse-papiers, notifications, accessibilité via un pont DOM, rechargement à chaud |
| iOS, macOS natif | Pas commencé : la couche plateforme est isolée, donc une nouvelle cible est un travail circonscrit |

Chaque exemple du guide est un morceau de Rust complet, et la suite de tests de frus le
compile : aucun n'est périmé.
