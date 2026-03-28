self.addEventListener('message', async (e) => {
    const { filesData } = e.data;
    
    let combinedChatText = "";
    let globalNames = new Set();
    let allMessages = [];

    // On parcourt les contenus de fichiers passés
    for (const file of filesData) {
        const { name, content } = file;
        const extension = name.split('.').pop().toLowerCase();
        
        let extractedData;
        if (extension === 'html') {
            extractedData = extractInstagramHTML(content);
        } else if (extension === 'txt') {
            extractedData = extractWhatsAppTXT(content);
        } else {
            continue; // Unsupported format via file drop, ignore
        }

        combinedChatText += extractedData.text + "\n";
        allMessages = allMessages.concat(extractedData.messages);
        extractedData.names.forEach(n => globalNames.add(n));
        
        // Notify progress if needed
        self.postMessage({ type: 'progress', message: `Fichier ${name} analysé...` });
    }

    if (allMessages.length === 0) {
        self.postMessage({ type: 'error', message: "Impossible de trouver des messages. Assurez-vous d'importer un fichier HTML Instagram ou TXT WhatsApp valide." });
        return;
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

    if (combinedChatText.length > 500000) {
        // Garder les N derniers messages plus pertinents est parfois mieux, ou tronquer.
        combinedChatText = combinedChatText.substring(combinedChatText.length - 500000); 
    }

    self.postMessage({
        type: 'success',
        result: {
            combinedChatText,
            personA,
            personB,
            stats,
            // Keep recent context for "What If" simulation (last 50 messages)
            recentContext: allMessages.slice(-50).map(m => `${m.author}: ${m.text}`).join('\n')
        }
    });
});

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

function extractInstagramHTML(htmlString) {
    // Dans un worker, pas de DOMParser. On utilise des regex robustes pour le format Instagram.
    // Structure: <div class="pam _3-95 _2ph- _a6-g"> ... <div class="_3-94 _2lem">Author</div> OR <h2>Author</h2> ... <div class="_a6-p">Content</div>
    
    let chatText = "";
    let messages = [];
    let names = new Set();
    
    // Split par le conteneur principal du message
    const blocks = htmlString.split('class="pam _3-95 _2ph- _a6-g"');
    blocks.shift(); // Remove content before first message

    blocks.forEach(block => {
        // Extract Author
        let author = "Inconnu";
        let authorMatch = block.match(/<h2[^>]*>(.*?)<\/h2>/);
        if(!authorMatch) {
             authorMatch = block.match(/<div class="_3-94 _2lem"[^>]*>(.*?)<\/div>/);
        }
        if (authorMatch) {
            author = stripHtml(authorMatch[1]).trim();
        }

        // Extract Content container
        let contentMatch = block.match(/class="_a6-p"[^>]*>([\s\S]*?)<\/div><\/div>/);
        if (contentMatch && author !== "Inconnu") {
            let rawContent = contentMatch[1];
            
            // Extract Reactions (ul._a6-q)
            let reactionsText = "";
            const rxReactions = /<ul class="_a6-q"[^>]*>([\s\S]*?)<\/ul>/g;
            let rxMatch;
            while ((rxMatch = rxReactions.exec(rawContent)) !== null) {
                // Remove ul from rawContent to not duplicate text
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
                chatText += `${author}: ${finalContent}\n`;
                messages.push({ author: author, text: finalContent });
                names.add(author);
            }
        }
    });

    return { text: chatText, names: names, messages: messages };
}

function extractWhatsAppTXT(txtString) {
    let chatText = "";
    let messages = [];
    let names = new Set();

    // Lignes WhatsApp: [28/03/2026 14:30:00] Nom: Message
    // Ou: 28/03/2026 14:30 - Nom: Message
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
            
            // Ignorer les messages systèmes
            if (currentMessage.includes("image omise") || currentMessage.includes("Omitted") || currentMessage.includes("Messages et appels chiffrés de bout en bout")) {
                currentMessage = "[Média ou système]";
            }
        } else {
            // Continuation du message précédent sur une nouvelle ligne
            if (currentAuthor) {
                currentMessage += " " + line.trim();
            }
        }
    });
    saveMessage(); // Last one

    return { text: chatText, names: names, messages: messages };
}

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
}
