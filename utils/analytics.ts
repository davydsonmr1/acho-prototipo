interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled = true;

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date()
    };

    this.events.push(event);
    
    // Em produção, enviar para serviço de analytics
    console.log('Analytics Event:', event);
    
    // Limitar eventos armazenados localmente
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
  }

  // Eventos específicos do app
  trackScreenView(screenName: string) {
    this.track('screen_view', { screen_name: screenName });
  }

  trackUserAction(action: string, context?: Record<string, any>) {
    this.track('user_action', { action, ...context });
  }

  trackPurchase(orderId: string, value: number, items: any[]) {
    this.track('purchase', {
      order_id: orderId,
      value,
      items_count: items.length,
      currency: 'BRL'
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = new Analytics();