# Lead setup: Google Sheet, email, and Google Ads

Every quote request goes to a Google Sheet **and** your inbox at the same time. If one of them is down, the other still gets the lead. If both are down, the visitor is asked to call or text you, and the lead is written to the server log.

In production, at least one destination must be set up. Otherwise every visitor sees "We couldn't send your request." One destination is enough for a first test; you can leave the other's variables blank.

## 1. Google Sheet

1. Create a Google Sheet (e.g. "Marin Shine Co. leads").
2. Open **Extensions → Apps Script**. Replace everything in `Code.gs` with the contents of [`google-apps-script.gs`](google-apps-script.gs), then save.
3. Make a secret: run `openssl rand -hex 24` in a terminal and copy the output. No terminal? Any long random string of letters and numbers (30+ characters) works.
4. In Apps Script, open **Project Settings → Script properties → Add script property**. Name: `LEADS_SHEET_SECRET`. Value: the secret.
5. Click **Deploy → New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and approve the permissions. Google will show "Google hasn't verified this app". Because it is your own script, click **Advanced → Go to (project name) (unsafe)**, then **Allow**.
6. Copy the **Web app URL** (it ends in `/exec`).
7. Set `LEADS_SHEET_WEBHOOK_URL` to that URL and `LEADS_SHEET_SECRET` to the same secret.

If you change the script later, use **Deploy → Manage deployments → Edit → Version: New version**. Otherwise the URL keeps running the old code.

## 2. Email (Resend)

1. Sign up at resend.com and add your domain under **Domains**. Add the DNS records it shows, then wait for "Verified".
2. Create an API key under **API Keys** with sending access.
3. Set:
   - `RESEND_API_KEY`: the key
   - `LEAD_EMAIL_FROM`: e.g. `Marin Shine Co. <leads@yourdomain.com>` (must use the verified domain)
   - `LEAD_EMAIL_TO`: where leads go. Separate several addresses with commas.

Before your domain is verified, you can test with `LEAD_EMAIL_FROM="Marin Shine Co. <onboarding@resend.dev>"`, but Resend only delivers it to the email address you signed up with.

Each lead email has the customer as **Reply-To**, so pressing Reply answers them directly.

## 3. Google Ads conversions (when ads start)

Create two conversion actions in Google Ads: "Quote request" (website) and "Phone call clicks" (calls from website). Then set:

- `NEXT_PUBLIC_GOOGLE_ADS_ID`: e.g. `AW-123456789`
- `NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO`: e.g. `AW-123456789/AbCdEf` (fires only after a successful quote request)
- `NEXT_PUBLIC_GOOGLE_ADS_CALL_SEND_TO`: e.g. `AW-123456789/GhIjKl` (fires when someone taps the phone number)

`NEXT_PUBLIC_*` values are built into the page, so rebuild and redeploy after changing them.

## 4. Site address

Once the domain is live, set `NEXT_PUBLIC_SITE_URL` to the real domain including `https://` (for example `https://www.marinshine.com`). It drives canonical URLs, the sitemap, and search data. A value without `https://` makes the build fail.

## 5. Test it

1. `cp .env.example .env.local` and fill in the values.
2. `npm run dev`, open http://localhost:3000, and send a quote request with your own details.
3. Check for a new row in the Sheet's "Leads" tab and a new email in your inbox.

## 6. Before launch

- Replace every `LAUNCH-BLOCKER` in the code. `npm run launch-check` must print none.
- Use the real phone number, email, and domain.
- Configure at least one lead destination in the host's environment and test it end to end.
- Verify the Resend sending domain.
- Set the Google Ads IDs if ads will run.
- Deploy the site with HTTPS on the real domain.
- Review the privacy policy.
- File a Fictitious Business Name statement with Marin County if you trade as "Marin Shine Co." as a sole proprietor or partnership.
