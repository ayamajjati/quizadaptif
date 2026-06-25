#  QuizAdaptif

Application web de quiz à difficulté adaptative, développée dans le cadre du cursus d'Ingénierie des Données à l'**ENSAH Al Hoceima**.

Le niveau de difficulté des questions s'ajuste automatiquement en temps réel selon les performances du joueur (précision des réponses et rapidité), en s'appuyant sur les questions fournies dynamiquement par l'API **Open Trivia DB**.

---

##  Aperçu

> Page d'accueil, écran de quiz avec timer animé, écran de résultat et classement global.

---

##  Fonctionnalités

- 🌐 Récupération dynamique des questions depuis l'API [Open Trivia DB](https://opentdb.com/)
- 🧠 Algorithme de difficulté adaptative (`facile → moyen → difficile`) basé sur le taux de réussite et le temps de réponse
- ⏱️ Timer visuel animé en SVG, avec état "urgence" lorsque le temps est presque écoulé
- 💾 Sauvegarde de la progression et du score en cours via `localStorage`
- 🏆 Classement global (leaderboard) persistant côté serveur, géré via PHP/MySQL
- 🎮 Système de score basé sur la rapidité et la difficulté de chaque question
- 🌗 Thème clair / sombre

---

##  Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Backend | PHP (PDO, requêtes préparées) |
| Base de données | MySQL / MariaDB |
| API externe | [Open Trivia DB](https://opentdb.com/) |
| Persistance locale | `localStorage` |

---

##  Logique de l'application

1. L'utilisateur saisit son pseudo et choisit une catégorie, puis démarre le quiz
2. Une requête est envoyée à l'API Open Trivia DB pour récupérer une question de difficulté "facile"
3. La question s'affiche avec un timer SVG de 15 secondes
4. Selon la réponse (correcte/incorrecte) et le temps de réponse, l'algorithme adapte la difficulté de la question suivante
5. Le score est mis à jour et stocké temporairement dans `localStorage`
6. À la fin des 10 questions, le score final est envoyé au serveur via `scores.php` pour être enregistré en base MySQL
7. Le classement global est mis à jour et affiché à tous les joueurs

### Algorithme de difficulté adaptative

- ✅ Bonne réponse → la difficulté peut augmenter
- ❌ Mauvaise réponse → la difficulté peut diminuer
- ⚡ Une réponse rapide renforce la confiance de l'algorithme dans l'augmentation du niveau
- Trois paliers : `easy` → `medium` → `hard`

---

##  Installation locale

### Prérequis

- [XAMPP](https://www.apachefriends.org/) (ou tout environnement Apache + PHP + MySQL)
- Un navigateur web

### Étapes

1. **Cloner le projet** dans le dossier `htdocs` de XAMPP :
   ```bash
   cd C:\xampp\htdocs
   git clone https://github.com/<ton-pseudo>/quizadaptif.git
   ```

2. **Démarrer Apache et MySQL** depuis le panneau de contrôle XAMPP

3. **Créer la base de données** :
   - Ouvrir [phpMyAdmin](http://localhost/phpmyadmin)
   - Créer une base de données nommée `quizadaptif`
   - Importer le fichier [`database.sql`](./database.sql) fourni dans ce repo

4. **Vérifier la configuration de connexion** dans `scores.php` (identifiants par défaut de XAMPP, à adapter si besoin) :
   ```php
   $host = 'localhost';
   $db   = 'quizadaptif';
   $user = 'root';
   $pass = '';
   ```

5. **Lancer l'application** dans le navigateur :
   ```
   http://localhost/quizadaptif/
   ```

---

##  Structure de la base de données

```sql
CREATE TABLE `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(30) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `correct` tinyint(4) NOT NULL DEFAULT 0,
  `difficulte` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
  `categorie` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);
```

Le script complet est disponible dans [`database.sql`](./database.sql).

---

##  Limites connues / axes d'amélioration

- Gestion du rate-limit de l'API Open Trivia DB : en cas de trop nombreuses requêtes, un message d'attente est affiché et la requête est automatiquement retentée
- Pas de système d'authentification : un même pseudo peut être utilisé par plusieurs joueurs
- Le classement n'est pas paginé (limité aux 20 meilleurs scores)
- Pas de tests automatisés à ce stade

---

##  Auteurs

Projet réalisé en binôme par Aya Majjati et Hajar Lebyed dans le cadre du cursus d'Ingénierie des Données à l'ENSAH Al Hoceima.

---

##  Licence

Ce projet est distribué sous licence MIT — voir le fichier [LICENSE](./LICENSE) pour plus de détails.
