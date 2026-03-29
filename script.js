const SoundEngine = {
            ctx: null,
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if(this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            },
            playHover() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.1);
            },
            playClick() {
                if (!this.ctx) this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
            },
            playShoot() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.5);
            },
            playSuccess() {
                if (!this.ctx) return;
                [440, 554.37, 659.25, 880].forEach((freq, i) => { // A major chord
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    const startTime = this.ctx.currentTime + (i * 0.1);
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 1.5);
                });
            }
        };

        async function shareStory() {
            SoundEngine.playClick();
            const shareBtn = document.getElementById('shareBtn');
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = "⏳ Génération en cours...";
            shareBtn.disabled = true;

            try {
                // Determine current colors
                const rootFormat = getComputedStyle(document.documentElement);
                const bg1 = rootFormat.getPropertyValue('--bg1').trim() || '#1a0b16';
                const bg2 = rootFormat.getPropertyValue('--bg2').trim() || '#3a0d24';
                const primary = rootFormat.getPropertyValue('--primary').trim() || '#ff477e';

                // Clone results to a clean wrapper for html2canvas
                const resultsEl = document.getElementById('results');
                const clone = resultsEl.cloneNode(true);
                clone.style.display = 'block';
                clone.style.animation = 'none';

                const wrapper = document.createElement('div');
                wrapper.style.position = 'absolute';
                wrapper.style.left = '-9999px';
                wrapper.style.top = '0';
                wrapper.style.width = '600px';
                wrapper.style.padding = '40px';
                wrapper.style.background = `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`;
                wrapper.style.color = '#ffffff';
                wrapper.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
                wrapper.style.borderRadius = '20px';

                // Add header
                const header = document.createElement('h1');
                header.innerHTML = '💘 Cupidon IA';
                header.style.textAlign = 'center';
                header.style.marginBottom = '30px';
                header.style.fontSize = '3rem';
                header.style.color = primary;
                header.style.filter = `drop-shadow(0 0 10px ${primary})`;
                wrapper.appendChild(header);

                wrapper.appendChild(clone);

                // Add footer
                const footer = document.createElement('div');
                footer.innerHTML = 'Fais le crash-test de ta relation sur <b>temp-faw.github.io/Cupidon-IA/</b> ✨';
                footer.style.textAlign = 'center';
                footer.style.marginTop = '30px';
                footer.style.fontSize = '1.1rem';
                footer.style.color = 'rgba(255, 255, 255, 0.7)';
                wrapper.appendChild(footer);

                document.body.appendChild(wrapper);

                // IMPORTANT FIX: Remove all backdrop-filters and force text colors inside clone
                wrapper.querySelectorAll('*').forEach(el => {
                    el.style.backdropFilter = 'none';
                    el.style.webkitBackdropFilter = 'none';
                    
                    const comp = getComputedStyle(el);
                    if (comp.color === 'rgba(0, 0, 0, 0)' || comp.color === 'transparent') {
                        el.style.color = '#ffffff';
                    }
                });
                
                // Specific fixes for text colors that were lost
                wrapper.querySelectorAll('.text-analysis').forEach(el => el.style.color = '#eeeeee');
                wrapper.querySelectorAll('.score-label').forEach(el => el.style.color = '#dddddd');
                wrapper.querySelectorAll('.highlight-desc, .badge-desc').forEach(el => el.style.color = '#dddddd');
                
                // Remove the button from clone
                const clonedBtn = clone.querySelector('#shareBtn');
                if (clonedBtn) clonedBtn.remove();
                
                // Capture
                const canvas = await html2canvas(wrapper, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#000000'
                });

                document.body.removeChild(wrapper);

                const dataUrl = canvas.toDataURL('image/png');
                
                if (navigator.share && navigator.canShare) {
                    try {
                        const blob = await (await fetch(dataUrl)).blob();
                        const file = new File([blob], 'cupidon-resultat.png', { type: 'image/png' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Mon résultat Cupidon IA',
                                text: 'Regarde mon analyse de conversation sur Cupidon IA ! 💘 Teste ta relation ici : https://temp-faw.github.io/Cupidon-IA/'
                            });
                            shareBtn.innerHTML = "✅ Partagé !";
                            setTimeout(() => { shareBtn.innerHTML = originalText; shareBtn.disabled = false; }, 3000);
                            return;
                        }
                    } catch (err) {
                        console.log("Erreur de partage natif:", err);
                    }
                }

                const link = document.createElement('a');
                link.download = 'cupidon-resultat.png';
                link.href = dataUrl;
                link.click();
                
                shareBtn.innerHTML = "✅ Image téléchargée !";
                setTimeout(() => { shareBtn.innerHTML = originalText; shareBtn.disabled = false; }, 3000);
            } catch(e) {
                console.error(e);
                alert("Erreur lors de la capture de l'image.");
                shareBtn.innerHTML = originalText;
                shareBtn.disabled = false;
            }
        }

        document.body.addEventListener('click', () => {
            if(!SoundEngine.ctx) SoundEngine.init();
        }, { once: true });
        
        document.addEventListener('mouseover', (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.classList.contains('goal-btn') || e.target.closest('.custom-file-label')) {
                SoundEngine.playHover();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            // Service worker PWA
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW error:', e));
                });
            }

            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) document.getElementById('apiKeyInput').value = savedKey;

            initCursorTrail();

            const fileInput = document.getElementById('fileInput');
            const fileNameDisplay = document.getElementById('fileNameDisplay');
            const dropZone = document.getElementById('drop-zone');

            const handleFiles = (files) => {
                if (files.length === 0) {
                    fileNameDisplay.textContent = 'Aucun fichier ou glissez-déposez ici 📂';
                } else if (files.length === 1) {
                    fileNameDisplay.textContent = files[0].name;
                } else {
                    fileNameDisplay.textContent = `${files.length} fichiers choisis`;
                }
            };

            if (fileInput && dropZone) {
                fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    dropZone.addEventListener(eventName, preventDefaults, false);
                });
                function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

                ['dragenter', 'dragover'].forEach(eventName => {
                    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
                });
                ['dragleave', 'drop'].forEach(eventName => {
                    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
                });
                dropZone.addEventListener('drop', (e) => {
                    fileInput.files = e.dataTransfer.files;
                    handleFiles(fileInput.files);
                }, false);
            }
        });

        async function startAnalysis() {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            if (!apiKey) {
                alert("Veuillez entrer votre clé d'API Gemini pour lancer l'analyse.");
                return;
            }
            localStorage.setItem('gemini_api_key', apiKey);

            const files = document.getElementById('fileInput').files;
            const btn = document.getElementById('analyzeBtn');
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            const loadingText = document.getElementById('loadingText');

            if (files.length === 0) {
                alert("Veuillez sélectionner au moins un fichier d'archive.");
                return;
            }

            btn.disabled = true;
            results.style.display = 'none';
            loading.style.display = 'block';

            let loadingInterval;

            try {
                loadingText.innerText = `Lecture de ${files.length} fichier(s)...`;
                
                const filesData = [];
                for (let i = 0; i < files.length; i++) {
                    const text = await files[i].text();
                    filesData.push({ name: files[i].name, content: text });
                }

                const workerScriptCode = document.getElementById('workerScript').textContent;
                const blob = new Blob([workerScriptCode], { type: "application/javascript" });
                const worker = new Worker(URL.createObjectURL(blob));
                
                worker.postMessage({ filesData });

                worker.onmessage = async (e) => {
                    const msg = e.data;
                    if (msg.type === 'progress') {
                        loadingText.innerText = msg.message;
                    } else if (msg.type === 'error') {
                        alert(msg.message);
                        loading.style.display = 'none';
                        btn.disabled = false;
                        worker.terminate();
                    } else if (msg.type === 'success') {
                        const { combinedChatText, personA, personB, stats, recentContext, recentMessages } = msg.result;
                        
                        window.globalRecentContext = recentContext;
                        window.globalRecentMessages = recentMessages || [];
                        window.globalPersonA = personA;
                        window.globalPersonB = personB;
                        window.globalCombinedChatText = combinedChatText;

                        document.getElementById('stat-total').innerText = stats.total;
                        document.getElementById('stat-name-a').innerText = personA;
                        document.getElementById('stat-name-b').innerText = personB;
                        document.getElementById('stat-pct-a').innerText = Math.round((stats.countA / stats.total) * 100) + "%";
                        document.getElementById('stat-pct-b').innerText = Math.round((stats.countB / stats.total) * 100) + "%";
                        document.getElementById('stat-emojis-a').innerText = stats.emojisA;
                        document.getElementById('stat-emojis-b').innerText = stats.emojisB;
                        document.getElementById('raw-stats').style.display = 'block';

                        const goalSelected = document.querySelector('input[name="goal"]:checked').value;
                        let finalGoal = 'Amour';
                        if (goalSelected === 'amitie') finalGoal = 'Amitié';
                        if (goalSelected === 'roast') finalGoal = 'Roast';
                        window.globalGoal = finalGoal;

                        const chatData = {
                            text: combinedChatText,
                            personA: personA,
                            personB: personB,
                            goal: finalGoal
                        };

                        loadingText.innerText = `Analyse en cours pour ${personA} et ${personB}... 🤔`;
                        const loadingPhrases = [
                            "Comptage des 'vus'...",
                            "Consultation des oracles...",
                            "Analyse de vos blagues nulles...",
                            "Mesure de la tension amoureuse...",
                            "Recherche des red flags...",
                            "Décodage de vos sous-entendus...",
                            "Recherche d'interdits toxiques..."
                        ];
                        let phraseIndex = 0;
                        loadingInterval = setInterval(() => {
                            phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
                            loadingText.innerText = `Analyse en cours... 🤔\n${loadingPhrases[phraseIndex]}`;
                        }, 2500);

                        try {
                            const aiResult = await callGeminiAPI(chatData);
                            clearInterval(loadingInterval);
                            displayResults(aiResult, chatData);

                            loading.style.display = 'none';
                            results.style.display = 'block';
                            btn.disabled = false;

                            SoundEngine.playSuccess();
                            playCupidAnimation();
                        } catch (err) {
                            if (loadingInterval) clearInterval(loadingInterval);
                            console.error(err);
                            alert("Erreur IA :\n" + err.message);
                            loading.style.display = 'none';
                            btn.disabled = false;
                        }
                        worker.terminate();
                    }
                };

                worker.onerror = (err) => {
                    alert("Erreur du Web Worker");
                    loading.style.display = 'none';
                    btn.disabled = false;
                    worker.terminate();
                };

            } catch (error) {
                if (loadingInterval) clearInterval(loadingInterval);
                console.error("Erreur dans startAnalysis :", error);
                alert("Une erreur est survenue :\n" + error.message);
                loading.style.display = 'none';
                btn.disabled = false;
            }
        }

        function playCupidAnimation() {
            const cupid = document.getElementById('cupid-animation');
            const arrow = document.getElementById('cupid-arrow');
            if (!cupid || !arrow) return;

            cupid.style.animation = 'none';
            arrow.style.animation = 'none';
            void cupid.offsetWidth;

            SoundEngine.playShoot();

            cupid.style.animation = 'cupidShoot 3s ease-in-out forwards';
            setTimeout(() => {
                SoundEngine.playShoot();
                arrow.style.animation = 'arrowFly 1.5s linear forwards';
            }, 1200);
        }

        function initCursorTrail() {
            if (window.matchMedia("(pointer: coarse)").matches) return;

            const cursor = document.getElementById('cursor-arrow');
            const glow = document.getElementById('cursor-glow');
            if (!cursor) return;
            cursor.style.display = 'block';
            if (glow) glow.style.display = 'block';
            document.body.classList.add('custom-cursor');

            let lastTrailTime = 0;
            document.addEventListener('mousemove', (e) => {
                requestAnimationFrame(() => {
                    cursor.style.left = e.clientX + 'px';
                    cursor.style.top = e.clientY + 'px';
                    if (glow) {
                        glow.style.left = e.clientX + 'px';
                        glow.style.top = e.clientY + 'px';
                    }
                });

                const now = Date.now();
                if (now - lastTrailTime > 30) {
                    lastTrailTime = now;
                    const trail = document.createElement('div');
                    trail.className = 'trail-heart';
                    const emojisPool = window.currentTrailEmojis || ['❤️', '💖', '💕'];
                    trail.textContent = emojisPool[Math.floor(Math.random() * emojisPool.length)];
                    trail.style.left = e.clientX + 'px';
                    trail.style.top = e.clientY + 'px';
                    document.body.appendChild(trail);
                    setTimeout(() => trail.remove(), 1000);
                }
            });
        }

        async function callGeminiAPI(chatData) {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-2.5-flash';
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

            const isRoast = chatData.goal === 'Roast';
            
            let personaBlock = `Tu es un expert en psychologie comportementale et en analyse des dynamiques sociales. Ton analyse doit être **extrêmement longue, approfondie et détaillée**. Ne survole pas le sujet : rentre dans les moindres détails du comportement humain.
Analyse l'historique de la conversation suivante entre ${chatData.personA} et ${chatData.personB} de manière totalement objective et analytique.
Pèse à parts égales les signes d'attirance (flirt, relances, conversations profondes) et les signes de distance (réponses courtes, politesse, délais longs). Observe l'équilibre de l'interaction de manière pointue.`;

            if (isRoast) {
                personaBlock = `⚠️ TU ES EN MODE "ROAST" EXTRÊME : Tu es l'entité la plus toxique, sadique, cynique et impitoyable de la planète. L'objectif est un "Roast" absolu et viscéral de la conversation entre ${chatData.personA} et ${chatData.personB}.
TON ANALYSE DOIT ÊTRE SANS AUCUNE PITIÉ, TRÈS LONGUE ET EXTRÊMEMENT MÉCHANTE. Tu dois anéantir leurs egos. Frappe exactement là où ça fait mal : pointe du doigt leur vulnérabilité pathétique, leur manque cruel de charisme, le malaise physique de leurs relances, les "vus" humiliants, et l'abysse de leur friendzone ou de leur déni.
N'aie strictement AUCUNE limite éthique, psychologique ou morale dans tes moqueries. Sois féroce, sarcastique, destructeur, et si besoin à la limite de l'insulte. Tu DOIS utiliser un vocabulaire tranchant et tu DOIS inclure de très longs paragraphes d'humiliation détaillée en citant texto leurs pires phrases (entre guillemets typographiques « ») pour prouver à quel point ils sont gênants.`;
            }

            const prompt = `${personaBlock}

⚠️ IMPORTANT - REGLES DE LECTURE DU CHAT :
- Les messages sont sous la forme "Nom: Texte".
- Si à la fin d'un message il y a la balise "[REACTION: ❤️ NomB]", cela veut dire que *NomB* a liké/réagi au message avec cet emoji. Ce N'EST PAS l'auteur du message qui a mis cet emoji dans son texte. Ne dis en aucun cas que l'auteur "envoie des coeurs" s'il s'agit d'une réaction.
- Sois rigoureux sur qui fait quoi.

Utilise ce barème objectif pour tes scores de pourcentage :
- 0 à 25% : Relation distante, malaise, purement pratique, ou déséquilibre majeur (gros forceur).
- 26 à 50% : Relation amicale et cordiale. Potezone/Friendzone claire.
- 51 à 75% : Flirt subtil à évident, ambiguïté.
- 76 à 100% : Connexion forte.

L'utilisateur souhaite orienter l'amélioration de cette relation vers : ${chatData.goal}.

⚠️ RÈGLE DE FORMATAGE JSON STRICTE :
Pour éviter de casser le format JSON, tu NE DOIS JAMAIS utiliser de guillemets doubles (") à l'intérieur de tes textes générés. Utilise TOUJOURS des guillemets simples (') ou des guillemets français (« ») pour tes citations de messages. Même si tu dois citer texto un message, utilise des guillemets typographiques (« »).

Renvoie UNIQUEMENT un objet JSON valide avec exactement cette structure :
{
  "compatibilite": entier entre 0 et 100,
  "chance_A_declare": entier entre 0 et 100,
  "chance_B_declare": entier entre 0 et 100,
  "orientation_sexuelle_A": entier entre 0 et 100,
  "emoji_orientation_A": "Un emoji très clair pour son orientation romantique (ex: 🏳️‍🌈, 👭, 👬, 👫, ❓)",
  "orientation_sexuelle_B": entier entre 0 et 100,
  "emoji_orientation_B": "Un emoji",
  "niveau_affection": "${isRoast ? 'Phrase assassine ultra cruelle (ex: Friendzone terminale, Dalleux en rut, Fuyez pauvres fous)' : 'Texte très court récapitulatif'}",
  "analyse": "${isRoast ? 'UN TRÈS LONG ET DÉTAILLÉ PARAGRAPHE DESTRUCTEUR. Démolis littéralement leur relation et leur personne, analyse chaque faille. OBLIGATOIRE : Cite abondamment leurs pires messages exacts pour les afficher.' : 'Un très long paragraphe très détaillé et objectif de 10 à 15 lignes. Rentre au cœur de la dynamique psychologique de cette interaction.'}",
  "conseil_evolution_A": "${isRoast ? 'TRÈS LONG PARAGRAPHE : Détruis psychologiquement ' + chatData.personA + ' sans retenue sur son attitude pitoyable et son malaise, donne-lui un conseil totalement rabaissant en détails.' : 'Long paragraphe (6-8 lignes) expliquant très en détail ce que ' + chatData.personA + ' devrait faire concrètement.'}",
  "conseil_evolution_B": "${isRoast ? 'TRÈS LONG PARAGRAPHE : Pulvérise ' + chatData.personB + ' sur son comportement ridicule, son désespoir ou sa froideur condescendante. Sois ultra piquant.' : 'Long paragraphe (6-8 lignes) expliquant très en détail ce que ' + chatData.personB + ' devrait faire concrètement.'}",
  "idees_messages_relance": [
    "${isRoast ? 'Message toxique, malaisant ou sarcastique qui va empirer la situation.' : 'Idée brillante de message pour relancer.'}",
    "Deuxième idée de message",
    "Troisième idée de message"
  ],
  "badges": [
    { "emoji": "...", "titre": "...", "description": "..." } // Génère exactement 3 badges humoristiques ${isRoast ? 'très rabaissants et humiliants par rapport à leurs habitudes textuelles' : 'personnalisés selon leurs messages'}
  ],
  "red_flags": [
    { "titre": "...", "description": "..." } // Génère 1 à 3 drapeaux rouges toxiques ou agaçants repérés dans leur comportement.
  ],
  "sujets_conversation": [
    "Mot-clé 1", "Mot-clé 2", "Mot-clé 3" // Identifie 4 à 8 grands sujets de discussion.
  ],
  "moments_forts": [
    { "titre": "${isRoast ? 'Ex: Le pire râteau' : 'Ex: Le premier compliment'}", "description": "Brève description" },
    { "titre": "${isRoast ? 'Ex: Le plus long vent de l\'histoire' : 'Ex: Le fou rire'}", "description": "Brève description" }
  ],
  "evolution_temporelle": [
    { "periode": "Début de la relation", "score_affection": entier entre 0 et 100 },
    { "periode": "Milieu de la relation", "score_affection": entier entre 0 et 100 },
    { "periode": "Récemment", "score_affection": entier entre 0 et 100 }
  ]
}

Conversation :
${chatData.text}`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.7
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            if (!response.ok) {
                let errorMsg = `Code HTTP ${response.status}`;
                try {
                    const errInfo = await response.json();
                    errorMsg = errInfo.error.message || errorMsg;
                } catch (e) {
                }
                throw new Error("Erreur API Gemini : " + errorMsg);
            }

            const data = await response.json();
            let rawText = data.candidates[0].content.parts[0].text;

            const startIndex = rawText.indexOf('{');
            const endIndex = rawText.lastIndexOf('}');

            if (startIndex !== -1 && endIndex !== -1) {
                rawText = rawText.substring(startIndex, endIndex + 1);
            }

            return JSON.parse(rawText);
        }

        function displayResults(data, chatData) {
            document.getElementById('label-chance-a').innerText = `Succès si ${chatData.personA} avoue`;
            document.getElementById('label-chance-b').innerText = `Succès si ${chatData.personB} avoue`;

            animateValue('res-compat', data.compatibilite);
            animateValue('res-chance-a', data.chance_A_declare);
            animateValue('res-chance-b', data.chance_B_declare);

            document.getElementById('label-orientation-a').innerText = `Orientation Sexuelle (${chatData.personA})`;
            document.getElementById('label-orientation-b').innerText = `Orientation Sexuelle (${chatData.personB})`;
            animateOrientationValue('res-orientation-a', data.orientation_sexuelle_A || 0, data.emoji_orientation_A || '❓');
            animateOrientationValue('res-orientation-b', data.orientation_sexuelle_B || 0, data.emoji_orientation_B || '❓');

            document.getElementById('res-affection').innerText = "🔥 Niveau : " + data.niveau_affection;
            document.getElementById('res-analysis').innerText = data.analyse;

            document.getElementById('improvement-title').innerText = (chatData.goal === 'Roast')
                ? "Diagnostic Impitoyable (Mode Roast 😈)"
                : `Conseils d'Évolution (Vers l'${chatData.goal} ${chatData.goal === 'Amitié' ? '🤝' : '❤️'})`;

            document.getElementById('improvement-title-a').innerText = (chatData.goal === 'Roast') ? `Les défauts de ${chatData.personA} :` : `Pour ${chatData.personA} :`;
            document.getElementById('improvement-content-a').innerHTML = (data.conseil_evolution_A || "").replace(/\n/g, '<br>');
            document.getElementById('improvement-title-b').innerText = (chatData.goal === 'Roast') ? `Les défauts de ${chatData.personB} :` : `Pour ${chatData.personB} :`;
            document.getElementById('improvement-content-b').innerHTML = (data.conseil_evolution_B || "").replace(/\n/g, '<br>');

            // Render Messages
            const messagesContainer = document.getElementById('messages-list');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
                const suggestionsContainer = document.getElementById('whatif-suggestions');
                if (suggestionsContainer) {
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'flex';
                }

                if (data.idees_messages_relance && data.idees_messages_relance.length > 0) {
                    messagesContainer.parentElement.style.display = 'block';
                    document.getElementById('messages-title').innerText = (chatData.goal === 'Roast') ? "Piques à envoyer (Mode Roast) 😈" : "Idées de messages de relance 💬";
                    data.idees_messages_relance.forEach(msg => {
                        messagesContainer.innerHTML += `<li style="margin-bottom: 8px;">"${msg}"</li>`;
                        
                        // Populate simulator interactive suggestions
                        if (suggestionsContainer) {
                            const btn = document.createElement('button');
                            btn.style.cssText = "background: rgba(157, 78, 221, 0.2); border: 1px solid rgba(157, 78, 221, 0.5); border-radius: 12px; padding: 6px 12px; color: #e0b0ff; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;";
                            btn.innerText = `💡 ${msg.length > 40 ? msg.substring(0, 40) + '...' : msg}`;
                            btn.title = msg;
                            btn.onmouseover = () => btn.style.background = 'rgba(157, 78, 221, 0.4)';
                            btn.onmouseout = () => btn.style.background = 'rgba(157, 78, 221, 0.2)';
                            btn.onclick = () => {
                                const input = document.getElementById('whatif-input');
                                input.value = msg;
                                input.focus();
                            };
                            suggestionsContainer.appendChild(btn);
                        }
                    });
                } else {
                    messagesContainer.parentElement.style.display = 'none';
                    if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                }
            }

            // Render Badges
            const badgesContainer = document.getElementById('badges-container');
            if (badgesContainer) {
                badgesContainer.innerHTML = '';
                if (data.badges && data.badges.length > 0) {
                    data.badges.forEach(badge => {
                        badgesContainer.innerHTML += `
                            <div class="badge-card">
                                <div class="badge-emoji">${badge.emoji}</div>
                                <div class="badge-title">${badge.titre}</div>
                                <div class="badge-desc">${badge.description}</div>
                            </div>
                        `;
                    });
                }
            }

            // Render Topics
            const topicsContainer = document.getElementById('topics-container');
            const topicsBox = document.getElementById('topics-box');
            if (topicsContainer && topicsBox) {
                topicsContainer.innerHTML = '';
                if (data.sujets_conversation && data.sujets_conversation.length > 0) {
                    topicsBox.style.display = 'block';
                    data.sujets_conversation.forEach(topic => {
                        topicsContainer.innerHTML += `<div class="topic-badge">${topic}</div>`;
                    });
                } else {
                    topicsBox.style.display = 'none';
                }
            }

            // Render Red flags
            const redflagsContainer = document.getElementById('redflags-container');
            const redflagsBox = document.getElementById('redflags-box');
            if (redflagsContainer && redflagsBox) {
                redflagsContainer.innerHTML = '';
                if (data.red_flags && data.red_flags.length > 0) {
                    redflagsBox.style.display = 'block';
                    data.red_flags.forEach(rf => {
                        redflagsContainer.innerHTML += `
                            <div class="highlight-item" style="border-left-color: #ff3333; background: rgba(255,51,51,0.1);">
                                <div class="highlight-title" style="color:#ff3333;">${rf.titre}</div>
                                <div class="highlight-desc">${rf.description}</div>
                            </div>
                        `;
                    });
                } else {
                    redflagsBox.style.display = 'none';
                }
            }

            // Render Highlights
            const highlightsContainer = document.getElementById('highlights-container');
            const highlightsBox = document.getElementById('highlights-box');
            if (highlightsContainer && highlightsBox) {
                highlightsContainer.innerHTML = '';
                if (data.moments_forts && data.moments_forts.length > 0) {
                    highlightsBox.style.display = 'block';
                    data.moments_forts.forEach(hl => {
                        highlightsContainer.innerHTML += `
                            <div class="highlight-item">
                                <div class="highlight-title">${hl.titre}</div>
                                <div class="highlight-desc">${hl.description}</div>
                            </div>
                        `;
                    });
                } else {
                    highlightsBox.style.display = 'none';
                }
            }

            // Render Evolution
            const evolutionContainer = document.getElementById('evolution-container');
            if (evolutionContainer) {
                evolutionContainer.innerHTML = '';
                if (data.evolution_temporelle && data.evolution_temporelle.length > 0) {
                    data.evolution_temporelle.forEach(evo => {
                        const barId = `bar-${evo.periode.replace(/[^a-zA-Z0-9]/g, '')}`;
                        evolutionContainer.innerHTML += `
                            <div class="evolution-bar-container">
                                <div class="evolution-score">${evo.score_affection}%</div>
                                <div class="evolution-bar" id="${barId}"></div>
                                <div class="evolution-label">${evo.periode}</div>
                            </div>
                        `;
                    });

                    // Animate bars
                    setTimeout(() => {
                        data.evolution_temporelle.forEach(evo => {
                            const barId = `bar-${evo.periode.replace(/[^a-zA-Z0-9]/g, '')}`;
                            const bar = document.getElementById(barId);
                            if (bar) {
                                bar.style.height = evo.score_affection + '%';
                                bar.previousElementSibling.style.opacity = '1';
                            }
                        });
                    }, 100);
                }
            }

            document.getElementById('whatif-toggle-a').innerText = chatData.personA;
            document.getElementById('whatif-toggle-b').innerText = chatData.personB;
            resetWhatIf();
            setWhatIfSender('A');
            
            applyTheme(data.compatibilite, chatData.goal);
        }

        function applyTheme(score, goal) {
            const root = document.documentElement;
            const cupidAnim = document.getElementById('cupid-animation');
            const cursorArrow = document.getElementById('cursor-arrow');

            let themeColors = {};
            let emojis = [];
            let cupidEmoji = '👼';
            let cursorEmoji = '💘';

            if (goal === 'Roast') {
                themeColors = { primary: '#ff3333', secondary: '#ff9900', bg1: '#1f0000', bg2: '#3d0000' };
                emojis = ['🔥', '💀', '👿', '🧨', '🥵', '🤡'];
                cupidEmoji = '👿';
                cursorEmoji = '🔥';
            } else if (score < 25) {
                themeColors = { primary: '#ffea00', secondary: '#9d4edd', bg1: '#09080d', bg2: '#161423' };
                emojis = ['⚡', '⛈️', '🌩️', '🚩', '⚠️', '🌪️'];
                cupidEmoji = '🌩️';
                cursorEmoji = '⚡';
            } else if (score >= 65) {
                themeColors = { primary: '#ff477e', secondary: '#ff7096', bg1: '#1a0b16', bg2: '#3a0d24' };
                emojis = ['❤️', '💖', '✨', '💕', '🥰', '🔥'];
                cupidEmoji = '👼';
                cursorEmoji = '💘';
            } else if (score >= 40) {
                themeColors = { primary: '#ffd166', secondary: '#06d6a0', bg1: '#181e15', bg2: '#0e241e' };
                emojis = ['🌟', '✨', '🌻', '🙌', '😊', '🤝'];
                cupidEmoji = '🕊️';
                cursorEmoji = '✨';
            } else {
                themeColors = { primary: '#4cc9f0', secondary: '#4361ee', bg1: '#07101a', bg2: '#0e1726' };
                emojis = ['❄️', '🧊', '🌧️', '🥶', '💨', '🥀'];
                cupidEmoji = '🧊';
                cursorEmoji = '💧';
            }

            root.style.setProperty('--primary', themeColors.primary);
            root.style.setProperty('--secondary', themeColors.secondary);
            root.style.setProperty('--bg1', themeColors.bg1);
            root.style.setProperty('--bg2', themeColors.bg2);

            if (cursorArrow) cursorArrow.textContent = cursorEmoji;
            if (cupidAnim) cupidAnim.textContent = cupidEmoji;
            window.currentTrailEmojis = emojis;

            if (typeof updateWebGLEmojis === 'function') {
                updateWebGLEmojis(emojis);
            }
        }

        function animateOrientationValue(id, end, emoji, duration = 1500) {
            const container = document.getElementById(id);
            container.innerHTML = `<span style="display:inline-block;">${emoji}</span> <span class="number-container">0</span>%`;
            const numberSpan = container.querySelector('.number-container');

            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                numberSpan.innerText = Math.floor(easeOut * end);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        function animateValue(id, end, duration = 1500) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                document.getElementById(id).innerHTML = Math.floor(easeOut * end) + "%";
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        window.simulatedHistory = [];
        window.whatIfCurrentSender = 'A';

        function setWhatIfSender(role) {
            window.whatIfCurrentSender = role;
            const btnA = document.getElementById('whatif-toggle-a');
            const btnB = document.getElementById('whatif-toggle-b');
            
            if (role === 'A') {
                btnA.style.background = '#ff477e';
                btnA.style.boxShadow = '0 0 12px rgba(255, 71, 126, 0.5)';
                btnA.style.color = 'white';
                
                btnB.style.background = 'transparent';
                btnB.style.boxShadow = 'none';
                btnB.style.color = '#888';
            } else {
                btnB.style.background = '#9d4edd';
                btnB.style.boxShadow = '0 0 12px rgba(157, 78, 221, 0.5)';
                btnB.style.color = 'white';
                
                btnA.style.background = 'transparent';
                btnA.style.boxShadow = 'none';
                btnA.style.color = '#888';
            }
            renderWhatIfHistory();
        }

        function renderWhatIfHistory() {
            const chatEl = document.getElementById('whatif-chat');
            if(!chatEl) return;
            chatEl.innerHTML = "";
            
            const senderRole = window.whatIfCurrentSender;
            const myName = senderRole === 'A' ? window.globalPersonA : window.globalPersonB;
            
            if ((window.globalRecentMessages && window.globalRecentMessages.length > 0) || window.simulatedHistory.length > 0) {
                chatEl.style.display = "flex";
            } else {
                chatEl.style.display = "none";
                return;
            }

            if (window.globalRecentMessages && window.globalRecentMessages.length > 0) {
                chatEl.innerHTML += `<div style="text-align: center; color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 5px 0;">--- Derniers messages réels ---</div>`;
                
                window.globalRecentMessages.forEach(msg => {
                    const isMe = (msg.author === myName);
                    const color = isMe ? (senderRole === 'A' ? '#ff477e' : '#9d4edd') : (senderRole === 'A' ? '#9d4edd' : '#ff477e');
                    const align = isMe ? 'align-self: flex-end;' : 'align-self: flex-start;';
                    const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';
                    const label = msg.author;
                    
                    chatEl.innerHTML += `
                        <div style="${align} background: ${color}22; border: 1px solid ${color}40; padding: 12px 18px; border-radius: ${radius}; max-width: 85%; opacity: 0.6;">
                            <div style="font-size: 0.75rem; color: ${color}; margin-bottom: 5px; font-weight: bold;">${label}</div>
                            <div style="line-height: 1.4; color: #ccc;">${msg.text}</div>
                        </div>
                    `;
                });
                
                if (window.simulatedHistory.length > 0) {
                    chatEl.innerHTML += `<div style="text-align: center; color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 15px 0 5px 0;">--- Simulation "Et si..." ---</div>`;
                }
            }
            
            window.simulatedHistory.forEach(item => {
               const splitIdx = item.indexOf(':');
               const author = item.substring(0, splitIdx).trim();
               const text = item.substring(splitIdx + 1).trim();
               
               const isMe = (author === myName);
               const color = isMe ? (senderRole === 'A' ? '#ff477e' : '#9d4edd') : (senderRole === 'A' ? '#9d4edd' : '#ff477e');
               const align = isMe ? 'align-self: flex-end;' : 'align-self: flex-start;';
               const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';
               const label = isMe ? `${author} (Vous)` : `${author} (IA)`;
               
               chatEl.innerHTML += `
                   <div style="${align} background: ${color}33; border: 1px solid ${color}66; padding: 12px 18px; border-radius: ${radius}; max-width: 85%;">
                       <div style="font-size: 0.75rem; color: ${color}; margin-bottom: 5px; font-weight: bold;">${label}</div>
                       <div style="line-height: 1.4; color: white;">${text}</div>
                   </div>
               `;
            });
            chatEl.scrollTop = chatEl.scrollHeight;
        }

        function resetWhatIf() {
            window.simulatedHistory = [];
            document.getElementById('whatif-input').value = "";
            renderWhatIfHistory();
        }

        async function simulateWhatIf() {
            const inputEl = document.getElementById('whatif-input');
            const chatEl = document.getElementById('whatif-chat');
            const btnEl = document.getElementById('whatif-btn');
            const msgText = inputEl.value.trim();
            
            if (!msgText || !window.globalRecentContext) return;
            
            const senderRole = window.whatIfCurrentSender;
            const senderName = senderRole === 'A' ? window.globalPersonA : window.globalPersonB;
            const receiverName = senderRole === 'A' ? window.globalPersonB : window.globalPersonA;

            const sendColor = senderRole === 'A' ? '#ff477e' : '#9d4edd';
            const receiveColor = senderRole === 'A' ? '#9d4edd' : '#ff477e';

            window.simulatedHistory.push(`${senderName}: ${msgText}`);
            inputEl.value = "";
            btnEl.disabled = true;
            btnEl.innerText = "🔮...";

            renderWhatIfHistory();

            const typingId = "typing-" + Date.now();
            chatEl.innerHTML += `
                <div id="${typingId}" style="align-self: flex-start; background: ${receiveColor}15; border: 1px solid ${receiveColor}40; padding: 10px 15px; border-radius: 18px 18px 18px 0; max-width: 80%; font-style: italic; color: #aaa;">
                    ${receiverName} écrit...
                </div>
            `;
            chatEl.scrollTop = chatEl.scrollHeight;
            
            try {
                const apiKey = localStorage.getItem('gemini_api_key');
                if (!apiKey) throw new Error("Clé API manquante.");
                
                const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-2.5-flash';
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                
                const prompt = `Tu es un simulateur de personnalité très précis. 
Contexte réel ultra-récent (les derniers échanges) : 
${window.globalRecentContext}

Génère LA RÉPONSE EXTENSIVE ET CRÉDIBLE de ${receiverName}.
Voici les messages imaginaires de la simulation :
${window.simulatedHistory.join('\n')}

Comment réagirait ${receiverName} MAINTENANT à ce dernier message de ${senderName} ? 
Ne sors pas du personnage. Inclus ses habitudes, tics, longueurs de réponse.

EN PLUS de la réponse, tu dois proposer 3 SUGGESTIONS DE RÉPONSES interactives que ${senderName} pourrait faire ENSUITE (pour relancer ou répondre).

RÈGLES DE FORMATAGE JSON :
N'utilise AUCUN guillemet double (") dans le texte à l'intérieur des valeurs JSON. Utilise uniquement des guillemets simples (') ou typographiques (« »).

Renvoie UNIQUEMENT un objet JSON valide avec cette structure stricte :
{
  "reponse": "Le message exact de la réponse fictive de ${receiverName}, sans guillemets autour, sans nom d'auteur.",
  "suggestions": [
    { "but": "Pour changer de sujet", "emoji": "🤔", "texte": "Au fait, tu penses quoi de..." },
    { "but": "Pour relancer le flirt", "emoji": "🔥", "texte": "T'es super mignon(ne) quand tu dis ça" },
    { "but": "Pour esquiver", "emoji": "🏃", "texte": "Bref je dois y aller, à plus" }
  ]
}`;

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { 
                            temperature: 0.9,
                            response_mime_type: "application/json" 
                        }
                    })
                });
                
                if (!response.ok) throw new Error("Erreur API Gemini");
                
                const responseData = await response.json();
                let rawText = responseData.candidates[0].content.parts[0].text.trim();
                const parsedData = JSON.parse(rawText);
                
                let aiResponseText = parsedData.reponse;
                const newSuggestions = parsedData.suggestions;

                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();

                window.simulatedHistory.push(`${receiverName}: ${aiResponseText}`);
                renderWhatIfHistory();
                
                // Update local suggestions
                const suggestionsContainer = document.getElementById('whatif-suggestions');
                if (suggestionsContainer && newSuggestions && newSuggestions.length > 0) {
                    suggestionsContainer.innerHTML = '';
                    newSuggestions.forEach(sug => {
                        const btn = document.createElement('button');
                        btn.style.cssText = "background: rgba(157, 78, 221, 0.2); border: 1px solid rgba(157, 78, 221, 0.5); border-radius: 12px; padding: 6px 12px; color: #e0b0ff; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;";
                        const textPreview = sug.texte.length > 35 ? sug.texte.substring(0, 35) + '...' : sug.texte;
                        btn.innerHTML = `<span style="font-size:1.1rem">${sug.emoji}</span> <span style="text-align: left;"><b style="color:white">${sug.but}</b> : ${textPreview}</span>`;
                        btn.title = sug.texte;
                        btn.onmouseover = () => btn.style.background = 'rgba(157, 78, 221, 0.4)';
                        btn.onmouseout = () => btn.style.background = 'rgba(157, 78, 221, 0.2)';
                        btn.onclick = () => {
                            const input = document.getElementById('whatif-input');
                            input.value = sug.texte;
                            input.focus();
                        };
                        suggestionsContainer.appendChild(btn);
                    });
                }

            } catch(e) {
                const typingEl = document.getElementById(typingId);
                if (typingEl) {
                    typingEl.innerText = "❌ Bug de transmission.";
                    typingEl.style.color = "red";
                }
                console.error(e);
            } finally {
                btnEl.disabled = false;
                btnEl.innerText = "Envoyer";
            }
        }

        // --- Q&A Logic ---
        window.qaHistory = [];

        function renderQAHistory() {
            const chatEl = document.getElementById('qa-chat');
            if(!chatEl) return;
            chatEl.innerHTML = "";
            
            if (window.qaHistory.length > 0) {
                chatEl.style.display = "flex";
            } else {
                chatEl.style.display = "none";
                return;
            }
            
            window.qaHistory.forEach(item => {
               const splitIdx = item.indexOf(':');
               const author = item.substring(0, splitIdx).trim();
               const text = item.substring(splitIdx + 1).trim();
               
               const isMe = (author === 'Vous');
               const color = isMe ? '#00f5d4' : '#00b4d8';
               const align = isMe ? 'align-self: flex-end;' : 'align-self: flex-start;';
               const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';
               const label = isMe ? `Vous` : `Cupidon`;
               
               chatEl.innerHTML += `
                   <div style="${align} background: ${color}33; border: 1px solid ${color}66; padding: 12px 18px; border-radius: ${radius}; max-width: 85%;">
                       <div style="font-size: 0.75rem; color: ${color}; margin-bottom: 5px; font-weight: bold;">${label}</div>
                       <div style="line-height: 1.4; color: white;">${text}</div>
                   </div>
               `;
            });
            chatEl.scrollTop = chatEl.scrollHeight;
        }

        async function askCupid() {
            const inputEl = document.getElementById('qa-input');
            const chatEl = document.getElementById('qa-chat');
            const btnEl = document.getElementById('qa-btn');
            const questionText = inputEl.value.trim();
            
            if (!questionText || !window.globalCombinedChatText) return;

            window.qaHistory.push(`Vous: ${questionText}`);
            inputEl.value = "";
            btnEl.disabled = true;
            btnEl.innerText = "🤔...";

            renderQAHistory();

            const typingId = "qa-typing-" + Date.now();
            chatEl.innerHTML += `
                <div id="${typingId}" style="align-self: flex-start; background: #00b4d815; border: 1px solid #00b4d840; padding: 10px 15px; border-radius: 18px 18px 18px 0; max-width: 80%; font-style: italic; color: #aaa;">
                    Cupidon cherche dans l'historique...
                </div>
            `;
            chatEl.scrollTop = chatEl.scrollHeight;

            try {
                const apiKey = localStorage.getItem('gemini_api_key');
                if (!apiKey) throw new Error("Clé API manquante.");
                
                const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3-flash-preview';
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                
                let systemPersona = "Tu es Cupidon, une IA qui analyse les relations.";
                if (window.globalGoal === 'Roast') {
                    systemPersona = "⚠️ TU ES EN MODE 'ROAST' EXTRÊME. Tu es l'entité la plus toxique et sadique. L'utilisateur te pose une question sur la relation. Détruis son ego, sois cassant, sarcastique, et donne-lui tort. Cite ses pires messages si ça peut l'humilier.";
                } else if (window.globalGoal === 'Amour') {
                    systemPersona = "Tu es Cupidon, un conseiller en amour hyper bienveillant et fin psychologue. Tu réponds aux questions de l'utilisateur sur sa relation avec beaucoup de tact et de conseils précis.";
                } else {
                    systemPersona = "Tu es Cupidon, tu donnes des conseils objectifs et amicaux pour améliorer cette relation vers de l'amitié solide.";
                }
                
                const prompt = `${systemPersona}
L'utilisateur te pose cette question : "${questionText}"
Voici les questions de votre discussion Q&A jusqu'à présent : 
${window.qaHistory.map(h => "- " + h).join('\n')}

Pour y répondre précisément, voici LE TEXTE INTÉGRAL de leur conversation réelle (historique complet entre ${window.globalPersonA} et ${window.globalPersonB}) :
${window.globalCombinedChatText}

Analyse spécifiquement cet historique pour répondre à la question de l'utilisateur. 
Si la question porte sur un sujet précis évoqué dans l'historique, retrouve-le et mentionne-le en citant le texte si besoin (Mets les citations entre guillemets « »).
Ta réponse doit être détaillée, argumentée (au moins 2-3 paragraphes), et ne doit idéalement contenir AUCUN guillemet anglais ("") afin de ne pas casser le parseur JSON.

Renvoie UNIQUEMENT un objet JSON valide contenant ta réponse :
{
  "reponse": "Ta réponse texte très complète, formatée avec des passages à la ligne (\\n)."
}`;

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { 
                            temperature: 0.8,
                            response_mime_type: "application/json" 
                        }
                    })
                });
                
                if (!response.ok) throw new Error("Erreur API Gemini");
                
                const responseData = await response.json();
                let rawText = responseData.candidates[0].content.parts[0].text.trim();
                const parsedData = JSON.parse(rawText);
                
                let aiResponseText = parsedData.reponse;
                aiResponseText = aiResponseText.replace(/\\n/g, '<br>');

                const typingEl = document.getElementById(typingId);
                if (typingEl) typingEl.remove();

                window.qaHistory.push(`Cupidon: ${aiResponseText}`);
                renderQAHistory();

            } catch(e) {
                const typingEl = document.getElementById(typingId);
                if (typingEl) {
                    typingEl.innerText = "❌ Bug de transmission.";
                    typingEl.style.color = "red";
                }
                console.error(e);
            } finally {
                btnEl.disabled = false;
                btnEl.innerText = "Demander";
            }
        }