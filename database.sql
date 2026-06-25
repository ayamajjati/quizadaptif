-- ============================================================
-- QuizAdaptif - Structure de la base de données
-- ============================================================
-- Importer ce fichier dans phpMyAdmin (ou via la ligne de commande MySQL)
-- pour créer la base de données et la table nécessaires au projet.
--
-- Via phpMyAdmin :
--   1. Créer une base de données nommée "quizadaptif"
--   2. Importer ce fichier dans cette base
--
-- Via la ligne de commande :
--   mysql -u root -p quizadaptif < database.sql
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Structure de la table `scores`
--

CREATE TABLE IF NOT EXISTS `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(30) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `correct` tinyint(4) NOT NULL DEFAULT 0,
  `difficulte` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
  `categorie` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

COMMIT;
