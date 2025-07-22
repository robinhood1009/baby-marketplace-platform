-- Create function to send notification emails via edge function
CREATE OR REPLACE FUNCTION send_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  should_send BOOLEAN := FALSE;
BEGIN
  -- Determine notification type and whether to send
  IF TG_TABLE_NAME = 'offers' THEN
    IF TG_OP = 'INSERT' THEN
      notification_type := 'offer.inserted';
      should_send := TRUE;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
      notification_type := 'offer.updated';
      should_send := TRUE;
    END IF;
  ELSIF TG_TABLE_NAME = 'ads' THEN
    IF TG_OP = 'UPDATE' AND OLD.paid = FALSE AND NEW.paid = TRUE THEN
      notification_type := 'ad.updated';
      should_send := TRUE;
    END IF;
  END IF;
  
  -- Send notification if conditions are met
  IF should_send THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', notification_type,
        'record', row_to_json(NEW)
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for offers table
CREATE TRIGGER trigger_send_offer_emails
  AFTER INSERT OR UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION send_notification_email();

-- Create trigger for ads table
CREATE TRIGGER trigger_send_ad_emails
  AFTER UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION send_notification_email();