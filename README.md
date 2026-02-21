# 🗼 Tour de Hanoï - Projet Web

Un jeu de réflexion classique recréé en application web moderne avec HTML, CSS et JavaScript réalisé par Alexandre Bianchin, Overna-Dorian Mouyele-Mbou et Lou Sempere.

## Description du projet
Ce projet implémente le célèbre casse-tête mathématique de la Tour de Hanoï. Le jeu intègre de nombreuses fonctionnalités avancées pour enrichir l'expérience utilisateur :
- **Timer & Compteur de coups** en temps réel.
- **Mode Défi** : un compte à rebours basé sur le nombre de coups parfaits ($2^n - 1$).
- **Système d'annulation** : possibilité d'annuler le coup réalisé grâce à un historique géré dynamiquement.
- **Personnalisation** : choix du nombre de disques (de 3 à 8) et différentes palettes de couleurs dynamiques.
- **Accessibilité** : jouable entièrement au clavier (Tab + Entrée) et interface responsive.

## Règles du jeu

Le casse-tête est constitué de trois tours et de plusieurs disques de tailles différentes. Au début de la partie, tous les disques sont empilés sur la première tour, du plus grand (en bas) au plus petit (en haut).

Le but est de déplacer toute la pile sur la troisième tour, en respectant ces trois règles :
1. On ne peut déplacer qu'un seul disque à la fois.
2. On ne peut prendre que le disque situé au sommet d'une tour.
3. **Un disque ne peut jamais être posé sur un disque plus petit que lui.**

## Instructions pour lancer le projet
Ce projet utilisant des **Modules JavaScript** (`import` / `export`), il ne peut pas être lancé en ouvrant simplement le fichier HTML dans un navigateur (à cause des sécurités CORS). Il nécessite un serveur local.

**Méthode recommandée (VS Code) :**
1. Ouvre le dossier du projet dans Visual Studio Code.
2. Installe l'extension **Live Server** (si ce n'est pas déjà fait).
3. Fais un clic droit sur le fichier `index.html` et choisis **"Open with Live Server"** ou clique sur **Go Live**.
4. Le jeu s'ouvrira automatiquement dans ton navigateur par défaut.

## 👥 Répartition du travail
* **Alexandre Bianchin** : Gestion des événements de l'interface (`ui.js`), implémentation de la personnalisation (palettes/disques), gestion du compteur de coups, style CSS et co-développement du fichier principal (`main.js`).
* **Overna-Dorian Mouyele-Mbou** : Intégration de la structure HTML, implémentation de la logique du Timer, et style CSS.
* **Lou Sempere** : Développement de la logique du jeu (`game.js`), implémentation du système d'annulation et du Mode Défi, style CSS et co-développement du fichier principal (`main.js`).


## Difficultés rencontrées et améliorations possibles

### Difficultés rencontrées
- **Gestion des erreurs et blocage de l'interface :** Lors du développement, nous avons fait face à un bug bloquant : lorsqu'un joueur tentait un mouvement invalide (comme poser un grand disque sur un petit), l'interface se figeait et il était impossible de continuer.
- **Gestion des états synchronisés :** S'assurer que le bouton "Annuler" se grise correctement selon l'historique et ne rentre pas en conflit avec le verrouillage du démarrage ou la pause.
- **Liaison Timer :** Gérer l'arrêt précis du chronomètre dès la détection de la victoire ou d'une pause, sans décalage.

### Améliorations possibles (Futures itérations)
- **Mode Auto-résolution :** Ajouter un algorithme récursif permettant à l'ordinateur de résoudre le puzzle tout seul sous les yeux de l'utilisateur.
- **Animations fluides :** Animer le déplacement des disques d'une tour à l'autre avec des transitions CSS calculées en JavaScript.
- **Sauvegarde locale** : enregistrement des meilleurs scores (High Scores) via le `localStorage` du navigateur.
