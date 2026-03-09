// Templates email LOCAGAME — 100% inline CSS (compatible clients email)

export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LOCAGAME</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;
                         letter-spacing:2px;">LOCAGAME</h1>
              <p style="color:#a0a0b0;margin:8px 0 0;font-size:13px;">
                Location de jeux et animations pour vos événements
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f9;padding:24px 40px;
                       border-top:1px solid #e5e5e7;text-align:center;">
              <p style="color:#6b6b80;font-size:12px;margin:0;">
                &copy; 2025 LOCAGAME &mdash;
                <a href="https://locagame.fr/cgv" style="color:#6b6b80;">CGV</a> &middot;
                <a href="https://locagame.fr/confidentialite" style="color:#6b6b80;">
                  Confidentialit&eacute;
                </a>
              </p>
              <p style="color:#9b9baa;font-size:11px;margin:8px 0 0;">
                Vous recevez cet email car vous avez effectu&eacute; une action sur locagame.fr
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Confirmation de réservation ─────────────────────────────────────────────

export const reservationConfirmationTemplate = (data: {
  customerName: string;
  reservationNumber: string;
  eventDate: string;
  eventAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  reservationUrl: string;
}) =>
  baseTemplate(`
  <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">
    Votre r&eacute;servation est confirm&eacute;e !
  </h2>
  <p style="color:#4a4a5a;margin:0 0 32px;font-size:15px;">
    Bonjour ${data.customerName}, votre paiement a bien &eacute;t&eacute; re&ccedil;u.
  </p>

  <!-- Numéro de réservation -->
  <div style="background:#f0f0ff;border-left:4px solid #1a1a2e;
              padding:16px 20px;border-radius:4px;margin-bottom:32px;">
    <p style="margin:0;color:#6b6b80;font-size:12px;text-transform:uppercase;
              letter-spacing:1px;">Num&eacute;ro de r&eacute;servation</p>
    <p style="margin:4px 0 0;color:#1a1a2e;font-size:20px;font-weight:bold;">
      #${data.reservationNumber}
    </p>
  </div>

  <!-- Détails événement -->
  <h3 style="color:#1a1a2e;font-size:14px;text-transform:uppercase;
             letter-spacing:1px;margin:0 0 16px;">Votre &eacute;v&eacute;nement</h3>
  <table width="100%" cellpadding="0" cellspacing="0"
         style="margin-bottom:32px;border:1px solid #e5e5e7;border-radius:6px;">
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e5e7;">
        <span style="color:#6b6b80;font-size:13px;">Date</span><br>
        <span style="color:#1a1a2e;font-size:14px;font-weight:600;">
          ${data.eventDate}
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 16px;">
        <span style="color:#6b6b80;font-size:13px;">Adresse de livraison</span><br>
        <span style="color:#1a1a2e;font-size:14px;font-weight:600;">
          ${data.eventAddress}
        </span>
      </td>
    </tr>
  </table>

  <!-- Articles -->
  <h3 style="color:#1a1a2e;font-size:14px;text-transform:uppercase;
             letter-spacing:1px;margin:0 0 16px;">Articles r&eacute;serv&eacute;s</h3>
  <table width="100%" cellpadding="0" cellspacing="0"
         style="margin-bottom:24px;border:1px solid #e5e5e7;border-radius:6px;">
    ${data.items
      .map(
        (item, i) => `
    <tr style="border-bottom:${i < data.items.length - 1 ? '1px solid #e5e5e7' : 'none'}">
      <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;">
        ${item.name} &times; ${item.quantity}
      </td>
      <td style="padding:12px 16px;text-align:right;color:#1a1a2e;
                 font-size:14px;font-weight:600;">
        ${item.price.toFixed(2)} &euro;
      </td>
    </tr>`
      )
      .join('')}
    <tr style="background:#f8f8f9;">
      <td style="padding:14px 16px;color:#1a1a2e;font-weight:bold;font-size:15px;">
        Total pay&eacute;
      </td>
      <td style="padding:14px 16px;text-align:right;color:#1a1a2e;
                 font-weight:bold;font-size:18px;">
        ${data.totalAmount.toFixed(2)} &euro;
      </td>
    </tr>
  </table>

  <!-- CTA -->
  <div style="text-align:center;margin-top:32px;">
    <a href="${data.reservationUrl}"
       style="background-color:#1a1a2e;color:#ffffff;padding:14px 32px;
              border-radius:6px;text-decoration:none;font-size:15px;
              font-weight:600;display:inline-block;">
      Voir ma r&eacute;servation
    </a>
  </div>

  <p style="color:#6b6b80;font-size:13px;margin-top:32px;text-align:center;">
    Une question ? Contactez-nous &agrave;
    <a href="mailto:contact@locagame.fr" style="color:#1a1a2e;">
      contact@locagame.fr
    </a>
  </p>
`);

// ─── Bienvenue (inscription) ─────────────────────────────────────────────────

export const welcomeTemplate = (data: {
  customerName: string;
  loginUrl: string;
}) =>
  baseTemplate(`
  <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">
    Bienvenue sur LOCAGAME !
  </h2>
  <p style="color:#4a4a5a;margin:0 0 32px;font-size:15px;">
    Bonjour ${data.customerName}, votre compte a bien &eacute;t&eacute; cr&eacute;&eacute;.
  </p>
  <p style="color:#4a4a5a;font-size:15px;line-height:1.6;">
    Vous pouvez d&egrave;s maintenant explorer notre catalogue et r&eacute;server
    vos animations pour vos &eacute;v&eacute;nements.
  </p>
  <div style="text-align:center;margin-top:32px;">
    <a href="${data.loginUrl}"
       style="background-color:#1a1a2e;color:#ffffff;padding:14px 32px;
              border-radius:6px;text-decoration:none;font-size:15px;
              font-weight:600;display:inline-block;">
      Acc&eacute;der &agrave; mon espace
    </a>
  </div>
`);

// ─── Réinitialisation de mot de passe ────────────────────────────────────────

export const resetPasswordTemplate = (data: { resetUrl: string }) =>
  baseTemplate(`
  <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">
    R&eacute;initialisation de mot de passe
  </h2>
  <p style="color:#4a4a5a;margin:0 0 32px;font-size:15px;">
    Vous avez demand&eacute; &agrave; r&eacute;initialiser votre mot de passe.
    Cliquez sur le bouton ci-dessous (valable 1 heure).
  </p>
  <div style="text-align:center;">
    <a href="${data.resetUrl}"
       style="background-color:#1a1a2e;color:#ffffff;padding:14px 32px;
              border-radius:6px;text-decoration:none;font-size:15px;
              font-weight:600;display:inline-block;">
      R&eacute;initialiser mon mot de passe
    </a>
  </div>
  <p style="color:#9b9baa;font-size:12px;margin-top:24px;text-align:center;">
    Si vous n'&ecirc;tes pas &agrave; l'origine de cette demande, ignorez cet email.
  </p>
`);

// ─── Bienvenue technicien (accès créés par admin) ───────────────────────────

export const technicianWelcomeTemplate = (data: {
  firstName: string;
  email: string;
  password: string;
  loginUrl: string;
}) =>
  baseTemplate(`
  <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">
    Bienvenue dans l'&eacute;quipe LOCAGAME &#x1F44B;
  </h2>
  <p style="color:#4a4a5a;margin:0 0 32px;font-size:15px;">
    Bonjour ${data.firstName}, voici vos acc&egrave;s &agrave; l'interface technicien.
  </p>

  <div style="background:#f0f0ff;border-left:4px solid #1a1a2e;
              padding:20px 24px;border-radius:4px;margin-bottom:32px;">
    <p style="margin:0 0 12px;color:#6b6b80;font-size:12px;
              text-transform:uppercase;letter-spacing:1px;">
      Vos identifiants de connexion
    </p>
    <p style="margin:0 0 8px;color:#1a1a2e;font-size:15px;">
      &#x1F4E7; <strong>Email :</strong> ${data.email}
    </p>
    <p style="margin:0;color:#1a1a2e;font-size:15px;">
      &#x1F511; <strong>Mot de passe :</strong>
      <code style="background:#e8e8f0;padding:2px 8px;border-radius:4px;">
        ${data.password}
      </code>
    </p>
  </div>

  <p style="color:#e05a2b;font-size:13px;margin-bottom:32px;">
    &#x26A0;&#xFE0F; Pensez &agrave; changer votre mot de passe apr&egrave;s votre premi&egrave;re connexion.
  </p>

  <div style="text-align:center;">
    <a href="${data.loginUrl}"
       style="background-color:#1a1a2e;color:#ffffff;padding:14px 32px;
              border-radius:6px;text-decoration:none;font-size:15px;
              font-weight:600;display:inline-block;">
      Acc&eacute;der &agrave; mon espace
    </a>
  </div>
`);
