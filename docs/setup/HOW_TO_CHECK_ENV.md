# Prüfung der .env Datei auf dem Server

## Option 1: Via SSH direkt prüfen
```bash
ssh incluzone@10.55.55.155
cd ~/inclusions-2.0
cat .env
```

Du solltest sehen:
- NEXT_PUBLIC_SITE_URL=http://10.55.55.155
- RESEND_API_KEY=re_an8y4Hrw_J5bcb33jndu9cb2avtyd87vB
- RESEND_FROM_EMAIL=noreply@inclusions.zone
- RESEND_ADMIN_EMAIL=info@inclusions.zone
- GEMINI_API_KEY=AIzaSyBzJoEimC2cpaNIibF103zrZaPSFWZWdWg

## Option 2: Nur Keys prüfen
```bash
ssh incluzone@10.55.55.155 "cd ~/inclusions-2.0 && grep -E 'RESEND_API_KEY|GEMINI_API_KEY' .env"
```

## Option 3: Ich prüfe es für dich
Sag einfach Bescheid, wenn du die Datei kopiert hast, dann prüfe ich es automatisch.
