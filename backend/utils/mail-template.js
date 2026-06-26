// mail-template.js
// Template HTML minimalista para los emails de LoL Hub.

const APP_NAME = "LoL Hub";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildMailHtml({
  title,
  preview,
  content,
  buttonText,
  buttonUrl,
  logoUrl,
  variant = "default",
}) {
  const themes = {
    default: {
      accent: "#c8aa6e",
      badge: "Cuenta",
    },
    welcome: {
      accent: "#c8aa6e",
      badge: "Bienvenida",
    },
    reset: {
      accent: "#7bb7ff",
      badge: "Seguridad",
    },
    password: {
      accent: "#c8aa6e",
      badge: "Contraseña",
    },
    danger: {
      accent: "#ff9b9b",
      badge: "Cuenta",
    },
  };

  const theme = themes[variant] || themes.default;

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f1e8;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preview)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f1e8;padding:34px 14px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #ddd2b8;">
            <tr>
              <td align="center" style="padding:34px 28px 26px;background:#10141f;">
                <img
                  src="${logoUrl}"
                  alt="${APP_NAME}"
                  width="72"
                  style="display:block;width:72px;height:auto;margin:0 auto 18px;border-radius:16px;"
                />

                <div style="display:inline-block;margin-bottom:14px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.08);color:${theme.accent};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                  ${escapeHtml(theme.badge)}
                </div>

                <h1 style="margin:0;color:${theme.accent};font-size:28px;line-height:1.15;font-weight:800;">
                  ${escapeHtml(title)}
                </h1>

                <p style="margin:12px 0 0;color:#d8d0bd;font-size:15px;line-height:1.5;">
                  ${escapeHtml(preview)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 30px 10px;background:#ffffff;color:#242424;font-size:16px;line-height:1.65;">
                ${content}

                ${
                  buttonText && buttonUrl
                    ? `
                      <div style="text-align:center;margin:30px 0 18px;">
                        <a
                          href="${buttonUrl}"
                          target="_blank"
                          style="display:inline-block;background:#10141f;color:#f4d27a;text-decoration:none;font-weight:800;padding:14px 24px;border-radius:12px;"
                        >
                          ${escapeHtml(buttonText)}
                        </a>
                      </div>
                    `
                    : ""
                }
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 26px;background:#faf8f2;border-top:1px solid #eadfca;">
                <p style="margin:0 0 7px;color:#6f6657;font-size:13px;line-height:1.5;">
                  Este mensaje fue enviado automaticamente por <strong>${APP_NAME}</strong>.
                </p>

                <p style="margin:0;color:#9b927f;font-size:12px;line-height:1.45;">
                  Proyecto fan-made no afiliado con Riot Games.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:18px 0 0;color:#958b78;font-size:12px;">
            © ${new Date().getFullYear()} ${APP_NAME}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}