import { mkdir, copyFile, cp, rm, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html','styles.css','app.js','privacy.html','terms.html','analytics.js']) await copyFile(file, `dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
console.log('Built static site in dist/');

const fields = {apiKey:'API_KEY',authDomain:'AUTH_DOMAIN',projectId:'PROJECT_ID',appId:'APP_ID',measurementId:'MEASUREMENT_ID'};
const config = Object.fromEntries(Object.entries(fields).map(([key, suffix]) => [key, process.env[`WEB_FIREBASE_${suffix}`] || '']));
const configured = Object.values(config).some(Boolean);
if (configured && (!config.apiKey || !config.projectId || !config.appId || !/^G-[A-Z0-9]+$/.test(config.measurementId))) throw new Error('Incomplete WEB_FIREBASE_* configuration');
if (config.measurementId && config.measurementId === process.env.VITE_FIREBASE_MEASUREMENT_ID) throw new Error('Website and desktop must use different measurement IDs');
// Preview deployments should never pollute production reports.
const enabled = configured && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production');
await writeFile('dist/analytics-config.js', `export default ${JSON.stringify(enabled ? config : {})};\n`);
console.log(enabled ? 'Website analytics configured (consent required)' : 'Website analytics disabled: no production configuration');
