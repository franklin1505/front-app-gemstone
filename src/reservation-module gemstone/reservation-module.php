<?php
/*
Plugin Name: Module de Réservation
Description: Ce plugin ajoute un système de réservation avancé pour les services de transport, intégrant des fonctionnalités d'estimation automatique et une interface utilisateur personnalisée pour une expérience fluide. Il inclut la gestion des étapes de réservation, le calcul des coûts (y compris les suppléments et les commissions), l'authentification des utilisateurs, et le choix des options de paiement.

Fonctionnalités principales :
- Estimation automatique du trajet et affichage de la distance et de la durée.
- Sélection dynamique des véhicules disponibles avec filtrage par estimation.
- Ajout de suppléments personnalisés, avec coût total calculé en temps réel.
- Enregistrement sécurisé des informations de réservation via AJAX.
- Authentification des clients existants et inscription des nouveaux clients.
- Interface utilisateur intuitive et responsive avec des étapes claires pour chaque phase de la réservation.
- Gestion des méthodes de paiement et intégration d'API pour les services Google Maps (Places, Directions).

Configuration :
- Les URL de confirmation, d'images par défaut, et autres paramètres de base peuvent être définis via le fichier `config.php`.
- Le plugin ajoute automatiquement une page "Réservation" lors de l'activation, où le formulaire principal est intégré via un shortcode `[mr_formulaire_estimation]`.

Version: 1.0
Author: Franklin N'TESSAH
*/

if (!defined('ABSPATH')) {
  exit;
}

// Inclure les fichiers AJAX et autres dépendances
require_once plugin_dir_path(__FILE__) . 'includes/module-reservation-ajax.php';
require_once plugin_dir_path(__FILE__) . 'includes/config.php';

// Fonction d'activation pour créer la page "Réservation"
function mr_activer_plugin() {
  $page = get_page_by_title('Réservation');
  if (!$page) {
    $nouvelle_page = array(
      'post_title'   => 'Réservation',
      'post_content' => '[mr_formulaire_estimation]',
      'post_status'  => 'publish',
      'post_type'    => 'page',
    );
    wp_insert_post($nouvelle_page);
  }
}
register_activation_hook(__FILE__, 'mr_activer_plugin');

// Shortcode pour afficher le formulaire
function mr_afficher_formulaire_estimation() {
  ob_start();
  include plugin_dir_path(__FILE__) . 'templates/form-reservation.php';
  return ob_get_clean();
}
add_shortcode('mr_formulaire_estimation', 'mr_afficher_formulaire_estimation');

// Enqueue Google Places API et autres scripts
function mr_inclure_google_places_api() {
  if (is_page('Réservation')) {
    wp_enqueue_script('google-places-api', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEilIuILbArteSd2h21UUMcTsolLJiQPw&libraries=places', null, null, true);
    wp_enqueue_style('bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', array(), null);
    wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', array('jquery'), null, true);
    wp_enqueue_style('mr-custom-css', plugin_dir_url(__FILE__) . 'css/style.css');
  }
}
add_action('wp_enqueue_scripts', 'mr_inclure_google_places_api');

// Fonction pour injecter les URLs de configuration
function mr_inclure_urls_configuration() {
  if (is_page('Réservation')) {
    $config_urls = [
      'home_url'                 => HOME_URL,
      'account_url'              => ACCOUNT_URL,
      'confirmation_image_url'   => CONFIRMATION_IMAGE_URL,
      'default_vehicle_image_url'=> DEFAULT_VEHICLE_IMAGE_URL,
    ];

    echo '<script type="text/javascript">const mr_config = ' . json_encode($config_urls) . ';</script>';
  }
}
add_action('wp_head', 'mr_inclure_urls_configuration');

// Enqueue custom scripts
function mr_charger_scripts() {
  if (is_page('Réservation')) {
    wp_enqueue_script('mr-script', plugin_dir_url(__FILE__) . 'js/mr-script.js', array('jquery'), null, true);
    wp_localize_script('mr-script', 'mr_vars', array(
      'ajax_url' => admin_url('admin-ajax.php'),
      'nonce'    => wp_create_nonce('mr_nonce'),
    ));
  }
}
add_action('wp_enqueue_scripts', 'mr_charger_scripts');
