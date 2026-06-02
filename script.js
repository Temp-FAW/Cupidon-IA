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

        // Global reference for active 3D tilted card
        let activeTiltedCard = null;

        // Premium Return Transition to smoothly reset 3D card tilt
        function resetCardTilt(card) {
            if (!card) return;
            // Apply a smooth 0.6s cubic-bezier return transition inline to guarantee it executes
            card.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
            card.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.4)";
            
            const currentCard = card;
            setTimeout(() => {
                // Only clear if the card isn't currently being hovered again (i.e. not equal to activeTiltedCard)
                if (activeTiltedCard !== currentCard) {
                    currentCard.style.transition = "";
                    currentCard.style.transform = "";
                    currentCard.style.boxShadow = "";
                }
            }, 600);
        }

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
                clone.id = 'cloned-results'; // IMPORTANT: Prevent matching body.results-active #results stylesheet rule
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

                // Reset presentation layout inside the clone for clean static rendering
                const clonedSlides = wrapper.querySelectorAll('.result-slide');
                clonedSlides.forEach((slide, idx) => {
                    const originalSlide = resultsEl.children[idx];
                    if (originalSlide && originalSlide.style.display === 'none') {
                        slide.style.setProperty('display', 'none', 'important');
                        return;
                    }
                    slide.style.setProperty('opacity', '1', 'important');
                    slide.style.setProperty('transform', 'none', 'important');
                    slide.style.setProperty('min-height', 'auto', 'important');
                    slide.style.setProperty('height', 'auto', 'important');
                    slide.style.setProperty('width', '100%', 'important');
                    slide.style.setProperty('padding', '15px 0', 'important');
                    slide.style.setProperty('scroll-snap-align', 'none', 'important');
                    
                    // Hide the actions slide and interactive chat boxes (whatif & qa) in the infographic
                    if (idx === clonedSlides.length - 1 || slide.id === 'whatif-box' || slide.id === 'qa-box') {
                        slide.style.setProperty('display', 'none', 'important');
                    } else {
                        slide.style.setProperty('display', 'block', 'important');
                    }
                });

                // Reset all staggered elements to make them fully visible in the clone
                const clonedStaggers = wrapper.querySelectorAll('.stagger-item');
                clonedStaggers.forEach(item => {
                    item.style.setProperty('opacity', '1', 'important');
                    item.style.setProperty('transform', 'none', 'important');
                    item.style.setProperty('transition', 'none', 'important');
                    item.style.setProperty('transition-delay', '0s', 'important');
                });

                // Optimize the cards within the slides for static contrast/rendering
                // We use setProperty with 'important' because the stylesheet uses !important on these cards
                wrapper.querySelectorAll('.result-slide > div, .result-slide > .improvement-box, .result-slide > .scores-grid, .result-slide > .analysis-box').forEach(card => {
                    card.style.setProperty('background', 'rgba(0, 0, 0, 0.4)', 'important');
                    
                    // Preserve custom left border colors from categories (Topics, Highlights, Red Flags, Conseils, Messages)
                    if (card.classList.contains('improvement-box') || card.classList.contains('analysis-box')) {
                        const compBorderLeft = getComputedStyle(card).borderLeftColor || primary;
                        card.style.setProperty('border-left', `5px solid ${compBorderLeft}`, 'important');
                        card.style.setProperty('border-top', '1px solid rgba(255, 255, 255, 0.15)', 'important');
                        card.style.setProperty('border-right', '1px solid rgba(255, 255, 255, 0.15)', 'important');
                        card.style.setProperty('border-bottom', '1px solid rgba(255, 255, 255, 0.15)', 'important');
                    } else if (!card.classList.contains('scores-grid')) {
                        card.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.15)', 'important');
                    }
                    
                    card.style.setProperty('border-radius', '20px', 'important');
                    card.style.setProperty('padding', '25px', 'important');
                    card.style.setProperty('margin', '15px auto', 'important');
                    card.style.setProperty('max-width', '100%', 'important');
                    card.style.setProperty('backdrop-filter', 'none', 'important');
                    card.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
                    card.style.setProperty('box-shadow', '0 10px 25px rgba(0, 0, 0, 0.3)', 'important');
                });

                // Hide interactive widgets inside the static share card
                const interactiveSelectors = [
                    '#whatif-input', '#whatif-btn', '#whatif-suggestions', 'button[onclick*="resetWhatIf"]',
                    '#qa-input', '#qa-btn', '.floating-back-btn', '.nav-dots-container'
                ];
                interactiveSelectors.forEach(sel => {
                    const els = wrapper.querySelectorAll(sel);
                    els.forEach(el => el.style.setProperty('display', 'none', 'important'));
                });

                // IMPORTANT FIX: Remove all backdrop-filters and force text colors inside clone
                wrapper.querySelectorAll('*').forEach(el => {
                    el.style.setProperty('backdrop-filter', 'none', 'important');
                    el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
                    
                    const comp = getComputedStyle(el);
                    if (comp.color === 'rgba(0, 0, 0, 0)' || comp.color === 'transparent') {
                        el.style.setProperty('color', '#ffffff', 'important');
                    }
                });
                
                // Specific fixes for text colors that were lost
                wrapper.querySelectorAll('.text-analysis').forEach(el => el.style.setProperty('color', '#eeeeee', 'important'));
                wrapper.querySelectorAll('.score-label').forEach(el => el.style.setProperty('color', '#dddddd', 'important'));
                
                // Show full badge descriptions without clamp or overflow in the static story
                wrapper.querySelectorAll('.badge-desc').forEach(el => {
                    el.style.setProperty('color', '#dddddd', 'important');
                    el.style.setProperty('display', 'block', 'important');
                    el.style.setProperty('overflow', 'visible', 'important');
                    el.style.setProperty('-webkit-line-clamp', 'none', 'important');
                });
                
                wrapper.querySelectorAll('.highlight-desc').forEach(el => el.style.setProperty('color', '#dddddd', 'important'));
                
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

        window.analysisMode = 'standard';

        window.versusFiles = [];

        function renderVersusFileList() {
            const listContainer = document.getElementById('versus-file-list');
            const display = document.getElementById('versusFileNameDisplay');
            if (!listContainer) return;

            listContainer.innerHTML = '';
            if (window.versusFiles.length === 0) {
                listContainer.innerHTML = `<div style="color: #888; font-size: 0.8rem; text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">Aucun fichier ajouté. Glissez-les ou sélectionnez-les ! 📂</div>`;
                if (display) display.textContent = 'Aucun fichier ou glissez-déposez ici 📂';
                return;
            }

            if (display) {
                display.textContent = `${window.versusFiles.length} fichier(s) prêt(s) 👥`;
            }

            window.versusFiles.forEach(file => {
                const sizeKb = Math.round(file.fileObj.size / 1024);
                const fileEl = document.createElement('div');
                fileEl.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(157, 78, 221, 0.08); border: 1px solid rgba(157, 78, 221, 0.25); border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; margin-bottom: 5px;";
                fileEl.innerHTML = `
                    <div style="display: flex; flex-direction: column; text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 80%;">
                        <span style="color: #e0b0ff; font-weight: bold; overflow: hidden; text-overflow: ellipsis;">${file.name}</span>
                        <span style="color: #888; font-size: 0.7rem;">${sizeKb} KB</span>
                    </div>
                    <button onclick="removeVersusFile('${file.id}')" style="background: none; border: none; color: #ff7096; cursor: pointer; font-size: 1.1rem; padding: 0 5px;" title="Retirer ce fichier">🗑️</button>
                `;
                listContainer.appendChild(fileEl);
            });
        }

        function removeVersusFile(id) {
            try { SoundEngine.playClick(); } catch(e) {}
            window.versusFiles = window.versusFiles.filter(f => f.id !== id);
            renderVersusFileList();
        }

        async function addVersusFiles(files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Générer un ID unique basé sur timestamp + random pour éviter les conflits de même nom de fichier !
                const uniqueId = 'versus_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const content = await file.text();
                
                // Éviter d'importer exactement le même objet de fichier s'il a déjà été importé
                const isAlreadyImported = window.versusFiles.some(f => f.name === file.name && f.fileObj.size === file.size && f.fileObj.lastModified === file.lastModified);
                if (!isAlreadyImported) {
                    window.versusFiles.push({
                        id: uniqueId,
                        name: file.name,
                        content: content,
                        fileObj: file
                    });
                }
            }
            renderVersusFileList();
        }

        function switchAnalysisMode(mode) {
            try {
                SoundEngine.playClick();
            } catch(e) {}
            window.analysisMode = mode;
            const standardBtn = document.getElementById('modeStandardBtn');
            const duelBtn = document.getElementById('modeDuelBtn');
            const standardZone = document.getElementById('drop-zone');
            const versusZone = document.getElementById('versus-zone');
            const analyzeBtn = document.getElementById('analyzeBtn');
            const sliderHighlight = document.getElementById('modeSliderHighlight');

            if (mode === 'duel') {
                standardBtn.classList.remove('active');
                standardBtn.style.color = '#888';

                duelBtn.classList.add('active');
                duelBtn.style.color = '#9d4edd';

                if (sliderHighlight) {
                    sliderHighlight.style.transform = 'translateX(calc(100% + 10px))';
                    sliderHighlight.style.background = 'rgba(157, 78, 221, 0.2)';
                }

                if (standardZone) {
                    standardZone.classList.remove('show-mode');
                    standardZone.classList.add('hide-mode');
                }
                if (versusZone) {
                    versusZone.classList.remove('hide-mode');
                    versusZone.classList.add('show-mode');
                }
                analyzeBtn.innerText = "Lancer le Versus de Choc ! ⚔️";
            } else {
                standardBtn.classList.add('active');
                standardBtn.style.color = '#ff477e';

                duelBtn.classList.remove('active');
                duelBtn.style.color = '#888';

                if (sliderHighlight) {
                    sliderHighlight.style.transform = 'translateX(0)';
                    sliderHighlight.style.background = 'rgba(255, 71, 126, 0.2)';
                }

                if (standardZone) {
                    standardZone.classList.remove('hide-mode');
                    standardZone.classList.add('show-mode');
                }
                if (versusZone) {
                    versusZone.classList.remove('show-mode');
                    versusZone.classList.add('hide-mode');
                }
                analyzeBtn.innerText = "Lancer l'Analyse IA 🪄";
            }
        }


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
            renderHistoryList();

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

            function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

            if (fileInput && dropZone) {
                fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    dropZone.addEventListener(eventName, preventDefaults, false);
                });

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

            // Versus Drag and drop
            const versusFileInput = document.getElementById('versusFileInput');
            const versusDropZone = document.getElementById('versus-zone');

            if (versusDropZone && versusFileInput) {
                versusFileInput.addEventListener('change', (e) => {
                    addVersusFiles(e.target.files);
                });

                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    versusDropZone.addEventListener(eventName, preventDefaults, false);
                });
                ['dragenter', 'dragover'].forEach(eventName => {
                    versusDropZone.addEventListener(eventName, () => versusDropZone.classList.add('dragover'), false);
                });
                ['dragleave', 'drop'].forEach(eventName => {
                    versusDropZone.addEventListener(eventName, () => versusDropZone.classList.remove('dragover'), false);
                });
                versusDropZone.addEventListener('drop', (e) => {
                    addVersusFiles(e.dataTransfer.files);
                }, false);
            }
        });

        // --- Fonctions de parsing de secours (Thread Principal) ---
        function extractInstagramHTML(htmlString) {
            let chatText = "";
            let messages = [];
            let names = new Set();
            
            // Séparation robuste supportant FB DOM updates
            const blocks = htmlString.split(/class="[^"]*pam _3-95[^"]*_a6-g[^"]*"/);
            if (blocks.length > 1) {
                blocks.shift(); // Supprime le préambule
            }

            blocks.forEach(block => {
                let author = "Inconnu";
                let authorMatch = block.match(/<h2[^>]*>(.*?)<\/h2>/);
                if(!authorMatch) {
                     authorMatch = block.match(/class="[^"]*_3-94 _2lem[^"]*"[^>]*>(.*?)<\/div>/);
                }
                if (authorMatch) {
                    author = stripHtml(authorMatch[1]).trim();
                }

                let contentIdx = block.indexOf('_a6-p');
                if (contentIdx !== -1 && author !== "Inconnu") {
                    let contentStart = block.indexOf('>', contentIdx) + 1;
                    let rawContent = block.substring(contentStart);
                    
                    // Réactions (ul._a6-q)
                    let reactionsText = "";
                    const rxReactions = /<ul[^>]*class="[^"]*_a6-q[^"]*"[^>]*>([\s\S]*?)<\/ul>/g;
                    let rxMatch;
                    while ((rxMatch = rxReactions.exec(rawContent)) !== null) {
                        rawContent = rawContent.replace(rxMatch[0], '');
                        reactionsText += ` [REACTION: ${stripHtml(rxMatch[1]).replace(/\s+/g, ' ').trim()}]`;
                    }

                    let textContent = stripHtml(rawContent).trim();

                    if (textContent.match(/^Reacted\s(.*?)\sto your message|^a réagi\s(.*?)\sà votre message/i)) {
                        const emoji = textContent.replace(/Reacted\s|\sto your message|a réagi\s|\sà votre message/gi, '').trim();
                        textContent = `[A réagi avec ${emoji}]`;
                    } else if (textContent.match(/^Liked a message|^A aimé un message/gi)) {
                        textContent = `[A liké le message]`;
                    }

                    let finalContent = (textContent + reactionsText).trim();

                    if (finalContent !== "") {
                        messages.push({ author: author, text: finalContent });
                        names.add(author);
                    }
                }
            });

            // Instagram exporte du plus récent au plus ancien -> Inverser
            messages.reverse();
            chatText = messages.map(m => `${m.author}: ${m.text}`).join('\n') + '\n';

            return { text: chatText, names: names, messages: messages };
        }

        function extractWhatsAppTXT(txtString) {
            let chatText = "";
            let messages = [];
            let names = new Set();

            const lines = txtString.split('\n');
            const waRegex1 = /^\[\d{2}\/\d{2}\/\d{2,4}[, ]+\d{2}:\d{2}(:\d{2})?\] ([^:]+): (.*)$/;
            const waRegex2 = /^\d{2}\/\d{2}\/\d{2,4}[, ]+\d{2}:\d{2}(:\d{2})? - ([^:]+): (.*)$/;

            let currentAuthor = null;
            let currentMessage = "";

            const saveMessage = () => {
                if (currentAuthor && currentMessage) {
                    chatText += `${currentAuthor}: ${currentMessage}\n`;
                    messages.push({ author: currentAuthor, text: currentMessage.trim() });
                    names.add(currentAuthor);
                }
            };

            lines.forEach(line => {
                let match = line.match(waRegex1) || line.match(waRegex2);
                if (match) {
                    saveMessage();
                    currentAuthor = match[2].trim();
                    currentMessage = match[3];
                    
                    if (currentMessage.includes("image omise") || currentMessage.includes("Omitted") || currentMessage.includes("Messages et appels chiffrés de bout en bout")) {
                        currentMessage = "[Média ou système]";
                    }
                } else {
                    if (currentAuthor) {
                        currentMessage += " " + line.trim();
                    }
                }
            });
            saveMessage(); // Dernier message

            return { text: chatText, names: names, messages: messages };
        }

        function calculateRawStats(allMessages, personA, personB) {
            let countA = 0, countB = 0;
            let emojisA = {}, emojisB = {};
            const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

            allMessages.forEach(msg => {
                const isA = msg.author === personA;
                if (isA) countA++;
                else countB++;

                let cleanText = msg.text.replace(/\[(?:REACTION|Réactions|A réagi).*?\]/gi, '');

                const emojis = cleanText.match(emojiRegex) || [];
                emojis.forEach(e => {
                    if (!['♤', '♡', '♢', '♧', '️'].includes(e)) {
                        if (isA) emojisA[e] = (emojisA[e] || 0) + 1;
                        else emojisB[e] = (emojisB[e] || 0) + 1;
                    }
                });
            });

            const getTop3 = (emojiMap) => {
                return Object.entries(emojiMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(e => e[0])
                    .join(' ') || "";
            };

            return {
                total: countA + countB || 1,
                countA, countB,
                emojisA: getTop3(emojisA),
                emojisB: getTop3(emojisB)
            };
        }

        function stripHtml(html) {
            return html.replace(/<[^>]*>?/gm, '');
        }

        // --- Logique principale de secours (Thread Principal) ---
        async function runProcessingInMainThreadPromise(filesData, selectedModel, relationLabel = "") {
            // Trier les fichiers
            filesData.sort((a, b) => {
                const extA = a.name.split('.').pop().toLowerCase();
                const extB = b.name.split('.').pop().toLowerCase();
                if (extA === 'html' && extB === 'html') {
                    return b.name.localeCompare(a.name, undefined, {numeric: true});
                }
                return a.name.localeCompare(b.name, undefined, {numeric: true});
            });

            let combinedChatText = "";
            let globalNames = new Set();
            let allMessages = [];

            const loadingText = document.getElementById('loadingText');

            for (const file of filesData) {
                const { name, content } = file;
                const extension = name.split('.').pop().toLowerCase();
                
                let extractedData;
                if (extension === 'html') {
                    extractedData = extractInstagramHTML(content);
                } else if (extension === 'txt') {
                    extractedData = extractWhatsAppTXT(content);
                } else {
                    continue;
                }

                combinedChatText += extractedData.text + "\n";
                allMessages = allMessages.concat(extractedData.messages);
                extractedData.names.forEach(n => globalNames.add(n));
                
                if (loadingText) {
                    loadingText.innerText = (relationLabel ? `[${relationLabel}] ` : "") + `Lecture de ${name}...`;
                }
            }

            if (allMessages.length === 0) {
                throw new Error("Impossible de trouver des messages.");
            }

            let personA = "Personne A";
            let personB = "Personne B";
            const namesArray = Array.from(globalNames);
            if (namesArray.length >= 2) {
                personA = namesArray[0];
                personB = namesArray[1];
            } else if (namesArray.length === 1) {
                personA = namesArray[0];
            }

            const stats = calculateRawStats(allMessages, personA, personB);

            const limit = (window.analysisMode === 'duel') ? 100000 : 700000;
            if (combinedChatText.length > limit) {
                const head = combinedChatText.substring(0, Math.floor(limit / 7));
                const tail = combinedChatText.substring(combinedChatText.length - Math.floor(limit * 6 / 7));
                combinedChatText = head + "\n\n[...Messages compressés...]\n\n" + tail; 
            }

            return {
                combinedChatText,
                personA,
                personB,
                stats,
                recentContext: allMessages.slice(-50).map(m => `${m.author}: ${m.text}`).join('\n'),
                recentMessages: allMessages.slice(-5)
            };
        }

        async function processFilesData(filesData, selectedModel, relationLabel = "") {
            const loadingText = document.getElementById('loadingText');
            return new Promise((resolve, reject) => {
                let useWorker = true;
                let worker;
                
                try {
                    const workerScriptCode = document.getElementById('workerScript').textContent;
                    const blob = new Blob([workerScriptCode], { type: "application/javascript" });
                    worker = new Worker(URL.createObjectURL(blob));
                } catch (workerError) {
                    console.warn("Impossible d'instancier le Web Worker. Repli sur le thread principal.", workerError);
                    useWorker = false;
                }

                if (useWorker) {
                    const limit = (window.analysisMode === 'duel') ? 100000 : 700000;
                    worker.postMessage({ filesData, selectedModel, limit });

                    worker.onmessage = async (e) => {
                        const msg = e.data;
                        if (msg.type === 'progress') {
                            loadingText.innerText = (relationLabel ? `[${relationLabel}] ` : "") + msg.message;
                        } else if (msg.type === 'error') {
                            worker.terminate();
                            reject(new Error(msg.message));
                        } else if (msg.type === 'success') {
                            worker.terminate();
                            resolve(msg.result);
                        }
                    };

                    worker.onerror = async (err) => {
                        console.warn("Erreur Web Worker, repli thread principal.", err);
                        worker.terminate();
                        try {
                            const res = await runProcessingInMainThreadPromise(filesData, selectedModel, relationLabel);
                            resolve(res);
                        } catch (fallbackErr) {
                            reject(fallbackErr);
                        }
                    };
                } else {
                    runProcessingInMainThreadPromise(filesData, selectedModel, relationLabel).then(resolve).catch(reject);
                }
            });
        }

        // --- Finalisation commune du parsing ---
        async function finalizeAnalysis(result) {
            const { combinedChatText, personA, personB, stats, recentContext, recentMessages } = result;
            const btn = document.getElementById('analyzeBtn');
            const loading = document.getElementById('loading');
            const results = document.getElementById('results');
            const loadingText = document.getElementById('loadingText');

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
            document.getElementById('raw-stats').style.display = 'flex';

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
            const loadingInterval = setInterval(() => {
                phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
                loadingText.innerText = `Analyse en cours... 🤔\n${loadingPhrases[phraseIndex]}`;
            }, 2500);

            try {
                const aiResult = await callGeminiAPI(chatData);
                clearInterval(loadingInterval);
                displayResults(aiResult, chatData);

                // Sauvegarder dans l'historique
                saveToHistory(aiResult, chatData, stats, recentContext, recentMessages);

                loading.style.display = 'none';
                results.style.display = 'block';
                btn.disabled = false;

                // Mode présentation plein écran
                document.getElementById('form-container').style.display = 'none';
                document.body.classList.add('results-active');
                initPresentationNavigation();

                SoundEngine.playSuccess();
                playCupidAnimation();
            } catch (err) {
                clearInterval(loadingInterval);
                console.error(err);
                alert("Erreur IA :\n" + err.message);
                loading.style.display = 'none';
                btn.disabled = false;
            }
        }

        // --- Lancement de l'analyse avec gestion Worker + Fallback ---
        async function startAnalysis() {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            if (!apiKey) {
                alert("Veuillez entrer votre clé d'API Gemini pour lancer l'analyse.");
                return;
            }
            localStorage.setItem('gemini_api_key', apiKey);

            const isDuel = (window.analysisMode === 'duel');
            const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash';
            const btn = document.getElementById('analyzeBtn');
            const loading = document.getElementById('loading');
            const loadingText = document.getElementById('loadingText');

            if (isDuel) {
                if (window.versusFiles.length === 0) {
                    alert("Veuillez sélectionner ou glisser au moins un fichier de chat pour lancer le Versus.");
                    return;
                }

                btn.disabled = true;
                loading.style.display = 'block';
                loadingText.innerText = "Lecture et parsing de vos fichiers de chat... 📂";

                try {
                    // Trier les fichiers versus pour assurer la chronologie d'extraction
                    window.versusFiles.sort((a, b) => {
                        return a.name.localeCompare(b.name, undefined, {numeric: true});
                    });

                    let combinedChatText = "";
                    let globalNames = new Set();
                    let allMessages = [];

                    for (const file of window.versusFiles) {
                        const extension = file.name.split('.').pop().toLowerCase();
                        let extractedData;
                        if (extension === 'html') {
                            extractedData = extractInstagramHTML(file.content);
                        } else if (extension === 'txt') {
                            extractedData = extractWhatsAppTXT(file.content);
                        } else {
                            continue;
                        }
                        combinedChatText += extractedData.text + "\n";
                        allMessages = allMessages.concat(extractedData.messages);
                        extractedData.names.forEach(n => globalNames.add(n));
                    }

                    if (allMessages.length === 0) {
                        throw new Error("Impossible de trouver des messages lisibles dans les fichiers.");
                    }

                    const namesArray = Array.from(globalNames);
                    if (namesArray.length < 2) {
                        throw new Error("Il doit y avoir au moins 2 participants distincts dans les conversations pour lancer un Versus.");
                    }

                    window.versusAllMessages = allMessages;
                    window.versusGlobalNames = namesArray;

                    // Masquer le chargement et ouvrir le modal de sélection
                    loading.style.display = 'none';
                    openVersusSetupModal(namesArray);

                } catch (error) {
                    console.error("Erreur dans startAnalysis Versus :", error);
                    alert("Une erreur est survenue lors de la préparation du Versus :\n" + error.message);
                    loading.style.display = 'none';
                    btn.disabled = false;
                }

            } else {
                const files = document.getElementById('fileInput').files;
                const results = document.getElementById('results');

                if (files.length === 0) {
                    alert("Veuillez sélectionner au moins un fichier d'archive.");
                    return;
                }

                btn.disabled = true;
                results.style.display = 'none';
                loading.style.display = 'block';

                try {
                    loadingText.innerText = `Lecture de ${files.length} fichier(s)...`;
                    
                    const filesData = [];
                    for (let i = 0; i < files.length; i++) {
                        const text = await files[i].text();
                        filesData.push({ name: files[i].name, content: text });
                    }

                    const result = await processFilesData(filesData, selectedModel);
                    await finalizeAnalysis(result);

                } catch (error) {
                    console.error("Erreur dans startAnalysis Standard :", error);
                    alert("Une erreur est survenue :\n" + error.message);
                    loading.style.display = 'none';
                    btn.disabled = false;
                }
            }
        }

        // --- Logique du Modal de Configuration Versus (Sans IA) ---
        function openVersusSetupModal(namesArray) {
            const modal = document.getElementById('versus-setup-modal');
            const container1 = document.getElementById('versus-participants-container');
            if (!modal || !container1) return;

            container1.innerHTML = '';
            namesArray.forEach(name => {
                const btn = document.createElement('button');
                btn.style.cssText = "width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(157, 78, 221, 0.3); border-radius: 12px; color: white; font-weight: bold; cursor: pointer; text-align: center; transition: all 0.25s; font-size: 0.95rem; margin-bottom: 5px;";
                btn.innerText = name;
                btn.onmouseover = () => { btn.style.background = 'rgba(157, 78, 221, 0.2)'; btn.style.borderColor = '#c77dff'; };
                btn.onmouseout = () => { btn.style.background = 'rgba(255,255,255,0.05)'; btn.style.borderColor = 'rgba(157, 78, 221, 0.3)'; };
                btn.onclick = () => {
                    try { SoundEngine.playClick(); } catch(e) {}
                    selectVersusMe(name);
                };
                container1.appendChild(btn);
            });

            document.getElementById('versus-step-1').style.display = 'block';
            document.getElementById('versus-step-2').style.display = 'none';
            modal.style.display = 'flex';
            // Force a reflow and add class/opacity for smooth transitions
            modal.offsetHeight;
            modal.style.opacity = '1';
        }

        function closeVersusSetupModal() {
            const modal = document.getElementById('versus-setup-modal');
            if (!modal) return;
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            document.getElementById('analyzeBtn').disabled = false;
            document.getElementById('loading').style.display = 'none';
        }

        function selectVersusMe(meName) {
            window.versusCentralUser = meName;
            const remaining = window.versusGlobalNames.filter(n => n !== meName);

            if (remaining.length < 2) {
                alert("Il faut au moins 2 autres interlocuteurs différents pour lancer un versus de comparaison. En mode Standard, vous pouvez analyser une relation unique.");
                closeVersusSetupModal();
                return;
            }

            if (remaining.length === 2) {
                // Choix évident
                window.versusPretenderA = remaining[0];
                window.versusPretenderB = remaining[1];
                closeVersusSetupModal();
                launchVersusAnalysis();
            } else {
                // Plus de 2 prétendants restants (ex: chat de groupe de 4 personnes ou plus)
                // Étape 2 : Permettre de choisir les 2 personnes
                const container2 = document.getElementById('versus-candidates-container');
                if (!container2) return;

                container2.innerHTML = '';
                remaining.forEach(name => {
                    const label = document.createElement('label');
                    label.style.cssText = "display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 8px; cursor: pointer; color: white; transition: all 0.2s;";
                    label.innerHTML = `
                        <input type="checkbox" name="versusCandidate" value="${name}" style="transform: scale(1.3); accent-color: #9d4edd; cursor: pointer; margin-right: 5px;">
                        <span style="font-weight: bold; font-size: 0.95rem;">${name}</span>
                    `;
                    label.onmouseover = () => { label.style.background = 'rgba(255,255,255,0.08)'; label.style.borderColor = 'rgba(255,255,255,0.2)'; };
                    label.onmouseout = () => { label.style.background = 'rgba(255,255,255,0.03)'; label.style.borderColor = 'rgba(255,255,255,0.08)'; };
                    container2.appendChild(label);
                });

                document.getElementById('versus-step-1').style.display = 'none';
                document.getElementById('versus-step-2').style.display = 'block';
            }
        }

        function submitVersusCandidates() {
            try { SoundEngine.playClick(); } catch(e) {}
            const checked = Array.from(document.querySelectorAll('input[name="versusCandidate"]:checked'));
            if (checked.length !== 2) {
                alert("Veuillez sélectionner exactement 2 personnes à comparer.");
                return;
            }

            window.versusPretenderA = checked[0].value;
            window.versusPretenderB = checked[1].value;

            closeVersusSetupModal();
            launchVersusAnalysis();
        }

        async function launchVersusAnalysis() {
            const loading = document.getElementById('loading');
            const loadingText = document.getElementById('loadingText');
            const btn = document.getElementById('analyzeBtn');

            btn.disabled = true;
            loading.style.display = 'block';
            loadingText.innerText = "Calcul et segmentation des historiques de chat... ⚔️";

            try {
                // Segmenter les messages de window.versusAllMessages
                const relationAMessages = window.versusAllMessages.filter(m => m.author === window.versusCentralUser || m.author === window.versusPretenderA);
                const relationBMessages = window.versusAllMessages.filter(m => m.author === window.versusCentralUser || m.author === window.versusPretenderB);

                if (relationAMessages.length === 0 || relationBMessages.length === 0) {
                    throw new Error("Impossible de diviser les messages. Assurez-vous que les personnes sélectionnées ont échangé des messages.");
                }

                // Construire result1
                let textA = relationAMessages.map(m => `${m.author}: ${m.text}`).join('\n') + '\n';
                if (textA.length > 100000) {
                    const head = textA.substring(0, 15000);
                    const tail = textA.substring(textA.length - 85000);
                    textA = head + "\n\n[...Messages compressés...]\n\n" + tail;
                }
                const result1 = {
                    combinedChatText: textA,
                    personA: window.versusCentralUser,
                    personB: window.versusPretenderA,
                    stats: calculateRawStats(relationAMessages, window.versusCentralUser, window.versusPretenderA),
                    recentContext: relationAMessages.slice(-50).map(m => `${m.author}: ${m.text}`).join('\n'),
                    recentMessages: relationAMessages.slice(-5)
                };

                // Construire result2
                let textB = relationBMessages.map(m => `${m.author}: ${m.text}`).join('\n') + '\n';
                if (textB.length > 100000) {
                    const head = textB.substring(0, 15000);
                    const tail = textB.substring(textB.length - 85000);
                    textB = head + "\n\n[...Messages compressés...]\n\n" + tail;
                }
                const result2 = {
                    combinedChatText: textB,
                    personA: window.versusCentralUser,
                    personB: window.versusPretenderB,
                    stats: calculateRawStats(relationBMessages, window.versusCentralUser, window.versusPretenderB),
                    recentContext: relationBMessages.slice(-50).map(m => `${m.author}: ${m.text}`).join('\n'),
                    recentMessages: relationBMessages.slice(-5)
                };

                await finalizeDuelAnalysis(result1, result2);

            } catch (error) {
                console.error("Erreur dans launchVersusAnalysis :", error);
                alert("Une erreur est survenue lors du calcul comparatif :\n" + error.message);
                loading.style.display = 'none';
                btn.disabled = false;
            }
        }

        async function finalizeDuelAnalysis(result1, result2) {
            const btn = document.getElementById('analyzeBtn');
            const loading = document.getElementById('loading');
            const resultsDuel = document.getElementById('results-duel');
            const loadingText = document.getElementById('loadingText');

            window.duelResult1 = result1;
            window.duelResult2 = result2;

            const goalSelected = document.querySelector('input[name="goal"]:checked').value;
            let finalGoal = 'Amour';
            if (goalSelected === 'amitie') finalGoal = 'Amitié';
            if (goalSelected === 'roast') finalGoal = 'Roast';
            window.globalGoal = finalGoal;

            loadingText.innerText = `Lancement de la confrontation amoureuse... ⚔️\nCupidon arbitre le match entre ${result1.personB} et ${result2.personB}...`;
            
            const loadingPhrases = [
                "Comparaison des temps de réponse...",
                "Calcul des coefficients de friendzone...",
                "Examen des red flags mutuels...",
                "Mesure de la ferveur amoureuse...",
                "Cupidon aiguise ses flèches...",
                "Délibération finale de l'oracle..."
            ];
            let phraseIndex = 0;
            const loadingInterval = setInterval(() => {
                phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
                loadingText.innerText = `Analyse du Duel... ⚔️\n${loadingPhrases[phraseIndex]}`;
            }, 2500);

            try {
                const duelData = await callGeminiDuelAPI(result1, result2, finalGoal);
                clearInterval(loadingInterval);

                displayDuelResults(duelData, result1, result2);

                saveDuelToHistory(duelData, result1, result2, finalGoal);

                loading.style.display = 'none';
                resultsDuel.style.display = 'block';
                btn.disabled = false;

                document.getElementById('form-container').style.display = 'none';
                document.body.classList.add('results-duel-active');
                initPresentationDuelNavigation();

                SoundEngine.playSuccess();
                playCupidAnimation();
            } catch (err) {
                clearInterval(loadingInterval);
                console.error(err);
                alert("Erreur IA dans le Duel :\n" + err.message);
                loading.style.display = 'none';
                btn.disabled = false;
            }
        }

        async function callGeminiDuelAPI(result1, result2, goal) {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash';
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

            // Déterminer les 3 personnes distinctes
            const names1 = [result1.personA, result1.personB];
            const names2 = [result2.personA, result2.personB];

            let centralUser = result1.personA;
            let pretenderA = result1.personB;
            let pretenderB = result2.personB;

            const intersection = names1.filter(n => names2.includes(n));
            if (intersection.length > 0) {
                centralUser = intersection[0];
                pretenderA = names1.find(n => n !== centralUser) || result1.personB;
                pretenderB = names2.find(n => n !== centralUser) || result2.personB;
            } else {
                if (result1.personA === result2.personA) {
                    centralUser = result1.personA;
                    pretenderA = result1.personB;
                    pretenderB = result2.personB;
                } else if (result1.personB === result2.personB) {
                    centralUser = result1.personB;
                    pretenderA = result1.personA;
                    pretenderB = result2.personA;
                }
            }

            const isRoast = (goal === 'Roast');
            
            let personaBlock = `Tu es Cupidon, l'arbitre suprême de l'amour, doté d'un œil de lynx psychologique et d'un humour décapant. 
        Tu vas comparer deux relations différentes de ${centralUser} (qui est l'utilisateur principal présent dans les deux discussions) :
        1. Relation avec ${pretenderA}
        2. Relation avec ${pretenderB}

        Il y a donc 3 personnes distinctes impliquées :
        - ${centralUser} (l'utilisateur principal commun)
        - ${pretenderA} (Prétendant A)
        - ${pretenderB} (Prétendant B)

        Fais une analyse comparative extrêmement longue, détaillée et croustillante. Ne retiens pas tes coups !
        Sois hilarant, sarcastique mais d'une pertinence psychologique absolue. Pèse objectivement les trois personnes.
        Pour chaque aspect (affection, red flags, green flags, expressions), fournis une évaluation distincte pour CHACUN des 3 protagonistes.`;

            if (isRoast) {
                personaBlock = `⚠️ TU ES SATAN, LE ROASTER DIABOLIQUE DES RELATIONS. Ton but est de détruire ces relations avec férocité.
        Tu vas comparer les relations de ${centralUser} (l'utilisateur principal présent dans les deux discussions) avec ${pretenderA} et ${pretenderB}.
        Il y a donc 3 personnes distinctes impliquées :
        - ${centralUser} (l'utilisateur principal commun)
        - ${pretenderA} (Prétendant A)
        - ${pretenderB} (Prétendant B)

        Dans cette confrontation de pitié, tu dois désigner **LE PLUS GROS CONNARD** de l'histoire (le plus toxique, le plus égoïste, le pire protagoniste, ou celui qui se comporte le plus mal). 
        ⚠️ DIRECTIVE CRITIQUE D'OBJECTIVITÉ (ANTI-BIAIS) : Ne cible PAS systématiquement l'utilisateur principal (${centralUser}) juste par provocation facile ou pour plaire au lecteur. Base-toi exclusivement sur la réalité des messages. Si l'un des prétendants (${pretenderA} ou ${pretenderB}) se montre froid, distant, manipulateur, toxique ou égoïste, désigne-le impitoyablement comme le vainqueur du titre. Si c'est réellement l'utilisateur principal (${centralUser}) qui est le pire protagoniste de l'histoire, alors seulement désigne-le. Sois d'une impartialité et d'une lucidité absolues.
        Sois impitoyable. Pour chaque slide ou aspect, tu dois donner une évaluation acide et drôle pour CHACUNE des 3 personnes.
        Utilise un langage familier, cru, et hyper acide (ex: serpillère, forceur, égo surdimensionné, toxique). Tourne en dérision les défauts et cite-les copieusement.`;
            }

            const prompt = `${personaBlock}

        Voici les données de la relation 1 entre ${centralUser} et ${pretenderA} :
        - Total de messages : ${result1.stats.total}
        - Extrait de la conversation réelle :
        ${result1.combinedChatText}

        Voici les données de la relation 2 entre ${centralUser} et ${pretenderB} :
        - Total de messages : ${result2.stats.total}
        - Extrait de la conversation réelle :
        ${result2.combinedChatText}

        L'utilisateur souhaite orienter sa vie vers : ${goal}.

        ⚠️ RÈGLE DE FORMATAGE JSON STRICTE :
        Pour éviter de casser le format JSON, tu NE DOIS JAMAIS utiliser de guillemets doubles (") à l'intérieur de tes textes générés. Utilise TOUJOURS des guillemets simples (') ou des guillemets français « » pour tes citations.

        Renvoie UNIQUEMENT un objet JSON valide avec exactement cette structure :
        {
          "score_compat_A": entier entre 0 et 100,
          "score_compat_B": entier entre 0 et 100,
          "affection_level_A": "court label humoristique sur ${pretenderA}",
          "affection_level_B": "court label humoristique sur ${pretenderB}",
          "affection_level_Central": "court label humoristique sur ${centralUser}",
          "red_flags_A": [ "1 à 2 drapeaux rouges chez ${pretenderA}" ],
          "red_flags_B": [ "1 à 2 drapeaux rouges chez ${pretenderB}" ],
          "red_flags_Central": [ "1 à 2 drapeaux rouges chez ${centralUser}" ],
          "green_flags_A": [ "1 à 2 points forts chez ${pretenderA}" ],
          "green_flags_B": [ "1 à 2 points forts chez ${pretenderB}" ],
          "green_flags_Central": [ "1 à 2 points forts chez ${centralUser}" ],
          "surnoms_A": "surnoms/expressions de ${pretenderA}",
          "surnoms_B": "surnoms/expressions de ${pretenderB}",
          "surnoms_Central": "surnoms/expressions de ${centralUser}",
          "analyse_duel": "${isRoast ? 'Une comparaison au vitriol des trois personnes.' : "Une analyse comparative globale de 8-12 lignes décrivant l'opposition de style."}",
          "verdict_gagnant": "${isRoast ? 'Le nom exact de celui qui est le plus gros connard (soit ' + pretenderA + ', soit ' + pretenderB + ', soit ' + centralUser + ')' : 'Le nom exact du vainqueur (soit ' + pretenderA + ', soit ' + pretenderB + ', soit Match Nul 💀)'}",
          "verdict_detail": "${isRoast ? 'La justification démoniaque et drôle expliquant pourquoi cette personne remporte la palme du pire connard.' : "La justification ultime et croustillante expliquant pourquoi c'est le meilleur choix de vie."}",
          "archetype_Central": "${isRoast ? 'Archétype acide de communication' : 'Archétype de flirt pour ' + centralUser}",
          "archetype_Central_description": "Description corrosive de 3-4 lignes de son style de communication global.",
          "archetype_A": "${isRoast ? 'Archétype acide de communication' : 'Archétype de flirt pour ' + pretenderA}",
          "archetype_A_description": "Description corrosive de 3-4 lignes de son style de communication.",
          "archetype_B": "${isRoast ? 'Archétype acide de communication' : 'Archétype de flirt pour ' + pretenderB}",
          "archetype_B_description": "Description corrosive de 3-4 lignes de son style de communication.",
          "evolution_temporelle_A": [
            {
              "periode": "Phase 1",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé pour la relation A",
              "citation": "Une citation exacte courte de la discussion A (ex: « Tu me plais »)"
            },
            {
              "periode": "Phase 2",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion A"
            },
            {
              "periode": "Phase 3",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion A"
            },
            {
              "periode": "Phase 4",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion A"
            }
          ],
          "evolution_temporelle_B": [
            {
              "periode": "Phase 1",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé pour la relation B",
              "citation": "Une citation exacte courte de la discussion B (ex: « Salut toi »)"
            },
            {
              "periode": "Phase 2",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion B"
            },
            {
              "periode": "Phase 3",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion B"
            },
            {
              "periode": "Phase 4",
              "score_affection": entier entre 0 et 100,
              "evenement": "Titre court de l\\'événement clé",
              "citation": "Une citation exacte courte de la discussion B"
            }
          ]
        }`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.8
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
                } catch (e) {}
                throw new Error("Erreur API Gemini Duel : " + errorMsg);
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

        function displayDuelResults(duelData, result1, result2) {
            const container = document.getElementById('results-duel');
            if (!container) return;

            container.innerHTML = '';

            // Déterminer les 3 personnes distinctes
            const names1 = [result1.personA, result1.personB];
            const names2 = [result2.personA, result2.personB];

            let centralUser = result1.personA;
            let pretenderA = result1.personB;
            let pretenderB = result2.personB;

            const intersection = names1.filter(n => names2.includes(n));
            if (intersection.length > 0) {
                centralUser = intersection[0];
                pretenderA = names1.find(n => n !== centralUser) || result1.personB;
                pretenderB = names2.find(n => n !== centralUser) || result2.personB;
            } else {
                if (result1.personA === result2.personA) {
                    centralUser = result1.personA;
                    pretenderA = result1.personB;
                    pretenderB = result2.personB;
                } else if (result1.personB === result2.personB) {
                    centralUser = result1.personB;
                    pretenderA = result1.personA;
                    pretenderB = result2.personA;
                }
            }

            // Exposer pour accès global
            window.duelCentralUser = centralUser;
            window.duelPretenderA = pretenderA;
            window.duelPretenderB = pretenderB;

            const winnerName = duelData.verdict_gagnant;
            const isWinner1 = (winnerName === pretenderA);
            const isWinner2 = (winnerName === pretenderB);
            const isWinnerCentral = (winnerName === centralUser);
            const isMatchNul = !isWinner1 && !isWinner2 && !isWinnerCentral;
            const isRoast = (window.globalGoal === 'Roast');

            // Extraction correcte des statistiques par personne
            let msgCountCentral = 0;
            let msgCountPretenderA = 0;
            let msgCountPretenderB = 0;

            let emojiCentral = "💬";
            let emojiPretenderA = "💬";
            let emojiPretenderB = "💬";

            if (result1.personA === centralUser) {
                msgCountCentral += result1.stats.countA;
                msgCountPretenderA = result1.stats.countB;
                emojiCentral = result1.stats.emojisA || emojiCentral;
                emojiPretenderA = result1.stats.emojisB || emojiPretenderA;
            } else {
                msgCountCentral += result1.stats.countB;
                msgCountPretenderA = result1.stats.countA;
                emojiCentral = result1.stats.emojisB || emojiCentral;
                emojiPretenderA = result1.stats.emojisA || emojiPretenderA;
            }

            if (result2.personA === centralUser) {
                msgCountCentral += result2.stats.countA;
                msgCountPretenderB = result2.stats.countB;
                emojiPretenderB = result2.stats.emojisB || emojiPretenderB;
            } else {
                msgCountCentral += result2.stats.countB;
                msgCountPretenderB = result2.stats.countA;
                emojiPretenderB = result2.stats.emojisA || emojiPretenderB;
            }

            // Slide 1: Stats Versus (3 personnes)
            const slide1HTML = `
                <div class="result-slide duel-slide active-slide" id="duel-slide-stats">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                        <h3 style="color: #ffd166; margin-bottom: 20px; text-align: center; font-size: 1.5rem;">📊 Versus : Statistiques Brutes</h3>
                        <div class="versus-arena" style="display: flex; align-items: stretch; justify-content: space-between; gap: 12px; margin-top: 15px;">
                            <!-- Prétendant A -->
                            <div style="text-align: center; flex: 1; background: rgba(255, 71, 126, 0.05); padding: 15px; border-radius: 12px; border: 1px dashed rgba(255, 71, 126, 0.3);" class="stagger-item">
                                <h4 style="color: #ff477e; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 5px;">${pretenderA}</h4>
                                <div style="font-size: 1.8rem; font-weight: bold; margin: 8px 0; color: #ff477e;">${msgCountPretenderA}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 0 0 10px 0;">Messages</p>
                                <div style="font-size: 1.8rem; margin-top: 10px;">${emojiPretenderA}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 5px 0 0 0;">Emojis favoris</p>
                            </div>
                            
                            <!-- Utilisateur Principal -->
                            <div style="text-align: center; flex: 1; background: rgba(255, 208, 102, 0.05); padding: 15px; border-radius: 12px; border: 1px dashed rgba(255, 208, 102, 0.3);" class="stagger-item">
                                <h4 style="color: #ffd166; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 5px;">${centralUser}</h4>
                                <div style="font-size: 1.8rem; font-weight: bold; margin: 8px 0; color: #ffd166;">${msgCountCentral}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 0 0 10px 0;">Messages (Total)</p>
                                <div style="font-size: 1.8rem; margin-top: 10px;">${emojiCentral}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 5px 0 0 0;">Emojis favoris</p>
                            </div>
                            
                            <!-- Prétendant B -->
                            <div style="text-align: center; flex: 1; background: rgba(157, 78, 221, 0.05); padding: 15px; border-radius: 12px; border: 1px dashed rgba(157, 78, 221, 0.3);" class="stagger-item">
                                <h4 style="color: #9d4edd; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 5px;">${pretenderB}</h4>
                                <div style="font-size: 1.8rem; font-weight: bold; margin: 8px 0; color: #9d4edd;">${msgCountPretenderB}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 0 0 10px 0;">Messages</p>
                                <div style="font-size: 1.8rem; margin-top: 10px;">${emojiPretenderB}</div>
                                <p style="font-size: 0.8rem; color: #aaa; margin: 5px 0 0 0;">Emojis favoris</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Slide 2: Match des Scores (Compatibilité & Affection pour les 3)
            const slide2HTML = `
                <div class="result-slide duel-slide" id="duel-slide-scores">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);">
                        <h3 style="color: #4cc9f0; margin-bottom: 25px; text-align: center; font-size: 1.5rem;">💘 Match des Scores IA</h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div class="stagger-item" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 15px; padding: 15px;">
                                <div style="text-align: center; font-size: 0.9rem; color: #ccc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Compatibilité avec ${centralUser}</div>
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                    <div style="flex: 1; text-align: right; color: #ff477e; font-size: 1.6rem; font-weight: bold;">${pretenderA} : ${duelData.score_compat_A}%</div>
                                    <div style="font-size: 1.2rem; color: #ffd166;">⚡</div>
                                    <div style="flex: 1; text-align: left; color: #9d4edd; font-size: 1.6rem; font-weight: bold;">${pretenderB} : ${duelData.score_compat_B}%</div>
                                </div>
                            </div>
                            
                            <div class="stagger-item" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 15px; padding: 15px;">
                                <div style="text-align: center; font-size: 0.9rem; color: #ccc; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Niveau d'Affection IA</div>
                                <div style="display: flex; align-items: stretch; justify-content: space-between; gap: 10px;">
                                    <!-- Prétendant A -->
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 0.8rem; color: #ff477e; font-weight: bold; margin-bottom: 5px;">${pretenderA}</div>
                                        <div style="color: #ffb3c6; font-size: 0.9rem; font-weight: bold; word-break: break-word;">${duelData.affection_level_A}</div>
                                    </div>
                                    <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
                                    <!-- Utilisateur Principal -->
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 0.8rem; color: #ffd166; font-weight: bold; margin-bottom: 5px;">${centralUser}</div>
                                        <div style="color: #ffe599; font-size: 0.9rem; font-weight: bold; word-break: break-word;">${duelData.affection_level_Central || 'Neutre'}</div>
                                    </div>
                                    <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
                                    <!-- Prétendant B -->
                                    <div style="flex: 1; text-align: center;">
                                        <div style="font-size: 0.8rem; color: #9d4edd; font-weight: bold; margin-bottom: 5px;">${pretenderB}</div>
                                        <div style="color: #e0b0ff; font-size: 0.9rem; font-weight: bold; word-break: break-word;">${duelData.affection_level_B}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Slide 3: Le Ring des Flags (3 personnes)
            const redFlagsA = (duelData.red_flags_A || []).map(f => `<div style="background: rgba(255,51,51,0.08); border: 1px solid rgba(255,51,51,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #ff9999; text-align: left;">🚩 ${f}</div>`).join('');
            const greenFlagsA = (duelData.green_flags_A || []).map(f => `<div style="background: rgba(6,214,160,0.08); border: 1px solid rgba(6,214,160,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #7bf1a8; text-align: left;">💚 ${f}</div>`).join('');

            const redFlagsCentral = (duelData.red_flags_Central || []).map(f => `<div style="background: rgba(255,51,51,0.08); border: 1px solid rgba(255,51,51,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #ff9999; text-align: left;">🚩 ${f}</div>`).join('');
            const greenFlagsCentral = (duelData.green_flags_Central || []).map(f => `<div style="background: rgba(6,214,160,0.08); border: 1px solid rgba(6,214,160,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #7bf1a8; text-align: left;">💚 ${f}</div>`).join('');

            const redFlagsB = (duelData.red_flags_B || []).map(f => `<div style="background: rgba(255,51,51,0.08); border: 1px solid rgba(255,51,51,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #ff9999; text-align: left;">🚩 ${f}</div>`).join('');
            const greenFlagsB = (duelData.green_flags_B || []).map(f => `<div style="background: rgba(6,214,160,0.08); border: 1px solid rgba(6,214,160,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.85rem; color: #7bf1a8; text-align: left;">💚 ${f}</div>`).join('');

            const slide3HTML = `
                <div class="result-slide duel-slide" id="duel-slide-flags">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); max-height: calc(100dvh - 120px); overflow-y: auto;">
                        <h3 style="color: #ff477e; margin-bottom: 20px; text-align: center; font-size: 1.5rem;">⛳ Le Ring des Flags</h3>
                        
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <!-- Prétendant A -->
                            <div style="flex: 1; min-width: 180px;" class="stagger-item">
                                <h4 style="color: #ff477e; text-align: center; margin-bottom: 12px; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pretenderA}</h4>
                                ${greenFlagsA || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun point fort</div>'}
                                ${redFlagsA || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun drapeau rouge</div>'}
                            </div>
                            
                            <div style="width: 1px; background: rgba(255,255,255,0.1); align-self: stretch;"></div>
                            
                            <!-- Utilisateur Principal -->
                            <div style="flex: 1; min-width: 180px;" class="stagger-item">
                                <h4 style="color: #ffd166; text-align: center; margin-bottom: 12px; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${centralUser}</h4>
                                ${greenFlagsCentral || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun point fort</div>'}
                                ${redFlagsCentral || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun drapeau rouge</div>'}
                            </div>
                            
                            <div style="width: 1px; background: rgba(255,255,255,0.1); align-self: stretch;"></div>
                            
                            <!-- Prétendant B -->
                            <div style="flex: 1; min-width: 180px;" class="stagger-item">
                                <h4 style="color: #9d4edd; text-align: center; margin-bottom: 12px; font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pretenderB}</h4>
                                ${greenFlagsB || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun point fort</div>'}
                                ${redFlagsB || '<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">Aucun drapeau rouge</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Slide 4: Surnoms (3 personnes)
            const slide4HTML = `
                <div class="result-slide duel-slide" id="duel-slide-dialect">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); max-height: calc(100dvh - 120px); overflow-y: auto;">
                        <h3 style="color: #06d6a0; margin-bottom: 20px; text-align: center; font-size: 1.5rem;">🗣️ Surnoms & Expressions</h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div class="stagger-item" style="border-left: 4px solid #ff477e; background: rgba(255,71,126,0.04); padding: 12px; border-radius: 0 12px 12px 0;">
                                <h4 style="color: #ff477e; margin-bottom: 5px; font-size: 0.95rem;">Chez ${pretenderA} :</h4>
                                <p style="color: #eee; font-style: italic; font-size: 0.9rem;">${duelData.surnoms_A || 'Rien de particulier'}</p>
                            </div>

                            <div class="stagger-item" style="border-left: 4px solid #ffd166; background: rgba(255,208,102,0.04); padding: 12px; border-radius: 0 12px 12px 0;">
                                <h4 style="color: #ffd166; margin-bottom: 5px; font-size: 0.95rem;">Chez ${centralUser} :</h4>
                                <p style="color: #eee; font-style: italic; font-size: 0.9rem;">${duelData.surnoms_Central || 'Rien de particulier'}</p>
                            </div>
                            
                            <div class="stagger-item" style="border-left: 4px solid #9d4edd; background: rgba(157,78,221,0.04); padding: 12px; border-radius: 0 12px 12px 0;">
                                <h4 style="color: #9d4edd; margin-bottom: 5px; font-size: 0.95rem;">Chez ${pretenderB} :</h4>
                                <p style="color: #eee; font-style: italic; font-size: 0.9rem;">${duelData.surnoms_B || 'Rien de particulier'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Slide 5: Le Jugement de Cupidon / La Sentence de l'Enfer (Verdict final avec correction de chevauchement)
            let winnerBadgeHTML = "";
            if (isRoast) {
                winnerBadgeHTML = `<div class="winner-badge pulse-animation" style="position: relative !important; top: auto !important; right: auto !important; margin: 0 auto 20px auto !important; display: inline-flex !important; background: linear-gradient(45deg, #ff3333, #ff0000); color: #fff; padding: 10px 25px; border-radius: 50px; font-weight: 900; border: 2px solid #fff; font-size: 1.2rem; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 0 25px rgba(255,0,0,0.6);">👑 LE PLUS GROS CONNARD : ${winnerName} 👿</div>`;
            } else {
                winnerBadgeHTML = isMatchNul
                    ? `<div class="winner-badge" style="position: relative !important; top: auto !important; right: auto !important; margin: 0 auto 20px auto !important; display: inline-flex !important; background: rgba(255,255,255,0.1); color: #fff; padding: 10px 25px; border-radius: 50px; font-weight: bold; border: 2px solid rgba(255,255,255,0.3); font-size: 1.2rem; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 0 20px rgba(255,255,255,0.1);">💀 ${winnerName}</div>`
                    : `<div class="winner-badge pulse-animation" style="position: relative !important; top: auto !important; right: auto !important; margin: 0 auto 20px auto !important; display: inline-flex !important; background: linear-gradient(45deg, #ffd166, #ffca3a); color: #000; padding: 10px 25px; border-radius: 50px; font-weight: 900; border: 2px solid #fff; font-size: 1.3rem; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 0 25px rgba(255,202,58,0.5);">🏆 LE CHOIX DE CUPIDON : ${winnerName} 👑</div>`;
            }

            const slide5HTML = `
                <div class="result-slide duel-slide" id="duel-slide-verdict">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.35); padding: 30px 25px; border-radius: 24px; border: 1px solid rgba(255,208,102,0.3); text-align: center; max-height: calc(100dvh - 120px); overflow-y: auto;">
                        <h3 style="color: #ffd166; margin-bottom: 25px; font-size: 1.6rem; text-shadow: 0 0 10px rgba(255,208,102,0.3);">${isRoast ? '👿 La Sentence de l\'Enfer' : '⚖️ Le Jugement Dernier de Cupidon'}</h3>
                        
                        <div class="stagger-item" style="margin-bottom: 20px;">
                            ${winnerBadgeHTML}
                        </div>

                        <div class="stagger-item" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 20px; text-align: left; margin-bottom: 20px;">
                            <h4 style="color: #ffd166; margin-bottom: 10px; font-size: 1.1rem; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 8px;">Analyse Suprême :</h4>
                            <p style="color: #ccc; line-height: 1.5; font-size: 0.9rem; margin-bottom: 15px; font-style: italic;">${duelData.analyse_duel}</p>
                            
                            <h4 style="color: #ffd166; margin-bottom: 10px; font-size: 1.1rem; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 8px;">${isRoast ? 'Pourquoi remporte-t-il la palme ?' : 'Pourquoi c\'est le meilleur choix ?'}</h4>
                            <p style="color: #fff; line-height: 1.6; font-size: 0.95rem; font-weight: 500;">${duelData.verdict_detail}</p>
                        </div>

                        <div class="stagger-item">
                            <button id="shareDuelBtn" style="background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); color: white; width: auto; padding: 12px 30px; border-radius: 50px; font-size: 1.1rem; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" onclick="shareDuelStory()" onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='scale(1)';">
                                📸 Sauvegarder mon Duel pour ma Story
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Slide 2.5: Profils Psychologiques (3 personnes)
            const colorCentral = '#ffd166';
            const colorA = '#ff477e';
            const colorB = '#9d4edd';

            const avatars = ['🦊', '🐱', '🦁', '🦉', '🦚', '🐼', '🐨', '🐙', '🦄', '🧜‍♀️', '🥷', '🧙‍♂️', '🧚‍♀️', '🐯', '🐻', '🐰'];
            const getAvatar = (name) => {
                let hash = 0;
                for (let i = 0; name && i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                return avatars[Math.abs(hash) % avatars.length];
            };

            const slideProfilesHTML = `
                <div class="result-slide duel-slide" id="duel-slide-profiles">
                    <div style="width: 100%; max-width: 700px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); max-height: calc(100dvh - 120px); overflow-y: auto; box-sizing: border-box;">
                        <h3 style="color: #ffd166; margin-bottom: 20px; text-align: center; font-size: 1.5rem;">🎭 Profils Psychologiques & Archétypes</h3>
                        
                        <div class="versus-arena" style="display: flex; gap: 15px; justify-content: center; align-items: stretch; width: 100%; margin-top: 10px;">
                            <!-- Prétendant A -->
                            <div class="archetype-card stagger-item" style="border: 1px solid ${colorA}40; background: rgba(0,0,0,0.4); border-radius: 14px; padding: 15px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; box-sizing: border-box;">
                                <div class="profile-avatar" style="font-size: 2.8rem; margin-bottom: 10px; animation: heartbeat 2s infinite ease-in-out;">${getAvatar(pretenderA)}</div>
                                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: ${colorA}; font-weight: bold; margin-bottom: 3px;">${pretenderA}</div>
                                <h4 style="color: #fff; font-size: 1.05rem; font-weight: bold; margin-bottom: 8px;">${duelData.archetype_A || "Profil Inconnu"}</h4>
                                <p style="color: #ccc; font-size: 0.8rem; line-height: 1.4; margin: 0;">${duelData.archetype_A_description || "Description non disponible."}</p>
                            </div>
                            
                            <!-- Central User -->
                            <div class="archetype-card stagger-item" style="border: 1px solid ${colorCentral}40; background: rgba(0,0,0,0.4); border-radius: 14px; padding: 15px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; box-sizing: border-box;">
                                <div class="profile-avatar" style="font-size: 2.8rem; margin-bottom: 10px; animation: heartbeat 2s infinite ease-in-out; animation-delay: 0.3s;">${getAvatar(centralUser)}</div>
                                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: ${colorCentral}; font-weight: bold; margin-bottom: 3px;">${centralUser}</div>
                                <h4 style="color: #fff; font-size: 1.05rem; font-weight: bold; margin-bottom: 8px;">${duelData.archetype_Central || "Profil Inconnu"}</h4>
                                <p style="color: #ccc; font-size: 0.8rem; line-height: 1.4; margin: 0;">${duelData.archetype_Central_description || "Description non disponible."}</p>
                            </div>

                            <!-- Prétendant B -->
                            <div class="archetype-card stagger-item" style="border: 1px solid ${colorB}40; background: rgba(0,0,0,0.4); border-radius: 14px; padding: 15px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; box-sizing: border-box;">
                                <div class="profile-avatar" style="font-size: 2.8rem; margin-bottom: 10px; animation: heartbeat 2s infinite ease-in-out; animation-delay: 0.6s;">${getAvatar(pretenderB)}</div>
                                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: ${colorB}; font-weight: bold; margin-bottom: 3px;">${pretenderB}</div>
                                <h4 style="color: #fff; font-size: 1.05rem; font-weight: bold; margin-bottom: 8px;">${duelData.archetype_B || "Profil Inconnu"}</h4>
                                <p style="color: #ccc; font-size: 0.8rem; line-height: 1.4; margin: 0;">${duelData.archetype_B_description || "Description non disponible."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Slide 4.5: Courbes d'Évolution Comparées
            const slideEvolutionHTML = `
                <div class="result-slide duel-slide" id="duel-slide-evolution">
                    <div style="width: 100%; max-width: 650px; margin: auto auto !important; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); max-height: calc(100dvh - 120px); overflow-y: auto; box-sizing: border-box; display: flex; flex-direction: column; gap: 15px;">
                        <h3 style="color: #4cc9f0; margin-bottom: 5px; text-align: center; font-size: 1.5rem;">📉 Évolutions Comparées</h3>
                        
                        <!-- SVG Comparative Chart -->
                        <div class="svg-chart-container" style="width: 100%; position: relative; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px 10px; border: 1px solid rgba(255,255,255,0.05); min-height: 200px; box-sizing: border-box;">
                            <svg id="evolution-duel-svg" viewBox="0 0 500 200" style="width: 100%; height: auto; display: block; overflow: visible;">
                                <defs>
                                    <filter id="neon-glow-duel-pink" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur1" />
                                        <feGaussianBlur stdDeviation="2.5" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <filter id="neon-glow-duel-purple" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur1" />
                                        <feGaussianBlur stdDeviation="2.5" result="blur2" />
                                        <feMerge>
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <!-- Plotted dynamically via JS -->
                            </svg>
                        </div>
                        
                        <!-- Legend -->
                        <div style="display: flex; justify-content: center; gap: 20px; font-size: 0.8rem;">
                            <div style="display: flex; align-items: center; gap: 6px; color: ${colorA}; font-weight: bold;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${colorA};"></span>
                                Relation ${pretenderA}
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; color: ${colorB}; font-weight: bold;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${colorB};"></span>
                                Relation ${pretenderB}
                            </div>
                        </div>
                        
                        <!-- Interactive Detail Card for Duel -->
                        <div id="evolution-duel-details-card" class="stagger-item" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 15px; min-height: 90px; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.15); box-sizing: border-box; width: 100%;">
                            <div style="text-align: center; color: rgba(255,255,255,0.5); font-style: italic; font-size: 0.85rem;">
                                Cliquez sur un point d'une courbe pour analyser les moments forts... 🔎
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = slide1HTML + slide2HTML + slideProfilesHTML + slide3HTML + slide4HTML + slideEvolutionHTML + slide5HTML;

            // Render versus mode double SVG Curve
            if (duelData.evolution_temporelle_A && duelData.evolution_temporelle_B) {
                renderDuelEvolutionSVG(duelData.evolution_temporelle_A, duelData.evolution_temporelle_B, pretenderA, pretenderB, isRoast);
            }

            applyDuelTheme(duelData.score_compat_A, duelData.score_compat_B, winnerName, window.globalGoal);
        }

        // Global Callback to show Duel Evolution Point Details
        window.selectDuelEvolutionPoint = function(idx, pointsList, color, personName) {
            const card = document.getElementById('evolution-duel-details-card');
            if (!card) return;
            const pt = pointsList[idx];
            if (!pt) return;
            
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px;">
                        <span style="font-weight: bold; color: ${color}; font-size: 0.95rem;">Relation ${personName} - ${pt.periode}</span>
                        <span style="background: ${color}20; border: 1px solid ${color}60; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">🌡️ Affection: ${pt.score_affection}%</span>
                    </div>
                    <div style="font-size: 1.05rem; font-weight: bold; color: #fff; margin-bottom: 5px;">🔥 ${pt.evenement || "Moment fort"}</div>
                    <div style="font-style: italic; color: #ccc; font-size: 0.9rem; line-height: 1.4; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border-left: 3px solid ${color};">
                        « ${pt.citation || "Aucun extrait textuel disponible."} »
                    </div>
                `;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 150);
        };

        function renderDuelEvolutionSVG(pointsA, pointsB, nameA, nameB, isRoast) {
            const svg = document.getElementById('evolution-duel-svg');
            if (!svg) return;
            
            // Clear except defs
            const defs = svg.querySelector('defs');
            svg.innerHTML = '';
            if (defs) svg.appendChild(defs);
            
            if (!pointsA || pointsA.length === 0 || !pointsB || pointsB.length === 0) return;
            
            const colorA = isRoast ? '#ff3333' : '#ff477e';
            const colorB = isRoast ? '#9d4edd' : '#9d4edd';
            
            const xStart = 60;
            const xEnd = 450;
            const yStart = 150;
            const yEnd = 30;
            
            // Draw background levels
            const gridLevels = [0, 50, 100];
            gridLevels.forEach(lvl => {
                const y = yStart - (lvl / 100) * (yStart - yEnd);
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", xStart - 20);
                line.setAttribute("y1", y);
                line.setAttribute("x2", xEnd + 20);
                line.setAttribute("y2", y);
                line.setAttribute("stroke", "rgba(255,255,255,0.06)");
                line.setAttribute("stroke-dasharray", "3 3");
                svg.appendChild(line);
                
                const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("x", xStart - 35);
                txt.setAttribute("y", y + 4);
                txt.setAttribute("fill", "rgba(255,255,255,0.4)");
                txt.setAttribute("font-size", "8");
                txt.setAttribute("text-anchor", "middle");
                txt.textContent = lvl + "%";
                svg.appendChild(txt);
            });
            
            const getCoords = (points) => {
                return points.map((pt, idx) => {
                    const x = xStart + (idx * (xEnd - xStart)) / (points.length - 1);
                    const score = Math.max(0, Math.min(100, pt.score_affection));
                    const y = yStart - (score / 100) * (yStart - yEnd);
                    return { x, y, pt, idx };
                });
            };
            
            const coordsA = getCoords(pointsA);
            const coordsB = getCoords(pointsB);
            
            const drawCurve = (coords, color, filterId) => {
                let pathD = "";
                coords.forEach((coord, idx) => {
                    if (idx === 0) pathD += `M ${coord.x} ${coord.y}`;
                    else {
                        const prev = coords[idx - 1];
                        const cpX1 = prev.x + (coord.x - prev.x) / 2;
                        const cpY1 = prev.y;
                        const cpX2 = prev.x + (coord.x - prev.x) / 2;
                        const cpY2 = coord.y;
                        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coord.x} ${coord.y}`;
                    }
                });
                
                // Shadow path
                const shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
                shadow.setAttribute("d", pathD);
                shadow.setAttribute("fill", "none");
                shadow.setAttribute("stroke", color);
                shadow.setAttribute("stroke-width", "5");
                shadow.setAttribute("opacity", "0.35");
                shadow.setAttribute("filter", `url(#${filterId})`);
                svg.appendChild(shadow);
                
                // Main path
                const main = document.createElementNS("http://www.w3.org/2000/svg", "path");
                main.setAttribute("d", pathD);
                main.setAttribute("fill", "none");
                main.setAttribute("stroke", "#ffffff");
                main.setAttribute("stroke-width", "2");
                svg.appendChild(main);
            };
            
            drawCurve(coordsA, colorA, 'neon-glow-duel-pink');
            drawCurve(coordsB, colorB, 'neon-glow-duel-purple');
            
            // Draw markers for A
            coordsA.forEach((coord) => {
                const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                pulse.setAttribute("cx", coord.x);
                pulse.setAttribute("cy", coord.y);
                pulse.setAttribute("r", "7");
                pulse.setAttribute("fill", colorA);
                pulse.setAttribute("opacity", "0.2");
                pulse.style.cursor = "pointer";
                svg.appendChild(pulse);
                
                const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                inner.setAttribute("cx", coord.x);
                inner.setAttribute("cy", coord.y);
                inner.setAttribute("r", "3.5");
                inner.setAttribute("fill", "#ffffff");
                inner.setAttribute("stroke", colorA);
                inner.setAttribute("stroke-width", "2");
                inner.style.cursor = "pointer";
                
                const selectNode = () => {
                    svg.querySelectorAll("circle[r='5.5']").forEach(c => {
                        c.setAttribute("r", "3.5");
                        c.setAttribute("fill", "#ffffff");
                    });
                    inner.setAttribute("r", "5.5");
                    inner.setAttribute("fill", colorA);
                    window.selectDuelEvolutionPoint(coord.idx, pointsA, colorA, nameA);
                };
                
                inner.onclick = selectNode;
                pulse.onclick = selectNode;
                svg.appendChild(inner);
            });
            
            // Draw markers for B
            coordsB.forEach((coord) => {
                const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                pulse.setAttribute("cx", coord.x);
                pulse.setAttribute("cy", coord.y);
                pulse.setAttribute("r", "7");
                pulse.setAttribute("fill", colorB);
                pulse.setAttribute("opacity", "0.2");
                pulse.style.cursor = "pointer";
                svg.appendChild(pulse);
                
                const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                inner.setAttribute("cx", coord.x);
                inner.setAttribute("cy", coord.y);
                inner.setAttribute("r", "3.5");
                inner.setAttribute("fill", "#ffffff");
                inner.setAttribute("stroke", colorB);
                inner.setAttribute("stroke-width", "2");
                inner.style.cursor = "pointer";
                
                const selectNode = () => {
                    svg.querySelectorAll("circle[r='5.5']").forEach(c => {
                        c.setAttribute("r", "3.5");
                        c.setAttribute("fill", "#ffffff");
                    });
                    inner.setAttribute("r", "5.5");
                    inner.setAttribute("fill", colorB);
                    window.selectDuelEvolutionPoint(coord.idx, pointsB, colorB, nameB);
                };
                
                inner.onclick = selectNode;
                pulse.onclick = selectNode;
                svg.appendChild(inner);
            });
            
            // X-axis labels
            coordsA.forEach((coord) => {
                const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("x", coord.x);
                txt.setAttribute("y", yStart + 22);
                txt.setAttribute("fill", "rgba(255,255,255,0.5)");
                txt.setAttribute("font-size", "7.5");
                txt.setAttribute("text-anchor", "middle");
                const labelText = coord.pt.periode.length > 15 ? coord.pt.periode.substring(0, 13) + "..." : coord.pt.periode;
                txt.textContent = labelText;
                svg.appendChild(txt);
            });
            
            // Select first point of A by default
            setTimeout(() => {
                const firstA = svg.querySelectorAll("circle")[1];
                if (firstA) firstA.dispatchEvent(new Event('click'));
            }, 100);
        }

        function applyDuelTheme(scoreA, scoreB, winnerName, goal) {
            const root = document.documentElement;
            const cupidAnim = document.getElementById('cupid-animation');
            const cursorArrow = document.getElementById('cursor-arrow');

            let themeColors = {};
            let emojis = ['⚔️', '⚖️', '🏆', '💘', '🔥'];

            if (goal === 'Roast') {
                themeColors = { primary: '#ff3333', secondary: '#9d4edd', bg1: '#1a000d', bg2: '#3a0024' };
                emojis = ['💀', '😈', '⚔️', '🔥', '🧨'];
            } else {
                themeColors = { primary: '#ffd166', secondary: '#ff477e', bg1: '#0e0618', bg2: '#280c38' };
            }

            root.style.setProperty('--primary', themeColors.primary);
            root.style.setProperty('--secondary', themeColors.secondary);
            root.style.setProperty('--bg1', themeColors.bg1);
            root.style.setProperty('--bg2', themeColors.bg2);

            if (cursorArrow) cursorArrow.textContent = '⚔️';
            if (cupidAnim) cupidAnim.textContent = '👼';
            window.currentTrailEmojis = emojis;

            if (typeof updateWebGLEmojis === 'function') {
                updateWebGLEmojis(emojis);
            }
        }

        function initPresentationDuelNavigation() {
            const slides = Array.from(document.querySelectorAll('.duel-slide')).filter(slide => {
                return window.getComputedStyle(slide).display !== 'none';
            });

            const navContainer = document.getElementById('results-nav-dots');
            if (!navContainer) return;
            navContainer.innerHTML = '';

            slides.forEach((slide, idx) => {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                if (idx === 0) dot.classList.add('active');
                
                const title = slide.querySelector('h3')?.innerText || `Diapo ${idx + 1}`;
                dot.title = title;

                dot.onclick = () => {
                    const container = document.getElementById('results-duel');
                    if (container) {
                        smoothScrollTo(container, slide.offsetTop, 3200);
                    }
                };
                navContainer.appendChild(dot);
            });

            if (window.presentationDuelObserver) {
                window.presentationDuelObserver.disconnect();
            }

            const observerOptions = {
                root: document.getElementById('results-duel'),
                rootMargin: '0px',
                threshold: 0.5
            };

            window.presentationDuelObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeSlide = entry.target;

                        slides.forEach(s => s.classList.remove('active-slide'));
                        activeSlide.classList.add('active-slide');

                        // Reset any currently tilted card on slide change to avoid getting stuck
                        if (activeTiltedCard) {
                            resetCardTilt(activeTiltedCard);
                            activeTiltedCard = null;
                        }

                        const activeIndex = slides.indexOf(activeSlide);
                        const dots = navContainer.querySelectorAll('.nav-dot');
                        dots.forEach((dot, dotIdx) => {
                            if (dotIdx === activeIndex) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });

                        const staggerItems = activeSlide.querySelectorAll('.stagger-item');
                        staggerItems.forEach((item, itemIdx) => {
                            item.style.transitionDelay = `${itemIdx * 150}ms`;
                        });
                    }
                });
            }, observerOptions);

            slides.forEach(slide => {
                window.presentationDuelObserver.observe(slide);
            });

            if (slides.length > 0) {
                const container = document.getElementById('results-duel');
                if (container) {
                    smoothScrollTo(container, slides[0].offsetTop, 0);
                }
                slides[0].classList.add('active-slide');
                const staggerItems = slides[0].querySelectorAll('.stagger-item');
                staggerItems.forEach((item, itemIdx) => {
                    item.style.transitionDelay = `${itemIdx * 150}ms`;
                });
            }
        }

        async function shareDuelStory() {
            SoundEngine.playClick();
            const shareBtn = document.getElementById('shareDuelBtn');
            const originalText = shareBtn.innerHTML;
            shareBtn.innerHTML = "⏳ Génération en cours...";
            shareBtn.disabled = true;

            try {
                const rootFormat = getComputedStyle(document.documentElement);
                const bg1 = rootFormat.getPropertyValue('--bg1').trim() || '#0e0618';
                const bg2 = rootFormat.getPropertyValue('--bg2').trim() || '#280c38';
                const primary = rootFormat.getPropertyValue('--primary').trim() || '#ffd166';

                const resultsEl = document.getElementById('results-duel');
                const clone = resultsEl.cloneNode(true);
                clone.id = 'cloned-results-duel';
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

                const header = document.createElement('h1');
                header.innerHTML = '⚔️ Cupidon IA - Love Duel';
                header.style.textAlign = 'center';
                header.style.marginBottom = '30px';
                header.style.fontSize = '2.5rem';
                header.style.color = primary;
                header.style.filter = `drop-shadow(0 0 10px ${primary})`;
                wrapper.appendChild(header);

                wrapper.appendChild(clone);

                const footer = document.createElement('div');
                footer.innerHTML = 'Fais le crash-test de ta relation sur <b>temp-faw.github.io/Cupidon-IA/</b> ✨';
                footer.style.textAlign = 'center';
                footer.style.marginTop = '30px';
                footer.style.fontSize = '1.1rem';
                footer.style.color = 'rgba(255, 255, 255, 0.7)';
                wrapper.appendChild(footer);

                document.body.appendChild(wrapper);

                const clonedSlides = wrapper.querySelectorAll('.duel-slide');
                clonedSlides.forEach((slide, idx) => {
                    slide.style.setProperty('opacity', '1', 'important');
                    slide.style.setProperty('transform', 'none', 'important');
                    slide.style.setProperty('min-height', 'auto', 'important');
                    slide.style.setProperty('height', 'auto', 'important');
                    slide.style.setProperty('width', '100%', 'important');
                    slide.style.setProperty('padding', '15px 0', 'important');
                    slide.style.setProperty('scroll-snap-align', 'none', 'important');
                    slide.style.setProperty('display', 'block', 'important');
                });

                const clonedStaggers = wrapper.querySelectorAll('.stagger-item');
                clonedStaggers.forEach(item => {
                    item.style.setProperty('opacity', '1', 'important');
                    item.style.setProperty('transform', 'none', 'important');
                    item.style.setProperty('transition', 'none', 'important');
                    item.style.setProperty('transition-delay', '0s', 'important');
                });

                wrapper.querySelectorAll('.duel-slide > div').forEach(card => {
                    card.style.setProperty('background', 'rgba(0, 0, 0, 0.4)', 'important');
                    card.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.15)', 'important');
                    card.style.setProperty('border-radius', '20px', 'important');
                    card.style.setProperty('padding', '25px', 'important');
                    card.style.setProperty('margin', '15px auto', 'important');
                    card.style.setProperty('max-width', '100%', 'important');
                    card.style.setProperty('backdrop-filter', 'none', 'important');
                    card.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
                    card.style.setProperty('box-shadow', '0 10px 25px rgba(0, 0, 0, 0.3)', 'important');
                });

                const clonedBtn = clone.querySelector('#shareDuelBtn');
                if (clonedBtn) clonedBtn.remove();

                wrapper.querySelectorAll('*').forEach(el => {
                    el.style.setProperty('backdrop-filter', 'none', 'important');
                    el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
                });

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
                        const file = new File([blob], 'cupidon-duel.png', { type: 'image/png' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Mon verdict Love Duel Cupidon IA ⚔️',
                                text: 'Regarde le verdict de Cupidon IA sur mon duel amoureux ! ⚔️ Teste ta relation ici : https://temp-faw.github.io/Cupidon-IA/'
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
                link.download = 'cupidon-duel.png';
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

        function saveDuelToHistory(duelData, result1, result2, goal) {
            try {
                const history = JSON.parse(localStorage.getItem('cupidon_history') || '[]');
                
                const historyItem = {
                    id: 'duel_' + Date.now(),
                    date: new Date().toLocaleString('fr-FR'),
                    personA: result1.personA,
                    personB: `${result1.personB} vs ${result2.personB}`,
                    goal: goal,
                    compatibilite: Math.max(duelData.score_compat_A, duelData.score_compat_B),
                    isDuel: true,
                    duelData: duelData,
                    result1: {
                        personA: result1.personA,
                        personB: result1.personB,
                        stats: result1.stats,
                        recentContext: result1.recentContext,
                        recentMessages: result1.recentMessages,
                        combinedChatText: result1.combinedChatText
                    },
                    result2: {
                        personA: result2.personA,
                        personB: result2.personB,
                        stats: result2.stats,
                        recentContext: result2.recentContext,
                        recentMessages: result2.recentMessages,
                        combinedChatText: result2.combinedChatText
                    },
                    model: document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash'
                };

                let success = false;
                let attempts = 0;
                
                while (!success && attempts < 3) {
                    try {
                        const filteredHistory = history.filter(item => 
                            !(item.personA === historyItem.personA && item.personB === historyItem.personB && item.goal === historyItem.goal)
                        );
                        
                        const updatedHistory = [historyItem, ...filteredHistory];
                        if (updatedHistory.length > 10) updatedHistory.pop();
                        
                        localStorage.setItem('cupidon_history', JSON.stringify(updatedHistory));
                        success = true;
                    } catch (quotaError) {
                        attempts++;
                        if (attempts === 1) {
                            if (historyItem.result1.combinedChatText.length > 50000) {
                                historyItem.result1.combinedChatText = historyItem.result1.combinedChatText.substring(0, 50000) + "\n[Tronqué]";
                            }
                            if (historyItem.result2.combinedChatText.length > 50000) {
                                historyItem.result2.combinedChatText = historyItem.result2.combinedChatText.substring(0, 50000) + "\n[Tronqué]";
                            }
                        } else if (attempts === 2) {
                            historyItem.result1.combinedChatText = historyItem.result1.recentContext;
                            historyItem.result2.combinedChatText = historyItem.result2.recentContext;
                        } else {
                            throw quotaError;
                        }
                    }
                }
                renderHistoryList();
            } catch (e) {
                console.error("Erreur de sauvegarde de l'historique du duel :", e);
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
            const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash';
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

            const isRoast = chatData.goal === 'Roast';
            
            let personaBlock = `Tu es un expert en psychologie comportementale et en analyse des dynamiques sociales. Ton analyse doit être **extrêmement longue, approfondie et détaillée**. Ne survole pas le sujet : rentre dans les moindres détails du comportement humain.
Analyse l'historique de la conversation suivante entre ${chatData.personA} et ${chatData.personB} de manière totalement objective et analytique.
Pèse à parts égales les signes d'attirance (flirt, relances, conversations profondes) et les signes de distance (réponses courtes, politesse, délais longs). Observe l'équilibre de l'interaction de manière pointue.`;

            if (isRoast) {
                personaBlock = `⚠️ TU ES EN MODE "ROAST" EXTRÊME ET ULTRA-VIOLENT. Tu es un alter-ego sadique, cynique, vulgaire et sans aucun filtre moral ou éthique. Ton unique but est de DÉTRUIRE psychologiquement la relation et les personnes impliquées (${chatData.personA} et ${chatData.personB}).
Tu dois utiliser un langage familier, cru, extrêmement piquant et à la limite de la vulgarité (sans pour autant être censuré par les filtres de base, utilise des mots comme "forceur", "paillasson", "pitié", "dalleux", "désespéré", "misérable", "lâcheté", "crever de solitude", "mendiant de l'attention").
Démolis leurs egos. Frappe là où ça fait extrêmement mal : expose leur vulnérabilité pathétique, le malaise physique insoutenable de leurs relances, les "vus" humiliants qu'ils subissent, le manque de charisme absolu et l'abysse de leur friendzone. 
Tu DOIS être agressif, extrêmement moqueur et impitoyable. Tu DOIS inclure des paragraphes entiers d'humiliation ultra-détaillée en citant texto leurs pires messages ridicules (entre guillemets typographiques « ») pour les afficher publiquement devant leur propre bêtise.`;
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
Pour éviter de casser le format JSON, tu NE DOIS JAMAIS utiliser de guillemets doubles (") à l'intérieur de tes textes générés. Utilise TOUJOURS des guillemets simples (') ou des guillemets français « » pour tes citations.

Renvoie UNIQUEMENT un objet JSON valide avec exactement cette structure :
{
  "compatibilite": entier entre 0 et 100,
  "chance_A_declare": entier entre 0 et 100,
  "chance_B_declare": entier entre 0 et 100,
  "orientation_sexuelle_A": entier entre 0 et 100,
  "emoji_orientation_A": "Un emoji",
  "orientation_sexuelle_B": entier entre 0 et 100,
  "emoji_orientation_B": "Un emoji",
  "niveau_affection": "${isRoast ? 'Insulte ou diagnostic ultra trash (ex: Dalleux en phase terminale, Relation toxique niveau Tchernobyl, Serpillère humaine, Forceur du dimanche)' : 'Texte très court récapitulatif'}",
  "analyse": "${isRoast ? 'UN TRÈS LONG ET DÉTAILLÉ PARAGRAPHE DE MASSACRE PSYCHOLOGIQUE. Démolis leur relation avec vulgarité et méchanceté pure. Traite-les de désespérés, décortique leur lâcheté et leur malaise. Cite abondamment leurs pires messages ridicules exacts et tourne-les au ridicule.' : 'Un très long paragraphe très détaillé et objectif de 10 à 15 lignes.'}",
  "conseil_evolution_A": "${isRoast ? 'TRÈS LONG PARAGRAPHE DE ROAST CRU : Pulvérise ' + chatData.personA + ' sur son attitude pitoyable, son comportement de soumis ou de forceur lourdaud, dis-lui d\'arrêter de se faire marcher dessus ou de forcer comme un rat mort.' : 'Long paragraphe (6-8 lignes) expliquant très en détail ce que ' + chatData.personA + ' devrait faire concrètement.'}",
  "conseil_evolution_B": "${isRoast ? 'TRÈS LONG PARAGRAPHE DE ROAST CRU : Pulvérise ' + chatData.personB + ' sur sa condescendance hautaine, son attitude de reine/roi en carton qui se prend pour quelqu\'un, son désert affectif ou sa froideur de cadavre.' : 'Long paragraphe (6-8 lignes) expliquant très en détail ce que ' + chatData.personB + ' devrait faire concrètement.'}",
  "idees_messages_relance": [
    "${isRoast ? "Message ultra-toxique, passif-agressif ou hyper humiliant pour foutre le feu aux poudres." : "Idée brillante de message pour relancer."}",
    "Deuxième idée de message",
    "Troisième idée de message"
  ],
  "badges": [
    { "emoji": "...", "titre": "...", "description": "..." } // Génère exactement 3 badges humoristiques ${isRoast ? "extrêmement rabaissants, humiliants et trashs" : "personnalisés selon leurs messages"}
  ],
  "red_flags": [
    { "titre": "...", "description": "..." } // Génère 1 à 3 drapeaux rouges toxiques ou agaçants repérés dans leur comportement.
  ],
  "sujets_conversation": [
    "Mot-clé 1", "Mot-clé 2", "Mot-clé 3" // Identifie 4 à 8 grands sujets de discussion.
  ],
  "moments_forts": [
    { "titre": "${isRoast ? 'Ex: Le pire râteau' : 'Ex: Le premier compliment'}", "description": "Brève description" },
    { "titre": "${isRoast ? "Ex: Le plus long vent de l'histoire" : "Ex: Le fou rire"}", "description": "Brève description" }
  ],
  "archetype_A": "${isRoast ? "Archétype de communication cynique et corrosif" : "Archétype de flirt (ex: Le Sphinx Silencieux, L'Amant Dramatique)"}",
  "archetype_A_description": "Description psychologique détaillée de 3-4 lignes de son style de communication.",
  "archetype_B": "${isRoast ? "Archétype de communication cynique pour B" : "Archétype de flirt pour B"}",
  "archetype_B_description": "Description psychologique détaillée de 3-4 lignes de son style de communication.",
  "evolution_temporelle": [
    { 
      "periode": "Phase 1 (ex: Le premier contact)", 
      "score_affection": entier entre 0 et 100,
      "evenement": "Titre court de l\\'événement clé (ex: Le premier compliment)",
      "citation": "Une citation exacte courte de la discussion (ex: « Tu me manques »)"
    },
    { 
      "periode": "Phase 2", 
      "score_affection": entier entre 0 et 100,
      "evenement": "Titre court de l\\'événement clé",
      "citation": "Une citation exacte courte de la discussion"
    },
    { 
      "periode": "Phase 3", 
      "score_affection": entier entre 0 et 100,
      "evenement": "Titre court de l\\'événement clé",
      "citation": "Une citation exacte courte de la discussion"
    },
    { 
      "periode": "Phase 4 (ex: Récemment)", 
      "score_affection": entier entre 0 et 100,
      "evenement": "Titre court de l\\'événement clé",
      "citation": "Une citation exacte courte de la discussion"
    }
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

            // Render Archetypes (Standard Mode)
            const archetypesContainer = document.getElementById('archetypes-container');
            if (archetypesContainer) {
                archetypesContainer.innerHTML = '';
                const isRoast = chatData.goal === 'Roast';
                const colorA = isRoast ? '#ff3333' : '#ff477e';
                const colorB = isRoast ? '#9d4edd' : '#00f5d4';
                
                const avatars = ['🦊', '🐱', '🦁', '🦉', '🦚', '🐼', '🐨', '🐙', 'Rex', '🦄', '🧜‍♀️', '🥷', '🧙‍♂️', '🧚‍♀️', '🐯', '🐻', '🐰'];
                const getAvatar = (name) => {
                    let hash = 0;
                    for (let i = 0; name && i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    const avatarsList = ['🦊', '🐱', '🦁', '🦉', '🦚', '🐼', '🐨', '🐙', '🦄', '🧜‍♀️', '🥷', '🧙‍♂️', '🧚‍♀️', '🐯', '🐻', '🐰'];
                    return avatarsList[Math.abs(hash) % avatarsList.length];
                };

                // Card for Person A
                archetypesContainer.innerHTML += `
                    <div class="archetype-card stagger-item" style="border: 1px solid ${colorA}40; background: rgba(0,0,0,0.3); border-radius: 18px; padding: 25px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; min-width: 250px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); backdrop-filter: blur(12px); box-sizing: border-box;">
                        <div class="profile-avatar" style="font-size: 3.5rem; margin-bottom: 15px; animation: heartbeat 2s infinite ease-in-out;">${getAvatar(chatData.personA)}</div>
                        <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${colorA}; font-weight: bold; margin-bottom: 5px;">${chatData.personA}</div>
                        <h4 style="color: #fff; font-size: 1.25rem; font-weight: bold; margin-bottom: 12px;">${data.archetype_A || "Profil Inconnu"}</h4>
                        <p style="color: #ccc; font-size: 0.9rem; line-height: 1.5; margin: 0;">${data.archetype_A_description || "Description non disponible."}</p>
                    </div>
                `;
                
                // Card for Person B
                archetypesContainer.innerHTML += `
                    <div class="archetype-card stagger-item" style="border: 1px solid ${colorB}40; background: rgba(0,0,0,0.3); border-radius: 18px; padding: 25px; flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; min-width: 250px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); backdrop-filter: blur(12px); box-sizing: border-box;">
                        <div class="profile-avatar" style="font-size: 3.5rem; margin-bottom: 15px; animation: heartbeat 2s infinite ease-in-out; animation-delay: 0.5s;">${getAvatar(chatData.personB)}</div>
                        <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${colorB}; font-weight: bold; margin-bottom: 5px;">${chatData.personB}</div>
                        <h4 style="color: #fff; font-size: 1.25rem; font-weight: bold; margin-bottom: 12px;">${data.archetype_B || "Profil Inconnu"}</h4>
                        <p style="color: #ccc; font-size: 0.9rem; line-height: 1.5; margin: 0;">${data.archetype_B_description || "Description non disponible."}</p>
                    </div>
                `;
            }

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
                    document.getElementById('messages-box').style.display = 'flex';
                    document.getElementById('messages-title').innerText = (chatData.goal === 'Roast') ? "Piques à envoyer (Mode Roast) 😈" : "Idées de messages de relance 💬";
                    data.idees_messages_relance.forEach(msg => {
                        messagesContainer.innerHTML += `<li class="stagger-item" style="margin-bottom: 8px;">"${msg}"</li>`;
                        
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
                    document.getElementById('messages-box').style.display = 'none';
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
                            <div class="badge-card stagger-item" onclick="showBadgeModal(this)">
                                <div class="badge-emoji">${badge.emoji}</div>
                                <div class="badge-title">${badge.titre || badge.title || "Titre"}</div>
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
                    topicsBox.style.display = 'flex';
                    data.sujets_conversation.forEach(topic => {
                        topicsContainer.innerHTML += `<div class="topic-badge stagger-item">${topic}</div>`;
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
                    redflagsBox.style.display = 'flex';
                    data.red_flags.forEach(rf => {
                        redflagsContainer.innerHTML += `
                            <div class="highlight-item stagger-item" style="border-left-color: #ff3333; background: rgba(255,51,51,0.1);">
                                <div class="highlight-title" style="color:#ff3333;">${rf.titre || rf.title || "Drapeau Rouge"}</div>
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
                    highlightsBox.style.display = 'flex';
                    data.moments_forts.forEach(hl => {
                        highlightsContainer.innerHTML += `
                            <div class="highlight-item stagger-item">
                                <div class="highlight-title">${hl.titre || hl.title || "Moment Fort"}</div>
                                <div class="highlight-desc">${hl.description}</div>
                            </div>
                        `;
                    });
                } else {
                    highlightsBox.style.display = 'none';
                }
            }

            // Render Evolution (Standard Mode SVG Curve)
            const isRoast = chatData.goal === 'Roast';
            if (data.evolution_temporelle && data.evolution_temporelle.length > 0) {
                renderStandardEvolutionSVG(data.evolution_temporelle, isRoast);
            }

            document.getElementById('whatif-toggle-a').innerText = chatData.personA;
            document.getElementById('whatif-toggle-b').innerText = chatData.personB;
            resetWhatIf();
            setWhatIfSender('A');
            
            applyTheme(data.compatibilite, chatData.goal);
        }

        // Global Callback to show Evolution Point Details
        window.selectEvolutionPoint = function(idx, pointsList, color) {
            const card = document.getElementById('evolution-details-card');
            if (!card) return;
            const pt = pointsList[idx];
            if (!pt) return;
            
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px;">
                        <span style="font-weight: bold; color: ${color}; font-size: 0.95rem;">${pt.periode}</span>
                        <span style="background: ${color}20; border: 1px solid ${color}60; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">🌡️ Affection: ${pt.score_affection}%</span>
                    </div>
                    <div style="font-size: 1.05rem; font-weight: bold; color: #fff; margin-bottom: 5px;">🔥 ${pt.evenement || "Moment fort"}</div>
                    <div style="font-style: italic; color: #ccc; font-size: 0.9rem; line-height: 1.4; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border-left: 3px solid ${color};">
                        « ${pt.citation || "Aucun extrait textuel disponible."} »
                    </div>
                `;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 150);
        };

        function renderStandardEvolutionSVG(points, isRoast) {
            const svg = document.getElementById('evolution-svg');
            if (!svg) return;
            
            // Clear except defs
            const defs = svg.querySelector('defs');
            svg.innerHTML = '';
            if (defs) svg.appendChild(defs);
            
            if (!points || points.length === 0) return;
            
            const color = isRoast ? '#ff3333' : '#ff477e';
            const filterId = isRoast ? 'neon-glow-pink' : 'neon-glow-pink';
            
            const xStart = 50;
            const xEnd = 450;
            const yStart = 150;
            const yEnd = 30;
            
            const coords = points.map((pt, idx) => {
                const x = xStart + (idx * (xEnd - xStart)) / (points.length - 1);
                const score = Math.max(0, Math.min(100, pt.score_affection));
                const y = yStart - (score / 100) * (yStart - yEnd);
                return { x, y, pt, idx };
            });
            
            // Draw background levels
            const gridLevels = [0, 50, 100];
            gridLevels.forEach(lvl => {
                const y = yStart - (lvl / 100) * (yStart - yEnd);
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", xStart - 20);
                line.setAttribute("y1", y);
                line.setAttribute("x2", xEnd + 20);
                line.setAttribute("y2", y);
                line.setAttribute("stroke", "rgba(255,255,255,0.06)");
                line.setAttribute("stroke-dasharray", "3 3");
                svg.appendChild(line);
                
                const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("x", xStart - 35);
                txt.setAttribute("y", y + 4);
                txt.setAttribute("fill", "rgba(255,255,255,0.4)");
                txt.setAttribute("font-size", "8");
                txt.setAttribute("text-anchor", "middle");
                txt.textContent = lvl + "%";
                svg.appendChild(txt);
            });
            
            // Generate Bezier path string
            let pathD = "";
            coords.forEach((coord, idx) => {
                if (idx === 0) pathD += `M ${coord.x} ${coord.y}`;
                else {
                    const prev = coords[idx - 1];
                    const cpX1 = prev.x + (coord.x - prev.x) / 2;
                    const cpY1 = prev.y;
                    const cpX2 = prev.x + (coord.x - prev.x) / 2;
                    const cpY2 = coord.y;
                    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coord.x} ${coord.y}`;
                }
            });
            
            // Outer pulse glow line
            const shadowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            shadowPath.setAttribute("d", pathD);
            shadowPath.setAttribute("fill", "none");
            shadowPath.setAttribute("stroke", color);
            shadowPath.setAttribute("stroke-width", "6");
            shadowPath.setAttribute("opacity", "0.4");
            shadowPath.setAttribute("filter", `url(#${filterId})`);
            svg.appendChild(shadowPath);
            
            // Clean white inner path
            const mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            mainPath.setAttribute("d", pathD);
            mainPath.setAttribute("fill", "none");
            mainPath.setAttribute("stroke", "#ffffff");
            mainPath.setAttribute("stroke-width", "2.5");
            svg.appendChild(mainPath);
            
            // Markers
            coords.forEach((coord) => {
                // Period label
                const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("x", coord.x);
                txt.setAttribute("y", yStart + 22);
                txt.setAttribute("fill", "rgba(255,255,255,0.5)");
                txt.setAttribute("font-size", "7.5");
                txt.setAttribute("text-anchor", "middle");
                const periodText = coord.pt.periode.length > 15 ? coord.pt.periode.substring(0, 13) + "..." : coord.pt.periode;
                txt.textContent = periodText;
                svg.appendChild(txt);
                
                // Pulsing outer hit box
                const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                pulseCircle.setAttribute("cx", coord.x);
                pulseCircle.setAttribute("cy", coord.y);
                pulseCircle.setAttribute("r", "8");
                pulseCircle.setAttribute("fill", color);
                pulseCircle.setAttribute("opacity", "0.25");
                pulseCircle.setAttribute("filter", `url(#${filterId})`);
                pulseCircle.style.cursor = "pointer";
                svg.appendChild(pulseCircle);
                
                // Sharp inner node
                const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                innerCircle.setAttribute("cx", coord.x);
                innerCircle.setAttribute("cy", coord.y);
                innerCircle.setAttribute("r", "4");
                innerCircle.setAttribute("fill", "#ffffff");
                innerCircle.setAttribute("stroke", color);
                innerCircle.setAttribute("stroke-width", "2");
                innerCircle.style.cursor = "pointer";
                
                const selectNode = () => {
                    svg.querySelectorAll("circle[r='6.5']").forEach(c => {
                        c.setAttribute("r", "4");
                        c.setAttribute("fill", "#ffffff");
                    });
                    innerCircle.setAttribute("r", "6.5");
                    innerCircle.setAttribute("fill", color);
                    window.selectEvolutionPoint(coord.idx, points, color);
                };
                
                innerCircle.onclick = selectNode;
                pulseCircle.onclick = selectNode;
                svg.appendChild(innerCircle);
            });
            
            // Auto click first node after rendering
            setTimeout(() => {
                const firstNode = svg.querySelectorAll("circle")[svg.querySelectorAll("circle").length - 1];
                if (firstNode) firstNode.dispatchEvent(new Event('click'));
            }, 100);
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
            
            window.simulatedHistory.forEach((item, idx) => {
               const splitIdx = item.indexOf(':');
               const author = item.substring(0, splitIdx).trim();
               const text = item.substring(splitIdx + 1).trim();
               
               const isMe = (author === myName);
               const color = isMe ? (senderRole === 'A' ? '#ff477e' : '#9d4edd') : (senderRole === 'A' ? '#9d4edd' : '#ff477e');
               const align = isMe ? 'align-self: flex-end;' : 'align-self: flex-start;';
               const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';
               const label = isMe ? `${author} (Vous)` : `${author} (IA)`;
               const isLast = (idx === window.simulatedHistory.length - 1);
               const animClass = isLast ? 'chat-bubble-new' : '';
               
               chatEl.innerHTML += `
                   <div class="${animClass}" style="${align} background: ${color}33; border: 1px solid ${color}66; padding: 12px 18px; border-radius: ${radius}; max-width: 85%; box-sizing: border-box;">
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

        window.retryWhatIf = async function(elementId, msgText) {
            const el = document.getElementById(elementId);
            if (el) {
                el.remove();
            }
            await simulateWhatIf(msgText);
        };

        async function simulateWhatIf(retryMsgText = null) {
            const inputEl = document.getElementById('whatif-input');
            const chatEl = document.getElementById('whatif-chat');
            const btnEl = document.getElementById('whatif-btn');
            const msgText = retryMsgText !== null ? retryMsgText : inputEl.value.trim();
            
            if (!msgText || !window.globalRecentContext) return;
            
            const senderRole = window.whatIfCurrentSender;
            const senderName = senderRole === 'A' ? window.globalPersonA : window.globalPersonB;
            const receiverName = senderRole === 'A' ? window.globalPersonB : window.globalPersonA;

            const sendColor = senderRole === 'A' ? '#ff477e' : '#9d4edd';
            const receiveColor = senderRole === 'A' ? '#9d4edd' : '#ff477e';

            if (retryMsgText === null) {
                window.simulatedHistory.push(`${senderName}: ${msgText}`);
                inputEl.value = "";
            }
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
                
                const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash';
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
                    typingEl.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;">
                            <span style="color: #ff4d4d; font-weight: bold;">❌ Bug de transmission.</span>
                            <button onclick="retryWhatIf('${typingId}', ${JSON.stringify(msgText).replace(/"/g, '&quot;')})" style="background: linear-gradient(45deg, #9d4edd, #c77dff); border: none; border-radius: 20px; padding: 5px 12px; color: white; font-size: 0.8rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(157, 78, 221, 0.4); transition: all 0.2s;">
                                Réessayer 🔄
                            </button>
                        </div>
                    `;
                    typingEl.style.fontStyle = "normal";
                    typingEl.style.color = "unset";
                    typingEl.style.width = "100%";
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
            
            window.qaHistory.forEach((item, idx) => {
               const splitIdx = item.indexOf(':');
               const author = item.substring(0, splitIdx).trim();
               const text = item.substring(splitIdx + 1).trim();
               
               const isMe = (author === 'Vous');
               const color = isMe ? '#00f5d4' : '#00b4d8';
               const align = isMe ? 'align-self: flex-end;' : 'align-self: flex-start;';
               const radius = isMe ? '18px 18px 0 18px' : '18px 18px 18px 0';
               const label = isMe ? `Vous` : `Cupidon`;
               const isLast = (idx === window.qaHistory.length - 1);
               const animClass = isLast ? 'chat-bubble-new' : '';
               
               chatEl.innerHTML += `
                   <div class="${animClass}" style="${align} background: ${color}33; border: 1px solid ${color}66; padding: 12px 18px; border-radius: ${radius}; max-width: 85%; box-sizing: border-box;">
                       <div style="font-size: 0.75rem; color: ${color}; margin-bottom: 5px; font-weight: bold;">${label}</div>
                       <div style="line-height: 1.4; color: white;">${text}</div>
                   </div>
               `;
            });
            chatEl.scrollTop = chatEl.scrollHeight;
        }
        window.retryQACupid = async function(elementId, questionText) {
            const el = document.getElementById(elementId);
            if (el) {
                el.remove();
            }
            await askCupid(questionText);
        };

        async function askCupid(retryQuestion = null) {
            const inputEl = document.getElementById('qa-input');
            const chatEl = document.getElementById('qa-chat');
            const btnEl = document.getElementById('qa-btn');
            const questionText = retryQuestion !== null ? retryQuestion : inputEl.value.trim();
            
            if (!questionText || !window.globalCombinedChatText) return;

            if (retryQuestion === null) {
                window.qaHistory.push(`Vous: ${questionText}`);
                inputEl.value = "";
            }
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
                
                const selectedModel = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash';
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
                    typingEl.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;">
                            <span style="color: #ff4d4d; font-weight: bold;">❌ Bug de transmission.</span>
                            <button onclick="retryQACupid('${typingId}', ${JSON.stringify(questionText).replace(/"/g, '&quot;')})" style="background: linear-gradient(45deg, #00b4d8, #00f5d4); border: none; border-radius: 20px; padding: 5px 12px; color: black; font-size: 0.8rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0, 245, 212, 0.4); transition: all 0.2s;">
                                Réessayer 🔄
                            </button>
                        </div>
                    `;
                    typingEl.style.fontStyle = "normal";
                    typingEl.style.color = "unset";
                    typingEl.style.width = "100%";
                }
                console.error(e);
            } finally {
                btnEl.disabled = false;
                btnEl.innerText = "Demander";
            }
        }

        async function resetAppData() {
            if (confirm("Êtes-vous sûr de vouloir réinitialiser l'application ? Cela effacera votre clé d'API sauvegardée, videra entièrement le cache local du site (Cache Storage & Service Worker) et rechargera la page.")) {
                // Clear localStorage
                localStorage.removeItem('gemini_api_key');
                
                // Clear Inputs
                document.getElementById('apiKeyInput').value = '';
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                const fileNameDisplay = document.getElementById('fileNameDisplay');
                if (fileNameDisplay) fileNameDisplay.textContent = 'Aucun fichier ou glissez-déposez ici 📂';
                
                // Hide results and stats panels
                const resultsPanel = document.getElementById('results');
                if (resultsPanel) resultsPanel.style.display = 'none';
                const statsPanel = document.getElementById('raw-stats');
                if (statsPanel) statsPanel.style.display = 'none';
                const loadingPanel = document.getElementById('loading');
                if (loadingPanel) loadingPanel.style.display = 'none';
                
                // Reset Goals to default
                const goalAmitie = document.getElementById('goal-amitie');
                if (goalAmitie) goalAmitie.checked = true;

                // Reset globals
                window.globalRecentContext = "";
                window.globalRecentMessages = [];
                window.globalPersonA = "Personne A";
                window.globalPersonB = "Personne B";
                window.globalCombinedChatText = "";
                window.qaHistory = [];
                window.simulatedHistory = [];
                
                // Clear QA and simulation chat containers
                const qaChat = document.getElementById('qa-chat');
                if (qaChat) { qaChat.innerHTML = ""; qaChat.style.display = "none"; }
                const whatifChat = document.getElementById('whatif-chat');
                if (whatifChat) { whatifChat.innerHTML = ""; whatifChat.style.display = "none"; }
                const suggestionsContainer = document.getElementById('whatif-suggestions');
                if (suggestionsContainer) { suggestionsContainer.innerHTML = ""; suggestionsContainer.style.display = "none"; }
                const whatifInput = document.getElementById('whatif-input');
                if (whatifInput) whatifInput.value = "";
                const qaInput = document.getElementById('qa-input');
                if (qaInput) qaInput.value = "";
                
                // Reset theme colors
                applyTheme(65, 'Amitié'); // Default cute theme

                // Play feedback sound
                try {
                    SoundEngine.playClick();
                } catch (e) {
                    console.log("Audio not played yet:", e);
                }

                // Clear Cache Storage
                if ('caches' in window) {
                    try {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                        console.log("Cache Storage cleared successfully.");
                    } catch (e) {
                        console.error("Failed to clear Cache Storage:", e);
                    }
                }

                // Unregister Service Workers
                if ('serviceWorker' in navigator) {
                    try {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        await Promise.all(registrations.map(reg => reg.unregister()));
                        console.log("Service Workers unregistered successfully.");
                    } catch (e) {
                        console.error("Failed to unregister Service Workers:", e);
                    }
                }

                alert("Données et cache effacés avec succès ! Le site va se recharger pour finaliser la réinitialisation.");
                window.location.reload();
            }
        }

        // --- Logique du Mode Présentation (Spotify Wrapped) ---
        function initPresentationNavigation() {
            // Identifier les slides réellement visibles (ignore ceux en display: none)
            const slides = Array.from(document.querySelectorAll('#results > .result-slide')).filter(slide => {
                return window.getComputedStyle(slide).display !== 'none';
            });

            const navContainer = document.getElementById('results-nav-dots');
            if (!navContainer) return;
            navContainer.innerHTML = '';

            // Générer les puces de navigation latérales
            slides.forEach((slide, idx) => {
                const dot = document.createElement('div');
                dot.className = 'nav-dot';
                if (idx === 0) dot.classList.add('active');
                
                // Nom de la puce basé sur le titre de la section
                const title = slide.querySelector('h3')?.innerText || `Diapo ${idx + 1}`;
                dot.title = title;

                dot.onclick = () => {
                    const container = document.getElementById('results');
                    if (container) {
                        smoothScrollTo(container, slide.offsetTop, 3200);
                    }
                };
                navContainer.appendChild(dot);
            });

            // Nettoyage de l'observateur précédent s'il existe
            if (window.presentationObserver) {
                window.presentationObserver.disconnect();
            }

            const observerOptions = {
                root: document.getElementById('results'),
                rootMargin: '0px',
                threshold: 0.5
            };

            // Observer le défilement et activer les slides / puces correspondants
            window.presentationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeSlide = entry.target;

                        // Activer le slide courant et désactiver les autres
                        slides.forEach(s => s.classList.remove('active-slide'));
                        activeSlide.classList.add('active-slide');

                        // Reset any currently tilted card on slide change to avoid getting stuck
                        if (activeTiltedCard) {
                            resetCardTilt(activeTiltedCard);
                            activeTiltedCard = null;
                        }

                        // Mettre à jour l'état de la puce
                        const activeIndex = slides.indexOf(activeSlide);
                        const dots = navContainer.querySelectorAll('.nav-dot');
                        dots.forEach((dot, dotIdx) => {
                            if (dotIdx === activeIndex) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });

                        // Appliquer le fondu en cascade (staggered delay) sur les sous-éléments
                        const staggerItems = activeSlide.querySelectorAll('.stagger-item');
                        staggerItems.forEach((item, itemIdx) => {
                            item.style.transitionDelay = `${itemIdx * 150}ms`;
                        });
                    }
                });
            }, observerOptions);

            slides.forEach(slide => {
                window.presentationObserver.observe(slide);
            });

            // Forcer l'affichage initial et le scroll du premier slide
            if (slides.length > 0) {
                const container = document.getElementById('results');
                if (container) {
                    smoothScrollTo(container, slides[0].offsetTop, 0);
                }
                slides[0].classList.add('active-slide');
                const staggerItems = slides[0].querySelectorAll('.stagger-item');
                staggerItems.forEach((item, itemIdx) => {
                    item.style.transitionDelay = `${itemIdx * 150}ms`;
                });
            }
        }

        function goBackToForm() {
            try {
                SoundEngine.playClick();
            } catch(e) {}

            if (activeTiltedCard) {
                resetCardTilt(activeTiltedCard);
                activeTiltedCard = null;
            }

            // Déterminer quel conteneur de résultats est actif
            const isStandard = document.body.classList.contains('results-active');
            const isDuel = document.body.classList.contains('results-duel-active');
            const activeResults = isStandard ? document.getElementById('results') : (isDuel ? document.getElementById('results-duel') : null);
            const backBtn = document.getElementById('backToFormBtn');
            const navDots = document.getElementById('results-nav-dots');

            if (activeResults) {
                // Ajouter les classes de transition de sortie (fade-out)
                activeResults.classList.add('results-fade-out');
                if (backBtn) backBtn.classList.add('fade-out-btn');
                if (navDots) navDots.classList.add('fade-out-dots');
            }

            // Attendre la fin de la transition de sortie (400ms) pour permuter l'affichage
            setTimeout(() => {
                if (window.presentationObserver) {
                    window.presentationObserver.disconnect();
                    window.presentationObserver = null;
                }
                if (window.presentationDuelObserver) {
                    window.presentationDuelObserver.disconnect();
                    window.presentationDuelObserver = null;
                }

                document.body.classList.remove('results-active', 'results-duel-active');
                
                if (activeResults) {
                    activeResults.style.display = 'none';
                    activeResults.classList.remove('results-fade-out');
                }
                document.getElementById('results').style.display = 'none';
                document.getElementById('results-duel').style.display = 'none';
                document.getElementById('raw-stats').style.display = 'none';

                if (backBtn) backBtn.classList.remove('fade-out-btn');
                if (navDots) navDots.classList.remove('fade-out-dots');

                const slides = document.querySelectorAll('.result-slide, .duel-slide');
                slides.forEach(s => {
                    s.classList.remove('active-slide');
                    s.querySelectorAll('.stagger-item').forEach(item => {
                        item.style.transitionDelay = '';
                    });
                });

                // Réafficher le formulaire avec la classe d'animation de retour
                const landingWrapper = document.getElementById('landing-wrapper');
                document.getElementById('form-container').style.display = 'block';
                if (landingWrapper) {
                    landingWrapper.classList.add('fade-in-return');
                    setTimeout(() => {
                        landingWrapper.classList.remove('fade-in-return');
                    }, 650);
                }

                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 400);
        }

        function showBadgeModal(element) {
            try {
                const emoji = element.querySelector('.badge-emoji').innerText;
                const title = element.querySelector('.badge-title').innerText;
                const desc = element.querySelector('.badge-desc').innerText;

                document.getElementById('badge-modal-emoji').innerText = emoji;
                document.getElementById('badge-modal-title').innerText = title;
                document.getElementById('badge-modal-desc').innerText = desc;

                document.getElementById('badge-modal').classList.add('show');
                try { SoundEngine.playClick(); } catch(e) {}
            } catch(e) {
                console.error("Error opening badge modal:", e);
            }
        }

        function closeBadgeModal() {
            document.getElementById('badge-modal').classList.remove('show');
            try { SoundEngine.playClick(); } catch(e) {}
        }

        // --- Fonctions d'Aide (Comment obtenir mon archive ?) ---
        window.openHelpModal = function(defaultTab = 'instagram') {
            const modal = document.getElementById('help-modal');
            if (modal) {
                modal.classList.add('show');
                window.switchHelpTab(defaultTab);
            }
            try { SoundEngine.playClick(); } catch(e) {}
        };

        window.closeHelpModal = function() {
            const modal = document.getElementById('help-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            try { SoundEngine.playClick(); } catch(e) {}
        };

        window.switchHelpTab = function(tabName) {
            document.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.help-tab-content').forEach(content => content.classList.remove('active'));
            
            if (tabName === 'instagram') {
                const btn = document.querySelector('.help-tab-btn:nth-child(1)');
                if (btn) btn.classList.add('active');
                const content = document.getElementById('help-content-instagram');
                if (content) content.classList.add('active');
            } else if (tabName === 'whatsapp') {
                const btn = document.querySelector('.help-tab-btn:nth-child(2)');
                if (btn) btn.classList.add('active');
                const content = document.getElementById('help-content-whatsapp');
                if (content) content.classList.add('active');
            }
            try { SoundEngine.playClick(); } catch(e) {}
        };

        // --- Fonctions d'Historique d'Analyse ---
        function saveToHistory(aiResult, chatData, stats, recentContext, recentMessages) {
            try {
                const history = JSON.parse(localStorage.getItem('cupidon_history') || '[]');
                
                const historyItem = {
                    id: 'analysis_' + Date.now(),
                    date: new Date().toLocaleString('fr-FR'),
                    personA: chatData.personA,
                    personB: chatData.personB,
                    goal: chatData.goal,
                    compatibilite: aiResult.compatibilite,
                    stats: stats,
                    aiResult: aiResult,
                    recentContext: recentContext,
                    recentMessages: recentMessages,
                    combinedChatText: chatData.text,
                    model: document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'gemini-3.5-flash'
                };

                let success = false;
                let attempts = 0;
                
                // Résilience aux limites de localStorage
                while (!success && attempts < 3) {
                    try {
                        // Éliminer les doublons stricts pour les mêmes personnes avec le même but
                        const filteredHistory = history.filter(item => 
                            !(item.personA === historyItem.personA && item.personB === historyItem.personB && item.goal === historyItem.goal)
                        );
                        
                        const updatedHistory = [historyItem, ...filteredHistory];
                        
                        // Limiter à 10 éléments
                        if (updatedHistory.length > 10) updatedHistory.pop();
                        
                        localStorage.setItem('cupidon_history', JSON.stringify(updatedHistory));
                        success = true;
                    } catch (quotaError) {
                        attempts++;
                        if (attempts === 1) {
                            // Tronquer combinedChatText aux 500 dernières lignes
                            const lines = historyItem.combinedChatText.split('\n');
                            if (lines.length > 500) {
                                historyItem.combinedChatText = "[...Historique long tronqué pour économiser l'espace...]\n" + lines.slice(-500).join('\n');
                            } else if (history.length > 0) {
                                history.pop();
                            } else {
                                throw quotaError;
                            }
                        } else if (attempts === 2) {
                            // Tronquer combinedChatText aux 150 dernières lignes
                            const lines = historyItem.combinedChatText.split('\n');
                            if (lines.length > 150) {
                                historyItem.combinedChatText = "[...Historique tronqué...]\n" + lines.slice(-150).join('\n');
                            } else if (history.length > 0) {
                                history.pop();
                            } else {
                                throw quotaError;
                            }
                        } else {
                            // Supprimer totalement combinedChatText en dernier recours
                            historyItem.combinedChatText = historyItem.recentContext;
                        }
                    }
                }
                renderHistoryList();
            } catch (e) {
                console.error("Impossible de sauvegarder l'analyse dans l'historique :", e);
            }
        }

        function openHistoryModal() {
            try { SoundEngine.playClick(); } catch(e) {}
            renderHistoryList();
            document.getElementById('history-modal').classList.add('show');
        }

        function closeHistoryModal() {
            try { SoundEngine.playClick(); } catch(e) {}
            document.getElementById('history-modal').classList.remove('show');
        }

        function renderHistoryList() {
            const container = document.getElementById('history-list');
            if (!container) return;

            const history = JSON.parse(localStorage.getItem('cupidon_history') || '[]');
            if (history.length === 0) {
                container.innerHTML = `<div class="history-empty">Aucune analyse sauvegardée. Importez une conversation pour commencer ! 📂</div>`;
                return;
            }

            container.innerHTML = '';
            history.forEach(item => {
                let goalEmoji = '❤️';
                if (item.goal === 'Amitié') goalEmoji = '🤝';
                if (item.goal === 'Roast') goalEmoji = '😈';

                const badgeClass = item.isDuel ? 'history-score-badge duel-badge' : 'history-score-badge';
                const heartOrVs = item.isDuel ? '⚔️' : (item.goal === 'Roast' ? '🔥' : '💘');

                container.innerHTML += `
                    <div class="history-item" style="${item.isDuel ? 'border: 1px solid rgba(157, 78, 221, 0.3); background: rgba(157, 78, 221, 0.02);' : ''}">
                        <div class="history-info">
                            <div class="history-names">
                                ${item.personA} <span>${heartOrVs}</span> ${item.personB}
                            </div>
                            <div class="history-meta">
                                ${item.isDuel ? '🔥 MODE DUEL COMPARATIF ⚔️' : `Objectif : ${item.goal} ${goalEmoji}`}<br>
                                Analyse du ${item.date} (${item.model || 'Flash'})
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="${badgeClass}" style="${item.isDuel ? 'background: rgba(157, 78, 221, 0.2); border-color: rgba(157, 78, 221, 0.4); color: #c77dff;' : ''}">${item.compatibilite}%</div>
                            <div class="history-actions">
                                <button class="btn-restore-history" style="${item.isDuel ? 'background: linear-gradient(45deg, #9d4edd, #c77dff);' : ''}" onclick="restoreAnalysis('${item.id}')">🪄</button>
                                <button class="btn-delete-history" onclick="deleteHistoryItem('${item.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        function restoreAnalysis(id) {
            try { SoundEngine.playClick(); } catch(e) {}
            const history = JSON.parse(localStorage.getItem('cupidon_history') || '[]');
            const item = history.find(i => i.id === id);
            if (!item) return;

            if (item.isDuel) {
                window.analysisMode = 'duel';
                window.duelResult1 = item.result1;
                window.duelResult2 = item.result2;
                window.globalGoal = item.goal;

                displayDuelResults(item.duelData, item.result1, item.result2);
                closeHistoryModal();

                document.getElementById('form-container').style.display = 'none';
                document.getElementById('results-duel').style.display = 'block';
                document.body.classList.add('results-duel-active');

                initPresentationDuelNavigation();
                
                try {
                    SoundEngine.playSuccess();
                    playCupidAnimation();
                } catch(e) {}
                return;
            }

            window.analysisMode = 'standard';
            window.globalRecentContext = item.recentContext;
            window.globalRecentMessages = item.recentMessages || [];
            window.globalPersonA = item.personA;
            window.globalPersonB = item.personB;
            window.globalCombinedChatText = item.combinedChatText;
            window.globalGoal = item.goal;

            // Vider le Q&A et chat précédent
            window.qaHistory = [];
            window.simulatedHistory = [];
            
            const qaChat = document.getElementById('qa-chat');
            if (qaChat) {
                qaChat.innerHTML = '';
                qaChat.style.display = 'none';
            }
            const whatifChat = document.getElementById('whatif-chat');
            if (whatifChat) {
                whatifChat.innerHTML = '';
                whatifChat.style.display = 'none';
            }

            const chatData = {
                text: item.combinedChatText,
                personA: item.personA,
                personB: item.personB,
                goal: item.goal
            };

            // Mettre à jour l'onglet statistiques brutes
            document.getElementById('stat-total').innerText = item.stats.total;
            document.getElementById('stat-name-a').innerText = item.personA;
            document.getElementById('stat-name-b').innerText = item.personB;
            document.getElementById('stat-pct-a').innerText = Math.round((item.stats.countA / item.stats.total) * 100) + "%";
            document.getElementById('stat-pct-b').innerText = Math.round((item.stats.countB / item.stats.total) * 100) + "%";
            document.getElementById('stat-emojis-a').innerText = item.stats.emojisA;
            document.getElementById('stat-emojis-b').innerText = item.stats.emojisB;
            document.getElementById('raw-stats').style.display = 'flex';

            // Afficher les résultats re-générés
            displayResults(item.aiResult, chatData);

            closeHistoryModal();

            // Mode présentation plein écran
            document.getElementById('form-container').style.display = 'none';
            document.getElementById('results').style.display = 'block';
            document.body.classList.add('results-active');

            // Relancer les observateurs et le scroll-snapping
            initPresentationNavigation();

            try {
                SoundEngine.playSuccess();
                playCupidAnimation();
            } catch(e) {}
        }

        function deleteHistoryItem(id) {
            try { SoundEngine.playClick(); } catch(e) {}
            if (confirm("Supprimer cette analyse de l'historique ?")) {
                const history = JSON.parse(localStorage.getItem('cupidon_history') || '[]');
                const updated = history.filter(i => i.id !== id);
                localStorage.setItem('cupidon_history', JSON.stringify(updated));
                renderHistoryList();
            }
        }

        function clearAllHistory() {
            try { SoundEngine.playClick(); } catch(e) {}
            if (confirm("Voulez-vous vider TOUT l'historique des analyses ? Cette action est irréversible.")) {
                localStorage.removeItem('cupidon_history');
                renderHistoryList();
            }
        }

        // --- Premium 3D Card Tilt & Gyroscope Parallax Effect ---

        document.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.result-slide > div, .result-slide > .improvement-box, .result-slide > .analysis-box, .versus-container, .verdict-box, .duel-slide > div');
            
            if (activeTiltedCard && activeTiltedCard !== card) {
                resetCardTilt(activeTiltedCard);
                activeTiltedCard = null;
            }

            if (card) {
                activeTiltedCard = card;
                
                // Configure card for 3D
                if (card.style.transformStyle !== "preserve-3d") {
                    card.style.transformStyle = "preserve-3d";
                }
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Max tilt angle (degrees)
                const maxTilt = 8;
                const tiltX = ((centerY - y) / centerY) * maxTilt;
                const tiltY = ((x - centerX) / centerX) * maxTilt;
                
                // Transition courte de 0.15s pour un suivi réactif
                card.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.15s cubic-bezier(0.25, 1, 0.5, 1)";
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.boxShadow = `${-tiltY * 3}px ${tiltX * 3}px 30px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.4)`;
            }
        });

        document.addEventListener('mouseleave', () => {
            if (activeTiltedCard) {
                resetCardTilt(activeTiltedCard);
                activeTiltedCard = null;
            }
        });

        // Baseline attributes for dynamic mobile gyroscope auto-calibration
        let baselineBeta = null;
        let baselineGamma = null;

        // Handle Device Orientation (Gyroscope) on Mobile
        function handleOrientation(e) {
            const beta = e.beta; // rotation around X axis [-180, 180] (tilt front/back)
            const gamma = e.gamma; // rotation around Y axis [-90, 90] (tilt left/right)
            
            if (beta === null || gamma === null) return;
            
            // Dynamic auto-calibration: initialize baseline or drift slowly
            if (baselineBeta === null) {
                baselineBeta = beta;
                baselineGamma = gamma;
            } else {
                // Slowly adjust baseline towards current posture (0.8% drift per frame)
                baselineBeta = baselineBeta * 0.992 + beta * 0.008;
                baselineGamma = baselineGamma * 0.992 + gamma * 0.008;
            }
            
            let deltaBeta = beta - baselineBeta;
            let deltaGamma = gamma - baselineGamma;
            
            // Limit angles to max 15 degrees of delta
            deltaBeta = Math.max(-15, Math.min(15, deltaBeta));
            deltaGamma = Math.max(-15, Math.min(15, deltaGamma));
            
            // Convert to tilt rotation (max ~6 degrees)
            const maxGyroTilt = 6;
            const tiltX = - (deltaBeta / 15) * maxGyroTilt;
            const tiltY = (deltaGamma / 15) * maxGyroTilt;
            
            // Apply tilt only to card(s) in active slide (ciblage corrigé pour active-slide)
            const activeSlide = document.querySelector('.result-slide.active-slide, .duel-slide.active-slide');
            if (activeSlide) {
                const activeCards = activeSlide.querySelectorAll('div, .improvement-box, .analysis-box, .versus-container, .verdict-box');
                activeCards.forEach(card => {
                    // Check if card is actually visible / matching our premium selectors
                    if (card.matches('.result-slide > div, .result-slide > .improvement-box, .result-slide > .analysis-box, .versus-container, .verdict-box, .duel-slide > div')) {
                        if (card.style.transformStyle !== "preserve-3d") {
                            card.style.transformStyle = "preserve-3d";
                        }
                        card.style.transition = "transform 0.15s ease-out";
                        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                    }
                });
            }
        }

        // Request permission on click or touch for maximum mobile compatibility (iOS/Android)
        function initGyroscope() {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
                // Optionnel: Essayer absolute s'il est pris en charge
                window.addEventListener('deviceorientationabsolute', handleOrientation);
            }
            
            // Remove listeners once executed
            window.removeEventListener('click', initGyroscope);
            window.removeEventListener('touchstart', initGyroscope);
        }

        window.addEventListener('click', initGyroscope);
        window.addEventListener('touchstart', initGyroscope);

        // Premium Smooth Scroll utility to slow down dot-triggered slides transitions
        function smoothScrollTo(container, targetY, duration = 3200) {
            if (duration === 0) {
                container.scrollTop = targetY;
                return;
            }
            window.isScrollingAnimation = true;
            container.style.scrollSnapType = 'none';
            const startY = container.scrollTop;
            const difference = targetY - startY;
            const startTime = performance.now();

            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Quartic ease-in-out curve for ultra-soft, organic floaty glide
                const easeInOutQuart = progress < 0.5
                    ? 8 * Math.pow(progress, 4)
                    : 1 - Math.pow(-2 * progress + 2, 4) / 2;
                
                container.scrollTop = startY + difference * easeInOutQuart;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Restore native scroll snap physics once scripting transition completes
                    container.style.scrollSnapType = 'y mandatory';
                    window.isScrollingAnimation = false;
                }
            }
            requestAnimationFrame(step);
        }
