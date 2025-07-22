-- Enable the pg_net extension for HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configure settings for the notification function
ALTER DATABASE postgres SET "app.settings.supabase_url" TO 'https://ktzqjzuowolzhptvxisi.supabase.co';
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0enFqenVvd29semhwdHZ4aXNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MjU0MiwiZXhwIjoyMDY4NzM4NTQyfQ.Y2_yiNlgM8KeDJUxAiMpfOQUxFLBNQQsOnV7GU_0wKE';