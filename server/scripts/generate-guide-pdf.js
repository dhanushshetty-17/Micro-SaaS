const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(__dirname, "..", "..", "Freelancer-Invoice-Tracker-Setup-Guide.pdf");
const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const colors = { ink: "#17202A", muted: "#52606D", accent: "#0B7285", code: "#F1F5F9" };
const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function title(text) {
  doc.fillColor(colors.accent).font("Helvetica-Bold").fontSize(22).text(text);
  doc.moveDown(0.35);
}

function heading(text) {
  doc.moveDown(0.8).fillColor(colors.ink).font("Helvetica-Bold").fontSize(15).text(text);
  doc.moveDown(0.25);
}

function paragraph(text) {
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10.5).text(text, {
    width: pageWidth,
    lineGap: 3,
    paragraphGap: 5,
  });
}

function bullet(text) {
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10.5).text(`- ${text}`, {
    width: pageWidth - 12,
    indent: 12,
    lineGap: 2,
  });
}

function code(text) {
  const height = doc.heightOfString(text, { width: pageWidth - 20, lineGap: 2 }) + 16;
  doc.fillColor(colors.code).roundedRect(doc.x, doc.y, pageWidth, height, 4).fill();
  doc.fillColor(colors.ink).font("Courier").fontSize(8.5).text(text, doc.x + 10, doc.y + 8, {
    width: pageWidth - 20,
    lineGap: 2,
  });
  doc.moveDown(0.5);
}

function numbered(number, text) {
  doc.fillColor(colors.muted).font("Helvetica").fontSize(10.5).text(`${number}. ${text}`, {
    width: pageWidth - 12,
    indent: 12,
    lineGap: 2,
  });
}

// Cover and overview
title("Freelancer Invoice Tracker");
doc.fillColor(colors.ink).font("Helvetica-Bold").fontSize(18).text("Setup, Usage, Stripe, Docker and Deployment Guide");
doc.moveDown();
paragraph("This guide explains how to run the existing project from a clean Windows computer, configure environment variables, use every major feature, test Stripe payments, use Docker, and check deployment readiness.");
heading("What the project contains");
bullet("Next.js frontend: the website users open in their browser.");
bullet("Express backend: authentication, invoice operations, PDF generation, email, analytics and Stripe integration.");
bullet("PostgreSQL: stores users and invoices.");
bullet("Docker Compose: starts PostgreSQL, the backend and frontend together.");
heading("Prerequisites");
bullet("Node.js 20 or newer");
bullet("Docker Desktop with the Linux engine running");
bullet("A Stripe account for test payments");
bullet("Stripe CLI for local webhook testing");
code("node --version\nnpm --version\ndocker --version\ndocker compose version\nstripe --version");
paragraph("Version commands print installed versions. If a command is not recognized, install that tool or add it to the Windows PATH.");

// Environment
doc.addPage();
title("1. Configure the environment");
paragraph("Environment variables are settings supplied outside the source code. Secrets such as passwords and API keys belong in .env, not in GitHub or JavaScript files.");
heading("Create the Docker environment file");
code("Set-Location D:\\Micro-SaaS\nCopy-Item .env.example .env\nnotepad .env");
paragraph("Set-Location moves PowerShell into the project folder. Copy-Item creates your private .env from the safe template. notepad opens it for editing.");
heading("Required .env values");
code("DB_NAME=micro_saas\nDB_USER=postgres\nDB_PASSWORD=choose_a_strong_password\nDB_PORT=5432\n\nJWT_SECRET=choose_a_long_random_secret\nCLIENT_URL=http://localhost:3000\nNEXT_PUBLIC_API_URL=http://localhost:5000\nPORT=5000");
paragraph("DB_* values tell the backend how to connect to PostgreSQL. JWT_SECRET signs login tokens. CLIENT_URL controls allowed browser requests and Stripe redirects. NEXT_PUBLIC_API_URL tells browser code where the API is located. PORT selects the backend port.");
heading("Generate a JWT secret");
code("[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))");
paragraph("Copy the generated value into JWT_SECRET. A JWT is a signed login token. The server uses this secret to detect modified or forged tokens.");
heading("Optional integrations");
code("STRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\nEMAIL_USER=\nEMAIL_APP_PASSWORD=\nEMAIL_FROM=");
paragraph("Leave these blank until you configure Stripe and email. Never put STRIPE_SECRET_KEY or an email password in a NEXT_PUBLIC_ variable.");

// Docker
doc.addPage();
title("2. Start the project with Docker");
paragraph("Docker packages software into containers. A container is an isolated process with the files and dependencies needed by one service. Docker Compose coordinates the three services in this project.");
heading("Start PostgreSQL");
code("docker compose up -d db\ndocker compose ps");
paragraph("up creates and starts services. -d runs them in the background. db starts only PostgreSQL. ps shows service status; the database should become healthy.");
heading("Create the database tables");
code("docker compose run --rm server npm run migrate");
paragraph("A migration is a versioned database change. This command creates the users, invoices and schema_migrations tables inside a transaction. --rm removes the temporary migration container afterward.");
heading("Start the complete application");
code("docker compose up --build");
paragraph("--build rebuilds images when source code or dependencies change. The frontend is available at http://localhost:3000 and the backend at http://localhost:5000.");
heading("Useful Docker commands");
code("docker compose logs -f server\ndocker compose logs -f db\ndocker compose down");
paragraph("logs displays service output, -f follows new output, and down stops containers while preserving the named PostgreSQL volume. Avoid docker compose down -v unless you intentionally want to delete local database data.");

// Features
doc.addPage();
title("3. Use the application");
numbered(1, "Open http://localhost:3000/register and create an account.");
numbered(2, "Open the login page and sign in. The frontend receives a JWT token and sends it with protected API requests.");
numbered(3, "Choose Create Invoice, enter client details, description, amount and due date, then submit.");
numbered(4, "Use the dashboard to see total invoices, pending invoices, paid invoices and paid revenue.");
numbered(5, "Use Edit to change invoice details. The API checks the logged-in user before allowing the change.");
numbered(6, "Use Mark as Paid for a manual status update.");
numbered(7, "Use Download PDF to generate and download an invoice PDF.");
numbered(8, "Use Send Email after configuring SMTP values. The email contains the invoice PDF attachment.");
numbered(9, "Use Pay Now after configuring Stripe. Stripe Checkout handles the payment page.");
heading("Why ownership checks matter");
paragraph("The backend gets the user ID from the verified JWT and includes it in database queries. This prevents a user from changing an invoice ID in the browser and accessing another user's invoice.");
heading("Configure Gmail email delivery");
paragraph("Google requires two-step verification before creating an App Password. In your Google Account, open Security, enable two-step verification, open App passwords, create one for this project, and copy the generated password into EMAIL_APP_PASSWORD.");
code("EMAIL_USER=your_email@gmail.com\nEMAIL_APP_PASSWORD=the_generated_app_password\nEMAIL_FROM=your_email@gmail.com");
paragraph("Restart the backend after changing .env. Use an SMTP provider suitable for production rather than relying on a personal Gmail account for high volume.");

// Stripe
doc.addPage();
title("4. Test Stripe payments");
paragraph("Stripe Checkout is the hosted payment page. A webhook is a signed server-to-server request from Stripe. The webhook is the reliable payment notification; a browser redirect alone is not proof of payment.");
heading("Get Stripe test keys");
numbered(1, "Create or open a Stripe account at https://dashboard.stripe.com.");
numbered(2, "Enable Test mode.");
numbered(3, "Open Developers, then API keys, and copy the Secret key.");
code("STRIPE_SECRET_KEY=sk_test_your_value_here");
heading("Forward local webhooks");
code("stripe login\nstripe listen --forward-to localhost:5000/stripe/webhook");
paragraph("stripe login connects the CLI to your Stripe account. stripe listen creates a secure tunnel and forwards Stripe events to your local backend. Copy the printed whsec_ value into STRIPE_WEBHOOK_SECRET, then restart the backend.");
code("STRIPE_WEBHOOK_SECRET=whsec_your_value_here");
heading("Make a test payment");
numbered(1, "Start the application and keep stripe listen running.");
numbered(2, "Register, log in and create an invoice.");
numbered(3, "Click Pay Now.");
numbered(4, "Use card 4242 4242 4242 4242, any future expiry date and any three-digit CVC.");
numbered(5, "Confirm the Stripe CLI reports checkout.session.completed.");
numbered(6, "Refresh the dashboard and confirm the invoice status is Paid.");
paragraph("The backend verifies the Stripe signature and checks that the Stripe session metadata matches both the invoice and the logged-in user.");

// Readiness
doc.addPage();
title("5. Deployment readiness");
heading("Run validation commands");
code("Set-Location D:\\Micro-SaaS\\server\nnode --check index.js\nnode --check scripts/migrate.js\nnpm run migrate\n\nSet-Location ..\\freelancer-invoice-tracker\nnpm run lint\nnpm run build\n\nSet-Location ..\ndocker compose config\ndocker compose build");
paragraph("node --check parses JavaScript without starting it. npm run migrate applies pending schema changes. lint finds common code issues. build creates the optimized Next.js application. docker compose config validates expanded Compose settings. docker compose build creates the production images.");
heading("Production checklist");
bullet("Use a new, randomly generated JWT_SECRET and strong database password.");
bullet("Store production secrets in the hosting provider's secret manager.");
bullet("Set CLIENT_URL and NEXT_PUBLIC_API_URL to HTTPS production URLs.");
bullet("Rebuild the frontend after changing NEXT_PUBLIC_API_URL because Next.js embeds it during build.");
bullet("Use Stripe live keys only in production and register an HTTPS webhook endpoint.");
bullet("Run migrations before starting a new backend release.");
bullet("Back up PostgreSQL and test restoring a backup.");
bullet("Use HTTPS, rate limiting, monitoring and a production email provider.");
bullet("Never commit .env and never run docker compose down -v on production.");
heading("Check migration state");
code("docker compose exec db psql -U postgres -d micro_saas -c \"SELECT filename, applied_at FROM schema_migrations ORDER BY filename;\"");
paragraph("exec runs a command inside an existing container. psql is PostgreSQL's command-line client. The query should show 001_initial.sql.");
heading("Common Docker error");
paragraph("If Docker reports that dockerDesktopLinuxEngine is unavailable, start Docker Desktop and wait until its engine is running. Then retry docker compose build or docker compose up --build.");

// Footer and page numbers
const range = doc.bufferedPageRange();
for (let index = range.start; index < range.start + range.count; index += 1) {
  doc.switchToPage(index);
  doc.fillColor("#7B8794").font("Helvetica").fontSize(8).text(
    `Freelancer Invoice Tracker | Page ${index + 1} of ${range.count}`,
    50,
    doc.page.height - 32,
    { width: pageWidth, align: "center" }
  );
}

doc.end();
stream.on("finish", () => console.log(`Created ${outputPath}`));
