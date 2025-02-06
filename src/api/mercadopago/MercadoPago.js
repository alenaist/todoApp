export async function createPaymentPreference(user) {
    try {
      const preference = {
        items: [
          {
            title: 'Suscripción Mensual',
            unit_price: 5000,
            quantity: 1,
            currency_id: 'ARS' // Moneda en pesos argentinos
          }
        ],
        // URLs de retorno después del pago
        back_urls: {
          success: 'https://tuapp.com/payment/success',
          failure: 'https://tuapp.com/payment/failure',
          pending: 'https://tuapp.com/payment/pending'
        },
        auto_return: 'approved', // Retorno automático si el pago es aprobado
        
        // Información adicional para identificar el usuario
        external_reference: user.id.toString()
      };
  
      // Crear la preferencia de pago
      const response = await mercadopago.preferences.create(preference);
      
      // URL de pago para redirigir al usuario
      return response.body.init_point;
    } catch (error) {
      console.error('Error creating payment preference:', error);
      throw error;
    }
  }

  export async function handleWebhook(req, res) {
    const { body } = req;
    
    // Verificar tipo de notificación
    if (body.type === 'payment') {
      try {
        // Obtener detalles del pago
        const payment = await mercadopago.payment.findById(body.data.id);
        
        // Verificar estado del pago
        if (payment.body.status === 'approved') {
          // Obtener ID de usuario desde external_reference
          const userId = payment.body.external_reference;
          
          // Actualizar estado de suscripción en tu base de datos
          await updateUserSubscription(userId, {
            status: 'active',
            paymentId: payment.body.id
          });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
      }
    }
    
    res.sendStatus(200);
  }