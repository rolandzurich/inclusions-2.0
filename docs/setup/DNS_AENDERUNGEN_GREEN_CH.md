# 🔧 Konkrete DNS-Änderungen bei green.ch

## Übersicht: Was du ändern musst

Du hast **3 A-Records**, die aktuell auf `194.191.24.81` zeigen. Für die Umleitung der Website auf deinen Server änderst du **2 davon** auf `10.55.55.155`.

---

## ✅ ÄNDERN (Stift-Icon anklicken)

### 1. Hauptdomain (erster A-Record, NAME leer)

| Feld        | Alter Wert   | Neuer Wert   |
|------------|--------------|--------------|
| **NAME**   | (leer)       | **(leer lassen)** |
| **TTL**    | 600          | 600 (oder 3600) |
| **TYP**    | A            | A            |
| **PRIORITÄT** | (leer)     | (leer lassen) |
| **WERT**   | `194.191.24.81` | **`10.55.55.155`** |

→ Damit zeigt **inclusions.zone** auf deinen Server.

---

### 2. Wildcard (zweiter A-Record, NAME = *)

| Feld        | Alter Wert   | Neuer Wert   |
|------------|--------------|--------------|
| **NAME**   | `*`          | **`*`** (lassen) |
| **TTL**    | 600          | 600 (oder 3600) |
| **TYP**    | A            | A            |
| **PRIORITÄT** | (leer)     | (leer lassen) |
| **WERT**   | `194.191.24.81` | **`10.55.55.155`** |

→ Damit zeigen **www.inclusions.zone** und alle anderen Subdomains auf deinen Server.

---

## ⚠️ NICHT ÄNDERN (oder nur, wenn du weisst was du tust)

### 3. mail-in (dritter A-Record)

| Feld  | Wert             | Aktion |
|-------|------------------|--------|
| **NAME**   | `mail-in`   | **nicht ändern** |
| **WERT**   | `194.191.24.81` | **nicht ändern** |

→ `mail-in` ist typischerweise für E-Mail (Postfächer). Wenn du das auf `10.55.55.155` umstellst, kann E-Mail-Empfang (z.B. für @inclusions.zone) brechen.  
**Empfehlung:** Erstmal so lassen. Nur ändern, wenn du E-Mail bewusst auf den neuen Server umziehen willst.

---

## 📋 Kurz-Checkliste

1. **[ ]** Ersten A-Record (NAME leer) bearbeiten → **WERT:** `10.55.55.155`
2. **[ ]** Zweiten A-Record (NAME = `*`) bearbeiten → **WERT:** `10.55.55.155`
3. **[ ]** A-Record `mail-in` unverändert lassen (WERT bleibt `194.191.24.81`)

---

## 🕐 Nach dem Speichern

- DNS-Propagierung: meist 15–60 Minuten.
- Prüfen: https://dnschecker.org/#A/inclusions.zone → sollte `10.55.55.155` zeigen.
- Test: **http://inclusions.zone** und **http://www.inclusions.zone** sollten deine Seite anzeigen.

---

## 📧 MX-, CNAME- und TXT-Records

**Nicht anpassen:**  
MX, CNAME (`autoconfig`, `autodiscover`), TXT (SPF, DKIM, DMARC, `resend._domainkey`) so lassen. Die brauchst du für E-Mail und Resend.

 Nur die **WERT**-Felder der zwei A-Records (leer und `*`) auf **`10.55.55.155`** stellen.
