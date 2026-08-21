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
1. Ouvrir `ios/App/App.xcworkspace` dans Xcode sur un Mac, puis Product → Archive pour la soumission App Store.
2. Un service CI cloud comme [Codemagic](https://codemagic.io) (bon support Capacitor prêt à l'emploi) peut compiler,
   signer et soumettre l'app sans Mac local — nécessite toujours un compte Apple Developer Program actif.

## Check-list avant publication

- [ ] Compte **Apple Developer Program** (99 $/an) créé.
- [ ] Compte **Google Play Console** (25 $ paiement unique) créé.
- [ ] Icônes/splash validées visuellement sur un vrai écran (fournies dans `assets/`, générées via
      `npx capacitor-assets generate`).
- [ ] Politique de confidentialité rédigée et publiée (obligatoire pour les deux stores — le site collecte des données via
      Supabase, Twilio et les paiements Wave/Orange Money, à mentionner explicitement).
- [ ] Captures d'écran + description pour les fiches App Store / Play Store.
- [ ] Keystore Android généré pour signer la version release — **à conserver précieusement**, sa perte empêche toute mise
      à jour future de l'app sur le Play Store.
- [ ] Notifications push : hors scope de cette première version (nécessiterait Firebase pour Android + un certificat APNs
      pour iOS, ce dernier impossible sans compte Apple Developer) — à ajouter dans une itération suivante si besoin.
