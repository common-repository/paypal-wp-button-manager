<?php

/**
 * This class defines all code necessary to button generator interface
 * @class       AngellEYE_PayPal_WP_Button_Manager_button_interface
 * @version	1.0.0
 * @package		paypal-wp-button-manager/includes
 * @category	Class
 * @author      Angell EYE <service@angelleye.com>
 */
class AngellEYE_PayPal_WP_Button_Manager_button_generator {

    /**
     * Hook in methods
     * @since    0.1.0
     * @access   static
     */
    public static function init() {
        global $post, $post_ID;

        add_action('paypal_wp_button_manager_button_generator', array(__CLASS__, 'paypal_wp_button_manager_button_interface_generator'));
    }

    public static function paypal_wp_button_manager_button_interface_generator() {

        // Create PayPal object.
        global $post, $post_ID, $wpdb;
        $payapal_helper = new AngellEYE_PayPal_WP_Button_Manager_PayPal_Helper();
        $PayPalConfig = $payapal_helper->paypal_wp_button_manager_get_paypalconfig();
        $PayPal = new Angelleye_PayPal($PayPalConfig);
        $paypal_buttontype = $payapal_helper->paypal_wp_button_manager_get_button_type();
        $BMButtonVars = array();
        $BMButtonVars = $payapal_helper->paypal_wp_button_manager_get_buttonvars();
        $PayPalRequestData = $payapal_helper->paypal_wp_button_manager_get_dropdown_values();

        $PayPalResult = $PayPal->BMCreateButton($PayPalRequestData);

        // Write the contents of the response array to the screen for demo purposes.
        if (isset($PayPalResult['ERRORS']) && !empty($PayPalResult['ERRORS'])) {
            global $post, $post_ID;
            $paypal_wp_button_manager_notice = get_option('paypal_wp_button_manager_notice');
            $notice[$post_ID] = $PayPalResult['ERRORS'][0]['L_LONGMESSAGE'];
            $notice_code[$post_ID] = $PayPalResult['ERRORS'][0]['L_ERRORCODE'];            
            if($PayPalResult['ERRORS'][0]['L_ERRORCODE'] == '10002'){
                $notice[$post_ID] = __('PayPal API Credentials are Incorrect.','paypal-wp-button-manager');
            }
            $PayPalRequest = isset($PayPalResult['RAWREQUEST']) ? $PayPalResult['RAWREQUEST'] : '';
            $PayPalResponse = isset($PayPalResult['RAWRESPONSE']) ? $PayPalResult['RAWRESPONSE'] : '';

            $PayPalResult['RAWREQUEST'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalRequest));
            $PayPalResult['RAWRESPONSE'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalResponse));
            
            self::paypal_wp_button_manager_write_error_log($PayPalResult);
            update_option('paypal_wp_button_manager_notice', $notice);
            update_option('paypal_wp_button_manager_error_code', $notice_code);
            update_post_meta($post_ID, 'paypal_wp_button_manager_success_notice', '');
            delete_option('paypal_wp_button_manager_timeout_notice');

            // Update the post into the database
            unset($_POST);
            unset($post);
        } else if ($PayPalResult['RAWRESPONSE'] == false) {
            global $post, $post_ID;
            $timeout_notice[$post_ID] = __('Internal server error occured','paypal-wp-button-manager');
            update_option('paypal_wp_button_manager_timeout_notice', $timeout_notice);
            
            $PayPalRequest = isset($PayPalResult['RAWREQUEST']) ? $PayPalResult['RAWREQUEST'] : '';
            $PayPalResponse = isset($PayPalResult['RAWRESPONSE']) ? $PayPalResult['RAWRESPONSE'] : '';

            $PayPalResult['RAWREQUEST'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalRequest));
            $PayPalResult['RAWRESPONSE'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalResponse));
                    
            self::paypal_wp_button_manager_write_error_log($PayPalResult);
            update_post_meta($post_ID, 'paypal_wp_button_manager_success_notice', '');

            delete_option('paypal_wp_button_manager_notice');
            delete_option('paypal_wp_button_manager_error_code');



            unset($_POST);
            unset($post);
        } else if (isset($PayPalResult['WEBSITECODE']) && !empty($PayPalResult['WEBSITECODE'])) {
            global $post, $post_ID;
            global $wp;
            update_post_meta($post_ID, 'paypal_button_response', $PayPalResult['WEBSITECODE']);
            
            $PayPalRequest = isset($PayPalResult['RAWREQUEST']) ? $PayPalResult['RAWREQUEST'] : '';
            $PayPalResponse = isset($PayPalResult['RAWRESPONSE']) ? $PayPalResult['RAWRESPONSE'] : '';

            $PayPalResult['RAWREQUEST'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalRequest));
            $PayPalResult['RAWRESPONSE'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalResponse));
            
            self::paypal_wp_button_manager_write_error_log($PayPalResult);
            update_post_meta($post_ID, 'paypal_wp_button_manager_success_notice', 'Button Created Successfully.');
            delete_option('paypal_wp_button_manager_notice');
            delete_option('paypal_wp_button_manager_error_code');
            delete_option('paypal_wp_button_manager_timeout_notice');

            if (isset($PayPalResult['HOSTEDBUTTONID']) && !empty($PayPalResult['HOSTEDBUTTONID'])) {
                update_post_meta($post_ID, 'paypal_wp_button_manager_button_id', $PayPalResult['HOSTEDBUTTONID']);
            }
            if (isset($_POST['ddl_companyname']) && !empty($_POST['ddl_companyname'])) {
                update_post_meta($post_ID, 'paypal_wp_button_manager_company_rel', sanitize_key($_POST['ddl_companyname']));
            }
            if (isset($PayPalResult['EMAILLINK']) && !empty($PayPalResult['EMAILLINK'])) {
                update_post_meta($post_ID, 'paypal_wp_button_manager_email_link', $PayPalResult['EMAILLINK']);
            }
            $btn_shopping = isset($_POST['button_type']) ? sanitize_key($_POST['button_type']) : '';

            if (isset($btn_shopping) && $btn_shopping == 'products') {
                $button_post_status = 'shopping_cart';
            } else if (isset($btn_shopping) && $btn_shopping == 'services') {
                $button_post_status = 'buy_now';
            } else if (isset($btn_shopping) && $btn_shopping == 'donations') {
                $button_post_status = 'donations';
            } else if (isset($btn_shopping) && $btn_shopping == 'gift_certs') {
                $button_post_status = 'gift_certificates';
            } else if (isset($btn_shopping) && $btn_shopping == 'subscriptions') {
                $button_post_status = 'subscriptions';
            } else {
                $button_post_status = "Other";
            }

            $button_post_status_ucfirst = ucfirst(str_replace('_', ' ', $button_post_status));
            $term = term_exists($button_post_status_ucfirst, 'paypal_button_types');

            if ($term !== 0 && $term !== null) {
                
            } else {

                $term = wp_insert_term($button_post_status_ucfirst, 'paypal_button_types', array('slug' => $button_post_status));
            }

            $tag[] = $term['term_id'];

            $update_term = wp_set_post_terms($post_ID, $tag, 'paypal_button_types');

            if (isset($btn_shopping) && $btn_shopping == 'products') {
                if (isset($_POST['ddl_companyname']) && !empty($_POST['ddl_companyname'])) {

                    $postmeta_table = $wpdb->prefix . "postmeta";
                    $is_viewcart_created_for_cid = $wpdb->get_row("SELECT COUNT(*)as cnt_cid from  $postmeta_table where meta_key='paypal_wp_button_manager_viewcart_button_companyid' and meta_value='".sanitize_key($_POST['ddl_companyname'])."'");
                    $total_viewcart_for_cid = $is_viewcart_created_for_cid->cnt_cid;

                    $companies_name = $wpdb->prefix . 'paypal_wp_button_manager_companies';

                    $company_name = $wpdb->get_row("SELECT *from  $companies_name where ID='".sanitize_key($_POST['ddl_companyname'])."'");
                    if (isset($company_name->title) && !empty($company_name->title)) {
                        $cname = $company_name->title;
                    }

                    if (isset($total_viewcart_for_cid) && empty($total_viewcart_for_cid)) {

                        if ($total_viewcart_for_cid <= 0) {
                            $BMCreateButtonFields_viewcart = array
                                (
                                'buttoncode' => 'CLEARTEXT', // The kind of button code to create.  It is one of the following values:  HOSTED, ENCRYPTED, CLEARTEXT, TOKEN
                                'buttontype' => 'VIEWCART', // Required.  The kind of button you want to create.  It is one of the following values:  BUYNOW, CART, GIFTCERTIFICATE, SUBSCRIBE, DONATE, UNSUBSCRIBE, VIEWCART, PAYMENTPLAN, AUTOBILLING, PAYMENT
                                'buttonsubtype' => '', // The use of button you want to create.  Values are:  PRODUCTS, SERVICES
                            );


                            $PayPalRequestData_viewcart = array(
                                'BMCreateButtonFields' => $BMCreateButtonFields_viewcart,
                                'BMButtonVars' => ''
                            );

                            $PayPalResult_viewcart = $PayPal->BMCreateButton($PayPalRequestData_viewcart);

                            if (isset($PayPalResult_viewcart['WEBSITECODE']) && !empty($PayPalResult_viewcart['WEBSITECODE'])) {
                                // Create post object
                                $view_cart_post = array(
                                    'post_title' => __('View Cart - ','paypal-wp-button-manager') . $cname,
                                    'post_content' => $PayPalResult_viewcart['WEBSITECODE'],
                                    'post_status' => 'publish',
                                    'post_author' => 1,
                                    'post_type' => 'paypal_buttons'
                                );

                                // Insert the post into the database
                                $post_id = wp_insert_post($view_cart_post);
                                $term = term_exists('Shopping cart', 'paypal_button_types');
                                $tag[] = $term['term_id'];

                                $update_term = wp_set_post_terms($post_id, $tag, 'paypal_button_types');

                                update_post_meta($post_id, 'paypal_button_response', $PayPalResult_viewcart['WEBSITECODE']);
                                update_post_meta($post_id, 'paypal_wp_button_manager_viewcart_button_companyid', sanitize_key($_POST['ddl_companyname']));
                                
                                $PayPalRequest = isset($PayPalResult_viewcart['RAWREQUEST']) ? $PayPalResult_viewcart['RAWREQUEST'] : '';
                                $PayPalResponse = isset($PayPalResult_viewcart['RAWRESPONSE']) ? $PayPalResult_viewcart['RAWRESPONSE'] : '';

                                $PayPalResult_viewcart['RAWREQUEST'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalRequest));
                                $PayPalResult_viewcart['RAWRESPONSE'] = $PayPal->NVPToArray($PayPal->MaskAPIResult($PayPalResponse));
                                
                                self::paypal_wp_button_manager_write_error_log($PayPalResult_viewcart);
                            }
                        }
                    }
                }
            }
            
             if (isset($PayPalResult['HOSTEDBUTTONID']) && !empty($PayPalResult['HOSTEDBUTTONID'])) {
                 if ((isset($_POST['enable_inventory']) && !empty($_POST['enable_inventory'])) || (isset($_POST['enable_profit_and_loss']) && !empty($_POST['enable_profit_and_loss']))) {
                     $PayPalRequestData_Inventory = $payapal_helper->paypal_wp_button_manager_set_inventory();
                     $PayPalSet_InventoryResult = $PayPal->BMSetInventory($PayPalRequestData_Inventory);
                     self::paypal_wp_button_manager_write_error_log($PayPalSet_InventoryResult);
                     if (isset($PayPalSet_InventoryResult['ERRORS']) && !empty($PayPalSet_InventoryResult['ERRORS'])) {
                         global $post, $post_ID;
                         $paypal_wp_button_manager_notice = get_option('paypal_wp_button_manager_notice');
                         $notice[$post_ID] = $PayPalSet_InventoryResult['ERRORS'][0]['L_LONGMESSAGE'];
                         $notice_code[$post_ID] = $PayPalSet_InventoryResult['ERRORS'][0]['L_ERRORCODE'];
                         update_option('paypal_wp_button_manager_notice', $notice);
                         update_option('paypal_wp_button_manager_error_code', $notice_code);
                         update_post_meta($post_ID, 'paypal_wp_button_manager_success_notice', '');
                         delete_option('paypal_wp_button_manager_timeout_notice');
                     }
                 }
             }
 
            unset($post);
            unset($_POST);
        }
    }

    /**
     * This function is for write log in error log folder
     * @param type $error The error returns the string of a error.
     */
    public static function paypal_wp_button_manager_write_error_log($error) {
        $debug = (get_option('log_enable_button_manager') == 'yes') ? 'yes' : 'no';
        if ('yes' == $debug) {
            $log_write = new AngellEYE_PayPal_WP_Button_Manager_Logger();
        }

        if ('yes' == $debug) {
            $log_write->add('paypal_wp_button_manager', 'PayPal WP Button Manager response: ' . print_r($error, true));
        }
    }

}

AngellEYE_PayPal_WP_Button_Manager_button_generator::init();