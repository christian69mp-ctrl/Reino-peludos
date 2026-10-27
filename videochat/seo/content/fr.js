// Pages d’atterrissage en français (voir seo/CONTENT-SPEC.md)
module.exports = {
  common: {
    home: 'Accueil',
    related: 'Ça peut aussi t’intéresser',
    countries: 'Chat vidéo par pays',
    topics: 'D’autres façons de discuter',
    alternatives: 'Alternatives à d’autres sites',
    faq: 'Questions fréquentes',
    ctaTitle: 'On commence ?',
    ctaText: 'Entre gratuitement, sans inscription, et rencontre quelqu’un de nouveau en quelques secondes.',
    ctaButton: 'Lancer le chat vidéo gratuit',
    adultNote: 'Réservé aux personnes majeures (18 ans et plus).',
    disclaimer: '{brand} est une marque de son titulaire. La Ruleta Caliente n’est ni affiliée à {brand} ni sponsorisée par elle ; nous la citons uniquement à titre de comparaison.',
    footerTitle: 'Chat vidéo gratuit',
    guides: 'Guides et conseils',
  },
  pages: {
    'free-video-chat': {
      slug: 'chat-video-gratuit',
      anchor: 'Chat vidéo gratuit',
      title: 'Chat vidéo gratuit avec des inconnus · La Ruleta Caliente',
      description: 'Chat vidéo gratuit en direct, en tête-à-tête et au hasard, depuis ton navigateur, sans rien télécharger. Réservé aux 18 ans et plus. Lance-toi en un clic.',
      h1: 'Chat vidéo gratuit : rencontre des inconnus en direct, en un clic',
      intro: '<p>La Ruleta Caliente est un <strong>chat vidéo gratuit</strong> en direct qui te met face à une personne choisie au hasard, quelque part dans le monde. Une caméra, un navigateur, et la conversation démarre : pas de logiciel à installer, pas de carte bancaire pour commencer, et pas d’inscription obligatoire. Si le courant ne passe pas, un clic sur <strong>Suivant</strong> et tu découvres quelqu’un d’autre.</p><p>Le site est réservé aux adultes (18 ans et plus). Il mélange la spontanéité du tchat webcam aléatoire avec des jeux, des piments 🌶️ à gagner et des outils de sécurité pensés pour que chacun se sente à l’aise.</p>',
      sections: [
        {
          h2: 'Comment fonctionne le chat vidéo gratuit',
          html: '<ol><li><strong>Entre sans inscription</strong> : choisis ton genre, indique ta date de naissance et confirme que tu as 18 ans ou plus.</li><li><strong>Autorise la caméra et le micro</strong> dans ton navigateur, sur ordinateur comme sur téléphone.</li><li><strong>Appuie sur Commencer</strong> : tu es mis en relation avec une personne au hasard, en vidéo et en tête-à-tête.</li><li><strong>Suivant</strong> (ou la touche Échap) pour changer de personne, <strong>Arrêter</strong> pour faire une pause.</li></ol><p>Tu veux le détail étape par étape ? Jette un œil à la page <a href="@how">Comment ça marche</a>.</p>',
        },
        {
          h2: 'Chat vidéo sans inscription : pas d’e-mail, pas de mot de passe',
          html: '<p>Beaucoup de sites demandent un compte avant même de te montrer la moindre caméra. Ici, tu entres comme invité : ton genre, ta date de naissance et la confirmation de ta majorité, et c’est tout. Pas d’adresse e-mail à valider, pas de mot de passe à retenir, pas de profil à remplir. Le détail est expliqué sur la page <a href="@no-signup-video-chat">chat vidéo sans inscription</a>.</p><p>Le compte (e-mail ou Google) reste facultatif. Il sert à garder tes piments, ta série et tes amis quand tu passes du téléphone à l’ordinateur, et il est obligatoire uniquement si tu veux payer Premium. Tu peux donc tester le tchat aussi longtemps que tu veux avant de décider si un compte t’est utile.</p>',
        },
        {
          h2: 'Un tchat webcam gratuit sur ordinateur et sur mobile',
          html: '<p>Le chat tourne dans ton navigateur, sur ordinateur avec une webcam ou sur smartphone avec la caméra frontale. Rien à télécharger, aucune application à chercher dans un store. Si tu reviens souvent, tu peux ajouter le site à ton écran d’accueil pour l’ouvrir comme une app. Pendant l’appel, un bouton permet de basculer entre la caméra avant et arrière, et plusieurs options de vue adaptent l’affichage à ton écran.</p><p>Le chat vidéo gratuit fonctionne aussi bien en Wi-Fi qu’en 4G ou 5G ; sur données mobiles, garde un œil sur ta consommation, car la vidéo en direct en utilise davantage qu’un simple tchat texte. Pour une page entièrement consacrée au téléphone, va voir le <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p><p>Quelques réglages font une vraie différence : une lumière face à toi plutôt que derrière, la caméra à hauteur des yeux et une connexion Wi-Fi stable si possible. Notre guide pour <a href="@guide-camera">bien paraître à la caméra</a> détaille ces astuces.</p>',
        },
        {
          h2: 'Ce qui est gratuit, et ce que Premium ajoute',
          html: '<p>L’essentiel ne coûte rien : la mise en relation aléatoire, le chat texte avec <strong>traduction automatique</strong>, les réactions 👍 ❤️, le changement de caméra, les jeux pendant l’appel et les piments que tu gagnes en jouant. Tu peux passer des heures à discuter sans jamais sortir ta carte.</p><table><thead><tr><th>Gratuit</th><th>Avec Premium</th></tr></thead><tbody><tr><td>Rencontres au hasard, sans limite de temps</td><td>Choisir qui tu vois : femmes, hommes, personnes trans ou couples</td></tr><tr><td>Chat texte traduit, réactions, amis</td><td>Filtres par pays, proximité et âge</td></tr><tr><td>Jeux, piments, classement</td><td>Sans publicité, historique de 30 jours, appels à tes amis</td></tr><tr><td>Superpouvoirs avec tes piments</td><td>Superpouvoirs offerts chaque jour, jeux et compliments épicés</td></tr></tbody></table><p><strong>Premium</strong> est facultatif : 7,99 € par semaine ou 19,99 € par mois, résiliable quand tu veux. Et si tu invites un ami qui s’inscrit avec ton lien puis a une première conversation de plus d’une minute, vous gagnez chacun un jour de Premium.</p>',
        },
        {
          h2: 'Des jeux, des piments et l’Heure chaude',
          html: '<p>Le moment le plus délicat d’un tchat vidéo, ce sont souvent les premières secondes. Pour éviter le silence gêné, lance un jeu sans quitter la vidéo : <strong>Action ou vérité</strong>, <strong>Tu préfères ?</strong>, <strong>Pierre-feuille-ciseaux</strong> ou <strong>Dessine et devine</strong>. Le <strong>thermomètre de complicité</strong> monte à mesure que la conversation se réchauffe. Tous les détails sont sur la page <a href="@games">Jeux et pouvoirs</a>.</p><p>Les <strong>piments</strong> 🌶️ sont des points gratuits : tu en gagnes en revenant chaque jour, en jouant, en recevant des ❤️ et en relevant les défis de la semaine. Chaque soir, de 22 h à 23 h (heure de Paris), c’est l’<strong>Heure chaude</strong> : ils comptent double. Ils activent des superpouvoirs comme la <strong>Flamme ardente</strong>, qui te fait passer devant dans la file, ou <strong>Retour</strong>, qui te reconnecte à la personne précédente si elle accepte. Chaque lundi, les trois premiers du classement hebdomadaire gagnent 7, 3 ou 1 jour de Premium.</p>',
        },
        {
          h2: 'Trouve le chat qui te ressemble',
          html: '<p>Tout le monde ne vient pas chercher la même chose. Selon ton envie, ces pages te donnent des conseils adaptés :</p><ul><li>discuter avec des femmes ou des hommes : <a href="@video-chat-women">chat vidéo avec des filles</a> et <a href="@video-chat-men">chat avec des hommes</a> ;</li><li>flirter avec respect : <a href="@flirt-chat">chat pour draguer</a> ou <a href="@singles-chat">chat célibataires</a> ;</li><li>élargir ton cercle : <a href="@meet-people-chat">chat pour faire des rencontres</a>, y compris entre adultes de plus de 40 ans avec le <a href="@video-chat-over-40">chat plus de 40 ans</a> ;</li><li>un espace respectueux pour tous : <a href="@video-chat-gay">chat gay</a> et <a href="@video-chat-trans">chat trans</a>.</li></ul><p>Et pour réussir tes premières phrases, nos <a href="@guides">guides et conseils</a> regorgent d’idées concrètes.</p>',
        },
        {
          h2: 'Discuter en sécurité',
          html: '<p>Pendant l’appel, la vidéo passe par notre serveur : l’autre personne ne voit jamais ton adresse IP. Un filigrane invisible décourage les enregistrements, et un message rappelle à chacun qu’enregistrer est interdit. Le bouton <strong>Signaler</strong> déclenche une vérification humaine, et les comptes qui ne respectent pas les <a href="@rules">règles de la communauté</a> sont exclus.</p><p>Un conseil simple : ne partage jamais tes coordonnées, ton adresse ou des photos privées avec quelqu’un que tu viens de rencontrer. Nos <a href="@safety">conseils de sécurité</a> expliquent comment repérer les arnaques et le chantage.</p>',
        },
      ],
      faq: [
        { q: 'Le chat vidéo est-il vraiment gratuit ?', a: 'Oui. Discuter en vidéo avec des personnes au hasard est gratuit, sans inscription et sans limite de temps. Premium est une option payante qui ajoute des filtres et d’autres avantages.' },
        { q: 'Faut-il s’inscrire pour utiliser le chat vidéo ?', a: 'Non. Tu peux entrer sans inscription : tu choisis ton genre, tu indiques ta date de naissance et tu confirmes que tu as au moins 18 ans. Le compte est facultatif, pour garder ta progression ou payer Premium.' },
        { q: 'Faut-il télécharger une application ?', a: 'Non. Tout fonctionne dans le navigateur de ton téléphone ou de ton ordinateur. Si tu veux, tu peux ajouter le site à ton écran d’accueil comme une app.' },
        { q: 'Peut-on choisir de parler uniquement avec des filles gratuitement ?', a: 'Non. En gratuit, la mise en relation est aléatoire. Le choix du genre, comme les filtres par pays, proximité et âge, fait partie de Premium.' },
        { q: 'Mon interlocuteur peut-il voir mon adresse IP ?', a: 'Non. La vidéo passe par notre serveur, donc l’autre personne ne voit jamais ton adresse IP. Évite tout de même de donner des informations personnelles.' },
        { q: 'Dans quelles langues puis-je discuter ?', a: 'Le site est disponible en français, anglais, espagnol, portugais, allemand et italien, et le chat texte traduit automatiquement les messages de l’autre personne.' },
      ],
    },

    'random-video-chat': {
      slug: 'chat-video-aleatoire',
      anchor: 'Tchat vidéo aléatoire',
      title: 'Tchat vidéo aléatoire en direct · La Ruleta Caliente',
      description: 'Tchat vidéo aléatoire : une roulette qui te met face à un inconnu, en direct. Suivant pour changer, jeux et piments 🌶️. Réservé aux 18 ans et plus.',
      h1: 'Tchat vidéo aléatoire : la roulette qui te fait rencontrer le monde',
      intro: '<p>Le principe du <strong>tchat vidéo aléatoire</strong> est simple : tu ne choisis pas, le hasard s’en charge. Sur La Ruleta Caliente, chaque clic lance la roulette et te connecte, en vidéo et en tête-à-tête, à une personne majeure que tu n’aurais jamais croisée autrement. Parfois la conversation dure deux minutes, parfois deux heures. C’est tout le sel du jeu.</p>',
      sections: [
        {
          h2: 'Pourquoi le hasard rend les rencontres plus intéressantes',
          html: '<p>Sur un réseau social, tu tombes surtout sur des gens qui te ressemblent. Une roulette de chat vidéo, elle, casse cette bulle : un étudiant à l’autre bout de l’Europe, une voyageuse de passage en Amérique du Sud, quelqu’un qui veut juste améliorer son français… Personne ne sait qui va apparaître, et c’est justement ce qui rend chaque connexion un peu excitante.</p><p>Comme il n’y a ni profil à remplir ni photos à comparer, la première impression se fait en direct, sur ce que vous vous dites. Plus naturel, plus spontané.</p>',
        },
        {
          h2: 'Changer de personne en une seconde',
          html: '<p>Tu n’es jamais coincé dans une conversation qui ne te plaît pas. Le bouton <strong>Suivant</strong>, ou la touche <strong>Échap</strong> sur un clavier, relance la roulette immédiatement. Besoin de souffler ? <strong>Arrêter</strong> met la recherche en pause sans fermer la page.</p><p>Et si tu as zappé trop vite quelqu’un de sympa, le superpouvoir <strong>Retour</strong> te permet de revenir vers la personne précédente, à condition qu’elle accepte. Un ❤️ envoyé pendant l’appel peut aussi ouvrir la porte à la <strong>Seconde chance</strong>, qui montre qui t’a donné un cœur ces dernières 24 heures.</p>',
        },
        {
          h2: 'Une roulette, mais avec des options',
          html: '<p>La mise en relation de base est entièrement aléatoire et gratuite. Si tu préfères orienter un peu le hasard, Premium ajoute des filtres :</p><table><thead><tr><th>Option</th><th>Gratuit</th><th>Premium</th></tr></thead><tbody><tr><td>Mise en relation au hasard</td><td>✓</td><td>✓</td></tr><tr><td>Chat texte traduit automatiquement</td><td>✓</td><td>✓</td></tr><tr><td>Choisir qui voir (femmes, hommes, trans, couples)</td><td>—</td><td>✓</td></tr><tr><td>Filtres par pays, proximité et âge</td><td>—</td><td>✓</td></tr><tr><td>Sans publicité, historique de 30 jours</td><td>—</td><td>✓</td></tr></tbody></table><p>Premium coûte 7,99 € par semaine ou 19,99 € par mois et se résilie quand tu veux.</p>',
        },
        {
          h2: 'Quand la conversation s’essouffle',
          html: '<p>Même avec la meilleure volonté, on tombe parfois à court d’idées. Plutôt que de cliquer sur Suivant, propose une partie de <strong>Tu préfères ?</strong>, d’<strong>Action ou vérité</strong> ou de <strong>Dessine et devine</strong> : les jeux s’affichent sous la vidéo, sans cacher personne. Chaque partie te rapporte aussi des piments 🌶️, que tu peux dépenser en superpouvoirs. Pour voir toutes les règles, rendez-vous sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Le hasard, oui ; l’imprudence, non',
          html: '<p>Rencontrer des inconnus au hasard suppose quelques réflexes. Reste sur la plateforme au début, ne donne pas ton nom complet ni ton adresse, et méfie-toi de quiconque te demande de l’argent ou des images intimes. Si quelqu’un dépasse les bornes, utilise <strong>Signaler</strong> : une personne de l’équipe examine chaque signalement. Le site est réservé aux 18 ans et plus, et nos <a href="@safety">conseils de sécurité</a> détaillent les pièges les plus courants. Tu cherches plutôt une vue d’ensemble ? Commence par notre page <a href="@free-video-chat">chat vidéo gratuit</a>.</p>',
        },
      ],
      faq: [
        { q: 'Comment fonctionne un chat vidéo aléatoire ?', a: 'Tu lances la recherche et le site te met en relation avec une personne disponible, choisie au hasard. Tu discutes en vidéo et tu passes à quelqu’un d’autre avec Suivant quand tu veux.' },
        { q: 'Puis-je revenir à une personne que j’ai passée par erreur ?', a: 'Oui, avec le superpouvoir Retour, que tu actives avec des piments. Le bouton apparaît quelques secondes à côté de Suivant, et la reconnexion n’a lieu que si l’autre personne accepte.' },
        { q: 'Peut-on choisir le pays des personnes rencontrées ?', a: 'Le mode gratuit est entièrement aléatoire. Avec Premium, tu peux filtrer par pays, par proximité et par tranche d’âge.' },
      ],
    },

    'adult-video-chat': {
      slug: 'chat-video-adulte',
      anchor: 'Chat vidéo adulte',
      title: 'Chat vidéo pour adultes (18+) · La Ruleta Caliente',
      description: 'Chat vidéo pour adultes : rencontres en direct entre majeurs, flirt et mode piquant 🌶️ entre personnes consentantes. Sans inscription, 18+ et règles claires.',
      h1: 'Chat vidéo pour adultes : des rencontres entre majeurs, en toute liberté',
      intro: '<p>La Ruleta Caliente est un <strong>chat vidéo pour adultes</strong> : tout le monde y a 18 ans ou plus, et chacun le confirme avant de commencer. Ici, on vient pour flirter, rire, se découvrir et, si l’envie est partagée, pimenter un peu la conversation. Le ton est libre, mais toujours entre adultes consentants et dans le respect des règles.</p>',
      sections: [
        {
          h2: 'Un espace réservé aux majeurs',
          html: '<p>L’accès ne demande pas d’inscription, mais passe par ta date de naissance et la confirmation que tu as au moins 18 ans. Ce n’est pas une formalité : les mineurs n’ont rien à faire ici, et l’équipe examine chaque signalement à ce sujet. Si tu croises quelqu’un qui semble trop jeune, coupe la conversation et signale-le.</p><p>Être entre adultes, c’est aussi pouvoir parler de séduction, de relations ou de sujets qui ne se discutent pas partout, sans avoir à se justifier.</p>',
        },
        {
          h2: 'Le mode piquant, uniquement si vous êtes deux à le vouloir',
          html: '<p>Le <strong>mode piquant</strong> ajoute des jeux et des mots doux plus osés : des questions coquines à <strong>Action ou vérité</strong>, des dilemmes plus audacieux à <strong>Tu préfères ?</strong>, des compliments qui font monter la température. Il fonctionne selon une règle simple : il ne s’applique qu’avec une personne qui l’a <strong>elle aussi activé</strong>. Personne ne se retrouve face à un contenu qu’il n’a pas choisi.</p><p>Tu peux l’activer ou le désactiver à tout moment ; s’il est coupé en pleine partie, le jeu s’arrête aussitôt. Envoyer des invitations à jouer et des mots doux fait partie de Premium, mais tu peux accepter gratuitement quand on t’invite.</p>',
        },
        {
          h2: 'Flirter sans perdre le contrôle',
          html: '<p>Le consentement vaut aussi devant une caméra. Quelques principes que la communauté applique :</p><ul><li>on demande avant d’aller plus loin, et un « non » se respecte sans discussion ;</li><li>on ne montre rien que l’autre n’a pas envie de voir ;</li><li>on n’enregistre jamais personne : c’est interdit, un message le rappelle à chaque appel et un <strong>filigrane invisible</strong> permet de remonter jusqu’au compte qui filme l’écran.</li></ul><p>Les comportements contraires aux <a href="@rules">règles de la communauté</a> entraînent une exclusion, avec possibilité de contester la décision.</p>',
        },
        {
          h2: 'Choisir avec qui tu veux discuter',
          html: '<p>En mode gratuit, la roulette reste totalement aléatoire. Avec <strong>Premium</strong> (7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment), tu choisis qui tu vois : femmes, hommes, personnes trans ou couples. Tu peux aussi filtrer par pays, proximité et âge, profiter du site sans publicité et accéder aux jeux et mots doux épicés. Pour découvrir le filtre en détail, lis notre page <a href="@video-chat-women">chat vidéo avec des femmes</a>.</p>',
        },
        {
          h2: 'Protège-toi contre le chantage',
          html: '<p>Le revers des rencontres en ligne entre adultes, ce sont les tentatives de <strong>sextorsion</strong> : quelqu’un pousse à se dévoiler puis menace de diffuser des images. Garde ton visage et ta vie privée pour toi tant que tu n’as pas confiance, ne bascule pas sur une autre application à la demande d’un inconnu et ne paie jamais un maître chanteur. Ton adresse IP reste invisible pour l’autre personne, car la vidéo passe par notre serveur. Si tu es victime d’une menace, signale le compte et consulte nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Le chat vidéo pour adultes est-il gratuit ?', a: 'Oui, discuter en vidéo au hasard est gratuit. Premium, en option, permet de choisir qui voir et d’envoyer des invitations aux jeux et des mots doux épicés.' },
        { q: 'Comment fonctionne le mode piquant ?', a: 'Tu l’actives dans les options du chat. Les jeux et compliments osés n’apparaissent qu’avec des personnes qui l’ont aussi activé, et tu peux le couper à tout moment.' },
        { q: 'Que faire si quelqu’un me menace de diffuser une vidéo ?', a: 'Ne paie pas et coupe le contact. Signale le compte depuis le chat : l’équipe examine le signalement, et notre page de sécurité explique les démarches utiles.' },
        { q: 'Les mineurs peuvent-ils accéder au site ?', a: 'Non. Le site est réservé aux 18 ans et plus, chacun doit le confirmer et tout profil suspect peut être signalé.' },
      ],
    },

    'talk-to-strangers': {
      slug: 'parler-a-des-inconnus',
      anchor: 'Parler à des inconnus',
      title: 'Parler à des inconnus en vidéo · La Ruleta Caliente',
      description: 'Envie de parler à des inconnus ? Discute en vidéo avec des gens du monde entier, avec traduction du chat, jeux et sujets pour briser la glace. Dès 18 ans.',
      h1: 'Parler à des inconnus en vidéo, sans timidité',
      intro: '<p>Tu veux <strong>parler à des inconnus</strong>, sortir de ton cercle habituel, pratiquer une langue ou simplement tuer l’ennui un soir de semaine ? La Ruleta Caliente te met en relation en vidéo avec une personne majeure choisie au hasard. Pas besoin d’avoir un bon prétexte : tout le monde est là pour la même raison, faire une rencontre.</p>',
      sections: [
        {
          h2: 'Pourquoi discuter avec des inconnus fait du bien',
          html: '<p>Parler à quelqu’un qui ne connaît rien de toi a quelque chose de libérateur. Pas d’attentes, pas d’histoire commune, pas de jugement des amis : tu peux être curieux, drôle ou sérieux, comme tu le sens. Beaucoup de gens viennent aussi pour découvrir d’autres façons de vivre, parler de leur ville ou de leur musique, ou s’entraîner à l’oral dans une autre langue.</p><p>Et si une conversation ne mène nulle part, ce n’est pas grave : un clic sur <strong>Suivant</strong> et une nouvelle personne apparaît.</p>',
        },
        {
          h2: 'Quoi dire dans les premières secondes',
          html: '<p>La timidité est normale. Quelques idées qui marchent bien :</p><ul><li>un simple « Salut ! Tu viens d’où ? 👋 » suffit souvent ;</li><li>commente ce que tu vois avec bienveillance : un instrument dans le fond, un poster, un chat qui passe ;</li><li>propose un jeu : <strong>Tu préfères ?</strong> déride presque tout le monde ;</li><li>utilise les <strong>sujets pour briser la glace</strong> proposés par le site quand l’inspiration manque.</li></ul><p>Le <strong>thermomètre de complicité</strong> te montre quand la conversation chauffe. Et si elle explose, vous gagnez des piments 🌶️ tous les deux.</p>',
        },
        {
          h2: 'Même sans parler la même langue',
          html: '<p>La barrière de la langue n’en est plus vraiment une. Le chat texte qui accompagne la vidéo propose une <strong>traduction automatique</strong> : tu écris en français, l’autre lit dans sa langue, et inversement. Le site lui-même est disponible en six langues (français, anglais, espagnol, portugais, allemand et italien). Résultat : tu peux échanger avec une personne de Lisbonne ou de Munich même si ton portugais ou ton allemand se limite à « bonjour ».</p>',
        },
        {
          h2: 'Garder le contact avec les personnes qui te plaisent',
          html: '<p>Une rencontre au hasard peut devenir une vraie amitié. Pendant l’appel, envoie une réaction 👍 ou ❤️ pour montrer que tu passes un bon moment. Avec Premium (7,99 € par semaine ou 19,99 € par mois), tu peux <strong>ajouter la personne en ami</strong>, voir quand elle est en ligne et l’appeler plus tard, et retrouver tes conversations dans un historique de 30 jours. Le superpouvoir <strong>Seconde chance</strong>, lui, révèle qui t’a donné un ❤️ dans les dernières 24 heures.</p>',
        },
        {
          h2: 'Les bons réflexes face à un inconnu',
          html: '<p>Parler à des inconnus est sympa à condition de garder un peu de recul. Ne communique ni ton nom de famille, ni ton adresse, ni ton lieu de travail. Refuse toute demande d’argent, même avec une histoire touchante. Si quelqu’un te met mal à l’aise, <strong>Signaler</strong> met fin à la conversation et vous ne serez plus jamais mis en relation. Le site est strictement réservé aux 18 ans et plus. Pour aller plus loin, lis nos <a href="@safety">conseils de sécurité</a> ou découvre comment fonctionne le <a href="@random-video-chat">tchat vidéo aléatoire</a>.</p>',
        },
      ],
      faq: [
        { q: 'Est-ce gratuit de parler à des inconnus sur le site ?', a: 'Oui. La mise en relation aléatoire et le chat texte sont gratuits. Premium ajoute des filtres, des amis et d’autres options, mais il n’est pas obligatoire.' },
        { q: 'Que faire si je ne parle pas la langue de l’autre personne ?', a: 'Utilise le chat texte : il traduit automatiquement les messages. Tu écris en français et l’autre personne lit dans sa langue.' },
        { q: 'Comment éviter les malaises avec un inconnu ?', a: 'Reste discret sur tes informations personnelles et passe à quelqu’un d’autre dès que tu le sens. En cas de comportement déplacé, utilise le bouton Signaler.' },
      ],
    },

    'video-chat-women': {
      slug: 'chat-video-avec-des-femmes',
      anchor: 'Chat vidéo avec des femmes',
      title: 'Chat vidéo avec des filles · La Ruleta Caliente',
      description: 'Chat vidéo avec des filles : avec le filtre Premium, choisis de voir des femmes, des hommes, des personnes trans ou des couples. Réservé aux 18 ans et +.',
      h1: 'Chat vidéo avec des filles : comment discuter avec des femmes en direct',
      intro: '<p>Tu cherches un <strong>chat vidéo avec des filles</strong> ? Sur La Ruleta Caliente, la roulette gratuite te met en relation avec n’importe quelle personne majeure, au hasard. Si tu veux choisir, le <strong>filtre Premium</strong> te permet de discuter uniquement avec des femmes, ou avec des hommes, des personnes trans ou des couples. Voici comment ce tchat avec des femmes fonctionne, honnêtement et sans fausses promesses, et surtout comment faire en sorte que la conversation dure plus de trois secondes.</p>',
      sections: [
        {
          h2: 'Gratuit : la surprise totale',
          html: '<p>Sans abonnement, tout le monde peut tomber sur tout le monde. C’est le principe du tchat aléatoire : tu ne sais pas si la prochaine personne sera une femme, un homme ou un couple, ni d’où elle se connecte. Beaucoup de gens apprécient justement cette part d’imprévu. Tu peux discuter aussi longtemps que tu veux et passer à quelqu’un d’autre avec <strong>Suivant</strong>.</p><p>Pour entrer, pas besoin de compte : ton genre, ta date de naissance et la confirmation de tes 18 ans suffisent. La page <a href="@no-signup-video-chat">chat vidéo sans inscription</a> explique ce qui est demandé, et pourquoi.</p>',
        },
        {
          h2: 'Premium : le chat vidéo avec des filles, filtre activé',
          html: '<p>Avec Premium, tu indiques qui tu veux rencontrer :</p><table><thead><tr><th>Filtre</th><th>Ce que ça change</th></tr></thead><tbody><tr><td>Femmes</td><td>Tu es mis en relation uniquement avec des femmes</td></tr><tr><td>Hommes</td><td>Uniquement avec des hommes</td></tr><tr><td>Trans</td><td>Uniquement avec des personnes trans</td></tr><tr><td>Couples</td><td>Uniquement avec des couples</td></tr><tr><td>Pays, proximité, âge</td><td>Affine encore selon l’endroit et la tranche d’âge</td></tr></tbody></table><p>Premium coûte 7,99 € par semaine ou 19,99 € par mois et se résilie quand tu veux. Il inclut aussi le site sans publicité, l’historique de 30 jours, les amis et appels, les jeux et mots doux épicés et des superpouvoirs gratuits chaque jour. Si peu de monde correspond à tes filtres à un moment donné, le site te propose de les élargir pour trouver quelqu’un plus vite.</p>',
        },
        {
          h2: 'Combiner les filtres : pays, proximité et âge',
          html: '<p>Le filtre de genre devient encore plus utile quand tu l’associes aux autres. Quelques exemples :</p><ul><li><strong>Femmes + Mon pays</strong> : pour parler français sans passer par la traduction, ou rencontrer quelqu’un qui partage tes références.</li><li><strong>Femmes + proximité</strong> : les personnes près de chez toi apparaissent en priorité. Il n’existe pas de filtre par ville, mais c’est l’option la plus proche.</li><li><strong>Femmes + tranche d’âge</strong> : utile si tu cherches des femmes de ta génération, par exemple via le <a href="@video-chat-over-40">chat plus de 40 ans</a>.</li><li><strong>Femmes + monde entier</strong> : le chat texte traduit automatiquement, alors pourquoi ne pas discuter avec une Brésilienne ou une Italienne ?</li></ul><p>Plus tes filtres sont serrés, plus l’attente peut être longue aux heures creuses. Dans ce cas, élargis un critère, par exemple la tranche d’âge, et la mise en relation repart.</p>',
        },
        {
          h2: 'Discuter avec des femmes du monde entier',
          html: '<p>Le chat texte traduit automatiquement les messages, et le site existe en six langues : français, anglais, espagnol, portugais, allemand et italien. Une conversation avec une Québécoise, une Belge ou une Espagnole devient donc possible même si tu ne parles pas sa langue. C’est aussi une belle occasion de pratiquer l’anglais ou l’espagnol, comme l’explique la page <a href="@video-chat-foreigners">parler avec des étrangers</a>.</p><p>Avec les différences de fuseau horaire, tu croiseras des gens qui prennent leur café du matin pendant que tu termines ta soirée. Une question sur leur ville ou leur journée suffit souvent à lancer un échange qui dure.</p>',
        },
        {
          h2: 'Faire bonne impression',
          html: '<p>Le filtre te met face à la bonne personne ; le reste dépend de toi. Ce qui fonctionne le mieux, c’est la simplicité : un visage bien éclairé, un sourire, une vraie question. Les femmes comme les hommes passent vite à la suite face à un écran noir ou une remarque lourde. Propose plutôt un jeu, <strong>Dessine et devine</strong> ou <strong>Pierre-feuille-ciseaux</strong>, pour lancer la conversation de façon légère.</p><ul><li>Montre ton visage dès la connexion, pas le plafond ni ton torse.</li><li>Commence par une question ouverte : « Tu te connectes d’où ? », « Ta meilleure découverte de la semaine ? ».</li><li>Écoute la réponse et rebondis dessus plutôt que d’enchaîner les questions.</li><li>Garde les compliments pour plus tard, et sur autre chose que le physique.</li></ul><p>Un petit coup de pouce : le <strong>Super coucou</strong> te permet d’écrire un message que la prochaine personne verra mis en avant dès la connexion. Il s’active avec des piments 🌶️, que tu gagnes gratuitement. Pour d’autres idées, lis notre guide <a href="@guide-icebreakers">comment commencer une conversation</a>.</p>',
        },
        {
          h2: 'Le respect avant tout',
          html: '<p>Chacun a le droit de passer à la suite sans explication. Les insultes, l’insistance et les contenus non désirés sont contraires aux <a href="@rules">règles de la communauté</a> et mènent à l’exclusion. Le <strong>mode piquant</strong> n’est actif qu’entre deux personnes qui l’ont choisi toutes les deux, ce qui évite les mauvaises surprises. Toutes les personnes présentes ont 18 ans ou plus.</p><p>Si tu viens pour séduire, fais-le avec tact : notre guide pour <a href="@guide-flirting">flirter en chat vidéo</a> et la page <a href="@flirt-chat">chat pour draguer</a> expliquent comment rester charmant sans devenir pesant.</p>',
        },
        {
          h2: 'Et si c’est toi qu’on veut rencontrer ?',
          html: '<p>Si tu es une femme et que tu veux garder la main, plusieurs outils t’aident : <strong>Incognito</strong> cache ton âge et ton pays pendant une heure, <strong>Signaler</strong> met fin à une conversation désagréable et bloque toute nouvelle mise en relation avec cette personne, et l’autre ne voit jamais ton adresse IP. Évite de donner ton compte Instagram ou ton numéro trop vite.</p><p>Tu peux toi aussi utiliser les filtres Premium : choisir de discuter avec des femmes pour un échange entre filles, ou avec des hommes via le <a href="@video-chat-men">chat avec des hommes</a>. Nos <a href="@safety">conseils de sécurité</a> et la page <a href="@adult-video-chat">chat vidéo pour adultes</a> complètent ces conseils.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on discuter uniquement avec des femmes gratuitement ?', a: 'Non, le choix du genre fait partie de Premium. En gratuit, la mise en relation reste aléatoire et tu peux tomber sur n’importe quelle personne majeure.' },
        { q: 'Combien coûte le filtre pour discuter avec des femmes ?', a: 'Il est inclus dans Premium, à 7,99 € par semaine ou 19,99 € par mois. Tu peux résilier quand tu veux.' },
        { q: 'Le filtre fonctionne-t-il aussi pour les hommes, les personnes trans ou les couples ?', a: 'Oui. Premium permet de choisir de voir des femmes, des hommes, des personnes trans ou des couples, et de combiner ce choix avec les filtres par pays, proximité et âge.' },
        { q: 'Peut-on trouver des filles de sa région ?', a: 'Avec Premium, le filtre de proximité fait apparaître d’abord des personnes près de chez toi, et le filtre « Mon pays » limite les rencontres à ton pays. Il n’y a pas de filtre par ville.' },
        { q: 'Pourquoi les femmes passent-elles vite à la suite ?', a: 'Souvent à cause d’un écran noir, d’un cadrage gênant ou d’une remarque déplacée. Montre ton visage, souris et commence par une vraie question.' },
        { q: 'Le chat vidéo avec des filles fonctionne-t-il sur mobile ?', a: 'Oui. Tout se passe dans le navigateur de ton téléphone, sans application à télécharger, avec la caméra avant ou arrière.' },
      ],
    },

    'mobile-video-chat': {
      slug: 'chat-video-mobile',
      anchor: 'Chat vidéo sur mobile',
      title: 'Chat vidéo sur mobile, sans appli · La Ruleta Caliente',
      description: 'Chat vidéo sur mobile sans appli : ouvre le site sur iPhone ou Android, autorise la caméra et discute. Installable sur l’écran d’accueil. Dès 18 ans.',
      h1: 'Chat vidéo sur mobile : directement dans ton navigateur',
      intro: '<p>Pas envie d’encombrer ton téléphone avec une énième application ? Le <strong>chat vidéo sur mobile</strong> de La Ruleta Caliente fonctionne directement dans le navigateur de ton smartphone, iPhone ou Android. Tu ouvres le site, tu autorises la caméra, et tu discutes en face à face avec des personnes majeures du monde entier. Rien à télécharger, aucune mise à jour à faire.</p>',
      sections: [
        {
          h2: 'Démarrer depuis ton téléphone en trois gestes',
          html: '<ol><li>Ouvre le site dans Safari, Chrome ou le navigateur de ton choix.</li><li>Choisis ton genre, indique ta date de naissance et confirme que tu as 18 ans ou plus, sans inscription.</li><li>Autorise l’accès à la caméra et au micro quand le navigateur te le demande, puis appuie sur <strong>Commencer</strong>.</li></ol><p>Si tu as refusé l’accès par erreur, il suffit de le réactiver dans les réglages du navigateur. En cas de souci, la page <a href="@help">Aide</a> répond aux questions les plus courantes.</p>',
        },
        {
          h2: 'L’ajouter à ton écran d’accueil comme une app',
          html: '<p>Le site peut s’<strong>installer comme une application</strong> (on parle de PWA) : il apparaît sur ton écran d’accueil avec son icône et s’ouvre en plein écran, sans barre d’adresse. Sur iPhone, utilise <em>Partager</em> puis <em>Sur l’écran d’accueil</em> ; sur Android, le navigateur te propose généralement « Installer l’application » ou « Ajouter à l’écran d’accueil ». Une fois installé, tu peux aussi activer les notifications pour savoir quand un ami t’appelle.</p><p>À noter : il n’existe pas d’application à télécharger dans les stores. Si tu en vois une qui prétend être La Ruleta Caliente, ce n’est pas nous.</p>',
        },
        {
          h2: 'Pensé pour le pouce',
          html: '<p>Sur un petit écran, chaque geste compte. Les boutons <strong>Suivant</strong> et <strong>Arrêter</strong> sont à portée de main, les réactions 👍 ❤️ s’envoient d’une touche et tu peux <strong>changer de caméra</strong> (avant ou arrière) pour montrer la vue depuis ta fenêtre. Les jeux, comme <strong>Action ou vérité</strong> ou <strong>Dessine et devine</strong>, s’affichent sous la vidéo sans la masquer, et plusieurs options de vue te permettent d’adapter l’affichage.</p>',
        },
        {
          h2: 'Astuces pour une bonne connexion',
          html: '<ul><li>Privilégie le Wi-Fi : la vidéo consomme des données mobiles.</li><li>Tiens ton téléphone à hauteur des yeux et place-toi face à une source de lumière.</li><li>Ferme les autres applis qui utilisent la caméra (visio, réseaux sociaux).</li><li>Si l’image se fige, appuie sur Suivant : le problème vient parfois de la connexion de l’autre personne.</li></ul><p>Tes piments 🌶️, ta série de connexions et ton classement te suivent d’un appareil à l’autre si tu crées un compte (facultatif).</p>',
        },
        {
          h2: 'Discrétion et sécurité sur mobile',
          html: '<p>Sur téléphone, on discute souvent depuis sa chambre ou dans la rue : attention à ce qui apparaît à l’image, comme une adresse, un courrier ou la vue depuis ton balcon. Ton adresse IP reste masquée pour ton interlocuteur et les enregistrements d’écran sont interdits et dissuadés par un filigrane invisible. Le site est réservé aux 18 ans et plus. Retrouve d’autres réflexes utiles dans nos <a href="@safety">conseils de sécurité</a>, ou découvre l’ensemble du <a href="@free-video-chat">chat vidéo gratuit</a>.</p>',
        },
      ],
      faq: [
        { q: 'Existe-t-il une application à télécharger ?', a: 'Non, il n’y a pas d’application dans les stores. Le site fonctionne dans le navigateur de ton téléphone et peut être ajouté à l’écran d’accueil comme une app.' },
        { q: 'Le chat vidéo fonctionne-t-il sur iPhone ?', a: 'Oui, il fonctionne dans Safari et les autres navigateurs récents sur iPhone comme sur Android. Il suffit d’autoriser la caméra et le micro.' },
        { q: 'Pourquoi ma caméra ne s’allume-t-elle pas ?', a: 'Le plus souvent, l’accès a été refusé dans le navigateur ou une autre application utilise déjà la caméra. Vérifie les autorisations du site dans les réglages puis recharge la page.' },
        { q: 'Le chat vidéo sur mobile consomme-t-il beaucoup de données ?', a: 'La vidéo en direct utilise une quantité notable de données. Pour de longues sessions, il vaut mieux être connecté en Wi-Fi.' },
      ],
    },

    'alternatives': {
      slug: 'alternatives-chat-video',
      anchor: 'Alternatives de chat vidéo',
      title: 'Alternatives aux sites de chat vidéo · La Ruleta Caliente',
      description: 'Tu cherches une alternative à Omegle, Chatroulette ou OmeTV ? Voici ce que propose La Ruleta Caliente : chat vidéo aléatoire, jeux et traduction. 18+.',
      h1: 'Alternatives aux sites de chat vidéo aléatoire',
      intro: '<p>Depuis la fermeture d’Omegle, beaucoup de gens cherchent une <strong>alternative de chat vidéo</strong> pour continuer à rencontrer des inconnus en direct. Il existe de nombreux sites de tchat vidéo aléatoire, chacun avec son ambiance. Cette page ne les classe pas et ne les critique pas : elle t’aide à savoir, si tu viens de l’un d’eux, ce que tu trouveras sur La Ruleta Caliente.</p>',
      sections: [
        {
          h2: 'Ce qu’on attend d’une bonne alternative',
          html: '<p>Quand on change de site de chat vidéo, on cherche en général les mêmes choses : une mise en relation rapide, une vidéo qui fonctionne sans installation, la possibilité de passer à quelqu’un d’autre sans se justifier et un minimum de règles pour que l’expérience reste agréable. Avant de t’inscrire où que ce soit, pose-toi aussi ces questions : qui peut voir mon adresse IP ? Que se passe-t-il si je signale quelqu’un ? Le site est-il bien réservé aux adultes ?</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Fonction</th><th>Sur La Ruleta Caliente</th></tr></thead><tbody><tr><td>Chat vidéo aléatoire en tête-à-tête</td><td>✓ Gratuit, sans limite de temps</td></tr><tr><td>Sans téléchargement</td><td>✓ Dans le navigateur, installable comme une app</td></tr><tr><td>Chat texte traduit</td><td>✓ Traduction automatique, site en 6 langues</td></tr><tr><td>Jeux pendant l’appel</td><td>✓ Action ou vérité, Tu préfères ?, Pierre-feuille-ciseaux, Dessine et devine</td></tr><tr><td>Récompenses</td><td>✓ Piments 🌶️, badges, classement hebdomadaire</td></tr><tr><td>Filtres</td><td>Premium : genre, pays, proximité, âge</td></tr><tr><td>Sécurité</td><td>✓ IP masquée, filigrane invisible, signalements vérifiés par une personne</td></tr></tbody></table>',
        },
        {
          h2: 'Choisis la page qui te correspond',
          html: '<p>Nous avons préparé une page pour chaque site que les gens mentionnent le plus souvent quand ils cherchent un équivalent :</p><ul><li><a href="@alt-omegle">Alternative à Omegle</a>, pour ceux qui ont perdu leurs habitudes en novembre 2023 ;</li><li><a href="@alt-chatroulette">Alternative à Chatroulette</a>, l’un des pionniers de la roulette vidéo ;</li><li><a href="@alt-ometv">Alternative à OmeTV</a> et <a href="@alt-chatrandom">alternative à Chatrandom</a> ;</li><li>les pages consacrées à DirtyRoulette et CooMeet, pour un public adulte qui aime le flirt.</li></ul>',
        },
        {
          h2: 'Tester un nouveau site en cinq minutes',
          html: '<p>Pas besoin d’y passer la soirée pour savoir si un chat vidéo te convient. Voici un petit test rapide :</p><ol><li>entre sur le site et regarde si l’accès est simple et clair ;</li><li>fais trois ou quatre conversations et observe la rapidité de la mise en relation ;</li><li>essaie le chat texte avec quelqu’un qui parle une autre langue ;</li><li>repère où se trouvent les boutons Suivant, Arrêter et Signaler ;</li><li>lis les règles pour savoir ce qui est accepté ou non.</li></ol><p>Si tout te semble naturel, tu as trouvé ton nouveau point de rendez-vous.</p>',
        },
        {
          h2: 'Ce qui rend l’expérience différente ici',
          html: '<p>Le hasard reste au cœur du concept, mais La Ruleta Caliente ajoute une dimension ludique. Chaque soir, l’<strong>Heure chaude</strong> double les piments gagnés de 22 h à 23 h (heure de Paris). Les superpouvoirs, comme <strong>Retour</strong> ou <strong>Incognito</strong>, s’activent avec ces piments. Et le parrainage récompense le partage : quand un ami s’inscrit avec ton lien et passe sa première conversation de plus d’une minute, vous recevez chacun un jour de Premium.</p>',
        },
        {
          h2: 'Changer de site en toute sécurité',
          html: '<p>Quel que soit le service que tu utilises, les mêmes règles de prudence s’appliquent : ne donne pas d’informations personnelles, méfie-toi des demandes d’argent ou de photos privées, et quitte la conversation au moindre doute. Ici, le site est réservé aux 18 ans et plus, et chaque signalement est examiné par une personne de l’équipe. Tu trouveras le détail dans nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Quelle est la meilleure alternative à Omegle ?', a: 'Tout dépend de ce que tu cherches. La Ruleta Caliente propose un chat vidéo aléatoire gratuit pour adultes, avec jeux, traduction du chat et outils de signalement : le plus simple est de l’essayer.' },
        { q: 'La Ruleta Caliente est-elle liée à ces autres sites ?', a: 'Non. Nous citons ces sites uniquement pour aider les personnes qui les connaissent à comprendre ce que nous proposons. Nous n’avons aucun lien avec eux.' },
        { q: 'Faut-il payer pour utiliser cette alternative ?', a: 'Non. Le chat vidéo aléatoire est gratuit. Premium est une option à 7,99 € par semaine ou 19,99 € par mois pour ceux qui veulent des filtres.' },
      ],
    },

    'alt-omegle': {
      slug: 'alternative-omegle',
      anchor: 'Alternative à Omegle',
      title: 'Alternative à Omegle en français · La Ruleta Caliente',
      description: 'Omegle a fermé en novembre 2023. Envie de parler encore à des inconnus en vidéo ? Voici ce que tu trouves sur La Ruleta Caliente. Réservé aux 18 ans et +.',
      h1: 'Alternative à Omegle : continuer à parler à des inconnus en vidéo',
      intro: '<p>Omegle a fermé ses portes en <strong>novembre 2023</strong>. Pendant des années, le site avait été pour beaucoup la porte d’entrée vers les conversations avec des inconnus, et depuis, nombreux sont ceux qui cherchent une <strong>alternative à Omegle</strong>. Si c’est ton cas, voici ce qui t’attend sur La Ruleta Caliente, un chat vidéo aléatoire réservé aux adultes, gratuit pour commencer.</p>',
      sections: [
        {
          h2: 'Le même plaisir de l’inattendu',
          html: '<p>Ce qui manque à beaucoup d’anciens utilisateurs d’Omegle, c’est cette sensation de ne pas savoir qui va apparaître. Ici, le principe est le même : tu lances la recherche, une personne prise au hasard s’affiche en vidéo, et vous décidez ensemble si la conversation continue. Un clic sur <strong>Suivant</strong> (ou la touche Échap) et tu passes à la rencontre suivante.</p><p>La principale différence avec ce que tu as peut-être connu : il faut confirmer que tu as 18 ans ou plus. Pas besoin d’inscription : ça prend quelques secondes, et ça permet de faire respecter les règles.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Ce que tu cherches</th><th>Ce qu’on propose</th></tr></thead><tbody><tr><td>Vidéo en tête-à-tête avec un inconnu</td><td>✓ Mise en relation aléatoire et gratuite</td></tr><tr><td>Discuter aussi par écrit</td><td>✓ Chat texte avec traduction automatique</td></tr><tr><td>Rencontrer des gens de partout</td><td>✓ Site en 6 langues ; filtre par pays avec Premium</td></tr><tr><td>Ne pas s’ennuyer</td><td>✓ Jeux, sujets pour briser la glace, thermomètre de complicité</td></tr><tr><td>Retrouver quelqu’un</td><td>✓ Superpouvoir Retour ; amis et appels avec Premium</td></tr><tr><td>Se sentir protégé</td><td>✓ IP invisible, signalements revus par une personne</td></tr></tbody></table>',
        },
        {
          h2: 'Ce qui change par rapport à tes vieilles habitudes',
          html: '<p>Au-delà du hasard, La Ruleta Caliente mise sur le jeu. Tu peux proposer une partie de <strong>Tu préfères ?</strong> ou de <strong>Dessine et devine</strong> sans couper la vidéo, gagner des piments 🌶️ en revenant chaque jour et grimper au classement de la semaine. Le lundi, les trois premiers reçoivent du Premium (7, 3 et 1 jour). Les adultes qui le souhaitent peuvent activer le <strong>mode piquant</strong>, qui ne s’applique qu’entre deux personnes l’ayant activé.</p><p>Envie d’en savoir plus sur le fonctionnement ? Consulte <a href="@how">Comment ça marche</a> ou la page <a href="@talk-to-strangers">parler à des inconnus</a>.</p>',
        },
        {
          h2: 'Gratuit, avec un Premium facultatif',
          html: '<p>Discuter au hasard ne coûte rien et n’a pas de limite de durée. Si tu veux choisir qui tu rencontres, Premium coûte 7,99 € par semaine ou 19,99 € par mois et se résilie à tout moment. Il donne accès au choix du genre (femmes, hommes, trans, couples), aux filtres par pays, proximité et âge, à un site sans publicité et à des superpouvoirs gratuits chaque jour.</p>',
        },
        {
          h2: 'Garder de bons réflexes',
          html: '<p>Les conseils qui valaient sur n’importe quel tchat restent valables : ne donne pas ton nom complet, ton école ou ton travail, refuse les demandes d’argent et méfie-toi de ceux qui veulent t’entraîner sur une autre messagerie. Le site est réservé aux majeurs, les enregistrements sont interdits et le bouton <strong>Signaler</strong> déclenche un examen humain. Plus d’infos dans nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Omegle existe-t-il encore ?', a: 'Non, Omegle a fermé en novembre 2023. Depuis, de nombreux sites de chat vidéo aléatoire sont utilisés par celles et ceux qui veulent continuer à parler à des inconnus.' },
        { q: 'La Ruleta Caliente est-elle le nouvel Omegle ?', a: 'Non, il s’agit d’un site indépendant, sans aucun lien avec Omegle. Il reprend l’idée du chat vidéo au hasard, avec ses propres jeux, règles et outils de sécurité.' },
        { q: 'Peut-on l’utiliser sans compte, comme avant ?', a: 'Oui, pas besoin de compte : il suffit de confirmer que l’on a 18 ans ou plus. Le compte (e-mail ou Google) est facultatif, pour garder sa progression ou payer Premium.' },
      ],
    },

    'alt-chatroulette': {
      slug: 'alternative-chatroulette',
      anchor: 'Alternative à Chatroulette',
      title: 'Alternative à Chatroulette · La Ruleta Caliente',
      description: 'Tu aimes le concept de Chatroulette ? Essaie La Ruleta Caliente : roulette vidéo au hasard, chat traduit, jeux et piments 🌶️. Gratuit, dès 18 ans.',
      h1: 'Alternative à Chatroulette : la roulette vidéo, version ludique',
      intro: '<p>Lancé en 2009, Chatroulette fait partie des tout premiers sites de chat vidéo aléatoire, et son nom est presque devenu un mot courant pour désigner le concept. Si tu cherches une <strong>alternative à Chatroulette</strong> ou simplement un autre endroit pour tourner la roue, voici ce que propose La Ruleta Caliente : le même frisson du hasard, avec des jeux et des récompenses en plus.</p>',
      sections: [
        {
          h2: 'La roulette, un concept qui a fait école',
          html: '<p>L’idée est d’une simplicité redoutable : une webcam, un bouton, et un inconnu qui apparaît. Depuis 2009, de nombreux sites ont repris ce principe en y ajoutant leur touche. Le nôtre s’appelle d’ailleurs « La Ruleta », la roulette en espagnol, avec une pointe de piment 🌶️ en plus. Si tu as envie de comprendre la mécanique en détail, la page <a href="@random-video-chat">tchat vidéo aléatoire</a> l’explique.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Élément</th><th>Détail</th></tr></thead><tbody><tr><td>Roulette vidéo 1 à 1</td><td>✓ Gratuite, avec Suivant et Arrêter</td></tr><tr><td>Accès</td><td>✓ Navigateur mobile ou ordinateur, sans inscription (18+)</td></tr><tr><td>Langues</td><td>✓ Interface en 6 langues, messages traduits automatiquement</td></tr><tr><td>Interaction</td><td>✓ Réactions 👍 ❤️, quatre jeux, sujets de conversation</td></tr><tr><td>Progression</td><td>✓ Piments, séries quotidiennes, défis, badges, classement</td></tr><tr><td>Options payantes</td><td>Premium : choix du genre, pays, proximité, âge, sans pub</td></tr></tbody></table>',
        },
        {
          h2: 'Une roulette qui récompense ta curiosité',
          html: '<p>Chaque conversation peut te rapporter quelque chose. Tu gagnes des <strong>piments</strong> en te connectant plusieurs jours de suite, en jouant, en recevant des ❤️ et en relevant des défis hebdomadaires, par exemple parler avec des gens de trois pays différents. Pendant l’<strong>Heure chaude</strong>, de 22 h à 23 h (heure de Paris), ils comptent double.</p><p>Avec ces piments, tu actives des <strong>superpouvoirs</strong> : la <strong>Flamme ardente</strong> te fait passer devant dans la file pendant 15 minutes, le <strong>Super coucou</strong> affiche ton message en évidence dès la prochaine connexion, et <strong>Incognito</strong> masque ton âge et ton pays pendant une heure.</p>',
        },
        {
          h2: 'Ta première session, pas à pas',
          html: '<p>Tu as l’habitude des roulettes vidéo, mais chaque site a ses petites différences. Une fois sur le site, commence par vérifier ton cadrage et ta lumière : un visage bien visible donne envie de rester. Lance ensuite la recherche et salue simplement la personne qui apparaît. Si la discussion accroche, envoie un ❤️ ; si elle ne décolle pas, propose un jeu avant de zapper. Au bout de quelques conversations, jette un œil à ton solde de piments et aux défis de la semaine : tu verras vite comment progresser.</p>',
        },
        {
          h2: 'Combien ça coûte',
          html: '<p>La roulette elle-même est gratuite, sans limite de temps. Premium est une option : 7,99 € par semaine ou 19,99 € par mois, résiliable quand tu le souhaites. Une autre façon d’en profiter sans payer : inviter un ami. Quand il s’inscrit avec ton lien et a sa première conversation de plus d’une minute, vous gagnez tous les deux un jour de Premium.</p>',
        },
        {
          h2: 'Une communauté adulte et encadrée',
          html: '<p>Le site est réservé aux personnes de 18 ans et plus. Les <a href="@rules">règles de la communauté</a> sont claires, les signalements sont examinés par l’équipe et les comptes fautifs sont exclus. Côté vie privée, ton adresse IP n’est jamais visible par la personne en face. Garde quand même tes informations personnelles pour toi et lis nos <a href="@safety">conseils de sécurité</a> avant de te lancer.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente est-elle une copie de Chatroulette ?', a: 'Non. C’est un site indépendant qui reprend le principe général du chat vidéo aléatoire, avec ses propres jeux, récompenses et règles. Il n’a aucun lien avec Chatroulette.' },
        { q: 'Peut-on jouer pendant la roulette vidéo ?', a: 'Oui. Action ou vérité, Tu préfères ?, Pierre-feuille-ciseaux et Dessine et devine s’affichent sous la vidéo pendant l’appel.' },
        { q: 'Que sont les piments ?', a: 'Ce sont des points gratuits que tu gagnes en utilisant le site. Ils servent à activer des superpouvoirs et à grimper au classement de la semaine.' },
      ],
    },

    'alt-dirtyroulette': {
      slug: 'alternative-dirtyroulette',
      anchor: 'Alternative à DirtyRoulette',
      title: 'Alternative à DirtyRoulette · La Ruleta Caliente',
      description: 'Tu connais DirtyRoulette et cherches un autre chat vidéo pour adultes ? Flirt, mode piquant entre personnes consentantes et jeux. Réservé aux 18 ans et +.',
      h1: 'Alternative à DirtyRoulette : un chat vidéo adulte qui ose le flirt',
      intro: '<p>DirtyRoulette est un site de chat vidéo aléatoire connu d’un public adulte. Si tu cherches une <strong>alternative à DirtyRoulette</strong>, tu veux sans doute la même chose : rencontrer des adultes au hasard, en vidéo, dans une ambiance où le flirt n’est pas tabou. La Ruleta Caliente propose exactement ce terrain de jeu, avec une règle d’or : tout ce qui est osé se fait entre personnes consentantes.</p>',
      sections: [
        {
          h2: 'Un chat vidéo « caliente », mais sans vulgarité imposée',
          html: '<p>Notre nom veut dire « la roulette brûlante » en espagnol, et ce n’est pas un hasard. Le site est pensé pour les adultes qui aiment séduire, taquiner et jouer. Mais personne n’est obligé de suivre : chacun choisit son niveau de piquant. Celles et ceux qui veulent simplement discuter peuvent le faire tranquillement, et les autres activent les options qui leur conviennent.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Pour un public adulte</th><th>Sur La Ruleta Caliente</th></tr></thead><tbody><tr><td>Accès réservé aux majeurs</td><td>✓ Confirmation 18+ à l’entrée, sans inscription</td></tr><tr><td>Mode piquant</td><td>✓ Jeux et mots doux osés, seulement si les deux l’ont activé</td></tr><tr><td>Choisir qui tu vois</td><td>Premium : femmes, hommes, trans ou couples</td></tr><tr><td>Discrétion</td><td>✓ IP invisible ; Incognito masque âge et pays pendant 1 h</td></tr><tr><td>Anti-enregistrement</td><td>✓ Avertissement et filigrane invisible</td></tr><tr><td>Prix</td><td>Gratuit ; Premium 7,99 €/semaine ou 19,99 €/mois</td></tr></tbody></table>',
        },
        {
          h2: 'Le mode piquant, expliqué simplement',
          html: '<p>Activé dans les options, le <strong>mode piquant</strong> débloque une version plus audacieuse des jeux : des défis coquins à <strong>Action ou vérité</strong>, des dilemmes épicés à <strong>Tu préfères ?</strong> et des compliments qui ne laissent pas indifférent. Il n’entre en jeu qu’avec quelqu’un qui l’a lui aussi activé. Si l’un de vous le désactive, la partie s’arrête aussitôt : pas de malentendu possible.</p><p>Les invitations à jouer et l’envoi de mots doux font partie de Premium ; sans abonnement, tu peux tout de même accepter une invitation. Découvre les règles complètes sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Flirter et gagner des piments',
          html: '<p>Les ❤️ que tu reçois pendant les appels te rapportent des <strong>piments</strong> 🌶️, tout comme les parties jouées et les connexions quotidiennes. Le soir, de 22 h à 23 h (heure de Paris), l’Heure chaude les double. Avec ces points, tu peux t’offrir la <strong>Seconde chance</strong> pour voir qui t’a donné un cœur dans les dernières 24 heures et l’ajouter en ami, ou la <strong>Flamme ardente</strong> pour être mis en relation plus vite.</p>',
        },
        {
          h2: 'Ce que Premium change pour un public adulte',
          html: '<p>Premium (7,99 € par semaine ou 19,99 € par mois, sans engagement) te donne la main sur tes rencontres : tu choisis de voir des femmes, des hommes, des personnes trans ou des couples, tu filtres par âge et par distance, et tu peux envoyer des invitations aux jeux épicés plutôt que d’attendre qu’on t’invite. Le site devient aussi sans publicité.</p>',
        },
        {
          h2: 'Entre adultes, la prudence reste de mise',
          html: '<p>Un chat vidéo pour adultes attire aussi des personnes malveillantes. Le piège le plus courant est le chantage à la vidéo intime : ne montre rien que tu ne voudrais pas voir circuler, ne paie jamais et signale immédiatement le compte. Les enregistrements sont interdits ici et les <a href="@rules">règles de la communauté</a> sont appliquées par une équipe humaine. Pour tout savoir, lis nos <a href="@safety">conseils de sécurité</a> et notre page <a href="@adult-video-chat">chat vidéo pour adultes</a>.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente a-t-elle un lien avec DirtyRoulette ?', a: 'Non, aucun. Nous citons ce site seulement pour aider les personnes qui le connaissent à comprendre ce que propose La Ruleta Caliente.' },
        { q: 'Le contenu osé est-il imposé ?', a: 'Non. Le mode piquant est facultatif et ne s’applique qu’entre deux personnes qui l’ont activé. Sans lui, les jeux restent tout public.' },
        { q: 'Comment rester discret ?', a: 'Ton adresse IP n’est pas visible par l’autre personne, et le superpouvoir Incognito cache ton âge et ton pays pendant une heure. Évite aussi de montrer ton visage tant que tu n’es pas à l’aise.' },
      ],
    },

    'alt-coomeet': {
      slug: 'alternative-coomeet',
      anchor: 'Alternative à CooMeet',
      title: 'Alternative à CooMeet · La Ruleta Caliente',
      description: 'Une alternative à CooMeet pour discuter en vidéo ? Chat aléatoire gratuit, filtre femmes ou hommes avec Premium, jeux et traduction. Dès 18 ans.',
      h1: 'Alternative à CooMeet : faire des rencontres en vidéo, à ta façon',
      intro: '<p>CooMeet fait partie des sites de chat vidéo aléatoire que l’on retrouve souvent dans les recherches. Si tu cherches une <strong>alternative à CooMeet</strong>, c’est probablement pour faire des rencontres en vidéo, discuter avec des femmes ou des hommes et voir où la conversation te mène. Voici, en toute transparence, ce que tu peux faire sur La Ruleta Caliente, gratuitement ou avec Premium.</p>',
      sections: [
        {
          h2: 'Deux façons de rencontrer',
          html: '<p><strong>Le mode gratuit</strong> repose entièrement sur le hasard. Tu peux être mis en relation avec n’importe quelle personne majeure connectée, homme, femme, personne trans ou couple, partout dans le monde. C’est idéal si tu aimes les surprises.</p><p><strong>Le mode Premium</strong> te laisse choisir. Tu indiques qui tu veux voir (femmes, hommes, trans ou couples) et tu peux affiner par pays, par proximité et par tranche d’âge. Les détails du filtre sont sur notre page <a href="@video-chat-women">chat vidéo avec des femmes</a>.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Besoin</th><th>Réponse</th></tr></thead><tbody><tr><td>Rencontrer en vidéo, sans installation</td><td>✓ Dans le navigateur, sur mobile ou ordinateur</td></tr><tr><td>Filtre par genre</td><td>Premium (7,99 €/semaine ou 19,99 €/mois)</td></tr><tr><td>Rencontrer près de chez toi</td><td>Premium : filtres pays et proximité</td></tr><tr><td>Garder le contact</td><td>Premium : amis, appels, historique de 30 jours</td></tr><tr><td>Dépasser la barrière de la langue</td><td>✓ Chat texte traduit automatiquement</td></tr><tr><td>Briser la glace</td><td>✓ Jeux, sujets de conversation, Super coucou</td></tr></tbody></table>',
        },
        {
          h2: 'Pour que la rencontre ne s’arrête pas au premier appel',
          html: '<p>Une bonne conversation mérite une suite. Pendant l’appel, le bouton <strong>Ajouter en ami</strong> (Premium) te permet de retrouver la personne plus tard, de voir quand elle est en ligne et de l’appeler directement. Tu as appuyé sur Suivant trop vite ? Le superpouvoir <strong>Retour</strong> propose de vous reconnecter si elle est d’accord. Et la <strong>Seconde chance</strong> montre qui t’a envoyé un ❤️ récemment.</p>',
        },
        {
          h2: 'Essayer Premium sans payer',
          html: '<p>Il existe deux manières d’obtenir du Premium gratuitement. La première : <strong>inviter un ami</strong>. Quand il s’inscrit avec ton lien et a sa première conversation de plus d’une minute, vous gagnez chacun un jour. La seconde : le <strong>classement hebdomadaire</strong>. Chaque lundi, les trois personnes qui ont récolté le plus de piments 🌶️ reçoivent respectivement 7, 3 et 1 jour de Premium. Et si tu t’abonnes, tu peux résilier quand tu veux.</p>',
        },
        {
          h2: 'Avant ton premier appel',
          html: '<p>Quelques points pratiques pour bien démarrer : pas besoin d’inscription, mais tu dois confirmer avoir au moins 18 ans ; un compte (e-mail ou Google) reste facultatif. Le site s’utilise sur ordinateur comme sur téléphone, sans rien installer, et peut être ajouté à ton écran d’accueil. Pense à autoriser la caméra et le micro, choisis un endroit calme et bien éclairé, et prépare une ou deux questions pour lancer la discussion. Le reste se fait naturellement.</p>',
        },
        {
          h2: 'Des rencontres respectueuses',
          html: '<p>Le site est réservé aux 18 ans et plus. Les insultes, l’insistance et les contenus non désirés sont interdits par les <a href="@rules">règles de la communauté</a>, et chaque signalement est examiné par une personne. Quelques réflexes simples te protègent : garde tes coordonnées pour toi au début, refuse toute demande d’argent et quitte la conversation si quelque chose te semble bizarre. Plus de conseils sur notre page <a href="@safety">sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on discuter uniquement avec des femmes ?', a: 'Oui, avec Premium. Le filtre permet de choisir de voir des femmes, des hommes, des personnes trans ou des couples. En gratuit, la mise en relation est aléatoire.' },
        { q: 'La Ruleta Caliente est-elle liée à CooMeet ?', a: 'Non. Il s’agit de deux services distincts, et nous citons CooMeet uniquement pour aider ceux qui le connaissent à comparer.' },
        { q: 'Comment obtenir du Premium gratuitement ?', a: 'En invitant un ami qui s’inscrit avec ton lien et discute plus d’une minute, ou en finissant parmi les trois premiers du classement de la semaine.' },
      ],
    },

    'alt-ometv': {
      slug: 'alternative-ometv',
      anchor: 'Alternative à OmeTV',
      title: 'Alternative à OmeTV · La Ruleta Caliente',
      description: 'Tu utilises OmeTV et veux essayer autre chose ? La Ruleta Caliente : chat vidéo au hasard dans le navigateur, chat traduit, jeux et piments 🌶️. 18+.',
      h1: 'Alternative à OmeTV : un autre chat vidéo au hasard à découvrir',
      intro: '<p>OmeTV est un site de chat vidéo aléatoire parmi d’autres. Si tu cherches une <strong>alternative à OmeTV</strong>, soit par curiosité, soit pour changer d’ambiance, La Ruleta Caliente peut te plaire : même idée de rencontres au hasard en vidéo, mais avec des jeux sous l’image, un système de points gratuits et une communauté réservée aux adultes.</p>',
      sections: [
        {
          h2: 'Prendre ses marques en deux minutes',
          html: '<p>Si tu as déjà utilisé un tchat vidéo aléatoire, tu ne seras pas dépaysé. Tu choisis ton genre, tu confirmes que tu as au moins 18 ans, tu autorises la caméra et c’est parti. Les commandes essentielles tiennent en deux boutons : <strong>Suivant</strong> pour changer de personne, <strong>Arrêter</strong> pour faire une pause. Sur ordinateur, la touche <strong>Échap</strong> fait office de Suivant.</p><p>Le tout fonctionne dans le navigateur, sans programme à installer. Voir aussi : <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Côté pratique</th><th>Chez nous</th></tr></thead><tbody><tr><td>Changer d’interlocuteur</td><td>✓ Suivant ou touche Échap</td></tr><tr><td>Chat écrit</td><td>✓ Traduction automatique des messages</td></tr><tr><td>Caméra</td><td>✓ Changement de caméra et options de vue</td></tr><tr><td>Réactions</td><td>✓ 👍 et ❤️ pendant l’appel</td></tr><tr><td>Jeux</td><td>✓ Quatre jeux et un thermomètre de complicité</td></tr><tr><td>Fonctions avancées</td><td>Premium : filtres, sans pub, amis, historique de 30 jours</td></tr></tbody></table>',
        },
        {
          h2: 'Des défis chaque semaine',
          html: '<p>Si tu aimes avoir un objectif, les <strong>défis hebdomadaires</strong> t’en donnent : parler avec des gens de plusieurs pays, jouer un certain nombre de parties, recevoir des réactions… Chaque défi relevé te rapporte des <strong>piments</strong> 🌶️, et certaines étapes débloquent des <strong>badges</strong>. Les piments font aussi grimper ton nom dans le classement de la semaine, où tu apparais avec ton nom du chat (tu peux choisir de ne pas y figurer).</p><p>Le soir, entre 22 h et 23 h (heure de Paris), c’est l’<strong>Heure chaude</strong> : tous les piments gagnés sont doublés.</p>',
        },
        {
          h2: 'Ton argent, tes choix',
          html: '<p>La mise en relation aléatoire est gratuite et sans limite. Rien ne t’oblige à payer. Si tu veux plus de contrôle, Premium coûte 7,99 € par semaine ou 19,99 € par mois et se résilie à tout moment. Il ajoute le choix du genre, les filtres par pays, proximité et âge, les invitations aux jeux et des superpouvoirs gratuits chaque jour.</p>',
        },
        {
          h2: 'Sur ordinateur comme sur téléphone',
          html: '<p>Tu préfères le grand écran le soir et ton smartphone en journée ? Avec un compte (facultatif), tout te suit : piments, série de connexions, badges et position au classement sont les mêmes sur tous tes appareils. Sur mobile, tu peux basculer entre caméra avant et arrière, et ajouter le site à ton écran d’accueil pour l’ouvrir en plein écran comme une application. Sur ordinateur, la touche Échap remplace le bouton Suivant pour passer plus vite à la rencontre suivante.</p>',
        },
        {
          h2: 'Les règles du jeu',
          html: '<p>Tout le monde ici a 18 ans ou plus. Enregistrer un appel est interdit, un filigrane invisible permet d’identifier le compte qui filme l’écran, et les signalements sont traités par une équipe humaine, avec possibilité de contester une sanction. De ton côté, reste discret sur ta vie privée et passe ton chemin face à toute demande d’argent. Retrouve les <a href="@rules">règles de la communauté</a> et nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente fonctionne-t-elle comme OmeTV ?', a: 'Le principe général est proche : une mise en relation vidéo au hasard. La Ruleta Caliente a ses propres fonctions, comme les jeux, les piments et les superpouvoirs, et n’a aucun lien avec OmeTV.' },
        { q: 'Peut-on changer de personne avec le clavier ?', a: 'Oui. Sur ordinateur, la touche Échap fonctionne comme le bouton Suivant et te met en relation avec quelqu’un d’autre.' },
        { q: 'Faut-il apparaître dans le classement ?', a: 'Non. Tu peux choisir de ne pas apparaître dans le classement de la semaine tout en continuant à voir ta position.' },
      ],
    },

    'alt-chatrandom': {
      slug: 'alternative-chatrandom',
      anchor: 'Alternative à Chatrandom',
      title: 'Alternative à Chatrandom · La Ruleta Caliente',
      description: 'Une alternative à Chatrandom pour discuter en vidéo avec des inconnus du monde entier : chat traduit, jeux, piments 🌶️ et filtres Premium. Dès 18 ans.',
      h1: 'Alternative à Chatrandom : des rencontres vidéo aux quatre coins du monde',
      intro: '<p>Chatrandom est un site de chat vidéo aléatoire. Si tu tapes « <strong>alternative à Chatrandom</strong> » dans un moteur de recherche, tu veux sans doute continuer à rencontrer des gens au hasard, mais découvrir un autre univers. La Ruleta Caliente est un chat vidéo en tête-à-tête pour adultes, accessible depuis ton navigateur, où le hasard rencontre le jeu.</p>',
      sections: [
        {
          h2: 'Voyager depuis ton canapé',
          html: '<p>Une des grandes joies du chat aléatoire, c’est de tomber sur quelqu’un qui vit à des milliers de kilomètres. Ici, la <strong>traduction automatique</strong> du chat texte rend ces échanges beaucoup plus faciles : tu écris en français, ton interlocuteur te lit dans sa langue. L’interface est disponible en français, anglais, espagnol, portugais, allemand et italien.</p><p>Un défi hebdomadaire t’invite même à parler avec des personnes de plusieurs pays différents, et le badge « Polyglotte » récompense ceux qui discutent avec des gens de cinq pays.</p>',
        },
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Catégorie</th><th>Ce qui t’attend</th></tr></thead><tbody><tr><td>Rencontres</td><td>✓ Vidéo 1 à 1 au hasard, gratuite</td></tr><tr><td>International</td><td>✓ Chat traduit ; filtre pays et « Mon pays » avec Premium</td></tr><tr><td>Divertissement</td><td>✓ Action ou vérité, Tu préfères ?, Pierre-feuille-ciseaux, Dessine et devine</td></tr><tr><td>Superpouvoirs</td><td>✓ Flamme ardente, Retour, Super coucou, Incognito, Seconde chance</td></tr><tr><td>Installation</td><td>✓ Aucune ; ajout possible à l’écran d’accueil</td></tr><tr><td>Public</td><td>✓ Uniquement des adultes de 18 ans et plus</td></tr></tbody></table>',
        },
        {
          h2: 'Les superpouvoirs, ton petit avantage',
          html: '<p>Les <strong>superpouvoirs</strong> s’activent avec des piments 🌶️ gagnés gratuitement, ou s’obtiennent chaque jour avec Premium :</p><ul><li><strong>Flamme ardente</strong> : 15 minutes de priorité dans la file d’attente ;</li><li><strong>Retour</strong> : revenir à la personne précédente, si elle accepte ;</li><li><strong>Super coucou</strong> : un message mis en avant dès la prochaine connexion ;</li><li><strong>Incognito</strong> : ton âge et ton pays masqués pendant une heure ;</li><li><strong>Seconde chance</strong> : voir qui t’a donné un ❤️ dans les dernières 24 heures.</li></ul>',
        },
        {
          h2: 'Une soirée type sur La Ruleta Caliente',
          html: '<p>Tu te connectes, ta série quotidienne t’offre quelques piments. Tu enchaînes deux ou trois conversations, dont une avec une personne qui écrit en italien grâce à la traduction. Une partie de Dessine et devine plus tard, le thermomètre de complicité s’emballe et vous gagnez des points tous les deux. Vers 22 h, heure de Paris, l’Heure chaude commence : c’est le moment de boucler un défi de la semaine. Rien d’obligatoire, mais de quoi rendre chaque visite un peu différente.</p>',
        },
        {
          h2: 'Gratuit d’abord, Premium si tu veux',
          html: '<p>Tu peux utiliser le chat vidéo aléatoire autant que tu veux sans payer. Premium (7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment) ajoute le choix du genre, les filtres par pays, proximité et âge, un site sans publicité, un historique de 30 jours et les amis. Pour un aperçu complet, consulte la page <a href="@free-video-chat">chat vidéo gratuit</a>.</p>',
        },
        {
          h2: 'Prudence, partout dans le monde',
          html: '<p>Discuter avec des gens de tous horizons est enrichissant, à condition de rester vigilant. Les arnaques sentimentales commencent souvent par une belle histoire et finissent par une demande d’argent : ne paie jamais quelqu’un que tu as rencontré en ligne. Ton adresse IP reste invisible pour l’autre personne, et le site est réservé aux majeurs. En cas de problème, signale le compte. Nos <a href="@safety">conseils de sécurité</a> te donnent d’autres repères.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on discuter avec des gens d’autres pays ?', a: 'Oui. La mise en relation se fait avec des personnes du monde entier, et le chat texte traduit automatiquement les messages. Avec Premium, tu peux aussi filtrer par pays.' },
        { q: 'La Ruleta Caliente est-elle affiliée à Chatrandom ?', a: 'Non. Les deux sites sont indépendants, et nous citons Chatrandom uniquement pour aider à comparer.' },
        { q: 'Les superpouvoirs sont-ils payants ?', a: 'Non, ils s’activent avec des piments gagnés gratuitement en utilisant le site. Avec Premium, certains sont offerts chaque jour.' },
      ],
    },

    'country-fr': {
      slug: 'chat-video-france',
      anchor: 'Chat vidéo France',
      title: 'Chat vidéo en France, gratuit · La Ruleta Caliente',
      description: 'Tchat vidéo gratuit en France : rencontre des Français ou des gens du monde entier, en direct et en français. Filtre « Mon pays » avec Premium. Dès 18 ans.',
      h1: 'Chat vidéo en France : rencontre en direct, en français',
      intro: '<p>Que tu dises « chat vidéo », « tchat cam » ou « visio avec des inconnus », l’idée est la même : discuter en face à face avec quelqu’un que tu ne connais pas encore. La Ruleta Caliente est un <strong>chat vidéo gratuit</strong> utilisable partout <strong>en France</strong>, de Lille à Marseille, depuis ton téléphone ou ton ordinateur. Le site est entièrement en français et réservé aux 18 ans et plus.</p>',
      sections: [
        {
          h2: 'Un tchat vidéo pensé en français',
          html: '<p>L’interface, l’aide, les jeux et les règles sont disponibles en français. Tu joues à <strong>Action ou vérité</strong>, <strong>Tu préfères ?</strong>, <strong>Pierre-feuille-ciseaux</strong> ou <strong>Dessine et devine</strong> dans ta langue, et les sujets proposés pour briser la glace aussi. Quand tu tombes sur une personne qui parle une autre langue, le chat texte traduit automatiquement ses messages en français et les tiens dans sa langue. Pratique pour réviser ton anglais ou ton espagnol sans stress.</p>',
        },
        {
          h2: 'Rencontrer des gens en France ou ailleurs',
          html: '<p>Par défaut, la roulette te met en relation avec des personnes du monde entier : c’est le charme du hasard. Si tu préfères discuter avec quelqu’un qui vit en France, Premium propose le filtre <strong>« Mon pays »</strong>, ainsi qu’un filtre de <strong>proximité</strong> pour rencontrer des gens plus près de chez toi et un filtre par tranche d’âge. Tu peux aussi choisir de voir des femmes, des hommes, des personnes trans ou des couples.</p><p>Et si tu veux simplement sortir de ta région le temps d’un soir, laisse le hasard faire : une discussion avec quelqu’un de Montréal, de Bruxelles ou de Dakar est à un clic.</p>',
        },
        {
          h2: 'L’Heure chaude, chaque soir à 22 h',
          html: '<p>Tous les soirs, de <strong>22 h à 23 h (heure de Paris)</strong>, c’est l’<strong>Heure chaude</strong> 🔥 : chaque piment 🌶️ gagné compte double. C’est le bon créneau pour relever tes défis de la semaine, jouer quelques parties et faire grimper ta série de connexions. Les piments servent à activer des superpouvoirs comme la <strong>Flamme ardente</strong> ou <strong>Retour</strong>, et chaque lundi, les trois premiers du classement de la semaine gagnent du Premium.</p>',
        },
        {
          h2: 'Prix en euros, sans surprise',
          html: '<p>Le chat vidéo aléatoire est gratuit, sans limite de durée. Premium est payé en euros : <strong>7,99 € par semaine</strong> ou <strong>19,99 € par mois</strong>, résiliable quand tu veux. Une astuce pour l’essayer sans rien payer : envoie ton lien d’invitation à un ami. Quand il s’inscrit et a sa première conversation de plus d’une minute, vous recevez chacun un jour de Premium.</p>',
        },
        {
          h2: 'Sur ton téléphone, sans appli',
          html: '<p>Que tu sois dans le métro, chez toi ou en pause déjeuner, le site s’ouvre dans le navigateur de ton smartphone. Tu peux l’ajouter à ton écran d’accueil pour l’ouvrir comme une application, sans passer par un store. Plus de détails sur notre page <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
        {
          h2: 'Quelques conseils de sécurité',
          html: '<p>Comme sur tout site de rencontres en ligne, garde tes informations personnelles pour toi : nom de famille, adresse, lieu de travail, réseaux sociaux. Ne paie jamais une personne rencontrée sur un chat, même si elle te raconte une histoire émouvante, et méfie-toi de celles qui te pressent de te dévoiler devant la caméra. L’autre ne voit pas ton adresse IP, les enregistrements sont interdits et le bouton <strong>Signaler</strong> déclenche un examen humain. Retrouve tout dans nos <a href="@safety">conseils de sécurité</a> et nos <a href="@rules">règles de la communauté</a>.</p>',
        },
      ],
      faq: [
        { q: 'Le site est-il disponible en français ?', a: 'Oui, entièrement : l’interface, les jeux, l’aide et les règles sont en français. Le chat texte traduit aussi les messages des personnes qui écrivent dans une autre langue.' },
        { q: 'Peut-on discuter uniquement avec des personnes en France ?', a: 'Oui, avec le filtre « Mon pays » inclus dans Premium. En mode gratuit, la mise en relation se fait avec des personnes du monde entier.' },
        { q: 'À quelle heure a lieu l’Heure chaude ?', a: 'Tous les soirs de 22 h à 23 h, heure de Paris. Pendant ce créneau, tous les piments gagnés comptent double.' },
        { q: 'Comment payer Premium en France ?', a: 'Premium se paie en euros : 7,99 € par semaine ou 19,99 € par mois. Tu peux résilier ton abonnement à tout moment.' },
      ],
    },

    'country-be': {
      slug: 'chat-video-belgique',
      anchor: 'Chat vidéo Belgique',
      title: 'Chat vidéo en Belgique, gratuit · La Ruleta Caliente',
      description: 'Chat vidéo gratuit en Belgique : discute en français avec des Belges ou le monde entier ; le chat traduit le néerlandais et l’allemand. Dès 18 ans.',
      h1: 'Chat vidéo en Belgique : rencontre en direct, quelle que soit ta langue',
      intro: '<p>Tu es à Bruxelles, à Liège, à Namur ou à Gand et tu as envie de rencontrer quelqu’un de nouveau ? La Ruleta Caliente est un <strong>chat vidéo gratuit</strong> qui fonctionne partout <strong>en Belgique</strong>, directement dans le navigateur. Tu es mis en relation au hasard avec une personne majeure, en tête-à-tête et en vidéo, et tu passes à la suivante quand tu veux.</p>',
      sections: [
        {
          h2: 'Un pays, plusieurs langues : le chat traduit',
          html: '<p>En Belgique, on passe facilement du français au néerlandais, voire à l’allemand. Sur La Ruleta Caliente, ce n’est pas un obstacle. Le site existe en français, en allemand et dans quatre autres langues, et le chat texte propose une <strong>traduction automatique</strong> : si tu tombes sur un Flamand qui écrit en néerlandais, son message s’affiche traduit, et ta réponse en français lui arrive dans une langue qu’il comprend. L’occasion de discuter avec des gens de l’autre côté de la frontière linguistique… sans réviser tes cours.</p>',
        },
        {
          h2: 'Discuter avec des Belges, ou avec le reste du monde',
          html: '<p>En gratuit, la roulette te met face à des personnes du monde entier. C’est souvent l’occasion de rencontres inattendues : quelqu’un à Lyon, à Lisbonne ou à Montréal. Si tu veux rester entre Belges, Premium propose le filtre <strong>« Mon pays »</strong>, et le filtre de <strong>proximité</strong> pour parler à des gens de ta région. Tu peux aussi choisir le genre des personnes que tu vois et une tranche d’âge.</p>',
        },
        {
          h2: 'L’Heure chaude, le soir à 22 h',
          html: '<p>Chaque soir, de <strong>22 h à 23 h (heure de Paris)</strong>, l’<strong>Heure chaude</strong> double les piments 🌶️ que tu gagnes. Les piments, ce sont les points gratuits du site : tu en récoltes en revenant chaque jour, en jouant, en recevant des ❤️ et en relevant les défis de la semaine. Ils activent des superpouvoirs, comme <strong>Incognito</strong>, qui masque ton âge et ton pays pendant une heure, ou le <strong>Super coucou</strong>, un message mis en avant à la connexion suivante.</p>',
        },
        {
          h2: 'Des jeux pour faire connaissance',
          html: '<p>Pas toujours facile de trouver quoi dire à un inconnu. Pour détendre l’atmosphère, propose une partie : <strong>Tu préfères ?</strong> lance souvent de bons débats, <strong>Dessine et devine</strong> fait rire à coup sûr, et <strong>Action ou vérité</strong> permet d’en apprendre plus sur l’autre. Le thermomètre de complicité monte à mesure que vous vous entendez bien. Tout est expliqué sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Payer en euros',
          html: '<p>Le chat vidéo aléatoire est gratuit et sans limite. Premium, facultatif, coûte <strong>7,99 € par semaine</strong> ou <strong>19,99 € par mois</strong> et se résilie à tout moment. Tu peux aussi en gagner : invite un ami, et quand il s’est inscrit et a eu sa première conversation de plus d’une minute, vous avez chacun un jour de Premium offert.</p>',
        },
        {
          h2: 'Rester prudent',
          html: '<p>Le site est réservé aux 18 ans et plus. Pendant l’appel, ton adresse IP n’est pas visible par l’autre personne et un filigrane invisible dissuade les enregistrements d’écran. De ton côté, ne donne ni ton adresse ni ton numéro, ne verse jamais d’argent à quelqu’un rencontré en ligne et utilise <strong>Signaler</strong> si une conversation dérape : une personne de l’équipe examine le signalement. Pour en savoir plus, lis nos <a href="@safety">conseils de sécurité</a> ou découvre le <a href="@random-video-chat">tchat vidéo aléatoire</a>.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on discuter avec des néerlandophones ?', a: 'Oui. Le chat texte traduit automatiquement les messages, donc tu peux écrire en français à quelqu’un qui te répond en néerlandais.' },
        { q: 'Le chat vidéo est-il gratuit en Belgique ?', a: 'Oui, la mise en relation aléatoire est gratuite. Premium, en option, coûte 7,99 € par semaine ou 19,99 € par mois.' },
        { q: 'Peut-on rencontrer uniquement des personnes en Belgique ?', a: 'Avec Premium, oui : le filtre « Mon pays » et le filtre de proximité te mettent en relation avec des gens plus près de chez toi.' },
      ],
    },

    'country-ch': {
      slug: 'chat-video-suisse',
      anchor: 'Chat vidéo Suisse',
      title: 'Chat vidéo en Suisse, gratuit · La Ruleta Caliente',
      description: 'Chat vidéo gratuit en Suisse : rencontres en direct, chat traduit en allemand, italien ou français. Premium en euros, converti par ta banque. Dès 18 ans.',
      h1: 'Chat vidéo en Suisse : des rencontres en direct, dans toutes les langues',
      intro: '<p>De Genève à Lausanne, de Fribourg à Neuchâtel, et bien au-delà du Röstigraben : La Ruleta Caliente est un <strong>chat vidéo gratuit</strong> accessible partout <strong>en Suisse</strong>. Sans inscription, tu confirmes ton âge, tu allumes ta caméra et tu es mis en relation au hasard avec une personne majeure, en tête-à-tête. Sans appli à installer, depuis ton natel ou ton ordinateur.</p>',
      sections: [
        {
          h2: 'Français, allemand, italien : le chat suit',
          html: '<p>La Suisse vit en plusieurs langues, et le site aussi. L’interface est disponible en <strong>français</strong>, en <strong>allemand</strong> et en <strong>italien</strong> (ainsi qu’en anglais, espagnol et portugais). Le chat texte, lui, traduit automatiquement les messages : tu peux écrire en français à une personne de Zurich qui te répond en allemand, ou à quelqu’un du Tessin qui écrit en italien. Chacun lit l’autre dans sa langue. Une façon sympa de franchir les frontières linguistiques sans quitter ton salon.</p>',
        },
        {
          h2: 'Rencontrer des gens en Suisse',
          html: '<p>Par défaut, la mise en relation est aléatoire et internationale : tu peux tomber sur quelqu’un à Paris, à Madrid ou à Rio. Si tu veux plutôt discuter avec des personnes qui vivent en Suisse, Premium propose le filtre <strong>« Mon pays »</strong>, ainsi que des filtres de <strong>proximité</strong> et d’<strong>âge</strong>. Tu peux également choisir de voir des femmes, des hommes, des personnes trans ou des couples.</p>',
        },
        {
          h2: 'Prix en euros, convertis par ta banque',
          html: '<p>Le chat vidéo aléatoire est gratuit et n’a pas de limite de temps. Premium est facturé en euros : <strong>7,99 € par semaine</strong> ou <strong>19,99 € par mois</strong>. Si ta carte est en francs suisses, c’est <strong>ta banque qui convertit</strong> le montant au moment du paiement, selon ses propres conditions. L’abonnement se résilie quand tu veux. Et pour l’essayer gratuitement, invite un ami : quand il s’inscrit avec ton lien et discute plus d’une minute, vous gagnez chacun un jour de Premium.</p>',
        },
        {
          h2: 'L’Heure chaude et les piments',
          html: '<p>Chaque soir de <strong>22 h à 23 h (heure de Paris)</strong>, l’<strong>Heure chaude</strong> double tous les piments 🌶️ gagnés. Ces points gratuits s’obtiennent en te connectant chaque jour, en jouant, en recevant des ❤️ et en relevant les défis hebdomadaires. Ils activent des superpouvoirs : la <strong>Flamme ardente</strong> pour être mis en relation plus vite, ou la <strong>Seconde chance</strong> pour retrouver qui t’a envoyé un cœur. Les trois premiers du classement de la semaine gagnent du Premium chaque lundi.</p>',
        },
        {
          h2: 'Un peu de jeu dans la conversation',
          html: '<p>Les jeux s’affichent sous la vidéo, sans cacher personne : <strong>Action ou vérité</strong>, <strong>Tu préfères ?</strong>, <strong>Pierre-feuille-ciseaux</strong> et <strong>Dessine et devine</strong>. Les adultes qui le souhaitent peuvent activer le <strong>mode piquant</strong>, qui ne s’applique qu’avec une personne l’ayant aussi activé. Pour découvrir l’ensemble, va sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Discrétion et sécurité',
          html: '<p>On tient à sa vie privée, et c’est bien normal. Sur La Ruleta Caliente, l’autre personne ne voit jamais ton adresse IP, car la vidéo passe par notre serveur. Les enregistrements sont interdits et un filigrane invisible permet de retrouver le compte qui filme l’écran. Le site est réservé aux 18 ans et plus. Ne partage ni ton adresse ni tes coordonnées bancaires, et signale tout comportement suspect. D’autres conseils t’attendent sur notre page <a href="@safety">sécurité</a> et sur la page <a href="@talk-to-strangers">parler à des inconnus</a>.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on payer Premium en francs suisses ?', a: 'Premium est facturé en euros (7,99 € par semaine ou 19,99 € par mois). Si ta carte est en francs suisses, ta banque convertit le montant automatiquement.' },
        { q: 'Le chat fonctionne-t-il avec des Suisses alémaniques ?', a: 'Oui. Le chat texte traduit automatiquement les messages : tu écris en français et la personne lit en allemand, et inversement.' },
        { q: 'Faut-il télécharger une application en Suisse ?', a: 'Non. Le site fonctionne dans le navigateur de ton téléphone ou de ton ordinateur, et tu peux l’ajouter à ton écran d’accueil si tu le souhaites.' },
      ],
    },

    'country-ca': {
      slug: 'chat-video-quebec-canada',
      anchor: 'Chat vidéo Québec',
      title: 'Chat vidéo au Québec et au Canada · La Ruleta Caliente',
      description: 'Clavarde en vidéo gratuitement au Québec et au Canada : rencontres en direct en français, chat traduit en anglais. Prix en euros convertis par ta banque.',
      h1: 'Chat vidéo au Québec et au Canada : clavarde en direct, en français',
      intro: '<p>Que tu dises « chat vidéo », « clavardage » ou juste « jaser avec du monde », La Ruleta Caliente te permet de rencontrer des inconnus en direct, en vidéo et en tête-à-tête. C’est un <strong>chat vidéo gratuit</strong> qui fonctionne partout <strong>au Québec et au Canada</strong>, de Montréal à Québec, de Gatineau à Moncton, directement dans ton navigateur. Le site est entièrement en français et réservé aux 18 ans et plus.</p>',
      sections: [
        {
          h2: 'Clavarder en français… et en anglais',
          html: '<p>Au Canada, on passe souvent d’une langue à l’autre dans la même journée. Le site est offert en français et en anglais (et en quatre autres langues), et le chat texte qui accompagne la vidéo <strong>traduit automatiquement</strong> les messages. Tu peux donc écrire en français à quelqu’un de Toronto ou de Vancouver qui te répond en anglais : chacun lit l’autre dans sa langue. Et si tu tombes sur une personne d’Amérique latine, la traduction fonctionne aussi avec l’espagnol et le portugais.</p>',
        },
        {
          h2: 'Jaser avec du monde d’ici ou d’ailleurs',
          html: '<p>En gratuit, la roulette est internationale : tu peux te retrouver face à quelqu’un en France, en Belgique, au Mexique ou au Brésil. C’est parfait pour découvrir d’autres accents et d’autres façons de vivre. Si tu préfères parler avec du monde au Canada, Premium propose le filtre <strong>« Mon pays »</strong>, ainsi que des filtres de <strong>proximité</strong> et d’<strong>âge</strong>. Tu peux aussi choisir de voir des femmes, des hommes, des personnes trans ou des couples.</p>',
        },
        {
          h2: 'L’Heure chaude, à l’heure de Paris',
          html: '<p>L’<strong>Heure chaude</strong> 🔥 a lieu tous les jours de <strong>22 h à 23 h, heure de Paris</strong> : pendant ce créneau, tous les piments 🌶️ gagnés comptent double. Comme le Canada n’est pas sur le même fuseau horaire que l’Europe, vérifie à quelle heure ça tombe chez toi ; le site t’indique aussi quand aura lieu la prochaine. Les piments, gagnés en revenant chaque jour, en jouant et en recevant des ❤️, activent des superpouvoirs comme <strong>Retour</strong> ou <strong>Incognito</strong>.</p>',
        },
        {
          h2: 'Prix en euros, convertis en dollars par ta banque',
          html: '<p>Le chat vidéo aléatoire est gratuit, sans limite de temps. Premium est facturé en euros : <strong>7,99 € par semaine</strong> ou <strong>19,99 € par mois</strong>. Ta banque ou l’émetteur de ta carte <strong>convertit le montant en dollars canadiens</strong> lors du paiement, selon ses propres conditions. L’abonnement se résilie quand tu veux. Pour l’essayer sans payer, invite un ami : quand il s’inscrit avec ton lien et a sa première conversation de plus d’une minute, vous recevez chacun un jour de Premium.</p>',
        },
        {
          h2: 'Des jeux pour casser la glace',
          html: '<p>Gêné de commencer ? Propose une partie de <strong>Tu préfères ?</strong>, d’<strong>Action ou vérité</strong>, de <strong>Pierre-feuille-ciseaux</strong> ou de <strong>Dessine et devine</strong>, directement sous la vidéo. Le thermomètre de complicité grimpe quand ça clique entre vous. Envie de voir comment tout ça fonctionne avant de te lancer ? La page <a href="@how">Comment ça marche</a> t’explique tout.</p>',
        },
        {
          h2: 'Clavarder en sécurité',
          html: '<p>Le site est réservé aux 18 ans et plus. Pendant l’appel, ton adresse IP reste cachée, car la vidéo passe par notre serveur, et un filigrane invisible décourage les enregistrements. De ton côté, ne donne pas ton nom complet ni ton adresse, refuse toute demande d’argent ou de cartes-cadeaux, et méfie-toi de qui te presse de te montrer devant la caméra. Le bouton <strong>Signaler</strong> déclenche un examen par une personne de l’équipe. Plus de trucs dans nos <a href="@safety">conseils de sécurité</a> et sur la page <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
      ],
      faq: [
        { q: 'Le site est-il en français pour le Québec ?', a: 'Oui, tout le site est disponible en français. Le chat texte traduit aussi automatiquement les messages écrits en anglais ou dans d’autres langues.' },
        { q: 'Peut-on payer Premium en dollars canadiens ?', a: 'Premium est facturé en euros, 7,99 € par semaine ou 19,99 € par mois. Ta banque convertit le montant en dollars canadiens lors du paiement.' },
        { q: 'À quelle heure est l’Heure chaude au Québec ?', a: 'L’Heure chaude a lieu de 22 h à 23 h, heure de Paris. Vérifie le décalage avec ton fuseau horaire ; le site t’indique aussi quand aura lieu la prochaine.' },
      ],
    },

    'no-signup-video-chat': {
      slug: 'chat-video-sans-inscription',
      anchor: 'Chat vidéo sans inscription',
      title: 'Chat vidéo sans inscription · La Ruleta Caliente',
      description: 'Chat vidéo sans inscription : ni e-mail ni mot de passe. Choisis ton genre, ta date de naissance, confirme tes 18 ans et discute en direct, gratuitement.',
      h1: 'Chat vidéo sans inscription : discute en direct sans créer de compte',
      intro: '<p>Tu veux juste voir quelqu’un en vidéo, là, maintenant, sans remplir un formulaire de trois pages ? Sur La Ruleta Caliente, le <strong>chat vidéo sans inscription</strong> est la porte d’entrée par défaut : aucune adresse e-mail, aucun mot de passe, aucun numéro de téléphone. Tu indiques trois informations, tu autorises ta caméra et la première conversation démarre quelques secondes plus tard.</p><p>Le site reste réservé aux adultes : ce que l’on te demande sert uniquement à vérifier que tu as 18 ans ou plus et à te proposer des personnes cohérentes avec ton choix.</p>',
      sections: [
        {
          h2: 'Les trois étapes avant ta première vidéo',
          html: '<p>Entrer en tant qu’invité prend moins de temps que de lire cette page. Voici exactement ce qui t’est demandé :</p><ol><li><strong>Ton genre</strong>, pour que la mise en relation fonctionne correctement ;</li><li><strong>Ta date de naissance</strong>, parce que le chat n’est ouvert qu’aux majeurs ;</li><li><strong>Une confirmation</strong> que tu as bien 18 ans ou plus et que tu acceptes les règles.</li></ol><p>C’est tout. Ensuite ton navigateur demande l’accès à la caméra et au micro, tu appuies sur Commencer et le hasard fait le reste. Pas de lien de validation à attendre dans ta boîte mail, pas de mot de passe à inventer puis à oublier.</p>',
        },
        {
          h2: 'Pourquoi un chat vidéo sans inscription change tout',
          html: '<p>Beaucoup de gens abandonnent un site dès qu’on leur demande de créer un compte. C’est compréhensible : on ne sait pas encore si l’ambiance va plaire, et on n’a pas envie de laisser son adresse partout. Ici, tu peux tester librement, faire dix conversations, revenir le lendemain ou ne jamais revenir.</p><ul><li><strong>Moins de données</strong> te concernant circulent : pas d’e-mail stocké si tu restes invité.</li><li><strong>Plus de spontanéité</strong> : tu passes de l’envie de discuter à la conversation en un instant.</li><li><strong>Aucun engagement</strong> : rien à résilier, rien à supprimer si tu changes d’avis.</li></ul>',
        },
        {
          h2: 'Ce que tu peux faire sans compte',
          html: '<p>En invité, tu as accès à l’essentiel du site : la mise en relation au hasard, le bouton <strong>Suivant</strong> (ou la touche Échap) pour changer de personne, <strong>Arrêter</strong> pour souffler, le chat texte avec traduction automatique, les réactions 👍 ❤️ et le changement de caméra. Tu peux aussi accepter ou proposer des parties de jeux pendant l’appel et gagner tes premiers piments 🌶️.</p><p>Envie de varier les plaisirs ? Jette un œil à nos <a href="@video-chat-games">jeux pour appel vidéo</a> ou découvre comment fonctionne le <a href="@random-video-chat">tchat vidéo aléatoire</a>.</p>',
        },
        {
          h2: 'Et si un jour tu veux un compte ?',
          html: '<p>Le compte est <strong>facultatif</strong>. Tu peux le créer plus tard avec une adresse e-mail ou ton compte Google si tu veux retrouver ta progression (piments, série de jours, badges) sur ton téléphone et ton ordinateur. Il devient obligatoire dans un seul cas : si tu souhaites payer Premium (7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment), qui ajoute notamment le choix du genre et les filtres par pays, proximité et âge.</p><table><thead><tr><th>Usage</th><th>Invité</th><th>Avec compte</th></tr></thead><tbody><tr><td>Discuter en vidéo au hasard</td><td>✓</td><td>✓</td></tr><tr><td>Chat texte traduit, jeux, réactions</td><td>✓</td><td>✓</td></tr><tr><td>Progression sur plusieurs appareils</td><td>—</td><td>✓</td></tr><tr><td>Souscrire à Premium</td><td>—</td><td>✓</td></tr></tbody></table>',
        },
        {
          h2: 'Sans inscription, mais pas sans règles',
          html: '<p>Ne pas créer de compte ne veut pas dire que tout est permis. Les <a href="@rules">règles de la communauté</a> s’appliquent à tout le monde, le bouton <strong>Signaler</strong> déclenche une vérification humaine et les comportements abusifs mènent à une exclusion. Pendant l’appel, la vidéo transite par notre serveur, donc ton adresse IP n’est jamais visible pour l’autre personne.</p><p>De ton côté, garde un réflexe simple : ce que tu ne mets pas dans un formulaire, ne le donne pas non plus dans la conversation (nom complet, adresse, réseaux sociaux). Pour aller plus loin, lis notre guide pour <a href="@guide-privacy">protéger ta vie privée</a>.</p>',
        },
      ],
      faq: [
        { q: 'Faut-il une adresse e-mail pour utiliser le chat vidéo ?', a: 'Non. Pour entrer, tu choisis ton genre, tu indiques ta date de naissance et tu confirmes avoir 18 ans ou plus. L’e-mail n’est demandé que si tu décides de créer un compte.' },
        { q: 'À quoi sert le compte, alors ?', a: 'Le compte facultatif, avec ton e-mail ou Google, garde ta progression d’un appareil à l’autre. Il est aussi nécessaire pour payer Premium.' },
        { q: 'Le chat vidéo sans inscription est-il gratuit ?', a: 'Oui, discuter au hasard ne coûte rien. Seul Premium est payant, et il nécessite alors un compte.' },
        { q: 'Pourquoi demander ma date de naissance ?', a: 'Parce que le site est strictement réservé aux personnes majeures. Cette information permet de refuser l’accès aux moins de 18 ans.' },
      ],
    },

    'anonymous-video-chat': {
      slug: 'chat-video-anonyme',
      anchor: 'Chat vidéo anonyme',
      title: 'Chat vidéo anonyme et discret · La Ruleta Caliente',
      description: 'Chat vidéo anonyme : pas d’e-mail, IP invisible, pseudo facultatif, filigrane contre les enregistrements. Discute avec des inconnus en restant discret. 18+.',
      h1: 'Chat vidéo anonyme : rencontrer des inconnus en gardant ta discrétion',
      intro: '<p>Parler à quelqu’un que tu ne connais pas, sans qu’il sache qui tu es : c’est ce que la plupart des gens attendent d’un <strong>chat vidéo anonyme</strong>. Sur La Ruleta Caliente, tu n’as besoin ni d’e-mail ni de vrai nom pour discuter, et ton adresse IP n’est jamais montrée à ton interlocuteur. Tu choisis ce que tu dévoiles, et à quel moment.</p><p>Soyons honnêtes dès le départ : l’anonymat ici protège ta vie privée face aux autres utilisateurs, il ne sert pas à échapper aux règles. Le site est réservé aux 18 ans et plus et les abus sont sanctionnés.</p>',
      sections: [
        {
          h2: 'Ce qui reste privé dans ce chat vidéo anonyme',
          html: '<ul><li><strong>Pas d’e-mail obligatoire</strong> : tu entres comme invité, avec ton genre, ta date de naissance et la confirmation de ta majorité.</li><li><strong>Adresse IP masquée</strong> : la vidéo passe par notre serveur, donc la personne en face ne peut pas récupérer ton IP ni deviner ta localisation précise.</li><li><strong>Pseudo facultatif</strong> : tu n’es pas obligé d’afficher un nom, et encore moins le vrai.</li><li><strong>Filigrane invisible</strong> : chaque flux vidéo porte une marque discrète qui décourage les enregistrements, rappelés comme interdits pendant l’appel.</li></ul>',
        },
        {
          h2: 'Ce que l’anonymat ne veut pas dire',
          html: '<p>Aucun service en ligne ne peut promettre un anonymat total, et nous ne le faisons pas. Si quelqu’un te signale, l’équipe examine la situation et peut exclure un compte qui enfreint les <a href="@rules">règles de la communauté</a>. En cas de doute sur l’âge d’une personne, une vérification peut être demandée. Une procédure de recours existe si tu estimes qu’une décision est injuste.</p><p>Autrement dit : tu es anonyme vis-à-vis des inconnus, pas au-dessus des règles. C’est justement ce qui permet à chacun de se sentir en confiance.</p>',
        },
        {
          h2: 'Ton visage, ta décision',
          html: '<p>Discuter en vidéo signifie montrer ton image, mais tu gardes la main. Tu peux cadrer ta caméra pour ne pas montrer ta chambre, utiliser le flou d’arrière-plan de ton téléphone si celui-ci le propose, ou commencer par le chat texte avant de te sentir à l’aise. Avec des piments 🌶️, le superpouvoir <strong>Incognito</strong> te donne encore plus de discrétion pendant ta session.</p><p>Pense aussi à ce qu’on voit derrière toi : un courrier posé sur le bureau, un maillot de club local, une fenêtre donnant sur un monument connu. Notre guide pour <a href="@guide-camera">bien paraître à la caméra</a> donne quelques astuces de cadrage utiles.</p>',
        },
        {
          h2: 'Les petits gestes qui font la vraie différence',
          html: '<p>La technique protège ton adresse IP ; tes réflexes protègent le reste. Quelques habitudes simples :</p><ol><li>utilise un prénom d’emprunt si tu en donnes un ;</li><li>ne cite ni ton employeur, ni ton école, ni ton quartier ;</li><li>refuse de passer sur une autre application tant que tu ne connais pas la personne ;</li><li>ne montre jamais de papiers d’identité, de carte bancaire ou de photos intimes ;</li><li>quitte la conversation avec <strong>Suivant</strong> dès que quelque chose te met mal à l’aise, puis signale-la.</li></ol><p>Tous ces conseils sont détaillés dans notre guide pour <a href="@guide-privacy">protéger ta vie privée en chat vidéo</a>.</p>',
        },
        {
          h2: 'Discret, mais pas ennuyeux',
          html: '<p>Rester discret ne t’empêche pas de t’amuser. Les jeux pendant l’appel (Tu préfères ?, Action ou vérité, Pierre-feuille-ciseaux, Dessine et devine) permettent de créer un lien sans rien révéler de personnel. Le chat texte avec traduction automatique t’ouvre aussi des conversations avec des gens qui ne parlent pas ta langue. Et si tu veux encore moins de formalités, tout est expliqué sur la page <a href="@no-signup-video-chat">chat vidéo sans inscription</a>.</p>',
        },
      ],
      faq: [
        { q: 'Les autres peuvent-ils voir mon adresse IP ?', a: 'Non. Pendant l’appel, la vidéo transite par notre serveur, ce qui empêche ton interlocuteur de voir ton adresse IP.' },
        { q: 'Le chat vidéo est-il totalement anonyme ?', a: 'Tu restes anonyme face aux autres utilisateurs, mais les règles s’appliquent : les signalements sont examinés et une vérification d’âge peut être demandée.' },
        { q: 'Dois-je montrer mon visage ?', a: 'C’est un chat vidéo, donc la caméra est au cœur de l’expérience, mais tu choisis ton cadrage. Tu peux aussi commencer par écrire avant de te sentir à l’aise.' },
        { q: 'Quelqu’un peut-il m’enregistrer ?', a: 'Enregistrer est interdit et un filigrane invisible décourage les captures d’écran et les vidéos pirates. Si tu soupçonnes un enregistrement, quitte l’appel et signale la personne.' },
      ],
    },

    'couples-video-chat': {
      slug: 'chat-video-couple',
      anchor: 'Chat vidéo en couple',
      title: 'Chat vidéo pour couples · La Ruleta Caliente',
      description: 'Chat vidéo pour couples : entrez comme couple, jouez à deux devant la caméra et rencontrez d’autres couples avec Premium. Réservé aux 18 ans et plus.',
      h1: 'Chat vidéo pour couples : rencontrer du monde à deux',
      intro: '<p>Vous êtes deux devant l’écran et vous avez envie de rencontrer d’autres gens, ensemble ? Le <strong>chat vidéo pour couples</strong> de La Ruleta Caliente vous permet d’entrer en tant que couple et de partager une conversation en direct avec des inconnus du monde entier. Une soirée à la maison qui sort de l’ordinaire, sans rien installer.</p><p>Comme pour tout le site, les deux personnes devant la caméra doivent avoir 18 ans ou plus.</p>',
      sections: [
        {
          h2: 'Entrer en tant que couple',
          html: '<p>Au moment de choisir ton genre, sélectionne simplement l’option <strong>couple</strong>. Ainsi, les personnes que vous rencontrez savent dès le départ qu’elles vont parler à deux personnes, ce qui évite les malentendus. Pas besoin de compte : la date de naissance et la confirmation de majorité suffisent, comme pour n’importe quel invité.</p><p>Installez-vous de façon à apparaître tous les deux dans le cadre. Un ordinateur portable posé à hauteur des yeux, ou un téléphone sur un support un peu en retrait, fonctionne mieux qu’un appareil tenu à la main.</p>',
        },
        {
          h2: 'Trouver d’autres couples grâce au chat vidéo couple',
          html: '<p>Par défaut, la mise en relation est aléatoire : vous pouvez tomber sur des femmes, des hommes, des personnes trans ou d’autres couples. Si vous préférez échanger uniquement avec des couples, Premium permet de <strong>choisir qui voir</strong>. Il coûte 7,99 € par semaine ou 19,99 € par mois, se résilie quand vous voulez et nécessite un compte (e-mail ou Google).</p><p>Premium ajoute aussi les filtres par pays, proximité et âge, la suppression des publicités, un historique de 30 jours et la possibilité d’ajouter des amis pour les rappeler plus tard. Pratique si vous avez sympathisé avec un autre duo.</p>',
        },
        {
          h2: 'Des jeux qui se jouent mieux à deux',
          html: '<p>Les jeux intégrés prennent une autre dimension quand on est trois ou quatre dans la conversation :</p><ul><li><strong>Action ou vérité</strong> : chacun de vous peut répondre, ou vous vous concertez avant de choisir.</li><li><strong>Tu préfères ?</strong> : comparez vos réponses en direct, les désaccords font souvent rire.</li><li><strong>Dessine et devine</strong> : l’un dessine, l’autre souffle… ou sabote.</li><li><strong>Pierre-feuille-ciseaux</strong> pour départager qui pose la prochaine question.</li></ul><p>Pour les couples qui aiment pimenter les choses, le <strong>mode piquant</strong> propose des questions et des compliments plus osés, uniquement avec des personnes qui l’ont activé elles aussi. Tous les détails sur nos <a href="@video-chat-games">jeux pour appel vidéo</a>.</p>',
        },
        {
          h2: 'Se mettre d’accord avant d’allumer la caméra',
          html: '<p>Une bonne soirée en couple sur un chat vidéo commence par une discussion entre vous deux. Mettez-vous d’accord sur ce que vous avez envie de vivre et sur ce qui ne vous convient pas : ce que vous montrez, les sujets que vous abordez, le moment où l’on passe à quelqu’un d’autre. Un mot ou un geste convenu pour dire « on change » évite les situations gênantes.</p><p>Et si l’un de vous deux n’est plus à l’aise, on clique sur <strong>Suivant</strong> ou <strong>Arrêter</strong>, sans discussion. Notre guide pour <a href="@guide-flirting">flirter en chat vidéo avec respect</a> donne d’autres pistes.</p>',
        },
        {
          h2: 'Votre vie privée, à deux',
          html: '<p>Être en couple ne dispense pas des précautions habituelles. Ne montrez pas de photos de famille, de courrier ou d’éléments qui permettent de vous localiser. Ne donnez pas vos noms complets ni vos comptes de réseaux sociaux à des personnes rencontrées il y a cinq minutes. Votre adresse IP reste cachée pendant l’appel, les enregistrements sont interdits et le bouton <strong>Signaler</strong> mène à une vérification humaine. Pour le reste, voyez nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Comment indiquer que nous sommes un couple ?', a: 'Au moment de choisir ton genre en entrant, sélectionne l’option couple. Les personnes que vous rencontrez le voient et savent à quoi s’attendre.' },
        { q: 'Peut-on rencontrer uniquement d’autres couples ?', a: 'Oui, avec Premium, qui permet de choisir de voir des couples. Sans Premium, la mise en relation reste aléatoire.' },
        { q: 'Les deux personnes doivent-elles être majeures ?', a: 'Oui. Toute personne visible à l’écran doit avoir 18 ans ou plus, sans exception.' },
      ],
    },

    'cam-to-cam': {
      slug: 'cam-to-cam',
      anchor: 'Cam to cam',
      title: 'Cam to cam gratuit en direct · La Ruleta Caliente',
      description: 'Cam to cam en direct et en tête-à-tête : ta webcam face à celle d’un inconnu, au hasard, depuis ton navigateur. Gratuit pour commencer, réservé aux 18+.',
      h1: 'Cam to cam : un tchat webcam en tête-à-tête, en direct',
      intro: '<p>Le <strong>cam to cam</strong>, c’est la forme la plus directe de la rencontre en ligne : ta webcam d’un côté, celle d’une autre personne de l’autre, et rien entre vous deux. Sur La Ruleta Caliente, chaque conversation est un face-à-face vidéo en direct, en 1 contre 1, avec quelqu’un choisi au hasard. Pas de salon bondé, pas de spectateurs, pas de vidéos enregistrées.</p>',
      sections: [
        {
          h2: 'Le cam to cam, concrètement',
          html: '<p>On parle aussi de « tchat cam », de « chat webcam » ou de « cam2cam ». L’idée est toujours la même : deux caméras allumées, deux personnes qui se voient et s’entendent en temps réel. Contrairement à un salon de discussion collectif, personne d’autre ne regarde. Et contrairement à une plateforme de diffusion, il n’y a pas un public d’un côté et un artiste de l’autre : vous êtes deux participants à égalité.</p><p>Ici, tout se passe dans le navigateur, sur ordinateur ou sur téléphone. Tu peux aussi ajouter le site à ton écran d’accueil pour l’ouvrir comme une application.</p>',
        },
        {
          h2: 'Lancer ton premier cam to cam en une minute',
          html: '<ol><li>Ouvre le site et entre sans inscription : genre, date de naissance, confirmation de tes 18 ans.</li><li>Autorise l’accès à la webcam et au micro quand ton navigateur le demande.</li><li>Appuie sur Commencer : une personne s’affiche en face de toi.</li><li>Pas d’accroche ? <strong>Suivant</strong> ou la touche Échap. Besoin d’une pause ? <strong>Arrêter</strong>.</li></ol><p>Sur téléphone, le bouton de changement de caméra te permet de passer de la caméra frontale à celle de derrière, par exemple pour montrer le paysage pendant un voyage. Plus d’astuces sur la page <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
        {
          h2: 'Ce qui rend un tchat webcam agréable',
          html: '<p>Le face-à-face vidéo est exigeant : l’image et le son comptent autant que ce que tu dis. Trois points font la différence :</p><ul><li><strong>La lumière</strong> devant toi, jamais derrière (une fenêtre dans ton dos te transforme en silhouette).</li><li><strong>Le son</strong> : des écouteurs évitent l’écho et rendent la conversation plus intime.</li><li><strong>La stabilité</strong> : pose ton téléphone plutôt que de le tenir à bout de bras.</li></ul><p>Notre guide pour <a href="@guide-camera">être à ton avantage devant la webcam</a> détaille tout cela, du cadrage à la connexion.</p>',
        },
        {
          h2: 'Plus qu’un simple face-à-face',
          html: '<p>Si les mots manquent, La Ruleta Caliente propose des jeux à lancer pendant l’appel : Tu préfères ?, Action ou vérité, Pierre-feuille-ciseaux et Dessine et devine. Un thermomètre de complicité suit l’ambiance, et des sujets de conversation s’affichent pour relancer l’échange. Le chat texte traduit automatiquement les messages, ce qui permet un cam to cam même avec quelqu’un qui ne parle pas français.</p><p>Envie de choisir qui tu vois ? Premium (7,99 € par semaine ou 19,99 € par mois) ajoute le choix du genre et les filtres par pays, proximité et âge. Pour une ambiance plus adulte, découvre la page <a href="@adult-video-chat">chat vidéo pour adultes</a>.</p>',
        },
        {
          h2: 'Rester serein face caméra',
          html: '<p>Le cam to cam est réservé aux 18 ans et plus. Ta webcam montre ton visage, mais pas ton adresse IP : la vidéo passe par notre serveur. Les enregistrements sont interdits, ce qu’un message rappelle à chacun, et un filigrane invisible est là pour les décourager. Si quelqu’un insiste pour que tu montres plus que tu ne veux, ou te demande de l’argent, coupe et signale. Nos <a href="@safety">conseils de sécurité</a> expliquent comment repérer le chantage à la webcam.</p>',
        },
      ],
      faq: [
        { q: 'Le cam to cam est-il gratuit ?', a: 'Oui, les conversations webcam au hasard sont gratuites et sans limite de durée. Premium est une option payante pour choisir qui tu vois.' },
        { q: 'Faut-il une webcam externe ?', a: 'Non, la caméra intégrée de ton ordinateur portable ou de ton téléphone suffit. Une bonne lumière compte souvent plus que la qualité du capteur.' },
        { q: 'D’autres personnes peuvent-elles regarder ma conversation ?', a: 'Non. Chaque conversation se déroule en tête-à-tête entre deux participants, sans spectateurs.' },
        { q: 'Puis-je faire du cam to cam depuis mon téléphone ?', a: 'Oui, le site fonctionne dans le navigateur de ton smartphone, sans application à télécharger.' },
      ],
    },

    'video-chat-games': {
      slug: 'jeux-appel-video',
      anchor: 'Jeux pour appel vidéo',
      title: 'Jeux pour appel vidéo à deux · La Ruleta Caliente',
      description: 'Jeux pour appel vidéo : Action ou vérité, Tu préfères ?, Pierre-feuille-ciseaux et Dessine et devine, sans couper la vidéo. Gagne des piments 🌶️. 18+.',
      h1: 'Jeux pour appel vidéo : brise la glace sans couper la caméra',
      intro: '<p>Les premières secondes d’un appel avec un inconnu sont souvent les plus délicates. Les <strong>jeux pour appel vidéo</strong> de La Ruleta Caliente sont là pour ça : quatre mini-jeux que tu lances en plein milieu de la conversation, qui s’affichent sous l’image et qui transforment un silence gêné en fou rire. Pas d’application en plus, pas de lien à envoyer : tout est déjà intégré au chat vidéo.</p>',
      sections: [
        {
          h2: 'Les quatre jeux disponibles pendant l’appel',
          html: '<h3>Action ou vérité</h3><p>Le grand classique des soirées, adapté à la vidéo. Chacun choisit à son tour : répondre franchement à une question ou relever un petit défi devant la caméra.</p><h3>Tu préfères ?</h3><p>Deux options, un seul choix. Parfait pour découvrir les goûts de l’autre et lancer un débat sans effort.</p><h3>Pierre-feuille-ciseaux</h3><p>Un duel rapide pour départager qui pose la prochaine question, ou simplement pour rire.</p><h3>Dessine et devine</h3><p>L’un dessine, l’autre devine. Aucun talent artistique requis : les dessins ratés sont souvent les plus drôles.</p>',
        },
        {
          h2: 'Thermomètre de complicité et sujets de conversation',
          html: '<p>En plus des jeux, deux outils aident la conversation à décoller. Le <strong>thermomètre de complicité</strong> monte quand l’échange se réchauffe : réponses partagées, réactions ❤️, parties terminées ensemble. Et si tu ne sais pas quoi dire, des <strong>sujets pour briser la glace</strong> s’affichent pour relancer la discussion. Pour d’autres idées d’accroches, lis notre guide <a href="@guide-icebreakers">pour commencer une conversation en chat vidéo</a>.</p>',
        },
        {
          h2: 'Le mode piquant, pour les jeux d’adultes consentants',
          html: '<p>Le site est réservé aux 18 ans et plus, et certains aiment donner à leurs parties une tournure plus coquine. Le <strong>mode piquant</strong> ajoute des questions, des défis et des compliments plus osés. Il ne s’active qu’entre deux personnes qui l’ont choisi toutes les deux : si ton interlocuteur ne l’a pas activé, tu restes sur la version classique. Personne ne se retrouve face à une question piquante sans l’avoir voulu.</p><p>Et même en mode piquant, chacun peut refuser un défi, changer de jeu ou passer à quelqu’un d’autre. C’est un jeu, pas une obligation.</p>',
        },
        {
          h2: 'Jouer rapporte des piments 🌶️',
          html: '<p>Chaque partie te fait gagner des <strong>piments</strong>, les points gratuits du site. Tu en gagnes aussi en revenant chaque jour, en recevant des ❤️ et en relevant les défis de la semaine. Pendant l’<strong>Heure chaude</strong>, chaque soir de 22 h à 23 h (heure de Paris), ils comptent double.</p><ul><li><strong>Flamme ardente</strong> te fait passer en priorité dans la file d’attente ;</li><li><strong>Retour</strong> te reconnecte à la personne précédente si elle accepte ;</li><li><strong>Super coucou</strong>, <strong>Incognito</strong> et <strong>Seconde chance</strong> complètent la panoplie.</li></ul><p>Les piments font aussi grimper au classement hebdomadaire : chaque lundi, les trois premiers gagnent 7, 3 et 1 jour de Premium. Le détail de chaque règle se trouve sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Bien jouer, c’est aussi savoir s’arrêter',
          html: '<p>Un défi ne doit jamais devenir une pression. Si quelqu’un te pousse à faire quelque chose qui ne te plaît pas, à montrer ton visage de plus près, à donner ton numéro ou à te déshabiller, refuse, clique sur <strong>Suivant</strong> et signale. Les signalements sont examinés par une personne de l’équipe. Envie de jouer à deux avec ton ou ta partenaire ? La page <a href="@couples-video-chat">chat vidéo pour couples</a> donne quelques idées.</p>',
        },
      ],
      faq: [
        { q: 'Les jeux sont-ils gratuits ?', a: 'Oui, tu peux proposer ou accepter des parties sans payer. Les jeux et compliments piquants figurent aussi parmi les avantages de Premium.' },
        { q: 'Comment lancer un jeu pendant un appel ?', a: 'Pendant la conversation, ouvre le menu des jeux et choisis-en un. L’autre personne reçoit l’invitation et peut l’accepter ou la refuser.' },
        { q: 'Le mode piquant est-il activé pour tout le monde ?', a: 'Non. Il ne fonctionne qu’entre deux personnes qui l’ont activé toutes les deux, et seulement entre adultes.' },
      ],
    },

    'video-chat-foreigners': {
      slug: 'parler-avec-des-etrangers',
      anchor: 'Parler avec des étrangers',
      title: 'Parler avec des étrangers en vidéo · La Ruleta Caliente',
      description: 'Parler avec des étrangers en vidéo et pratiquer une langue : le chat texte traduit les messages automatiquement. Gratuit, dans ton navigateur. 18+.',
      h1: 'Parler avec des étrangers en vidéo et pratiquer une langue',
      intro: '<p>Envie de <strong>parler avec des étrangers</strong> sans prendre l’avion ? Sur La Ruleta Caliente, chaque clic peut te mettre face à quelqu’un d’un autre pays, en vidéo et en direct. Et si vous ne parlez pas la même langue, le chat texte traduit automatiquement les messages. Une façon simple de pratiquer l’anglais, l’espagnol ou l’italien, ou simplement de découvrir comment on vit ailleurs.</p>',
      sections: [
        {
          h2: 'La traduction automatique pour parler avec des étrangers',
          html: '<p>Le chat texte intégré à l’appel traduit les messages de l’autre personne dans ta langue. Tu écris en français, elle lit dans la sienne, et inversement. La vidéo, elle, reste en direct : tu entends sa vraie voix, son accent, ses expressions. On combine souvent les deux : quelques phrases à l’oral, un message écrit quand un mot bloque.</p><p>Le site lui-même est disponible en six langues (français, anglais, espagnol, portugais, allemand et italien), ce qui facilite la vie de tout le monde.</p>',
        },
        {
          h2: 'Pratiquer une langue étrangère en vidéo',
          html: '<p>Les applications de langues apprennent le vocabulaire ; une vraie conversation apprend à s’en servir. Quelques conseils pour en tirer le maximum :</p><ol><li><strong>Annonce la couleur</strong> dès le début : « J’apprends l’espagnol, tu veux bien parler lentement ? » La plupart des gens apprécient l’effort.</li><li><strong>Propose un échange</strong> : dix minutes dans sa langue, dix minutes en français.</li><li><strong>Utilise la traduction comme filet de sécurité</strong>, pas comme béquille : essaie d’abord à l’oral.</li><li><strong>Note les expressions</strong> que tu entends, elles valent mieux qu’un manuel.</li><li><strong>Accepte les erreurs</strong> : elles font souvent rire, et le rire aide à se détendre.</li></ol>',
        },
        {
          h2: 'Choisir le pays de ton interlocuteur',
          html: '<p>La mise en relation de base est aléatoire et mondiale, ce qui réserve de belles surprises. Si tu veux cibler une langue précise, Premium ajoute un <strong>filtre par pays</strong> (ainsi que par proximité et par âge). Il coûte 7,99 € par semaine ou 19,99 € par mois, résiliable quand tu veux. À l’inverse, si tu cherches surtout des gens près de chez toi, regarde les pages <a href="@country-fr">chat vidéo France</a> ou <a href="@country-ca">chat vidéo au Québec</a>.</p><p>Un conseil : même avec le filtre, laisse de temps en temps la roulette tourner librement. Les conversations les plus mémorables viennent souvent d’un pays auquel tu n’aurais jamais pensé.</p>',
        },
        {
          h2: 'Des sujets qui marchent avec tout le monde',
          html: '<p>Quand on ne partage ni la langue ni la culture, certains thèmes passent mieux que d’autres :</p><ul><li>la nourriture : le plat typique de sa région, ce qu’il a mangé aujourd’hui ;</li><li>la musique et les séries du moment ;</li><li>la météo et l’heure qu’il est chez lui (souvent surprenant) ;</li><li>les voyages rêvés ou déjà faits ;</li><li>les mots intraduisibles de chaque langue.</li></ul><p>Les jeux intégrés aident aussi : <strong>Dessine et devine</strong> ou <strong>Pierre-feuille-ciseaux</strong> se passent presque de mots. Tu en trouveras d’autres dans nos <a href="@video-chat-games">jeux pour appel vidéo</a>.</p>',
        },
        {
          h2: 'Curiosité et prudence vont ensemble',
          html: '<p>Le site est réservé aux 18 ans et plus, partout dans le monde. Rencontrer des étrangers est passionnant, mais certaines arnaques visent justement les conversations internationales : histoire d’amour éclair, demande d’argent pour un billet d’avion, investissement « garanti ». Ne transfère jamais d’argent à quelqu’un rencontré en ligne et ne donne pas tes coordonnées. Ton adresse IP reste cachée pendant l’appel, et tu peux signaler tout comportement suspect.</p>',
        },
      ],
      faq: [
        { q: 'Comment fonctionne la traduction ?', a: 'Les messages écrits dans le chat texte sont traduits automatiquement dans ta langue. La vidéo et la voix, elles, ne sont pas traduites.' },
        { q: 'Peut-on choisir de parler avec un pays précis ?', a: 'Oui, avec le filtre par pays inclus dans Premium. Sans Premium, la mise en relation se fait au hasard dans le monde entier.' },
        { q: 'Est-ce une bonne façon d’apprendre une langue ?', a: 'C’est un excellent complément à des cours : tu pratiques l’oral avec de vraies personnes. Annonce simplement que tu apprends, beaucoup jouent le jeu.' },
      ],
    },

    'alt-bazoocam': {
      slug: 'alternative-bazoocam',
      anchor: 'Alternative à Bazoocam',
      title: 'Alternative à Bazoocam · La Ruleta Caliente',
      description: 'Tu connais Bazoocam et cherches un autre chat vidéo aléatoire ? Voici ce que propose La Ruleta Caliente : jeux, chat traduit, sans inscription. 18+.',
      h1: 'Alternative à Bazoocam : un autre chat vidéo au hasard à découvrir',
      intro: '<p>En France, quand on parle de chat vidéo aléatoire, le nom de Bazoocam revient souvent : le site y est très connu. Si tu cherches une <strong>alternative à Bazoocam</strong>, pour changer d’air ou simplement par curiosité, voici ce que tu trouveras sur La Ruleta Caliente : un chat vidéo en tête-à-tête, au hasard, réservé aux adultes et gratuit pour commencer.</p>',
      sections: [
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Fonctionnalité</th><th>Sur La Ruleta Caliente</th></tr></thead><tbody><tr><td>Vidéo en direct en 1 contre 1</td><td>✓ Au hasard, gratuit</td></tr><tr><td>Accès sans inscription</td><td>✓ Genre, date de naissance, confirmation 18+</td></tr><tr><td>Sans téléchargement</td><td>✓ Navigateur mobile et ordinateur, installable comme une app</td></tr><tr><td>Chat texte</td><td>✓ Avec traduction automatique</td></tr><tr><td>Jeux pendant l’appel</td><td>✓ 4 jeux, thermomètre de complicité, mode piquant</td></tr><tr><td>Points et récompenses</td><td>✓ Piments 🌶️, badges, classement hebdomadaire</td></tr><tr><td>Choisir qui voir</td><td>✓ Avec Premium (femmes, hommes, trans, couples)</td></tr><tr><td>Protection</td><td>✓ IP cachée, filigrane, signalement revu par une personne</td></tr></tbody></table>',
        },
        {
          h2: 'Une alternative à Bazoocam, version ludique',
          html: '<p>La base est la même que sur n’importe quelle roulette vidéo : tu lances, une personne apparaît, tu restes ou tu cliques sur <strong>Suivant</strong> (ou Échap). Ce qui donne sa couleur au site, c’est le jeu. Pendant la conversation, tu peux proposer une partie d’Action ou vérité, de Tu préfères ?, de Pierre-feuille-ciseaux ou de Dessine et devine. Chaque partie rapporte des piments 🌶️, qui servent à activer des superpouvoirs comme <strong>Flamme ardente</strong> (priorité dans la file) ou <strong>Retour</strong> (revenir vers la personne précédente si elle accepte).</p><p>Tout est détaillé sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Rencontrer des francophones… ou le monde entier',
          html: '<p>Par défaut, la mise en relation est mondiale, et le chat texte traduit les messages : tu peux discuter avec un Brésilien ou une Allemande sans parler leur langue. Si tu préfères rester entre francophones, Premium propose un filtre par pays ainsi que par proximité et par âge. Il coûte 7,99 € par semaine ou 19,99 € par mois et se résilie à tout moment.</p><p>Tu vis en France ? Jette un œil à la page <a href="@country-fr">chat vidéo en France</a>. En Belgique, la page <a href="@country-be">chat vidéo Belgique</a> est faite pour toi.</p>',
        },
        {
          h2: 'L’Heure chaude, le rendez-vous du soir',
          html: '<p>Chaque soir, de 22 h à 23 h (heure de Paris), les piments gagnés comptent double : c’est l’<strong>Heure chaude</strong>. Ajoute à ça la série de connexions quotidiennes, les défis de la semaine et le classement du lundi (7, 3 et 1 jour de Premium pour le podium), et tu as de bonnes raisons de revenir. Le parrainage récompense aussi le partage : quand un ami s’inscrit avec ton lien et tient sa première conversation plus d’une minute, vous gagnez chacun un jour de Premium.</p>',
        },
        {
          h2: 'Changer d’habitudes en douceur',
          html: '<p>Quand on a ses repères sur un site, en découvrir un autre demande un petit temps d’adaptation. Quelques idées pour bien démarrer : fais plusieurs conversations avant de te faire un avis, essaie le chat texte avec quelqu’un qui parle une autre langue, accepte une partie de jeu quand on te la propose, et repère dès le début où se trouvent les boutons <strong>Suivant</strong>, <strong>Arrêter</strong> et <strong>Signaler</strong>. En une soirée, tu sauras si l’ambiance te correspond.</p>',
        },
        {
          h2: 'Les bons réflexes ne changent pas',
          html: '<p>Quel que soit le site, la prudence est la même : ne donne ni ton nom complet, ni ton adresse, ni tes réseaux sociaux à un inconnu, et coupe la conversation à la moindre demande d’argent ou de photos intimes. Ici, le chat est réservé aux 18 ans et plus, ton IP reste invisible et chaque signalement est examiné par l’équipe. Pour en savoir plus, lis notre guide pour <a href="@guide-privacy">protéger ta vie privée</a>.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente a-t-elle un lien avec Bazoocam ?', a: 'Non, aucun. Ce sont deux sites indépendants ; nous citons Bazoocam uniquement parce que beaucoup de gens le connaissent.' },
        { q: 'Faut-il créer un compte pour essayer ?', a: 'Non. Tu entres comme invité en indiquant ton genre, ta date de naissance et en confirmant que tu as 18 ans ou plus.' },
        { q: 'Le site est-il en français ?', a: 'Oui, entièrement. Il existe aussi en anglais, espagnol, portugais, allemand et italien, et le chat texte traduit les messages.' },
        { q: 'Est-ce gratuit ?', a: 'Oui, la mise en relation au hasard est gratuite. Premium, facultatif, ajoute des filtres et d’autres avantages.' },
      ],
    },

    'alt-shagle': {
      slug: 'alternative-shagle',
      anchor: 'Alternative à Shagle',
      title: 'Alternative à Shagle en français · La Ruleta Caliente',
      description: 'Tu cherches une alternative à Shagle ? Découvre La Ruleta Caliente : chat vidéo aléatoire 1 contre 1, jeux, piments 🌶️ et chat traduit. Réservé aux 18+.',
      h1: 'Alternative à Shagle : un chat vidéo aléatoire avec du jeu en plus',
      intro: '<p>Shagle fait partie des sites de chat vidéo aléatoire que beaucoup de gens ont déjà testés. Si tu tapes « <strong>alternative à Shagle</strong> » dans un moteur de recherche, c’est sans doute que tu as envie de voir ce qui existe d’autre. Voici ce que propose La Ruleta Caliente, sans comparaison point par point : juste ce que tu trouveras en arrivant ici.</p>',
      sections: [
        {
          h2: 'L’essentiel en un coup d’œil',
          html: '<table><thead><tr><th>Ce que tu veux</th><th>Ce que tu trouves ici</th></tr></thead><tbody><tr><td>Démarrer vite</td><td>✓ Sans inscription, en quelques secondes</td></tr><tr><td>Discuter en vidéo</td><td>✓ En direct, en tête-à-tête, au hasard</td></tr><tr><td>Se comprendre</td><td>✓ Chat texte traduit automatiquement</td></tr><tr><td>S’amuser</td><td>✓ Jeux, sujets de conversation, mode piquant entre adultes</td></tr><tr><td>Être récompensé</td><td>✓ Piments 🌶️, superpouvoirs, classement hebdomadaire</td></tr><tr><td>Filtrer</td><td>✓ Genre, pays, proximité et âge avec Premium</td></tr><tr><td>Rester protégé</td><td>✓ IP cachée, filigrane, signalement avec examen humain</td></tr></tbody></table>',
        },
        {
          h2: 'Comment se passe une première visite',
          html: '<p>Tu arrives sur la page d’accueil, tu choisis ton genre, tu donnes ta date de naissance et tu confirmes avoir 18 ans ou plus. Le navigateur te demande l’accès à la caméra, tu acceptes, et une première personne apparaît. Si la conversation ne prend pas, <strong>Suivant</strong> te présente quelqu’un d’autre ; si tu veux faire une pause, <strong>Arrêter</strong>. Pas d’application à installer, que tu sois sur ordinateur ou sur téléphone. Pour le pas-à-pas complet, va voir <a href="@how">Comment ça marche</a>.</p><p>Petit conseil pour cette première fois : ne juge pas le site sur une seule rencontre. Fais plusieurs conversations, essaie d’envoyer un message écrit à quelqu’un qui parle une autre langue, lance un jeu, et tu auras une idée bien plus juste de l’ambiance.</p>',
        },
        {
          h2: 'Une alternative à Shagle pensée pour jouer',
          html: '<p>Ce qui distingue La Ruleta Caliente, c’est la place laissée au jeu. Quatre mini-jeux se lancent pendant l’appel, un thermomètre de complicité suit l’ambiance et des sujets de conversation s’affichent quand ça coince. Chaque action te rapporte des piments 🌶️ : revenir chaque jour, jouer, recevoir des ❤️, réussir les défis de la semaine. Et pendant l’Heure chaude, de 22 h à 23 h (heure de Paris), tout compte double.</p><p>Ces piments débloquent des superpouvoirs : <strong>Super coucou</strong> pour te faire remarquer, <strong>Seconde chance</strong> pour retrouver ceux qui t’ont envoyé un cœur, <strong>Incognito</strong> pour plus de discrétion.</p>',
        },
        {
          h2: 'Pour qui, et à quel prix',
          html: '<p>Le site s’adresse uniquement aux adultes. L’accès de base est gratuit, sans limite de temps. Premium est une option à 7,99 € par semaine ou 19,99 € par mois, résiliable quand tu veux, qui permet de choisir qui tu vois (femmes, hommes, personnes trans ou couples), d’utiliser les filtres et de profiter d’un site sans publicité. Si ce qui t’intéresse surtout, c’est de parler avec des femmes, la page <a href="@video-chat-women">chat vidéo avec des femmes</a> explique comment ça marche.</p>',
        },
        {
          h2: 'Discuter avec confiance',
          html: '<p>La vidéo passe par notre serveur, donc ton IP reste invisible pour l’autre personne. Les enregistrements sont interdits, un filigrane invisible les décourage, et les signalements sont examinés par l’équipe avant toute sanction, avec possibilité de faire appel. Côté réflexes, ne donne pas d’informations personnelles et méfie-toi de qui veut t’emmener rapidement sur une autre appli. Plus de conseils dans nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente appartient-elle à Shagle ?', a: 'Non. La Ruleta Caliente est un site indépendant, sans aucun lien avec Shagle. Nous le citons uniquement pour aider ceux qui le connaissent.' },
        { q: 'Peut-on l’utiliser sur téléphone ?', a: 'Oui, directement dans le navigateur de ton smartphone. Tu peux aussi ajouter le site à ton écran d’accueil pour l’ouvrir comme une application.' },
        { q: 'Combien coûte Premium ?', a: '7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment. Le chat vidéo de base reste gratuit.' },
      ],
    },

    'alt-chatspin': {
      slug: 'alternative-chatspin',
      anchor: 'Alternative à Chatspin',
      title: 'Alternative à Chatspin · La Ruleta Caliente',
      description: 'Alternative à Chatspin : découvre La Ruleta Caliente, un chat vidéo au hasard en tête-à-tête, sans inscription, avec jeux et chat traduit. Réservé aux 18+.',
      h1: 'Alternative à Chatspin : ce qui t’attend sur La Ruleta Caliente',
      intro: '<p>Chatspin est l’un des nombreux sites de chat vidéo aléatoire disponibles en ligne. Si tu cherches une <strong>alternative à Chatspin</strong>, que ce soit pour comparer ou simplement pour découvrir d’autres têtes, voici une présentation honnête de La Ruleta Caliente : ce qu’on y fait, comment ça marche et ce que ça coûte. Le site est réservé aux adultes et gratuit pour commencer.</p>',
      sections: [
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Caractéristique</th><th>Détail</th></tr></thead><tbody><tr><td>Mise en relation</td><td>✓ Aléatoire, en vidéo, en 1 contre 1</td></tr><tr><td>Inscription</td><td>✓ Pas nécessaire ; compte facultatif (e-mail ou Google)</td></tr><tr><td>Appareils</td><td>✓ Navigateur sur mobile et ordinateur, installable comme une app</td></tr><tr><td>Langues</td><td>✓ Site en 6 langues, chat texte traduit automatiquement</td></tr><tr><td>Animation</td><td>✓ Jeux, thermomètre de complicité, sujets pour briser la glace</td></tr><tr><td>Fidélité</td><td>✓ Piments 🌶️, série quotidienne, badges, classement</td></tr><tr><td>Options payantes</td><td>✓ Premium : 7,99 €/semaine ou 19,99 €/mois</td></tr><tr><td>Sécurité</td><td>✓ IP cachée, filigrane, signalement examiné par une personne</td></tr></tbody></table>',
        },
        {
          h2: 'Une roulette où l’on ne fait pas que zapper',
          html: '<p>Sur une roulette vidéo, la tentation est grande de cliquer sur Suivant toutes les trois secondes. Ici, plusieurs petites choses incitent à rester un peu plus longtemps avec la personne en face : une partie de <strong>Tu préfères ?</strong> qui lance le débat, une question d’<strong>Action ou vérité</strong> qui fait rire, un dessin raté à <strong>Dessine et devine</strong>. Le thermomètre de complicité grimpe à mesure que vous jouez ensemble.</p><p>Et quand tu as vraiment envie de passer à autre chose, <strong>Suivant</strong> ou la touche Échap font le travail instantanément. Pour comprendre la logique du hasard, la page <a href="@random-video-chat">tchat vidéo aléatoire</a> est un bon point de départ.</p>',
        },
        {
          h2: 'Ton alternative à Chatspin, en gratuit ou en Premium',
          html: '<p>Discuter au hasard ne coûte rien, sans limite de temps. Premium est une option pour celles et ceux qui veulent plus de contrôle :</p><ul><li>choisir de voir des femmes, des hommes, des personnes trans ou des couples ;</li><li>filtrer par pays, par proximité et par âge ;</li><li>naviguer sans publicité et garder un historique de 30 jours ;</li><li>ajouter des amis et les appeler ;</li><li>utiliser des superpouvoirs gratuitement chaque jour.</li></ul><p>Il se résilie à tout moment. Et pour l’essayer sans payer, il y a le classement du lundi (7, 3 ou 1 jour de Premium pour le podium) ou le parrainage : un jour offert à toi et à ton ami quand il s’inscrit avec ton lien et tient sa première conversation plus d’une minute.</p>',
        },
        {
          h2: 'Les superpouvoirs, à activer avec des piments',
          html: '<p>Les piments 🌶️ se gagnent gratuitement : en revenant chaque jour, en jouant, en recevant des ❤️ et en relevant les défis hebdomadaires. Ils comptent double pendant l’Heure chaude, de 22 h à 23 h (heure de Paris). Tu peux les dépenser en <strong>Flamme ardente</strong> pour passer en tête de file, <strong>Retour</strong> pour retrouver la personne d’avant si elle est d’accord, ou <strong>Super coucou</strong> pour te faire remarquer. Tout est expliqué sur la page <a href="@games">Jeux et pouvoirs</a>.</p>',
        },
        {
          h2: 'Rester prudent, partout',
          html: '<p>Le site est réservé aux 18 ans et plus. Un conseil qui vaut sur toutes les plateformes : ne laisse personne te presser, ni pour te montrer, ni pour obtenir ton numéro, ni pour te demander de l’argent. Si ça arrive, coupe, signale, et passe à autre chose. Notre guide pour <a href="@guide-privacy">protéger ta vie privée en chat vidéo</a> va plus loin.</p>',
        },
      ],
      faq: [
        { q: 'Y a-t-il un lien entre La Ruleta Caliente et Chatspin ?', a: 'Non, les deux sites sont indépendants. Nous mentionnons Chatspin uniquement pour aider les personnes qui le connaissent à se repérer.' },
        { q: 'Faut-il télécharger quelque chose ?', a: 'Non, tout fonctionne dans ton navigateur. Tu peux ajouter le site à ton écran d’accueil si tu veux l’ouvrir comme une app.' },
        { q: 'Le chat est-il ouvert aux mineurs ?', a: 'Non. Il est strictement réservé aux personnes de 18 ans et plus, qui doivent indiquer leur date de naissance en entrant.' },
      ],
    },

    'alt-camsurf': {
      slug: 'alternative-camsurf',
      anchor: 'Alternative à CamSurf',
      title: 'Alternative à CamSurf · La Ruleta Caliente',
      description: 'Alternative à CamSurf : un chat vidéo aléatoire en direct pour adultes, sans inscription ni téléchargement, avec jeux, piments 🌶️ et chat traduit. 18+.',
      h1: 'Alternative à CamSurf : surfer de webcam en webcam, autrement',
      intro: '<p>CamSurf fait partie des sites de chat vidéo aléatoire que l’on croise souvent quand on cherche à parler à des inconnus. Si tu recherches une <strong>alternative à CamSurf</strong>, voici ce que propose La Ruleta Caliente : des conversations vidéo en direct, en tête-à-tête, avec des adultes du monde entier, gratuites pour commencer et accessibles sans créer de compte.</p>',
      sections: [
        {
          h2: 'Ce que tu trouves sur La Ruleta Caliente',
          html: '<table><thead><tr><th>Point</th><th>Chez nous</th></tr></thead><tbody><tr><td>Chat vidéo aléatoire 1 contre 1</td><td>✓ Gratuit, sans limite de temps</td></tr><tr><td>Entrée rapide</td><td>✓ Invité : genre, date de naissance, 18+ confirmé</td></tr><tr><td>Navigation</td><td>✓ Suivant (ou Échap), Arrêter, changer de caméra</td></tr><tr><td>Communication</td><td>✓ Chat texte traduit, réactions 👍 ❤️</td></tr><tr><td>Jeux</td><td>✓ Action ou vérité, Tu préfères ?, Pierre-feuille-ciseaux, Dessine et devine</td></tr><tr><td>Garder le contact</td><td>✓ Ajouter des amis ; appels avec Premium</td></tr><tr><td>Filtres</td><td>✓ Genre, pays, proximité, âge avec Premium</td></tr><tr><td>Sécurité</td><td>✓ IP invisible, filigrane, règles et signalements</td></tr></tbody></table>',
        },
        {
          h2: 'Une soirée type sur La Ruleta Caliente',
          html: '<p>Tu ouvres le site sur ton téléphone ou ton ordinateur, tu confirmes ta majorité et tu lances la recherche. Première rencontre : un échange rapide, quelques mots, chacun repart. Deuxième : le courant passe, vous lancez une partie de <strong>Tu préfères ?</strong>, puis une autre. Tu envoies un ❤️, l’autre aussi. Vous vous ajoutez en amis pour vous retrouver plus tard.</p><p>Entre-temps, tu as gagné des piments 🌶️ et grimpé de quelques places au classement hebdomadaire. Si c’est l’Heure chaude, de 22 h à 23 h (heure de Paris), ils ont compté double. Ce mélange de hasard et de jeu, c’est l’esprit du site.</p>',
        },
        {
          h2: 'Choisir ton alternative à CamSurf selon tes envies',
          html: '<p>Tout le monde ne cherche pas la même chose sur un chat vidéo. Quelques pistes selon ton profil :</p><ul><li>tu veux surtout <strong>discuter et rire</strong> : la version gratuite et les jeux suffisent largement ;</li><li>tu veux <strong>pratiquer une langue</strong> : profite du chat traduit, et du filtre par pays avec Premium (voir <a href="@video-chat-foreigners">parler avec des étrangers</a>) ;</li><li>tu cherches une ambiance <strong>plus adulte et flirt</strong> : le mode piquant fonctionne entre personnes qui l’ont activé toutes les deux ;</li><li>tu veux <strong>choisir qui tu vois</strong> : Premium, à 7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment.</li></ul><p>Et si tu hésites encore, le plus simple reste d’essayer : l’accès est gratuit et ne demande aucun compte.</p>',
        },
        {
          h2: 'Une app sans passer par un store',
          html: '<p>Pas besoin de chercher une application dans un magasin d’applis : La Ruleta Caliente fonctionne directement dans le navigateur. Si tu veux un raccourci, ajoute le site à ton écran d’accueil : il s’ouvrira en plein écran, comme une application. Pense simplement à autoriser la caméra et le micro la première fois. Plus d’astuces sur la page <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
        {
          h2: 'La sécurité d’abord',
          html: '<p>Le site est réservé aux 18 ans et plus. Pendant l’appel, ton adresse IP reste cachée, les enregistrements sont interdits et un filigrane invisible les décourage. Chaque signalement est examiné par une personne de l’équipe, et une décision peut être contestée. De ton côté, garde pour toi tes coordonnées et ne cède jamais à une demande d’argent ou à un chantage. Plus d’infos dans nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'La Ruleta Caliente est-elle une version de CamSurf ?', a: 'Non. C’est un site indépendant, sans lien avec CamSurf, que nous citons uniquement à titre de repère.' },
        { q: 'Peut-on retrouver une personne après l’avoir quittée ?', a: 'Oui, avec le superpouvoir Retour, si elle accepte. Tu peux aussi l’ajouter en amis pendant la conversation.' },
        { q: 'Est-ce gratuit ?', a: 'Oui, discuter au hasard est gratuit. Premium est facultatif et ajoute des filtres, l’absence de pub et d’autres avantages.' },
      ],
    },

    'guides': {
      slug: 'guides',
      anchor: 'Guides et conseils',
      title: 'Guides et conseils pour le chat vidéo · La Ruleta Caliente',
      description: 'Guides et conseils pour le chat vidéo : lancer la conversation, flirter avec respect, soigner ton image à la caméra et protéger ta vie privée en ligne.',
      h1: 'Guides et conseils pour réussir tes conversations en chat vidéo',
      intro: '<p>Parler à un inconnu en vidéo, ça s’apprend. Pas besoin d’être un as de la répartie : quelques astuces suffisent pour que les échanges soient plus agréables, plus drôles et plus sûrs. Dans ces <strong>guides et conseils pour le chat vidéo</strong>, nous avons rassemblé des conseils pratiques, testés sur le terrain et inspirés des retours de la communauté.</p><p>Ces articles valent pour n’importe quel chat vidéo. Ils sont gratuits, sans inscription, et rappellent régulièrement que ce type de site est réservé aux adultes.</p>',
      sections: [
        {
          h2: 'Ce que tu trouveras dans nos guides',
          html: '<p>Chaque guide répond à une question concrète que l’on se pose avant, pendant ou après une conversation :</p><ul><li><strong>Comment commencer ?</strong> Des phrases d’accroche qui marchent, et celles qu’il vaut mieux oublier.</li><li><strong>Comment flirter sans mettre mal à l’aise ?</strong> Le consentement, les signaux à lire, et l’art de s’arrêter à temps.</li><li><strong>Comment être à son avantage à l’écran ?</strong> Lumière, cadrage, son et connexion, sur téléphone comme sur ordinateur.</li><li><strong>Comment protéger sa vie privée ?</strong> Les informations à garder pour soi, les arnaques courantes et quoi faire si quelque chose tourne mal.</li></ul>',
        },
        {
          h2: 'Pour qui sont ces guides et conseils',
          html: '<p>Si tu débutes, commence par le guide sur les premières phrases : c’est là que tout se joue. Si tu as déjà de l’expérience, les conseils sur la caméra et la vie privée t’apporteront sûrement quelques idées nouvelles. Et si tu as eu une mauvaise expérience, le guide sur la vie privée explique calmement quoi faire, étape par étape.</p><p>Ces textes sont écrits en langage simple, sans jargon technique. Lis-les dans l’ordre que tu veux, et reviens-y quand tu en as besoin.</p>',
        },
        {
          h2: 'Trois principes qui reviennent partout',
          html: '<ol><li><strong>Le respect avant tout.</strong> La personne en face est un être humain qui a, comme toi, le droit de dire non et de passer à autre chose.</li><li><strong>La curiosité plutôt que la performance.</strong> Les meilleures conversations naissent de questions sincères, pas de répliques préparées.</li><li><strong>La prudence sans paranoïa.</strong> Quelques réflexes suffisent à éviter la plupart des problèmes, sans gâcher le plaisir de la rencontre.</li></ol>',
        },
        {
          h2: 'Quelques idées reçues à oublier',
          html: '<ul><li><strong>« Il faut être drôle dès la première seconde. »</strong> Faux : un simple bonjour accompagné d’un sourire fonctionne mieux qu’une blague forcée.</li><li><strong>« Plus on zappe, plus on a de chances. »</strong> Pas vraiment : laisser dix secondes à chaque personne change souvent tout.</li><li><strong>« Une bonne caméra coûte cher. »</strong> Une fenêtre bien placée fait plus pour ton image qu’un équipement hors de prix.</li><li><strong>« Sur Internet, personne ne me retrouvera. »</strong> Un prénom, un nom de lycée et une photo de ta rue suffisent parfois. La discrétion reste ta meilleure alliée.</li></ul>',
        },
        {
          h2: 'Pour aller plus loin',
          html: '<p>Nos guides complètent les pages pratiques du site. Pour comprendre le fonctionnement pas à pas, va voir <a href="@how">Comment ça marche</a>. Pour les jeux et les superpouvoirs, consulte <a href="@video-chat-games">jeux pour appel vidéo</a>. Et pour tout ce qui touche au chantage, aux arnaques et à la protection des mineurs, nos <a href="@safety">conseils de sécurité</a> sont la référence. Prêt à mettre tout ça en pratique ? Le <a href="@free-video-chat">chat vidéo gratuit</a> t’attend.</p>',
        },
      ],
      faq: [
        { q: 'Les guides sont-ils utiles pour d’autres sites ?', a: 'Oui. Les conseils sur les premières phrases, la caméra, le flirt respectueux et la vie privée s’appliquent à n’importe quel chat vidéo.' },
        { q: 'Faut-il un compte pour lire les guides ?', a: 'Non, ils sont accessibles librement, comme le chat vidéo lui-même, qui fonctionne sans inscription.' },
        { q: 'Que faire si j’ai un problème pendant une conversation ?', a: 'Quitte l’appel, signale la personne et consulte notre guide sur la vie privée ainsi que la page de conseils de sécurité.' },
      ],
    },

    'guide-icebreakers': {
      slug: 'comment-commencer-une-conversation',
      anchor: 'Briser la glace',
      title: 'Comment commencer une conversation en chat vidéo',
      description: 'Comment commencer une conversation en chat vidéo : 30 phrases pour briser la glace, les erreurs à éviter et comment relancer quand le silence s’installe.',
      h1: 'Comment commencer une conversation en chat vidéo : 30 phrases pour briser la glace',
      intro: '<p>L’écran s’allume, un visage inconnu apparaît… et ton cerveau se vide. C’est le moment que tout le monde redoute sur un chat vidéo, et c’est pourtant celui qui décide de la suite. Bonne nouvelle : savoir <strong>comment commencer une conversation en chat vidéo</strong> n’a rien d’un don inné. Avec quelques réflexes et une poignée de phrases en réserve, les premières secondes deviennent beaucoup plus simples.</p><p>Ce guide te donne 30 accroches concrètes, classées par situation, les erreurs qui font fuir et des techniques pour relancer un échange qui s’essouffle. Ces conseils valent pour n’importe quelle plateforme de rencontre vidéo entre adultes.</p>',
      sections: [
        {
          h2: 'Commencer une conversation : les cinq premières secondes',
          html: '<p>Avant même que tu ouvres la bouche, l’autre personne a déjà une impression. Sur un chat vidéo aléatoire, chacun décide très vite s’il reste ou s’il passe. Pas besoin d’être parfait, mais certains détails pèsent lourd :</p><ul><li><strong>Ton visage est visible et éclairé.</strong> Une silhouette dans le noir donne envie de cliquer sur Suivant.</li><li><strong>Tu regardes la caméra</strong>, pas un autre onglet. On sent tout de suite quand quelqu’un est ailleurs.</li><li><strong>Tu souris.</strong> C’est banal, mais c’est le signal le plus universel qui existe, et il franchit toutes les barrières de langue.</li><li><strong>Tu parles le premier.</strong> Attendre que l’autre se lance, c’est souvent laisser filer la conversation.</li></ul><p>Un simple « Salut ! » chaleureux, prononcé en regardant l’objectif, fait déjà la moitié du travail.</p>',
        },
        {
          h2: '30 phrases pour briser la glace',
          html: '<h3>Les accroches simples et efficaces</h3><ul><li>« Salut ! Tu es où dans le monde en ce moment ? »</li><li>« Hello ! Tu es la première personne sympa que je croise ce soir. »</li><li>« Bonsoir ! Il est quelle heure chez toi ? »</li><li>« Salut, comment se passe ta journée, ou ta nuit ? »</li><li>« Hey ! C’est ta première fois ici ou tu es un habitué ? »</li><li>« Coucou ! Je te préviens, je suis nul pour commencer les conversations. »</li></ul><h3>Rebondir sur ce que tu vois</h3><ul><li>« C’est une guitare derrière toi ? Tu joues depuis longtemps ? »</li><li>« J’adore ton t-shirt, c’est quel groupe ? »</li><li>« Tu as l’air d’être dehors, c’est quoi ce paysage ? »</li><li>« Ton chat vient de passer devant l’écran, il s’appelle comment ? »</li><li>« Ta bibliothèque a l’air bien remplie, tu lis quoi en ce moment ? »</li><li>« On dirait que tu manges, c’est quoi ? Ça a l’air bon. »</li></ul><h3>Les questions qui lancent un vrai échange</h3><ul><li>« Qu’est-ce qui t’a fait sourire aujourd’hui ? »</li><li>« Si tu pouvais être n’importe où maintenant, tu serais où ? »</li><li>« Quelle est la meilleure chose que tu aies mangée cette semaine ? »</li><li>« Tu es plutôt lève-tôt ou couche-tard ? Vu l’heure, je devine… »</li><li>« C’est quoi la série que tu conseillerais à tout le monde ? »</li><li>« Quel est le dernier truc que tu as appris par hasard ? »</li></ul><h3>Avec une pointe d’humour</h3><ul><li>« Je te donne trois secondes pour me convaincre de ne pas cliquer sur Suivant. Je plaisante ! »</li><li>« Tu es la dixième personne que je vois, et la seule qui ne mange pas des chips. »</li><li>« Note de 1 à 10 mon éclairage, je fais des progrès. »</li><li>« J’ai un défi : tu devines d’où je viens en trois essais ? »</li><li>« Avant de commencer : team pain au chocolat ou team chocolatine ? »</li><li>« On fait comme si on se connaissait depuis dix ans ? Alors, quoi de neuf ? »</li></ul><h3>Quand vous ne parlez pas la même langue</h3><ul><li>« Hi! Do you speak French? Un peu ? »</li><li>« Je peux écrire dans le chat, il traduit, on essaie ? »</li><li>« Apprends-moi un mot de ta langue, je t’en apprends un en français. »</li><li>« Montre-moi par la fenêtre à quoi ressemble ta ville. »</li><li>« On joue à Dessine et devine ? Pas besoin de parler. »</li><li>« Quel est le plat typique de chez toi ? »</li></ul>',
        },
        {
          h2: 'Les erreurs qui font fuir dès le départ',
          html: '<p>Certaines entrées en matière sont des classiques… de l’échec. À éviter absolument :</p><ul><li><strong>« Âge ? Pays ? »</strong> en guise de bonjour. Ça ressemble à un formulaire administratif, pas à une rencontre.</li><li><strong>Les remarques sur le physique</strong> dans les premières secondes, même flatteuses. Elles mettent souvent mal à l’aise.</li><li><strong>Demander les réseaux sociaux</strong> ou le numéro tout de suite. C’est le meilleur moyen de passer pour quelqu’un de pressé, ou de louche.</li><li><strong>Rester muet</strong> en fixant l’écran. Le silence devient vite pesant pour les deux.</li><li><strong>Parler de soi pendant cinq minutes</strong> sans poser une seule question.</li><li><strong>Insister</strong> quand l’autre ne répond pas ou semble gêné : il a parfaitement le droit de passer à autre chose.</li></ul>',
        },
        {
          h2: 'Relancer quand la conversation s’essouffle',
          html: '<p>Même les meilleurs échanges connaissent des blancs. Plutôt que de paniquer, utilise l’une de ces techniques :</p><h3>La question en miroir</h3><p>Reprends le dernier sujet et retourne-le : « Et toi, tu aurais fait quoi à ma place ? » Ça montre que tu écoutais.</p><h3>Le détail qui intrigue</h3><p>Reviens sur un point évoqué plus tôt : « Tout à l’heure tu as parlé d’un voyage au Portugal, raconte ! »</p><h3>Le petit jeu</h3><p>Un « Tu préfères ? » improvisé relance n’importe quelle discussion. Sur La Ruleta Caliente, tu peux même lancer une vraie partie sous la vidéo, ou piocher dans les sujets proposés quand l’inspiration manque. Tous les jeux sont présentés sur la page <a href="@video-chat-games">jeux pour appel vidéo</a>.</p><h3>L’honnêteté</h3><p>« Je ne sais plus quoi dire, mais j’aime bien parler avec toi. » Désarmant, et souvent efficace.</p>',
        },
        {
          h2: 'Savoir écouter (et savoir partir)',
          html: '<p>Une bonne conversation ne repose pas que sur les questions : c’est l’écoute qui fait la différence. Rebondis sur les réponses, réagis avec ton visage, pose une deuxième question sur le même sujet au lieu de passer au suivant. Les gens se souviennent rarement de ce que tu as dit, mais très bien de la façon dont tu les as écoutés.</p><p>Et parfois, malgré tous les efforts, le courant ne passe pas. Ce n’est un échec pour personne. Un « Ravi de t’avoir croisé, bonne soirée ! » avant de cliquer sur Suivant laisse une meilleure impression qu’une disparition brutale. Sur un chat vidéo, il y a toujours une autre rencontre qui attend.</p>',
        },
        {
          h2: 'Garde en tête les bases de la sécurité',
          html: '<p>Briser la glace ne veut pas dire tout raconter. Dans les premières minutes, évite de donner ton nom complet, ton lieu de travail ou ton adresse. Les chats vidéo entre inconnus sont réservés aux adultes : si tu as le moindre doute sur l’âge de la personne en face, quitte la conversation et signale-la. Pour aller plus loin, lis notre guide pour <a href="@guide-privacy">protéger ta vie privée en chat vidéo</a> et, si l’échange devient plus séducteur, nos conseils pour <a href="@guide-flirting">flirter avec respect</a>.</p>',
        },
      ],
      faq: [
        { q: 'Quelle est la meilleure phrase pour commencer un chat vidéo ?', a: 'Il n’y a pas de formule magique, mais une question ouverte et légère, comme « Il est quelle heure chez toi ? », fonctionne presque toujours mieux qu’un simple « Âge ? Pays ? ».' },
        { q: 'Comment éviter les silences gênants ?', a: 'Garde quelques questions en réserve, rebondis sur ce que tu vois à l’écran et n’hésite pas à proposer un petit jeu comme Tu préfères ?.' },
        { q: 'Faut-il parler en premier ?', a: 'Oui, c’est souvent préférable. Prendre l’initiative montre que tu es là pour discuter et met l’autre personne à l’aise.' },
      ],
    },

    'guide-flirting': {
      slug: 'conseils-pour-flirter-en-chat-video',
      anchor: 'Flirter en chat vidéo',
      title: 'Flirter en chat vidéo : conseils pour séduire',
      description: 'Flirter en chat vidéo avec respect : lire les signaux, demander le consentement, doser l’humour, utiliser le mode piquant et savoir s’arrêter à temps.',
      h1: 'Flirter en chat vidéo : les conseils pour séduire avec respect',
      intro: '<p>Le chat vidéo a quelque chose de grisant pour la séduction : on se voit, on s’entend, on rit ensemble en direct, sans les heures d’attente d’une appli de rencontre. Mais <strong>flirter en chat vidéo</strong> demande aussi un peu de doigté. L’autre personne est un inconnu, l’ambiance peut basculer vite et ce qui amuse l’un peut gêner l’autre.</p><p>Ce guide rassemble des conseils concrets pour séduire avec élégance, entre adultes consentants : lire les signaux, choisir ses mots, faire monter la température… et savoir s’arrêter quand il le faut.</p>',
      sections: [
        {
          h2: 'Flirter en chat vidéo commence par la conversation',
          html: '<p>On l’oublie souvent, mais la séduction passe d’abord par l’intérêt sincère. Une personne qui se sent écoutée est bien plus réceptive qu’une personne couverte de compliments. Avant de chercher à plaire, cherche à découvrir :</p><ul><li>pose des questions sur ce qui la passionne, pas seulement sur son physique ;</li><li>retiens les détails et reviens dessus plus tard (« Alors, ce concert, tu y vas finalement ? ») ;</li><li>partage aussi des choses sur toi, pour que l’échange reste équilibré ;</li><li>montre ton humour, mais sans te moquer de l’autre.</li></ul><p>Si tu as du mal à lancer la discussion, notre guide pour <a href="@guide-icebreakers">commencer une conversation en chat vidéo</a> te donne 30 phrases toutes prêtes.</p>',
        },
        {
          h2: 'Lire les signaux à travers l’écran',
          html: '<p>En vidéo, une bonne partie du langage corporel disparaît : on ne voit souvent que le visage et les épaules. Il faut donc être plus attentif aux signes qui restent.</p><h3>Les signes encourageants</h3><ul><li>la personne sourit, rit à tes blagues et en fait elle-même ;</li><li>elle pose des questions à son tour ;</li><li>elle se rapproche de la caméra, ajuste sa lumière ou son cadrage pour mieux se montrer ;</li><li>elle envoie un ❤️ ou prolonge la conversation alors qu’elle pourrait partir.</li></ul><h3>Les signes qui invitent à ralentir</h3><ul><li>réponses courtes, regard qui fuit vers un autre écran ;</li><li>rires gênés ou changement de sujet quand tu fais un compliment ;</li><li>silence prolongé, bras croisés, recul par rapport à la caméra.</li></ul><p>Dans le doute, demande simplement : « Je ne te mets pas mal à l’aise, j’espère ? » Une question honnête vaut mieux qu’une supposition.</p>',
        },
        {
          h2: 'Ta voix, ton regard, ton cadre : séduire à l’écran',
          html: '<p>À l’écran, tu n’as pas ta démarche, ton parfum ni ta poignée de main pour faire bonne impression. Il te reste trois atouts, et ils comptent double.</p><h3>La voix</h3><p>Parle un peu plus lentement que d’habitude et baisse légèrement le ton : une voix posée paraît plus assurée et plus chaleureuse. Des écouteurs avec micro rendent l’échange plus intime, comme si tu parlais à l’oreille de quelqu’un.</p><h3>Le regard</h3><p>Pour donner l’impression de regarder l’autre dans les yeux, il faut… regarder l’objectif, pas l’écran. Fais-le aux moments importants : quand tu poses une question sincère ou quand tu fais un compliment.</p><h3>Le cadre</h3><p>Une lumière douce, un fond rangé et une caméra à hauteur des yeux suffisent à faire une vraie différence. Tous les réglages sont détaillés dans notre guide pour <a href="@guide-camera">être à ton avantage à la caméra</a>.</p>',
        },
        {
          h2: 'Le consentement, même pour un simple compliment',
          html: '<p>Le consentement n’est pas réservé aux situations intimes : il s’applique à chaque étape d’une conversation de séduction. Concrètement, cela veut dire :</p><ol><li><strong>Monter progressivement.</strong> Un compliment sur le sourire avant un compliment sur le corps ; une question légère avant une question personnelle.</li><li><strong>Demander plutôt que supposer.</strong> « On peut parler de choses un peu plus coquines ? » permet à l’autre de répondre librement.</li><li><strong>Accepter un non sans négocier.</strong> Un refus n’est pas une invitation à insister ou à culpabiliser l’autre.</li><li><strong>Comprendre qu’un oui peut changer.</strong> Ce qui était amusant il y a dix minutes peut ne plus l’être. C’est normal.</li><li><strong>Ne jamais demander de se dévêtir</strong> ou de montrer quelque chose d’intime. La pression, même déguisée en plaisanterie, n’a pas sa place.</li></ol>',
        },
        {
          h2: 'Faire monter la température avec le mode piquant',
          html: '<p>Entre adultes qui en ont envie, un peu de piment rend l’échange plus excitant. Sur La Ruleta Caliente, le <strong>mode piquant</strong> 🌶️ ajoute des questions, des défis et des compliments plus osés aux jeux comme Action ou vérité ou Tu préfères ?. Son grand avantage : il ne fonctionne qu’entre deux personnes qui l’ont activé toutes les deux. Personne ne reçoit une question coquine sans l’avoir choisi.</p><p>Quelques règles d’or pour en profiter :</p><ul><li>un défi refusé n’est pas un drame, passe au suivant ;</li><li>le jeu reste un prétexte pour rire, pas une liste d’obligations ;</li><li>si l’autre ralentit le rythme, suis-le.</li></ul><p>Pour découvrir l’ambiance des conversations entre adultes, la page <a href="@adult-video-chat">chat vidéo pour adultes</a> présente aussi les règles à respecter.</p>',
        },
        {
          h2: 'Ce qui casse le charme',
          html: '<p>Certaines attitudes ruinent n’importe quelle tentative de séduction, en ligne comme ailleurs :</p><ul><li><strong>Aller trop vite</strong> : les remarques sexuelles dans la première minute font fuir la grande majorité des gens.</li><li><strong>Les compliments en série</strong> : à force, ils sonnent faux et mettent mal à l’aise.</li><li><strong>La jalousie ou la possessivité</strong> envers quelqu’un rencontré il y a dix minutes.</li><li><strong>Le chantage affectif</strong> : « Si tu pars, c’est que tu ne m’aimes pas bien. »</li><li><strong>Les captures d’écran</strong> : enregistrer quelqu’un sans son accord est une trahison, et sur la plupart des sites, une violation des règles.</li></ul>',
        },
        {
          h2: 'Savoir s’arrêter et prendre soin de soi',
          html: '<p>Un flirt réussi n’est pas forcément un flirt qui dure. Parfois, la meilleure façon de laisser un bon souvenir est de partir sur une belle note : « J’ai passé un super moment, on se recroisera peut-être ! » Si vous avez vraiment accroché, il existe des moyens de se retrouver sans se presser, comme ajouter la personne en amis.</p><p>De ton côté aussi, tu as le droit de dire stop. Si l’autre devient insistant, te demande de l’argent, des photos ou des informations personnelles, quitte immédiatement la conversation et signale-la. Méfie-toi particulièrement des coups de foudre trop rapides suivis d’une demande d’aide financière : c’est un schéma d’arnaque classique. Nos <a href="@safety">conseils de sécurité</a> détaillent comment repérer le chantage et les fausses romances.</p>',
        },
      ],
      faq: [
        { q: 'Comment savoir si l’autre personne est intéressée ?', a: 'Observe si elle sourit, pose des questions à son tour et prolonge la conversation. En cas de doute, demande-lui simplement si elle se sent à l’aise.' },
        { q: 'Peut-on flirter dès les premières secondes ?', a: 'Mieux vaut d’abord créer un lien par la conversation. Un compliment léger peut venir vite, mais les sujets plus intimes demandent l’accord clair de l’autre.' },
        { q: 'Que faire si quelqu’un devient trop insistant ?', a: 'Quitte la conversation sans te justifier et signale la personne. Tu n’as jamais à continuer un échange qui te met mal à l’aise.' },
      ],
    },

    'guide-camera': {
      slug: 'bien-paraitre-a-la-camera',
      anchor: 'Bien paraître à la caméra',
      title: 'Bien paraître à la caméra : lumière, cadrage, son',
      description: 'Comment bien paraître à la caméra en chat vidéo : lumière, cadrage, son, connexion et réglages sur téléphone ou ordinateur. Des astuces simples.',
      h1: 'Comment bien paraître à la caméra en chat vidéo : le guide complet',
      intro: '<p>Image granuleuse, visage dans l’ombre, son qui grésille, angle qui montre surtout ton plafond… Sur un chat vidéo, la technique peut gâcher une rencontre avant même qu’elle commence. Pourtant, <strong>bien paraître à la caméra</strong> ne demande ni matériel professionnel ni budget : la plupart des améliorations se font en deux minutes, avec ce que tu as déjà chez toi.</p><p>Voici, point par point, comment soigner ta lumière, ton cadrage, ton son et ta connexion, que tu utilises un téléphone ou un ordinateur.</p>',
      sections: [
        {
          h2: 'La lumière : le secret pour bien paraître à la caméra',
          html: '<p>Si tu ne devais retenir qu’un conseil, ce serait celui-ci : <strong>la lumière doit venir de devant toi</strong>. Les capteurs des webcams et des téléphones sont petits ; dans la pénombre, ils compensent en ajoutant du bruit numérique, ce qui donne cette image granuleuse et terne.</p><h3>Les bonnes pratiques</h3><ul><li><strong>Fais face à une fenêtre</strong> en journée : la lumière naturelle est la plus flatteuse qui soit.</li><li><strong>Le soir, place une lampe derrière ton écran</strong>, légèrement au-dessus de ta tête, plutôt qu’un plafonnier qui creuse les cernes.</li><li><strong>Diffuse la lumière</strong> : un abat-jour, une feuille de papier calque ou un mur blanc sur lequel tu fais rebondir une lampe adoucissent les ombres.</li><li><strong>Évite les mélanges</strong> de lumière froide et chaude, qui donnent un teint bizarre.</li></ul><h3>Les erreurs classiques</h3><ul><li>une fenêtre ou une lampe dans ton dos : tu deviens une silhouette ;</li><li>la seule lumière de l’écran : visage bleuté et yeux fatigués ;</li><li>une lampe de bureau trop proche : une moitié du visage brûlée, l’autre dans le noir.</li></ul>',
        },
        {
          h2: 'Le cadrage et l’angle de vue',
          html: '<p>Un bon cadrage te met en valeur et rend la conversation plus naturelle. Quelques repères simples :</p><ol><li><strong>La caméra à hauteur des yeux.</strong> Posée trop bas, elle montre ton menton et ton plafond ; trop haut, elle te fait paraître petit. Une pile de livres sous l’ordinateur portable règle souvent le problème.</li><li><strong>Le visage dans le tiers supérieur de l’image</strong>, avec un peu d’espace au-dessus de la tête et les épaules visibles.</li><li><strong>Une distance d’un bras</strong> environ : assez près pour voir tes expressions, assez loin pour éviter l’effet « déformant » des objectifs grand-angle.</li><li><strong>Regarde l’objectif</strong> quand tu parles, pas ta propre image. C’est ce qui donne l’impression d’un vrai contact visuel.</li></ol><h3>L’arrière-plan</h3><p>Un fond rangé et neutre attire moins l’attention qu’une pile de linge. Une plante, une bibliothèque ou un mur uni font très bien l’affaire. Et pense à la discrétion : rien qui permette de deviner ton adresse, ton nom ou ton lieu de travail. On en parle plus en détail dans notre guide pour <a href="@guide-privacy">protéger ta vie privée</a>.</p>',
        },
        {
          h2: 'Le son, souvent négligé',
          html: '<p>On pardonne une image moyenne, beaucoup moins un son désagréable. Écho, souffle, voix lointaine : rien de tel pour fatiguer ton interlocuteur.</p><ul><li><strong>Utilise des écouteurs avec micro</strong>, même basiques. Ils suppriment l’écho (le son de l’autre ne repasse plus dans ton micro) et rapprochent ta voix.</li><li><strong>Choisis une pièce « molle »</strong> : rideaux, tapis et canapé absorbent le son, contrairement à une cuisine carrelée ou une salle de bain.</li><li><strong>Coupe les bruits de fond</strong> : télévision, ventilateur, notifications de ton téléphone.</li><li><strong>Ne parle pas trop fort</strong> : les micros modernes captent très bien une voix normale.</li></ul><h3>Faire un test rapide</h3><p>Enregistre une courte note vocale avec ton téléphone ou ouvre l’application caméra de ton ordinateur, et écoute-toi. Tu entendras tout de suite si ta voix résonne, si un ventilateur souffle ou si tu es trop loin du micro. Trente secondes de test valent mieux que dix conversations ratées.</p>',
        },
        {
          h2: 'La connexion Internet : éviter l’image figée',
          html: '<p>Une conversation qui saccade ou qui se coupe toutes les trente secondes, c’est frustrant pour tout le monde. Pour mettre toutes les chances de ton côté :</p><ul><li><strong>Rapproche-toi de ta box</strong> ou branche ton ordinateur en câble Ethernet si c’est possible.</li><li><strong>Ferme les onglets et les applications gourmandes</strong> : téléchargements, streaming, mises à jour en arrière-plan.</li><li><strong>Sur téléphone, préfère le Wi-Fi</strong> quand il est bon ; sinon, la 4G ou la 5G dans un endroit bien couvert fait souvent mieux qu’un Wi-Fi saturé.</li><li><strong>Évite les heures où toute la maison est en ligne</strong>, si tu partages ta connexion.</li></ul><p>Si l’image reste figée, coupe et relance : une nouvelle connexion règle souvent le souci.</p>',
        },
        {
          h2: 'Téléphone ou ordinateur : que choisir ?',
          html: '<h3>Sur ordinateur</h3><p>Plus stable et plus confortable pour les longues conversations, l’ordinateur laisse aussi les mains libres pour écrire dans le chat. La webcam intégrée des portables est parfois modeste : compense avec une bonne lumière. Les raccourcis clavier font gagner du temps (sur La Ruleta Caliente, la touche Échap permet de passer à la personne suivante).</p><h3>Sur téléphone</h3><p>La caméra frontale d’un smartphone récent est souvent meilleure que celle d’un ordinateur portable. Le principal défi est la stabilité : <strong>pose ton téléphone</strong> sur un support ou contre un objet plutôt que de le tenir à bout de bras. Mode portrait pour un face-à-face, et pense à brancher le chargeur pour les longues sessions. Tu peux aussi basculer sur la caméra arrière pour montrer un paysage. Plus d’infos sur la page <a href="@mobile-video-chat">chat vidéo sur mobile</a>.</p>',
        },
        {
          h2: 'La check-list avant chaque appel',
          html: '<p>Avant d’allumer ta caméra, prends trente secondes pour vérifier :</p><ol><li>la lumière est devant moi, pas derrière ;</li><li>la caméra est à hauteur des yeux, l’objectif est propre (un coup de chiffon change tout) ;</li><li>mon arrière-plan ne dévoile rien de personnel ;</li><li>mes écouteurs sont branchés et le micro fonctionne ;</li><li>les notifications et la télé sont coupées ;</li><li>mon navigateur a bien l’autorisation d’utiliser la caméra et le micro.</li></ol><p>C’est tout. Avec ça, tu es prêt pour un <a href="@cam-to-cam">cam to cam</a> réussi. N’oublie pas que ces sites sont réservés aux adultes et que personne n’a le droit de t’enregistrer sans ton accord.</p>',
        },
      ],
      faq: [
        { q: 'Comment avoir une meilleure image sans acheter de webcam ?', a: 'Place-toi face à une source de lumière douce, comme une fenêtre ou une lampe derrière l’écran, et nettoie l’objectif. C’est souvent suffisant pour une image nettement plus belle.' },
        { q: 'Pourquoi y a-t-il de l’écho pendant mes appels vidéo ?', a: 'Le son de ton interlocuteur ressort de tes haut-parleurs et repart dans ton micro. Des écouteurs règlent le problème dans presque tous les cas.' },
        { q: 'Vaut-il mieux utiliser un téléphone ou un ordinateur ?', a: 'Les deux fonctionnent bien. Le téléphone a souvent une meilleure caméra, l’ordinateur est plus stable et pratique pour écrire.' },
      ],
    },

    'guide-privacy': {
      slug: 'proteger-sa-vie-privee-chat-video',
      anchor: 'Protéger ta vie privée',
      title: 'Protéger sa vie privée en chat vidéo : le guide',
      description: 'Protéger sa vie privée en chat vidéo : les infos à ne jamais donner, repérer la sextorsion et les arnaques, et quoi faire si quelque chose tourne mal.',
      h1: 'Protéger sa vie privée en chat vidéo : le guide pratique',
      intro: '<p>Discuter avec des inconnus en vidéo est un vrai plaisir, mais cela suppose de garder quelques réflexes. La plupart des problèmes (chantage, arnaques, harcèlement) commencent par une information donnée trop vite ou une demande acceptée sans réfléchir. Savoir <strong>protéger sa vie privée en chat vidéo</strong>, c’est surtout savoir ce qu’on garde pour soi et reconnaître les signaux d’alerte.</p><p>Ce guide s’applique à tous les sites de rencontre vidéo entre adultes. Il ne vise pas à faire peur, mais à te permettre de profiter des rencontres l’esprit tranquille.</p>',
      sections: [
        {
          h2: 'Les informations à ne jamais donner',
          html: '<p>Une personne rencontrée il y a dix minutes n’a besoin d’aucune de ces informations. Garde-les pour toi, même si la conversation est très sympathique :</p><ul><li><strong>ton nom complet</strong> (un prénom, éventuellement d’emprunt, suffit) ;</li><li><strong>ton adresse</strong>, ton quartier précis, le nom de ta rue ;</li><li><strong>ton lieu de travail ou d’études</strong> ;</li><li><strong>ton numéro de téléphone</strong> et tes comptes de réseaux sociaux ;</li><li><strong>tes informations bancaires</strong>, codes reçus par SMS, mots de passe ;</li><li><strong>des photos de tes papiers</strong>, de ta carte bancaire ou de tes clés.</li></ul><h3>Ce que l’on dévoile sans le vouloir</h3><p>Ton arrière-plan parle pour toi : un courrier posé sur la table, une vue reconnaissable par la fenêtre, une photo de famille, un badge professionnel. Avant d’allumer la caméra, jette un œil à ce qui se trouve dans le champ. Notre guide pour <a href="@guide-camera">bien paraître à la caméra</a> donne aussi des conseils de cadrage.</p>',
        },
        {
          h2: 'La sextorsion : comprendre le piège pour l’éviter',
          html: '<p>La sextorsion est une forme de chantage : quelqu’un obtient des images intimes de toi, puis menace de les envoyer à tes proches si tu ne paies pas. C’est l’une des arnaques les plus répandues sur les chats vidéo, et elle suit presque toujours le même scénario.</p><h3>Le schéma classique</h3><ol><li>Une personne très séduisante et très entreprenante engage la conversation.</li><li>Elle propose rapidement de passer sur une autre application, « plus privée ».</li><li>Elle t’encourage à te déshabiller ou à faire quelque chose d’intime devant la caméra.</li><li>Quelques minutes plus tard, elle t’envoie une capture et exige de l’argent, avec la liste de tes contacts à l’appui.</li></ol><h3>Comment s’en protéger</h3><ul><li>ne fais jamais rien devant une caméra que tu ne voudrais pas voir diffusé ;</li><li>méfie-toi des personnes qui vont très vite, et plus encore de celles qui veulent changer d’application ;</li><li>ne relie pas tes réseaux sociaux à une personne inconnue : c’est là que les maîtres chanteurs trouvent tes proches ;</li><li>passe tes comptes en privé et masque ta liste d’amis ou d’abonnés, pour limiter ce qu’un inconnu peut récupérer.</li></ul>',
        },
        {
          h2: 'Les autres arnaques courantes',
          html: '<p>À côté de la sextorsion, d’autres pièges reviennent régulièrement :</p><ul><li><strong>La fausse romance</strong> : un coup de foudre en quelques jours, puis une urgence (billet d’avion, frais médicaux, douane bloquée) qui nécessite ton aide financière.</li><li><strong>Le faux investissement</strong> : une nouvelle connaissance qui a « une méthode infaillible » pour gagner de l’argent en cryptomonnaie.</li><li><strong>Le lien piégé</strong> : « Regarde mes photos ici », vers un site qui demande tes identifiants ou installe un logiciel.</li><li><strong>Les cartes-cadeaux</strong> : toute demande de paiement en cartes prépayées est un signal d’alarme.</li></ul><p>La règle est simple : <strong>personne de légitime ne te demandera d’argent</strong> après une conversation en ligne. Si la demande arrive, la conversation est terminée.</p>',
        },
        {
          h2: 'Enregistrements et captures d’écran',
          html: '<p>Techniquement, il est difficile d’empêcher à 100 % quelqu’un de filmer son écran. Il faut donc partir du principe que tout ce que tu montres pourrait être capturé. Les sites sérieux interdisent les enregistrements dans leurs règles et prennent des mesures pour les décourager. Sur La Ruleta Caliente, par exemple, un message rappelle à chacun que l’enregistrement est interdit et un <strong>filigrane invisible</strong> est appliqué à la vidéo.</p><p>Un réflexe utile : avant d’allumer ta caméra, demande-toi si tu serais à l’aise de voir cette image circuler. Si la réponse est non, change de cadrage ou de tenue, ou passe d’abord par le chat écrit. Ce n’est pas de la méfiance excessive, simplement une façon de garder le contrôle sur ce que tu partages, quelle que soit la personne en face.</p><p>Autre point utile à vérifier sur n’importe quel service : si la vidéo passe en direct d’un appareil à l’autre, l’autre personne peut parfois voir ton adresse IP. Sur La Ruleta Caliente, la vidéo transite par le serveur, ce qui évite ce problème. Pour garder encore plus de discrétion, lis aussi notre page sur le <a href="@anonymous-video-chat">chat vidéo anonyme</a>.</p>',
        },
        {
          h2: 'Que faire si quelque chose tourne mal ?',
          html: '<p>Même avec toutes les précautions, un incident peut arriver. Garde ton calme et suis ces étapes :</p><ol><li><strong>Coupe la conversation</strong> immédiatement. Tu n’as aucune explication à donner.</li><li><strong>Signale la personne</strong> sur la plateforme, en décrivant ce qui s’est passé.</li><li><strong>Ne paie pas</strong> en cas de chantage : payer n’arrête presque jamais les demandes, cela les relance.</li><li><strong>Ne supprime pas les preuves</strong> : garde les messages, le pseudo, les captures des menaces.</li><li><strong>Bloque le contact</strong> sur toutes tes applications et renforce la confidentialité de tes réseaux sociaux.</li><li><strong>Parles-en</strong> à une personne de confiance, et porte plainte auprès des autorités de ton pays si tu es victime de chantage ou d’escroquerie.</li></ol><p>Être victime n’est jamais honteux : ces escroqueries sont organisées et visent tout le monde.</p>',
        },
        {
          h2: 'Les bons réflexes en résumé',
          html: '<ul><li>un prénom, pas d’identité complète ;</li><li>un arrière-plan neutre, sans indice sur ton lieu de vie ;</li><li>rester sur la plateforme où tu as fait la rencontre ;</li><li>aucune image intime, aucun envoi d’argent ;</li><li>signaler au moindre doute, y compris si tu penses que la personne en face est mineure : ces sites sont réservés aux adultes.</li></ul><p>Pour des explications détaillées sur la sextorsion, les escroqueries et la protection des mineurs, consulte nos <a href="@safety">conseils de sécurité</a> et les <a href="@rules">règles de la communauté</a>.</p>',
        },
      ],
      faq: [
        { q: 'Que faire en cas de chantage après un chat vidéo ?', a: 'Ne paie pas, coupe tout contact, garde les preuves et signale la personne. Porte plainte auprès des autorités et parles-en à quelqu’un de confiance.' },
        { q: 'Quelqu’un peut-il trouver mon adresse grâce au chat vidéo ?', a: 'Pas si tu ne donnes aucune information et que ton arrière-plan reste neutre. Sur La Ruleta Caliente, ton adresse IP n’est pas visible par l’autre personne.' },
        { q: 'Faut-il accepter de continuer sur une autre application ?', a: 'Mieux vaut éviter avec une personne que tu viens de rencontrer. C’est souvent la première étape des arnaques et du chantage.' },
      ],
    },

    'guide-truth-or-dare': {
      slug: 'questions-action-ou-verite',
      anchor: 'Questions action ou vérité',
      title: 'Action ou vérité en appel vidéo : 80 idées de questions',
      description: 'Questions action ou vérité pour un appel vidéo : 45 vérités et 35 actions faciles à faire devant la caméra, des plus drôles aux plus taquines. Les règles.',
      h1: 'Questions action ou vérité : 80 idées pour jouer en appel vidéo',
      intro: '<p>Action ou vérité est sans doute le jeu de soirée le plus connu au monde, et il se prête étonnamment bien à la vidéo. Pas besoin d’être dans la même pièce : il suffit d’une caméra, d’un peu d’imagination et de bonnes <strong>questions action ou vérité</strong> sous la main. Le problème, c’est qu’au moment de jouer, on a souvent un trou de mémoire.</p><p>Voici donc une liste prête à l’emploi : 45 vérités et 35 actions, classées par ambiance, toutes faisables chez soi devant l’écran. Certaines sont taquines, aucune n’est déplacée. Et une règle passe avant toutes les autres : chacun peut dire « je passe » à tout moment.</p>',
      sections: [
        {
          h2: 'Les règles pour jouer à action ou vérité en vidéo',
          html: '<p>Le principe ne change pas : à ton tour, tu choisis entre répondre honnêtement à une question (vérité) ou relever un petit défi (action). En appel vidéo, quelques ajustements rendent la partie plus fluide :</p><ul><li><strong>Fixez l’ambiance avant de commencer.</strong> « On reste soft ou on peut taquiner un peu ? » Une phrase suffit pour éviter les malentendus.</li><li><strong>Le joker « je passe » est illimité.</strong> Personne n’a à se justifier de refuser une question ou un défi.</li><li><strong>Les actions se font devant la caméra.</strong> Si l’autre ne voit rien, l’action perd tout son intérêt.</li><li><strong>On alterne les tours</strong>, et celui qui vient de répondre pose la question suivante.</li><li><strong>Pas de preuve gênante.</strong> On ne demande jamais de montrer des messages privés, des photos personnelles ou des informations qui permettraient de retrouver quelqu’un.</li></ul><p>Avec un inconnu, commence toujours par les questions les plus légères. La complicité se construit au fil des tours, pas dès la première question.</p>',
        },
        {
          h2: '45 questions vérité, de la plus sage à la plus taquine',
          html: '<h3>Pour briser la glace</h3><ul><li>Quel est le dernier mensonge que tu as dit ?</li><li>Quelle est ta pire habitude ?</li><li>Quel talent inutile possèdes-tu ?</li><li>Quelle chanson chantes-tu sous la douche ?</li><li>Quel est le pire cadeau qu’on t’ait jamais offert ?</li><li>Quelle appli ouvres-tu en premier le matin ?</li><li>Quel est ton plaisir coupable en matière de séries ?</li><li>Quel plat détestes-tu alors que tout le monde l’adore ?</li><li>Quel est le surnom le plus ridicule qu’on t’ait donné ?</li><li>Si tu pouvais échanger ta vie avec quelqu’un pendant une journée, qui choisirais-tu ?</li></ul><h3>Souvenirs et moments gênants</h3><ul><li>Quel est ton souvenir le plus embarrassant à l’école ?</li><li>As-tu déjà envoyé un message à la mauvaise personne ? Raconte.</li><li>Quelle est la chose la plus bizarre que tu aies faite quand tu te croyais seul ?</li><li>Quelle bêtise as-tu faite enfant sans jamais te faire prendre ?</li><li>Quel est le fou rire le plus mal placé de ta vie ?</li><li>As-tu déjà fait semblant d’être malade pour éviter quelque chose ?</li><li>Quelle tenue de ton passé aimerais-tu effacer de toutes les photos ?</li><li>Quel est le pire rendez-vous auquel tu sois allé ?</li></ul><h3>Pour mieux se connaître</h3><ul><li>De quoi es-tu le plus fier cette année ?</li><li>Qu’est-ce qui te fait vraiment peur ?</li><li>Quel rêve n’as-tu encore jamais avoué à personne ?</li><li>Quelle est la meilleure décision que tu aies prise ?</li><li>Qu’est-ce que les gens se trompent souvent à ton sujet ?</li><li>Quel pays rêves-tu de visiter, et pourquoi celui-là ?</li><li>Quelle est la qualité que tu apprécies le plus chez un ami ?</li><li>Si tu gagnais au loto demain, quelle serait ta première dépense ?</li><li>Quel conseil donnerais-tu à toi-même il y a dix ans ?</li><li>Qu’est-ce qui te met de bonne humeur instantanément ?</li><li>Quelle est la chose la plus spontanée que tu aies faite ?</li></ul><h3>Un peu de séduction (entre adultes, sans excès)</h3><ul><li>Qu’est-ce qui t’attire en premier chez quelqu’un ?</li><li>As-tu déjà eu un coup de cœur pour une personne inaccessible ?</li><li>Quelle est ta technique de drague, si tu en as une ?</li><li>Quel est le compliment qui t’a le plus touché ?</li><li>Quel est le détail qui te fait craquer ?</li><li>As-tu déjà fait le premier pas ? Comment ça s’est passé ?</li><li>Quel est ton rendez-vous idéal ?</li><li>Quelle est la phrase d’approche la plus nulle qu’on t’ait sortie ?</li><li>Tu préfères qu’on te fasse rire ou qu’on te fasse rêver ?</li><li>Quel est le dernier message qui t’a fait sourire bêtement ?</li><li>Qu’est-ce que tu as remarqué chez moi depuis le début de l’appel ?</li><li>Plutôt déclaration romantique ou clin d’œil discret ?</li><li>Quel film d’amour regardes-tu en cachette ?</li><li>As-tu déjà été jaloux pour une raison ridicule ?</li><li>Si on se croisait dans la rue, tu viendrais me parler ?</li><li>Quelle chanson mettrais-tu pour une soirée à deux ?</li></ul>',
        },
        {
          h2: '35 actions à faire devant la caméra, sans sortir de chez soi',
          html: '<h3>Les actions rigolotes</h3><ul><li>Imite un animal pendant dix secondes, l’autre doit deviner lequel.</li><li>Parle avec un accent étranger jusqu’à ton prochain tour.</li><li>Fais ta meilleure grimace et garde-la cinq secondes.</li><li>Chante le refrain de la dernière chanson que tu as écoutée.</li><li>Raconte ta journée comme un commentateur sportif.</li><li>Fais une déclaration d’amour passionnée à un objet de ta chambre.</li><li>Essaie de te toucher le nez avec la langue.</li><li>Danse trente secondes sans musique.</li><li>Lis le dernier texte de ta liste de courses avec une voix dramatique.</li><li>Fais un tour de magie, même raté.</li><li>Dis l’alphabet à l’envers le plus vite possible.</li><li>Mime ton film préféré sans parler.</li></ul><h3>Les actions qui demandent un objet</h3><ul><li>Va chercher l’objet le plus bizarre de ta maison et invente son histoire.</li><li>Mets un chapeau ou un bonnet improvisé jusqu’à la fin de la partie.</li><li>Montre l’intérieur de ton frigo et défends ton contenu.</li><li>Dessine l’autre personne en trente secondes et montre le résultat.</li><li>Fais une pyramide avec ce que tu as sur ton bureau.</li><li>Présente ton animal de compagnie, ou ta plante, comme une star.</li><li>Mange une cuillère d’un condiment choisi par l’autre (rien de dangereux).</li><li>Mets tes chaussettes sur tes mains pendant deux tours.</li><li>Fais une publicité de vingt secondes pour un objet de ta cuisine.</li><li>Écris un mot sur une feuille avec ta main non dominante et fais-le deviner.</li></ul><h3>Les actions taquines</h3><ul><li>Fais ton plus beau regard de séducteur à la caméra.</li><li>Fais un compliment sincère à l’autre sans rire.</li><li>Envoie un clin d’œil et un bisou soufflé à l’écran.</li><li>Récite une phrase de drague inventée sur-le-champ.</li><li>Prends la pose comme pour une couverture de magazine.</li><li>Décris l’autre personne en trois mots flatteurs.</li><li>Chante une chanson d’amour en la dédiant à l’autre.</li><li>Fais un défilé avec ta veste préférée.</li><li>Laisse l’autre choisir ton nouveau surnom pour la partie.</li><li>Lis un poème improvisé de quatre vers sur ton interlocuteur.</li><li>Reproduis la danse d’un clip célèbre, version courte.</li><li>Fais semblant d’être en plein rendez-vous galant avec la caméra.</li><li>Donne une note sur dix au sourire de l’autre et justifie-la.</li></ul><p>Remarque : aucune action n’implique de se déshabiller, de montrer un lieu identifiable ou de faire quoi que ce soit de risqué. C’est volontaire.</p>',
        },
        {
          h2: 'Le consentement : le vrai secret d’une bonne partie',
          html: '<p>Action ou vérité fonctionne parce qu’il crée une petite tension amusante. Mais cette tension doit rester un jeu. Quelques principes à garder en tête :</p><ul><li><strong>« Je passe » est une réponse valable</strong>, pas un aveu. On ne relance pas, on ne se moque pas, on continue.</li><li><strong>On monte en intensité ensemble.</strong> Si l’autre reste sur des questions sages, suis son rythme.</li><li><strong>Un défi intime n’est jamais une action.</strong> Toute demande de se déshabiller, de montrer son corps ou de passer sur une autre appli met fin à la partie. C’est aussi le scénario classique de la sextorsion, décrit dans notre guide pour <a href="@guide-privacy">protéger ta vie privée</a>.</li><li><strong>Pas de vérité qui identifie.</strong> Nom de famille, adresse, lieu de travail : ces questions n’ont rien à faire dans un jeu entre inconnus.</li></ul><p>Si quelqu’un insiste, tu quittes l’appel et tu signales. Une partie réussie, c’est celle où les deux personnes ont envie d’en refaire une.</p>',
        },
        {
          h2: 'Jouer à action ou vérité sur La Ruleta Caliente',
          html: '<p>Sur La Ruleta Caliente, tu n’as même pas besoin de cette liste : <strong>Action ou vérité</strong> est intégré directement à l’appel vidéo. Tu proposes une partie, l’autre accepte ou refuse, et les questions s’affichent sous l’image. Chaque partie rapporte des piments 🌶️, les points gratuits du site.</p><p>Entre deux adultes qui l’ont activé tous les deux, le <strong>mode piquant</strong> ajoute des questions plus osées, sans jamais devenir explicite. Si un seul l’a activé, la version classique reste la règle. Les autres jeux disponibles pendant l’appel (Tu préfères ?, Pierre-feuille-ciseaux, Dessine et devine) sont présentés sur la page <a href="@video-chat-games">jeux pour appel vidéo</a>, et le fonctionnement des piments et pouvoirs sur la page <a href="@games">Jeux et pouvoirs</a>. Le site est réservé aux 18 ans et plus.</p>',
        },
      ],
      faq: [
        { q: 'Comment jouer à action ou vérité en appel vidéo ?', a: 'Chacun son tour choisit entre répondre à une question ou faire un défi visible à la caméra. Fixez l’ambiance au départ et gardez le droit de dire « je passe ».' },
        { q: 'Quelles questions poser à quelqu’un qu’on ne connaît pas ?', a: 'Commence par des vérités légères sur les habitudes, les souvenirs drôles ou les goûts. Les questions plus personnelles viennent plus tard, si l’autre le veut bien.' },
        { q: 'Que faire si on me propose un défi qui me met mal à l’aise ?', a: 'Dis simplement « je passe ». Si la personne insiste ou te demande quelque chose d’intime, quitte l’appel et signale-la.' },
        { q: 'Peut-on jouer à action ou vérité directement sur La Ruleta Caliente ?', a: 'Oui, le jeu est intégré à l’appel vidéo : tu proposes une partie et les questions apparaissent sous l’image, sans rien installer.' },
      ],
    },

    'guide-would-you-rather': {
      slug: 'questions-tu-preferes',
      anchor: 'Questions tu préfères',
      title: 'Questions « tu préfères » : 70 idées pour rire',
      description: 'Questions tu préfères classées par thème : drôles, difficiles, voyages, séduction et absurdes. 70 idées pour animer un appel vidéo ou une soirée.',
      h1: 'Questions « tu préfères » : 70 idées classées par thème',
      intro: '<p>Deux options, un seul choix, et un débat qui démarre tout seul : le jeu du « tu préfères » est l’un des moyens les plus simples de lancer une conversation. Il ne demande ni matériel ni préparation, il marche avec un ami de longue date comme avec un inconnu croisé en appel vidéo, et il en dit souvent plus long sur quelqu’un qu’une longue présentation.</p><p>Voici plus de 100 <strong>questions tu préfères</strong>, rangées par thème pour que tu puisses piocher selon l’ambiance : drôles, difficiles, voyages, séduction ou complètement absurdes.</p>',
      sections: [
        {
          h2: 'Comment rendre une partie de « tu préfères » vraiment intéressante',
          html: '<p>Le jeu tient en une phrase, mais quelques astuces font la différence entre un échange poli et une vraie discussion :</p><ul><li><strong>Demande toujours « pourquoi ? ».</strong> Le choix en lui-même compte moins que l’explication.</li><li><strong>Interdis le « les deux » et le « aucun ».</strong> Le jeu perd tout son sel si on peut esquiver.</li><li><strong>Réponds aussi.</strong> Une question posée, une question reçue : c’est un échange, pas un interrogatoire.</li><li><strong>Adapte le niveau.</strong> Avec quelqu’un que tu viens de rencontrer, commence par les questions drôles avant d’aller vers les dilemmes.</li><li><strong>Invente les tiennes.</strong> Les meilleures questions naissent souvent de la conversation elle-même.</li></ul>',
        },
        {
          h2: 'Questions « tu préfères » drôles',
          html: '<ul><li>Tu préfères avoir le hoquet toute ta vie ou éternuer toutes les cinq minutes ?</li><li>Tu préfères parler comme un pirate ou chanter tout ce que tu dis ?</li><li>Tu préfères avoir des mains à la place des pieds ou des pieds à la place des mains ?</li><li>Tu préfères ne plus jamais manger de fromage ou ne plus jamais manger de chocolat ?</li><li>Tu préfères que ton historique de recherche soit public ou tes messages vocaux ?</li><li>Tu préfères avoir un rire de dauphin ou un rire de cochon ?</li><li>Tu préfères être toujours en avance d’une heure ou en retard de dix minutes ?</li><li>Tu préfères porter des chaussettes mouillées pour toujours ou un pull qui gratte ?</li><li>Tu préfères avoir une chanson de dessin animé coincée dans la tête à vie ou ne plus jamais écouter de musique ?</li><li>Tu préfères marcher comme un pingouin ou parler comme un robot ?</li><li>Tu préfères que ton chat sache parler ou que ton frigo sache cuisiner ?</li><li>Tu préfères être suivi par un narrateur qui commente ta vie ou par une musique de film ?</li><li>Tu préfères ne plus pouvoir utiliser d’emoji ou ne plus pouvoir envoyer de GIF ?</li><li>Tu préfères avoir les cheveux qui changent de couleur selon ton humeur ou les oreilles qui rougissent quand tu mens ?</li><li>Tu préfères vivre sans internet pendant un mois ou sans eau chaude pendant un mois ?</li></ul>',
        },
        {
          h2: 'Questions « tu préfères » difficiles et dilemmes',
          html: '<p>Celles-ci divisent vraiment. Prépare-toi à des débats plus longs.</p><ul><li>Tu préfères connaître la date de ta mort ou la cause ?</li><li>Tu préfères pouvoir revenir dans le passé ou voir le futur ?</li><li>Tu préfères être très riche mais seul ou modeste et entouré ?</li><li>Tu préfères tout oublier de ton passé ou ne rien pouvoir retenir du futur ?</li><li>Tu préfères dire toujours la vérité ou ne jamais savoir quand on te ment ?</li><li>Tu préfères avoir un métier passionnant mal payé ou un métier ennuyeux très bien payé ?</li><li>Tu préfères être célèbre ou être respecté ?</li><li>Tu préfères lire dans les pensées ou être invisible ?</li><li>Tu préfères vivre 200 ans en bonne santé ou recommencer ta vie à zéro avec tes souvenirs ?</li><li>Tu préfères perdre tous tes souvenirs d’enfance ou toutes tes photos ?</li><li>Tu préfères avoir un seul vrai ami ou cent connaissances sympathiques ?</li><li>Tu préfères savoir parler toutes les langues ou jouer de tous les instruments ?</li><li>Tu préfères pouvoir arrêter le temps ou le rembobiner de dix secondes ?</li><li>Tu préfères ne plus jamais avoir peur ou ne plus jamais être triste ?</li><li>Tu préfères changer une décision de ton passé ou connaître le résultat d’une décision future ?</li><li>Tu préfères être le plus intelligent d’une pièce ou le plus drôle ?</li></ul>',
        },
        {
          h2: 'Questions « tu préfères » sur les voyages et le quotidien',
          html: '<h3>Voyages</h3><ul><li>Tu préfères la montagne ou la mer ?</li><li>Tu préfères un road trip improvisé ou un voyage organisé à la minute ?</li><li>Tu préfères visiter toutes les capitales d’Europe ou faire le tour d’un seul pays lointain ?</li><li>Tu préfères voyager seul ou toujours accompagné ?</li><li>Tu préfères dormir à la belle étoile ou dans un hôtel de luxe sans fenêtre ?</li><li>Tu préfères ne plus jamais prendre l’avion ou ne plus jamais prendre le train ?</li><li>Tu préfères vivre un an au Japon ou un an au Brésil ?</li><li>Tu préfères parler la langue locale partout où tu vas ou ne jamais te perdre ?</li><li>Tu préfères un week-end en ville ou une semaine dans un village perdu ?</li><li>Tu préfères voir les aurores boréales ou plonger dans un récif de corail ?</li></ul><h3>Vie quotidienne</h3><ul><li>Tu préfères travailler de chez toi pour toujours ou ne plus jamais travailler de chez toi ?</li><li>Tu préfères te lever à 5 h ou te coucher à 3 h ?</li><li>Tu préfères cuisiner tous les soirs ou faire la vaisselle tous les soirs ?</li><li>Tu préfères le café ou le thé, pour le reste de ta vie ?</li><li>Tu préfères un appartement en centre-ville ou une maison à la campagne ?</li><li>Tu préfères regarder un film au cinéma seul ou chez toi entre amis ?</li><li>Tu préfères avoir un chien ou un chat ?</li><li>Tu préfères pizza ou burger, pour toujours ?</li><li>Tu préfères l’été toute l’année ou l’hiver toute l’année ?</li><li>Tu préfères perdre ton téléphone ou tes clés une fois par semaine ?</li></ul>',
        },
        {
          h2: 'Questions « tu préfères » pour séduire (sans en faire trop)',
          html: '<p>Pour une discussion qui prend un tour plus complice, entre adultes, ces questions restent légères tout en en disant beaucoup :</p><ul><li>Tu préfères un premier rendez-vous au restaurant ou en balade ?</li><li>Tu préfères qu’on te fasse rire ou qu’on te surprenne ?</li><li>Tu préfères les déclarations écrites ou dites en face ?</li><li>Tu préfères faire le premier pas ou qu’on le fasse pour toi ?</li><li>Tu préfères un regard qui dure ou un sourire en coin ?</li><li>Tu préfères un compliment sur ton style ou sur ton humour ?</li><li>Tu préfères une soirée dansante ou un dîner aux chandelles ?</li><li>Tu préfères les longues conversations au téléphone ou les messages toute la journée ?</li><li>Tu préfères quelqu’un de mystérieux ou quelqu’un de transparent ?</li><li>Tu préfères tomber amoureux en voyage ou chez toi ?</li><li>Tu préfères un coup de foudre ou une amitié qui devient plus ?</li><li>Tu préfères recevoir des fleurs ou une playlist faite pour toi ?</li></ul><p>Si la personne répond par monosyllabes, ne force pas : reviens aux questions drôles, ou change d’interlocuteur. Nos conseils pour <a href="@guide-flirting">flirter en chat vidéo</a> détaillent comment lire les signaux.</p>',
        },
        {
          h2: 'Questions absurdes et jouer en appel vidéo',
          html: '<h3>Complètement absurdes</h3><ul><li>Tu préfères combattre un canard de la taille d’un cheval ou cent chevaux de la taille d’un canard ?</li><li>Tu préfères avoir une queue de chat ou des antennes d’escargot ?</li><li>Tu préfères que les nuages aient goût de barbe à papa ou que la pluie soit de la limonade ?</li><li>Tu préfères parler aux pigeons ou comprendre les poissons ?</li><li>Tu préfères éternuer des paillettes ou bâiller des bulles de savon ?</li><li>Tu préfères que ta voix soit celle d’un GPS ou d’un présentateur météo ?</li><li>Tu préfères avoir un dragon de poche ou une licorne de la taille d’un hamster ?</li><li>Tu préfères vivre dans une maison en pain d’épice ou dans un igloo climatisé ?</li></ul><h3>Le jeu intégré à l’appel</h3><p>Sur La Ruleta Caliente, <strong>Tu préfères ?</strong> fait partie des jeux que tu peux lancer pendant l’appel vidéo : les deux options s’affichent sous l’image, chacun vote, et vous découvrez vos réponses en même temps. Entre deux adultes qui l’ont activé, le mode piquant ajoute des dilemmes plus osés. Les autres jeux sont décrits sur la page <a href="@video-chat-games">jeux pour appel vidéo</a>. Le site est réservé aux 18 ans et plus ; garde tes informations personnelles pour toi, même quand la partie devient très complice.</p>',
        },
      ],
      faq: [
        { q: 'Comment jouer au jeu « tu préfères » ?', a: 'Une personne propose deux options, l’autre choisit et explique pourquoi, puis on inverse les rôles. Interdire « les deux » rend la partie plus drôle.' },
        { q: 'Quelles sont les meilleures questions « tu préfères » pour une première conversation ?', a: 'Les questions drôles et les voyages sont idéales : elles font rire sans rien demander de trop personnel. Garde les dilemmes et la séduction pour plus tard.' },
        { q: 'Peut-on jouer à « tu préfères » à distance ?', a: 'Oui, c’est parfait pour un appel vidéo. Sur La Ruleta Caliente, Tu préfères ? est même intégré à l’appel et rapporte des piments 🌶️.' },
      ],
    },

    'guide-meet-people-online': {
      slug: 'rencontrer-des-gens-sur-internet',
      anchor: 'Rencontrer des gens en ligne',
      title: 'Comment rencontrer de nouvelles personnes sur internet',
      description: 'Comment rencontrer de nouvelles personnes sur internet : où chercher, se présenter, passer en appel vidéo, repérer les arnaques et se voir en toute sécurité.',
      h1: 'Comment rencontrer de nouvelles personnes sur internet sans prendre de risques',
      intro: '<p>Déménagement, travail à distance, cercle d’amis qui s’est réduit, ou simple envie de sortir de son quotidien : les raisons de vouloir élargir ses horizons ne manquent pas. Et aujourd’hui, savoir <strong>comment rencontrer de nouvelles personnes sur internet</strong> est presque une compétence de base. On y trouve des amis, des partenaires de sport, des correspondants étrangers, parfois l’amour.</p><p>Encore faut-il savoir où chercher, comment se présenter et surtout comment éviter les mauvaises surprises. Ce guide fait le tour de la question, de la première conversation jusqu’au premier rendez-vous en vrai.</p>',
      sections: [
        {
          h2: 'Où rencontrer des gens en ligne ?',
          html: '<p>Chaque type de plateforme correspond à une envie différente. Le bon choix dépend de ce que tu cherches :</p><ul><li><strong>Les communautés autour d’une passion</strong> (forums, serveurs de discussion, groupes de jeux vidéo, clubs de lecture en ligne) : idéales pour se faire des amis, car on part d’un intérêt commun.</li><li><strong>Les applis de rencontre</strong> : pensées pour la séduction, avec des profils et des photos.</li><li><strong>Les applis d’échange linguistique</strong> : parfaites pour pratiquer une langue avec un natif.</li><li><strong>Les groupes locaux</strong> sur les réseaux sociaux : sorties, randonnées, soirées jeux de société près de chez toi.</li><li><strong>Les chats vidéo aléatoires</strong> : on tombe sur quelqu’un au hasard et on se voit tout de suite. C’est le plus spontané, et on sait d’emblée à qui on parle. Sur La Ruleta Caliente, réservé aux adultes, tu peux entrer sans inscription et le chat écrit traduit automatiquement si vous ne parlez pas la même langue.</li></ul><p>Le plus efficace reste souvent de combiner deux approches : une communauté pour les échanges réguliers, et des rencontres plus spontanées pour la surprise.</p>',
        },
        {
          h2: 'Se présenter : le profil et les premiers messages',
          html: '<h3>Un profil sincère plutôt que parfait</h3><p>Une photo récente où l’on voit ton visage, quelques lignes sur ce que tu aimes, ce que tu cherches : c’est tout ce qu’il faut. Les profils qui sonnent vrai attirent des gens qui te correspondent. Évite en revanche les détails qui permettent de te localiser : nom de famille, entreprise, salle de sport habituelle.</p><h3>Des premiers messages qui donnent envie de répondre</h3><ul><li><strong>Rebondis sur un détail</strong> du profil ou de la conversation plutôt que d’envoyer un « salut ça va » générique.</li><li><strong>Pose une question ouverte</strong>, à laquelle on ne peut pas répondre par oui ou non.</li><li><strong>Parle un peu de toi</strong> pour équilibrer l’échange.</li><li><strong>Ne copie-colle pas</strong> le même message à vingt personnes : ça se voit.</li></ul><p>En vidéo, le principe est le même : un sourire, une question simple et de l’écoute. Notre guide pour <a href="@guide-icebreakers">briser la glace</a> propose des phrases prêtes à l’emploi.</p>',
        },
        {
          h2: 'Pourquoi passer par un appel vidéo avant de se voir',
          html: '<p>Avant de rencontrer quelqu’un en personne, un appel vidéo est l’étape la plus utile qui soit. En quelques minutes, il permet de :</p><ul><li><strong>vérifier que la personne est bien celle des photos</strong> : c’est la meilleure parade contre les faux profils ;</li><li><strong>sentir le courant</strong> : l’humour, la voix, la façon d’écouter passent mal par écrit ;</li><li><strong>éviter un rendez-vous décevant</strong> pour les deux ;</li><li><strong>repérer les signaux bizarres</strong> : caméra toujours « en panne », image figée, refus systématique de se montrer.</li></ul><p>Une personne qui refuse tout appel vidéo pendant des semaines tout en promettant monts et merveilles mérite ta méfiance. Pour te sentir à l’aise devant l’objectif, lis aussi nos conseils pour <a href="@guide-camera">bien paraître à la caméra</a>.</p>',
        },
        {
          h2: 'Signaux d’alerte et arnaques à connaître',
          html: '<p>La grande majorité des gens rencontrés en ligne sont sincères. Mais certains schémas reviennent si souvent qu’ils doivent t’alerter immédiatement :</p><ul><li><strong>Des sentiments très intenses très vite</strong> : déclaration d’amour après quelques jours, projets de vie commune sans s’être vus.</li><li><strong>Une demande d’argent</strong>, quelle qu’en soit la raison : billet d’avion, hôpital, colis bloqué en douane, investissement « sûr ». C’est le cœur de l’arnaque aux sentiments.</li><li><strong>Une pression pour quitter la plateforme</strong> et continuer sur une messagerie privée dès les premiers échanges.</li><li><strong>Des demandes d’images intimes</strong> : c’est le point de départ de la sextorsion.</li><li><strong>Une histoire qui ne tient pas</strong> : détails qui changent, photos trop parfaites, impossibilité permanente de se montrer.</li><li><strong>Des liens</strong> vers des sites qui demandent tes identifiants ou des informations bancaires.</li></ul><p>Un seul de ces signaux suffit pour prendre du recul. Coupe la conversation, ne paie rien, garde les preuves et signale le profil. Notre guide pour <a href="@guide-privacy">protéger ta vie privée en chat vidéo</a> détaille les réflexes à adopter, et la page <a href="@safety">conseils de sécurité</a> explique comment réagir face au chantage.</p>',
        },
        {
          h2: 'Passer à la rencontre en vrai, en toute sécurité',
          html: '<p>Vous vous êtes parlé, vus en vidéo, le courant passe : place au premier rendez-vous. Quelques règles simples permettent d’en profiter l’esprit léger :</p><ol><li><strong>Choisis un lieu public et fréquenté</strong> : café, parc animé, musée. Jamais chez l’un ou l’autre la première fois.</li><li><strong>Préviens un proche</strong> : où tu vas, avec qui, et à quelle heure tu comptes rentrer. Un message convenu à mi-parcours rassure tout le monde.</li><li><strong>Gère ton trajet toi-même</strong> pour pouvoir partir quand tu le souhaites, sans dépendre de l’autre.</li><li><strong>Garde ton téléphone chargé</strong> et à portée de main.</li><li><strong>Reste maître de ta consommation</strong> et ne laisse pas ton verre sans surveillance.</li><li><strong>Écoute ton intuition</strong> : si quelque chose cloche, tu as le droit de partir, sans explication.</li></ol><p>Une personne bien intentionnée comprendra parfaitement ces précautions. Si elles agacent l’autre, c’est déjà une réponse.</p>',
        },
        {
          h2: 'Garder le plaisir de la rencontre',
          html: '<p>Rencontrer des gens sur internet demande un peu de patience. Toutes les conversations ne mènent pas à une amitié, et c’est normal : chaque échange, même bref, rend le suivant plus facile. Garde l’esprit ouvert, sois toi-même, et ne t’impose pas de résultat.</p><p>Et si tu veux simplement discuter sans pression, un chat vidéo aléatoire entre adultes permet de croiser des personnes du monde entier en quelques clics, puis de cliquer sur <strong>Suivant</strong> quand le courant ne passe pas. Sur La Ruleta Caliente, l’autre personne ne voit pas ton adresse IP, et chaque signalement est examiné par une personne de l’équipe.</p>',
        },
      ],
      faq: [
        { q: 'Où rencontrer de nouvelles personnes sur internet ?', a: 'Les communautés autour d’une passion, les groupes locaux, les applis d’échange linguistique et les chats vidéo sont de bons points de départ, selon que tu cherches des amis, l’amour ou simplement à discuter.' },
        { q: 'Comment savoir si une personne rencontrée en ligne est réelle ?', a: 'Propose un appel vidéo assez tôt. Une personne qui refuse toujours de se montrer ou dont l’histoire change souvent doit éveiller ta méfiance.' },
        { q: 'Quels sont les signes d’une arnaque aux sentiments ?', a: 'Des déclarations très rapides, une pression pour quitter la plateforme et, tôt ou tard, une demande d’argent. Dans ce cas, coupe le contact et signale le profil.' },
        { q: 'Comment organiser un premier rendez-vous en sécurité ?', a: 'Choisis un lieu public, préviens un proche, gère ton propre trajet et pars dès que tu ne te sens pas à l’aise.' },
      ],
    },

    'video-chat-men': {
      slug: 'chat-video-avec-des-hommes',
      anchor: 'Chat avec des hommes',
      title: 'Chat vidéo avec des hommes · La Ruleta Caliente',
      description: 'Chat avec des hommes en vidéo, en direct et en tête-à-tête. Gratuit au hasard, filtre Premium pour ne voir que des hommes. Réservé aux 18 ans et plus.',
      h1: 'Chat avec des hommes : discute en vidéo avec des mecs du monde entier',
      intro: '<p>Envie d’un <strong>chat avec des hommes</strong>, en vidéo et en direct ? Sur La Ruleta Caliente, tu te retrouves face à une personne majeure choisie au hasard, en tête-à-tête, depuis ton navigateur. En gratuit, la surprise est totale ; avec le <strong>filtre Premium</strong>, tu peux décider de ne rencontrer que des hommes. Que tu sois une femme, un homme, une personne trans ou un couple, voici comment ce tchat mecs fonctionne vraiment.</p>',
      sections: [
        {
          h2: 'Un tchat mecs gratuit, mais au hasard',
          html: '<p>Sans abonnement, la mise en relation est aléatoire : la prochaine personne peut être un homme, une femme, une personne trans ou un couple. Tu ne paies rien, tu discutes aussi longtemps que tu veux et tu passes à quelqu’un d’autre avec <strong>Suivant</strong> (ou la touche Échap). Pas besoin de compte : ton genre, ta date de naissance et la confirmation de tes 18 ans suffisent pour entrer.</p><p>Beaucoup de gens aiment cette part d’imprévu, qui donne parfois les conversations les plus inattendues. Si tu préfères cibler, passe à l’étape suivante.</p>',
        },
        {
          h2: 'Le filtre Premium pour discuter uniquement avec des hommes',
          html: '<p>Avec <strong>Premium</strong>, tu choisis qui tu vois : des hommes, des femmes, des personnes trans ou des couples. Tu peux combiner ce choix avec les filtres par <strong>pays</strong>, par <strong>proximité</strong> et par <strong>âge</strong>, par exemple pour parler avec des hommes de ta région ou de ta tranche d’âge.</p><ul><li>7,99 € par semaine ou 19,99 € par mois, résiliable quand tu veux ;</li><li>un compte (e-mail ou Google) est nécessaire seulement pour payer ;</li><li>sans publicité, avec un historique de 30 jours, des amis et des appels, et des superpouvoirs offerts chaque jour.</li></ul><p>Si personne ne correspond à tes filtres à un moment précis, le site te propose de les élargir pour ne pas attendre trop longtemps.</p>',
        },
        {
          h2: 'Pour les femmes, les hommes et les couples',
          html: '<p>Une femme qui veut discuter avec des hommes, un homme qui cherche des potes pour parler foot ou jeux vidéo, un homme gay qui veut rencontrer d’autres hommes : le filtre sert à tout le monde. Pour ce dernier cas, notre page <a href="@video-chat-gay">chat gay</a> donne des conseils spécifiques. Et si c’est plutôt les femmes qui t’intéressent, va voir le <a href="@video-chat-women">chat vidéo avec des filles</a>.</p>',
        },
        {
          h2: 'Lancer la conversation sans malaise',
          html: '<p>Les premières secondes comptent. Montre ton visage, dis bonjour et pose une vraie question plutôt qu’un simple « ça va ? ». Si le silence s’installe, lance un jeu sans quitter la vidéo : <strong>Tu préfères ?</strong> pour rigoler, <strong>Pierre-feuille-ciseaux</strong> pour un duel express, <strong>Dessine et devine</strong> pour casser la glace. Le chat texte traduit automatiquement les messages, pratique quand ton interlocuteur parle une autre langue.</p><p>Tu manques d’idées ? Notre guide pour <a href="@guide-icebreakers">commencer une conversation</a> en propose des dizaines.</p>',
        },
        {
          h2: 'Ce que tu peux faire pendant l’appel',
          html: '<p>Une fois la conversation lancée, plusieurs outils rendent l’échange plus vivant. Envoie un 👍 ou un ❤️ quand une réponse te fait rire, ajoute la personne en ami si vous avez accroché, ou change de caméra pour montrer la vue depuis ta fenêtre. Le <strong>thermomètre de complicité</strong> monte quand le courant passe, et des sujets de discussion apparaissent si vous séchez.</p><p>Tu gagnes au passage des <strong>piments</strong> 🌶️, gratuits, qui comptent double chaque soir de 22 h à 23 h (heure de Paris). Ils activent des superpouvoirs : la <strong>Seconde chance</strong>, ou <strong>Retour</strong> pour retrouver la personne précédente si elle est d’accord.</p>',
        },
        {
          h2: 'Respect et sécurité',
          html: '<p>Le site est réservé aux 18 ans et plus. Chacun peut passer à la suite sans se justifier, et le <strong>mode piquant</strong> ne s’active qu’entre deux personnes qui l’ont choisi toutes les deux. Pendant l’appel, ton adresse IP reste cachée car la vidéo passe par notre serveur, et un filigrane invisible décourage les enregistrements. Si quelqu’un te met mal à l’aise, utilise <strong>Signaler</strong> : une personne de l’équipe vérifie. Ne donne ni ton numéro ni ton adresse à un inconnu, et lis nos <a href="@safety">conseils de sécurité</a> pour repérer le chantage et les arnaques.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on parler uniquement avec des hommes gratuitement ?', a: 'Non. En gratuit, la mise en relation est aléatoire. Le choix de ne voir que des hommes fait partie de Premium.' },
        { q: 'Le chat avec des hommes est-il ouvert aux femmes comme aux hommes ?', a: 'Oui. Tout adulte peut utiliser le filtre « hommes » de Premium, quel que soit son propre genre.' },
        { q: 'Peut-on choisir l’âge des hommes qu’on rencontre ?', a: 'Oui, Premium inclut un filtre par tranche d’âge, combinable avec le genre, le pays et la proximité.' },
      ],
    },

    'video-chat-trans': {
      slug: 'chat-video-trans',
      anchor: 'Chat trans',
      title: 'Chat trans en vidéo, dans le respect · La Ruleta Caliente',
      description: 'Chat trans en vidéo : entre en tant que personne trans ou choisis de rencontrer des personnes trans avec Premium. Respect obligatoire, 18 ans et plus.',
      h1: 'Chat trans : un chat vidéo où chacun est respecté',
      intro: '<p>Tu cherches un <strong>chat trans</strong> en vidéo, que tu sois toi-même une personne trans ou que tu veuilles simplement discuter avec des personnes trans ? Sur La Ruleta Caliente, l’option « trans » existe dès l’entrée, et le <strong>filtre Premium</strong> permet de rencontrer uniquement des personnes trans. Le tout dans un cadre clair : majorité obligatoire, règles contre le harcèlement et équipe de modération humaine.</p>',
      sections: [
        {
          h2: 'Entrer en tant que personne trans',
          html: '<p>Au moment de choisir ton genre, tu peux sélectionner l’option <strong>trans</strong>. Ensuite, comme pour tout le monde : ta date de naissance, la confirmation que tu as 18 ans ou plus, et c’est parti. Aucune inscription n’est exigée, aucun e-mail, aucun justificatif. Le compte reste facultatif, utile surtout pour retrouver ta progression sur plusieurs appareils ou pour souscrire à Premium.</p><p>En gratuit, tu rencontres des personnes au hasard, de tous les genres. Tu peux toujours passer à la suite d’un clic sur <strong>Suivant</strong>.</p>',
        },
        {
          h2: 'Le chat trans avec le filtre Premium',
          html: '<p>Si tu veux discuter uniquement avec des personnes trans, <strong>Premium</strong> te permet de choisir qui tu vois : personnes trans, femmes, hommes ou couples. Tu peux y ajouter les filtres par pays, proximité et âge. Premium coûte 7,99 € par semaine ou 19,99 € par mois et se résilie à tout moment.</p><p>Quand peu de monde correspond à tes critères à un instant donné, le site te propose d’élargir la recherche plutôt que de te laisser attendre devant un écran vide.</p>',
        },
        {
          h2: 'Le respect n’est pas une option',
          html: '<p>Les insultes, les remarques transphobes, les questions intrusives sur le corps ou le parcours de quelqu’un et l’insistance sont contraires aux <a href="@rules">règles de la communauté</a>. Ici, une personne trans est une personne avec qui on discute, pas une curiosité. Si tu ne sais pas comment t’adresser à quelqu’un, le plus simple est de lui demander poliment son prénom, puis de parler de tout le reste : voyages, musique, séries, projets.</p><p>Les comptes signalés font l’objet d’une vérification humaine et peuvent être exclus, avec la possibilité de contester une décision.</p>',
        },
        {
          h2: 'Des conversations qui vont plus loin que « salut »',
          html: '<p>Pour éviter le silence gêné, utilise les jeux intégrés : <strong>Action ou vérité</strong>, <strong>Tu préfères ?</strong>, <strong>Pierre-feuille-ciseaux</strong> et <strong>Dessine et devine</strong>. Le <strong>thermomètre de complicité</strong> montre quand le courant passe, et des sujets de discussion apparaissent si tu sèches. Le chat texte traduit les messages automatiquement, ce qui ouvre la porte à des échanges avec des gens d’autres pays. Plus d’idées sur la page <a href="@video-chat-games">jeux pour appel vidéo</a>.</p>',
        },
        {
          h2: 'Pour les alliés et les curieux bienveillants',
          html: '<p>Tu n’es pas trans mais tu veux rencontrer des personnes trans ? Bienvenue, à condition de venir pour une vraie conversation. Quelques repères simples :</p><ul><li>ne demande pas le « prénom d’avant », les opérations ou les traitements : ce sont des sujets intimes ;</li><li>utilise le prénom et les accords que la personne t’indique, et corrige-toi simplement si tu te trompes ;</li><li>parle de ce qui vous rapproche : humour, passions, voyages, séries ;</li><li>si l’autre préfère passer à la suite, respecte-le sans insister.</li></ul><p>Ces règles valent pour n’importe quelle rencontre, et elles rendent le chat plus agréable pour tout le monde.</p>',
        },
        {
          h2: 'Garder le contrôle de ta vie privée',
          html: '<p>Ton adresse IP n’est jamais visible par l’autre personne, la vidéo porte un filigrane invisible et enregistrer est interdit. Le superpouvoir <strong>Incognito</strong> masque ton âge et ton pays pendant une heure. Ne partage pas ton nom complet, ton adresse ni tes réseaux sociaux avec quelqu’un que tu viens de rencontrer, et coupe dès que tu te sens mal à l’aise. Notre guide pour <a href="@guide-privacy">protéger ta vie privée</a> et la page <a href="@safety">sécurité</a> vont plus loin.</p>',
        },
      ],
      faq: [
        { q: 'Comment indiquer que je suis une personne trans ?', a: 'Au moment de choisir ton genre en entrant, sélectionne l’option trans. Aucune inscription ni justificatif n’est demandé.' },
        { q: 'Peut-on rencontrer uniquement des personnes trans ?', a: 'Oui, avec Premium, qui permet de choisir de voir des personnes trans. En gratuit, la mise en relation reste aléatoire.' },
        { q: 'Que faire face à un message transphobe ?', a: 'Passe à la suite et utilise le bouton Signaler. L’équipe vérifie chaque signalement et peut exclure l’auteur.' },
      ],
    },

    'video-chat-gay': {
      slug: 'chat-video-gay',
      anchor: 'Chat gay',
      title: 'Chat gay en vidéo, entre hommes · La Ruleta Caliente',
      description: 'Chat gay en vidéo : avec le filtre Premium, un homme peut choisir de ne rencontrer que des hommes. Tchat gay en direct, respectueux, pour les 18 ans et plus.',
      h1: 'Chat gay : rencontre d’autres hommes en vidéo',
      intro: '<p>Tu es un homme et tu veux discuter en vidéo avec d’autres hommes ? Le <strong>chat gay</strong> de La Ruleta Caliente repose sur un principe simple : en gratuit, tu tombes sur des personnes au hasard ; avec le <strong>filtre Premium</strong>, tu choisis de ne voir que des hommes. Un tchat gay en direct, en tête-à-tête, sans application à installer, réservé aux adultes et encadré par des règles claires contre l’homophobie.</p>',
      sections: [
        {
          h2: 'Comment fonctionne le tchat gay',
          html: '<ol><li>Entre sans inscription : choisis « homme », indique ta date de naissance et confirme tes 18 ans.</li><li>Autorise la caméra et le micro dans ton navigateur, sur téléphone ou ordinateur.</li><li>Active Premium et choisis de voir des <strong>hommes</strong> si tu veux cibler tes rencontres.</li><li>Appuie sur <strong>Suivant</strong> pour changer de personne, <strong>Arrêter</strong> pour souffler.</li></ol><p>Sans Premium, la roulette reste ouverte à tout le monde : hommes, femmes, personnes trans et couples.</p>',
        },
        {
          h2: 'Le filtre Premium pour un chat gay ciblé',
          html: '<p>Premium (7,99 € par semaine ou 19,99 € par mois, résiliable quand tu veux) te laisse choisir qui tu vois. Ajoute le filtre par <strong>âge</strong> pour rencontrer des hommes de ta génération, par <strong>pays</strong> pour parler ta langue, ou par <strong>proximité</strong> pour voir d’abord des personnes près de chez toi. Tu peux aussi ajouter des amis et les rappeler plus tard, ce qui est pratique quand une conversation t’a plu. Un compte (e-mail ou Google) est nécessaire pour payer, pas pour discuter.</p>',
        },
        {
          h2: 'Zéro tolérance pour l’homophobie',
          html: '<p>Les insultes, les moqueries et le harcèlement liés à l’orientation sexuelle sont interdits par les <a href="@rules">règles de la communauté</a>. Un clic sur <strong>Signaler</strong> met fin à la conversation, empêche une nouvelle mise en relation avec cette personne et déclenche une vérification humaine. Les comptes fautifs sont exclus. Personne n’a à se justifier de passer à la suite.</p>',
        },
        {
          h2: 'Flirter, ou juste discuter',
          html: '<p>Certains viennent pour draguer, d’autres pour se faire des potes ou parler à quelqu’un qui les comprend. Les deux ont leur place. Le <strong>mode piquant</strong> ajoute des questions et des compliments plus osés, mais seulement si vous l’avez activé tous les deux : personne ne se le voit imposer. Pour flirter avec tact, notre guide <a href="@guide-flirting">flirter en chat vidéo</a> rappelle l’essentiel, et la page <a href="@flirt-chat">chat pour draguer</a> te donne d’autres pistes.</p>',
        },
        {
          h2: 'Un chat gay ouvert à tous les profils',
          html: '<p>Jeune adulte qui découvre, homme marié en questionnement, quadragénaire qui veut des potes avec qui parler : le chat ne juge personne. Le filtre d’<strong>âge</strong> de Premium aide à trouver des hommes de ta génération, comme sur le <a href="@video-chat-over-40">chat plus de 40 ans</a>. Les hommes bisexuels peuvent aussi garder la roulette ouverte à tous les genres, ou alterner selon leur envie. Et si tu veux simplement des conversations entre hommes, sans drague, dis-le dès le début : la plupart apprécient la franchise.</p>',
        },
        {
          h2: 'Discrétion et vie privée',
          html: '<p>Tout le monde ne souhaite pas que son orientation soit connue de son entourage, et c’est ton droit. Ici, l’autre personne ne voit jamais ton adresse IP, un filigrane invisible décourage les captures et enregistrer est interdit. Le superpouvoir <strong>Incognito</strong> masque ton âge et ton pays pendant une heure. Évite de montrer ton visage avec des éléments reconnaissables en arrière-plan si tu tiens à la discrétion, et ne cède jamais au chantage : coupe, signale et consulte nos <a href="@safety">conseils de sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Le chat gay est-il gratuit ?', a: 'Discuter est gratuit, mais en mode aléatoire. Le choix de ne rencontrer que des hommes fait partie de Premium.' },
        { q: 'Faut-il créer un compte pour le tchat gay ?', a: 'Non pour discuter : tu entres comme invité. Le compte n’est obligatoire que pour payer Premium.' },
        { q: 'Que faire si quelqu’un menace de diffuser une capture ?', a: 'Ne paie rien, coupe le contact et signale la personne. Garde des preuves et consulte notre page de sécurité, qui explique comment réagir au chantage.' },
      ],
    },

    'flirt-chat': {
      slug: 'chat-pour-draguer',
      anchor: 'Chat pour draguer',
      title: 'Chat pour draguer en vidéo · La Ruleta Caliente',
      description: 'Chat pour draguer en vidéo, en direct et au hasard : jeux, compliments, mode piquant à deux et respect avant tout. Gratuit pour commencer, 18 ans et plus.',
      h1: 'Chat pour draguer : flirte en vidéo, avec du piment et du respect',
      intro: '<p>Un <strong>chat pour draguer</strong> où l’on se voit vraiment, ça change tout : un sourire, un regard, un éclat de rire, et tu sais vite si le courant passe. La Ruleta Caliente te met en tête-à-tête vidéo avec une personne majeure choisie au hasard. Des jeux pour briser la glace, un mode piquant 🌶️ pour ceux qui le veulent, et des règles claires pour que le flirt reste un plaisir partagé.</p>',
      sections: [
        {
          h2: 'Pourquoi draguer en vidéo plutôt qu’en texte',
          html: '<p>Sur un tchat drague classique, on échange des messages pendant des heures sans savoir à qui on parle. En vidéo, l’alchimie se voit tout de suite. Tu évites les faux profils et les malentendus, et la conversation est plus naturelle. Si ça ne colle pas, <strong>Suivant</strong> et tu repars sur une nouvelle rencontre, sans vexer personne.</p>',
        },
        {
          h2: 'Les outils du flirt sur le chat pour draguer',
          html: '<ul><li><strong>Action ou vérité</strong> et <strong>Tu préfères ?</strong> : les questions parfaites pour en savoir plus sur l’autre, avec humour.</li><li><strong>Le thermomètre de complicité</strong> : il monte à mesure que la conversation se réchauffe.</li><li><strong>Les réactions</strong> 👍 ❤️ : un cœur envoyé au bon moment vaut mieux qu’un long discours, et il rapporte des piments à l’autre.</li><li><strong>Super coucou</strong> : un message mis en avant dès la connexion avec la personne suivante.</li><li><strong>Retour</strong> : tu as cliqué trop vite ? Reviens vers la personne précédente, si elle accepte.</li></ul>',
        },
        {
          h2: 'Le mode piquant, seulement à deux',
          html: '<p>Le <strong>mode piquant</strong> débloque des jeux et des compliments plus osés. Il ne s’applique qu’entre deux personnes qui l’ont activé toutes les deux : personne ne reçoit de défi épicé sans l’avoir choisi. Premium y ajoute d’autres jeux et compliments épicés. Tout reste dans le registre du jeu et de la séduction, sans contenu explicite.</p>',
        },
        {
          h2: 'Trois phrases d’accroche qui marchent',
          html: '<p>Oublie le « slt cv ». Une bonne accroche est légère, personnelle et appelle une réponse :</p><ul><li>« J’ai une question sérieuse : pizza à l’ananas, oui ou non ? »</li><li>« Tu as l’air de quelqu’un qui a une bonne histoire de voyage. J’ai raison ? »</li><li>« On joue à Tu préfères ? Le perdant raconte son pire rendez-vous. »</li></ul><p>Le ton compte autant que les mots : souris, regarde la caméra et laisse le temps de répondre. Et si tu vois que ça ne prend pas, un « bonne soirée ! » sympa vaut mieux qu’une relance lourde.</p>',
        },
        {
          h2: 'Draguer avec respect : les règles d’or',
          html: '<ol><li>Commence par la personne, pas par son physique : une question sur ce qu’elle fait ce soir marche mieux qu’un commentaire sur son apparence.</li><li>Observe ses réactions : si les réponses deviennent courtes, change de sujet ou passe à la suite.</li><li>Un « non » ou un « passe » se respecte immédiatement, sans négocier.</li><li>Ne demande ni photo, ni numéro, ni réseau social dès les premières minutes.</li></ol><p>Notre guide complet pour <a href="@guide-flirting">flirter en chat vidéo</a> détaille tout ça, avec des exemples. Les comportements insistants ou déplacés sont contraires aux <a href="@rules">règles</a> et mènent à l’exclusion.</p>',
        },
        {
          h2: 'Choisir qui tu dragues',
          html: '<p>En gratuit, la rencontre est aléatoire. Avec Premium (7,99 € par semaine ou 19,99 € par mois), tu choisis de voir des femmes, des hommes, des personnes trans ou des couples, et tu filtres par âge, pays et proximité. Selon ce que tu cherches, va voir le <a href="@video-chat-women">chat vidéo avec des filles</a> ou le <a href="@singles-chat">chat célibataires</a>. Rappel : le site est réservé aux 18 ans et plus, et tu ne dois jamais envoyer d’images intimes à un inconnu.</p>',
        },
      ],
      faq: [
        { q: 'Le chat pour draguer est-il gratuit ?', a: 'Oui, la mise en relation aléatoire, le chat texte et les jeux sont gratuits. Premium ajoute les filtres de genre, d’âge et de pays, ainsi que des jeux et compliments épicés en plus.' },
        { q: 'Comment activer le mode piquant ?', a: 'Active-le dans les options pendant le chat. Les contenus épicés n’apparaissent qu’avec une personne qui l’a activé elle aussi.' },
        { q: 'Comment draguer sans être lourd ?', a: 'Pose des questions sincères, souris, propose un jeu et respecte immédiatement un refus. Si l’autre n’accroche pas, passe à la suite avec le sourire.' },
      ],
    },

    'singles-chat': {
      slug: 'chat-celibataires',
      anchor: 'Chat célibataires',
      title: 'Chat célibataires en vidéo · La Ruleta Caliente',
      description: 'Chat célibataires en vidéo : rencontre des gens en direct, en tête-à-tête et au hasard, sans profil à remplir. Gratuit pour commencer, réservé aux 18 ans et +.',
      h1: 'Chat célibataires : des rencontres en vidéo, sans profil à remplir',
      intro: '<p>Marre de faire défiler des profils et d’échanger des messages qui ne mènent nulle part ? Un <strong>chat célibataires</strong> en vidéo te permet de voir la personne et de lui parler tout de suite. Sur La Ruleta Caliente, tu es mis en tête-à-tête avec un adulte choisi au hasard, et la conversation commence en quelques secondes. Petite précision honnête : on ne vérifie pas la situation amoureuse des gens, alors pose simplement la question.</p>',
      sections: [
        {
          h2: 'Un chat célibataires sans algorithme ni swipe',
          html: '<p>Pas de photo retouchée, pas de description à rédiger, pas de score de compatibilité : tu es face à quelqu’un, en direct. C’est plus spontané qu’une appli de rencontre, et souvent plus drôle. Tu entres sans inscription, en choisissant ton genre et en confirmant tes 18 ans, puis tu enchaînes les rencontres avec <strong>Suivant</strong>. Si tu veux garder ta progression d’un appareil à l’autre, le compte est facultatif.</p>',
        },
        {
          h2: 'Célibataire ? Dis-le simplement',
          html: '<p>Tout le monde ne vient pas pour les mêmes raisons : certains cherchent l’amour, d’autres veulent juste discuter ou rire. Le plus simple est d’annoncer la couleur avec légèreté : « Je suis célibataire et curieux de rencontrer du monde, et toi ? ». Tu gagnes du temps et tu évites les malentendus. Les jeux comme <strong>Tu préfères ?</strong> ou <strong>Action ou vérité</strong> aident à aborder le sujet sans que ça ressemble à un interrogatoire.</p>',
        },
        {
          h2: 'Affiner tes rencontres avec Premium',
          html: '<p>Premium (7,99 € par semaine ou 19,99 € par mois, résiliable à tout moment) ajoute ce qui manque à la roulette gratuite quand tu cherches quelqu’un en particulier :</p><ul><li>choisir de voir des femmes, des hommes, des personnes trans ou des couples ;</li><li>filtrer par <strong>âge</strong>, par <strong>pays</strong> et par <strong>proximité</strong> ;</li><li>ajouter en amis les personnes qui t’ont plu, et les appeler plus tard ;</li><li>un historique de 30 jours pour retrouver une conversation.</li></ul>',
        },
        {
          h2: 'Gagner des piments en route',
          html: '<p>Les <strong>piments</strong> 🌶️ récompensent ta présence : une série de connexions quotidiennes, des parties jouées, des ❤️ reçus et des défis hebdomadaires. Entre 22 h et 23 h (heure de Paris), pendant l’<strong>Heure chaude</strong>, ils comptent double. Ils servent à activer des superpouvoirs comme la <strong>Flamme ardente</strong> pour passer devant dans la file ou la <strong>Seconde chance</strong>. Le lundi, les trois premiers du classement gagnent du Premium.</p>',
        },
        {
          h2: 'Les questions qui en disent long',
          html: '<p>Pour savoir si vous êtes sur la même longueur d’onde, quelques questions valent mieux qu’un long échange de banalités :</p><ul><li>« Ton dimanche idéal, il ressemble à quoi ? »</li><li>« Le dernier truc qui t’a vraiment fait rire ? »</li><li>« Tu es plutôt projet de voyage organisé ou départ sur un coup de tête ? »</li><li>« Qu’est-ce que tu cherches ici, au juste ? »</li></ul><p>La dernière est la plus importante : elle évite de construire un château en Espagne avec quelqu’un qui voulait juste passer le temps.</p>',
        },
        {
          h2: 'Du chat vidéo au premier rendez-vous',
          html: '<p>Une conversation qui accroche donne envie d’aller plus loin. Prends ton temps : plusieurs échanges en vidéo valent mieux qu’un rendez-vous précipité. Ne donne pas ton adresse, méfie-toi de toute demande d’argent, et si vous décidez de vous voir, choisissez un lieu public et prévenez un proche. Notre guide pour <a href="@guide-meet-people-online">rencontrer des gens sur internet</a> détaille ces étapes, et la page <a href="@safety">sécurité</a> explique comment repérer une arnaque aux sentiments. Pour un échange plus joueur, va voir le <a href="@flirt-chat">chat pour draguer</a>.</p>',
        },
      ],
      faq: [
        { q: 'Tout le monde sur le chat est-il célibataire ?', a: 'Pas forcément. Nous ne vérifions pas la situation amoureuse des utilisateurs, alors le plus simple est de poser la question pendant la conversation.' },
        { q: 'Faut-il remplir un profil ?', a: 'Non. Tu entres en choisissant ton genre et en confirmant que tu as 18 ans ou plus. Pas de photo ni de description à rédiger.' },
        { q: 'Peut-on rencontrer des célibataires près de chez soi ?', a: 'Avec Premium, le filtre de proximité fait apparaître en priorité des personnes près de toi, et le filtre par pays limite les rencontres à ton pays.' },
      ],
    },

    'video-chat-over-40': {
      slug: 'chat-plus-de-40-ans',
      anchor: 'Chat plus de 40 ans',
      title: 'Chat pour les plus de 40 ans · La Ruleta Caliente',
      description: 'Chat plus de 40 ans ou 50 ans en vidéo : discute en direct avec des adultes et filtre par âge avec Premium. Simple, sans application, dans le navigateur.',
      h1: 'Chat plus de 40 ans : des conversations vidéo entre adultes',
      intro: '<p>Le chat vidéo n’est pas réservé aux vingtenaires. Si tu cherches un <strong>chat pour les plus de 40 ans</strong>, ou un tchat seniors pour les 50 ans et plus, La Ruleta Caliente te met en relation en direct avec des adultes du monde entier, en tête-à-tête. En gratuit, tu rencontres des personnes de tous âges ; avec le <strong>filtre d’âge Premium</strong>, tu choisis la tranche qui te correspond.</p>',
      sections: [
        {
          h2: 'Pourquoi un chat plus de 40 ans en vidéo',
          html: '<p>À 40, 50 ans ou plus, on sait souvent mieux ce qu’on cherche : une conversation intéressante, quelqu’un avec qui partager un humour, une expérience de vie comparable. La vidéo permet de juger tout de suite si le courant passe, sans des semaines de messages. Et on évite les profils trompeurs : la personne est là, devant toi, en direct.</p>',
        },
        {
          h2: 'Simple à utiliser, même sans être un pro de l’informatique',
          html: '<ol><li>Ouvre le site dans le navigateur de ton ordinateur, de ta tablette ou de ton téléphone : rien à télécharger.</li><li>Choisis ton genre, indique ta date de naissance et confirme que tu es majeur.</li><li>Autorise la caméra et le micro quand le navigateur le demande.</li><li>Appuie sur Commencer : une personne apparaît. <strong>Suivant</strong> pour en voir une autre.</li></ol><p>Le chat texte avec traduction automatique rend l’échange facile, même avec quelqu’un qui parle une autre langue. La page <a href="@how">Comment ça marche</a> reprend chaque étape.</p>',
        },
        {
          h2: 'Le filtre d’âge Premium pour le tchat seniors',
          html: '<p>Avec <strong>Premium</strong>, tu définis la tranche d’âge des personnes que tu veux rencontrer, par exemple 45-60 ans. Tu peux aussi choisir le genre (femmes, hommes, personnes trans ou couples), le pays et la proximité. Premium coûte 7,99 € par semaine ou 19,99 € par mois, sans engagement. Pense à tester d’abord la version gratuite : beaucoup de gens apprécient aussi de parler avec des générations différentes.</p>',
        },
        {
          h2: 'Des sujets qui font durer la conversation',
          html: '<p>Les voyages, la cuisine, la musique de ta jeunesse, les projets que tu as encore envie de réaliser : ce sont souvent les meilleures entrées en matière. Les jeux intégrés comme <strong>Tu préfères ?</strong> ou <strong>Dessine et devine</strong> détendent l’atmosphère en quelques secondes. Pour bien apparaître à l’écran, une lampe face à toi et la caméra à hauteur des yeux font des merveilles ; notre guide pour <a href="@guide-camera">bien paraître à la caméra</a> donne d’autres astuces.</p>',
        },
        {
          h2: 'Discuter avec toutes les générations',
          html: '<p>Le filtre d’âge est pratique, mais il n’est pas obligatoire. Beaucoup d’adultes trouvent rafraîchissant de parler avec des gens plus jeunes ou plus âgés : échanger sur la musique d’hier et d’aujourd’hui, comparer les façons de voyager, découvrir un autre regard sur le travail. Tu restes libre de passer à la suite à tout moment. Et si quelqu’un se moque de ton âge, ce comportement est contraire aux <a href="@rules">règles</a> : signale-le sans hésiter.</p>',
        },
        {
          h2: 'Les bons réflexes de sécurité',
          html: '<p>Le site est réservé aux 18 ans et plus, et l’autre personne ne voit jamais ton adresse IP. Les escrocs ciblent parfois les adultes qui cherchent une relation : méfie-toi d’une déclaration très rapide, d’une histoire dramatique ou d’une demande d’argent, même minime. Ne donne pas tes coordonnées bancaires ni ton adresse. En cas de doute, coupe et utilise <strong>Signaler</strong>. Nos <a href="@safety">conseils de sécurité</a> décrivent les arnaques les plus courantes, et le <a href="@singles-chat">chat célibataires</a> t’aide si tu cherches l’amour.</p>',
        },
      ],
      faq: [
        { q: 'Y a-t-il des gens de plus de 50 ans sur le chat ?', a: 'Le site est ouvert à tous les adultes, sans limite d’âge. Avec le filtre d’âge Premium, tu peux choisir de rencontrer en priorité des personnes de ta tranche d’âge.' },
        { q: 'Peut-on filtrer par âge gratuitement ?', a: 'Non, le filtre par âge fait partie de Premium. En gratuit, tu rencontres des adultes de tous âges, au hasard.' },
        { q: 'Faut-il installer quelque chose sur l’ordinateur ?', a: 'Non. Le chat fonctionne dans un navigateur récent, avec une webcam et un micro. Tu peux aussi l’ajouter à l’écran d’accueil de ton téléphone.' },
      ],
    },

    'meet-people-chat': {
      slug: 'chat-pour-faire-des-rencontres',
      anchor: 'Chat pour faire des rencontres',
      title: 'Chat pour faire des rencontres · La Ruleta Caliente',
      description: 'Chat pour faire des rencontres en vidéo : parle en direct avec des adultes du monde entier, joue, ajoute des amis. Gratuit, sans inscription, 18 ans et plus.',
      h1: 'Chat pour faire des rencontres : de nouvelles têtes en un clic',
      intro: '<p>Tu as envie d’élargir ton cercle, de parler à des gens que tu n’aurais jamais croisés autrement ? Un <strong>chat pour faire des rencontres</strong> en vidéo est la façon la plus directe d’y arriver. Sur La Ruleta Caliente, tu es mis en tête-à-tête avec un adulte choisi au hasard, quelque part dans le monde, et vous discutez en direct. Amitié, flirt, échange linguistique ou simple bavardage du soir : c’est toi qui vois.</p>',
      sections: [
        {
          h2: 'Faire des rencontres en vidéo, en trois gestes',
          html: '<p>Tu entres sans inscription en indiquant ton genre et ta date de naissance, tu autorises la caméra et tu appuies sur Commencer. C’est tout. Chaque clic sur <strong>Suivant</strong> te présente une nouvelle personne. Le site marche dans le navigateur, sur téléphone comme sur ordinateur, et peut s’ajouter à ton écran d’accueil comme une app.</p>',
        },
        {
          h2: 'Des rencontres du monde entier',
          html: '<p>La roulette ne s’arrête pas aux frontières. Grâce au chat texte avec <strong>traduction automatique</strong>, tu peux discuter avec quelqu’un qui parle portugais, allemand ou italien même si tu ne maîtrises pas sa langue. C’est aussi un excellent moyen de pratiquer une langue étrangère, comme l’explique la page <a href="@video-chat-foreigners">parler avec des étrangers</a>. Si tu préfères rester proche, Premium propose les filtres par pays et par proximité.</p>',
        },
        {
          h2: 'Transformer une rencontre en lien qui dure',
          html: '<ul><li><strong>Ajouter en ami</strong> : une conversation t’a plu ? Ajoute la personne pour la retrouver.</li><li><strong>Retour</strong> : ce superpouvoir te reconnecte à la personne précédente, si elle accepte.</li><li><strong>Amis et appels</strong> avec Premium : rappelle tes nouveaux contacts quand vous voulez.</li><li><strong>Historique de 30 jours</strong> avec Premium, pour ne perdre personne de vue.</li></ul><p>Les superpouvoirs s’activent avec des piments 🌶️, gagnés gratuitement en jouant et en revenant chaque jour.</p>',
        },
        {
          h2: 'Des jeux pour faire connaissance plus vite',
          html: '<p>Rien de tel qu’un jeu pour casser la glace. <strong>Action ou vérité</strong> et <strong>Tu préfères ?</strong> font parler, <strong>Dessine et devine</strong> fait rire, <strong>Pierre-feuille-ciseaux</strong> règle les petits défis. Le thermomètre de complicité montre quand vous êtes sur la même longueur d’onde. Pour les premières phrases, notre guide <a href="@guide-icebreakers">comment commencer une conversation</a> te donne des idées.</p>',
        },
        {
          h2: 'Bien démarrer chaque rencontre',
          html: '<p>Les rencontres réussies ont souvent les mêmes ingrédients :</p><ul><li><strong>un bon cadre</strong> : visage éclairé, caméra stable, bruit de fond limité ;</li><li><strong>une question ouverte</strong> plutôt qu’un simple « salut » ;</li><li><strong>de la curiosité sincère</strong> : rebondis sur ce que l’autre raconte ;</li><li><strong>de la patience</strong> : certaines conversations ne décollent pas, et c’est normal.</li></ul><p>Ne te décourage pas après quelques « Suivant » : c’est le jeu de la roulette. Chaque nouvelle personne est une nouvelle chance, et parfois la dixième conversation de la soirée est celle dont tu te souviendras.</p>',
        },
        {
          h2: 'Rencontrer du monde en toute sécurité',
          html: '<p>Le site est réservé aux 18 ans et plus. Ton adresse IP reste cachée, enregistrer est interdit et chaque signalement est vérifié par une personne de l’équipe. Garde pour toi ton adresse, ton lieu de travail et tes informations bancaires, et méfie-toi de quiconque te presse de quitter la plateforme. Si une rencontre se prolonge en vrai, notre guide pour <a href="@guide-meet-people-online">rencontrer des gens sur internet</a> explique comment préparer un premier rendez-vous sans risque. Plus de conseils sur la page <a href="@safety">sécurité</a>.</p>',
        },
      ],
      faq: [
        { q: 'Peut-on se faire des amis sur un chat vidéo ?', a: 'Oui. Ajoute en ami les personnes avec qui le courant passe, et utilise Premium si tu veux les appeler plus tard.' },
        { q: 'Le chat pour faire des rencontres est-il gratuit ?', a: 'Oui, les rencontres au hasard, le chat texte traduit et les jeux sont gratuits. Premium ajoute les filtres et d’autres avantages.' },
        { q: 'Peut-on rencontrer des gens de sa ville ?', a: 'Il n’y a pas de filtre par ville, mais le filtre de proximité de Premium fait apparaître d’abord des personnes près de chez toi.' },
      ],
    },
  },
};
