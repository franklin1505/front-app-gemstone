<?php
if (!defined('ABSPATH')) {
  exit;
}

require_once('config.php');  // Inclure la configuration des URLs

// Fonction pour envoyer une requête POST à l'API
function mr_send_post_request($endpoint, $data)
{
  $response = wp_remote_post(API_BASE_URL . $endpoint, array(
    'headers' => array('Content-Type' => 'application/json'),
    'body' => json_encode($data),
  ));

  if (is_wp_error($response)) {
    return array('error' => 'Erreur de connexion à l\'API.');
  }

  return json_decode(wp_remote_retrieve_body($response), true);
}

// Fonction pour récupérer les données GET de l'API
function mr_send_get_request($endpoint)
{
  $response = wp_remote_get(API_BASE_URL . $endpoint);

  if (is_wp_error($response)) {
    return array('error' => 'Erreur de connexion à l\'API.');
  }

  return json_decode(wp_remote_retrieve_body($response), true);
}

// Calculer l'estimation via AJAX

function mr_calculer_estimation() {
  check_ajax_referer('mr_nonce', 'nonce');

  $formData = $_POST['formData'];
  $donnees_api = array(
    'datePriseEnCharge' => sanitize_text_field($formData['datePriseEnCharge']),
    'departAddress' => sanitize_text_field($formData['departAddress']),
    'destinationAddress' => sanitize_text_field($formData['destinationAddress']),
  );

  $result = mr_send_post_request('estimation/calculDistance/', $donnees_api);

  if (isset($result['error'])) {
    wp_send_json_error(array('message' => $result['error']));
  } elseif (!empty($result)) {
    wp_send_json_success(array(
      'distance' => $result['distParcourt'],
      'duree' => $result['durParcourt'],
      'transport_estimates' => $result['transport_estimates'],
    ));
  } else {
    wp_send_json_error(array('message' => 'Impossible d\'obtenir une estimation.'));
  }
}
add_action('wp_ajax_mr_calculer_estimation', 'mr_calculer_estimation');
add_action('wp_ajax_nopriv_mr_calculer_estimation', 'mr_calculer_estimation');

// Récupération des véhicules via AJAX
function mr_fetch_vehicules()
{
  check_ajax_referer('mr_nonce', 'nonce');

  $result = mr_send_get_request('gve/vehicules/');

  if (isset($result['error'])) {
    wp_send_json_error(array('message' => $result['error']));
  } elseif (!empty($result)) {
    wp_send_json_success(array('vehicules' => $result));
  } else {
    wp_send_json_error(array('message' => 'Aucun véhicule disponible.'));
  }
}
add_action('wp_ajax_mr_fetch_vehicules', 'mr_fetch_vehicules');
add_action('wp_ajax_nopriv_mr_fetch_vehicules', 'mr_fetch_vehicules');

// Récupération des attributs via AJAX
function mr_fetch_attributs()
{
  check_ajax_referer('mr_nonce', 'nonce');

  $result = mr_send_get_request('setting/attributs/');

  if (isset($result['error'])) {
    wp_send_json_error(array('message' => $result['error']));
  } elseif (!empty($result)) {
    wp_send_json_success(array('attributs' => $result));
  } else {
    wp_send_json_error(array('message' => 'Aucun attribut disponible.'));
  }
}
add_action('wp_ajax_mr_fetch_attributs', 'mr_fetch_attributs');
add_action('wp_ajax_nopriv_mr_fetch_attributs', 'mr_fetch_attributs');

// Récupération des méthodes de paiement via AJAX
function mr_fetch_payment_methods()
{
  check_ajax_referer('mr_nonce', 'nonce');

  $result = mr_send_get_request('setting/methodes/');

  if (isset($result['error'])) {
    wp_send_json_error(array('message' => $result['error']));
  } elseif (!empty($result)) {
    wp_send_json_success(array('payment_methods' => $result));
  } else {
    wp_send_json_error(array('message' => 'Aucune méthode de paiement trouvée.'));
  }
}
add_action('wp_ajax_mr_fetch_payment_methods', 'mr_fetch_payment_methods');
add_action('wp_ajax_nopriv_mr_fetch_payment_methods', 'mr_fetch_payment_methods');

// Récupération des clients via AJAX
function mr_fetch_clients()
{
  $result = mr_send_get_request('auth/clients/');

  if (isset($result['error'])) {
    wp_send_json_error($result['error']);
  } elseif (!empty($result)) {
    wp_send_json_success($result);
  } else {
    wp_send_json_error('Aucun client trouvé.');
  }
}
add_action('wp_ajax_mr_fetch_clients', 'mr_fetch_clients');
add_action('wp_ajax_nopriv_mr_fetch_clients', 'mr_fetch_clients');

// Authentification des clients via AJAX
function mr_authenticate_client()
{
  check_ajax_referer('mr_nonce', 'nonce');

  $auth_data = array(
    'email_ou_telephone' => sanitize_text_field($_POST['email_ou_telephone']),
    'passCode' => $_POST['passCode'] // Suppression de sanitize_text_field
  );

  $result = mr_send_post_request('auth/login/', $auth_data);

  error_log("Réponse brute de l'API Django : " . $result);

  if (json_last_error() !== JSON_ERROR_NONE) {
    wp_send_json_error(array(
      'message' => 'Réponse de l\'API invalide.',
      'errors' => 'Erreur de décodage JSON.'
    ));
  }

  if (!isset($result['success'])) {
    wp_send_json_error(array(
      'reponse de $result' => $result,
      'test' => 'test'
    ));
  }

  if ($result['success']) {
    wp_send_json_success($result);
  } else {
    wp_send_json_error($result);
  }

  wp_die();
}
add_action('wp_ajax_mr_authenticate_client', 'mr_authenticate_client');
add_action('wp_ajax_nopriv_mr_authenticate_client', 'mr_authenticate_client');

// Enregistrement des clients via AJAX
function generate_client_data($type_client, $post_data)
{
  $client_data = [
    'type_utilisateur' => 'client',
    'type_client' => $type_client,
  ];

  switch ($type_client) {
    case 'client_simple':
    case 'client_liee_agence':
    case 'client_liee_societe':
      $client_data['first_name'] = sanitize_text_field($post_data['first_name']);
      $client_data['last_name'] = sanitize_text_field($post_data['last_name']);
      $client_data['email'] = sanitize_email($post_data['email']);
      $client_data['telephone'] = sanitize_text_field($post_data['telephone']);
      $client_data['adresse'] = sanitize_text_field($post_data['adresse']);
      if ($type_client === 'client_liee_agence') {
        $client_data['cle_agence'] = sanitize_text_field($post_data['cle_agence']);
      } elseif ($type_client === 'client_liee_societe') {
        $client_data['cle_societe'] = sanitize_text_field($post_data['cle_societe']);
      }
      break;
    case 'client_societe':
      $client_data['nom_societe'] = sanitize_text_field($post_data['nom_societe']);
      $client_data['adresse_societe'] = sanitize_text_field($post_data['adresse_societe']);
      $client_data['email_societe'] = sanitize_email($post_data['email_societe']);
      $client_data['telephone_societe'] = sanitize_text_field($post_data['telephone_societe']);
      break;
    case 'client_agence':
      $client_data['nom_agence'] = sanitize_text_field($post_data['nom_agence']);
      $client_data['adresse_agence'] = sanitize_text_field($post_data['adresse_agence']);
      $client_data['email_agence'] = sanitize_email($post_data['email_agence']);
      $client_data['telephone_agence'] = sanitize_text_field($post_data['telephone_agence']);
      break;
  }

  return $client_data;
}

function mr_register_client()
{
  check_ajax_referer('mr_nonce', 'nonce');
  $type_client = sanitize_text_field($_POST['type_client']);
  $client_data = generate_client_data($type_client, $_POST);

  $result = mr_send_post_request('auth/register/', $client_data);
  $response = json_decode($result, true);

  if (isset($response['success']) && $response['success'] === false) {
    $raw_message = $response['data']['raw_response']['message'] ?? '';
    if (strpos($raw_message, 'créés avec succès') !== false) {
      wp_send_json_success(['message' => 'Client créé avec succès malgré un retour d\'erreur de l\'API.']);
    } else {
      wp_send_json_error(['message' => $response['data']['message'] ?? 'Échec de l\'enregistrement du client.']);
    }
  } else {
    wp_send_json_success(['message' => $response['data']['message'] ?? 'Client créé avec succès.']);
  }
}

add_action('wp_ajax_mr_register_client', 'mr_register_client');
add_action('wp_ajax_nopriv_mr_register_client', 'mr_register_client');


// Création de la réservation via AJAX
function mr_create_reservation()
{
  check_ajax_referer('mr_nonce', 'nonce');

  // Champs textuels requis (compagnieAerienne et numero_dossier retirés)
  $text_fields = [
    'numero_reservation',
    'utilisateur',
    'datePriseEnCharge',
    'lieuxPriseEnCharge',
    'lieuxDestination',
    'duree',
    'typeReservation',
    // 'compagnieAerienne', // Retiré de la liste des champs requis
    'modePaiement',
    'statutReservation',
    // 'numero_dossier', // Retiré de la liste des champs requis
    'nombreBagage'
  ];

  // Champs numériques avec valeurs par défaut
  $numeric_fields = [
    'coutTransport' => 0,
    'coutMajorer' => 0,
    'distance' => 0,
    'vehicule' => 0,
    'coutTotalReservation' => 0,
    'totalAttributCost' => 0,
    'nombrePassager' => 1,
    'commission' => 10,
    'compensation' => 0,
    'coutDeVente' => 0,
  ];

  // Champs de type tableau
  $array_fields = ['destinationInputs', 'attribut', 'notes'];

  $reservation_data = [];

  // Validation des champs textuels requis
  foreach ($text_fields as $field) {
    if (isset($_POST[$field]) && !empty($_POST[$field])) {
      $reservation_data[$field] = sanitize_text_field($_POST[$field]);
    } else {
      wp_send_json_error(["message" => "Le champ $field est requis"]);
      return;
    }
  }

  // Validation du champ 'compagnieAerienne' de manière optionnelle
  if (isset($_POST['compagnieAerienne']) && !empty($_POST['compagnieAerienne'])) {
    $reservation_data['compagnieAerienne'] = sanitize_text_field($_POST['compagnieAerienne']);
  } else {
    $reservation_data['compagnieAerienne'] = null; // Ou une valeur par défaut appropriée
  }

  // Validation du champ 'numero_dossier' de manière optionnelle
  if (isset($_POST['numero_dossier']) && !empty($_POST['numero_dossier'])) {
    $reservation_data['numero_dossier'] = sanitize_text_field($_POST['numero_dossier']);
  } else {
    $reservation_data['numero_dossier'] = null; // Ou une valeur par défaut appropriée
  }

  // Validation des champs numériques avec valeurs par défaut
  foreach ($numeric_fields as $field => $default) {
    $reservation_data[$field] = isset($_POST[$field]) ? floatval($_POST[$field]) : $default;
  }

  // Validation des champs de type tableau
  foreach ($array_fields as $field) {
    if ($field === 'notes') {
      // Sanitize chaque objet dans le tableau 'notes'
      $reservation_data[$field] = array_map(function($note) {
        // Assurez-vous que chaque note est un tableau avec les clés 'type' et 'content'
        if (is_array($note) && isset($note['type']) && isset($note['content'])) {
          return [
            'type' => sanitize_text_field($note['type']),
            'content' => sanitize_textarea_field($note['content']),
          ];
        } else {
          return null; // Ou gérer différemment selon vos besoins
        }
      }, $_POST[$field] ?? []);

      // Filtrer les valeurs nulles éventuelles
      $reservation_data[$field] = array_filter($reservation_data[$field], function($note) {
        return !is_null($note);
      });
    } elseif ($field === 'attribut') {
      // Sanitize chaque objet dans le tableau 'attribut'
      $reservation_data[$field] = array_map(function($attrib) {
        // Assurez-vous que chaque attribut est un tableau avec les clés nécessaires
        if (is_array($attrib) && isset($attrib['nom_attribut']) && isset($attrib['nombre_maximum']) && isset($attrib['prix_unitaire_attribut']) && isset($attrib['quantite'])) {
          return [
            'nom_attribut' => sanitize_text_field($attrib['nom_attribut']),
            'nombre_maximum' => intval($attrib['nombre_maximum']),
            'prix_unitaire_attribut' => floatval($attrib['prix_unitaire_attribut']),
            'quantite' => intval($attrib['quantite']),
          ];
        } else {
          return null; // Ou gérer différemment selon vos besoins
        }
      }, $_POST[$field] ?? []);

      // Filtrer les valeurs nulles éventuelles
      $reservation_data[$field] = array_filter($reservation_data[$field], function($attrib) {
        return !is_null($attrib);
      });
    } else {
      // Pour les autres champs de type tableau, utilisez une sanitation basique
      $sanitization_function = 'sanitize_text_field';
      $reservation_data[$field] = array_map($sanitization_function, $_POST[$field] ?? []);
    }
  }

  // **Ajout des logs pour le débogage**
  error_log("Réservation envoyée à l'API : " . print_r($reservation_data, true));

  // Envoi de la requête de réservation
  $result = mr_send_post_request('reservations/', $reservation_data);

  // Log de la réponse brute pour analyse côté serveur
  error_log("Réponse de l'API externe : " . print_r($result, true));

  // Retour de la réponse brute sans modification
  if (isset($result['status']) && $result['status'] === 'success') {
    wp_send_json_success(['data' => $result]);
  } else {
    wp_send_json_error(['data' => $result]);
  }
}

add_action('wp_ajax_mr_create_reservation', 'mr_create_reservation');
add_action('wp_ajax_nopriv_mr_create_reservation', 'mr_create_reservation');
