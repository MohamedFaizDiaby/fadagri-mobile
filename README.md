# FADAGRI — application mobile (iOS + Android)

Coquille native [Capacitor](https://capacitorjs.com) autour du site [fadagri-site](../fadagri-site) déjà en production sur
`https://fadagri.netlify.app`. L'appli charge directement ce site dans une WebView native (voir `server.url` dans
[`capacitor.config.ts`](capacitor.config.ts)) — **toute mise à jour du site web se reflète immédiatement dans l'appli**, sans
nouvelle soumission aux stores. Seuls les changements natifs (icône, permissions, plugins) nécessitent une nouvelle
publication.

## Structure

- `capacitor.config.ts` — config Capacitor (`appId: com.fadagri.app`, `appName: FADAGRI`, URL distante).
- `www/` — page de secours minimale, affichée seulement si l'appareil n'a aucune connexion au lancement.
- `assets/icon.png`, `assets/splash.png` — sources haute résolution utilisées pour générer toutes les tailles d'icônes et
  d'écrans de démarrage (`npx capacitor-assets generate`), dérivées du logo FADAGRI.
- `android/` — projet Gradle complet, prêt à compiler.
- `ios/` — projet Xcode complet, prêt à compiler **sur un Mac** (Xcode est exclusif à macOS, impossible de compiler ou
  tester la partie iOS depuis ce PC Windows).
- `.github/workflows/android-build.yml` — build Android automatique sur GitHub Actions à chaque push (voir plus bas
  pourquoi c'est le moyen le plus fiable de compiler l'APK pour l'instant).
- `codemagic.yaml` — build + signature + envoi TestFlight automatique de l'app iOS via Codemagic (cloud, pas de Mac
  requis), voir "Compiler l'app iOS" ci-dessous pour la configuration.

## Compiler l'APK Android

**En local (Android Studio)**, si vous avez Android Studio installé :
```bash
npx cap open android
```
Puis "Run" depuis Android Studio.

**En ligne de commande**, une fois JDK 17+ et le SDK Android installés (`ANDROID_HOME` configuré) :
```bash
cd android
./gradlew assembleDebug
```
> Note : sur cette machine de développement, cette commande échoue avec `java.io.IOException: Unable to establish loopback
> connection` — un bug connu et documenté de Java/Windows lorsqu'un processus Java est lancé comme enfant d'un
> environnement Claude Code sandboxé sur Windows (voir
> [anthropics/claude-code#41432](https://github.com/anthropics/claude-code/issues/41432)), pas un problème du projet
> lui-même. **`.github/workflows/android-build.yml` contourne ça** en compilant sur les serveurs GitHub Actions à chaque
> push — l'APK compilé est téléchargeable depuis l'onglet **Actions** du dépôt GitHub, artefact `fadagri-debug-apk`.

## Compiler l'app iOS

Impossible sur ce PC (pas de Mac). Deux options :

1. **Sur un Mac** : `npm ci` (nécessaire — `ios/App/CapApp-SPM/Package.swift` référence
   `node_modules/@capacitor/splash-screen` en dépendance Swift Package locale), puis ouvrir
   `ios/App/App.xcodeproj` dans Xcode (pas de `.xcworkspace` séparé — pas de CocoaPods, Capacitor 8 utilise Swift Package
   Manager). Sélectionner l'équipe de signature (**Signing & Capabilities**), puis **Product → Archive** pour la
   soumission App Store.
2. **Cloud (recommandé ici, pas de Mac disponible)** : [Codemagic](https://codemagic.io), configuré via
   [`codemagic.yaml`](codemagic.yaml) à la racine du dépôt. Étapes de configuration côté Codemagic :
   1. Créer un compte sur [codemagic.io](https://codemagic.io), connecter le compte GitHub, ajouter le dépôt
      `fadagri-mobile`.
   2. **App Store Connect → Users and Access → Integrations → App Store Connect API** : générer une clé API (accès
      "Admin" ou "App Manager"), télécharger le fichier `.p8`, noter le **Key ID** et l'**Issuer ID**.
   3. Dans Codemagic : **Team settings → Integrations → App Store Connect** → coller la clé `.p8`, le Key ID et l'Issuer
      ID, nommer l'intégration exactement **`codemagic`** (doit correspondre à `integrations.app_store_connect` dans
      `codemagic.yaml`).
   4. Dans App Store Connect, créer la fiche de l'app (**My Apps → +** → nom "FADAGRI", bundle ID `com.fadagri.app`,
      langue principale) — nécessaire avant le premier envoi TestFlight.
   5. Pousser sur `main` déclenche automatiquement le build (`ios-workflow` dans `codemagic.yaml`) ; le build signé est
      envoyé sur TestFlight (`submit_to_testflight: true`). Passer `submit_to_app_store: true` quand prêt pour la revue
      Apple.

## Check-list avant publication

- [x] Compte **Apple Developer Program** (99 $/an) créé (Individuel).
- [ ] Compte **Google Play Console** (25 $ paiement unique) créé.
- [ ] Compte Codemagic créé + intégration App Store Connect configurée (voir "Compiler l'app iOS").
- [ ] Fiche app créée dans App Store Connect (nom "FADAGRI", bundle ID `com.fadagri.app`).
- [ ] Icônes/splash validées visuellement sur un vrai écran (fournies dans `assets/`, générées via
      `npx capacitor-assets generate`).
- [ ] Politique de confidentialité rédigée et publiée (obligatoire pour les deux stores — le site collecte des données via
      Supabase, Twilio et les paiements Wave/Orange Money, à mentionner explicitement).
- [ ] Captures d'écran + description pour les fiches App Store / Play Store.
- [ ] Keystore Android généré pour signer la version release — **à conserver précieusement**, sa perte empêche toute mise
      à jour future de l'app sur le Play Store.
- [ ] Notifications push : hors scope de cette première version (nécessiterait Firebase pour Android + un certificat APNs
      pour iOS, ce dernier impossible sans compte Apple Developer) — à ajouter dans une itération suivante si besoin.
