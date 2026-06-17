-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 17, 2026 at 11:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quad_bh_cms`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(3, 'dsadsa', 'sdasda', 'dsadsa', '2026-06-17 08:21:59'),
(4, 'asdasddsa', 'akramahmad060@gmail.com', 'sadsadsdaasdsaddsa', '2026-06-17 08:27:41'),
(5, 'Ahmad Abdulrahman', 'akramahmad060@gmail.com', 'dasdsasadsad', '2026-06-17 09:24:43');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(11) NOT NULL,
  `url` text NOT NULL,
  `type` enum('text','image','media') NOT NULL,
  `owner_type` varchar(50) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `url`, `type`, `owner_type`, `owner_id`, `created_at`) VALUES
(283, 'https://images.pexels.com/photos/8861589/pexels-photo-8861589.jpeg', 'image', 'uplift', 37, '2026-06-16 12:46:19'),
(284, '/uploads/cd74cbfc-898a-49d3-a076-7e2e0d560fad-pexels-cottonbro-8861589.jpg', 'image', 'section_item', 12, '2026-06-17 07:48:51'),
(285, '/uploads/cc6fa606-43fe-4912-a869-0dd2cede7d42-pexels-cottonbro-8861589.jpg', 'image', 'section_item', 2, '2026-06-17 07:56:32'),
(287, 'https://assets.bucketlistly.blog/sites/5adf778b6eabcc00190b75b1/assets/6075182186d092000b192cee/best-free-travel-images-image-2.jpg', 'image', 'section_item', 2, '2026-06-17 07:56:58'),
(288, '/uploads/51e17537-9811-425a-9bc1-1fb2e6745350-pexels-cottonbro-8861589.jpg', 'image', 'row_brandItem', 13, '2026-06-17 09:25:19');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `type`, `order`, `isActive`, `created_at`, `updated_at`) VALUES
(1, 'navbar', 1, 1, '2026-06-06 09:27:21', '2026-06-12 12:29:01'),
(5, 'hero', 2, 1, '2026-06-06 10:33:00', '2026-06-17 07:48:37'),
(6, 'about', 3, 1, '2026-06-06 10:33:00', '2026-06-17 07:48:37'),
(7, 'portfolio', 5, 1, '2026-06-06 10:33:33', '2026-06-16 08:09:35'),
(8, 'brands', 6, 1, '2026-06-06 10:34:18', '2026-06-16 10:48:02'),
(9, 'qoworking', 4, 1, '2026-06-06 10:35:05', '2026-06-15 16:44:14'),
(10, 'uplifts', 9, 1, '2026-06-06 10:35:36', '2026-06-16 12:35:33'),
(11, 'academy', 7, 1, '2026-06-06 10:35:56', '2026-06-16 12:35:41'),
(12, 'digital-media', 8, 1, '2026-06-09 12:11:51', '2026-06-15 17:11:57'),
(13, 'location', 10, 1, '2026-06-06 10:36:19', '2026-06-16 12:35:41'),
(14, 'contact', 11, 1, '2026-06-09 12:09:50', '2026-06-16 12:35:31'),
(15, 'footer', 12, 1, '2026-06-06 10:37:20', '2026-06-11 12:59:05');

-- --------------------------------------------------------

--
-- Table structure for table `section_items`
--

CREATE TABLE `section_items` (
  `id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `section_id` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_items`
--

INSERT INTO `section_items` (`id`, `content`, `section_id`, `updated_at`) VALUES
(2, '{\"title\":\"Build Your Future With Us\",\"subtitle\":\"Modern workspace, digital growth, and innovation together\",\"buttonText\":\"Start Exploring\",\"isActive\":true}', 5, '2026-06-11 12:59:50'),
(4, '{\"title\":\"What is QUAD\",\"subtitle\":\"Quad is a modern digital platform built to empower entrepreneurs, creators, and forward-thinking brands.\",\"description\":\"At Quad, we believe in moving beyond the ordinary — turning ambition into action\",\"mission\":{\"title\":\"Digital Media\",\"text\":\"We create and share impactful stories, insights, and content from the world of entrepreneurship, innovation, and business culture.\"},\"vision\":{\"title\":\"Academy Services\",\"text\":\"We provide practical learning experiences, training, and resources designed to help individuals build real entrepreneurial skills.\"},\"highlights\":[{\"title\":\"ads\",\"text\":\"dsa\"}],\"isActive\":true}', 6, '2026-06-13 14:49:39'),
(8, '{\"title\":\"Qoworking Spaces\",\"subtitle\":\"A space built for entrepreneurs, creators, and innovators to work, connect, and grow.\",\"description\":\"Quad Coworking Space is designed to bring ambitious minds together in one productive environment combining focus, collaboration, and creativity.\",\"features\":[],\"spaces\":[],\"isActive\":true}', 9, '2026-06-17 07:57:28'),
(11, '{\"title\":\"Our Impact in Numbers\",\"subtitle\":\"A quick look at what we’ve achieved so far\",\"stats\":[{\"value\":500,\"suffix\":\"+\",\"label\":\"dsasad\",\"sub\":\"asdasdasd\"},{\"value\":0,\"suffix\":\"+\",\"label\":\"\",\"sub\":\"\"}],\"isActive\":true}', 7, '2026-06-17 07:56:25'),
(12, '{\"tag\":\" ACADEMY\",\"title\":\"QUAD ACADEMY\",\"description\":\"We provide practical education, mentorship, and real-world training programs designed to build future entrepreneurs and leaders.\",\"learningTitle\":\"What You Will Learn\",\"lessons\":[\"saddas\",\"dsadas\",\"\",\"\"],\"buttonText\":\"Go To Academy\",\"buttonLink\":\"https://quad-academy.vercel.app/\",\"isActive\":true}', 11, '2026-06-17 07:48:52'),
(13, '{\"sectionTitle\":\"Our Trusted Brands\",\"brandItem\":[{\"name\":\"dsadsadsa\",\"nameColor\":\"red\",\"nameBackgroundColor\":\"red\",\"title\":\"dsadsa\",\"titleColor\":\"red\",\"description\":\"dsadsasdaasd\",\"descriptionColor\":\"red\",\"buttonText\":\"dsasadads\",\"buttonColor\":\"red\",\"image\":\"/uploads/51e17537-9811-425a-9bc1-1fb2e6745350-pexels-cottonbro-8861589.jpg\",\"link\":\"dsadsadsa\"}],\"isActive\":true}', 8, '2026-06-17 09:25:21'),
(14, '{\"title\":\"QUAD MAP\",\"subtitle\":\"Visit Us\",\"mapUrl\":\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3291.0642094982227!2d35.8283021!3d34.4251241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1521f7e312ffe1e1%3A0xdb61e9b4db8b026a!2sQUAD%20Digital%20Media!5e0!3m2!1sen!2slb!4v1780989560598!5m2!1sen!2slb\",\"isActive\":true}', 13, '2026-06-11 13:02:20'),
(15, '{\"title\":\"Business House\",\"isActive\":true}', 1, '2026-06-10 10:20:23'),
(17, '{\"title\":\"Contact Us\",\"subtitle\":\"You can either fill the form or contact us directly via email or WhatsApp\",\"email\":\"info@quad-bh.com\",\"whatsapp\":\"+9613382599\",\"buttonText\":\"Send Message\",\"isActive\":true}', 14, '2026-06-10 23:17:23'),
(18, '{\"span\":\"Media\",\"title\":\"QUAD DIGITAL MEDIA\",\"subtitle\":\"sadasdds\",\"sectionTitle\":\"\",\"features\":[],\"buttonText\":\"Explore Digital Media\",\"link\":\"https://quad-digital-media.vercel.app/\",\"isActive\":true}', 12, '2026-06-16 12:35:54'),
(19, '{\"title\":\"Business House\",\"description\":\"We build modern digital experiences with performance and design in mind.\",\"socials\":{\"twitter\":\"https://twitter.com/yourpage\",\"facebook\":\"https://facebook.com/yourpage\",\"instagram\":\"https://instagram.com/yourpage\",\"youtube\":\"https://youtube.com/@yourchannel\",\"linkedin\":\"https://linkedin.com/company/yourcompany\",\"whatsapp\":\"+96103382599\"},\"isActive\":true}', 15, '2026-06-10 20:42:56'),
(21, '{\"title\":\"Uplifts\",\"subtitle\":\"asdasdsad\",\"description\":\"dsadsasdasdasda\",\"isActive\":true}', 10, '2026-06-16 10:58:52');

-- --------------------------------------------------------

--
-- Table structure for table `uplifts`
--

CREATE TABLE `uplifts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uplifts`
--

INSERT INTO `uplifts` (`id`, `title`, `description`, `created_at`, `updated_at`) VALUES
(34, 'asdsad', 'saddasdas', '2026-06-16 10:26:00', '2026-06-16 10:26:00'),
(35, 'asdsad', 'sadsad', '2026-06-16 10:30:05', '2026-06-16 12:24:13'),
(36, 'asd', 'adsads', '2026-06-16 10:34:28', '2026-06-16 10:34:28'),
(37, 'asdasddsa', 'sdasaddsadsa', '2026-06-16 10:34:33', '2026-06-16 12:46:20');

-- --------------------------------------------------------

--
-- Table structure for table `uplift_items`
--

CREATE TABLE `uplift_items` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `uplift_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uplift_items`
--

INSERT INTO `uplift_items` (`id`, `content`, `uplift_id`, `created_at`, `updated_at`) VALUES
(14, '[{\"type\":\"text\",\"value\":\"saddasdas\"},{\"type\":\"image\",\"media_type\":\"image\",\"url\":\"https://images.pexels.com/photos/8861589/pexels-photo-8861589.jpeg\",\"media_id\":null}]', 34, '2026-06-16 12:27:07', '2026-06-16 12:27:07'),
(15, '[{\"type\":\"text\",\"value\":\"sdasaddsadsa\"},{\"type\":\"image\",\"media_type\":\"image\",\"url\":\"https://assets.bucketlistly.blog/sites/5adf778b6eabcc00190b75b1/assets/6075182186d092000b192cee/best-free-travel-images-image-2.jpg\",\"media_id\":null}]', 37, '2026-06-17 07:47:29', '2026-06-17 07:47:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `must_reset_password` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`, `must_reset_password`) VALUES
(12, 'Ahmad Abdulrahman', 'akramahmad060@gmail.com', '$2b$10$tMYKz/3L9/hju2XDdn28e.p1gPGvkyIzOsXpOClSVyGJ5eK4wjWn2', 'admin', '2026-06-16 12:33:27', '2026-06-16 12:33:27', 1),
(13, 'Said Said', 'saidsaid@gmail.com', '$2b$10$gliSwXEhrl9XU6xNxV2BmOOu6C99q8Tsm1OnDkgOAv16HGHMFA2uO', 'editor', '2026-06-16 12:34:11', '2026-06-16 12:34:11', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `section_items`
--
ALTER TABLE `section_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `uplifts`
--
ALTER TABLE `uplifts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `uplift_items`
--
ALTER TABLE `uplift_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uplift_id` (`uplift_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=289;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `section_items`
--
ALTER TABLE `section_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `uplifts`
--
ALTER TABLE `uplifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `uplift_items`
--
ALTER TABLE `uplift_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `section_items`
--
ALTER TABLE `section_items`
  ADD CONSTRAINT `section_items_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`);

--
-- Constraints for table `uplift_items`
--
ALTER TABLE `uplift_items`
  ADD CONSTRAINT `uplift_items_ibfk_1` FOREIGN KEY (`uplift_id`) REFERENCES `uplifts` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
