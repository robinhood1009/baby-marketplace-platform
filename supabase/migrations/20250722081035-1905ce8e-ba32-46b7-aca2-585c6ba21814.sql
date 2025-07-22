-- Enable the pg_net extension for HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the notification function to call the edge function directly
CREATE OR REPLACE FUNCTION send_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  should_send BOOLEAN := FALSE;
  response_id BIGINT;
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
    SELECT net.http_post(
      url := 'https://ktzqjzuowolzhptvxisi.supabase.co/functions/v1/send-notification-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0enFqenVvd29semhwdHZ4aXNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MjU0MiwiZXhwIjoyMDY4NzM4NTQyfQ.Y2_yiNlgM8KeDJUxAiMpfOQUxFLBNQQsOnV7GU_0wKE'
      ),
      body := jsonb_build_object(
        'type', notification_type,
        'record', row_to_json(NEW)
      )
    ) INTO response_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;