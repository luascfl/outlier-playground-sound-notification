// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Toca um som quando a geração de resposta termina (o botão 'Stop' é substituído pelo 'Send').
// @author       luascfl
// @match        https://app.outlier.ai/playground*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=outlier.ai
// @license      MIT
// @homepageURL  https://github.com/luascfl/outlier-playground-sound-notification
// @supportURL   https://github.com/luascfl/outlier-playground-sound-notification/issues
// @updateURL    https://raw.githubusercontent.com/luascfl/outlier-playground-sound-notification/main/outlier-playground-sound-notification.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/outlier-playground-sound-notification/main/outlier-playground-sound-notification.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // URL do som a ser tocado
    const SOUND_URL = "https://od.lk/s/MjJfMzM5NTM3ODNf/331673__nicola_ariutti__brass_bell_01_take10.wav";

    // --- LÓGICA DO SCRIPT ---

    const audio = new Audio(SOUND_URL);

    function playSound() {
        audio.play().catch(e => console.log("Não foi possível tocar o som:", e));
    }

    /**
     * Verifica se um nó é o botão "Stop".
     * @param {Node} node - O elemento a ser verificado.
     * @returns {boolean}
     */
    function isStopButton(node) {
        return node.nodeType === 1 && node.querySelector('svg[data-icon="stop"]') !== null;
    }

    /**
     * Verifica se um nó é o botão "Send" (avião de papel).
     * @param {Node} node - O elemento a ser verificado.
     * @returns {boolean}
     */
    function isSendButton(node) {
        return node.nodeType === 1 && node.querySelector('svg[data-icon="paper-plane-top"]') !== null;
    }

    /**
     * A função principal do observador.
     * Ele é acionado sempre que um elemento é adicionado ou removido do contêiner do botão.
     */
    const observerCallback = (mutationsList, observer) => {
        for (const mutation of mutationsList) {
            let stopButtonRemoved = false;
            let sendButtonAdded = false;

            // Verifica se o botão "Stop" foi removido
            mutation.removedNodes.forEach(node => {
                if (isStopButton(node)) {
                    stopButtonRemoved = true;
                }
            });

            // Verifica se o botão "Send" foi adicionado
            mutation.addedNodes.forEach(node => {
                if (isSendButton(node)) {
                    sendButtonAdded = true;
                }
            });

            // Se ambas as condições ocorrerem na mesma mutação, é a transição que queremos!
            if (stopButtonRemoved && sendButtonAdded) {
                console.log("Transição de 'Stop' para 'Send' detectada. Tocando som.");
                playSound();
                // Interrompe o loop, pois o evento já foi encontrado.
                return;
            }
        }
    };

    /**
     * Aguarda o contêiner do botão aparecer e, em seguida, o observa.
     */
    function waitAndObserve() {
        // Encontra qualquer um dos botões para localizar o contêiner pai
        const anyButton = document.querySelector('button svg[data-icon="stop"], button svg[data-icon="paper-plane-top"]');

        if (anyButton) {
            const buttonContainer = anyButton.closest('button').parentElement;
            if (buttonContainer) {
                console.log("Contêiner do botão encontrado. Iniciando observador de troca.");
                const observer = new MutationObserver(observerCallback);
                // Observa a adição e remoção de elementos filhos diretos
                observer.observe(buttonContainer, { childList: true });
            }
        } else {
            // Se ainda não encontrou, tenta novamente em breve
            setTimeout(waitAndObserve, 500);
        }
    }

    // Inicia o processo
    waitAndObserve();
})();
